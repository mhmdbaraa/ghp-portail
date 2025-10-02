@echo off
REM Start Django and React Production
REM Django in virtual environment on 0.0.0.0:8000
REM React in production mode on localhost:3000

echo Starting Django and React Production...
echo Django API: http://0.0.0.0:8000
echo React App: http://localhost:3000
echo.

REM Start Django in a new window
echo Starting Django server in production mode...
start "Django Server" cmd /k "cd /d %~dp0 && cd venv\Scripts && activate.bat && cd ..\.. && python manage.py collectstatic --noinput && python manage.py runserver 0.0.0.0:8000 --settings=projecttracker.settings_production"

REM Wait a moment for Django to start
timeout /t 3 /nobreak >nul

REM Start React production in a new window
echo Starting React production server...
start "React Server" cmd /k "cd /d %~dp0 && npm run build && npx serve -s dist -l 3000"

echo.
echo Both servers are starting...
echo Django API: http://0.0.0.0:8000
echo React App: http://localhost:3000
echo.
echo Press any key to exit this script (servers will continue running)...
pause >nul
