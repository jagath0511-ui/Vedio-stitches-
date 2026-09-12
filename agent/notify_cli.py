"""Send a terminal job notification from a GitHub Actions step."""

import argparse
import os
import sys

from .notifications import NotificationOutbox, build_payload, redact, send_gmail, send_sms
from .schemas import JobStatus


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--job-id")
    parser.add_argument("--status")
    parser.add_argument("--message")
    parser.add_argument("--report-url", default="")
    parser.add_argument("--outbox", default="agent-artifacts/notification-outbox.json")
    parser.add_argument("--retry-only", action="store_true")
    args = parser.parse_args()
    outbox = NotificationOutbox(args.outbox)
    if args.retry_only:
        senders = {"gmail": send_gmail, "sms": send_sms}
        delivered = outbox.retry_pending(send_gmail, senders=senders)
        pending = outbox.pending()
        if pending:
            channels = ", ".join(sorted(
                "{} ({})".format(entry.get("channel", "default"), key)
                for key, entry in pending.items()
            ))
            print("Undelivered notifications remain: " + channels, file=sys.stderr)
            return 1
        print("Recovered {} notification(s).".format(delivered))
        return 0
    if not args.job_id or not args.status or not args.message:
        parser.error("--job-id, --status, and --message are required unless --retry-only is used")

    status_map = {
        "success": JobStatus.SUCCEEDED,
        "succeeded": JobStatus.SUCCEEDED,
        "failure": JobStatus.FAILED,
        "failed": JobStatus.FAILED,
        "cancelled": JobStatus.CANCELLED,
        "canceled": JobStatus.CANCELLED,
        "blocked": JobStatus.BLOCKED,
        "approval-paused": JobStatus.APPROVAL_PAUSED,
        "paused": JobStatus.PAUSED,
        "stalled": JobStatus.STALLED,
        "timed-out": JobStatus.TIMED_OUT,
        "timed_out": JobStatus.TIMED_OUT,
    }
    status = status_map.get(args.status.lower(), JobStatus.FAILED)
    payload = build_payload(args.job_id, status, args.message,
                            report_url=args.report_url or os.getenv("GITHUB_RUN_URL", ""),
                            run_url=os.getenv("GITHUB_RUN_URL", ""))
    failures = []
    gmail = outbox.deliver(payload, send_gmail, channel="gmail")
    if gmail.get("status") != "sent":
        failures.append("gmail: {}".format(gmail.get("error", "delivery pending")))
    # Keep an SMS entry even when secrets are temporarily unavailable.  The
    # recovery workflow can then retry it instead of treating SMS as silently
    # disabled and losing visibility of an undelivered alert.
    sms = outbox.deliver(payload, send_sms, channel="sms")
    if sms.get("status") != "sent":
        failures.append("sms: {}".format(redact(sms.get("error", "delivery pending"))))
    if failures:
        print("Notification delivery failed: " + "; ".join(failures), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
