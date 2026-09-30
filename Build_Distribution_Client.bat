@echo off
title Preparation du Package Client Compile
color 0B
cls
echo =========================================================
echo  GENERATION DU PACKAGE DE DISTRIBUTION CLIENT (SANS CODE SOURCE)
echo =========================================================
echo.

cd /d "%~dp0"

echo [1/4] Compilation de l'interface React Frontend...
cd frontend
call npm run build
cd ..

echo [2/4] Preparation du dossier client final "Gestion_Eleves_Client_Pack"...
if exist "Gestion_Eleves_Client_Pack" rd /s /q "Gestion_Eleves_Client_Pack"
mkdir "Gestion_Eleves_Client_Pack"

echo [3/4] Copie des fichiers d'execution (Executable/Serveur unifie)...
xcopy "backend" "Gestion_Eleves_Client_Pack\backend" /E /I /H /Y /Q
xcopy "frontend\dist" "Gestion_Eleves_Client_Pack\frontend\dist" /E /I /H /Y /Q
if exist "Gestion_Eleves_Client_Pack\backend\license.json" del /f /q "Gestion_Eleves_Client_Pack\backend\license.json"
if exist "C:\NodeJS\node.exe" copy "C:\NodeJS\node.exe" "Gestion_Eleves_Client_Pack\backend\node.exe" /Y
copy "Lancer_Application.bat" "Gestion_Eleves_Client_Pack\" /Y
copy "Creer_Raccourci_Bureau.bat" "Gestion_Eleves_Client_Pack\" /Y
if exist "app-icon.ico" copy "app-icon.ico" "Gestion_Eleves_Client_Pack\" /Y

echo [4/4] Creation de la notice d'installation client...
(
  echo # Guide d'Installation Client
  echo.
  echo 1. Double-cliquez sur "Creer_Raccourci_Bureau.bat" pour installer l'icone sur le Bureau Windows.
  echo 2. Double-cliquez sur le raccourci "Gestion Eleves" du Bureau pour lancer l'application.
  echo 3. Lors de la premiere ouverture sur un nouvel ordinateur, transmettez le code HWID a l'administrateur pour obtenir votre cle de deverrouillage.
) > "Gestion_Eleves_Client_Pack\LISEZ_MOI_INSTALLATION.txt"

echo.
echo =========================================================
echo [SUCCES] Le package client a ete genere dans le dossier :
echo          Gestion_Eleves_Client_Pack
echo.
echo Remarque : Ce package NE CONTIENT AUCUN CODE SOURCE ORIGINAL (.jsx, src, etc.)
echo            et est pret a etre transmis au client.
echo =========================================================
echo.
pause
