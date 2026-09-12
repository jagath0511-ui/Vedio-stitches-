"""Typed data contracts used by the unattended agent."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import uuid4
import math
import re


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class JobStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    PAUSED = "paused"
    APPROVAL_PAUSED = "approval_paused"
    BLOCKED = "blocked"
    STALLED = "stalled"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELLED = "cancelled"
    TIMED_OUT = "timed_out"


@dataclass(frozen=True)
class PromptSpec:
    text: str
    system: Optional[str] = None
    variables: Dict[str, str] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not isinstance(self.text, str) or not self.text.strip():
            raise ValueError("prompt must not be empty")
        if len(self.text.strip()) > 4000:
            raise ValueError("prompt must be at most 4000 characters")
        if self.system is not None and not isinstance(self.system, str):
            raise TypeError("system prompt must be a string")

    def render(self) -> str:
        try:
            return self.text.format(**self.variables)
        except (KeyError, ValueError) as error:
            raise ValueError(f"invalid prompt template: {error}") from error


@dataclass(frozen=True)
class JobSpec:
    prompt: PromptSpec
    name: str = "unattended-job"
    job_id: str = field(default_factory=lambda: uuid4().hex)
    max_attempts: int = 3
    timeout_seconds: float = 1800.0
    destructive: bool = False
    high_risk: bool = False
    history_changing: bool = False
    secret_changing: bool = False
    dry_run: bool = False
    metadata: Dict[str, str] = field(default_factory=dict)
    priority: int = 0
    max_cost: Optional[float] = None

    def __post_init__(self) -> None:
        if not isinstance(self.prompt, PromptSpec):
            raise TypeError("prompt must be a PromptSpec")
        if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]{0,127}", self.job_id):
            raise ValueError("job_id must be 1-128 safe filename characters")
        if not self.name.strip():
            raise ValueError("name must not be empty")
        if isinstance(self.max_attempts, bool) or self.max_attempts < 1:
            raise ValueError("max_attempts must be positive")
        if not math.isfinite(self.timeout_seconds) or self.timeout_seconds <= 0:
            raise ValueError("timeout_seconds must be positive")
        if isinstance(self.priority, bool) or not isinstance(self.priority, int):
            raise TypeError("priority must be an integer")
        if self.max_cost is not None and (
            not math.isfinite(self.max_cost) or self.max_cost < 0
        ):
            raise ValueError("max_cost must be finite and non-negative")


@dataclass
class Checkpoint:
    job_id: str
    step: str
    state: Dict[str, Any] = field(default_factory=dict)
    sequence: int = 0
    created_at: datetime = field(default_factory=utc_now)


@dataclass(frozen=True)
class RetryPolicy:
    max_attempts: int = 3
    initial_delay_seconds: float = 1.0
    multiplier: float = 2.0
    max_delay_seconds: float = 60.0

    def __post_init__(self) -> None:
        if isinstance(self.max_attempts, bool) or self.max_attempts < 1:
            raise ValueError("max_attempts must be positive")
        if any(
            not math.isfinite(value) or value < 0
            for value in (self.initial_delay_seconds, self.max_delay_seconds)
        ):
            raise ValueError("retry delays must be finite and non-negative")
        if not math.isfinite(self.multiplier) or self.multiplier < 1:
            raise ValueError("retry multiplier must be at least 1")
        if self.max_delay_seconds < self.initial_delay_seconds:
            raise ValueError("max_delay_seconds must cover initial_delay_seconds")


@dataclass(frozen=True)
class Heartbeat:
    job_id: str
    status: JobStatus
    timestamp: datetime = field(default_factory=utc_now)
    step: Optional[str] = None
    message: Optional[str] = None
    progress: Optional[float] = None
    stage: Optional[str] = None
    completed_step: Optional[str] = None
    retry_count: int = 0


@dataclass(frozen=True)
class AuditEvent:
    job_id: str
    event: str
    timestamp: datetime = field(default_factory=utc_now)
    details: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class NotificationPayload:
    job_id: str
    status: JobStatus
    subject: str
    message: str
    attempt: Optional[int] = None
    details: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class JobResult:
    job_id: str
    status: JobStatus
    value: Any = None
    error: Optional[Exception] = None
