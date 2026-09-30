import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { School, ShieldCheck, User, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const AuthPage = () => {
  const { register, login, loading, authError } = useContext(AuthContext);
  const [isLoginMode, setIsLoginMode] = useState(false);

  // Inscription state
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Connexion state
  const [identifier, setIdentifier] = useState('');

  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (isLoginMode) {
      if (!identifier.trim() || !password) {
        setFormError('Veuillez remplir votre Identifiant et Mot de passe.');
        return;
      }
      try {
        await login({ identifier, password });
      } catch (err) {
        // handled in context
      }
    } else {
      if (!nom.trim() || !prenom.trim() || !password || !confirmPassword) {
        setFormError('Veuillez remplir tous les champs obligatoires (Nom, Prénom, Mot de passe).');
        return;
      }
      if (password !== confirmPassword) {
        setFormError('Les mots de passe ne correspondent pas.');
        return;
      }
      try {
        await register({ nom, prenom, pseudo, password, confirmPassword });
      } catch (err) {
        // handled in context
      }
    }
  };

  return (
    <div style={{
      height: '100vh',
      maxHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top, #14231B 0%, #090D0B 100%)',
      padding: '0.5rem',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <div className="auth-card" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '1rem 1.25rem',
        margin: 'auto',
        boxSizing: 'border-box',
        maxHeight: '98vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div className="auth-header" style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
          <div className="logo-icon" style={{ margin: '0 auto', width: '34px', height: '34px', borderRadius: '8px' }}>
            <School size={20} />
          </div>
          <h2 className="auth-title" style={{ fontSize: '1.15rem', marginTop: '0.25rem', marginBottom: '0.1rem' }}>
            {isLoginMode ? 'Connexion Admin' : 'Création de Compte Admin'}
          </h2>
          <p className="auth-subtitle" style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
            {isLoginMode 
              ? 'Connectez-vous pour accéder au tableau de bord' 
              : 'Initialisez une session administrateur sécurisée'}
          </p>
        </div>

        {(formError || authError) && (
          <div style={{
            background: 'rgba(248, 113, 113, 0.12)',
            border: '1px solid rgba(248, 113, 113, 0.3)',
            color: '#F87171',
            padding: '0.4rem 0.6rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <AlertCircle size={14} />
            <span>{formError || authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLoginMode ? (
            <>
              <div className="form-group" style={{ marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.15rem' }}>Nom *</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.825rem', height: '32px' }}
                  placeholder="Ex: Diallo"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.15rem' }}>Prénom *</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.825rem', height: '32px' }}
                  placeholder="Ex: Amadou"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.15rem' }}>Pseudo (Facultatif)</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.825rem', height: '32px' }}
                  placeholder="Ex: admin_amadou"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.15rem' }}>Mot de passe *</label>
                <input
                  type="password"
                  className="form-input"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.825rem', height: '32px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.15rem' }}>Confirmer le mot de passe *</label>
                <input
                  type="password"
                  className="form-input"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.825rem', height: '32px' }}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group" style={{ marginBottom: '0.6rem' }}>
                <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '0.2rem' }}>Identifiant (Nom ou Pseudo)</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                  placeholder="Entrez votre Nom ou Pseudo"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '0.6rem' }}>
                <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '0.2rem' }}>Mot de passe</label>
                <input
                  type="password"
                  className="form-input"
                  style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: '0.5rem',
              padding: '0.55rem 1rem',
              fontSize: '0.85rem'
            }}
          >
            <span>{loading ? 'Traitement en cours...' : (isLoginMode ? 'Se Connecter' : 'Créer le Compte Admin')}</span>
            <ArrowRight size={15} style={{ marginLeft: '0.35rem' }} />
          </button>
        </form>

        <div className="auth-toggle" style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
          {isLoginMode ? (
            <p>
              Pas encore de compte ?
              <button type="button" onClick={() => { setIsLoginMode(false); setFormError(''); }}>
                Créer un compte Admin
              </button>
            </p>
          ) : (
            <p>
              Déjà un compte administrateur ?
              <button type="button" onClick={() => { setIsLoginMode(true); setFormError(''); }}>
                Se connecter
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
