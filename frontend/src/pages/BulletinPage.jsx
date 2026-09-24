import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Edit3, 
  X, 
  Award, 
  Plus, 
  Trash2, 
  Save,
  GraduationCap,
  FlaskConical,
  BookOpen,
  Briefcase
} from 'lucide-react';

const BulletinPage = () => {
  const [bulletins, setBulletins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeClassTab, setActiveClassTab] = useState('3ème');
  const [selectedBulletin, setSelectedBulletin] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const classesList = [
    { name: '3ème', icon: GraduationCap },
    { name: 'Terminale S', icon: FlaskConical },
    { name: 'Terminale L', icon: BookOpen },
    { name: 'Terminale OSE', icon: Briefcase }
  ];

  const fetchBulletins = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bulletins');
      const data = await res.json();
      setBulletins(data);
    } catch (err) {
      console.error('Erreur chargement bulletins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBulletins();
  }, []);

  // Recalcul en temps réel de la moyenne générale d'un élève
  const calculateMoyenne = (matieresList) => {
    if (!matieresList || matieresList.length === 0) return 0;
    let totPts = 0;
    let totCoef = 0;
    matieresList.forEach(m => {
      const n = Number(m.note) || 0;
      const c = Number(m.coef) || 1;
      totPts += n * c;
      totCoef += c;
    });
    return totCoef > 0 ? parseFloat((totPts / totCoef).toFixed(2)) : 0;
  };

  // Enregistrer les modifications du bulletin
  const handleUpdateNotes = async (e) => {
    if (e) e.preventDefault();
    if (!selectedBulletin) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/bulletins/${selectedBulletin._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matieres: selectedBulletin.matieres,
          appreciationGenerale: selectedBulletin.appreciationGenerale,
          trimestre: selectedBulletin.trimestre
        })
      });
      const updatedData = await res.json();
      if (res.ok) {
        setSelectedBulletin(updatedData);
        setIsEditing(false);
        fetchBulletins(); // Recharge et recalcul automatique des rangs avec ex-æquo
      } else {
        alert(updatedData.message || "Erreur lors de la mise à jour.");
      }
    } catch (err) {
      console.error('Erreur mise à jour bulletin:', err);
      alert("Erreur de connexion au serveur.");
    } finally {
      setIsSaving(false);
    }
  };

  // Modification d'un champ d'une matière
  const handleMatiereChange = (index, field, value) => {
    const updated = [...selectedBulletin.matieres];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedBulletin({ ...selectedBulletin, matieres: updated });
  };

  // Bouton unique "Ajout matière" : ajoute une nouvelle ligne de matière et passe en mode édition
  const handleAddMatiereRow = () => {
    const newRow = {
      nom: 'Nouvelle Matière',
      note: 10,
      coef: 2,
      appreciation: 'Satisfaisant'
    };
    const updated = [...(selectedBulletin.matieres || []), newRow];
    setSelectedBulletin({ ...selectedBulletin, matieres: updated });
    if (!isEditing) setIsEditing(true);
  };

  // Supprimer une ligne de matière
  const handleRemoveMatiereRow = (index) => {
    if (selectedBulletin.matieres.length <= 1) {
      alert("Le bulletin doit contenir au moins une matière.");
      return;
    }
    const updated = selectedBulletin.matieres.filter((_, idx) => idx !== index);
    setSelectedBulletin({ ...selectedBulletin, matieres: updated });
  };

  // Filtrer les bulletins spécifiquement pour la page de la classe active
  const classBulletins = bulletins.filter(b => b.classe === activeClassTab);

  // Statistiques de la classe active
  const classAverages = classBulletins.map(b => Number(b.moyenneGenerale) || 0);
  const classGeneralAverage = classAverages.length > 0 
    ? (classAverages.reduce((a, b) => a + b, 0) / classAverages.length).toFixed(2)
    : '0.00';
  const bestAverage = classAverages.length > 0 ? Math.max(...classAverages).toFixed(2) : '0.00';
  const lowestAverage = classAverages.length > 0 ? Math.min(...classAverages).toFixed(2) : '0.00';

  return (
    <div>
      {/* En-tête de la Page */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FileText size={28} style={{ color: 'var(--primary)' }} />
            <span>Bulletins de Notes Scolaires</span>
          </h1>
          <p className="page-subtitle">
            Pages de bulletin séparées par classe avec affichage de la moyenne générale de classe et rangs automatiques
          </p>
        </div>
      </div>

      {/* SÉPARATION PAR PAGES DE CLASSE (PAS DE LISTE DÉROULANTE) */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {classesList.map((cls) => {
          const isActive = activeClassTab === cls.name;
          const Icon = cls.icon;
          return (
            <button
              key={cls.name}
              type="button"
              onClick={() => setActiveClassTab(cls.name)}
              className={isActive ? 'btn-primary' : 'btn-secondary'}
              style={{
                padding: '0.65rem 1.25rem',
                fontSize: '0.95rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isActive ? '0 0 14px rgba(16, 185, 129, 0.35)' : 'none',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
            >
              <Icon size={18} />
              <span>Page Bulletin {cls.name}</span>
            </button>
          );
        })}
      </div>

      {/* PANNEAU STATISTIQUES MOYENNE GÉNÉRALE DE LA CLASSE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div className="card-panel" style={{ padding: '1.25rem', margin: 0, borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
            Moyenne Générale ({activeClassTab})
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={22} />
            <span>{classGeneralAverage} / 20</span>
          </div>
        </div>

        <div className="card-panel" style={{ padding: '1.25rem', margin: 0, borderLeft: '4px solid var(--accent-amber)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', textTransform: 'uppercase', fontWeight: '700' }}>
            Meilleure Moyenne ({activeClassTab})
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-amber)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={22} />
            <span>{bestAverage} / 20</span>
          </div>
        </div>

        <div className="card-panel" style={{ padding: '1.25rem', margin: 0, borderLeft: '4px solid #6366F1' }}>
          <div style={{ fontSize: '0.8rem', color: '#6366F1', textTransform: 'uppercase', fontWeight: '700' }}>
            Moyenne la Plus Basse
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#6366F1', marginTop: '0.3rem' }}>
            {lowestAverage} / 20
          </div>
        </div>

        <div className="card-panel" style={{ padding: '1.25rem', margin: 0, borderLeft: '4px solid var(--text-main)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
            Effectif Évalué
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '0.3rem' }}>
            {classBulletins.length} élève(s)
          </div>
        </div>
      </div>

      {/* TABLEAU DES BULLETINS DE LA PAGE DE CLASSE */}
      <div className="card-panel">
        <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)' }}>
            Page des Bulletins — Classe de {activeClassTab}
          </h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
            <Award size={18} />
            <span>Rang automatique décroissant (Ex-æquo gérés)</span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement de la page bulletin...</div>
        ) : classBulletins.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Aucun bulletin enregistré pour la classe de {activeClassTab}.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Rang</th>
                  <th>Matricule</th>
                  <th>Nom & Prénom</th>
                  <th>Trimestre</th>
                  <th>Moyenne Générale de l'Élève</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classBulletins.map((b) => {
                  const isFirst = b.rang && b.rang.startsWith('1er');

                  return (
                    <tr key={b._id}>
                      <td>
                        <span 
                          className={`badge ${isFirst ? 'badge-amber' : 'badge-green'}`}
                          style={{ 
                            fontWeight: '800', 
                            fontSize: '0.85rem',
                            padding: '0.4rem 0.8rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {isFirst && <Award size={16} />}
                          <span>{b.rang || 'NC'}</span>
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--primary)' }}>
                          {b.matricule}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600' }}>{b.studentName}</td>
                      <td>{b.trimestre}</td>
                      <td style={{ 
                        fontWeight: '800', 
                        fontSize: '1rem',
                        color: b.moyenneGenerale >= 14 ? 'var(--primary)' : b.moyenneGenerale >= 10 ? 'var(--accent-amber)' : 'var(--accent-red)' 
                      }}>
                        {b.moyenneGenerale} / 20
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            className="btn-primary"
                            style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', gap: '0.4rem' }}
                            onClick={() => { setSelectedBulletin(b); setIsEditing(false); }}
                          >
                            <FileText size={16} />
                            <span>Consulter / Éditer</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL : VISUALISATION & ÉDITION DU BULLETIN ÉLÈVE */}
      {selectedBulletin && (
        <div className="modal-overlay" onClick={() => setSelectedBulletin(null)}>
          <div className="auth-card" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            
            {/* Header Modal */}
            <div className="page-header" style={{ marginBottom: '1rem' }}>
              <div>
                <h3 className="page-title" style={{ fontSize: '1.25rem' }}>
                  <FileText size={22} style={{ color: 'var(--primary)' }} />
                  <span>Bulletin Scolaire - {selectedBulletin.studentName}</span>
                </h3>
                <p className="page-subtitle" style={{ color: 'var(--primary)', fontFamily: 'monospace', fontWeight: '700' }}>
                  Matricule : {selectedBulletin.matricule} ({selectedBulletin.classe}) — Rang : {selectedBulletin.rang}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Bouton unique "Ajout matière" */}
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleAddMatiereRow}
                  style={{ 
                    padding: '0.45rem 0.85rem', 
                    fontSize: '0.85rem', 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Ajouter une nouvelle ligne de matière au bulletin"
                >
                  <Plus size={16} />
                  <span>Ajout matière</span>
                </button>

                {/* Bouton "Modification du bulletin" juste à côté */}
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsEditing(!isEditing)}
                  style={{ 
                    padding: '0.45rem 0.85rem', 
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Activer la modification du bulletin"
                >
                  <Edit3 size={16} />
                  <span>Modification du bulletin</span>
                </button>

                {/* Bouton Imprimer */}
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => window.print()}
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                >
                  <Printer size={16} />
                  <span>Imprimer</span>
                </button>

                <button className="btn-secondary" onClick={() => setSelectedBulletin(null)} style={{ padding: '0.4rem' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ background: 'var(--bg-dark)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              
              {/* En-tête des informations de l'élève */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1.15rem', color: 'var(--text-main)' }}>{selectedBulletin.studentName}</div>
                  <div style={{ color: 'var(--primary)', fontFamily: 'monospace', fontWeight: '700', fontSize: '0.9rem' }}>
                    Matricule: {selectedBulletin.matricule}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', color: 'var(--text-main)' }}>Classe de {selectedBulletin.classe}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{selectedBulletin.trimestre}</div>
                </div>
              </div>

              {/* MODE APERÇU DU BULLETIN */}
              {!isEditing ? (
                <>
                  <div className="table-responsive" style={{ marginBottom: '1.25rem' }}>
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Matière</th>
                          <th style={{ textAlign: 'center' }}>Note (/20)</th>
                          <th style={{ textAlign: 'center' }}>Coef</th>
                          <th>Appréciation Professeur</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBulletin.matieres && selectedBulletin.matieres.map((m, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: '700' }}>{m.nom}</td>
                            <td style={{ textAlign: 'center', fontWeight: '800', fontSize: '0.95rem', color: m.note >= 14 ? 'var(--primary)' : m.note >= 10 ? 'var(--text-main)' : 'var(--accent-red)' }}>
                              {m.note}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: '600' }}>{m.coef}</td>
                            <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{m.appreciation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Panneau Synthèse Moyenne & Rang Décroissant avec Ex-æquo */}
                  <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Moyenne Générale de l'Élève</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.2rem' }}>
                        {selectedBulletin.moyenneGenerale} / 20
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Rang Automatique (Décroissant)</div>
                      <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--accent-amber)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <Award size={22} />
                        <span>{selectedBulletin.rang}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.25rem', fontSize: '0.9rem', background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <strong style={{ color: 'var(--primary)' }}>Appréciation Générale du Conseil :</strong>
                    <p style={{ color: 'var(--text-main)', marginTop: '0.35rem', fontStyle: 'italic', lineHeight: '1.5' }}>
                      "{selectedBulletin.appreciationGenerale || 'Bilan très positif. Poursuivez vos efforts.'}"
                    </p>
                  </div>
                </>
              ) : (
                /* MODE MODIFICATION DU BULLETIN ÉLÈVE */
                <form onSubmit={handleUpdateNotes}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)' }}>
                      Matières, Coefficients et Appréciations du Bulletin :
                    </span>
                    
                    {/* Bouton unique "Ajout matière" dans le formulaire */}
                    <button
                      type="button"
                      onClick={handleAddMatiereRow}
                      className="btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', color: 'var(--primary)', borderColor: 'var(--primary)', gap: '4px' }}
                    >
                      <Plus size={15} />
                      <span>Ajout matière</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                    {selectedBulletin.matieres && selectedBulletin.matieres.map((m, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '2fr 1fr 1fr 2fr auto', 
                          gap: '0.5rem', 
                          alignItems: 'center',
                          background: 'var(--bg-card)',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Matière</label>
                          <input
                            type="text"
                            className="form-input"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                            value={m.nom}
                            onChange={(e) => handleMatiereChange(idx, 'nom', e.target.value)}
                            placeholder="Matière"
                            required
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Note (/20)</label>
                          <input
                            type="number"
                            step="0.25"
                            min="0"
                            max="20"
                            className="form-input"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', fontWeight: '700' }}
                            value={m.note}
                            onChange={(e) => handleMatiereChange(idx, 'note', e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Coef</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            className="form-input"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                            value={m.coef}
                            onChange={(e) => handleMatiereChange(idx, 'coef', e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Appréciation</label>
                          <input
                            type="text"
                            className="form-input"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                            value={m.appreciation}
                            onChange={(e) => handleMatiereChange(idx, 'appreciation', e.target.value)}
                            placeholder="Appréciation"
                          />
                        </div>

                        <div style={{ alignSelf: 'flex-end', paddingBottom: '2px' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveMatiereRow(idx)}
                            style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: 'none', padding: '0.45rem', borderRadius: '6px', cursor: 'pointer' }}
                            title="Supprimer cette matière"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Aperçu Moyenne Calculée */}
                  <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>Moyenne Prévisionnelle de l'Élève :</span>
                    <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)' }}>
                      {calculateMoyenne(selectedBulletin.matieres)} / 20
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Appréciation Générale du Conseil</label>
                    <textarea
                      className="form-input"
                      rows={2}
                      value={selectedBulletin.appreciationGenerale || ''}
                      onChange={(e) => setSelectedBulletin({ ...selectedBulletin, appreciationGenerale: e.target.value })}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={isSaving}
                    style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem' }}
                  >
                    <Save size={18} />
                    <span>{isSaving ? 'Enregistrement en cours...' : 'Enregistrer les modifications du bulletin'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulletinPage;
