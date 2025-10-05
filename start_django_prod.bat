@echo off
echo ===============================================
echo Starting Django Production Server
echo ===============================================
echo.

REM Check if virtual environment exists
if not exist "project_env\Scripts\python.exe" (
    echo Error: Virtual environment not found at project_env\
    echo Please create it first with: python -m virtualenv project_env
    pause
    exit /b 1
)

echo Virtual environment: project_env\
echo.

REM Create logs directory
if not exist "logs" mkdir logs

echo Running Django migrations...
project_env\Scripts\python.exe manage.py migrate --settings=projecttracker.settings_production

echo Collecting static files...
project_env\Scripts\python.exe manage.py collectstatic --noinput --settings=projecttracker.settings_production

echo.
echo Django is ready for production!
echo Server will be available at: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start Django with Waitress (keeps terminal open)
project_env\Scripts\python.exe run_django_server.py

