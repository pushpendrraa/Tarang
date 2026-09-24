@echo off
echo ═══════════════════════════════════════════════════════════
echo   TraceNet — AI Criminal Network Analysis System
echo   Smart India Hackathon 2026 ^| SIH26189 ^| MHA
echo ═══════════════════════════════════════════════════════════
echo.
echo [Step 1] Checking MongoDB...
mongod --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: MongoDB is not installed or not in PATH.
    echo.
    echo Please install MongoDB Community Edition:
    echo   https://www.mongodb.com/try/download/community
    echo.
    echo After installation, MongoDB should auto-start as a Windows Service.
    echo Or start it manually: net start MongoDB
    pause
    exit /b 1
)
echo MongoDB found!
echo.

echo [Step 2] Starting MongoDB (if not already running)...
net start MongoDB >nul 2>&1
echo MongoDB service started (or was already running).
echo.

echo [Step 3] Seeding demo data...
cd /d "%~dp0server"
call npm run seed
if errorlevel 1 (
    echo Seed failed. Make sure MongoDB is running.
    pause
    exit /b 1
)
echo.

echo [Step 4] Starting backend server (port 5000)...
start "TraceNet Server" cmd /k "cd /d %~dp0server && npm run dev"
timeout /t 2 /nobreak >nul

echo [Step 5] Starting frontend (port 5173)...
start "TraceNet Client" cmd /k "cd /d %~dp0client && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ✓ TraceNet is starting!
echo.
echo   Open your browser at: http://localhost:5173
echo.
echo   Demo credentials:
echo     Admin:        admin@tracenet.in    / Admin@1234
echo     Investigator: priya@tracenet.in    / Inv@12345
echo     Analyst:      shreya@tracenet.in   / Ana@12345
echo.
echo Press any key to open TraceNet in your browser...
pause >nul
start http://localhost:5173
