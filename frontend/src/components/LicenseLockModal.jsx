import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, Copy, KeyRound, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const MASTER_SECRET_KEY = "AGY_SECURE_MASTER_KEY_GESTION_ELEVES_PRO_2026";

function sha256Bytes(bytes) {
  function rightRotate(value, amount) { return (value >>> amount) | (value << (32 - amount)); }
  var K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  var H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];
  var l = bytes.length;
  var bitLen = l * 8;
  var paddedLen = Math.ceil((l + 9) / 64) * 64;
  var padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[l] = 0x80;
  var dataView = new DataView(padded.buffer);
  dataView.setUint32(paddedLen - 4, bitLen & 0xffffffff, false);
  dataView.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
  var W = new Uint32Array(64);
  for (var chunk = 0; chunk < paddedLen; chunk += 64) {
    for (var i = 0; i < 16; i++) {
      W[i] = dataView.getUint32(chunk + i * 4, false);
    }
    for (var i = 16; i < 64; i++) {
      var s0 = rightRotate(W[i - 15], 7) ^ rightRotate(W[i - 15], 18) ^ (W[i - 15] >>> 3);
      var s1 = rightRotate(W[i - 2], 17) ^ rightRotate(W[i - 2], 19) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0;
    }
    var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    for (var i = 0; i < 64; i++) {
      var S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      var ch = (e & f) ^ ((~e) & g);
      var temp1 = (h + S1 + ch + K[i] + W[i]) | 0;
      var S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      var maj = (a & b) ^ (a & c) ^ (b & c);
      var temp2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + temp1) | 0; d = c; c = b; b = a; a = (temp1 + temp2) | 0;
    }
    H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
  }
  var res = new Uint8Array(32);
  var resView = new DataView(res.buffer);
  for (var i = 0; i < 8; i++) {
    resView.setUint32(i * 4, H[i], false);
  }
  return res;
}

function calculateExpectedKey(hwidStr) {
  var encoder = new TextEncoder();
  var key = encoder.encode(MASTER_SECRET_KEY);
  var msg = encoder.encode(hwidStr.trim().toUpperCase());
  var blockSize = 64;
  if (key.length > blockSize) key = sha256Bytes(key);
  var keyPadded = new Uint8Array(blockSize);
  keyPadded.set(key);
  var oPad = new Uint8Array(blockSize);
  var iPad = new Uint8Array(blockSize);
  for (var i = 0; i < blockSize; i++) {
    oPad[i] = keyPadded[i] ^ 0x5c;
    iPad[i] = keyPadded[i] ^ 0x36;
  }
  var innerConcat = new Uint8Array(blockSize + msg.length);
  innerConcat.set(iPad, 0); innerConcat.set(msg, blockSize);
  var innerHash = sha256Bytes(innerConcat);
  var outerConcat = new Uint8Array(blockSize + 32);
  outerConcat.set(oPad, 0); outerConcat.set(innerHash, blockSize);
  var outerHash = sha256Bytes(outerConcat);
  var hex = "";
  for (var i = 0; i < outerHash.length; i++) {
    var b = outerHash[i].toString(16);
    if (b.length === 1) b = "0" + b;
    hex += b;
  }
  const hashHex = hex.toUpperCase();
  return `LIC-${hashHex.substring(0, 4)}-${hashHex.substring(4, 8)}-${hashHex.substring(8, 12)}-${hashHex.substring(12, 16)}`;
}

const getClientFallbackHWID = () => {
  try {
    let stored = localStorage.getItem('app_client_hwid');
    if (!stored) {
      const raw = (navigator.userAgent || '') + (screen.width + 'x' + screen.height) + 'CLIENT_APP';
      let hash = 0;
      for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) - hash) + raw.charCodeAt(i);
        hash |= 0;
      }
      const hex = Math.abs(hash).toString(16).padStart(16, '0').toUpperCase();
      stored = `HWID-${hex.slice(0,4)}-${hex.slice(4,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}`;
      localStorage.setItem('app_client_hwid', stored);
    }
    return stored;
  } catch (e) {
    return 'HWID-OFFLINE-CLIENT-0001';
  }
};

const LicenseLockModal = ({ onActivationSuccess }) => {
  const [isActivated, setIsActivated] = useState(true);
  const [machineId, setMachineId] = useState('');
  const [inputKey, setInputKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [activating, setActivating] = useState(false);
  const [serverOffline, setServerOffline] = useState(false);

  const checkStatus = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      setServerOffline(false);

      // Check client-side stored activation first
      const storedKey = localStorage.getItem('app_activated_key');
      const currentHWID = machineId || getClientFallbackHWID();
      if (storedKey && storedKey === calculateExpectedKey(currentHWID)) {
        setIsActivated(true);
        setLoading(false);
        return;
      }

      const res = await fetch('/api/license/status');
      const data = await res.json();
      
      if (data && data.machineId) {
        setMachineId(data.machineId);
      } else {
        setMachineId(getClientFallbackHWID());
      }

      setIsActivated(!!data.isActivated);
    } catch (err) {
      console.error('License check error:', err);
      const hwid = getClientFallbackHWID();
      setMachineId(hwid);
      
      const storedKey = localStorage.getItem('app_activated_key');
      if (storedKey && storedKey === calculateExpectedKey(hwid)) {
        setIsActivated(true);
      } else {
        setIsActivated(false);
        setServerOffline(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleCopyHWID = () => {
    const hwidToCopy = machineId || getClientFallbackHWID();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(hwidToCopy);
      } else {
        const textElem = document.createElement('textarea');
        textElem.value = hwidToCopy;
        document.body.appendChild(textElem);
        textElem.select();
        document.execCommand('copy');
        document.body.removeChild(textElem);
      }
    } catch (e) {
      // Fallback copy
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleActivate = async (e) => {
    e.preventDefault();
    const formattedKey = inputKey.trim().toUpperCase();
    if (!formattedKey) {
      setErrorMsg('Veuillez saisir votre clé d\'activation.');
      return;
    }

    setActivating(true);
    setErrorMsg('');

    const targetHWID = machineId || getClientFallbackHWID();
    const expectedKey = calculateExpectedKey(targetHWID);

    try {
      const res = await fetch('/api/license/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: formattedKey })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('app_activated_key', formattedKey);
        setIsActivated(true);
        setServerOffline(false);
        if (onActivationSuccess) onActivationSuccess();
        return;
      } else {
        setErrorMsg(data.message || 'Clé invalide pour cet ordinateur.');
        return;
      }
    } catch (err) {
      // Fallback offline validation if backend API call fails
      if (formattedKey === expectedKey) {
        localStorage.setItem('app_activated_key', formattedKey);
        setIsActivated(true);
        setServerOffline(false);
        if (onActivationSuccess) onActivationSuccess();
      } else {
        setErrorMsg('Clé d\'activation invalide pour cet ordinateur.');
      }
    } finally {
      setActivating(false);
    }
  };

  if (loading || isActivated) {
    return null; // Do not block if activated or loading initial status
  }

  const currentHWID = machineId || getClientFallbackHWID();

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
          L'application a détecté un nouvel appareil. Veuillez copier le code ordinateur ci-dessous et le transmettre à l'administrateur pour obtenir votre clé de déverrouillage.
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Code Ordinateur à Envoyer (HWID) :
            </span>
            <button 
              onClick={checkStatus} 
              title="Vérifier le statut"
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
            >
              <RefreshCw size={12} /> Actualiser
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: '700', color: '#10b981', letterSpacing: '1px' }}>
              {currentHWID}
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
            Saisissez la Clé d'Activation Pro Reçue :
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


