import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, ShieldCheck } from 'lucide-react';
import InstallPwaButton from './InstallPwaButton';

const Header = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  // Prefer pseudo if available, otherwise "Prenom Nom"
  const displayName = user.pseudo && user.pseudo.trim() !== '' 
    ? user.pseudo 
    : `${user.prenom} ${user.nom}`;

  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="user-badge">
          <div className="user-avatar">{avatarInitial}</div>
          <div className="user-info">
            <div className="user-name">{displayName}</div>
            <div className="user-role" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={13} /> Session Administrateur
            </div>
          </div>
        </div>
      </div>

      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Install PWA / Native Shortcut Button */}
        <InstallPwaButton />

        <button className="btn-logout" onClick={logout} title="Se déconnecter de la session">
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
