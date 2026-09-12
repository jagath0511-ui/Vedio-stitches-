"""Heartbeat emission and stale-job detection."""

from datetime import datetime, timedelta, timezone
from typing import Callable, Optional
from threading import Lock

from .schemas import Heartbeat, JobStatus


class HeartbeatMonitor:
    def __init__(self, emit: Callable[[Heartbeat], None], stale_after_seconds: float = 300.0) -> None:
        if stale_after_seconds <= 0:
            raise ValueError("stale_after_seconds must be positive")
        self.emit = emit
        self.stale_after = timedelta(seconds=stale_after_seconds)
        self.last: Optional[Heartbeat] = None
        self._lock = Lock()

    def beat(self, heartbeat: Heartbeat) -> None:
        with self._lock:
            self.last = heartbeat
        self.emit(heartbeat)

    def is_stale(self, now: Optional[datetime] = None) -> bool:
        with self._lock:
            last = self.last
        if last is None:
            return True
        now = now or datetime.now(timezone.utc)
        return now - last.timestamp > self.stale_after

    def check(self, now: Optional[datetime] = None) -> bool:
        """Report a stalled running job once it stops sending heartbeats.

        The caller (normally a scheduler) can invoke this periodically.  A
        terminal heartbeat is never rewritten as stalled.
        """
        with self._lock:
            heartbeat = self.last
        if heartbeat is None or heartbeat.status != JobStatus.RUNNING:
            return False
        if not self.is_stale(now):
            return False
        self.mark(heartbeat.job_id, JobStatus.STALLED,
                  step=heartbeat.step, message="heartbeat is stale")
        return True

    def mark(self, job_id: str, status: JobStatus, step: Optional[str] = None, message: Optional[str] = None) -> None:
        self.beat(Heartbeat(job_id=job_id, status=status, step=step, message=message))
