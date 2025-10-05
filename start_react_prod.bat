@echo off
echo ===============================================
echo Starting React Production Server
echo ===============================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing Node.js dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo Error: npm install failed
        pause
        exit /b 1
    )
)

echo Building React for production...
call npm run build:prod
if %ERRORLEVEL% NEQ 0 (
    echo Error: React build failed
    pause
    exit /b 1
)

echo.
echo React build completed successfully!
echo.
echo Starting React production server...
echo React App: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start React with preview (keeps terminal open)
call npm run preview -- --port 3000 --host 0.0.0.0