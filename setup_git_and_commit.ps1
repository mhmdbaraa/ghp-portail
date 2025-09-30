# PowerShell script to setup Git environment and commit changes
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Git Setup and Commit Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Find Git installation
$gitPaths = @(
    "C:\Program Files\Git\bin\git.exe",
    "C:\Program Files (x86)\Git\bin\git.exe",
    "$env:LOCALAPPDATA\Programs\Git\bin\git.exe"
)

$gitExe = $null
foreach ($path in $gitPaths) {
    if (Test-Path $path) {
        $gitExe = $path
        Write-Host "Git found at: $gitExe" -ForegroundColor Green
        break
    }
}

if ($null -eq $gitExe) {
    Write-Host "Git not found! Please install Git for Windows" -ForegroundColor Red
    exit 1
}

# Set Git executable alias
Set-Alias -Name git -Value $gitExe -Scope Local

# Navigate to project directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host ""
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Check Git status
Write-Host "Checking git status..." -ForegroundColor Cyan
& $gitExe status
Write-Host ""

# Add all changes
Write-Host "Adding all changes..." -ForegroundColor Cyan
& $gitExe add .
Write-Host ""

# Show what will be committed
Write-Host "Files to be committed:" -ForegroundColor Cyan
& $gitExe status --short
Write-Host ""

# Commit with message
$commitMessage = "feat: Add professional project details dialog with tasks and team info

- Created ProjectDetails.jsx component with modern UI/UX
- Added tabbed interface (Overview, Tasks, Team)
- Implemented dynamic header with gradient colors
- Added task loading from API
- Integrated with Projects.jsx (DataGrid and Kanban views)
- Added project number display in camelCase format
- Fixed projectDataTransformer to map projectNumber correctly
- Added comprehensive documentation"

Write-Host "Committing changes..." -ForegroundColor Cyan
& $gitExe commit -m $commitMessage
Write-Host ""

# Configure SSL backend for Windows
Write-Host "Configuring Git SSL for Windows..." -ForegroundColor Cyan
& $gitExe config --global http.sslBackend schannel
Write-Host ""

# Push to origin
Write-Host "Pushing to remote..." -ForegroundColor Cyan
& $gitExe push origin master
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Done! Check output above for any errors" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Keep window open
Read-Host "Press Enter to close"
