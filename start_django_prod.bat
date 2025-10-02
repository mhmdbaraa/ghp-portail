@echo off
REM Start Django in Production Mode
REM Django in virtual environment on 0.0.0.0:8000 with production settings

echo Starting Django in Production Mode...
echo Django API: http://0.0.0.0:8000
echo Settings: projecttracker.settings_production
echo.

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo Error: Virtual environment not found. Please create it first with: python -m venv venv
    pause
    exit /b 1
)

REM Start Django in production mode
echo Starting Django server in production mode...
echo Collecting static files...

REM Run Django with production settings
REM Collect static files first
.\venv\Scripts\python.exe manage.py collectstatic --noinput --settings=projecttracker.settings_production

REM Start Django server with production settings
.\venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000 --settings=projecttracker.settings_production
