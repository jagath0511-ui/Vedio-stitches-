from setuptools import setup, find_packages

setup(
    name="upscaler",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "pillow>=9.0.0",
    ],
    entry_points={
        "console_scripts": [
            "upscale=upscaler.cli:main",
        ],
    },
    python_requires=">=3.8",
)
