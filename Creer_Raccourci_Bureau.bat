@echo off
title Creation du Raccourci Bureau
color 0B
cls
echo =========================================================
echo    CREATION DU RACCOURCI SUR LE BUREAU WINDOWS
echo =========================================================
echo.

set SCRIPT_DIR=%~dp0
set TARGET_BAT=%SCRIPT_DIR%Lancer_Application.bat
set ICON_PATH=%SCRIPT_DIR%app-icon.ico

echo Set WshShell = CreateObject("WScript.Shell") > create_shortcut.vbs
echo desktopPath = WshShell.SpecialFolders("Desktop") >> create_shortcut.vbs
echo Set shortcut = WshShell.CreateShortcut(desktopPath ^& "\Gestion Eleves.lnk") >> create_shortcut.vbs
echo shortcut.TargetPath = "%TARGET_BAT%" >> create_shortcut.vbs
echo shortcut.WorkingDirectory = "%SCRIPT_DIR%" >> create_shortcut.vbs
echo shortcut.Description = "Application de Gestion des Eleves" >> create_shortcut.vbs
if exist "%ICON_PATH%" (
    echo shortcut.IconLocation = "%ICON_PATH%" >> create_shortcut.vbs
)
echo shortcut.Save >> create_shortcut.vbs

cscript //nologo create_shortcut.vbs
del create_shortcut.vbs

echo.
echo [SUCCESS] Le raccourci "Gestion Eleves" a ete cree avec succes sur votre bureau !
echo.
pause
