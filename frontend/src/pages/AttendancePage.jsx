import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CalendarX, 
  UserX, 
  PlusCircle, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  X, 
  Filter, 
  AlertCircle,
  FileText
} from 'lucide-react';

const AttendancePage = () => {
  const [activeTab, setActiveTab] = useState('Absence'); // 'Absence' ou 'Retard'
  const [selectedClass, setSelectedClass] = useState('Toutes');
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [studentId, setStudentId] = useState('');
  const [dateEvent, setDateEvent] = useState(new Date().toISOString().split('T')[0]);
  const [duree, setDuree] = useState('1 heure');
  const [matiere, setMatiere] = useState('Mathématiques');
  const [justifie, setJustifie] = useState(false);
  const [motif, setMotif] = useState('');

  const classesList = ['Toutes', '3ème', 'Terminale S', 'Terminale L', 'Terminale OSE'];

  const fetchRecords = async () => {
    setLoading(true);
    try {
      let url = `/api/attendance?type=${activeTab}`;
      if (selectedClass !== 'Toutes') {
        url += `&classe=${encodeURIComponent(selectedClass)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.error('Erreur chargement présences:', err);
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
    fetchRecords();
    fetchStudents();
  }, [activeTab, selectedClass]);

  // Adjust default duration based on active tab
  useEffect(() => {
    if (activeTab === 'Absence') {
      setDuree('1 heure');
    } else {
      setDuree('15 min');
    }
  }, [activeTab]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!studentId) return;

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          type: activeTab,
          dateEvent,
          duree,
          matiere,
          justifie,
          motif: motif.trim() || 'Non spécifié'
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        setMotif('');
        setStudentId('');
        fetchRecords();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Erreur lors de l\'enregistrement.');
      }
    } catch (err) {
      console.error('Erreur création:', err);
    }
  };

  const handleToggleJustify = async (record) => {
    try {
      const res = await fetch(`/api/attendance/${record._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ justifie: !record.justifie })
      });
      if (res.ok) {
        fetchRecords();
      }
    } catch (err) {
      console.error('Erreur toggle justification:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette entrée ?')) return;
    try {
      await fetch(`/api/attendance/${id}`, { method: 'DELETE' });
      fetchRecords();
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  // KPIs
  const totalCount = records.length;
  const nonJustifies = records.filter(r => !r.justifie).length;
  const justifies = records.filter(r => r.justifie).length;

  return (
    <div>
      {/* IMPRESSION : ENTÊTE DOCUMENT COMPLÈTE */}
      <div className="print-only">
        <div className="print-header">
          <h2>RÉPUBLIQUE DU SÉNÉGAL</h2>
          <h3>MINISTÈRE DE L'ÉDUCATION NATIONALE</h3>
          <h2 style={{ marginTop: '10px', textDecoration: 'underline' }}>
            REGISTRE OFFICIEL DES {activeTab === 'Absence' ? 'ABSENCES' : 'RETARDS'} — CLASSE : {selectedClass.toUpperCase()}
          </h2>
          <p>
            Année Scolaire : 2025 - 2026 | Total : {totalCount} {activeTab === 'Absence' ? 'Absence(s)' : 'Retard(s)'} ({nonJustifies} non justifié(s)) | Date : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '35px' }}>N°</th>
              <th>Date</th>
              <th>Matricule</th>
              <th>Élève</th>
              <th>Classe</th>
              <th>Durée</th>
              <th>Matière</th>
              <th>Statut</th>
              <th>Motif</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={r._id}>
                <td style={{ textAlign: 'center' }}>{i + 1}</td>
                <td>{new Date(r.dateEvent).toLocaleDateString('fr-FR')}</td>
                <td style={{ fontWeight: 'bold' }}>{r.matricule}</td>
                <td style={{ fontWeight: 'bold' }}>{r.studentName}</td>
                <td>{r.classe}</td>
                <td>{r.duree}</td>
                <td>{r.matiere}</td>
                <td>{r.justifie ? 'JUSTIFIÉ' : 'NON JUSTIFIÉ'}</td>
                <td>{r.motif}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="print-footer-signatures">
          <div className="print-signature-box">
            <div>Le Surveillant Général</div>
            <div className="print-signature-line">Signature & Date</div>
          </div>
          <div className="print-signature-box">
            <div>Le Proviseur / Directeur</div>
            <div className="print-signature-line">Signature & Cachet</div>
          </div>
        </div>
      </div>

      {/* EN-TÊTE ÉCRAN */}
      <div className="page-header no-print">
        <div>
          <h1 className="page-title">
            {activeTab === 'Absence' ? (
              <CalendarX size={28} style={{ color: 'var(--accent-red)' }} />
            ) : (
              <Clock size={28} style={{ color: 'var(--accent-amber)' }} />
            )}
            <span>Gestion des Absences & Retards Séparée</span>
          </h1>
          <p className="page-subtitle">Suivi assidu de la ponctualité et des présences scolaires</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={() => window.print()}>
            <Printer size={18} style={{ color: 'var(--primary)' }} />
            <span>Imprimer la Liste</span>
          </button>

          <button 
            className="btn-primary" 
            onClick={() => setShowAddModal(true)}
            style={{
              background: activeTab === 'Absence' ? 'var(--accent-red)' : 'var(--accent-amber)',
              color: '#090D0B'
            }}
          >
            <PlusCircle size={18} />
            <span>Signaler un {activeTab}</span>
          </button>
        </div>
      </div>

      {/* SÉLECTEUR SEPARÉ : ONGLET ABSENCES vs RETARDS */}
      <div className="no-print" style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('Absence')}
          style={{
            flex: 1,
            padding: '0.9rem',
            borderRadius: '12px',
            border: activeTab === 'Absence' ? '2px solid var(--accent-red)' : '1px solid var(--border-color)',
            background: activeTab === 'Absence' ? 'rgba(248, 113, 113, 0.15)' : 'var(--bg-card)',
            color: activeTab === 'Absence' ? 'var(--accent-red)' : 'var(--text-secondary)',
            fontWeight: '800',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <CalendarX size={22} />
          <span>🚫 Registre des Absences ({activeTab === 'Absence' ? totalCount : '—'})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('Retard')}
          style={{
            flex: 1,
            padding: '0.9rem',
            borderRadius: '12px',
            border: activeTab === 'Retard' ? '2px solid var(--accent-amber)' : '1px solid var(--border-color)',
            background: activeTab === 'Retard' ? 'rgba(251, 191, 36, 0.15)' : 'var(--bg-card)',
            color: activeTab === 'Retard' ? 'var(--accent-amber)' : 'var(--text-secondary)',
            fontWeight: '800',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Clock size={22} />
          <span>⏰ Registre des Retards ({activeTab === 'Retard' ? totalCount : '—'})</span>
        </button>
      </div>

      {/* FILTRE PAR CLASSE & KPI COUNTERS */}
      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {/* KPI Total */}
        <div className="card-panel" style={{ padding: '1rem 1.25rem', marginBottom: 0 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>Total {activeTab}s</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)' }}>{totalCount}</div>
        </div>

        {/* KPI Non Justifiées */}
        <div className="card-panel" style={{ padding: '1rem 1.25rem', marginBottom: 0, borderLeft: '4px solid var(--accent-red)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-red)', fontWeight: '700' }}>Injustifié(e)s</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-red)' }}>{nonJustifies}</div>
        </div>

        {/* KPI Justifiées */}
        <div className="card-panel" style={{ padding: '1rem 1.25rem', marginBottom: 0, borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700' }}>Justifié(e)s</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary)' }}>{justifies}</div>
        </div>

        {/* Filtrage par classe */}
        <div className="card-panel" style={{ padding: '1rem 1.25rem', marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.3rem' }}>Filtrer par Classe</div>
          <select 
            className="form-input" 
            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {classesList.map(c => (
              <option key={c} value={c}>{c === 'Toutes' ? 'Toutes les classes' : `Classe de ${c}`}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLEAU DES ENREGISTREMENTS (ÉCRAN) */}
      <div className="card-panel no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} style={{ color: activeTab === 'Absence' ? 'var(--accent-red)' : 'var(--accent-amber)' }} />
            <span>Registre des {activeTab}s ({selectedClass === 'Toutes' ? 'Toutes les classes' : selectedClass})</span>
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            💡 Cliquez sur le badge statut pour basculer entre Justifié / Non Justifié
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement des données...</div>
        ) : records.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Aucun {activeTab.toLowerCase()} enregistré pour {selectedClass === 'Toutes' ? 'toutes les classes' : `la classe de ${selectedClass}`}.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Matricule</th>
                  <th>Élève</th>
                  <th>Classe</th>
                  <th>Durée</th>
                  <th>Matière</th>
                  <th>Statut Justification</th>
                  <th>Motif</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                      {new Date(r.dateEvent).toLocaleDateString('fr-FR')}
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--primary)' }}>
                        {r.matricule}
                      </span>
                    </td>
                    <td style={{ fontWeight: '700', fontSize: '0.95rem' }}>{r.studentName}</td>
                    <td><span className="badge badge-green">{r.classe}</span></td>
                    <td style={{ fontWeight: '600', color: 'var(--accent-amber)' }}>{r.duree}</td>
                    <td>{r.matiere}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleJustify(r)}
                        className={`badge ${r.justifie ? 'badge-green' : 'badge-red'}`}
                        style={{ border: 'none', cursor: 'pointer', padding: '0.35rem 0.75rem', gap: '4px' }}
                        title="Cliquer pour modifier la justification"
                      >
                        {r.justifie ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        <span>{r.justifie ? 'Justifiée' : 'Injustifiée (Cliquez pour justifier)'}</span>
                      </button>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '220px' }}>{r.motif}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.6rem', color: '#F87171', borderColor: 'rgba(248, 113, 113, 0.3)' }}
                        onClick={() => handleDelete(r._id)}
                        title="Supprimer la saisie"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL SIGNALEMENT ABSENCE / RETARD */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="auth-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="page-header" style={{ marginBottom: '1.25rem' }}>
              <h3 className="page-title" style={{ fontSize: '1.2rem', color: activeTab === 'Absence' ? 'var(--accent-red)' : 'var(--accent-amber)' }}>
                Signaler un {activeTab}
              </h3>
              <button className="btn-secondary" onClick={() => setShowAddModal(false)} style={{ padding: '0.35rem' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Sélectionner l'Élève *</label>
                <select
                  className="form-input"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                >
                  <option value="">-- Sélectionner un élève --</option>
                  {students.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.nom} {st.prenom} ({st.matricule} - {st.classe})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Date du {activeTab}</label>
                  <input
                    type="date"
                    className="form-input"
                    value={dateEvent}
                    onChange={(e) => setDateEvent(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Durée</label>
                  {activeTab === 'Absence' ? (
                    <select className="form-input" value={duree} onChange={(e) => setDuree(e.target.value)}>
                      <option value="1 heure">1 heure</option>
                      <option value="2 heures">2 heures</option>
                      <option value="Demi-journée">Demi-journée</option>
                      <option value="Journée complète">Journée complète</option>
                      <option value="Plusieurs jours">Plusieurs jours</option>
                    </select>
                  ) : (
                    <select className="form-input" value={duree} onChange={(e) => setDuree(e.target.value)}>
                      <option value="10 min">10 min</option>
                      <option value="15 min">15 min</option>
                      <option value="30 min">30 min</option>
                      <option value="45 min">45 min</option>
                      <option value="1 heure">1 heure</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Matière / Cours concerné</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Mathématiques, SVT, Toute la journée..."
                  value={matiere}
                  onChange={(e) => setMatiere(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="justifieCheck"
                  checked={justifie}
                  onChange={(e) => setJustifie(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                />
                <label htmlFor="justifieCheck" style={{ fontSize: '0.9rem', cursor: 'pointer', fontWeight: '600' }}>
                  L'absence/retard est dûment justifié(e) par un mot parent/médical
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Motif ou Explication *</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Ex: Certificat médical présenté, motif familial, embouteillages..."
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ 
                  width: '100%', 
                  justifyContent: 'center', 
                  marginTop: '1rem',
                  background: activeTab === 'Absence' ? 'var(--accent-red)' : 'var(--accent-amber)',
                  color: '#090D0B'
                }}
              >
                Enregistrer {activeTab}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
