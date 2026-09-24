import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Printer, 
  Edit3, 
  Save, 
  CheckCircle2, 
  GraduationCap, 
  FlaskConical, 
  BookOpen, 
  Briefcase,
  Clock,
  MapPin,
  UserCheck,
  RotateCcw
} from 'lucide-react';

const SchedulePage = ({ initialClass = '3ème' }) => {
  const [activeClassTab, setActiveClassTab] = useState(initialClass);
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const classesList = [
    { name: '3ème', icon: GraduationCap },
    { name: 'Terminale S', icon: FlaskConical },
    { name: 'Terminale L', icon: BookOpen },
    { name: 'Terminale OSE', icon: Briefcase }
  ];

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const timeSlots = [
    { start: '08h00', end: '09h00' },
    { start: '09h00', end: '10h00' },
    { start: '10h15', end: '11h15' },
    { start: '11h15', end: '12h15' },
    { start: '14h30', end: '15h30' },
    { start: '15h30', end: '16h30' }
  ];

  const fetchSchedule = async () => {
    setLoading(true);
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/schedules?classe=${encodeURIComponent(activeClassTab)}`);
      const data = await res.json();
      setScheduleData(data);
    } catch (err) {
      console.error('Erreur chargement emploi du temps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
    setIsEditing(false);
  }, [activeClassTab]);

  // Récupérer la cellule de créneau pour un jour et un horaire donné
  const getSlot = (jour, start, end) => {
    if (!scheduleData || !scheduleData.creneaux) return { matiere: '', professeur: '', salle: '' };
    const found = scheduleData.creneaux.find(
      c => c.jour === jour && c.heureDebut === start && c.heureFin === end
    );
    return found || { matiere: '', professeur: '', salle: '' };
  };

  // Modifier un champ de créneau dans l'état local
  const handleSlotChange = (jour, start, end, field, value) => {
    if (!scheduleData) return;

    const newCreneaux = [...(scheduleData.creneaux || [])];
    const index = newCreneaux.findIndex(
      c => c.jour === jour && c.heureDebut === start && c.heureFin === end
    );

    if (index !== -1) {
      newCreneaux[index] = { ...newCreneaux[index], [field]: value };
    } else {
      newCreneaux.push({
        jour,
        heureDebut: start,
        heureFin: end,
        [field]: value
      });
    }

    setScheduleData({ ...scheduleData, creneaux: newCreneaux });
  };

  // Sauvegarder l'emploi du temps dans la base de données
  const handleSaveSchedule = async () => {
    if (!scheduleData) return;

    setIsSaving(true);
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/schedules/${encodeURIComponent(activeClassTab)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creneaux: scheduleData.creneaux })
      });
      const data = await res.json();
      if (res.ok) {
        setScheduleData(data);
        setIsEditing(false);
        setSuccessMsg(`Emploi du temps de ${activeClassTab} mis à jour avec succès !`);
      } else {
        alert(data.message || "Erreur lors de la sauvegarde.");
      }
    } catch (err) {
      console.error('Erreur sauvegarde emploi du temps:', err);
      alert("Erreur réseau lors de la sauvegarde.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {/* HEADER OFFICIAL POUR L'IMPRESSION SEULEMENT */}
      <div className="print-only">
        <div className="print-header">
          <h2>RÉPUBLIQUE DU SÉNÉGAL</h2>
          <h3>MINISTÈRE DE L'ÉDUCATION NATIONALE</h3>
          <h2 style={{ marginTop: '10px', textDecoration: 'underline' }}>
            EMPLOI DU TEMPS OFFICIEL — CLASSE DE {activeClassTab.toUpperCase()}
          </h2>
          <p>Année Scolaire : 2025 - 2026 | Horaire Hebdomadaire : Lundi à Samedi | Date d'édition : {new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>

      {/* En-tête de la Page (Écran uniquement) */}
      <div className="page-header no-print">
        <div>
          <h1 className="page-title">
            <Calendar size={28} style={{ color: 'var(--primary)' }} />
            <span>Emploi du Temps Modifiable (Lundi à Samedi)</span>
          </h1>
          <p className="page-subtitle">
            Gestion hebdomadaire des cours, professeurs et salles de classe pour chaque niveau
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Bouton Éditer / Modifier */}
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setIsEditing(!isEditing)}
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', gap: '6px' }}
          >
            <Edit3 size={17} />
            <span>{isEditing ? 'Aperçu Emploi du Temps' : 'Modifier Emploi du Temps'}</span>
          </button>

          {/* Bouton Sauvegarder si en mode édition */}
          {isEditing && (
            <button
              type="button"
              className="btn-primary"
              onClick={handleSaveSchedule}
              disabled={isSaving}
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', gap: '6px' }}
            >
              <Save size={17} />
              <span>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          )}

          {/* Bouton Imprimer */}
          <button
            type="button"
            className="btn-primary"
            onClick={() => window.print()}
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', gap: '6px' }}
          >
            <Printer size={17} />
            <span>Imprimer</span>
          </button>
        </div>
      </div>

      {/* SÉLECTION DE LA CLASSE (BOUTONS / ONGLETS PAR CLASSE) */}
      <div className="no-print" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
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
              <span>Emploi du Temps {cls.name}</span>
            </button>
          );
        })}
      </div>

      {/* Alerte succès */}
      {successMsg && (
        <div className="no-print" style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: 'var(--primary)',
          padding: '0.75rem 1.25rem',
          borderRadius: '10px',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: '700',
          fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* GRILLE HEBDOMADAIRE LUNDI À SAMEDI */}
      <div className="card-panel" style={{ padding: '1.25rem' }}>
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} style={{ color: 'var(--primary)' }} />
            <span>Planning de Cours — Classe de {activeClassTab}</span>
          </h3>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isEditing ? '💡 Modifiez les cases ci-dessous puis cliquez sur Enregistrer' : 'Aperçu hebdomadaire officiel'}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Chargement de l'emploi du temps...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table" style={{ borderCollapse: 'separate', borderSpacing: '4px' }}>
              <thead>
                <tr>
                  <th style={{ width: '110px', textAlign: 'center', background: 'var(--bg-card)' }}>Horaires</th>
                  {daysOfWeek.map(j => (
                    <th key={j} style={{ textAlign: 'center', fontSize: '0.95rem', fontWeight: '800', background: 'var(--bg-card)', color: 'var(--primary)' }}>
                      {j}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {timeSlots.map((slot, idx) => (
                  <tr key={idx}>
                    {/* Colonne Horaires */}
                    <td style={{
                      textAlign: 'center',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      background: 'var(--bg-dark)',
                      color: 'var(--text-main)',
                      borderRight: '2px solid var(--primary)',
                      padding: '0.75rem 0.5rem'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <Clock size={14} style={{ color: 'var(--primary)' }} />
                        <span>{slot.start}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>à</span>
                        <span>{slot.end}</span>
                      </div>
                    </td>

                    {/* Cases des Jours de Lundi à Samedi */}
                    {daysOfWeek.map((jour) => {
                      const current = getSlot(jour, slot.start, slot.end);
                      const isFree = !current.matiere || current.matiere.includes('Libre');

                      return (
                        <td 
                          key={jour} 
                          style={{
                            verticalAlign: 'top',
                            padding: '0.65rem',
                            borderRadius: '8px',
                            background: isFree ? 'rgba(255, 255, 255, 0.02)' : 'var(--bg-card)',
                            border: isEditing ? '1px dashed var(--primary)' : '1px solid var(--border-color)',
                            minWidth: '135px'
                          }}
                        >
                          {!isEditing ? (
                            /* APERÇU FIXE */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', height: '100%' }}>
                              <div style={{
                                fontWeight: '800',
                                fontSize: '0.85rem',
                                color: isFree ? 'var(--text-muted)' : 'var(--primary)',
                                borderBottom: isFree ? 'none' : '1px solid rgba(16, 185, 129, 0.2)',
                                paddingBottom: '0.2rem'
                              }}>
                                {current.matiere || '— Libre —'}
                              </div>

                              {!isFree && (
                                <>
                                  {current.professeur && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                      <UserCheck size={12} style={{ color: 'var(--primary)' }} />
                                      <span>{current.professeur}</span>
                                    </div>
                                  )}

                                  {current.salle && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: '700' }}>
                                      <MapPin size={12} />
                                      <span>{current.salle}</span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          ) : (
                            /* Saisie ÉDITABLE */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              <input
                                type="text"
                                className="form-input"
                                style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', fontWeight: '700' }}
                                placeholder="Matière"
                                value={current.matiere}
                                onChange={(e) => handleSlotChange(jour, slot.start, slot.end, 'matiere', e.target.value)}
                              />
                              <input
                                type="text"
                                className="form-input"
                                style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                                placeholder="Professeur"
                                value={current.professeur}
                                onChange={(e) => handleSlotChange(jour, slot.start, slot.end, 'professeur', e.target.value)}
                              />
                              <input
                                type="text"
                                className="form-input"
                                style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                                placeholder="Salle"
                                value={current.salle}
                                onChange={(e) => handleSlotChange(jour, slot.start, slot.end, 'salle', e.target.value)}
                              />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PIED DE PAGE ET SIGNATURES SUR DOCUMENT IMPRIMÉ */}
        <div className="print-only">
          <div className="print-footer-signatures">
            <div className="print-signature-box">
              <div>Le Professeur Principal</div>
              <div className="print-signature-line">Signature & Date</div>
            </div>
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

        {isEditing && (
          <div className="no-print" style={{ marginTop: '1.25rem', textAlign: 'right' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSaveSchedule}
              disabled={isSaving}
              style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
            >
              <Save size={18} />
              <span>{isSaving ? 'Sauvegarde...' : 'Enregistrer l\'Emploi du Temps'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;
