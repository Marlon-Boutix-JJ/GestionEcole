import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Clock, 
  DollarSign, 
  PlusCircle, 
  Trash2, 
  CheckCircle2, 
  Printer, 
  X, 
  Edit3, 
  FileSpreadsheet,
  Building,
  BookOpen,
  Award,
  Receipt,
  Eye,
  Calendar,
  LayoutGrid,
  List
} from 'lucide-react';

// Composant de carte de pointage ultra-compact avec état local (sauvegarde au blur / entrée)
const EditableShiftCard = ({ s, classesList, handleQuickUpdateShift, openReceiptForShift, handleOpenEditShift, handleDeleteShift, handleTogglePayShift }) => {
  const [teacherName, setTeacherName] = React.useState(s.teacherName || '');
  const [matiere, setMatiere] = React.useState(s.matiere || '');
  const [salaireTotal, setSalaireTotal] = React.useState(s.salaireTotal || 0);

  React.useEffect(() => {
    setTeacherName(s.teacherName || '');
    setMatiere(s.matiere || '');
    setSalaireTotal(s.salaireTotal || 0);
  }, [s.teacherName, s.matiere, s.salaireTotal]);

  const saveTeacherName = () => {
    if (teacherName.trim() !== (s.teacherName || '')) {
      handleQuickUpdateShift(s, { teacherName: teacherName.trim(), teacherId: null });
    }
  };

  const saveMatiere = () => {
    if (matiere.trim() !== (s.matiere || '')) {
      handleQuickUpdateShift(s, { matiere: matiere.trim() });
    }
  };

  const saveSalaire = () => {
    const num = Number(salaireTotal);
    if (num !== (s.salaireTotal || 0)) {
      handleQuickUpdateShift(s, { salaireTotal: num });
    }
  };

  return (
    <div
      style={{
        background: 'rgba(19, 27, 23, 0.95)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '5px',
        padding: '0.3rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem'
      }}
    >
      {/* BADGES HAUT */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="badge badge-green" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>
          {s.classe}
        </span>
        <button
          type="button"
          onClick={() => handleTogglePayShift(s)}
          className={`badge ${s.statutPaiement === 'Payé' ? 'badge-green' : 'badge-amber'}`}
          style={{ border: 'none', cursor: 'pointer', fontSize: '0.68rem', padding: '0.15rem 0.4rem' }}
        >
          {s.statutPaiement === 'Payé' ? '✓ Payé' : '⏳ En attente'}
        </button>
      </div>

      {/* CHAMP DE TEXTE LIBRE : NOM DU PROF */}
      <div>
        <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700' }}>Nom du Prof :</label>
        <input
          type="text"
          className="form-input"
          style={{ padding: '0.1rem 0.25rem', fontSize: '0.72rem', fontWeight: '700', width: '100%', height: '22px' }}
          value={teacherName}
          onChange={(e) => setTeacherName(e.target.value)}
          onBlur={saveTeacherName}
          onKeyDown={(e) => e.key === 'Enter' && saveTeacherName()}
          placeholder="Nom du prof"
        />
      </div>

      {/* MATIÈRE */}
      <div>
        <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700' }}>Matière :</label>
        <input
          type="text"
          className="form-input"
          style={{ padding: '0.1rem 0.25rem', fontSize: '0.72rem', width: '100%', height: '22px' }}
          value={matiere}
          onChange={(e) => setMatiere(e.target.value)}
          onBlur={saveMatiere}
          onKeyDown={(e) => e.key === 'Enter' && saveMatiere()}
        />
      </div>

      {/* CRÉNEAU & CLASSE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
        <div>
          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700' }}>Heure :</label>
          <select
            className="form-input"
            style={{ padding: '0.1rem 0.15rem', fontSize: '0.68rem', width: '100%', height: '22px' }}
            value={s.heureDebut < '10:00' ? '1ère' : s.heureDebut < '12:30' ? '2ème' : s.heureDebut < '15:00' ? '3ème' : '4ème'}
            onChange={(e) => {
              const slotTimes = {
                '1ère': { start: '08:00', end: '10:00' },
                '2ème': { start: '10:00', end: '12:00' },
                '3ème': { start: '13:00', end: '15:00' },
                '4ème': { start: '15:00', end: '17:00' }
              };
              const sel = slotTimes[e.target.value] || slotTimes['1ère'];
              handleQuickUpdateShift(s, { heureDebut: sel.start, heureFin: sel.end });
            }}
          >
            <option value="1ère">1er heure</option>
            <option value="2ème">2em heure</option>
            <option value="3ème">3em heure</option>
            <option value="4ème">4em heure</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700' }}>Classe :</label>
          <select
            className="form-input"
            style={{ padding: '0.1rem 0.15rem', fontSize: '0.68rem', width: '100%', height: '22px' }}
            value={s.classe}
            onChange={(e) => handleQuickUpdateShift(s, { classe: e.target.value })}
          >
            {classesList.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* COMBIEN D'HEURES */}
      <div>
        <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700' }}>Combien d'heure(s) :</label>
        <select
          className="form-input"
          style={{ padding: '0.1rem 0.2rem', fontSize: '0.72rem', fontWeight: '800', color: 'var(--primary)', width: '100%', height: '22px' }}
          value={s.heuresEffectuees}
          onChange={(e) => handleQuickUpdateShift(s, { heuresEffectuees: Number(e.target.value) })}
        >
          <option value="1">1 Heure (1h)</option>
          <option value="1.5">1h 30 (1h30)</option>
          <option value="2">2 Heures (2h)</option>
          <option value="2.5">2h 30 (2h30)</option>
          <option value="3">3 Heures (3h)</option>
          <option value="4">4 Heures (4h)</option>
        </select>
      </div>

      {/* SALAIRE ET PRIX DU POINTAGE MODIFIABLE + BOUTONS ACTIONS */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.35rem', marginTop: '0.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <input
            type="number"
            className="form-input"
            style={{ width: '65px', padding: '0.05rem 0.2rem', fontSize: '0.72rem', fontWeight: '800', color: 'var(--primary)', textAlign: 'right', height: '22px' }}
            value={salaireTotal}
            onChange={(e) => setSalaireTotal(e.target.value)}
            onBlur={saveSalaire}
            onKeyDown={(e) => e.key === 'Enter' && saveSalaire()}
            title="Prix du pointage modifiable (en Ariary)"
          />
          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--primary)' }}>Ar</span>
        </div>
        <div style={{ display: 'flex', gap: '3px' }}>
          <button className="btn-secondary" style={{ padding: '0.2rem 0.35rem' }} onClick={() => openReceiptForShift(s)} title="Reçu">
            <Receipt size={12} />
          </button>
          <button className="btn-secondary" style={{ padding: '0.2rem 0.35rem', color: '#60A5FA' }} onClick={() => handleOpenEditShift(s)} title="Modifier">
            <Edit3 size={12} />
          </button>
          <button className="btn-secondary" style={{ padding: '0.2rem 0.35rem', color: '#F87171' }} onClick={() => handleDeleteShift(s._id)} title="Supprimer">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const TeacherPage = () => {
  const [activeTab, setActiveTab] = useState('pointage'); // 'pointage', 'profs', 'paie'
  const [pointageViewMode, setPointageViewMode] = useState('grid'); // 'grid' (Emploi du temps par carré) or 'list' (Registre)
  const [teachers, setTeachers] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterClass, setFilterClass] = useState('Toutes');
  const [filterTeacher, setFilterTeacher] = useState('Tous');

  // Modals & Receipts
  const [showAddPointageModal, setShowAddPointageModal] = useState(false);
  const [showEditPointageModal, setShowEditPointageModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [selectedTeacherForPay, setSelectedTeacherForPay] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Form State Pointage (Ajout)
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [teacherNameInput, setTeacherNameInput] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('Terminale S');
  const [matiere, setMatiere] = useState('Mathématiques');
  const [dateShift, setDateShift] = useState(new Date().toISOString().split('T')[0]);
  const [heureDebut, setHeureDebut] = useState('08:00');
  const [heureFin, setHeureFin] = useState('10:00');
  const [customSalaireTotal, setCustomSalaireTotal] = useState('');
  const [customTarifHoraire, setCustomTarifHoraire] = useState('');
  const [remarque, setRemarque] = useState('');

  // Form State Pointage (Édition)
  const [editingShiftId, setEditingShiftId] = useState(null);
  const [editTeacherId, setEditTeacherId] = useState('');
  const [editTeacherName, setEditTeacherName] = useState('');
  const [editClasse, setEditClasse] = useState('Terminale S');
  const [editMatiere, setEditMatiere] = useState('Mathématiques');
  const [editDateShift, setEditDateShift] = useState('');
  const [editHeureDebut, setEditHeureDebut] = useState('08:00');
  const [editHeureFin, setEditHeureFin] = useState('10:00');
  const [editSalaireTotal, setEditSalaireTotal] = useState('');
  const [editTarifHoraire, setEditTarifHoraire] = useState('');
  const [editRemarque, setEditRemarque] = useState('');

  // Form State Professeur
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('+221 77 000 00 00');
  const [email, setEmail] = useState('');
  const [matieresInput, setMatieresInput] = useState('Mathématiques');
  const [tarif3eme, setTarif3eme] = useState(12000);
  const [tarifTermS, setTarifTermS] = useState(20000);
  const [tarifTermL, setTarifTermL] = useState(15000);
  const [tarifTermOSE, setTarifTermOSE] = useState(18000);

  const classesList = ['3ème', 'Terminale S', 'Terminale L', 'Terminale OSE'];

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/teachers');
      const data = await res.json();
      setTeachers(data);
      if (data.length > 0 && !selectedTeacherId && !teacherNameInput) {
        setSelectedTeacherId(data[0]._id);
        setTeacherNameInput(`${data[0].nom} ${data[0].prenom}`);
      }
    } catch (err) {
      console.error('Erreur chargement professeurs:', err);
    }
  };

  const fetchShifts = async () => {
    setLoading(true);
    try {
      let url = '/api/teachers/shifts?';
      if (filterClass !== 'Toutes') url += `classe=${encodeURIComponent(filterClass)}&`;
      if (filterTeacher !== 'Tous') url += `teacherId=${encodeURIComponent(filterTeacher)}&`;

      const res = await fetch(url);
      const data = await res.json();
      setShifts(data);
    } catch (err) {
      console.error('Erreur chargement pointages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [filterClass, filterTeacher]);

  // Handle Add Teacher
  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim()) return;

    const tarifsHoraires = [
      { classe: '3ème', tarifHeure: Number(tarif3eme) || 12000 },
      { classe: 'Terminale S', tarifHeure: Number(tarifTermS) || 20000 },
      { classe: 'Terminale L', tarifHeure: Number(tarifTermL) || 15000 },
      { classe: 'Terminale OSE', tarifHeure: Number(tarifTermOSE) || 18000 }
    ];

    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: nom.trim(),
          prenom: prenom.trim(),
          telephone: telephone.trim(),
          email: email.trim(),
          matieres: matieresInput.split(',').map(m => m.trim()),
          tarifsHoraires
        })
      });
      if (res.ok) {
        setShowAddTeacherModal(false);
        setNom('');
        setPrenom('');
        fetchTeachers();
      }
    } catch (err) {
      console.error('Erreur création professeur:', err);
    }
  };

  // Calculate current class rate for active selected teacher & class
  const getSelectedTeacherClassRate = () => {
    const teacher = teachers.find(t => t._id === selectedTeacherId);
    if (!teacher || !teacher.tarifsHoraires) return 15000;
    const found = teacher.tarifsHoraires.find(t => t.classe === selectedClasse);
    return found ? found.tarifHeure : 15000;
  };

  // Calculate hours between start & end time
  const getCalculatedHours = () => {
    const [h1, m1] = heureDebut.split(':').map(Number);
    const [h2, m2] = heureFin.split(':').map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    const hours = diff / 60;
    return hours > 0 ? parseFloat(hours.toFixed(2)) : 1;
  };

  // Handle Add Pointage
  const handleCreatePointage = async (e) => {
    e.preventDefault();
    if (!teacherNameInput.trim() || !selectedClasse) return;

    const defaultRate = getSelectedTeacherClassRate();
    const hours = getCalculatedHours();
    const rate = customTarifHoraire ? Number(customTarifHoraire) : defaultRate;
    const salaire = customSalaireTotal ? Number(customSalaireTotal) : Math.round(hours * rate);

    try {
      const res = await fetch('/api/teachers/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: selectedTeacherId || undefined,
          teacherName: teacherNameInput.trim(),
          classe: selectedClasse,
          matiere: matiere.trim() || 'Mathématiques',
          dateShift,
          heureDebut,
          heureFin,
          heuresEffectuees: hours,
          tarifHoraireApplique: rate,
          salaireTotal: salaire,
          remarque: remarque.trim()
        })
      });

      if (res.ok) {
        setShowAddPointageModal(false);
        setRemarque('');
        setCustomSalaireTotal('');
        setCustomTarifHoraire('');
        fetchShifts();
      }
    } catch (err) {
      console.error('Erreur ajout pointage:', err);
    }
  };

  // Open Edit Pointage Modal
  const handleOpenEditShift = (shift) => {
    setEditingShiftId(shift._id);
    setEditTeacherId(shift.teacher || '');
    setEditTeacherName(shift.teacherName || '');
    setEditClasse(shift.classe || 'Terminale S');
    setEditMatiere(shift.matiere || 'Mathématiques');
    setEditDateShift(shift.dateShift ? new Date(shift.dateShift).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setEditHeureDebut(shift.heureDebut || '08:00');
    setEditHeureFin(shift.heureFin || '10:00');
    setEditTarifHoraire(shift.tarifHoraireApplique || '');
    setEditSalaireTotal(shift.salaireTotal || '');
    setEditRemarque(shift.remarque || '');
    setShowEditPointageModal(true);
  };

  // Calculate hours for Edit form
  const getEditCalculatedHours = () => {
    if (!editHeureDebut || !editHeureFin) return 1;
    const [h1, m1] = editHeureDebut.split(':').map(Number);
    const [h2, m2] = editHeureFin.split(':').map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    const hours = diff / 60;
    return hours > 0 ? parseFloat(hours.toFixed(2)) : 1;
  };

  // Calculate class rate for Edit form
  const getEditTeacherClassRate = () => {
    if (editTeacherId) {
      const teacher = teachers.find(t => t._id === editTeacherId);
      if (teacher && teacher.tarifsHoraires) {
        const found = teacher.tarifsHoraires.find(t => t.classe === editClasse);
        if (found) return found.tarifHeure;
      }
    }
    return editTarifHoraire ? Number(editTarifHoraire) : 15000;
  };

  // Update existing Pointage
  const handleUpdatePointage = async (e) => {
    e.preventDefault();
    if (!editingShiftId || !editTeacherName.trim() || !editClasse) return;

    const defaultRate = getEditTeacherClassRate();
    const hours = getEditCalculatedHours();
    const rate = editTarifHoraire ? Number(editTarifHoraire) : defaultRate;
    const salaire = editSalaireTotal ? Number(editSalaireTotal) : Math.round(hours * rate);

    try {
      const res = await fetch(`/api/teachers/shifts/${editingShiftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: editTeacherId || undefined,
          teacherName: editTeacherName.trim(),
          classe: editClasse,
          matiere: editMatiere,
          dateShift: editDateShift,
          heureDebut: editHeureDebut,
          heureFin: editHeureFin,
          heuresEffectuees: hours,
          tarifHoraireApplique: rate,
          salaireTotal: salaire,
          remarque: editRemarque
        })
      });

      if (res.ok) {
        setShowEditPointageModal(false);
        setEditingShiftId(null);
        fetchShifts();
      }
    } catch (err) {
      console.error('Erreur modification pointage:', err);
    }
  };

  // View pointage for specific teacher
  const handleViewTeacherPointage = (teacherId) => {
    setFilterTeacher(teacherId);
    setActiveTab('pointage');
  };

  // Quick inline update for Schedule Grid cards
  const handleQuickUpdateShift = async (shift, updates) => {
    let newTeacherId = updates.teacherId !== undefined ? updates.teacherId : shift.teacher;
    let newTeacherName = updates.teacherName !== undefined ? updates.teacherName : shift.teacherName;
    let newClasse = updates.classe !== undefined ? updates.classe : shift.classe;
    let newMatiere = updates.matiere !== undefined ? updates.matiere : shift.matiere;
    let newHours = updates.heuresEffectuees !== undefined ? updates.heuresEffectuees : shift.heuresEffectuees;
    let newHeureDebut = updates.heureDebut !== undefined ? updates.heureDebut : shift.heureDebut;
    let newHeureFin = updates.heureFin !== undefined ? updates.heureFin : shift.heureFin;

    // Recalculate rate if class changed
    let newTarifHoraire = updates.tarifHoraireApplique !== undefined ? updates.tarifHoraireApplique : (shift.tarifHoraireApplique || 15000);

    // If custom salaireTotal was passed explicitly by user typing in input
    let newSalaireTotal;
    if (updates.salaireTotal !== undefined) {
      newSalaireTotal = Number(updates.salaireTotal);
      if (newHours > 0) {
        newTarifHoraire = Math.round(newSalaireTotal / newHours);
      }
    } else {
      // Recalculate automatically if hours/class changed
      newSalaireTotal = Math.round(newHours * newTarifHoraire);
    }

    try {
      const res = await fetch(`/api/teachers/shifts/${shift._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: newTeacherId,
          teacherName: newTeacherName,
          classe: newClasse,
          matiere: newMatiere,
          heuresEffectuees: newHours,
          heureDebut: newHeureDebut,
          heureFin: newHeureFin,
          salaireTotal: newSalaireTotal,
          tarifHoraireApplique: newTarifHoraire
        })
      });
      if (res.ok) {
        fetchShifts();
      }
    } catch (err) {
      console.error('Erreur mise à jour rapide du pointage:', err);
    }
  };

  // Open quick add pointage from schedule cell
  const handleOpenQuickAddShift = (dayName, slotIndex) => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 Sun, 1 Mon...
    const dayOffsets = { 'Lundi': 1, 'Mardi': 2, 'Mercredi': 3, 'Jeudi': 4, 'Vendredi': 5, 'Samedi': 6 };
    const targetOffset = dayOffsets[dayName] || 1;
    const diffDays = targetOffset - (currentDay === 0 ? 7 : currentDay);
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diffDays);
    const formattedDate = targetDate.toISOString().split('T')[0];

    const slotMap = [
      { start: '08:00', end: '10:00' },
      { start: '10:00', end: '12:00' },
      { start: '13:00', end: '15:00' },
      { start: '15:00', end: '17:00' }
    ];
    const slot = slotMap[slotIndex] || slotMap[0];

    setDateShift(formattedDate);
    setHeureDebut(slot.start);
    setHeureFin(slot.end);
    if (teachers.length > 0 && !selectedTeacherId) {
      setSelectedTeacherId(teachers[0]._id);
    }
    setShowAddPointageModal(true);
  };

  // Open Receipt Modal for a given shift
  const openReceiptForShift = (shift) => {
    const year = new Date(shift.dateShift || Date.now()).getFullYear();
    const recuNo = `REC-PROF-${year}-${String(shift._id || Date.now()).slice(-5).toUpperCase()}`;
    setActiveReceipt({
      recuNo,
      teacherName: shift.teacherName,
      dateShift: shift.dateShift,
      datePaiement: new Date().toLocaleDateString('fr-FR'),
      classe: shift.classe,
      matiere: shift.matiere || 'Vacation d\'enseignement',
      heureDebut: shift.heureDebut,
      heureFin: shift.heureFin,
      heuresEffectuees: shift.heuresEffectuees,
      tarifHoraireApplique: shift.tarifHoraireApplique,
      salaireTotal: shift.salaireTotal,
      remarque: shift.remarque || 'Vacation d\'enseignement dispensée'
    });
    setShowReceiptModal(true);
  };

  // Toggle Pay Shift
  const handleTogglePayShift = async (shift) => {
    try {
      const res = await fetch(`/api/teachers/shifts/${shift._id}/pay`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const updated = await res.json();
        fetchShifts();
        // If shift was just paid, automatically open the receipt modal
        if (shift.statutPaiement !== 'Payé') {
          openReceiptForShift({ ...shift, statutPaiement: 'Payé' });
        }
      }
    } catch (err) {
      console.error('Erreur bascule paiement pointage:', err);
    }
  };

  // Print Full Register (clears active receipt first so entire register prints)
  const handlePrintRegister = () => {
    setActiveReceipt(null);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Print Single Receipt
  const handlePrintSingleReceipt = () => {
    window.print();
  };

  // Delete Shift
  const handleDeleteShift = async (shiftId) => {
    if (!window.confirm('Voulez-vous supprimer ce pointage ?')) return;
    try {
      await fetch(`/api/teachers/shifts/${shiftId}`, { method: 'DELETE' });
      fetchShifts();
    } catch (err) {
      console.error('Erreur suppression pointage:', err);
    }
  };

  // Delete Teacher
  const handleDeleteTeacher = async (teacherId) => {
    if (!window.confirm('Voulez-vous supprimer ce professeur et son historique de pointage ?')) return;
    try {
      await fetch(`/api/teachers/${teacherId}`, { method: 'DELETE' });
      fetchTeachers();
      fetchShifts();
    } catch (err) {
      console.error('Erreur suppression professeur:', err);
    }
  };

  // KPIs
  const totalHours = shifts.reduce((acc, s) => acc + (s.heuresEffectuees || 0), 0);
  const totalSalary = shifts.reduce((acc, s) => acc + (s.salaireTotal || 0), 0);
  const paidSalary = shifts.filter(s => s.statutPaiement === 'Payé').reduce((acc, s) => acc + (s.salaireTotal || 0), 0);
  const pendingSalary = Math.max(0, totalSalary - paidSalary);

  return (
    <div>
      {/* DOCUMENT IMPRIMABLE (REÇU SEUL OU REGISTRE COMPLET) */}
      <div className="print-only">
        {activeReceipt ? (
          <div>
            <div className="print-header">
              <h2>ÉTABLISSEMENT SCOLAIRE EDUGESTION</h2>
              <h3>REÇU DE PAIEMENT D'HONORAIRES PROFESSEUR (VACATION)</h3>
              <h2 style={{ marginTop: '8px', textDecoration: 'underline' }}>
                N° {activeReceipt.recuNo}
              </h2>
              <p>
                Date d'émission : {activeReceipt.datePaiement} | Année Scolaire : 2025 - 2026
              </p>
            </div>

            <div style={{ border: '2px solid #000', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px 8px', fontWeight: 'bold', width: '25%' }}>Professeur :</td>
                    <td style={{ padding: '6px 8px', fontSize: '15px', fontWeight: 'bold' }}>{activeReceipt.teacherName}</td>
                    <td style={{ padding: '6px 8px', fontWeight: 'bold', width: '25%' }}>Date du cours :</td>
                    <td style={{ padding: '6px 8px', fontWeight: 'bold' }}>
                      {new Date(activeReceipt.dateShift).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 8px', fontWeight: 'bold' }}>Classe :</td>
                    <td style={{ padding: '6px 8px', fontWeight: 'bold' }}>{activeReceipt.classe}</td>
                    <td style={{ padding: '6px 8px', fontWeight: 'bold' }}>Matière :</td>
                    <td style={{ padding: '6px 8px' }}>{activeReceipt.matiere}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 8px', fontWeight: 'bold' }}>Créneau Horaire :</td>
                    <td style={{ padding: '6px 8px' }}>{activeReceipt.heureDebut} à {activeReceipt.heureFin} ({activeReceipt.heuresEffectuees} h)</td>
                    <td style={{ padding: '6px 8px', fontWeight: 'bold' }}>Tarif Horaire Classe :</td>
                    <td style={{ padding: '6px 8px', fontWeight: 'bold' }}>{activeReceipt.tarifHoraireApplique ? activeReceipt.tarifHoraireApplique.toLocaleString() : 0} Ar / h</td>
                  </tr>
                  {activeReceipt.remarque && (
                    <tr>
                      <td style={{ padding: '6px 8px', fontWeight: 'bold' }}>Détails / Chapitre :</td>
                      <td colSpan="3" style={{ padding: '6px 8px', fontStyle: 'italic' }}>{activeReceipt.remarque}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div style={{ borderTop: '2px solid #000', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', fontWeight: 'bold' }}>MONTANT TOTAL PAYÉ EN ARIARY :</span>
                <span style={{ fontSize: '20px', fontWeight: '800' }}>
                  {activeReceipt.salaireTotal ? activeReceipt.salaireTotal.toLocaleString() : 0} Ariary
                </span>
              </div>
            </div>

            <div style={{ fontStyle: 'italic', fontSize: '13px', marginBottom: '30px' }}>
              * Mention : Reçu la somme susmentionnée au titre du règlement complet de la vacation d'enseignement effectuée.
            </div>

            <div className="print-footer-signatures">
              <div className="print-signature-box">
                <div>Le Professeur (Bénéficiaire)</div>
                <div className="print-signature-line">Signature</div>
              </div>
              <div className="print-signature-box">
                <div>Le Gestionnaire Financier / Proviseur</div>
                <div className="print-signature-line">Signature & Cachet</div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="print-header">
              <h2>RÉPUBLIQUE DU SÉNÉGAL</h2>
              <h3>MINISTÈRE DE L'ÉDUCATION NATIONALE</h3>
              <h2 style={{ marginTop: '10px', textDecoration: 'underline' }}>
                REGISTRE DES POINTAGES ET SALAIRES DE PAIEMENT DES PROFESSEURS
              </h2>
              <p>
                Année Scolaire : 2025 - 2026 | Total Heures Effectuées : {totalHours} h | Total À Payer : {totalSalary.toLocaleString()} Ariary | Date : {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>

            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '35px' }}>N°</th>
                  <th>Date</th>
                  <th>Professeur</th>
                  <th>Classe</th>
                  <th>Matière</th>
                  <th>Créneau Horaire</th>
                  <th>Durée</th>
                  <th>Tarif/h Classe</th>
                  <th>Salaire Dû</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((s, i) => (
                  <tr key={s._id}>
                    <td style={{ textAlign: 'center' }}>{i + 1}</td>
                    <td>{new Date(s.dateShift).toLocaleDateString('fr-FR')}</td>
                    <td style={{ fontWeight: 'bold' }}>{s.teacherName}</td>
                    <td style={{ fontWeight: 'bold' }}>{s.classe}</td>
                    <td>{s.matiere}</td>
                    <td>{s.heureDebut} à {s.heureFin}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{s.heuresEffectuees} h</td>
                    <td style={{ textAlign: 'right' }}>{s.tarifHoraireApplique ? s.tarifHoraireApplique.toLocaleString() : 0} Ar/h</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{s.salaireTotal ? s.salaireTotal.toLocaleString() : 0} Ar</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{s.statutPaiement.toUpperCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="print-footer-signatures">
              <div className="print-signature-box">
                <div>Le Gestionnaire Financier</div>
                <div className="print-signature-line">Signature & Date</div>
              </div>
              <div className="print-signature-box">
                <div>Le Proviseur / Directeur</div>
                <div className="print-signature-line">Signature & Cachet</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EN-TÊTE ÉCRAN */}
      <div className="page-header no-print">
        <div>
          <h1 className="page-title">
            <UserCheck size={28} style={{ color: 'var(--primary)' }} />
            <span>Gestion du Pointage & Tarifs des Professeurs</span>
          </h1>
          <p className="page-subtitle">Calcul automatique des heures de cours et salaire horaire individualisé par classe (Ariary)</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={handlePrintRegister}>
            <Printer size={18} style={{ color: 'var(--primary)' }} />
            <span>Imprimer le Registre</span>
          </button>

          <button className="btn-secondary" onClick={() => setShowAddTeacherModal(true)}>
            <UserCheck size={18} style={{ color: 'var(--primary)' }} />
            <span>+ Nouveau Professeur</span>
          </button>

          <button className="btn-primary" onClick={() => setShowAddPointageModal(true)}>
            <PlusCircle size={18} />
            <span>+ Enregistrer un Pointage</span>
          </button>
        </div>
      </div>

      {/* BARRE DE NAVIGATION : 3 ONGLETS */}
      <div className="no-print" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveTab('pointage')}
          className={activeTab === 'pointage' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.75rem 1.25rem', fontSize: '0.95rem', fontWeight: '800', gap: '8px' }}
        >
          <Clock size={18} />
          <span>Pointage & Heures Effectuées ({shifts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profs')}
          className={activeTab === 'profs' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.75rem 1.25rem', fontSize: '0.95rem', fontWeight: '800', gap: '8px' }}
        >
          <UserCheck size={18} />
          <span>Liste des Professeurs & Tarifs par Classe ({teachers.length})</span>
        </button>
      </div>

      {/* ONGLET 1 : POINTAGE & HEURES EFFECTUÉES */}
      {activeTab === 'pointage' && (
        <>
          {/* KPI CARDS POINTAGE */}
          <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem', marginBottom: '0.65rem' }}>
            <div className="card-panel" style={{ padding: '1.25rem', margin: 0 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>Heures Effectuées Cumulées</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.2rem' }}>
                {totalHours} Heures
              </div>
            </div>

            <div className="card-panel" style={{ padding: '1.25rem', margin: 0 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>Salaire Total Dû</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {totalSalary.toLocaleString()} Ariary
              </div>
            </div>

            <div className="card-panel" style={{ padding: '1.25rem', margin: 0, borderLeft: '4px solid var(--primary)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700' }}>Total Réglé aux Profs</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.2rem' }}>
                {paidSalary.toLocaleString()} Ariary
              </div>
            </div>

            <div className="card-panel" style={{ padding: '1.25rem', margin: 0, borderLeft: '4px solid var(--accent-amber)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', fontWeight: '700' }}>Reste À Payer (En attente)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-amber)', marginTop: '0.2rem' }}>
                {pendingSalary.toLocaleString()} Ariary
              </div>
            </div>
          </div>

          {/* BANNIÈRE DE FILTRE PROFESSEUR ACTIF */}
          {filterTeacher !== 'Tous' && (
            <div className="no-print" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--primary)', padding: '0.75rem 1.25rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
                <Eye size={18} />
                <span>Pointage & Heures filtrés pour : {teachers.find(t => t._id === filterTeacher)?.nom} {teachers.find(t => t._id === filterTeacher)?.prenom}</span>
              </div>
              <button
                className="btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '4px' }}
                onClick={() => setFilterTeacher('Tous')}
              >
                <X size={14} />
                <span>Voir tous les professeurs</span>
              </button>
            </div>
          )}

          {/* BARRE DE FILTRES ET DE MODE DE VUE (GRILLE VS LISTE) */}
          <div className="card-panel no-print" style={{ marginBottom: '0.65rem', padding: '0.5rem 0.75rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>Filtrer le pointage par :</div>
              
              <select className="form-input" style={{ width: 'auto' }} value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
                <option value="Toutes">Toutes les classes</option>
                {classesList.map(c => (
                  <option key={c} value={c}>Classe de {c}</option>
                ))}
              </select>

              <select className="form-input" style={{ width: 'auto' }} value={filterTeacher} onChange={(e) => setFilterTeacher(e.target.value)}>
                <option value="Tous">Tous les professeurs</option>
                {teachers.map(t => (
                  <option key={t._id} value={t._id}>{t.nom} {t.prenom}</option>
                ))}
              </select>

              {/* COMMUTATEUR DE VUE : EMPLOI DU TEMPS GRILLE VS REGISTRE LISTE */}
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                <button
                  type="button"
                  onClick={() => setPointageViewMode('grid')}
                  className={pointageViewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', gap: '6px' }}
                >
                  <LayoutGrid size={16} />
                  <span>Emploi du Temps (Grille)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPointageViewMode('list')}
                  className={pointageViewMode === 'list' ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', gap: '6px' }}
                >
                  <List size={16} />
                  <span>Liste & Registre</span>
                </button>
              </div>
            </div>
          </div>

          {/* MODE 1 : VUE EMPLOI DU TEMPS (GRILLE SUPER COMPACTE SANS MOLETTE) */}
          {pointageViewMode === 'grid' && (
            <div className="card-panel no-print" style={{ marginBottom: '0.75rem', padding: '0.65rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={20} style={{ color: 'var(--primary)' }} />
                  <span>Grille du Pointage (Format Emploi du Temps)</span>
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  💡 Modifiez directement les profs, heures et durées dans chaque carré !
                </span>
              </div>

              {loading ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement de l'emploi du temps...</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '95px repeat(6, 1fr)', gap: '0.35rem', width: '100%' }}>
                    {/* EN-TÊTE JOURS */}
                    <div style={{ background: 'var(--bg-dark)', padding: '0.75rem', borderRadius: '8px', fontWeight: '800', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Périodes / Créneaux
                    </div>
                    {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(day => (
                      <div key={day} style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--primary)', padding: '0.35rem 0.2rem', borderRadius: '6px', fontWeight: '800', textAlign: 'center', color: 'var(--primary)', fontSize: '0.8rem' }}>
                        {day}
                      </div>
                    ))}

                    {/* 4 LIGNES DE CRÉNEAUX HORAIRES */}
                    {[
                      { label: '1ère Heure', slotIndex: 0, defaultTimes: '08:00 - 10:00' },
                      { label: '2ème Heure', slotIndex: 1, defaultTimes: '10:00 - 12:00' },
                      { label: '3ème Heure', slotIndex: 2, defaultTimes: '13:00 - 15:00' },
                      { label: '4ème Heure', slotIndex: 3, defaultTimes: '15:00 - 17:00' }
                    ].map(slot => (
                      <React.Fragment key={slot.label}>
                        {/* COLONNE GAUCHE CRÉNEAU */}
                        <div style={{ background: 'var(--bg-dark)', padding: '0.35rem 0.2rem', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                          <span style={{ fontWeight: '800', fontSize: '0.75rem', color: 'var(--text-main)' }}>{slot.label}</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{slot.defaultTimes}</span>
                        </div>

                        {/* 6 CASES JOURS (LUNDI À SAMEDI) */}
                        {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(dayName => {
                          const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                          const cellShifts = shifts.filter(s => {
                            const d = new Date(s.dateShift);
                            const day = daysOfWeek[d.getDay()];
                            if (day !== dayName) return false;
                            const startH = Number((s.heureDebut || '08:00').split(':')[0]);
                            if (slot.slotIndex === 0 && startH < 10) return true;
                            if (slot.slotIndex === 1 && startH >= 10 && startH < 13) return true;
                            if (slot.slotIndex === 2 && startH >= 13 && startH < 15) return true;
                            if (slot.slotIndex === 3 && startH >= 15) return true;
                            return false;
                          });

                          return (
                            <div
                              key={`${dayName}-${slot.slotIndex}`}
                              style={{
                                background: 'var(--bg-dark)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                padding: '0.25rem',
                                minHeight: '110px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              {cellShifts.length === 0 ? (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                  <button
                                    type="button"
                                    className="btn-secondary"
                                    style={{ borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.15)', color: 'var(--text-muted)', padding: '0.25rem 0.3rem', fontSize: '0.7rem', width: '100%', justifyContent: 'center' }}
                                    onClick={() => handleOpenQuickAddShift(dayName, slot.slotIndex)}
                                  >
                                    + Pointer ce créneau
                                  </button>
                                </div>
                              ) : (
                                cellShifts.map(s => (
                                  <EditableShiftCard
                                    key={s._id}
                                    s={s}
                                    classesList={classesList}
                                    handleQuickUpdateShift={handleQuickUpdateShift}
                                    openReceiptForShift={openReceiptForShift}
                                    handleOpenEditShift={handleOpenEditShift}
                                    handleDeleteShift={handleDeleteShift}
                                    handleTogglePayShift={handleTogglePayShift}
                                  />
                                ))
                              )}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE 2 : VUE LISTE REGISTRE EN TABLEAU */}
          {pointageViewMode === 'list' && (
            <div className="card-panel no-print">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={20} style={{ color: 'var(--primary)' }} />
                  <span>Registre Général des Pointages</span>
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  💡 Cliquez sur "Modifier" pour rectifier un créneau ou des heures
                </span>
              </div>

              {loading ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement des pointages...</div>
              ) : shifts.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Aucun pointage enregistré pour le moment.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Professeur</th>
                        <th>Classe</th>
                        <th>Matière</th>
                        <th>Créneau Horaire</th>
                        <th style={{ textAlign: 'center' }}>Heures</th>
                        <th style={{ textAlign: 'right' }}>Tarif/h Classe</th>
                        <th style={{ textAlign: 'right' }}>Salaire Dû</th>
                        <th style={{ textAlign: 'center' }}>Statut Règlement</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shifts.map((s) => (
                        <tr key={s._id}>
                          <td style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                            {new Date(s.dateShift).toLocaleDateString('fr-FR')}
                          </td>
                          <td style={{ fontWeight: '700', fontSize: '0.95rem' }}>{s.teacherName}</td>
                          <td><span className="badge badge-green">{s.classe}</span></td>
                          <td>{s.matiere}</td>
                          <td style={{ fontSize: '0.85rem' }}>{s.heureDebut} - {s.heureFin}</td>
                          <td style={{ textAlign: 'center', fontWeight: '800', color: 'var(--primary)' }}>
                            {s.heuresEffectuees} h
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: '600' }}>
                            {s.tarifHoraireApplique ? s.tarifHoraireApplique.toLocaleString() : 0} Ar/h
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--primary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                              <input
                                type="number"
                                className="form-input"
                                style={{ width: '90px', padding: '0.2rem 0.4rem', fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary)', textAlign: 'right' }}
                                defaultValue={s.salaireTotal || 0}
                                onBlur={(e) => {
                                  const val = Number(e.target.value);
                                  if (!isNaN(val) && val >= 0 && val !== s.salaireTotal) {
                                    handleQuickUpdateShift(s, { salaireTotal: val });
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const val = Number(e.target.value);
                                    if (!isNaN(val) && val >= 0) {
                                      handleQuickUpdateShift(s, { salaireTotal: val });
                                    }
                                  }
                                }}
                                title="Cliquer pour modifier directement le montant du pointage (en Ariary)"
                              />
                              <span style={{ fontSize: '0.8rem' }}>Ar</span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleTogglePayShift(s)}
                              className={`badge ${s.statutPaiement === 'Payé' ? 'badge-green' : 'badge-amber'}`}
                              style={{ border: 'none', cursor: 'pointer', padding: '0.35rem 0.75rem' }}
                              title="Cliquer pour valider le règlement et générer le reçu"
                            >
                              {s.statutPaiement === 'Payé' ? '✓ Payé' : '⏳ En attente'}
                            </button>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                              <button
                                className="btn-secondary"
                                style={{ padding: '0.35rem 0.65rem', color: '#60A5FA', borderColor: 'rgba(96, 165, 250, 0.3)', gap: '4px' }}
                                onClick={() => handleOpenEditShift(s)}
                                title="Modifier ce pointage"
                              >
                                <Edit3 size={14} />
                                <span style={{ fontSize: '0.78rem' }}>Modifier</span>
                              </button>
                              <button
                                className="btn-secondary"
                                style={{ padding: '0.35rem 0.65rem', color: 'var(--primary)', borderColor: 'rgba(16, 185, 129, 0.3)', gap: '4px' }}
                                onClick={() => openReceiptForShift(s)}
                                title="Voir / Imprimer le reçu de ce paiement"
                              >
                                <Receipt size={14} />
                                <span style={{ fontSize: '0.78rem' }}>Reçu</span>
                              </button>
                              <button
                                className="btn-secondary"
                                style={{ padding: '0.35rem 0.6rem', color: '#F87171', borderColor: 'rgba(248, 113, 113, 0.3)' }}
                                onClick={() => handleDeleteShift(s._id)}
                                title="Supprimer le pointage"
                              >
                                <Trash2 size={14} />
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
          )}
        </>
      )}

      {/* ONGLET 2 : LISTE DES PROFESSEURS & TARIFS DIVISÉS PAR CLASSE */}
      {activeTab === 'profs' && (
        <div className="card-panel no-print">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={20} style={{ color: 'var(--primary)' }} />
              <span>Grille des Tarifs Horaires par Classe (Ariary / Heure)</span>
            </h3>
            <button className="btn-primary" onClick={() => setShowAddTeacherModal(true)}>
              <PlusCircle size={17} />
              <span>Ajouter un Professeur</span>
            </button>
          </div>

          {teachers.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Aucun professeur enregistré dans la base de données.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Professeur</th>
                    <th>Téléphone</th>
                    <th>Matières Enseignées</th>
                    <th style={{ textAlign: 'center', color: 'var(--primary)' }}>Tarif 3ème</th>
                    <th style={{ textAlign: 'center', color: 'var(--primary)' }}>Tarif Terminale S</th>
                    <th style={{ textAlign: 'center', color: 'var(--primary)' }}>Tarif Terminale L</th>
                    <th style={{ textAlign: 'center', color: 'var(--primary)' }}>Tarif Terminale OSE</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t) => {
                    const getRate = (clsName) => {
                      if (!t.tarifsHoraires) return '15 000 Ar';
                      const found = t.tarifsHoraires.find(r => r.classe === clsName);
                      return found ? `${found.tarifHeure.toLocaleString()} Ar/h` : '15 000 Ar/h';
                    };

                    return (
                      <tr key={t._id}>
                        <td style={{ fontWeight: '800', fontSize: '0.95rem' }}>{t.nom} {t.prenom}</td>
                        <td>{t.telephone || '—'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {t.matieres && t.matieres.map((m, idx) => (
                              <span key={idx} className="badge badge-green" style={{ fontSize: '0.75rem' }}>{m}</span>
                            ))}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: '800', color: 'var(--primary)' }}>{getRate('3ème')}</td>
                        <td style={{ textAlign: 'center', fontWeight: '800', color: 'var(--primary)' }}>{getRate('Terminale S')}</td>
                        <td style={{ textAlign: 'center', fontWeight: '800', color: 'var(--primary)' }}>{getRate('Terminale L')}</td>
                        <td style={{ textAlign: 'center', fontWeight: '800', color: 'var(--primary)' }}>{getRate('Terminale OSE')}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button
                              className="btn-primary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem', gap: '5px' }}
                              onClick={() => handleViewTeacherPointage(t._id)}
                              title="Consulter le pointage et les heures de ce professeur"
                            >
                              <Eye size={14} />
                              <span>Voir le pointage</span>
                            </button>
                            <button
                              className="btn-secondary"
                              style={{ padding: '0.35rem 0.6rem', color: '#F87171', borderColor: 'rgba(248, 113, 113, 0.3)' }}
                              onClick={() => handleDeleteTeacher(t._id)}
                              title="Supprimer le professeur"
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
      )}

      {/* MODAL ENREGISTRER UN POINTAGE */}
      {showAddPointageModal && (
        <div className="modal-overlay" onClick={() => setShowAddPointageModal(false)}>
          <div className="auth-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="page-header" style={{ marginBottom: '1.25rem' }}>
              <h3 className="page-title" style={{ fontSize: '1.2rem' }}>Enregistrer un Pointage de Cours</h3>
              <button className="btn-secondary" onClick={() => setShowAddPointageModal(false)} style={{ padding: '0.35rem' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePointage}>
              <div className="form-group">
                <label className="form-label">Nom du Professeur *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Tapez le nom du professeur..."
                  value={teacherNameInput}
                  onChange={(e) => setTeacherNameInput(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Classe du Cours *</label>
                  <select
                    className="form-input"
                    value={selectedClasse}
                    onChange={(e) => setSelectedClasse(e.target.value)}
                    required
                  >
                    {classesList.map(c => (
                      <option key={c} value={c}>Classe de {c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Matière Enseignée</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Mathématiques"
                    value={matiere}
                    onChange={(e) => setMatiere(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={dateShift}
                    onChange={(e) => setDateShift(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Heure Début</label>
                  <input
                    type="time"
                    className="form-input"
                    value={heureDebut}
                    onChange={(e) => setHeureDebut(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Heure Fin</label>
                  <input
                    type="time"
                    className="form-input"
                    value={heureFin}
                    onChange={(e) => setHeureFin(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Résumé & Modification du Prix du Pointage */}
              <div style={{ background: 'var(--bg-dark)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tarif horaire appliqué (Ariary/h) :</span>
                  <input
                    type="number"
                    className="form-input"
                    style={{ width: '120px', padding: '0.25rem 0.5rem', textAlign: 'right' }}
                    value={customTarifHoraire !== '' ? customTarifHoraire : getSelectedTeacherClassRate()}
                    onChange={(e) => {
                      setCustomTarifHoraire(e.target.value);
                      const rate = Number(e.target.value);
                      setCustomSalaireTotal(Math.round(getCalculatedHours() * rate));
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Durée calculée du cours :</span>
                  <strong style={{ color: 'var(--text-main)' }}>{getCalculatedHours()} heure(s)</strong>
                </div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.35rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '800' }}>
                  <span>Prix / Salaire Total du Pointage (Modifiable) :</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: '140px', padding: '0.3rem 0.5rem', fontSize: '1rem', fontWeight: '800', color: 'var(--primary)', textAlign: 'right' }}
                      value={customSalaireTotal !== '' ? customSalaireTotal : Math.round(getCalculatedHours() * (customTarifHoraire ? Number(customTarifHoraire) : getSelectedTeacherClassRate()))}
                      onChange={(e) => setCustomSalaireTotal(e.target.value)}
                    />
                    <span style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>Ar</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Remarque / Chapitre étudié</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Équations différentielles, Travaux Pratiques..."
                  value={remarque}
                  onChange={(e) => setRemarque(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.85rem' }}>
                Enregistrer le Pointage du Cours
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ÉDITER UN POINTAGE EXISTANT */}
      {showEditPointageModal && (
        <div className="modal-overlay" onClick={() => setShowEditPointageModal(false)}>
          <div className="auth-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="page-header" style={{ marginBottom: '1.25rem' }}>
              <h3 className="page-title" style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={20} style={{ color: '#60A5FA' }} />
                <span>Modifier le Pointage de Cours</span>
              </h3>
              <button className="btn-secondary" onClick={() => setShowEditPointageModal(false)} style={{ padding: '0.35rem' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdatePointage}>
              <div className="form-group">
                <label className="form-label">Nom du Professeur *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Tapez le nom du professeur..."
                  value={editTeacherName}
                  onChange={(e) => setEditTeacherName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Classe du Cours *</label>
                  <select
                    className="form-input"
                    value={editClasse}
                    onChange={(e) => setEditClasse(e.target.value)}
                    required
                  >
                    {classesList.map(c => (
                      <option key={c} value={c}>Classe de {c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Matière Enseignée</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Mathématiques"
                    value={editMatiere}
                    onChange={(e) => setEditMatiere(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={editDateShift}
                    onChange={(e) => setEditDateShift(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Heure Début</label>
                  <input
                    type="time"
                    className="form-input"
                    value={editHeureDebut}
                    onChange={(e) => setEditHeureDebut(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Heure Fin</label>
                  <input
                    type="time"
                    className="form-input"
                    value={editHeureFin}
                    onChange={(e) => setEditHeureFin(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Résumé & Modification du Prix du Pointage */}
              <div style={{ background: 'var(--bg-dark)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tarif horaire appliqué (Ariary/h) :</span>
                  <input
                    type="number"
                    className="form-input"
                    style={{ width: '120px', padding: '0.25rem 0.5rem', textAlign: 'right' }}
                    value={editTarifHoraire !== '' ? editTarifHoraire : getEditTeacherClassRate()}
                    onChange={(e) => {
                      setEditTarifHoraire(e.target.value);
                      const rate = Number(e.target.value);
                      setEditSalaireTotal(Math.round(getEditCalculatedHours() * rate));
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Durée calculée du cours :</span>
                  <strong style={{ color: 'var(--text-main)' }}>{getEditCalculatedHours()} heure(s)</strong>
                </div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.35rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '800' }}>
                  <span>Prix / Salaire Total du Pointage (Modifiable) :</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: '140px', padding: '0.3rem 0.5rem', fontSize: '1rem', fontWeight: '800', color: 'var(--primary)', textAlign: 'right' }}
                      value={editSalaireTotal !== '' ? editSalaireTotal : Math.round(getEditCalculatedHours() * (editTarifHoraire ? Number(editTarifHoraire) : getEditTeacherClassRate()))}
                      onChange={(e) => setEditSalaireTotal(e.target.value)}
                    />
                    <span style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>Ar</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Remarque / Chapitre étudié</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Équations différentielles, Travaux Pratiques..."
                  value={editRemarque}
                  onChange={(e) => setEditRemarque(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '0.85rem' }}>
                  Enregistrer les Modifications
                </button>
                <button type="button" className="btn-secondary" style={{ padding: '0.85rem 1.25rem' }} onClick={() => setShowEditPointageModal(false)}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AJOUTER UN PROFESSEUR & TARIFS DIVISÉS PAR CLASSE */}
      {showAddTeacherModal && (
        <div className="modal-overlay" onClick={() => setShowAddTeacherModal(false)}>
          <div className="auth-card" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="page-header" style={{ marginBottom: '1.25rem' }}>
              <h3 className="page-title" style={{ fontSize: '1.2rem' }}>Ajouter un Professeur & Tarifs par Classe</h3>
              <button className="btn-secondary" onClick={() => setShowAddTeacherModal(false)} style={{ padding: '0.35rem' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Nom *</label>
                  <input type="text" className="form-input" placeholder="Ex: Ndiaye" value={nom} onChange={(e) => setNom(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Prénom *</label>
                  <input type="text" className="form-input" placeholder="Ex: Mamadou" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input type="text" className="form-input" placeholder="+221 77 123 45 67" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" placeholder="prof@edugestion.sn" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Matières Enseignées (séparées par une virgule)</label>
                <input type="text" className="form-input" placeholder="Ex: Mathématiques, Physique-Chimie" value={matieresInput} onChange={(e) => setMatieresInput(e.target.value)} />
              </div>

              {/* TARIFS DIVISÉS PAR CLASSE */}
              <div style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>
                  Tarifs Horaires Divisés par Classe (en Ariary / heure)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Tarif Classe 3ème</label>
                    <input type="number" className="form-input" value={tarif3eme} onChange={(e) => setTarif3eme(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tarif Terminale S</label>
                    <input type="number" className="form-input" value={tarifTermS} onChange={(e) => setTarifTermS(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tarif Terminale L</label>
                    <input type="number" className="form-input" value={tarifTermL} onChange={(e) => setTarifTermL(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tarif Terminale OSE</label>
                    <input type="number" className="form-input" value={tarifTermOSE} onChange={(e) => setTarifTermOSE(e.target.value)} required />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}>
                Enregistrer le Professeur & la Grille Tarifaire
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL APERÇU & IMPRESSION DU REÇU PROFESSEUR */}
      {showReceiptModal && activeReceipt && (
        <div className="modal-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="auth-card" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="page-header" style={{ marginBottom: '1.25rem' }}>
              <h3 className="page-title" style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={22} style={{ color: 'var(--primary)' }} />
                <span>Reçu de Paiement d'Honoraires</span>
              </h3>
              <button className="btn-secondary" onClick={() => setShowReceiptModal(false)} style={{ padding: '0.35rem' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: 'var(--bg-dark)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
              <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', color: 'var(--primary)', fontWeight: '800', marginBottom: '0.5rem' }}>
                N° {activeReceipt.recuNo}
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem' }}>
                {activeReceipt.teacherName}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.88rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Date du cours : </span>
                  <strong>{new Date(activeReceipt.dateShift).toLocaleDateString('fr-FR')}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Classe : </span>
                  <span className="badge badge-green" style={{ fontSize: '0.8rem' }}>{activeReceipt.classe}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Matière : </span>
                  <strong>{activeReceipt.matiere}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Créneau : </span>
                  <strong>{activeReceipt.heureDebut} à {activeReceipt.heureFin} ({activeReceipt.heuresEffectuees} h)</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Tarif horaire classe : </span>
                  <strong>{activeReceipt.tarifHoraireApplique ? activeReceipt.tarifHoraireApplique.toLocaleString() : 0} Ar / h</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Date de règlement : </span>
                  <strong>{activeReceipt.datePaiement}</strong>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-muted)' }}>Montant Total Payé :</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' }}>
                  {activeReceipt.salaireTotal ? activeReceipt.salaireTotal.toLocaleString() : 0} Ariary
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', padding: '0.75rem' }}
                onClick={handlePrintSingleReceipt}
              >
                <Printer size={18} />
                <span>Imprimer ce Reçu</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '0.75rem 1.25rem' }}
                onClick={() => setShowReceiptModal(false)}
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

export default TeacherPage;
