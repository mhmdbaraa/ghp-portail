# Start Django and React Production
# Django in virtual environment on 0.0.0.0:8000
# React in production mode on localhost:3000

Write-Host "Starting Django and React Production..." -ForegroundColor Green
Write-Host "Django API: http://0.0.0.0:8000" -ForegroundColor Cyan
Write-Host "React App: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

# Start Django in a new window
Write-Host "Starting Django server in production mode..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Set-Location 'venv\Scripts'; .\activate.bat; Set-Location '..\..'; python manage.py collectstatic --noinput; python manage.py runserver 0.0.0.0:8000 --settings=projecttracker.settings_production" -WindowStyle Normal

# Wait a moment for Django to start
Start-Sleep -Seconds 3

# Start React production in a new window
Write-Host "Starting React production server..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run build; npx serve -s dist -l 3000" -WindowStyle Normal

Write-Host ""
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Django API: http://0.0.0.0:8000" -ForegroundColor Yellow
Write-Host "React App: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this script (servers will continue running)..." -ForegroundColor Red
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
