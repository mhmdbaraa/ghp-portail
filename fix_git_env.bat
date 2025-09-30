@echo off
echo Fixing Git Environment Configuration...

REM Check if Git is installed
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo Git not found in PATH. Adding Git to PATH...
    set PATH=%PATH%;C:\Program Files\Git\cmd
    set PATH=%PATH%;C:\Program Files (x86)\Git\cmd
)

REM Configure Git if not already configured
echo Configuring Git...
git config --global user.name "Mohamed Bara" 2>nul
git config --global user.email "mo@live.fr" 2>nul
git config --global init.defaultBranch main 2>nul
git config --global core.autocrlf true 2>nul
git config --global credential.helper manager-core 2>nul
git config --global core.filemode false 2>nul

REM Check Git status
echo Checking Git status...
git --version
git config --list | findstr user

REM Add and commit changes
echo Adding all changes...
git add .

echo Committing changes...
git commit -m "Fix project form validation and environment configuration

- Added validation for budget field (required, must be >= 0)
- Added validation for filiales field (required, must have at least one selection)  
- Enhanced chef de projet validation
- Fixed form error display for all required fields
- Improved user experience with proper error messages
- Fixed git environment configuration"

echo Git environment fixed successfully!
pause
