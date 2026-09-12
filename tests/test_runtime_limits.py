import time

from agent.cancellation import CancellationToken
from agent.checkpoint import CheckpointStore
from agent.core import AgentRunner
from agent.queue import JobQueue
from agent.reporting import AuditReporter
from agent.schemas import JobSpec, JobStatus, PromptSpec
from agent.watchdog import HeartbeatMonitor


def make_runner(tmp_path):
    return AgentRunner(CheckpointStore(tmp_path / "checkpoints"),
                       AuditReporter(tmp_path / "audit.jsonl"),
                       HeartbeatMonitor(lambda heartbeat: None))


def test_priority_queue_deduplicates_and_orders():
    queue = JobQueue()
    low = JobSpec(PromptSpec("low"), priority=1)
    high = JobSpec(PromptSpec("high"), priority=10)
    assert queue.enqueue(low)
    assert not queue.enqueue(low)
    assert queue.enqueue(high)
    assert queue.dequeue().job_id == high.job_id
    assert queue.dequeue().job_id == low.job_id


def test_runner_is_idempotent_after_completion(tmp_path):
    calls = []
    runner = make_runner(tmp_path)
    job = JobSpec(PromptSpec("once"))
    assert runner.run(job, lambda *_: calls.append(1) or "ok").status == JobStatus.SUCCEEDED
    assert runner.run(job, lambda *_: calls.append(1) or "again").value == "ok"
    assert len(calls) == 1


def test_runner_cancellation_and_timeout(tmp_path):
    token = CancellationToken()
    token.cancel()
    runner = make_runner(tmp_path)
    cancelled = runner.run(JobSpec(PromptSpec("cancel")), lambda *_: "never",
                           cancellation=token)
    assert cancelled.status == JobStatus.CANCELLED

    timed_out = runner.run(JobSpec(PromptSpec("slow"), timeout_seconds=0.01),
                           lambda *_: time.sleep(1))
    assert timed_out.status == JobStatus.TIMED_OUT
