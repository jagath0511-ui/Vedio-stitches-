@echo off
title F5-TTS Neural Voice Studio Launcher
color 0A
echo ======================================================================
echo           F5-TTS: Zero-Shot Emotional Voice Cloning Launcher
echo ======================================================================
echo.
echo Target Folder: C:\Users\gjaga\Downloads\New folder (2)\F5-TTS
echo.

cd /d "C:\Users\gjaga\Downloads\New folder (2)\F5-TTS"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Could not find F5-TTS directory at "C:\Users\gjaga\Downloads\New folder (2)\F5-TTS"
    pause
    exit /b 1
)

echo [1/3] Verifying Python installation...
python --version
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python was not found in your PATH. Please ensure Python is installed.
    pause
    exit /b 1
)

echo.
echo [2/3] Checking and installing required packages (torch, torchaudio, f5-tts)...
python -m pip install -e .
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Pip install returned a warning or error. Attempting to start regardless...
)

echo.
echo [3/3] Starting F5-TTS Gradio Web Interface at http://127.0.0.1:7860 ...
echo.
echo ----------------------------------------------------------------------
echo  * Open your browser and navigate to: http://127.0.0.1:7860
echo  * How to clone voices with emotions:
echo      1. Upload your 5-10 second voice clip (.wav / .mp3)
echo      2. Type the transcript of the reference clip
echo      3. Type the new text you want generated with matching emotion
echo      4. Click 'Generate' and export the audio into ClipMerge!
echo ----------------------------------------------------------------------
echo.

python -m f5_tts.infer.infer_gradio --port 7860 --host 127.0.0.1

pause

