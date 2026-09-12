"""Bounded, resumable unattended job execution."""

import time
from concurrent.futures import ThreadPoolExecutor, TimeoutError
from typing import Any, Callable, Optional

from .cancellation import CancellationToken, JobCancelled
from .checkpoint import CheckpointStore
from .policy import Decision, OptionFourPolicy, PolicyContext
from .retry import run_with_retries
from .safety import SafetyGate
from .schemas import AuditEvent, Checkpoint, Heartbeat, JobResult, JobSpec, JobStatus, RetryPolicy
from .watchdog import HeartbeatMonitor


class AgentRunner:
    def __init__(self, checkpoints: CheckpointStore, reporter: Any,
                 heartbeat: HeartbeatMonitor, policy: Optional[OptionFourPolicy] = None,
                 safety: Optional[SafetyGate] = None) -> None:
        self.checkpoints = checkpoints
        self.reporter = reporter
        self.heartbeat = heartbeat
        self.policy = policy or OptionFourPolicy()
        self.safety = safety or SafetyGate()

    def run(self, job: JobSpec, operation: Callable[[JobSpec, Optional[Checkpoint]], Any],
            cancellation: Optional[CancellationToken] = None,
            cost_estimator: Optional[Callable[[Any], float]] = None) -> JobResult:
        risks = self.safety.risks(job)
        approved = self.safety.is_approved(job)
        decision = self.policy.decide(job, PolicyContext(
            approval_granted=approved))
        # Policy is advisory: safety gates are authoritative, including when
        # a custom policy or option-four selection says "execute".
        if self.safety.approval_required(job) and not approved:
            decision = Decision.ESCALATE
        self.reporter.record(AuditEvent(job.job_id, "decision",
                                        details={"decision": decision.value,
                                                 "risks": risks,
                                                 "dry_run": job.dry_run,
                                                 "approval_required": self.safety.approval_required(job),
                                                 "approval_granted": approved}))
        if decision in (Decision.ABORT, Decision.ESCALATE):
            event = "approval_paused" if decision == Decision.ESCALATE else "cancelled"
            self.reporter.record(AuditEvent(job.job_id, event,
                                            details={"decision": decision.value}))
            return JobResult(job.job_id, JobStatus.APPROVAL_PAUSED
                             if event == "approval_paused" else JobStatus.CANCELLED)
        if decision == Decision.CHECKPOINT:
            self.reporter.record(AuditEvent(job.job_id, "approval_paused",
                                            details={"decision": decision.value}))
            return JobResult(job.job_id, JobStatus.APPROVAL_PAUSED)
        try:
            self.safety.validate_timeout(job)
        except ValueError as error:
            self.reporter.record(AuditEvent(
                job.job_id, "approval_paused",
                details={"decision": Decision.ESCALATE.value, "risks": risks,
                         "error": str(error), "error_type": type(error).__name__}))
            return JobResult(job.job_id, JobStatus.APPROVAL_PAUSED, error=error)
        if job.max_attempts > self.safety.maximum_attempts:
            error = ValueError("job attempts exceed safety limit")
            self.reporter.record(AuditEvent(
                job.job_id, "approval_paused",
                details={"decision": Decision.ESCALATE.value, "risks": risks,
                         "error": str(error), "error_type": type(error).__name__}))
            return JobResult(job.job_id, JobStatus.APPROVAL_PAUSED, error=error)
        if job.dry_run:
            preview = {"job_id": job.job_id, "name": job.name,
                       "risks": risks, "approval_required": self.safety.approval_required(job)}
            self.reporter.record(AuditEvent(job.job_id, "preview",
                                            details={"decision": "preview",
                                                     "risks": risks, "preview": preview}))
            return JobResult(job.job_id, JobStatus.SUCCEEDED, value=preview)
        checkpoint = self.checkpoints.load(job.job_id)
        if checkpoint and checkpoint.step == "completed":
            return JobResult(job.job_id, JobStatus.SUCCEEDED,
                             value=checkpoint.state.get("result"))
        self.heartbeat.mark(job.job_id, JobStatus.RUNNING)
        self.reporter.record(AuditEvent(job.job_id, "started"))
        self.reporter.progress(Heartbeat(job.job_id, JobStatus.RUNNING, step="execute",
                                         stage="execute"))
        started = time.monotonic()
        token = cancellation or CancellationToken()

        def execute(_attempt: int) -> Any:
            token.raise_if_cancelled()
            remaining = job.timeout_seconds - (time.monotonic() - started)
            if remaining <= 0:
                raise TimeoutError("job timed out")
            executor = ThreadPoolExecutor(max_workers=1)
            future = executor.submit(operation, job, checkpoint)
            try:
                value = future.result(timeout=remaining)
            finally:
                # A Python thread cannot be force-killed; do not let a timed-out
                # worker block the bounded runner from returning.
                future.cancel()
                executor.shutdown(wait=False)
            if cost_estimator is not None and job.max_cost is not None:
                cost = cost_estimator(value)
                if cost < 0 or cost > job.max_cost:
                    raise RuntimeError("job cost limit exceeded")
            if isinstance(value, Checkpoint):
                self.checkpoints.save(value)
                return value.state.get("result")
            return value

        try:
            value = run_with_retries(
                execute, RetryPolicy(max_attempts=job.max_attempts),
                on_error=lambda attempt, error: self.reporter.record(
                    AuditEvent(job.job_id, "retry",
                               details={"attempt": attempt, "error": str(error)})),
                should_retry=lambda error: not isinstance(error, TimeoutError)
                and not isinstance(error, JobCancelled)
                and str(error) != "job was cancelled",
                cancelled=lambda: token.cancelled)
        except JobCancelled as error:
            self.reporter.record(AuditEvent(job.job_id, "cancelled",
                                            details={"error": str(error), "error_type": type(error).__name__}))
            self.heartbeat.mark(job.job_id, JobStatus.CANCELLED, message=str(error))
            return JobResult(job.job_id, JobStatus.CANCELLED, error=error)
        except RuntimeError as error:
            if str(error) == "job was cancelled":
                self.reporter.record(AuditEvent(job.job_id, "cancelled",
                                                details={"error": str(error), "error_type": type(error).__name__}))
                self.heartbeat.mark(job.job_id, JobStatus.CANCELLED, message=str(error))
                return JobResult(job.job_id, JobStatus.CANCELLED, error=error)
            if str(error) == "job cost limit exceeded":
                self.reporter.record(AuditEvent(
                    job.job_id, "approval_paused",
                    details={"decision": Decision.ESCALATE.value,
                             "risks": {**risks, "over_limit": True},
                             "error": str(error), "error_type": type(error).__name__}))
                return JobResult(job.job_id, JobStatus.APPROVAL_PAUSED, error=error)
            self.reporter.record(AuditEvent(job.job_id, "failed",
                                            details=self._failure_details(error)))
            self.heartbeat.mark(job.job_id, JobStatus.FAILED, message=str(error))
            return JobResult(job.job_id, JobStatus.FAILED, error=error)
        except TimeoutError as error:
            self.reporter.record(AuditEvent(job.job_id, "timed_out",
                                            details={"error": str(error), "error_type": type(error).__name__}))
            self.heartbeat.mark(job.job_id, JobStatus.TIMED_OUT, message=str(error))
            return JobResult(job.job_id, JobStatus.TIMED_OUT, error=error)
        except Exception as error:
            self.reporter.record(AuditEvent(job.job_id, "failed",
                                            details=self._failure_details(error)))
            self.heartbeat.mark(job.job_id, JobStatus.FAILED, message=str(error))
            return JobResult(job.job_id, JobStatus.FAILED, error=error)
        except BaseException as error:
            # SystemExit/KeyboardInterrupt from an engine must not discard the
            # durable report or the last checkpoint.
            self.reporter.record(AuditEvent(
                job.job_id, "failed",
                details={"error": str(error) or type(error).__name__,
                         "error_type": type(error).__name__,
                         "unexpected_termination": True}))
            self.heartbeat.mark(job.job_id, JobStatus.FAILED,
                                message=str(error) or type(error).__name__)
            return JobResult(job.job_id, JobStatus.FAILED, error=error)
        self.checkpoints.save(Checkpoint(job.job_id, "completed", {"result": value}, 1))
        self.reporter.progress(Heartbeat(job.job_id, JobStatus.SUCCEEDED, progress=100,
                                         stage="complete", completed_step="execute"))
        self.reporter.record(AuditEvent(job.job_id, "completed"))
        self.heartbeat.mark(job.job_id, JobStatus.SUCCEEDED)
        return JobResult(job.job_id, JobStatus.SUCCEEDED, value=value)

    @staticmethod
    def _failure_details(error: Exception) -> dict:
        if isinstance(error, (ImportError, ModuleNotFoundError)):
            kind = "dependency_failure"
        elif isinstance(error, (FileNotFoundError, ConnectionError, OSError)):
            kind = "runner_unavailable"
        else:
            kind = "job_failure"
        return {"error": str(error), "error_type": type(error).__name__,
                "failure_kind": kind}
