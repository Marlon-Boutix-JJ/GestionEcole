@echo off
title Installation du Raccourci App Native
color 0A
cls
echo =========================================================
echo   CREATION DU RACCOURCI BUREAU APPLICATION NATIVE
echo =========================================================
echo.

set SCRIPT_DIR=%~dp0
set ICON_PATH=%SCRIPT_DIR%app-icon.ico
set TARGET_URL=http://localhost:5050

set "BROWSER_EXE="

if exist "%PROGRAMFILES%\Google\Chrome\Application\chrome.exe" set "BROWSER_EXE=%PROGRAMFILES%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER_EXE if exist "%PROGRAMFILES(X86)%\Google\Chrome\Application\chrome.exe" set "BROWSER_EXE=%PROGRAMFILES(X86)%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER_EXE if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" set "BROWSER_EXE=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER_EXE if exist "%PROGRAMFILES%\Microsoft\Edge\Application\msedge.exe" set "BROWSER_EXE=%PROGRAMFILES%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER_EXE if exist "%PROGRAMFILES(X86)%\Microsoft\Edge\Application\msedge.exe" set "BROWSER_EXE=%PROGRAMFILES(X86)%\Microsoft\Edge\Application\msedge.exe"

echo [1/2] Configuration de la fenetre native sans bordures...

echo Set WshShell = CreateObject("WScript.Shell") > create_native_shortcut.vbs
echo desktopPath = WshShell.SpecialFolders("Desktop") >> create_native_shortcut.vbs
echo Set shortcut = WshShell.CreateShortcut(desktopPath ^& "\Gestion Eleves.lnk") >> create_native_shortcut.vbs
echo shortcut.TargetPath = "%BROWSER_EXE%" >> create_native_shortcut.vbs
echo shortcut.Arguments = "--app=%TARGET_URL% --user-data-dir=""%LOCALAPPDATA%\GestionElevesProfile""" >> create_native_shortcut.vbs
echo shortcut.WorkingDirectory = "%SCRIPT_DIR%" >> create_native_shortcut.vbs
echo shortcut.Description = "Application Native de Gestion des Eleves" >> create_native_shortcut.vbs
if exist "%ICON_PATH%" (
    echo shortcut.IconLocation = "%ICON_PATH%" >> create_native_shortcut.vbs
)
echo shortcut.Save >> create_native_shortcut.vbs

cscript //nologo create_native_shortcut.vbs
del create_native_shortcut.vbs

echo.
echo =========================================================
echo [SUCCES] Le raccourci "Gestion Eleves" a ete cree !
echo.
echo - Aucune petite icone Chrome sur le bureau.
echo - Aucune barre d'adresse ni onglet (Fenetre App Native).
echo =========================================================
echo.
pause

