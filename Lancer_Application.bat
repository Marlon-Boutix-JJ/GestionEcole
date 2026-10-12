@echo off
cd /d "%~dp0"

set "NODE_BIN=node"
if exist "%~dp0backend\node.exe" set "NODE_BIN=%~dp0backend\node.exe"
if exist "%~dp0node.exe" set "NODE_BIN=%~dp0node.exe"

:: Vérifier si le serveur backend écoute déjà sur le port 5050
netstat -ano | findstr ":5050 " > NUL
if errorlevel 1 (
    start /b cmd /c "cd backend && "%NODE_BIN%" server.js > NUL 2>&1"
    :: Attente minimale immédiate uniquement au premier démarrage à froid
    ping 127.0.0.1 -n 2 > NUL
)

set "BROWSER_EXE="
if exist "%PROGRAMFILES%\Google\Chrome\Application\chrome.exe" set "BROWSER_EXE=%PROGRAMFILES%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER_EXE if exist "%PROGRAMFILES(X86)%\Google\Chrome\Application\chrome.exe" set "BROWSER_EXE=%PROGRAMFILES(X86)%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER_EXE if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" set "BROWSER_EXE=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER_EXE if exist "%PROGRAMFILES%\Microsoft\Edge\Application\msedge.exe" set "BROWSER_EXE=%PROGRAMFILES%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER_EXE if exist "%PROGRAMFILES(X86)%\Microsoft\Edge\Application\msedge.exe" set "BROWSER_EXE=%PROGRAMFILES(X86)%\Microsoft\Edge\Application\msedge.exe"

if defined BROWSER_EXE (
    start "" "%BROWSER_EXE%" --app=http://localhost:5050 --user-data-dir="%LOCALAPPDATA%\GestionElevesProfile"
) else (
    start http://localhost:5050
)

exit
