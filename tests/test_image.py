import os
import pytest
from PIL import Image
from upscaler.core import parse_resolution, is_image_file, is_video_file
from upscaler.image import upscale_image

def test_parse_resolution():
    assert parse_resolution("1080p") == (1920, 1080)
    assert parse_resolution("1080P") == (1920, 1080)
    assert parse_resolution("2160p") == (3840, 2160)
    assert parse_resolution("2160P") == (3840, 2160)
    assert parse_resolution("1280x720") == (1280, 720)
    with pytest.raises(ValueError):
        parse_resolution("invalid_res")

def test_file_type_checks():
    assert is_image_file("photo.jpg")
    assert is_image_file("image.PNG")
    assert is_image_file("pic.webp")
    assert not is_image_file("movie.mp4")

    assert is_video_file("movie.mp4")
    assert is_video_file("clip.MKV")
    assert not is_video_file("photo.jpg")

def test_image_upscale_1080p_pad(tmp_path):
    # Create a small dummy image
    input_path = os.path.join(tmp_path, "input.png")
    output_path = os.path.join(tmp_path, "output_1080p.png")

    img = Image.new("RGB", (640, 480), color="red")
    img.save(input_path)

    upscale_image(input_path, output_path, "1080p", mode="pad")

    assert os.path.exists(output_path)
    with Image.open(output_path) as out_img:
        assert out_img.size == (1920, 1080)

def test_image_upscale_2160p_crop(tmp_path):
    input_path = os.path.join(tmp_path, "input.png")
    output_path = os.path.join(tmp_path, "output_2160p.png")

    img = Image.new("RGB", (800, 600), color="blue")
    img.save(input_path)

    upscale_image(input_path, output_path, "2160p", mode="crop")

    assert os.path.exists(output_path)
    with Image.open(output_path) as out_img:
        assert out_img.size == (3840, 2160)

def test_image_upscale_fit(tmp_path):
    input_path = os.path.join(tmp_path, "input.png")
    output_path = os.path.join(tmp_path, "output_fit.png")

    # 4:3 aspect ratio image
    img = Image.new("RGB", (800, 600), color="green")
    img.save(input_path)

    upscale_image(input_path, output_path, "1080p", mode="fit")

    assert os.path.exists(output_path)
    with Image.open(output_path) as out_img:
        # Height scaled to 1080, width scaled proportionally: 1080 * (4/3) = 1440
        assert out_img.size == (1440, 1080)
