"""Notification payload construction and webhook delivery."""

import json
import os
import re
import smtplib
import time
from email.message import EmailMessage
from pathlib import Path
from typing import Any, Callable, Dict, Optional, Tuple
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from .schemas import JobStatus, NotificationPayload


_SECRET_NAME = re.compile(r"(?i)(authorization|password|token|api[_-]?key|account[_-]?sid)\s*[:=]\s*[^\s,;]+")
# Require an international prefix so numeric workflow/run IDs in report URLs
# are not accidentally rewritten.
_PHONE = re.compile(r"(?<!\w)\+\d[\d ()-]{7,}\d(?!\w)")
DEFAULT_GMAIL_RECIPIENT = "jagath1105@gmail.com"
DEFAULT_SMS_RECIPIENT = "+91 7671031414"
_EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
_E164 = re.compile(r"^\+\d{7,15}$")


def validate_destinations(email: str, phone: str) -> Tuple[str, str]:
    """Validate and normalize the destinations accepted by the control panel."""
    email = email.strip()
    phone = re.sub(r"[ ()-]", "", phone.strip())
    if len(email) > 254 or not _EMAIL.fullmatch(email):
        raise ValueError("A valid email recipient is required")
    if not _E164.fullmatch(phone):
        raise ValueError("A valid SMS recipient is required in international format")
    return email, phone


def redact(value: Any) -> Any:
    """Remove credentials and full phone numbers from persisted/logged content."""
    if isinstance(value, dict):
        result = {}
        for key, item in value.items():
            name = str(key)
            result[name] = "<redacted>" if re.search(
                r"(?i)(password|token|secret|api[_-]?key|auth)", name
            ) else redact(item)
        return result
    if isinstance(value, list):
        return [redact(item) for item in value]
    if not isinstance(value, str):
        return value
    value = _SECRET_NAME.sub(lambda match: match.group(1) + "=<redacted>", value)
    return _PHONE.sub("<redacted-phone>", value)


def build_payload(job_id: str, status: JobStatus, message: str, **details: Any) -> NotificationPayload:
    return NotificationPayload(
        job_id=job_id,
        status=status,
        subject="Agent job {}".format(status.value),
        message=message,
        details=details,
    )


