from datetime import datetime, timedelta, timezone

import pytest

from agent.checkpoint import CheckpointStore
from agent.core import AgentRunner
from agent.policy import Decision, OptionFourPolicy, PolicyContext, select_approval_choice
from agent.reporting import AuditReporter
from agent.safety import SafetyGate
from agent.schemas import Checkpoint, Heartbeat, JobSpec, JobStatus, PromptSpec
from agent.watchdog import HeartbeatMonitor
from agent.notifications import (NotificationOutbox, build_payload, redact,
                                 validate_destinations)
from agent import notify_cli


def test_checkpoint_round_trip(tmp_path):
    store = CheckpointStore(tmp_path)
    checkpoint = Checkpoint("job-1", "download", {"offset": 4})
    store.save(checkpoint)
    loaded = store.load("job-1")
    assert loaded is not None
    assert loaded.state == {"offset": 4}
    assert loaded.step == "download"


def test_option_four_stops_unapproved_destructive_work():
    job = JobSpec(PromptSpec("delete old files"), destructive=True)
    assert OptionFourPolicy().decide(job) == Decision.ESCALATE
    assert OptionFourPolicy().decide(
        job, PolicyContext(approval_granted=True)
    ) == Decision.EXECUTE


@pytest.mark.parametrize(
    ("options", "expected"),
    [(["No", "4", "Yes"], "4"), (["No", "Allow"], "Allow"),
     (["No", "Approve"], "Approve"), (["No", "Cancel"], None)],
)
def test_option_four_preferred_with_affirmative_fallbacks(options, expected):
    assert select_approval_choice(options) == expected


def test_approval_choice_is_recorded_as_an_affirmative_decision():
    job = JobSpec(PromptSpec("publish"))
    assert OptionFourPolicy().decide(
        job, PolicyContext(approval_choice="Allow")
    ) == Decision.EXECUTE


def test_high_risk_job_pauses_and_records_decision(tmp_path):
    reporter = AuditReporter(tmp_path / "audit.jsonl")
    runner = AgentRunner(CheckpointStore(tmp_path / "checkpoints"), reporter,
                         HeartbeatMonitor(reporter.progress))
    job = JobSpec(PromptSpec("rotate production credentials"), high_risk=True)

    result = runner.run(job, lambda *_: pytest.fail("paused jobs must not execute"))

    assert result.status == JobStatus.APPROVAL_PAUSED
    report = reporter.report(job.job_id)
    assert report["decisions"][0]["decision"] == "escalate"
    assert report["status"] == "approval_paused"
    assert report["decisions"][0]["risks"]["high_risk"] is True


@pytest.mark.parametrize("flag", ["history_changing", "secret_changing"])
def test_sensitive_change_pauses_even_with_option_four(tmp_path, flag):
    reporter = AuditReporter(tmp_path / "audit.jsonl")
    runner = AgentRunner(CheckpointStore(tmp_path / "checkpoints"), reporter,
                         HeartbeatMonitor(reporter.progress))
    job = JobSpec(PromptSpec("change"), **{flag: True})

    result = runner.run(job, lambda *_: pytest.fail("gate must pause"))

    assert result.status == JobStatus.APPROVAL_PAUSED
    assert reporter.report(job.job_id)["decisions"][0]["approval_required"] is True


def test_dry_run_previews_without_executing(tmp_path):
    reporter = AuditReporter(tmp_path / "audit.jsonl")
    runner = AgentRunner(CheckpointStore(tmp_path / "checkpoints"), reporter,
                         HeartbeatMonitor(reporter.progress))
    called = []
    job = JobSpec(PromptSpec("publish"), dry_run=True)

    result = runner.run(job, lambda *_: called.append(True))

    assert result.status == JobStatus.SUCCEEDED
    assert result.value["risks"] == {
        "destructive": False, "high_risk": False, "history_changing": False,
        "secret_changing": False, "over_limit": False,
    }
    assert called == []
    assert reporter.report(job.job_id)["decisions"][0]["decision"] == "execute"


