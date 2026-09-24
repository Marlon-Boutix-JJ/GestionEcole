@echo off
title Lancement de Gestion Eleves Pro
color 0A
cls
echo =========================================================
echo       LANCEMENT DE L'APPLICATION GESTION ELEVES
echo =========================================================
echo.
echo [1/2] Démarrage du serveur et de l'interface...
cd /d "%~dp0"

start /b cmd /c "cd backend && node server.js > NUL 2>&1"

timeout /t 3 /nobreak > NUL

echo [2/2] Ouverture du navigateur web...
echo Adresse locale : http://localhost:5050
echo =========================================================
start http://localhost:5050

exit
