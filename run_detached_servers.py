import subprocess
import time
import os
import sys

BASE_DIR = r"C:\Users\Dines\.gemini\antigravity-ide\scratch\leadiq"
DETACHED = 0x00000008 | 0x00000200

print("=" * 60)
print("LAUNCHING LEADIQ SERVICES AS DETACHED OS PROCESSES")
print("=" * 60)

# 1. MySQL Server
mysql_bin = os.path.join(BASE_DIR, "mysql_server", "server", "bin", "mysqld.exe")
mysql_data = os.path.join(BASE_DIR, "mysql_server", "data")
p_mysql = subprocess.Popen(
    [mysql_bin, f"--datadir={mysql_data}", "--console"],
    creationflags=DETACHED,
    close_fds=True
)
print(f"[1/3] MySQL started detached with PID: {p_mysql.pid}")
time.sleep(3)

# 2. FastAPI Backend
py_bin = os.path.join(BASE_DIR, "backend", ".venv", "Scripts", "python.exe")
p_fastapi = subprocess.Popen(
    [py_bin, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
    cwd=os.path.join(BASE_DIR, "backend"),
    creationflags=DETACHED,
    close_fds=True
)
print(f"[2/3] FastAPI started detached with PID: {p_fastapi.pid}")
time.sleep(2)

# 3. Angular Frontend
p_ng = subprocess.Popen(
    ["cmd.exe", "/c", "npm start"],
    cwd=BASE_DIR,
    creationflags=DETACHED,
    close_fds=True
)
print(f"[3/3] Angular started detached with PID: {p_ng.pid}")
time.sleep(4)

print("=" * 60)
print("ALL SERVICES ARE NOW RUNNING INDEPENDENTLY")
print("- Frontend: http://localhost:4200")
print("- Backend:  http://127.0.0.1:8000")
print("- Docs:     http://127.0.0.1:8000/docs")
print("=" * 60)
