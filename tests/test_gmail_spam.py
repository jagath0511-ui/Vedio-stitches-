import base64

from upscaler.gmail_spam import assess_message, message_text


def gmail_message(subject: str, sender: str, body: str) -> dict:
    encoded = base64.urlsafe_b64encode(body.encode()).decode().rstrip("=")
    return {
        "payload": {
            "headers": [
                {"name": "Subject", "value": subject},
                {"name": "From", "value": sender},
            ],
            "body": {"data": encoded},
        }
    }


def test_assess_message_flags_high_confidence_spam():
    message = gmail_message(
        "Urgent: verify your account immediately",
        "Security <alert@example.top>",
        "Click here to confirm your password and claim now: https://a.test",
    )

    assessment = assess_message(message)

    assert assessment.suspicious
    assert "credential or payment request" in assessment.reasons


def test_assess_message_does_not_flag_normal_mail():
    message = gmail_message(
        "Project notes",
        "Colleague <colleague@example.com>",
        "Here are the notes from our meeting.",
    )

    assessment = assess_message(message)

    assert not assessment.suspicious
    assert assessment.score == 0


def test_message_text_decodes_nested_parts():
    encoded = base64.urlsafe_b64encode(b"nested body").decode().rstrip("=")
    message = {"payload": {"parts": [{"body": {"data": encoded}}]}}

    assert message_text(message) == "nested body"