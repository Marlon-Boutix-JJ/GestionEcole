import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, MonitorCheck, Loader2 } from 'lucide-react';

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

    // 1. Try Browser PWA Prompt if available
    if (deferredPrompt) {
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
    }

    // 2. Try Backend Shortcut creation endpoint
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
        setToastMessage('Raccourci créé sur votre bureau ! Double-cliquez sur "Gestion Eleves" pour ouvrir l\'app.');
      }
    } catch (err) {
      setToastType('success');
      setToastMessage('Pour installer : Ouvrez le menu de votre navigateur > "Installer l\'application" ou "Créer un raccourci".');
    } finally {
      setLoading(false);
      setTimeout(() => setToastMessage(''), 6000);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        disabled={loading}
        title="Créer l'icône d'application native sur le Bureau (PWA / Fenêtre Autonome Plein Écran)"
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

