"""
Package initialization for upscaler module.
"""

from upscaler.core import parse_resolution, is_image_file, is_video_file, RESOLUTIONS
from upscaler.image import upscale_image
from upscaler.video import upscale_video

__all__ = [
    "parse_resolution",
    "is_image_file",
    "is_video_file",
    "RESOLUTIONS",
    "upscale_image",
    "upscale_video",
]
