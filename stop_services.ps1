# LeadIQ - Automated Service Terminator
# Stops processes on ports 3306 (MySQL), 8000 (FastAPI), and 4200 (Angular)

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host " Stopping LeadIQ Services                        " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$ports = @(3306, 8000, 4200)

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($procId in $pids) {
            try {
                $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
                if ($proc) {
                    Write-Host "Stopping process $($proc.ProcessName) (PID: $procId) on port $port..." -ForegroundColor Yellow
                    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                }
            } catch {
                # Ignore
            }
        }
    } else {
        Write-Host "No service running on port $port." -ForegroundColor Gray
    }
}

Write-Host "All services stopped." -ForegroundColor Green
