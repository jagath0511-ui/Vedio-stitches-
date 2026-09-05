"""
Video upscaling logic using FFmpeg.
"""

import os
import subprocess
from typing import Tuple, Union
from upscaler.core import parse_resolution

def upscale_video(
    input_path: str,
    output_path: str,
    target_resolution: Union[str, Tuple[int, int]],
    mode: str = "pad",
    background_color: str = "black",
    vcodec: str = "libx264",
    crf: int = 18,
    preset: str = "medium"
) -> str:
    """
    Upscales a video file to a target resolution using FFmpeg with high quality Lanczos filtering.

    :param input_path: Path to the input video file.
    :param output_path: Path to write the upscaled video file.
    :param target_resolution: '1080p', '2160p', or tuple (width, height).
    :param mode: How to handle aspect ratio difference:
                 - 'pad': Scale maintaining aspect ratio and letterbox/pillarbox to exact target dimensions.
                 - 'fit': Scale maintaining aspect ratio so it fits within target dimensions (ensuring even dimensions).
                 - 'crop': Scale maintaining aspect ratio and center crop to exact target dimensions.
                 - 'stretch': Scale non-proportionally to exact target dimensions.
    :param background_color: Color string for video padding (default: 'black').
    :param vcodec: Video codec to use (default: 'libx264').
    :param crf: Constant Rate Factor quality level (default: 18 - high quality).
    :param preset: Encoding speed/compression preset (default: 'medium').
    :return: Output file path.
    """
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input video file not found: {input_path}")

    if isinstance(target_resolution, str):
        target_w, target_h = parse_resolution(target_resolution)
    else:
        target_w, target_h = target_resolution

    # Construct appropriate FFmpeg filter graph according to mode
    if mode == "stretch":
        vf_filter = f"scale={target_w}:{target_h}:flags=lanczos"
    elif mode == "fit":
        # Scale to fit within target_w x target_h, ensuring width and height are divisible by 2 for standard codecs
        vf_filter = f"scale='min({target_w},iw*min({target_w}/iw\\,{target_h}/ih))':'min({target_h},ih*min({target_w}/iw\\,{target_h}/ih))':force_original_aspect_ratio=decrease:flags=lanczos,pad='ceil(iw/2)*2':'ceil(ih/2)*2':0:0"
    elif mode == "crop":
        vf_filter = f"scale='max({target_w},iw*max({target_w}/iw\\,{target_h}/ih))':'max({target_h},ih*max({target_w}/iw\\,{target_h}/ih))':flags=lanczos,crop={target_w}:{target_h}"
    elif mode == "pad":
        vf_filter = f"scale='min({target_w},iw*min({target_w}/iw\\,{target_h}/ih))':'min({target_h},ih*min({target_w}/iw\\,{target_h}/ih))':force_original_aspect_ratio=decrease:flags=lanczos,pad={target_w}:{target_h}:({target_w}-iw)/2:({target_h}-ih)/2:color={background_color}"
    else:
        raise ValueError(f"Unsupported mode '{mode}'. Choose from 'pad', 'fit', 'crop', 'stretch'.")

    out_dir = os.path.dirname(output_path)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)

    cmd = [
        "ffmpeg",
        "-y",
        "-i", input_path,
        "-vf", vf_filter,
        "-c:v", vcodec,
        "-crf", str(crf),
        "-preset", preset,
        "-c:a", "copy",
        output_path
    ]

    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"FFmpeg failed with exit code {result.returncode}:\n{result.stderr}")

    return output_path
