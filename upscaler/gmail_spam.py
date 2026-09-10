"""Review suspicious Gmail messages without deleting or moving mail."""

import argparse
import base64
import os
import re
from dataclasses import dataclass
from email.utils import parseaddr
from pathlib import Path
from typing import Any, Optional


DEFAULT_QUERY = "in:anywhere -label:spam -label:Spam-Review"
REVIEW_LABEL = "Spam Review"


@dataclass(frozen=True)
class SpamAssessment:
    score: int
    reasons: tuple[str, ...]

    @property
    def suspicious(self) -> bool:
        return self.score >= 5


def _header(message: dict[str, Any], name: str) -> str:
    for header in message.get("payload", {}).get("headers", []):
        if header.get("name", "").lower() == name.lower():
            return header.get("value", "")
    return ""


def _decode_body(data: str) -> str:
    if not data:
        return ""
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode((data + padding).encode()).decode(
        "utf-8", errors="replace"
    )


def message_text(message: dict[str, Any]) -> str:
    """Extract searchable text from a Gmail message resource."""
    parts: list[str] = []

    def visit(payload: dict[str, Any]) -> None:
        body = payload.get("body", {})
        if body.get("data"):
            parts.append(_decode_body(body["data"]))
        for part in payload.get("parts", []):
            visit(part)

    visit(message.get("payload", {}))
    return "\n".join(parts)


def assess_message(message: dict[str, Any]) -> SpamAssessment:
    """Score obvious spam signals; this intentionally favors review over action."""
    subject = _header(message, "Subject")
    sender = _header(message, "From")
    body = message_text(message)
    text = f"{subject}\n{sender}\n{body}".lower()
    score = 0
    reasons: list[str] = []

    weighted_signals = (
        (r"\b(win|winner|won)\b", 3, "prize language"),
        (r"\b(urgent|act now|immediately)\b", 2, "urgency language"),
        (r"\b(verify|suspend|confirm)\b.{0,40}\b(account|password|payment)\b", 3, "credential or payment request"),
        (r"\b(crypto|bitcoin|forex|investment opportunity)\b", 2, "high-risk financial offer"),
        (r"\b(click here|claim now|limited time)\b", 2, "pressure-to-click language"),
    )
    for pattern, points, reason in weighted_signals:
        if re.search(pattern, text, re.IGNORECASE | re.DOTALL):
            score += points
            reasons.append(reason)

    _, address = parseaddr(sender)
    if address and address.endswith((".ru", ".cn", ".top", ".click")):
        score += 2
        reasons.append("sender uses a frequently abused top-level domain")
    if text.count("http://") + text.count("https://") >= 5:
        score += 2
        reasons.append("message contains many links")

    return SpamAssessment(score=score, reasons=tuple(reasons))


def _gmail_service(credentials_path: Path, token_path: Path) -> Any:
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build

    scopes = ["https://www.googleapis.com/auth/gmail.modify"]
    credentials = None
    if token_path.exists():
        credentials = Credentials.from_authorized_user_file(str(token_path), scopes)
    if not credentials or not credentials.valid:
        if credentials and credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(str(credentials_path), scopes)
            credentials = flow.run_local_server(port=0)
        token_path.write_text(credentials.to_json(), encoding="utf-8")
    return build("gmail", "v1", credentials=credentials)


def review_mail(service: Any, query: str, threshold: int, apply: bool, limit: int) -> int:
    label_id: Optional[str] = None
    if apply:
        labels = service.users().labels().list(userId="me").execute().get("labels", [])
        label_id = next((item["id"] for item in labels if item["name"] == REVIEW_LABEL), None)
        if label_id is None:
            label_id = service.users().labels().create(
                userId="me", body={"name": REVIEW_LABEL, "labelListVisibility": "labelShow"}
            ).execute()["id"]

    response = service.users().messages().list(userId="me", q=query, maxResults=limit).execute()
    suspicious = 0
    for item in response.get("messages", []):
        message = service.users().messages().get(userId="me", id=item["id"], format="full").execute()
        assessment = assess_message(message)
        if assessment.score < threshold:
            continue
        suspicious += 1
        subject = _header(message, "Subject") or "(no subject)"
        print(f"{item['id']} score={assessment.score}: {subject} [{'; '.join(assessment.reasons)}]")
        if apply and label_id:
            service.users().messages().modify(
                userId="me", id=item["id"], body={"addLabelIds": [label_id]}
            ).execute()
    return suspicious


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Review suspicious Gmail messages.")
    parser.add_argument("--credentials", default="credentials.json", help="Google OAuth client JSON file.")
    parser.add_argument("--token", default="gmail-token.json", help="Where to store the OAuth token.")
    parser.add_argument("--query", default=DEFAULT_QUERY, help="Gmail search query.")
    parser.add_argument("--threshold", type=int, default=5, help="Score at which a message is reviewed.")
    parser.add_argument("--limit", type=int, default=50, help="Maximum messages to inspect.")
    parser.add_argument("--apply", action="store_true", help=f"Apply the '{REVIEW_LABEL}' label.")
    return parser


def main() -> None:
    args = build_parser().parse_args()
    if not os.path.exists(args.credentials):
        raise SystemExit(f"Credentials file not found: {args.credentials}")
    service = _gmail_service(Path(args.credentials), Path(args.token))
    count = review_mail(service, args.query, args.threshold, args.apply, args.limit)
    mode = "labeled" if args.apply else "found"
    print(f"{count} suspicious message(s) {mode}.")


if __name__ == "__main__":
    main()