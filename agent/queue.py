"""Small in-process priority queue with idempotent job admission."""

import heapq
from itertools import count
from threading import Lock
from typing import Dict, Optional

from .schemas import JobSpec


class JobQueue:
    def __init__(self) -> None:
        self._items = []
        self._known: Dict[str, JobSpec] = {}
        self._sequence = count()
        self._lock = Lock()

    def enqueue(self, job: JobSpec) -> bool:
        with self._lock:
            if job.job_id in self._known:
                return False
            self._known[job.job_id] = job
            heapq.heappush(self._items, (-job.priority, next(self._sequence), job.job_id))
            return True

    def dequeue(self) -> Optional[JobSpec]:
        with self._lock:
            if not self._items:
                return None
            _, _, job_id = heapq.heappop(self._items)
            return self._known.pop(job_id)

    def cancel(self, job_id: str) -> bool:
        """Remove a queued job; running jobs are cancelled by their token."""
        with self._lock:
            if job_id not in self._known:
                return False
            del self._known[job_id]
            self._items = [item for item in self._items if item[2] != job_id]
            heapq.heapify(self._items)
            return True

    def __len__(self) -> int:
        return len(self._items)