class NotificationOutbox:
    """Small durable outbox. Secrets are never written; only delivery metadata is."""

    def __init__(self, path: Path) -> None:
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def _read(self) -> Dict[str, Any]:
        if not self.path.exists():
            return {}
        try:
            return json.loads(self.path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return {}

    def _write(self, state: Dict[str, Any]) -> None:
        """Persist the outbox atomically so a runner interruption cannot lose it."""
        temporary = self.path.with_name(self.path.name + ".tmp")
        temporary.write_text(json.dumps(state, sort_keys=True, indent=2), encoding="utf-8")
        os.replace(str(temporary), str(self.path))

    def deliver(self, payload: NotificationPayload, sender: Callable[[NotificationPayload], None],
                attempts: int = 3, sleep: Callable[[float], None] = time.sleep,
                channel: str = "default") -> Dict[str, Any]:
        key = "{}:{}:{}".format(payload.job_id, payload.status.value, channel)
        state = self._read()
        entry = state.setdefault(key, {"status": "pending", "attempts": 0,
                                       "channel": channel,
                                       "payload": {"job_id": payload.job_id,
                                                   "status": payload.status.value,
                                                   "subject": payload.subject,
                                                   "message": redact(payload.message),
                                                   "details": redact(payload.details)}})
        if entry.get("status") == "sent":
            return entry
        for _ in range(max(1, attempts)):
            entry["attempts"] = int(entry.get("attempts", 0)) + 1
            try:
                sender(payload)
                entry.update(status="sent", error=None)
                self._write(state)
                return entry
            except Exception as error:
                entry.update(status="pending", error=redact(str(error)))
                self._write(state)
                if sleep and entry["attempts"] < attempts:
                    sleep(min(2 ** (entry["attempts"] - 1), 30))
        return entry

    def pending(self) -> Dict[str, Dict[str, Any]]:
        """Return undelivered entries for recovery reporting."""
        return {
            key: entry for key, entry in self._read().items()
            if entry.get("status") == "pending"
        }

    def retry_pending(self, sender: Callable[[NotificationPayload], None],
                      attempts: int = 3, senders: Optional[Dict[str, Callable]] = None) -> int:
        delivered = 0
        for entry in list(self._read().values()):
            if entry.get("status") != "pending" or not entry.get("payload"):
                continue
            data = entry["payload"]
            channel = entry.get("channel", "default")
            callback = (senders or {}).get(channel, sender)
            result = self.deliver(NotificationPayload(
                data["job_id"], JobStatus(data["status"]), data["subject"],
                data["message"], details=data.get("details", {})), callback, attempts,
                sleep=lambda _: None, channel=channel)
            delivered += result.get("status") == "sent"
        return delivered


def send_webhook(payload: NotificationPayload, url: str, opener: Callable[..., Any] = urlopen) -> None:
    body = json.dumps({
        "job_id": payload.job_id,
        "status": payload.status.value,
        "subject": payload.subject,
        "message": payload.message,
        "attempt": payload.attempt,
        "details": payload.details,
    }).encode("utf-8")
    request = Request(url, data=body, headers={"Content-Type": "application/json"}, method="POST")
    with opener(request, timeout=10) as response:
        if getattr(response, "status", 200) >= 400:
            raise RuntimeError("notification webhook returned an error")


def send_gmail(payload: NotificationPayload) -> None:
    """Send a report through the configured SMTP relay without exposing secrets."""
    sender = os.environ["GMAIL_USER"]
    password = os.environ["GMAIL_APP_PASSWORD"]
    recipient = os.getenv("GMAIL_RECIPIENT", DEFAULT_GMAIL_RECIPIENT)
    sender, recipient = validate_destinations(sender, recipient)
    message = EmailMessage()
    message["From"] = sender
    message["To"] = recipient
    message["Subject"] = payload.subject
    message.set_content(redact(payload.message) + "\n\n" +
                        json.dumps(redact(payload.details), indent=2, default=str))
    with smtplib.SMTP_SSL(os.getenv("GMAIL_SMTP_HOST", "smtp.gmail.com"),
                          int(os.getenv("GMAIL_SMTP_PORT", "465"))) as server:
        server.login(sender, password)
        server.send_message(message)


def send_sms(payload: NotificationPayload, opener: Callable[..., Any] = urlopen) -> None:
    """Send a redacted, short alert through the Twilio-compatible API."""
    account_sid = os.environ["SMS_ACCOUNT_SID"]
    auth_token = os.environ["SMS_AUTH_TOKEN"]
    from_number = os.environ["SMS_FROM"]
    to_number = os.getenv("SMS_RECIPIENT", DEFAULT_SMS_RECIPIENT)
    _, to_number = validate_destinations("alerts@example.com", to_number)
    report_url = redact(payload.details.get("report_url") or payload.details.get("run_url", ""))
    suffix = f" Report: {report_url}" if report_url else ""
    body = f"{payload.subject}: {redact(payload.message)[:180]} Job {payload.job_id}{suffix}"[:640]
    provider_url = os.getenv(
        "SMS_PROVIDER_URL",
        f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json",
    )
    request = Request(
        provider_url,
        data=urlencode({"From": from_number, "To": to_number, "Body": body}).encode(),
        headers={"Authorization": "Basic " + __import__("base64").b64encode(
            f"{account_sid}:{auth_token}".encode()).decode()},
        method="POST",
    )
    with opener(request, timeout=10) as response:
        if getattr(response, "status", 200) >= 400:
            raise RuntimeError("SMS provider returned an error")
