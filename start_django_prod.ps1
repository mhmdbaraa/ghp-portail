# Start Django in Production Mode
# Django in virtual environment on 0.0.0.0:8000 with production settings

Write-Host "Starting Django in Production Mode..." -ForegroundColor Green
Write-Host "Django API: http://0.0.0.0:8000" -ForegroundColor Cyan
Write-Host "Settings: projecttracker.settings_production" -ForegroundColor Yellow
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path "venv\Scripts\activate.bat")) {
    Write-Host "Error: Virtual environment not found. Please create it first with: python -m venv venv" -ForegroundColor Red
    exit 1
}

# Start Django in production mode
Write-Host "Starting Django server in production mode..." -ForegroundColor Blue
Write-Host "Collecting static files..." -ForegroundColor Yellow

# Run Django with production settings
# Collect static files first
.\venv\Scripts\python.exe manage.py collectstatic --noinput --settings=projecttracker.settings_production

# Start Django server with production settings
.\venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000 --settings=projecttracker.settings_production
