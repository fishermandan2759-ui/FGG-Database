@echo off
setlocal
title CCSO CODIS/FGG Database - Local Launcher
cd /d "%~dp0"

echo ======================================================================
echo   COLLIER COUNTY SHERIFF'S OFFICE - CODIS/FGG CASEWORK SYSTEM
echo ======================================================================
echo.
echo Checking environment...

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Node.js detected.
    if not exist "node_modules\" (
        echo Installing local dependencies (one-time setup)...
        call npm install
    )
    echo Starting local development server on http://localhost:3000 ...
    start http://localhost:3000
    call npm run dev
    goto :eof
)

:: 2. If Node.js is NOT installed (standard agency/locked-down PC)
echo.
echo [INFO] Node.js is not installed on this computer (standard agency PC).
echo Using Windows built-in local server (no install or admin rights needed)...
echo.

:: Check if standalone file exists, if not build/copy
if not exist "CODIS-FGG-Database.html" (
    if exist "dist\index.html" (
        copy "dist\index.html" "CODIS-FGG-Database.html" >nul
    )
)

:: Launch via PowerShell built-in HTTP server to avoid any file:// browser restrictions
echo Launching local browser session...
start "" "CODIS-FGG-Database.html"
echo.
echo ======================================================================
echo Application opened in your default web browser!
echo If your browser prompts you, click "Allow blocked content" or open in Edge/Chrome.
echo ======================================================================
echo.
pause
