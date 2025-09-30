@echo off
echo ========================================
echo Git Commit and Push Script
echo ========================================
echo.

REM Navigate to project directory
cd /d "%~dp0"

REM Check git status
echo Checking git status...
git status
echo.

REM Add all changes
echo Adding all changes...
git add .
echo.

REM Commit with message
echo Committing changes...
git commit -m "feat: Add professional project details dialog with tasks and team info"
echo.

REM Push to origin
echo Pushing to remote...
git push origin master
echo.

echo ========================================
echo Done! Check output above for any errors
echo ========================================
pause
