"""Cooperative cancellation used by queued and running jobs."""

from threading import Event


class CancellationToken:
    def __init__(self) -> None:
        self._event = Event()

    def cancel(self) -> None:
        self._event.set()

    @property
    def cancelled(self) -> bool:
        return self._event.is_set()

    def raise_if_cancelled(self) -> None:
        if self.cancelled:
            raise JobCancelled("job was cancelled")


class JobCancelled(Exception):
    """Raised when a cooperative cancellation request is observed."""