def test_over_limit_pauses_before_operation(tmp_path):
    reporter = AuditReporter(tmp_path / "audit.jsonl")
    runner = AgentRunner(CheckpointStore(tmp_path / "checkpoints"), reporter,
                         HeartbeatMonitor(reporter.progress))
    job = JobSpec(PromptSpec("large"), max_attempts=11)

    result = runner.run(job, lambda *_: pytest.fail("gate must pause"))

    assert result.status == JobStatus.APPROVAL_PAUSED
    assert reporter.report(job.job_id)["decisions"][0]["risks"]["over_limit"] is True


def test_runner_records_success_and_resumes(tmp_path):
    reporter = AuditReporter(tmp_path / "audit.jsonl")
    heartbeats = []
    monitor = HeartbeatMonitor(heartbeats.append)
    runner = AgentRunner(CheckpointStore(tmp_path / "checkpoints"), reporter, monitor)
    job = JobSpec(PromptSpec("compute"))
    result = runner.run(job, lambda current, checkpoint: "done")
    assert result.status == JobStatus.SUCCEEDED
    assert result.value == "done"
    assert runner.checkpoints.load(job.job_id).step == "completed"
    assert len(heartbeats) == 2
    report = reporter.report(job.job_id)
    assert report["status"] == "succeeded"
    assert report["progress"] == 100
    assert report["stage"] == "complete"
    assert report["started_at"] and report["completed_at"]
    assert (tmp_path / "report.json").exists()


def test_report_persists_retries_and_decisions(tmp_path):
    reporter = AuditReporter(tmp_path / "audit.jsonl")
    monitor = HeartbeatMonitor(reporter.progress)
    runner = AgentRunner(CheckpointStore(tmp_path / "checkpoints"), reporter, monitor)
    attempts = []

    def operation(job, checkpoint):
        attempts.append(1)
        if len(attempts) < 2:
            raise RuntimeError("transient")
        return "ok"

    job = JobSpec(PromptSpec("retry"))
    assert runner.run(job, operation).status == JobStatus.SUCCEEDED
    report = AuditReporter(tmp_path / "audit.jsonl").report(job.job_id)
    assert report["retries"] == 1
    assert report["decisions"][0]["decision"] == "execute"


def test_watchdog_detects_stale_heartbeat():
    values = []
    monitor = HeartbeatMonitor(values.append, stale_after_seconds=5)
    old = Heartbeat("job", JobStatus.RUNNING, datetime.now(timezone.utc) - timedelta(seconds=10))
    monitor.beat(old)
    assert monitor.is_stale()


def test_watchdog_marks_running_job_stalled_and_report_is_terminal(tmp_path):
    reporter = AuditReporter(tmp_path / "audit.jsonl")
    monitor = HeartbeatMonitor(reporter.progress, stale_after_seconds=5)
    old = Heartbeat("job", JobStatus.RUNNING,
                    datetime.now(timezone.utc) - timedelta(seconds=10),
                    step="download")
    monitor.beat(old)
    assert monitor.check() is True
    report = reporter.report("job")
    assert report["status"] == "stalled"
    assert report["error_type"] == "StalledJob"


def test_unexpected_termination_is_reported_and_checkpoint_is_preserved(tmp_path):
    reporter = AuditReporter(tmp_path / "audit.jsonl")
    runner = AgentRunner(CheckpointStore(tmp_path / "checkpoints"), reporter,
                         HeartbeatMonitor(reporter.progress))
    job = JobSpec(PromptSpec("crash"))
    runner.checkpoints.save(Checkpoint(job.job_id, "download", {"offset": 4}))

    def operation(*_):
        raise SystemExit("engine exited")

    result = runner.run(job, operation)
    assert result.status == JobStatus.FAILED
    assert runner.checkpoints.load(job.job_id).state == {"offset": 4}
    report = reporter.report(job.job_id)
    assert report["status"] == "failed"
    assert report["error_type"] == "SystemExit"


