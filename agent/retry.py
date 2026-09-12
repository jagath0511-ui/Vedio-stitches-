"""Bounded retry execution with exponential backoff."""

import time
from typing import Callable, Optional, TypeVar

from .schemas import RetryPolicy

T = TypeVar("T")


def run_with_retries(
    operation: Callable[[int], T],
    policy: RetryPolicy = RetryPolicy(),
    sleep: Callable[[float], None] = time.sleep,
    on_error: Optional[Callable[[int, Exception], None]] = None,
    should_retry: Optional[Callable[[Exception], bool]] = None,
    cancelled: Optional[Callable[[], bool]] = None,
) -> T:
    if policy.max_attempts < 1:
        raise ValueError("max_attempts must be positive")
    delay = policy.initial_delay_seconds
    last_error: Optional[Exception] = None
    for attempt in range(1, policy.max_attempts + 1):
        if cancelled and cancelled():
            raise RuntimeError("job was cancelled")
        try:
            return operation(attempt)
        except Exception as error:
            last_error = error
            if on_error:
                on_error(attempt, error)
            if should_retry is not None and not should_retry(error):
                raise
            if attempt == policy.max_attempts:
                break
            if delay > 0:
                sleep(min(delay, policy.max_delay_seconds))
            delay = min(delay * policy.multiplier, policy.max_delay_seconds)
    assert last_error is not None
    raise last_error
