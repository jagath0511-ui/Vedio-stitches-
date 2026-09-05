"""
Core resolution definitions and utilities for the media upscaler.
"""

import os
from typing import Tuple, Dict

# Standard resolutions (width, height)
RESOLUTIONS: Dict[str, Tuple[int, int]] = {
    "1080p": (1920, 1080),
    "1080P": (1920, 1080),
    "2160p": (3840, 2160),
    "2160P": (3840, 2160),
    "4k": (3840, 2160),
    "4K": (3840, 2160),
}

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff", ".gif"}
VIDEO_EXTENSIONS = {".mp4", ".mkv", ".avi", ".mov", ".webm", ".flv", ".m4v"}

def parse_resolution(resolution_str: str) -> Tuple[int, int]:
    """
    Parses a resolution string (e.g. '1080p', '2160p', '1920x1080').
    Returns a tuple of (width, height).
    """
    res_key = resolution_str.strip()
    if res_key in RESOLUTIONS:
        return RESOLUTIONS[res_key]

    if "x" in res_key.lower():
        parts = res_key.lower().split("x")
        if len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit():
            return int(parts[0]), int(parts[1])

    raise ValueError(f"Invalid resolution format: '{resolution_str}'. Expected '1080p', '2160p', or 'WIDTHxHEIGHT'.")

def is_image_file(filepath: str) -> bool:
    """Checks if file extension corresponds to a known image format."""
    ext = os.path.splitext(filepath)[1].lower()
    return ext in IMAGE_EXTENSIONS

def is_video_file(filepath: str) -> bool:
    """Checks if file extension corresponds to a known video format."""
    ext = os.path.splitext(filepath)[1].lower()
    return ext in VIDEO_EXTENSIONS
