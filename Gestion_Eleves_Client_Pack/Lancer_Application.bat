@echo off
title Lancement de Gestion Eleves Pro
color 0A
cls
echo =========================================================
echo       LANCEMENT DE L'APPLICATION GESTION ELEVES PRO
echo =========================================================
echo.
echo [1/2] Démarrage du serveur backend...
cd /d "%~dp0"

start /b cmd /c "cd backend && node server.js > NUL 2>&1"

timeout /t 2 /nobreak > NUL

set "BROWSER_EXE="

if exist "%PROGRAMFILES%\Google\Chrome\Application\chrome.exe" set "BROWSER_EXE=%PROGRAMFILES%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER_EXE if exist "%PROGRAMFILES(X86)%\Google\Chrome\Application\chrome.exe" set "BROWSER_EXE=%PROGRAMFILES(X86)%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER_EXE if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" set "BROWSER_EXE=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER_EXE if exist "%PROGRAMFILES%\Microsoft\Edge\Application\msedge.exe" set "BROWSER_EXE=%PROGRAMFILES%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER_EXE if exist "%PROGRAMFILES(X86)%\Microsoft\Edge\Application\msedge.exe" set "BROWSER_EXE=%PROGRAMFILES(X86)%\Microsoft\Edge\Application\msedge.exe"

echo [2/2] Lancement de l'application native...
echo =========================================================

if defined BROWSER_EXE (
    start "" "%BROWSER_EXE%" --app=http://localhost:5050 --user-data-dir="%LOCALAPPDATA%\GestionElevesProfile"
) else (
    start http://localhost:5050
)

exit

