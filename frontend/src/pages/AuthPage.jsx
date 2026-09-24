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
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top, #14231B 0%, #090D0B 100%)',
      padding: '2rem 1rem'
    }}>
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-icon" style={{ margin: '0 auto', width: '48px', height: '48px' }}>
            <School size={28} />
          </div>
          <h2 className="auth-title">
            {isLoginMode ? 'Connexion Admin' : 'Création de Compte Admin'}
          </h2>
          <p className="auth-subtitle">
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
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{formError || authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLoginMode ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Nom *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Diallo"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Prénom *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Amadou"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Pseudo (Facultatif)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: admin_amadou"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mot de passe *</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirmer le mot de passe *</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Identifiant (Nom ou Pseudo)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Entrez votre Nom ou Pseudo"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mot de passe</label>
                <input
                  type="password"
                  className="form-input"
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
            style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.85rem' }}
          >
            <span>{loading ? 'Traitement en cours...' : (isLoginMode ? 'Se Connecter' : 'Créer le Compte Admin')}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-toggle">
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
