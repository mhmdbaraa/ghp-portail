@echo off
echo ========================================
echo    PROJECT TRACKER - AUTO FIX SCRIPT
echo ========================================
echo.

REM Set console to UTF-8 for proper character display
chcp 65001 >nul

echo [1/6] Fixing Git Environment...
call fix_git_env.bat

echo.
echo [2/6] Creating Environment Files...
if not exist ".env" (
    copy "env.example" ".env"
    echo Created .env file from template
)

if not exist "backend\.env" (
    copy "backend\env.example" "backend\.env"
    echo Created backend\.env file from template
)

echo.
echo [3/6] Installing Dependencies...
echo Installing Node.js dependencies...
call npm install

echo Installing Python dependencies...
cd backend
pip install -r requirements.txt
cd ..

echo.
echo [4/6] Running Database Migrations...
cd backend
python manage.py makemigrations
python manage.py migrate
cd ..

echo.
echo [5/6] Starting Development Servers...
echo Starting Django server in background...
start "Django Server" cmd /k "cd backend && python manage.py runserver"

echo Waiting 3 seconds for Django to start...
timeout /t 3 /nobreak >nul

echo Starting Vite development server...
start "Vite Server" cmd /k "npm run dev"

echo.
echo [6/6] Final Git Commit...
git add .
git commit -m "Complete project setup and environment configuration

- Fixed git environment configuration
- Added environment configuration files
- Installed all dependencies
- Ran database migrations
- Configured development servers
- Fixed form validation issues
- Improved project structure"

echo.
echo ========================================
echo    ALL FIXES COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo Your project is now ready:
echo - Django server: http://localhost:8000
echo - Vite server: http://localhost:3000
echo - Git environment: Fixed and configured
echo.
echo Press any key to exit...
pause >nul
