import os
import sys
import urllib.request
import zipfile
import subprocess
import time

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "mysql_server"))
ZIP_PATH = os.path.join(BASE_DIR, "mariadb.zip")
EXTRACT_DIR = os.path.join(BASE_DIR, "server")
DATA_DIR = os.path.join(BASE_DIR, "data")

def setup_mysql():
    os.makedirs(BASE_DIR, exist_ok=True)
    os.makedirs(DATA_DIR, exist_ok=True)

    url = "https://archive.mariadb.org/mariadb-11.4.2/winx64-packages/mariadb-11.4.2-winx64.zip"

    # Step 1: Download
    if not os.path.exists(ZIP_PATH) and not os.path.exists(EXTRACT_DIR):
        print(f"[DOWNLOAD] Downloading portable MySQL/MariaDB server from {url}...")
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as response, open(ZIP_PATH, 'wb') as out_file:
            total_size = int(response.headers.get('Content-Length', 0))
            downloaded = 0
            block_size = 1024 * 1024
            last_pct = 0
            while True:
                buffer = response.read(block_size)
                if not buffer:
                    break
                downloaded += len(buffer)
                out_file.write(buffer)
                if total_size > 0:
                    pct = int(downloaded * 100 / total_size)
                    if pct >= last_pct + 20:
                        print(f"  [DOWNLOAD] {pct}% ({downloaded // (1024*1024)}MB / {total_size // (1024*1024)}MB)")
                        last_pct = pct
        print("[DOWNLOAD] Download complete.")

    # Step 2: Extract
    if not os.path.exists(EXTRACT_DIR):
        print("[EXTRACT] Extracting zip archive...")
        with zipfile.ZipFile(ZIP_PATH, 'r') as zip_ref:
            # zip contains a top-level directory like mariadb-11.4.2-winx64
            temp_extract = os.path.join(BASE_DIR, "temp_extract")
            zip_ref.extractall(temp_extract)
            subdirs = [os.path.join(temp_extract, d) for d in os.listdir(temp_extract) if os.path.isdir(os.path.join(temp_extract, d))]
            if subdirs:
                os.rename(subdirs[0], EXTRACT_DIR)
            os.rmdir(temp_extract)
        if os.path.exists(ZIP_PATH):
            os.remove(ZIP_PATH)
        print("[EXTRACT] Extraction complete.")

    # Step 3: Initialize Database
    mysqld_exe = os.path.join(EXTRACT_DIR, "bin", "mysqld.exe")
    install_db_exe = os.path.join(EXTRACT_DIR, "bin", "mariadb-install-db.exe")
    if not os.path.exists(install_db_exe):
        install_db_exe = os.path.join(EXTRACT_DIR, "bin", "mysql_install_db.exe")

    mysql_system_dir = os.path.join(DATA_DIR, "mysql")
    if not os.path.exists(mysql_system_dir):
        print("[INIT] Initializing MySQL system data directory...")
        cmd = [install_db_exe, f"--datadir={DATA_DIR}"]
        res = subprocess.run(cmd, capture_output=True, text=True)
        print(res.stdout)
        if res.returncode != 0:
            print("[INIT ERROR]", res.stderr)
        else:
            print("[INIT] Data directory initialized successfully.")

    print("[SUCCESS] MySQL server binaries and data directory ready at:", BASE_DIR)

if __name__ == "__main__":
    setup_mysql()
