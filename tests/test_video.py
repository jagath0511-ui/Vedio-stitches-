import os
import subprocess
import pytest
from upscaler.video import upscale_video

def create_sample_video(path: str, duration: int = 1, width: int = 320, height: int = 240):
    """Utility to create a test video using FFmpeg."""
    cmd = [
        "ffmpeg",
        "-y",
        "-f", "lavfi",
        "-i", f"testsrc=duration={duration}:size={width}x{height}:rate=30",
        "-c:v", "libx264",
        path
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

def get_video_dimensions(path: str):
    """Utility to query video width and height using ffprobe."""
    cmd = [
        "ffprobe",
        "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height",
        "-of", "csv=s=x:p=0",
        path
    ]
    res = subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    w_str, h_str = res.stdout.strip().split("x")
    return int(w_str), int(h_str)

def test_video_upscale_1080p_pad(tmp_path):
    input_path = os.path.join(tmp_path, "input.mp4")
    output_path = os.path.join(tmp_path, "output_1080p.mp4")

    create_sample_video(input_path, duration=1, width=640, height=360)
    upscale_video(input_path, output_path, "1080p", mode="pad")

    assert os.path.exists(output_path)
    w, h = get_video_dimensions(output_path)
    assert (w, h) == (1920, 1080)

def test_video_upscale_2160p_crop(tmp_path):
    input_path = os.path.join(tmp_path, "input.mp4")
    output_path = os.path.join(tmp_path, "output_2160p.mp4")

    create_sample_video(input_path, duration=1, width=640, height=480)
    upscale_video(input_path, output_path, "2160p", mode="crop")

    assert os.path.exists(output_path)
    w, h = get_video_dimensions(output_path)
    assert (w, h) == (3840, 2160)
