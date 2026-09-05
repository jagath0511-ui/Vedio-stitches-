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
