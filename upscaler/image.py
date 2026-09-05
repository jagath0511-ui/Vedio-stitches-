"""
Image upscaling logic using Pillow with Lanczos resampling.
"""

import os
from typing import Tuple, Union
from PIL import Image, ImageOps
from upscaler.core import parse_resolution

def upscale_image(
    input_path: str,
    output_path: str,
    target_resolution: Union[str, Tuple[int, int]],
    mode: str = "pad",
    background_color: Tuple[int, int, int] = (0, 0, 0)
) -> str:
    """
    Upscales an image file to a target resolution.

    :param input_path: Path to the input image file.
    :param output_path: Path to write the upscaled image file.
    :param target_resolution: '1080p', '2160p', or a tuple (width, height).
    :param mode: How to handle aspect ratio difference:
                 - 'pad': Scale while preserving aspect ratio, then pad to target resolution (letterbox/pillarbox).
                 - 'fit': Scale while preserving aspect ratio so it fits within target resolution bounds without padding.
                 - 'crop': Scale while preserving aspect ratio and center-crop to target resolution.
                 - 'stretch': Scale non-proportionally to target resolution.
    :param background_color: RGB tuple for padding background (default: black).
    :return: Output file path.
    """
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input file not found: {input_path}")

    if isinstance(target_resolution, str):
        target_width, target_height = parse_resolution(target_resolution)
    else:
        target_width, target_height = target_resolution

    with Image.open(input_path) as img:
        # Convert paletted/RGBA images if needed to preserve transparency or properly map colors
        if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
            img = img.convert("RGBA")
            if len(background_color) == 3:
                bg_color = background_color + (255,)
            else:
                bg_color = background_color
        else:
            img = img.convert("RGB")
            bg_color = background_color

        orig_w, orig_h = img.size
        resampling = getattr(Image, "Resampling", Image).LANCZOS

        if mode == "stretch":
            upscaled = img.resize((target_width, target_height), resample=resampling)

        elif mode == "fit":
            ratio = min(target_width / orig_w, target_height / orig_h)
            new_w = max(1, int(round(orig_w * ratio)))
            new_h = max(1, int(round(orig_h * ratio)))
            upscaled = img.resize((new_w, new_h), resample=resampling)

        elif mode == "crop":
            # Scale up to cover target_width x target_height, then center crop
            ratio = max(target_width / orig_w, target_height / orig_h)
            new_w = max(1, int(round(orig_w * ratio)))
            new_h = max(1, int(round(orig_h * ratio)))
            resized = img.resize((new_w, new_h), resample=resampling)

            left = (new_w - target_width) // 2
            top = (new_h - target_height) // 2
            right = left + target_width
            bottom = top + target_height
            upscaled = resized.crop((left, top, right, bottom))

        elif mode == "pad":
            # Scale to fit within bounds, then pad to exact target dimensions
            ratio = min(target_width / orig_w, target_height / orig_h)
            new_w = max(1, int(round(orig_w * ratio)))
            new_h = max(1, int(round(orig_h * ratio)))
            resized = img.resize((new_w, new_h), resample=resampling)

            upscaled = Image.new(resized.mode, (target_width, target_height), bg_color)
            offset_x = (target_width - new_w) // 2
            offset_y = (target_height - new_h) // 2
            upscaled.paste(resized, (offset_x, offset_y))

        else:
            raise ValueError(f"Unsupported mode '{mode}'. Choose from 'pad', 'fit', 'crop', 'stretch'.")

        out_dir = os.path.dirname(output_path)
        if out_dir:
            os.makedirs(out_dir, exist_ok=True)

        upscaled.save(output_path)
        return output_path
