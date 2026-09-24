import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, GraduationCap, FlaskConical, BookOpen, Briefcase, Eye, X, FileSpreadsheet, UploadCloud, AlertCircle, CheckCircle, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';
import StudentProfileModal from '../components/StudentProfileModal';

const ClassPage = ({ classKey, className }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // New Student Form State
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [matricule, setMatricule] = useState('');
  const [genre, setGenre] = useState('M');
  const [dateNaissance, setDateNaissance] = useState('2008-05-15');

  // Informations du Père
  const [nomPere, setNomPere] = useState('');
  const [telPere, setTelPere] = useState('');
  const [professionPere, setProfessionPere] = useState('');

  // Informations de la Mère
  const [nomMere, setNomMere] = useState('');
  const [telMere, setTelMere] = useState('');
  const [professionMere, setProfessionMere] = useState('');

  // Informations du Tuteur
  const [nomTuteur, setNomTuteur] = useState('');
  const [telTuteur, setTelTuteur] = useState('');

  const [adresse, setAdresse] = useState('Dakar');
  const [formError, setFormError] = useState('');

  // Excel Import State
  const [excelData, setExcelData] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/students?classe=${encodeURIComponent(className)}`);
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error('Erreur chargement élèves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [className]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!nom.trim() || !prenom.trim() || !matricule.trim()) {
      setFormError('Le Nom, le Prénom et le N° Matricule sont obligatoires.');
      return;
    }

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: nom.trim(),
          prenom: prenom.trim(),
          matricule: matricule.trim(),
          classe: className,
          genre,
          dateNaissance,
          nomPere: nomPere.trim(),
          telPere: telPere.trim(),
          professionPere: professionPere.trim(),
          nomMere: nomMere.trim(),
          telMere: telMere.trim(),
          professionMere: professionMere.trim(),
          nomTuteur: nomTuteur.trim(),
          telTuteur: telTuteur.trim(),
          adresse
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddModal(false);
        setNom('');
        setPrenom('');
        setMatricule('');
        setNomPere('');
        setTelPere('');
        setProfessionPere('');
        setNomMere('');
        setTelMere('');
        setProfessionMere('');
        setNomTuteur('');
        setTelTuteur('');
        fetchStudents();
      } else {
        setFormError(data.message || 'Erreur lors de l\'inscription de l\'élève.');
      }
    } catch (err) {
      setFormError('Erreur serveur lors de la création.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet élève ?')) return;
    try {
      await fetch(`/api/students/${id}`, { method: 'DELETE' });
      fetchStudents();
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  // Excel File Parser
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Normalize keys
        const formatted = data.map((row) => ({
          nom: row.Nom || row.nom || row['NOM'] || '',
          prenom: row.Prenom || row.prenom || row['Prénom'] || row['PRENOM'] || '',
          matricule: row.Matricule || row.matricule || row['MATRICULE'] || '',
          classe: row.Classe || row.classe || className,
          genre: row.Genre || row.genre || 'M',
          dateNaissance: row.DateNaissance || row['Date de Naissance'] || '2008-05-15',
          contactParent: row.ContactParent || row['Contact Parent'] || '+221 77 000 00 00',
          adresse: row.Adresse || row.adresse || 'Dakar'
        }));

        setExcelData(formatted);
      } catch (err) {
        console.error('Erreur lecture Excel:', err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = async () => {
    if (excelData.length === 0) return;
    setImporting(true);
    setImportStatus(null);
    try {
      const res = await fetch('/api/students/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: excelData })
      });
      const data = await res.json();
      setImportStatus(data);
      fetchStudents();
    } catch (err) {
      setImportStatus({ message: 'Erreur lors de l\'importation.' });
    } finally {
      setImporting(false);
    }
  };

  const IconComponent = className.includes('3ème') 
    ? GraduationCap 
    : className.includes('Terminale S') 
    ? FlaskConical 
    : className.includes('Terminale OSE') 
    ? Briefcase 
    : BookOpen;

  return (
    <div>
      {/* SECTION DOCUMENT D'IMPRESSION (IMPRESSION PAR DÉFAUT CACHÉE SUR ÉCRAN) */}
      <div className="print-only">
        <div className="print-header">
          <h2>RÉPUBLIQUE DU SÉNÉGAL</h2>
          <h3>MINISTÈRE DE L'ÉDUCATION NATIONALE</h3>
          <h2 style={{ marginTop: '10px', textDecoration: 'underline' }}>
            LISTE OFFICIELLE DES ÉLÈVES — CLASSE DE {className.toUpperCase()}
          </h2>
          <p>Année Scolaire : 2025 - 2026 | Effectif Total : {students.length} Élève(s) | Date d'édition : {new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>N°</th>
              <th>Matricule</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th style={{ width: '50px' }}>Sexe</th>
              <th>Date de Naissance</th>
              <th>Contact Parent</th>
              <th>Adresse</th>
            </tr>
          </thead>
          <tbody>
            {students.map((st, index) => (
              <tr key={st._id || index}>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{index + 1}</td>
                <td style={{ fontWeight: 'bold' }}>{st.matricule}</td>
                <td style={{ fontWeight: 'bold' }}>{st.nom}</td>
                <td>{st.prenom}</td>
                <td style={{ textAlign: 'center' }}>{st.genre || 'M'}</td>
                <td>{st.dateNaissance ? new Date(st.dateNaissance).toLocaleDateString('fr-FR') : '—'}</td>
                <td>{st.contactParent || '—'}</td>
                <td>{st.adresse || 'Dakar'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="print-footer-signatures">
          <div className="print-signature-box">
            <div>Le Censeur / Surveillant Général</div>
            <div className="print-signature-line">Signature & Cachet</div>
          </div>
          <div className="print-signature-box">
            <div>Le Proviseur / Directeur</div>
            <div className="print-signature-line">Signature & Cachet</div>
          </div>
        </div>
      </div>

      {/* Header Section sur Écran avec Boutons Inscrire, Importer & Imprimer */}
      <div className="page-header no-print">
        <div>
          <h1 className="page-title">
            <IconComponent size={28} style={{ color: 'var(--primary)' }} />
            <span>Classe de {className}</span>
          </h1>
          <p className="page-subtitle">Effectif et gestion des dossiers des élèves de {className}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={() => { setShowExcelModal(true); setExcelData([]); setImportStatus(null); }}>
            <FileSpreadsheet size={18} style={{ color: '#10B981' }} />
            <span>Importer Fichier Excel</span>
          </button>

          <button className="btn-secondary" onClick={() => window.print()} title="Imprimer la liste des élèves">
            <Printer size={18} style={{ color: 'var(--primary)' }} />
            <span>Imprimer la Liste</span>
          </button>

          <button className="btn-primary" onClick={() => { setShowAddModal(true); setFormError(''); }}>
            <UserPlus size={18} />
            <span>Inscrire un Élève</span>
          </button>
        </div>
      </div>


      {/* Tableau Simplifié : Uniquement Nom & Prénom, Matricule, et Icône Œil pour détails */}
      <div className="card-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-main)' }}>
            Effectif Total : <span style={{ color: 'var(--primary)' }}>{students.length} élève(s)</span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement de la liste...</div>
        ) : students.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Aucun élève inscrit en classe de {className} pour le moment.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Nom & Prénom</th>
                  <th>Matricule</th>
                  <th style={{ textAlign: 'right' }}>Détails / Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr key={st._id}>
                    <td style={{ fontWeight: '600', fontSize: '0.975rem' }}>
                      {st.nom} {st.prenom}
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--primary)', fontSize: '0.95rem' }}>
                        {st.matricule}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          className="btn-primary"
                          style={{ padding: '0.4rem 0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                          onClick={() => setSelectedStudent(st)}
                          title="Cliquez pour afficher toutes les informations de l'élève"
                        >
                          <Eye size={17} />
                          <span style={{ fontSize: '0.8rem' }}>Voir tout</span>
                        </button>
                        <button
                          className="btn-secondary"
                          style={{ padding: '0.4rem 0.6rem', color: '#F87171', borderColor: 'rgba(248, 113, 113, 0.3)' }}
                          onClick={() => handleDelete(st._id)}
                          title="Supprimer l'élève"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Inscription d'un élève (Formulaire Complet 13 Champs) */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="auth-card" style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="page-header" style={{ marginBottom: '1.25rem' }}>
              <h3 className="page-title" style={{ fontSize: '1.2rem' }}>
                Formulaire d'Inscription & Ajout Élève ({className})
              </h3>
              <button className="btn-secondary" onClick={() => setShowAddModal(false)} style={{ padding: '0.35rem' }}>
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div style={{ background: 'rgba(248, 113, 113, 0.15)', color: '#F87171', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid rgba(248, 113, 113, 0.3)' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleAddStudent}>
              {/* 1. INFORMATIONS DE L'ÉLÈVE */}
              <div style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>
                  1. Informations de l'Élève
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Nom *</label>
                    <input type="text" className="form-input" placeholder="Ex: Diop" value={nom} onChange={(e) => setNom(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Prénom *</label>
                    <input type="text" className="form-input" placeholder="Ex: Moussa" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">N° Matricule *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: ELE-2026-001"
                      value={matricule}
                      onChange={(e) => setMatricule(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Classe *</label>
                    <input type="text" className="form-input" value={className} disabled style={{ opacity: 0.8 }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Date de Naissance</label>
                    <input type="date" className="form-input" value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Genre</label>
                    <select className="form-input" value={genre} onChange={(e) => setGenre(e.target.value)}>
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. INFORMATIONS DU PÈRE */}
              <div style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--accent-amber)', marginBottom: '0.75rem' }}>
                  2. Informations du Père
                </div>

                <div className="form-group">
                  <label className="form-label">Nom complet du Père</label>
                  <input type="text" className="form-input" placeholder="Ex: Cheikh Diop" value={nomPere} onChange={(e) => setNomPere(e.target.value)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Numéro de Téléphone (Père)</label>
                    <input type="text" className="form-input" placeholder="+221 77 123 45 67" value={telPere} onChange={(e) => setTelPere(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Profession du Père</label>
                    <input type="text" className="form-input" placeholder="Ex: Ingénieur, Enseignant..." value={professionPere} onChange={(e) => setProfessionPere(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* 3. INFORMATIONS DE LA MÈRE */}
              <div style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--accent-blue)', marginBottom: '0.75rem' }}>
                  3. Informations de la Mère
                </div>

                <div className="form-group">
                  <label className="form-label">Nom complet de la Mère</label>
                  <input type="text" className="form-input" placeholder="Ex: Aminata Ndiaye" value={nomMere} onChange={(e) => setNomMere(e.target.value)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Numéro de Téléphone (Mère)</label>
                    <input type="text" className="form-input" placeholder="+221 78 987 65 43" value={telMere} onChange={(e) => setTelMere(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Profession de la Mère</label>
                    <input type="text" className="form-input" placeholder="Ex: Commerçante, Médecin..." value={professionMere} onChange={(e) => setProfessionMere(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* 4. INFORMATIONS DU TUTEUR */}
              <div style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>
                  4. Informations du Tuteur / Responsable Légal
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Nom complet du Tuteur</label>
                    <input type="text" className="form-input" placeholder="Ex: Ousmane Diop" value={nomTuteur} onChange={(e) => setNomTuteur(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Numéro de Téléphone (Tuteur)</label>
                    <input type="text" className="form-input" placeholder="+221 70 555 44 33" value={telTuteur} onChange={(e) => setTelTuteur(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Adresse de Résidence</label>
                <input type="text" className="form-input" placeholder="Dakar, Sénégal" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.85rem' }}>
                Enregistrer l'Élève & les Informations Parentales
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Importer Fichier Excel */}
      {showExcelModal && (
        <div className="modal-overlay" onClick={() => setShowExcelModal(false)}>
          <div className="auth-card" style={{ maxWidth: '680px', maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="page-header" style={{ marginBottom: '1rem' }}>
              <h3 className="page-title" style={{ fontSize: '1.2rem' }}>
                <FileSpreadsheet size={22} style={{ color: 'var(--primary)' }} />
                <span>Importer Fichier Excel (.xlsx, .xls, .csv)</span>
              </h3>
              <button className="btn-secondary" onClick={() => setShowExcelModal(false)} style={{ padding: '0.35rem' }}>
                <X size={18} />
              </button>
            </div>

            {importStatus && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                background: importStatus.errors?.length > 0 ? 'rgba(251, 191, 36, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                border: importStatus.errors?.length > 0 ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                color: importStatus.errors?.length > 0 ? 'var(--accent-amber)' : 'var(--primary)',
                fontSize: '0.9rem'
              }}>
                <div>{importStatus.message}</div>
                {importStatus.errors?.map((err, i) => (
                  <div key={i} style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>⚠️ {err}</div>
                ))}
              </div>
            )}

            <div style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '2rem', textAlign: 'center', background: 'var(--bg-dark)', marginBottom: '1.25rem' }}>
              <UploadCloud size={40} style={{ color: 'var(--primary)', marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: '700', marginBottom: '0.5rem' }}>Sélectionnez votre dossier/fichier Excel</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Colonnes recommandées : <code>Nom</code>, <code>Prenom</code>, <code>Matricule</code>, <code>Classe</code>
              </p>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                style={{ background: 'var(--bg-card)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', width: '100%' }}
              />
            </div>

            {excelData.length > 0 && (
              <>
                <div style={{ fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Aperçu des élèves détectés ({excelData.length}) :
                </div>
                <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1.25rem' }}>
                  <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Matricule</th>
                        <th>Classe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {excelData.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.nom}</td>
                          <td>{row.prenom}</td>
                          <td style={{ color: 'var(--primary)', fontWeight: '700' }}>{row.matricule}</td>
                          <td>{row.classe}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleConfirmImport}
                  disabled={importing}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {importing ? 'Importation en cours...' : `Confirmer l'Importation de ${excelData.length} Élève(s)`}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal Fiche Détaillée Élève (Ouverte au clic sur l'Icône Œil) */}
      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};

export default ClassPage;
