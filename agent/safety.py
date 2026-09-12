"""Safety gates for unattended execution."""

import os
from dataclasses import dataclass
from typing import Dict, Optional

from .schemas import JobSpec


@dataclass(frozen=True)
class SafetyGate:
    require_approval_for_destructive: bool = True
    approval_token: Optional[str] = None
    environment_variable: str = "AGENT_APPROVAL_TOKEN"
    maximum_timeout_seconds: float = 86400.0
    maximum_attempts: int = 10

    def risks(self, job: JobSpec) -> Dict[str, bool]:
        metadata_limit = str(job.metadata.get("over_limit", "")).casefold() in {
            "1", "true", "yes", "on"
        }
        try:
            estimated_cost = float(job.metadata.get("estimated_cost", "nan"))
        except (TypeError, ValueError):
            estimated_cost = float("nan")
        estimated_over = job.max_cost is not None and estimated_cost > job.max_cost
        return {
            "destructive": job.destructive,
            "high_risk": job.high_risk,
            "history_changing": job.history_changing,
            "secret_changing": job.secret_changing,
            "over_limit": metadata_limit or estimated_over
            or job.timeout_seconds > self.maximum_timeout_seconds
            or job.max_attempts > self.maximum_attempts,
        }

    def approval_required(self, job: JobSpec) -> bool:
        return any(self.risks(job).values()) and self.require_approval_for_destructive

    def is_approved(self, job: JobSpec) -> bool:
        if not self.approval_required(job):
            return True
        return bool(self.approval_token or os.getenv(self.environment_variable))

    def check(self, job: JobSpec) -> None:
        if not self.is_approved(job):
            raise PermissionError("destructive job requires an approval token")

    def validate_timeout(self, job: JobSpec, maximum_seconds: float = 86400.0) -> None:
        if job.timeout_seconds > min(maximum_seconds, self.maximum_timeout_seconds):
            raise ValueError("job timeout exceeds safety limit")