def test_destructive_gate_requires_approval():
    job = JobSpec(PromptSpec("remove"), destructive=True)
    with pytest.raises(PermissionError):
        SafetyGate().check(job)


def test_terminal_notification_outbox_retries_and_deduplicates(tmp_path):
    attempts = []
    payload = build_payload("job-mail", JobStatus.FAILED, "failed", report_url="https://actions.example/run")

    def sender(_payload):
        attempts.append(1)
        if len(attempts) == 1:
            raise RuntimeError("temporary")

    outbox = NotificationOutbox(tmp_path / "outbox.json")
    state = outbox.deliver(payload, sender, attempts=2, sleep=lambda _: None)
    assert state["status"] == "sent"
    assert state["attempts"] == 2
    assert outbox.deliver(payload, sender, attempts=2)["status"] == "sent"
    assert len(attempts) == 2


def test_notification_channels_are_deduplicated_and_pending_entries_survive(tmp_path):
    payload = build_payload("job-alert", JobStatus.FAILED, "failed")
    outbox = NotificationOutbox(tmp_path / "outbox.json")

    def unavailable(_payload):
        raise RuntimeError("provider unavailable")

    email = outbox.deliver(payload, unavailable, attempts=1, sleep=None, channel="gmail")
    sms = outbox.deliver(payload, unavailable, attempts=1, sleep=None, channel="sms")

    assert email["status"] == "pending"
    assert sms["status"] == "pending"
    assert set(outbox.pending()) == {"job-alert:failed:gmail", "job-alert:failed:sms"}
    assert outbox.deliver(payload, unavailable, attempts=1, sleep=None, channel="gmail")["attempts"] == 2


def test_cli_persists_undelivered_gmail_and_sms(tmp_path, monkeypatch):
    def unavailable(_payload):
        raise RuntimeError("provider unavailable")

    monkeypatch.setattr(notify_cli, "send_gmail", unavailable)
    monkeypatch.setattr(notify_cli, "send_sms", unavailable)
    monkeypatch.setattr("sys.argv", [
        "notify_cli", "--job-id", "job-cli", "--status", "failed",
        "--message", "failed", "--outbox", str(tmp_path / "outbox.json"),
    ])

    assert notify_cli.main() == 1
    pending = NotificationOutbox(tmp_path / "outbox.json").pending()
    assert set(pending) == {"job-cli:failed:gmail", "job-cli:failed:sms"}


def test_notification_destinations_are_normalized_and_validated():
    assert validate_destinations(
        " jagath1105@gmail.com ", "+91 7671031414"
    ) == ("jagath1105@gmail.com", "+917671031414")
    with pytest.raises(ValueError):
        validate_destinations("not-an-email", "+917671031414")
    with pytest.raises(ValueError):
        validate_destinations("alerts@example.com", "7671031414")


def test_notification_redaction_covers_secrets_phone_and_delivery_errors():
    value = redact({
        "SMS_AUTH_TOKEN": "do-not-persist",
        "message": "SMS_AUTH_TOKEN=do-not-persist; call +91 7671031414",
    })
    assert value["SMS_AUTH_TOKEN"] == "<redacted>"
    assert "do-not-persist" not in value["message"]
    assert "+91 7671031414" not in value["message"]
    assert redact("provider error: auth_token=secret") == (
        "provider error: auth_token=<redacted>"
    )


@pytest.mark.parametrize("status", [
    JobStatus.SUCCEEDED, JobStatus.FAILED, JobStatus.BLOCKED,
    JobStatus.CANCELLED, JobStatus.STALLED, JobStatus.TIMED_OUT,
    JobStatus.APPROVAL_PAUSED,
])
def test_terminal_notification_statuses_are_serializable(status):
    assert build_payload("job", status, "message").status.value == status.value
