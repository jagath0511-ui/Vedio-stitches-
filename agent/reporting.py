"""Progress and audit reporting sinks."""

import json
import os
from datetime import datetime, timezone
from dataclasses import asdict
from pathlib import Path
from typing import Any, Dict, List, Optional

from .schemas import AuditEvent, Heartbeat


class AuditReporter:
    def __init__(self, path: Path) -> None:
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.events: List[AuditEvent] = []
        self.report_path = self.path.with_name("report.json")
        self._reports: Dict[str, Dict[str, Any]] = {}

    def record(self, event: AuditEvent) -> None:
        self.events.append(event)
        payload = asdict(event)
        payload["timestamp"] = event.timestamp.isoformat()
        with self.path.open("a", encoding="utf-8") as stream:
            stream.write(json.dumps(payload, sort_keys=True) + "\n")
        report = self._reports.setdefault(event.job_id, {
            "job_id": event.job_id, "status": "queued", "progress": None,
            "indeterminate": True, "stage": None, "last_completed_step": None,
            "started_at": None, "updated_at": None, "completed_at": None,
            "elapsed_seconds": 0, "retries": 0, "decisions": [], "logs": [],
            "artifacts": [], "error": None, "error_type": None,
            "failure_kind": None,
        })
        now = event.timestamp
        report["updated_at"] = now.isoformat()
        details = event.details or {}
        if event.event == "started":
            report["status"], report["started_at"] = "running", now.isoformat()
        elif event.event in {"completed", "failed", "cancelled", "blocked",
                             "approval_paused", "timed_out", "stalled"}:
            report["status"], report["completed_at"] = (
                {"completed": "succeeded", "timed_out": "timed_out"}.get(event.event, event.event),
                now.isoformat() if event.event not in {"blocked", "approval_paused"} else None)
            if details.get("error") is not None:
                report["error"] = details["error"]
                report["error_type"] = details.get("error_type")
                report["failure_kind"] = details.get("failure_kind")
        elif event.event == "heartbeat":
            report.update({key: details[key] for key in (
                "status", "progress", "indeterminate", "stage",
                "retry_count") if key in details})
            if "completed_step" in details:
                report["last_completed_step"] = details["completed_step"]
            if details.get("status") == "stalled":
                report["completed_at"] = now.isoformat()
                report["error"] = details.get("message") or "heartbeat is stale"
                report["error_type"] = "StalledJob"
        elif event.event == "decision":
            report["decisions"].append(details)
        elif event.event == "preview":
            report["status"] = "succeeded"
            report["completed_at"] = now.isoformat()
            report["preview"] = details.get("preview")
        elif event.event == "retry":
            report["retries"] = max(report["retries"], details.get("attempt", 0))
        if "log" in details:
            report["logs"].append(details["log"])
        if "artifact" in details and details["artifact"] not in report["artifacts"]:
            report["artifacts"].append(details["artifact"])
        if report["started_at"]:
            end = datetime.fromisoformat(report["completed_at"]) if report["completed_at"] else now
            report["elapsed_seconds"] = max(0, (end - datetime.fromisoformat(report["started_at"])).total_seconds())
        self._save_report()

    def progress(self, heartbeat: Heartbeat) -> None:
        details = asdict(heartbeat)
        details["timestamp"] = heartbeat.timestamp.isoformat()
        details["status"] = heartbeat.status.value
        details["indeterminate"] = heartbeat.progress is None
        self.record(AuditEvent(heartbeat.job_id, "heartbeat", details=details))

    def report(self, job_id: Optional[str] = None) -> Any:
        if not self._reports and self.report_path.exists():
            self._reports = json.loads(self.report_path.read_text(encoding="utf-8"))
        return self._reports.get(job_id) if job_id else self._reports

    def _save_report(self) -> None:
        temporary = self.report_path.with_suffix(".tmp")
        temporary.write_text(json.dumps(self._reports, sort_keys=True, indent=2), encoding="utf-8")
        os.replace(str(temporary), str(self.report_path))
