import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  X, 
  Receipt, 
  Calendar, 
  Printer,
  GraduationCap, 
  FlaskConical, 
  BookOpen, 
  Briefcase,
  Check,
  CheckSquare
} from 'lucide-react';

const EcolagePage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterClasse, setFilterClasse] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterMois, setFilterMois] = useState('');

  // Carte Calendrier & Sélection Multiple Modal State
  const [selectedCalendarStudent, setSelectedCalendarStudent] = useState(null);
  const [selectedMonthsToPay, setSelectedMonthsToPay] = useState([]);
  const [methodePaiement, setMethodePaiement] = useState('Espèces');
  const [isProcessingPay, setIsProcessingPay] = useState(false);

  // Reçu d'Écolage Imprimable Modal State
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Mois de l'année scolaire : Octobre à Juillet (10 mois)
  const schoolMonths = [
    'Octobre', 'Novembre', 'Décembre', 'Janvier', 'Février', 
    'Mars', 'Avril', 'Mai', 'Juin', 'Juillet'
  ];

  const [tarifMensuel, setTarifMensuel] = useState(150000); // Prix des écolages mensuel modifiable

  const classesList = ['3ème', 'Terminale S', 'Terminale L', 'Terminale OSE'];

  const fetchPayments = async () => {
    setLoading(true);
    try {
      let url = '/api/payments?';
      if (filterClasse) url += `classe=${encodeURIComponent(filterClasse)}&`;
      if (filterStatut) url += `statut=${encodeURIComponent(filterStatut)}&`;
      if (filterMois) url += `mois=${encodeURIComponent(filterMois)}&`;

      const res = await fetch(url);
      const data = await res.json();
      setPayments(data);
    } catch (err) {
      console.error('Erreur chargement écolages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filterClasse, filterStatut, filterMois]);

  // Nombre de mois payés sur 10 (avec fallback calculé si moisPayes était vide)
  const getPaidCount = (p) => {
    if (!p) return 0;
    if (p.moisPayes && p.moisPayes.length > 0) {
      return p.moisPayes.length;
    }
    // Fallback pour anciens enregistrements ayant un montant payé
    if (p.montantPaye && p.montantPaye > 0) {
      return Math.min(10, Math.max(1, Math.floor(p.montantPaye / tarifMensuel)));
    }
    return 0;
  };

  // Un élève est considéré comme ayant payé dès qu'il a réglé au moins 1 mois (paidCount > 0)
  const hasPaidAnyMonth = (p) => {
    return getPaidCount(p) > 0 || p.statut === 'Payé' || p.statut === 'À jour';
  };

  // Ouvrir le calendrier avec pré-sélection automatique du premier mois non payé
  const openCalendarForStudent = (student) => {
    setSelectedCalendarStudent(student);
    const paidList = student.moisPayes || [];
    const unpaidMonths = schoolMonths.filter(m => !paidList.includes(m));
    
    // Pré-sélectionner le premier mois non payé s'il existe
    if (unpaidMonths.length > 0) {
      setSelectedMonthsToPay([unpaidMonths[0]]);
    } else {
      setSelectedMonthsToPay([]);
    }
  };

  // Basculer la sélection des mois dans la carte calendrier (Sélection Multiple)
  const toggleMonthSelection = (month, isAlreadyPaid) => {
    if (isAlreadyPaid) return; // Impossible de sélectionner un mois déjà validé en vert

    if (selectedMonthsToPay.includes(month)) {
      setSelectedMonthsToPay(selectedMonthsToPay.filter(m => m !== month));
    } else {
      setSelectedMonthsToPay([...selectedMonthsToPay, month]);
    }
  };

  // Tout Sélectionner / Désélectionner les mois non payés
  const toggleSelectAllUnpaid = () => {
    if (!selectedCalendarStudent) return;
    const paidList = selectedCalendarStudent.moisPayes || [];
    const unpaidMonths = schoolMonths.filter(m => !paidList.includes(m));

    if (selectedMonthsToPay.length === unpaidMonths.length) {
      setSelectedMonthsToPay([]);
    } else {
      setSelectedMonthsToPay(unpaidMonths);
    }
  };

  // Validation du Paiement -> Ouvre le Reçu Imprimable
  const handlePayEcolage = async () => {
    if (!selectedCalendarStudent || selectedMonthsToPay.length === 0) return;

    setIsProcessingPay(true);
    try {
      const res = await fetch(`/api/payments/${selectedCalendarStudent._id}/pay-months`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedMonths: selectedMonthsToPay,
          methodePaiement,
          tarifMensuel: tarifMensuel
        })
      });
      const data = await res.json();
      if (res.ok) {
        // Déclencher le reçu imprimable
        setActiveReceipt({
          recuNo: data.receipt.recuNo,
          date: data.receipt.date,
          studentName: selectedCalendarStudent.studentName,
          matricule: selectedCalendarStudent.matricule,
          classe: selectedCalendarStudent.classe,
          moisPayes: selectedMonthsToPay,
          montantTotal: selectedMonthsToPay.length * tarifMensuel,
          methodePaiement
        });

        setSelectedCalendarStudent(null);
        setSelectedMonthsToPay([]);
        fetchPayments();
      } else {
        alert(data.message || 'Erreur lors du traitement du paiement.');
      }
    } catch (err) {
      console.error('Erreur traitement paiement:', err);
      alert('Erreur de connexion au serveur lors de la validation du paiement.');
    } finally {
      setIsProcessingPay(false);
    }
  };

  // Statistiques en Ariary
  const totalAttendu = payments.reduce((acc, p) => acc + (p.montantTotal || 1500000), 0);
  const totalPaye = payments.reduce((acc, p) => acc + (getPaidCount(p) * tarifMensuel), 0);
  const totalNonPaye = Math.max(0, totalAttendu - totalPaye);
  const countPaye = payments.filter(p => hasPaidAnyMonth(p)).length;
  const countNonPaye = payments.filter(p => !hasPaidAnyMonth(p)).length;

  const getClassIcon = (cls) => {
    if (cls.includes('3ème')) return GraduationCap;
    if (cls.includes('Terminale S')) return FlaskConical;
    if (cls.includes('Terminale OSE')) return Briefcase;
    return BookOpen;
  };

  return (
    <div>
      {/* ENTÊTE & REÇU IMPRIMABLE SEULEMENT POUR LA PERSONNE SÉLECTIONNÉE */}
      {activeReceipt && (
        <div className="print-only">
          <div className="print-header">
            <h2>ÉTABLISSEMENT SCOLAIRE EDUGESTION</h2>
            <h3>REÇU D'ÉCOLAGE OFFICIEL</h3>
            <h2 style={{ marginTop: '8px', textDecoration: 'underline' }}>
              N° {activeReceipt.recuNo}
            </h2>
            <p>
              Date d'émission : {new Date(activeReceipt.date).toLocaleDateString('fr-FR')} | Année Scolaire : 2025 - 2026
            </p>
          </div>

          <div style={{ border: '2px solid #000', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 8px', fontWeight: 'bold', width: '25%' }}>Élève :</td>
                  <td style={{ padding: '6px 8px', fontSize: '15px', fontWeight: 'bold' }}>{activeReceipt.studentName}</td>
                  <td style={{ padding: '6px 8px', fontWeight: 'bold', width: '25%' }}>N° Matricule :</td>
                  <td style={{ padding: '6px 8px', fontWeight: 'bold' }}>{activeReceipt.matricule}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 8px', fontWeight: 'bold' }}>Classe :</td>
                  <td style={{ padding: '6px 8px' }}>{activeReceipt.classe}</td>
                  <td style={{ padding: '6px 8px', fontWeight: 'bold' }}>Mode de Règlement :</td>
                  <td style={{ padding: '6px 8px' }}>{activeReceipt.methodePaiement}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ fontWeight: 'bold', marginBottom: '10px', textDecoration: 'underline' }}>
              Détail des Mois d'Écolage Réglés :
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {activeReceipt.moisPayes && activeReceipt.moisPayes.map(m => (
                <span key={m} style={{ border: '1px solid #000', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px' }}>
                  Mois de {m} (150 000 Ariary) ✓
                </span>
              ))}
            </div>

            <div style={{ borderTop: '2px solid #000', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '15px', fontWeight: 'bold' }}>MONTANT TOTAL PAYÉ EN ARIARY :</span>
              <span style={{ fontSize: '20px', fontWeight: '800' }}>
                {activeReceipt.montantTotal ? activeReceipt.montantTotal.toLocaleString() : 0} Ariary
              </span>
            </div>
          </div>

          <div className="print-footer-signatures">
            <div className="print-signature-box">
              <div>Le Caissier / Agent Comptable</div>
              <div className="print-signature-line">Signature & Date</div>
            </div>
            <div className="print-signature-box">
              <div>Le Proviseur / Directeur</div>
              <div className="print-signature-line">Signature & Cachet</div>
            </div>
          </div>
        </div>
      )}

      {/* Reste de la Page (Interface Écran masquée à l'impression) */}
      <div className="no-print">
        {/* Header Page */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <CreditCard size={28} style={{ color: 'var(--primary)' }} />
              <span>Gestion des Écolages (Ariary)</span>
            </h1>
            <p className="page-subtitle">Suivi des versements mensuels (Octobre à Juillet) avec statut dynamique Payé (X/10 mois)</p>
          </div>
        </div>

      {/* KPI Cards (en Ariary) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="card-panel" style={{ padding: '1.25rem', margin: 0 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Élèves Ayant Payé (&ge; 1 mois)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={22} />
            <span>{countPaye} Payé(s)</span>
          </div>
        </div>

        <div className="card-panel" style={{ padding: '1.25rem', margin: 0 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-red)', textTransform: 'uppercase', fontWeight: '700' }}>Élèves Non Payé (0 mois)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-red)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <XCircle size={22} />
            <span>{countNonPaye} Non payé(s)</span>
          </div>
        </div>

        <div className="card-panel" style={{ padding: '1.25rem', margin: 0 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: '700' }}>Total Encaissé</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.3rem' }}>
            {totalPaye.toLocaleString()} Ariary
          </div>
        </div>

        <div className="card-panel" style={{ padding: '1.25rem', margin: 0 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', textTransform: 'uppercase', fontWeight: '700' }}>Reste À Recouvrer</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-amber)', marginTop: '0.3rem' }}>
            {totalNonPaye.toLocaleString()} Ariary
          </div>
        </div>
      </div>

      {/* Barre de Filtres */}
      <div className="card-panel" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <select className="form-input" style={{ width: 'auto' }} value={filterMois} onChange={(e) => setFilterMois(e.target.value)}>
            <option value="">Tous les mois (Octobre à Juillet)</option>
            {schoolMonths.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select className="form-input" style={{ width: 'auto' }} value={filterClasse} onChange={(e) => setFilterClasse(e.target.value)}>
            <option value="">Toutes les classes</option>
            {classesList.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select className="form-input" style={{ width: 'auto' }} value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="Payé">Payé (&ge; 1 mois)</option>
            <option value="Non payé">Non payé (0 mois)</option>
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>Tarif Écolage (Ariary/mois) :</label>
            <input
              type="number"
              className="form-input"
              style={{ width: '130px', fontWeight: '800', color: 'var(--primary)', textAlign: 'right' }}
              value={tarifMensuel}
              onChange={(e) => setTarifMensuel(Number(e.target.value) || 0)}
              title="Modifier le tarif mensuel d'écolage"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Chargement des écolages...
        </div>
      ) : payments.length === 0 ? (
        <div className="card-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Aucun élève ne correspond aux critères sélectionnés.
        </div>
      ) : (
        /* Séparation Horizontale par Classe */
        classesList
          .filter(cls => !filterClasse || filterClasse === cls)
          .map(cls => {
            const classPayments = payments.filter(p => p.classe === cls);
            if (classPayments.length === 0) return null;

            const ClassIcon = getClassIcon(cls);

            return (
              <div key={cls} style={{ marginBottom: '2.5rem' }}>
                {/* Barre Horizontale de Classe */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1rem',
                  padding: '0.75rem 1rem',
                  background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.02))',
                  borderRadius: '10px',
                  borderLeft: '4px solid var(--primary)'
                }}>
                  <ClassIcon size={22} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '0.02em' }}>
                    Classe de {cls} ({classPayments.length} élève(s))
                  </h3>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.3), transparent)' }} />
                </div>

                {/* Tableau Écolage de la Classe */}
                <div className="card-panel" style={{ padding: '1rem' }}>
                  <div className="table-responsive">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Matricule</th>
                          <th>Nom Complet</th>
                          <th>Statut du Paiement</th>
                          <th style={{ textAlign: 'right' }}>Paiement / Reçu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classPayments.map((p) => {
                          const paidCount = getPaidCount(p);
                          const isAnyPaid = paidCount > 0;

                          return (
                            <tr key={p._id}>
                              <td>
                                <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--primary)', fontSize: '0.95rem' }}>
                                  {p.matricule}
                                </span>
                              </td>
                              <td style={{ fontWeight: '600', fontSize: '0.975rem' }}>
                                {p.studentName}
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  {/* Statut dynamique : Si paidCount > 0 -> VERT "Payé (X/10 mois)", Sinon ROUGE "Non payé (0/10 mois)" */}
                                  <span 
                                    className={`badge ${isAnyPaid ? 'badge-green' : 'badge-red'}`} 
                                    style={{ fontSize: '0.875rem', padding: '0.45rem 0.9rem', fontWeight: '700' }}
                                  >
                                    {isAnyPaid ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                    <span>
                                      {isAnyPaid ? `Payé (${paidCount}/10 mois)` : `Non payé (0/10 mois)`}
                                    </span>
                                  </span>
                                </div>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                  {/* Bouton "Payer l'écolage" */}
                                  <button
                                    className="btn-primary"
                                    style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem', gap: '0.4rem', cursor: 'pointer' }}
                                    onClick={() => openCalendarForStudent(p)}
                                    title="Ouvrir le calendrier des mois pour valider l'écolage"
                                  >
                                    <Calendar size={16} />
                                    <span>Payer l'écolage</span>
                                  </button>

                                  {/* Bouton Voir / Imprimer Reçu si existant */}
                                  {p.historique && p.historique.length > 0 && (
                                    <button
                                      className="btn-secondary"
                                      style={{ padding: '0.45rem 0.65rem' }}
                                      onClick={() => {
                                        const lastRec = p.historique[p.historique.length - 1];
                                        setActiveReceipt({
                                          recuNo: lastRec.recuNo,
                                          date: lastRec.date,
                                          studentName: p.studentName,
                                          matricule: p.matricule,
                                          classe: p.classe,
                                          moisPayes: p.moisPayes || [p.mois],
                                          montantTotal: lastRec.montant,
                                          methodePaiement: lastRec.methode
                                        });
                                      }}
                                      title="Imprimer le reçu d'écolage"
                                    >
                                      <Printer size={16} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })
      )}
      </div>

      {/* CARTE / MODAL : CALENDRIER DES MOIS (OCTOBRE À JUILLET - SÉLECTION MULTIPLE) */}
      {selectedCalendarStudent && (
        <div className="modal-overlay" onClick={() => setSelectedCalendarStudent(null)}>
          <div className="auth-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="page-header" style={{ marginBottom: '1rem' }}>
              <div>
                <h3 className="page-title" style={{ fontSize: '1.25rem' }}>
                  <Calendar size={22} style={{ color: 'var(--primary)' }} />
                  <span>Calendrier d'Écolage - {selectedCalendarStudent.studentName}</span>
                </h3>
                <p className="page-subtitle" style={{ color: 'var(--primary)', fontFamily: 'monospace', fontWeight: '700', marginTop: '0.2rem' }}>
                  Matricule : {selectedCalendarStudent.matricule} ({selectedCalendarStudent.classe}) — Statut : Payé {getPaidCount(selectedCalendarStudent)}/10 mois
                </p>
              </div>
              <button className="btn-secondary" onClick={() => setSelectedCalendarStudent(null)} style={{ padding: '0.35rem' }}>
                <X size={18} />
              </button>
            </div>

            {/* Légende, Grille & Bouton Tout Sélectionner */}
            <div style={{ background: 'var(--bg-dark)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-main)' }}>
                  Sélectionnez les mois à régler (Octobre à Juillet) :
                </span>
                <button 
                  type="button" 
                  onClick={toggleSelectAllUnpaid}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <CheckSquare size={14} />
                  <span>Tout Sélectionner</span>
                </button>
              </div>

              {/* Grille des 10 Mois de l'année scolaire */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
                {schoolMonths.map((m) => {
                  const isPaid = selectedCalendarStudent.moisPayes && selectedCalendarStudent.moisPayes.includes(m);
                  const isSelected = selectedMonthsToPay.includes(m);

                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleMonthSelection(m, isPaid)}
                      disabled={isPaid}
                      style={{
                        padding: '0.85rem 0.5rem',
                        borderRadius: '10px',
                        border: isPaid 
                          ? '1.5px solid #10B981' 
                          : isSelected 
                          ? '2px solid var(--primary)' 
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        background: isPaid 
                          ? 'rgba(16, 185, 129, 0.25)' 
                          : isSelected 
                          ? 'rgba(16, 185, 129, 0.2)' 
                          : 'rgba(255, 255, 255, 0.03)',
                        color: isPaid 
                          ? '#10B981' 
                          : isSelected 
                          ? '#ffffff' 
                          : 'var(--text-secondary)',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        cursor: isPaid ? 'default' : 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 0 12px rgba(16, 185, 129, 0.4)' : isPaid ? '0 0 10px rgba(16, 185, 129, 0.2)' : 'none'
                      }}
                    >
                      <span>{m}</span>

                      {/* Mois Validé -> Vert avec icône de coche */}
                      {isPaid ? (
                        <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px', color: '#10B981', fontWeight: '800' }}>
                          <Check size={14} /> Validé
                        </span>
                      ) : isSelected ? (
                        <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          ✓ À Payer
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>150 000 Ar</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Synthèse et Choix du Mode de Paiement */}
            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Mois sélectionné(s) : <strong style={{ color: 'var(--text-main)' }}>{selectedMonthsToPay.length} mois</strong>
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>Tarif/mois :</label>
                  <input
                    type="number"
                    className="form-input"
                    style={{ width: '120px', padding: '0.25rem 0.4rem', fontSize: '0.85rem', fontWeight: '800', textAlign: 'right' }}
                    value={tarifMensuel}
                    onChange={(e) => setTarifMensuel(Number(e.target.value) || 0)}
                  />
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>
                    (Total : {(selectedMonthsToPay.length * tarifMensuel).toLocaleString()} Ar)
                  </span>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Mode de Règlement</label>
                <select className="form-input" value={methodePaiement} onChange={(e) => setMethodePaiement(e.target.value)}>
                  <option value="Espèces">Espèces (Caisse)</option>
                  <option value="MVola / Orange Money">MVola / Orange Money</option>
                  <option value="Airtel Money">Airtel Money</option>
                  <option value="Virement Bancaire">Virement Bancaire</option>
                </select>
              </div>
            </div>

            {/* Bouton "Payer l'écolage" (Validation Active) */}
            <button
              type="button"
              className="btn-primary"
              onClick={handlePayEcolage}
              disabled={selectedMonthsToPay.length === 0 || isProcessingPay}
              style={{ 
                width: '100%', 
                justifyContent: 'center', 
                padding: '0.85rem', 
                fontSize: '1rem',
                opacity: selectedMonthsToPay.length === 0 ? 0.5 : 1,
                cursor: selectedMonthsToPay.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <Receipt size={20} />
              <span>
                {isProcessingPay 
                  ? 'Paiement en cours...' 
                  : selectedMonthsToPay.length === 0 
                  ? 'Veuillez cliquer sur au moins un mois' 
                  : `Payer l'écolage (${(selectedMonthsToPay.length * tarifMensuel).toLocaleString()} Ariary)`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* CARTE / MODAL : REÇU D'ÉCOLAGE IMPRIMABLE */}
      {activeReceipt && (
        <div className="modal-overlay" onClick={() => setActiveReceipt(null)}>
          <div className="auth-card" style={{ maxWidth: '580px', background: '#ffffff', color: '#111827' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #10B981', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#065F46' }}>REÇU D'ÉCOLAGE OFFICIEL</h2>
                <p style={{ fontSize: '0.8rem', color: '#4B5563' }}>Établissement Scolaire EduGestion</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'monospace', fontWeight: '700', color: '#10B981', fontSize: '1.1rem' }}>
                  N° {activeReceipt.recuNo}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  Date : {new Date(activeReceipt.date).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>

            <div style={{ background: '#F3F4F6', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div><strong>Nom de l'Élève :</strong> {activeReceipt.studentName}</div>
                <div><strong>Matricule :</strong> {activeReceipt.matricule}</div>
                <div><strong>Classe :</strong> {activeReceipt.classe}</div>
                <div><strong>Mode de Règlement :</strong> {activeReceipt.methodePaiement}</div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Mois d'Écolage Réglés :</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {activeReceipt.moisPayes && activeReceipt.moisPayes.map(m => (
                  <span key={m} style={{ background: '#D1FAE5', color: '#065F46', fontWeight: '700', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                    Mois de {m} ✓
                  </span>
                ))}
              </div>
            </div>

            <div style={{ background: '#065F46', color: '#ffffff', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: '600' }}>MONTANT TOTAL PAYÉ :</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>
                {activeReceipt.montantTotal.toLocaleString()} Ariary
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => window.print()}
                style={{ flex: 1, justifyContent: 'center', background: '#065F46', color: '#ffffff' }}
              >
                <Printer size={18} />
                <span>Imprimer le Reçu</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => setActiveReceipt(null)}
                style={{ background: '#E5E7EB', color: '#374151', border: 'none' }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EcolagePage;
