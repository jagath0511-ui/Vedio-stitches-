import os
import subprocess
import pytest
from PIL import Image

def test_cli_image(tmp_path):
    input_path = os.path.join(tmp_path, "sample.jpg")
    output_path = os.path.join(tmp_path, "sample_1080p.jpg")

    img = Image.new("RGB", (300, 200), color="yellow")
    img.save(input_path)

    cmd = [
        "python3", "upscale.py",
        "-i", input_path,
        "-o", output_path,
        "-r", "1080p",
        "-m", "pad"
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    assert res.returncode == 0
    assert os.path.exists(output_path)

    with Image.open(output_path) as out_img:
        assert out_img.size == (1920, 1080)

def test_cli_video(tmp_path):
    input_path = os.path.join(tmp_path, "sample.mp4")
    output_path = os.path.join(tmp_path, "sample_2160p.mp4")

    # Create dummy video
    ffmpeg_cmd = [
        "ffmpeg", "-y", "-f", "lavfi",
        "-i", "testsrc=duration=1:size=160x120:rate=30",
        "-c:v", "libx264", input_path
    ]
    subprocess.run(ffmpeg_cmd, check=True)

    cmd = [
        "python3", "upscale.py",
        "-i", input_path,
        "-o", output_path,
        "-r", "2160p",
        "-m", "stretch"
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    assert res.returncode == 0
    assert os.path.exists(output_path)
