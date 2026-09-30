@echo off
title Installation du Raccourci App Native - Gestion Eleves Pro
color 0A
cls
echo =========================================================
echo   CREATION DU RACCOURCI BUREAU APPLICATION NATIVE
echo =========================================================
echo.

set "SCRIPT_DIR=%~dp0"
set "TARGET_BAT=%SCRIPT_DIR%Lancer_Application.bat"
set "ICON_PATH=%SCRIPT_DIR%app-icon.ico"

echo [1/2] Creation du raccourci d'application sur le bureau...

echo Set WshShell = CreateObject("WScript.Shell") > "%TEMP%\create_app_shortcut.vbs"
echo desktopPath = WshShell.SpecialFolders("Desktop") >> "%TEMP%\create_app_shortcut.vbs"
echo Set shortcut = WshShell.CreateShortcut(desktopPath ^& "\Gestion Eleves Pro.lnk") >> "%TEMP%\create_app_shortcut.vbs"
echo shortcut.TargetPath = "%TARGET_BAT%" >> "%TEMP%\create_app_shortcut.vbs"
echo shortcut.WorkingDirectory = "%SCRIPT_DIR%" >> "%TEMP%\create_app_shortcut.vbs"
echo shortcut.Description = "Application Native de Gestion des Eleves Pro" >> "%TEMP%\create_app_shortcut.vbs"
echo if CreateObject("Scripting.FileSystemObject").FileExists("%ICON_PATH%") Then >> "%TEMP%\create_app_shortcut.vbs"
echo     shortcut.IconLocation = "%ICON_PATH%" >> "%TEMP%\create_app_shortcut.vbs"
echo End If >> "%TEMP%\create_app_shortcut.vbs"
echo shortcut.Save >> "%TEMP%\create_app_shortcut.vbs"
echo MsgBox "Le raccourci 'Gestion Eleves Pro' a ete ajoute sur votre Bureau Windows avec succes !", 64, "Gestion Eleves Pro" >> "%TEMP%\create_app_shortcut.vbs"

cscript //nologo "%TEMP%\create_app_shortcut.vbs"
del "%TEMP%\create_app_shortcut.vbs" > NUL 2>&1

echo.
echo =========================================================
echo [SUCCES] Le raccourci "Gestion Eleves Pro" est sur votre bureau !
echo =========================================================
echo.
pause


