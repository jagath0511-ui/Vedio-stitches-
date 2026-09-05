"""
Command Line Interface for upscaler.
"""

import sys
import os
import argparse
from upscaler.core import is_image_file, is_video_file, parse_resolution
from upscaler.image import upscale_image
from upscaler.video import upscale_video

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Upscale images and videos to 1080P, 2160P (4K), or custom resolutions."
    )
    parser.add_argument(
        "-i", "--input", required=True, help="Path to input image or video file."
    )
    parser.add_argument(
        "-o", "--output", required=True, help="Path to save upscaled output file."
    )
    parser.add_argument(
        "-r", "--resolution", default="1080p",
        help="Target resolution: '1080p', '2160p', or 'WIDTHxHEIGHT' (default: 1080p)."
    )
    parser.add_argument(
        "-m", "--mode", choices=["pad", "fit", "crop", "stretch"], default="pad",
        help="Aspect ratio adjustment mode: 'pad' (default, letterbox/pillarbox), 'fit', 'crop', or 'stretch'."
    )
    parser.add_argument(
        "--type", choices=["auto", "image", "video"], default="auto",
        help="Specify media type ('image' or 'video'). Default is 'auto' (detect from file extension)."
    )
    return parser

def main():
    parser = build_parser()
    args = parser.parse_args()

    input_path = args.input
    output_path = args.output
    resolution = args.resolution
    mode = args.mode
    media_type = args.type

    if not os.path.exists(input_path):
        print(f"Error: Input file does not exist: {input_path}", file=sys.stderr)
        sys.exit(1)

    if media_type == "auto":
        if is_image_file(input_path):
            media_type = "image"
        elif is_video_file(input_path):
            media_type = "video"
        else:
            print(f"Error: Could not automatically determine media type for '{input_path}'. Use --type image or --type video.", file=sys.stderr)
            sys.exit(1)

    try:
        if media_type == "image":
            print(f"Upscaling image '{input_path}' to {resolution} (mode: {mode})...")
            upscale_image(input_path, output_path, resolution, mode=mode)
            print(f"Successfully saved upscaled image to '{output_path}'.")
        elif media_type == "video":
            print(f"Upscaling video '{input_path}' to {resolution} (mode: {mode})...")
            upscale_video(input_path, output_path, resolution, mode=mode)
            print(f"Successfully saved upscaled video to '{output_path}'.")
    except Exception as e:
        print(f"Error during upscaling: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
