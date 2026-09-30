import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, MonitorCheck, Loader2 } from 'lucide-react';

const triggerAutoDownloadInstaller = () => {
  try {
    const currentOrigin = window.location.href;
    const scriptContent = `@echo off
title Installation de Gestion Eleves Pro
color 0A
cls
echo =========================================================
echo  INSTALLATION DE L'APPLICATION NATIVE GESTION ELEVES PRO
echo =========================================================
echo.
set TARGET_URL=${currentOrigin}
set "BROWSER_EXE="

if exist "%PROGRAMFILES%\\Google\\Chrome\\Application\\chrome.exe" set "BROWSER_EXE=%PROGRAMFILES%\\Google\\Chrome\\Application\\chrome.exe"
if not defined BROWSER_EXE if exist "%PROGRAMFILES(X86)%\\Google\\Chrome\\Application\\chrome.exe" set "BROWSER_EXE=%PROGRAMFILES(X86)%\\Google\\Chrome\\Application\\chrome.exe"
if not defined BROWSER_EXE if exist "%LOCALAPPDATA%\\Google\\Chrome\\Application\\chrome.exe" set "BROWSER_EXE=%LOCALAPPDATA%\\Google\\Chrome\\Application\\chrome.exe"
if not defined BROWSER_EXE if exist "%PROGRAMFILES%\\Microsoft\\Edge\\Application\\msedge.exe" set "BROWSER_EXE=%PROGRAMFILES%\\Microsoft\\Edge\\Application\\msedge.exe"
if not defined BROWSER_EXE if exist "%PROGRAMFILES(X86)%\\Microsoft\\Edge\\Application\\msedge.exe" set "BROWSER_EXE=%PROGRAMFILES(X86)%\\Microsoft\\Edge\\Application\\msedge.exe"

echo [1/2] Configuration du raccourci d'application native...

echo Set WshShell = CreateObject("WScript.Shell") > create_shortcut.vbs
echo desktopPath = WshShell.SpecialFolders("Desktop") >> create_shortcut.vbs
echo Set shortcut = WshShell.CreateShortcut(desktopPath ^& "\\Gestion Eleves Pro.lnk") >> create_shortcut.vbs
if defined BROWSER_EXE (
    echo shortcut.TargetPath = "%BROWSER_EXE%" >> create_shortcut.vbs
    echo shortcut.Arguments = "--app=%TARGET_URL% --user-data-dir=""%%LOCALAPPDATA%%\\GestionElevesProfile""" >> create_shortcut.vbs
) else (
    echo shortcut.TargetPath = "%TARGET_URL%" >> create_shortcut.vbs
)
echo shortcut.WorkingDirectory = "%%LOCALAPPDATA%%" >> create_shortcut.vbs
echo shortcut.Description = "Gestion Eleves Pro - Application Native" >> create_shortcut.vbs
echo shortcut.Save >> create_shortcut.vbs

cscript //nologo create_shortcut.vbs
del create_shortcut.vbs

echo.
echo =========================================================
echo [SUCCES] L'icone d'application "Gestion Eleves Pro" a ete creee sur votre Bureau !
echo.
echo - Aucune barre d'adresse ni onglet (Fenetre App Native).
echo - L'application remplit tout l'ecran comme un vrai logiciel.
echo =========================================================
echo.
timeout /t 3
(goto) 2>nul & del "%~f0"
`;

    const blob = new Blob([scriptContent], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Installer_Gestion_Eleves_Pro.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Auto download failed:', e);
  }
};

const InstallPwaButton = () => {
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    setLoading(true);

    // Trigger automatic download of the Windows Installer Script
    triggerAutoDownloadInstaller();

    // Try Browser PWA Prompt if available
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setToastType('success');
          setToastMessage('Application installée avec succès en mode autonome !');
          setDeferredPrompt(null);
          setLoading(false);
          setTimeout(() => setToastMessage(''), 5000);
          return;
        }
      } catch (e) {}
    }

    // Try Backend Shortcut creation endpoint
    try {
      const res = await fetch('/api/license/install-shortcut', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setToastType('success');
        setToastMessage(data.message || 'Raccourci application native créé sur votre bureau !');
      } else {
        setToastType('success');
        setToastMessage('Le fichier "Installer_Gestion_Eleves_Pro.bat" a été téléchargé ! Ouvrez-le pour ajouter l\'icône sur le bureau.');
      }
    } catch (err) {
      setToastType('success');
      setToastMessage('Le fichier "Installer_Gestion_Eleves_Pro.bat" a été téléchargé ! Ouvrez-le pour créer le raccourci sur le bureau.');
    } finally {
      setLoading(false);
      setTimeout(() => setToastMessage(''), 7000);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        disabled={loading}
        title="Installer l'application sur le bureau en mode plein écran autonome sans barre d'adresse"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '10px',
          fontSize: '0.85rem',
          fontWeight: '700',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          transition: 'all 0.2s ease',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        <span>Installer l'App sur le Bureau</span>
      </button>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999999,
          background: toastType === 'success' ? '#065f46' : '#991b1b',
          color: '#ffffff',
          border: `1px solid ${toastType === 'success' ? '#34d399' : '#f87171'}`,
          borderRadius: '12px',
          padding: '14px 20px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}>
          {toastType === 'success' ? <CheckCircle2 size={20} /> : <MonitorCheck size={20} />}
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
};

export default InstallPwaButton;


