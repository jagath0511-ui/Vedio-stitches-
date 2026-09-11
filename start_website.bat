@echo off
title ClipMerge AI Video Suite Server
color 0B
echo ======================================================================
echo           Starting ClipMerge AI Video & Audio Studio Server
echo ======================================================================
echo.
echo [*] Checking Python...
python --version
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is required to run the local server.
    pause
    exit /b 1
)

echo [*] Launching ClipMerge web app at http://localhost:8080 ...
start http://localhost:8080

echo [*] Server is running with COOP/COEP headers on http://localhost:8080
echo [*] Press Ctrl+C in this window to stop the server when done.
echo.

python clipmerge/serve.py

pause
