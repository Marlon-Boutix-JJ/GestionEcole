import React, { useState, useEffect } from 'react';
import { AlertTriangle, PlusCircle, Trash2, Plus, X, PhoneCall, ShieldAlert } from 'lucide-react';

const AvertissementPage = () => {
  const [warnings, setWarnings] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Warning Form
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [motif, setMotif] = useState('');

  const fetchWarnings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/warnings');
      const data = await res.json();
      setWarnings(data);
    } catch (err) {
      console.error('Erreur chargement avertissements:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error('Erreur chargement élèves:', err);
    }
  };

  useEffect(() => {
    fetchWarnings();
    fetchStudents();
  }, []);

  const handleAddWarning = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !motif.trim()) return;

    try {
      const res = await fetch('/api/warnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudentId,
          motif: motif.trim()
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        setMotif('');
        setSelectedStudentId('');
        fetchWarnings();
      }
    } catch (err) {
      console.error('Erreur ajout avertissement:', err);
    }
  };

  const handleIncrementLevel = async (id) => {
    try {
      const res = await fetch(`/api/warnings/${id}/increment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        fetchWarnings();
      }
    } catch (err) {
      console.error('Erreur augmentation niveau avertissement:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous retirer cet avertissement ?')) return;
    try {
      await fetch(`/api/warnings/${id}`, { method: 'DELETE' });
      fetchWarnings();
    } catch (err) {
      console.error('Erreur suppression sanction:', err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <AlertTriangle size={28} style={{ color: 'var(--accent-amber)' }} />
            <span>Gestion de la Discipline & Avertissements (AV Niveau 1, 2, 3)</span>
          </h1>
          <p className="page-subtitle">Suivi progressif des avertissements disciplinaires et convocations au conseil de classe</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <PlusCircle size={18} />
          <span>Ajouter un Élève en Avertissement (Niveau 1)</span>
        </button>
      </div>

      <div className="card-panel">
        <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          💡 <strong>Fonctionnement des Niveaux d'Avertissement :</strong><br />
          - <strong>Ajout de l'élève</strong> = <span style={{ color: 'var(--accent-amber)', fontWeight: 'bold' }}>AV Niveau 1</span><br />
          - <strong>1er Clic sur le bouton +</strong> = <span style={{ color: '#F97316', fontWeight: 'bold' }}>AV Niveau 2</span><br />
          - <strong>2nd Clic sur le bouton + (3ème fois)</strong> = <span style={{ color: '#EF4444', fontWeight: 'bold' }}>AV Niveau 3 (Conseil de classe & Appel au parent)</span>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement du registre...</div>
        ) : warnings.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Aucun avertissement enregistré. La discipline est exemplaire !
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Matricule</th>
                  <th>Nom & Prénom</th>
                  <th>Classe</th>
                  <th>Niveau d'Avertissement</th>
                  <th>Motif de la Sanction</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {warnings.map((w) => {
                  const level = w.niveau || (w.type === 'AV Niveau 3 (Conseil de classe & Appel Parents)' ? 3 : w.type === 'AV Niveau 2' ? 2 : 1);
                  return (
                    <tr key={w._id}>
                      <td style={{ fontSize: '0.85rem' }}>{new Date(w.dateSanction || w.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td><span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--primary)' }}>{w.matricule}</span></td>
                      <td style={{ fontWeight: '600' }}>{w.studentName}</td>
                      <td><span className="badge badge-green">{w.classe}</span></td>
                      <td>
                        {level === 1 && (
                          <span className="badge badge-amber" style={{ fontWeight: '800' }}>
                            AV Niveau 1
                          </span>
                        )}
                        {level === 2 && (
                          <span className="badge" style={{ background: 'rgba(249, 115, 22, 0.2)', color: '#F97316', border: '1px solid #F97316', fontWeight: '800' }}>
                            AV Niveau 2
                          </span>
                        )}
                        {level >= 3 && (
                          <span className="badge badge-red" style={{ fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.4rem 0.75rem' }}>
                            <PhoneCall size={14} />
                            <span>AV Niveau 3 (Conseil de classe & Appel Parents)</span>
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>{w.motif}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          {/* Bouton Petit Plus pour augmenter le niveau d'avertissement */}
                          <button
                            className="btn-primary"
                            style={{ 
                              padding: '0.35rem 0.65rem', 
                              fontSize: '0.8rem', 
                              background: level >= 3 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(16, 185, 129, 0.2)',
                              color: level >= 3 ? 'var(--text-muted)' : 'var(--primary)',
                              border: level >= 3 ? '1px solid var(--border-color)' : '1px solid var(--primary)',
                              cursor: level >= 3 ? 'not-allowed' : 'pointer'
                            }}
                            onClick={() => level < 3 && handleIncrementLevel(w._id)}
                            disabled={level >= 3}
                            title={level >= 3 ? 'Niveau maximal atteint (Niveau 3)' : `Augmenter le niveau d'avertissement (Niveau ${level} ➔ Niveau ${level + 1})`}
                          >
                            <Plus size={16} />
                            <span>+</span>
                          </button>

                          {/* Bouton Supprimer */}
                          <button
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.6rem', color: '#F87171', borderColor: 'rgba(248, 113, 113, 0.3)' }}
                            onClick={() => handleDelete(w._id)}
                            title="Retirer la sanction"
                          >
                            <Trash2 size={15} />
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

      {/* Modal Notification / Nouvel Avertissement (Niveau 1) */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="auth-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="page-header" style={{ marginBottom: '1.25rem' }}>
              <h3 className="page-title" style={{ fontSize: '1.2rem', color: 'var(--accent-amber)' }}>
                Ajouter un Élève en Avertissement (Niveau 1)
              </h3>
              <button className="btn-secondary" onClick={() => setShowAddModal(false)} style={{ padding: '0.35rem' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddWarning}>
              <div className="form-group">
                <label className="form-label">Sélectionner l'Élève *</label>
                <select
                  className="form-input"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  required
                >
                  <option value="">-- Choisir un élève --</option>
                  {students.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.nom} {st.prenom} ({st.matricule} - {st.classe})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Niveau Initial</label>
                <input type="text" className="form-input" value="AV Niveau 1 (Premier avertissement)" disabled style={{ opacity: 0.8 }} />
              </div>

              <div className="form-group">
                <label className="form-label">Motif Détaillé de l'Avertissement *</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Ex: Bavardages répétés, retards non justifiés, indiscipline en classe..."
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', background: 'var(--accent-amber)', color: '#090D0B' }}>
                Ajouter en AV Niveau 1
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvertissementPage;
