# LeadIQ - Automated Service Launcher
# Launches MySQL, FastAPI, and Angular as independent detached background processes
# so they remain permanently active without being interrupted by IDE restarts.

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host " Starting LeadIQ Services (Detached Mode)        " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Start MySQL
$mysqlExe = Join-Path $baseDir "mysql_server\server\bin\mysqld.exe"
$mysqlData = Join-Path $baseDir "mysql_server\data"
$existingMysql = Get-NetTCPConnection -LocalPort 3306 -ErrorAction SilentlyContinue

if (-not $existingMysql) {
    Write-Host "[1/3] Starting MySQL Server on port 3306..." -ForegroundColor Yellow
    Start-Process -FilePath $mysqlExe -ArgumentList "--datadir=`"$mysqlData`" --console" -WindowStyle Hidden
    Start-Sleep -Seconds 3
} else {
    Write-Host "[1/3] MySQL Server is already running on port 3306." -ForegroundColor Green
}

# 2. Start FastAPI Backend
$pythonExe = Join-Path $baseDir "backend\.venv\Scripts\python.exe"
$backendDir = Join-Path $baseDir "backend"
$existingBackend = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue

if (-not $existingBackend) {
    Write-Host "[2/3] Starting FastAPI Backend on port 8000..." -ForegroundColor Yellow
    Start-Process -FilePath $pythonExe -ArgumentList "-m uvicorn app.main:app --host 127.0.0.1 --port 8000" -WorkingDirectory $backendDir -WindowStyle Hidden
    Start-Sleep -Seconds 3
} else {
    Write-Host "[2/3] FastAPI Backend is already running on port 8000." -ForegroundColor Green
}

# 3. Start Angular Frontend
$existingFrontend = Get-NetTCPConnection -LocalPort 4200 -ErrorAction SilentlyContinue

if (-not $existingFrontend) {
    Write-Host "[3/3] Starting Angular Frontend on port 4200..." -ForegroundColor Yellow
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm start" -WorkingDirectory $baseDir -WindowStyle Hidden
    Start-Sleep -Seconds 4
} else {
    Write-Host "[3/3] Angular Frontend is already running on port 4200." -ForegroundColor Green
}

Write-Host "=================================================" -ForegroundColor Green
Write-Host " ALL SERVICES STARTED SUCCESSFULLY!              " -ForegroundColor Green
Write-Host " - Frontend: http://localhost:4200               " -ForegroundColor White
Write-Host " - Backend:  http://127.0.0.1:8000               " -ForegroundColor White
Write-Host " - API Docs: http://127.0.0.1:8000/docs          " -ForegroundColor White
Write-Host "=================================================" -ForegroundColor Green
