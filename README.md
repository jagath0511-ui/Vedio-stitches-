# Media Upscaler

A Python tool and library to upscale images and videos to **1080P** (1920x1080), **2160P / 4K** (3840x2160), or custom resolutions with high-quality resampling filters.

## Features

- **Video Upscaling**: Uses FFmpeg with Lanczos filtering to upscale videos (MP4, MOV, MKV, AVI, WEBM, etc.) to 1080p and 2160p.
- **Image Upscaling**: Uses Pillow with Lanczos resampling to upscale static images (JPG, PNG, WEBP, BMP, etc.) to 1080p and 2160p.
- **Aspect Ratio Modes**:
  - `pad` (default): Scales while preserving aspect ratio and pads (letterbox/pillarbox) to exact target dimensions.
  - `fit`: Scales while preserving aspect ratio so the image/video fits within bounds.
  - `crop`: Scales while preserving aspect ratio and center-crops to target dimensions.
  - `stretch`: Scales non-proportionally to exact target dimensions.
- **CLI & Module API**: Can be run directly from the command line or imported into Python scripts.

## Requirements

- Python 3.8+
- [FFmpeg](https://ffmpeg.org/) installed and available in system PATH.
- `Pillow` Python package.

## Installation

```bash
pip install -e .
```

## Usage

### Command Line Interface

```bash
# Upscale an image to 1080P
python upscale.py -i input.jpg -o output_1080p.jpg -r 1080p

# Upscale a video to 2160P / 4K with letterbox padding
python upscale.py -i input.mp4 -o output_4k.mp4 -r 2160p -m pad

# Upscale an image with cropping to exact 1080P
python upscale.py -i input.png -o output_crop.png -r 1080p -m crop
```

### Python API

```python
from upscaler import upscale_image, upscale_video

# Upscale an image
upscale_image("photo.jpg", "photo_1080p.jpg", target_resolution="1080p", mode="pad")

# Upscale a video
upscale_video("clip.mp4", "clip_4k.mp4", target_resolution="2160p", mode="pad")
```

## Running Tests

```bash
PYTHONPATH=. pytest
```

## Agent control panel

The standalone prompt intake and status/notification surface is available at
`/agent-ui` (and does not modify the media app). Its serverless stubs are
`POST /api/prompts`, `GET /api/status`, and `POST /api/notifications`.

The configured notification recipients are:

- **Gmail recipient:** `jagath1105@gmail.com`
- **SMS recipient:** `+91 7671031414`

These are recipients (destinations that receive alerts), not senders. The
sender is the Gmail account or SMS provider identity used by the server-side
worker. Keep sender credentials out of browser code: configure provider secrets
such as `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `SMS_ACCOUNT_SID`/
`SMS_AUTH_TOKEN`/`SMS_FROM` as Vercel
Environment Variables (or your deployment platform's server-side secret
store). The browser sends only prompts and recipient settings to the API; API
responses never include secrets.

### Unattended runner setup

Configure these server-side values before using `/agent-ui`:

- `AGENT_UI_TOKEN`: a high-entropy token required by all control-panel API
  calls. Enter it in the panel; it is retained only in session storage and
  never returned by an API.
- `GITHUB_TOKEN`: a fine-grained token allowed to dispatch workflows and read
  Actions runs.
- `GITHUB_REPOSITORY`: this repository in `owner/name` form.
- `AGENT_COMMAND`: the executable used by the runner to invoke the installed
  Copilot/Antigravity engine. The workflow fails visibly if this is missing;
  it never pretends that a prompt completed.
- `AGENT_APPROVAL_TOKEN`: optional high-entropy server-side approval token.
  Set it only when intentionally authorizing approval-gated jobs; without it,
  destructive, high-risk, history-changing, secret-changing, and over-limit
  jobs remain paused.
- `GMAIL_USER`: `jagath1105@gmail.com` (the configured Gmail sender and recipient).
- `GMAIL_APP_PASSWORD`: an app password for that Gmail account; do not use a
  normal Gmail password.
- `SMS_ACCOUNT_SID`, `SMS_AUTH_TOKEN`, and `SMS_FROM`: SMS provider credentials.
- `SMS_PROVIDER_URL`: optional provider endpoint (defaults to the Twilio Messages API).

The notification API normalizes SMS formatting to E.164 before delivery and rejects
non-international numbers. Credentials are never accepted from the browser, included
in API responses, or persisted in the durable outbox; notification messages and
provider errors are redacted before persistence and delivery.

The workflow can be started from the web panel, with a `repository_dispatch`,
or by opening an Issue. Issues are processed when opened, or when the `agent`
label is added. GitHub Actions remains the source of truth while the laptop is
asleep. Open `/agent-ui` later to inspect recent workflow status and use the
GitHub Actions link for the complete report and artifacts.

Jobs are bounded and resumable: checkpoints, retries, heartbeats, audit
artifacts, and a 30-minute workflow timeout are enabled by default. Destructive
and high-risk jobs pause for approval and are not auto-approved by the
option-four policy. Configure the notification recovery workflow and provider secrets
before relying on Gmail/SMS delivery; missing credentials are reported rather
than silently ignored.

### Safety gates and previews

Every run records a decision in `report.json`. The decision includes the
classified risks and whether approval was required or granted. Dry runs
(`JobSpec(..., dry_run=True)`) produce a preview and never invoke the operation.
Approval pauses are mandatory for destructive, high-risk, history-changing,
secret-changing, and over-limit jobs (over-limit means an explicit
`metadata["over_limit"]` marker or a timeout/attempt count above the runner
limits). Option four is only a UI choice; it is never an approval credential
and cannot bypass these gates. A paused job must be resumed with an explicit
server-side approval token (`AGENT_APPROVAL_TOKEN`).
