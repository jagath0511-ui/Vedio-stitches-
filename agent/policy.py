"""Option-four unattended decision policy.

Option four means continue autonomously when safe, checkpoint before uncertainty,
escalate when approval is required, and never silently perform destructive work.
"""

from dataclasses import dataclass
from enum import Enum
from typing import Any, Iterable, Optional

from .schemas import JobSpec


class Decision(str, Enum):
    EXECUTE = "execute"
    CHECKPOINT = "checkpoint"
    ESCALATE = "escalate"
    ABORT = "abort"


@dataclass(frozen=True)
class PolicyContext:
    approval_granted: bool = False
    uncertainty: bool = False
    emergency_stop: bool = False
    retryable_failure: bool = False
    approval_choice: Optional[Any] = None
    available_choices: tuple[Any, ...] = ()


def select_approval_choice(options: Iterable[Any]) -> Optional[Any]:
    """Select the safest unattended affirmative response.

    Providers expose the same confirmation using different labels.  Option
    four is preferred when present; otherwise use an explicit affirmative
    label and never guess from an arbitrary option.
    """
    choices = list(options)
    normalized = {str(choice).strip().casefold(): choice for choice in choices}
    for candidate in ("4", "yes", "allow", "approve"):
        if candidate in normalized:
            return normalized[candidate]
    return None


class OptionFourPolicy:
    """Conservative policy suitable for unattended runners."""

    @staticmethod
    def select_approval_choice(options: Iterable[Any]) -> Optional[Any]:
        return select_approval_choice(options)

    def decide(self, job: JobSpec, context: Optional[PolicyContext] = None) -> Decision:
        context = context or PolicyContext()
        if context.emergency_stop:
            return Decision.ABORT
        # A menu choice is only a requested choice.  It is not an approval
        # credential and must never bypass the independent safety gate.
        approved = context.approval_granted or (
            context.approval_choice is not None
            and str(context.approval_choice).strip().casefold()
            in {"4", "yes", "allow", "approve"}
        )
        if (job.destructive or job.high_risk or job.history_changing
                or job.secret_changing) and not context.approval_granted:
            return Decision.ESCALATE
        if context.uncertainty:
            return Decision.CHECKPOINT
        if context.retryable_failure:
            return Decision.EXECUTE
        return Decision.EXECUTE


OptionFourDecisionPolicy = OptionFourPolicy
