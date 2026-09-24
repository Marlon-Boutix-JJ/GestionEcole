import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, Copy, KeyRound, AlertTriangle, CheckCircle } from 'lucide-react';

const LicenseLockModal = ({ onActivationSuccess }) => {
  const [isActivated, setIsActivated] = useState(true);
  const [machineId, setMachineId] = useState('');
  const [inputKey, setInputKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [activating, setActivating] = useState(false);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/license/status');
      const data = await res.json();
      setIsActivated(data.isActivated);
      setMachineId(data.machineId || '');
    } catch (err) {
      console.error('License check error:', err);
      // In case server is starting
      setIsActivated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleCopyHWID = () => {
    if (!machineId) return;
    navigator.clipboard.writeText(machineId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleActivate = async (e) => {
    e.preventDefault();
    if (!inputKey.trim()) {
      setErrorMsg('Veuillez saisir votre clé d\'activation.');
      return;
    }

    setActivating(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/license/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: inputKey })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Clé invalide pour cet ordinateur.');
        return;
      }

      setIsActivated(true);
      if (onActivationSuccess) onActivationSuccess();
    } catch (err) {
      setErrorMsg('Erreur de connexion au serveur backend.');
    } finally {
      setActivating(false);
    }
  };

  if (loading || isActivated) {
    return null; // Do not block if activated or loading initial status
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: 'rgba(5, 12, 22, 0.95)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        background: '#0f172a',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        color: '#f8fafc',
        textAlign: 'center'
      }}>
        {/* Lock Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 16px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#10b981'
        }}>
          <Lock size={32} />
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>
          Licence Requise pour cet Ordinateur
        </h2>
        
        <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.5', marginBottom: '24px' }}>
          L'application a détecté un nouvel appareil. Veuillez transmettre l'identifiant matériel ci-dessous à l'administrateur pour obtenir votre clé de déverrouillage.
        </p>

        {/* HWID Card */}
        <div style={{
          background: '#020617',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '20px',
          textAlign: 'left'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Code Ordinateur (HWID) :
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: '700', color: '#10b981', letterSpacing: '1px' }}>
              {machineId}
            </span>
            <button
              onClick={handleCopyHWID}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: copied ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                color: copied ? '#000' : '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Copy size={14} />
              {copied ? 'Copié !' : 'Copier'}
            </button>
          </div>
        </div>

        {/* Activation Form */}
        <form onSubmit={handleActivate} style={{ textAlign: 'left' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
            Clé d'Activation Pro :
          </label>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <input
              type="text"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="LIC-XXXX-XXXX-XXXX-XXXX"
              style={{
                width: '100%',
                padding: '12px 14px 12px 40px',
                background: '#020617',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                color: '#fff',
                fontFamily: 'monospace',
                fontSize: '1rem',
                letterSpacing: '1px',
                outline: 'none'
              }}
            />
            <KeyRound size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          </div>

          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#f87171',
              fontSize: '0.85rem',
              marginBottom: '16px'
            }}>
              <AlertTriangle size={16} />
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={activating}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: activating ? 'not-allowed' : 'pointer',
              opacity: activating ? 0.7 : 1,
              transition: 'all 0.2s',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
            }}
          >
            {activating ? 'Vérification en cours...' : 'Activer l\'Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LicenseLockModal;
