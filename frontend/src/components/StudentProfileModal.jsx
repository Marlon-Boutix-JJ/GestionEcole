import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  CreditCard, 
  FileText, 
  AlertTriangle, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  Calendar,
  Phone,
  MapPin,
  ShieldCheck,
  Clock
} from 'lucide-react';

const StudentProfileModal = ({ student, onClose }) => {
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [bulletinInfo, setBulletinInfo] = useState(null);
  const [warningsInfo, setWarningsInfo] = useState([]);
  const [attendanceInfo, setAttendanceInfo] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('tout'); // 'tout', 'ecolage', 'bulletin', 'discipline', 'assiduite'

  const schoolMonths = [
    'Octobre', 'Novembre', 'Décembre', 'Janvier', 'Février', 
    'Mars', 'Avril', 'Mai', 'Juin', 'Juillet'
  ];

  useEffect(() => {
    if (!student) return;

    const fetchAllStudentDetails = async () => {
      setLoadingData(true);
      try {
        // Fetch Ecolage Payment Info
        const payRes = await fetch(`/api/payments?classe=${encodeURIComponent(student.classe)}`);
        const payList = await payRes.json();
        const studentPay = payList.find(p => p.matricule === student.matricule || p.student === student._id);
        setPaymentInfo(studentPay || null);

        // Fetch Bulletin Info
        const bulRes = await fetch(`/api/bulletins?classe=${encodeURIComponent(student.classe)}`);
        const bulList = await bulRes.json();
        const studentBul = bulList.find(b => b.matricule === student.matricule || b.student === student._id);
        setBulletinInfo(studentBul || null);

        // Fetch Warnings Info
        const warnRes = await fetch(`/api/warnings?matricule=${encodeURIComponent(student.matricule)}`);
        const warnList = await warnRes.json();
        setWarningsInfo(Array.isArray(warnList) ? warnList : []);

        // Fetch Attendance Info (Absences & Retards)
        const attRes = await fetch(`/api/attendance?studentId=${student._id}`);
        const attList = await attRes.json();
        setAttendanceInfo(Array.isArray(attList) ? attList : []);
      } catch (err) {
        console.error('Erreur chargement profil élève:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchAllStudentDetails();
  }, [student]);

  if (!student) return null;

  const absencesList = attendanceInfo.filter(a => a.type === 'Absence');
  const retardsList = attendanceInfo.filter(a => a.type === 'Retard');

  // Calcul du nombre de mois payés sur 10
  const getPaidCount = () => {
    if (!paymentInfo) return 0;
    if (paymentInfo.moisPayes && paymentInfo.moisPayes.length > 0) {
      return paymentInfo.moisPayes.length;
    }
    if (paymentInfo.montantPaye && paymentInfo.montantPaye > 0) {
      return Math.min(10, Math.max(1, Math.floor(paymentInfo.montantPaye / 150000)));
    }
    return 0;
  };

  const paidCount = getPaidCount();
  const isPaymentOK = paidCount > 0 || (paymentInfo && (paymentInfo.statut === 'Payé' || paymentInfo.statut === 'À jour'));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="auth-card" 
        style={{ maxWidth: '850px', maxHeight: '92vh', overflowY: 'auto', padding: '1.75rem' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête Modal Profil Élève */}
        <div className="page-header" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h2 className="page-title" style={{ fontSize: '1.4rem' }}>
              <User size={26} style={{ color: 'var(--primary)' }} />
              <span>Dossier Complet de l'Élève</span>
            </h2>
            <p className="page-subtitle" style={{ color: 'var(--primary)', fontFamily: 'monospace', fontWeight: '700', marginTop: '0.2rem' }}>
              {student.nom} {student.prenom} — Matricule : {student.matricule} ({student.classe})
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="btn-primary" onClick={() => window.print()} style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}>
              <Printer size={16} />
              <span>Imprimer Fiche</span>
            </button>
            <button className="btn-secondary" onClick={onClose} style={{ padding: '0.45rem' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Barre d'Onglets de Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            type="button"
            onClick={() => setActiveTab('tout')}
            className={activeTab === 'tout' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
          >
            Vue d'Ensemble
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('ecolage')}
            className={activeTab === 'ecolage' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', gap: '6px' }}
          >
            <CreditCard size={15} />
            <span>Écolage ({paidCount}/10 mois)</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('bulletin')}
            className={activeTab === 'bulletin' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', gap: '6px' }}
          >
            <FileText size={15} />
            <span>Bulletin ({bulletinInfo ? `${bulletinInfo.moyenneGenerale}/20` : 'NC'})</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('assiduite')}
            className={activeTab === 'assiduite' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', gap: '6px' }}
          >
            <Clock size={15} />
            <span>Absences ({absencesList.length}) & Retards ({retardsList.length})</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('discipline')}
            className={activeTab === 'discipline' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', gap: '6px' }}
          >
            <AlertTriangle size={15} />
            <span>Discipline ({warningsInfo.length})</span>
          </button>
        </div>

        {loadingData ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Chargement de toutes les données de l'élève...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* 1. FICHE IDENTITÉ & INFOS PERSONNELLES ET PARENTALES */}
            {(activeTab === 'tout' || activeTab === 'identite') && (
              <div style={{ background: 'var(--bg-dark)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={18} style={{ color: 'var(--primary)' }} />
                  <span>Identité & Coordonnées de l'Élève</span>
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Nom complet</span>
                    <strong style={{ fontSize: '1rem' }}>{student.nom} {student.prenom}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>N° Matricule</span>
                    <strong style={{ fontFamily: 'monospace', color: 'var(--primary)', fontSize: '1rem' }}>{student.matricule}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Classe</span>
                    <span className="badge badge-green" style={{ fontSize: '0.85rem' }}>{student.classe}</span>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Genre</span>
                    <strong>{student.genre === 'M' ? 'Masculin (Garçon)' : 'Féminin (Fille)'}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Date de Naissance</span>
                    <strong>{student.dateNaissance || '2008-05-15'}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Adresse Résidentielle</span>
                    <strong style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} style={{ color: 'var(--primary)' }} />
                      <span>{student.adresse || 'Dakar'}</span>
                    </strong>
                  </div>
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--accent-amber)', margin: '1rem 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Filiation & Coordonnées Parentales / Tuteur</span>
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  {/* Informations Père */}
                  <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent-amber)', marginBottom: '0.35rem' }}>
                      👨 Informations du Père
                    </div>
                    <div style={{ fontSize: '0.85rem' }}><strong>Nom :</strong> {student.nomPere || 'Non renseigné'}</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
                      <strong>Tél :</strong> {student.telPere ? <a href={`tel:${student.telPere}`} style={{ color: 'var(--primary)' }}>{student.telPere}</a> : 'Non renseigné'}
                    </div>
                    <div style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}><strong>Profession :</strong> {student.professionPere || 'Non renseignée'}</div>
                  </div>

                  {/* Informations Mère */}
                  <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent-blue)', marginBottom: '0.35rem' }}>
                      👩 Informations de la Mère
                    </div>
                    <div style={{ fontSize: '0.85rem' }}><strong>Nom :</strong> {student.nomMere || 'Non renseigné'}</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
                      <strong>Tél :</strong> {student.telMere ? <a href={`tel:${student.telMere}`} style={{ color: 'var(--primary)' }}>{student.telMere}</a> : 'Non renseigné'}
                    </div>
                    <div style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}><strong>Profession :</strong> {student.professionMere || 'Non renseignée'}</div>
                  </div>

                  {/* Informations Tuteur */}
                  <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.35rem' }}>
                      🛡️ Responsable / Tuteur Légal
                    </div>
                    <div style={{ fontSize: '0.85rem' }}><strong>Nom :</strong> {student.nomTuteur || 'Non renseigné'}</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
                      <strong>Tél :</strong> {student.telTuteur ? <a href={`tel:${student.telTuteur}`} style={{ color: 'var(--primary)' }}>{student.telTuteur}</a> : (student.contactParent || 'Non renseigné')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ÉCOLAGE & FRAIS DE SCOLARITÉ */}
            {(activeTab === 'tout' || activeTab === 'ecolage') && (
              <div style={{ background: 'var(--bg-dark)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CreditCard size={18} style={{ color: 'var(--primary)' }} />
                    <span>Statut de l'Écolage (Ariary)</span>
                  </h4>

                  <span className={`badge ${isPaymentOK ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', fontWeight: '700' }}>
                    {isPaymentOK ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    <span>{isPaymentOK ? `Payé (${paidCount}/10 mois)` : `Non payé (0/10 mois)`}</span>
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Montant Réglé</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.2rem' }}>
                      {((paymentInfo?.montantPaye) || (paidCount * 150000)).toLocaleString()} Ariary
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reste À Payer</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--accent-amber)', marginTop: '0.2rem' }}>
                      {Math.max(0, 1500000 - ((paymentInfo?.montantPaye) || (paidCount * 150000))).toLocaleString()} Ariary
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                  Mois réglés de l'année scolaire (Octobre à Juillet) :
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {schoolMonths.map(m => {
                    const isPaid = paymentInfo?.moisPayes && paymentInfo.moisPayes.includes(m);
                    return (
                      <span 
                        key={m}
                        style={{ 
                          padding: '0.35rem 0.65rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          background: isPaid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                          color: isPaid ? '#10B981' : 'var(--text-muted)',
                          border: isPaid ? '1px solid #10B981' : '1px solid var(--border-color)'
                        }}
                      >
                        {m} {isPaid ? '✓' : ''}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. BULLETIN DE NOTES SCOLAIRES */}
            {(activeTab === 'tout' || activeTab === 'bulletin') && (
              <div style={{ background: 'var(--bg-dark)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} style={{ color: 'var(--primary)' }} />
                    <span>Bulletin de Notes & Rang</span>
                  </h4>

                  {bulletinInfo && (
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>
                        Moyenne : {bulletinInfo.moyenneGenerale} / 20
                      </span>
                      <span className="badge badge-amber" style={{ fontWeight: '800', fontSize: '0.85rem' }}>
                        <Award size={15} />
                        <span>Rang : {bulletinInfo.rang}</span>
                      </span>
                    </div>
                  )}
                </div>

                {!bulletinInfo ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Aucun bulletin enregistré pour cet élève.
                  </div>
                ) : (
                  <>
                    <div className="table-responsive" style={{ marginBottom: '1rem' }}>
                      <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                        <thead>
                          <tr>
                            <th>Matière</th>
                            <th style={{ textAlign: 'center' }}>Note (/20)</th>
                            <th style={{ textAlign: 'center' }}>Coef</th>
                            <th>Appréciation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulletinInfo.matieres && bulletinInfo.matieres.map((m, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: '700' }}>{m.nom}</td>
                              <td style={{ textAlign: 'center', fontWeight: '800', color: m.note >= 14 ? 'var(--primary)' : 'var(--text-main)' }}>
                                {m.note}
                              </td>
                              <td style={{ textAlign: 'center' }}>{m.coef}</td>
                              <td style={{ color: 'var(--text-secondary)' }}>{m.appreciation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                      <strong style={{ color: 'var(--primary)' }}>Appréciation du Conseil de Classe :</strong>
                      <p style={{ color: 'var(--text-main)', marginTop: '0.25rem', fontStyle: 'italic' }}>
                        "{bulletinInfo.appreciationGenerale || 'Bilan positif.'}"
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 4. ASSIDUITÉ : ABSENCES ET RETARDS SÉPARÉS */}
            {(activeTab === 'tout' || activeTab === 'assiduite') && (
              <div style={{ background: 'var(--bg-dark)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} style={{ color: 'var(--accent-amber)' }} />
                  <span>Suivi des Absences & Retards</span>
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  {/* Carte Absences */}
                  <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--accent-red)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-red)', fontWeight: '700' }}>Absences</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>
                      {absencesList.length} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>dont {absencesList.filter(a => !a.justifie).length} non justifiée(s)</span>
                    </div>
                  </div>

                  {/* Carte Retards */}
                  <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--accent-amber)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', fontWeight: '700' }}>Retards</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>
                      {retardsList.length} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>dont {retardsList.filter(r => !r.justifie).length} non justifié(s)</span>
                    </div>
                  </div>
                </div>

                {attendanceInfo.length === 0 ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Aucun retard ni absence enregistré pour cet élève.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Durée</th>
                          <th>Matière</th>
                          <th>Justifié ?</th>
                          <th>Motif</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceInfo.map((att) => (
                          <tr key={att._id}>
                            <td>{new Date(att.dateEvent).toLocaleDateString('fr-FR')}</td>
                            <td>
                              <span className={`badge ${att.type === 'Absence' ? 'badge-red' : 'badge-amber'}`}>
                                {att.type}
                              </span>
                            </td>
                            <td>{att.duree}</td>
                            <td>{att.matiere}</td>
                            <td>
                              <span className={`badge ${att.justifie ? 'badge-green' : 'badge-red'}`}>
                                {att.justifie ? 'Oui (Justifié)' : 'Non (Injustifié)'}
                              </span>
                            </td>
                            <td style={{ color: 'var(--text-secondary)' }}>{att.motif}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 5. AVERTISSEMENTS & DISCIPLINE */}
            {(activeTab === 'tout' || activeTab === 'discipline') && (
              <div style={{ background: 'var(--bg-dark)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} style={{ color: warningsInfo.length > 0 ? '#EF4444' : 'var(--primary)' }} />
                  <span>Sanctions & Discipline ({warningsInfo.length})</span>
                </h4>

                {warningsInfo.length === 0 ? (
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10B981', fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={20} />
                    <span>Aucun avertissement ni sanction disciplinaire. Conduite exemplaire !</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {warningsInfo.map((w) => {
                      const level = w.niveau || (w.type?.includes('3') ? 3 : w.type?.includes('2') ? 2 : 1);
                      return (
                        <div 
                          key={w._id}
                          style={{
                            background: 'var(--bg-card)',
                            padding: '0.85rem 1rem',
                            borderRadius: '8px',
                            borderLeft: `4px solid ${level === 3 ? '#EF4444' : level === 2 ? '#F97316' : '#FBBF24'}`,
                            borderTop: '1px solid var(--border-color)',
                            borderRight: '1px solid var(--border-color)',
                            borderBottom: '1px solid var(--border-color)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <span style={{ fontWeight: '800', color: level === 3 ? '#EF4444' : level === 2 ? '#F97316' : '#FBBF24', fontSize: '0.9rem' }}>
                              {level === 3 ? '🚨 AV Niveau 3 (Conseil de classe & Appel au parent)' : level === 2 ? '⚠️ AV Niveau 2' : 'AV Niveau 1'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {new Date(w.dateSanction || w.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                            <strong>Motif :</strong> {w.motif}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfileModal;
