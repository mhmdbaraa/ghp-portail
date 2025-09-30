@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Git Commit and Push Script
echo ========================================
echo.

REM Set Git path explicitly
set "GIT_PATH=C:\Program Files\Git\bin\git.exe"

REM Check if Git exists at default location
if exist "%GIT_PATH%" (
    echo Git found at: %GIT_PATH%
) else (
    set "GIT_PATH=C:\Program Files (x86)\Git\bin\git.exe"
    if exist "!GIT_PATH!" (
        echo Git found at: !GIT_PATH!
    ) else (
        echo Git not found! Trying system PATH...
        set "GIT_PATH=git"
    )
)

echo.
echo Current directory: %CD%
echo.

REM Check git status
echo Checking git status...
"%GIT_PATH%" status
echo.

REM Add all changes
echo Adding all changes...
"%GIT_PATH%" add .
echo.

REM Show what will be committed
echo Files to be committed:
"%GIT_PATH%" status --short
echo.

REM Commit with message
echo Committing changes...
"%GIT_PATH%" commit -m "feat: Add professional project details dialog with tasks and team info"
echo.

REM Configure SSL backend for Windows
echo Configuring Git SSL for Windows...
"%GIT_PATH%" config --global http.sslBackend schannel
echo.

REM Push to origin
echo Pushing to remote...
"%GIT_PATH%" push origin master
echo.

echo ========================================
echo Done! Check output above for any errors
echo ========================================
echo.

pause
