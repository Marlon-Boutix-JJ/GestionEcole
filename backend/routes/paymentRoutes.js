import express from 'express';
import Payment from '../models/Payment.js';

const router = express.Router();

// GET all payments
router.get('/', async (req, res) => {
  try {
    const { classe, statut, mois } = req.query;
    let filter = {};
    if (classe) filter.classe = classe;
    if (statut) {
      if (statut === 'Non payé') {
        filter.$or = [{ statut: 'Non payé' }, { moisPayes: { $size: 0 } }];
      } else if (statut === 'Payé') {
        filter.$or = [{ statut: { $in: ['Payé', 'À jour'] } }, { 'moisPayes.0': { $exists: true } }];
      } else {
        filter.statut = statut;
      }
    }
    if (mois) {
      filter.moisPayes = mois;
    }

    const payments = await Payment.find(filter).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Erreur chargement des écolages.' });
  }
});

// POST pay selected months (Selection Multiple)
router.post('/:id/pay-months', async (req, res) => {
  try {
    const { selectedMonths, methodePaiement, tarifMensuel } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Dossier d\'écolage non trouvé.' });
    }

    if (!Array.isArray(selectedMonths) || selectedMonths.length === 0) {
      return res.status(400).json({ message: 'Veuillez sélectionner au moins un mois à régler.' });
    }

    const tarif = tarifMensuel || payment.tarifMensuel || 150000;
    const montantTotalAriary = selectedMonths.length * tarif;
    const recuNo = `REC-${Date.now().toString().slice(-6)}`;

    // Add unique paid months
    selectedMonths.forEach((m) => {
      if (!payment.moisPayes.includes(m)) {
        payment.moisPayes.push(m);
      }
    });

    payment.montantPaye += montantTotalAriary;
    
    // Dès qu'au moins 1 mois est payé, le statut devient 'Payé' (ex: Payé 1/10 mois)
    payment.statut = payment.moisPayes.length > 0 ? 'Payé' : 'Non payé';

    const newReceipt = {
      recuNo,
      date: new Date(),
      montant: montantTotalAriary,
      methode: methodePaiement || 'Espèces',
      note: `Paiement écolage pour : ${selectedMonths.join(', ')}`,
      mois: selectedMonths.join(', ')
    };

    payment.historique.push(newReceipt);

    await payment.save();

    res.json({
      message: 'Paiement effectué avec succès.',
      payment,
      receipt: newReceipt
    });
  } catch (error) {
    console.error('Erreur règlement des mois:', error);
    res.status(500).json({ message: 'Erreur lors du traitement du paiement.' });
  }
});

// POST record generic payment installment
router.post('/:id/add', async (req, res) => {
  try {
    const { montant, methode, note, mois } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Dossier d\'écolage non trouvé.' });
    }

    const nMontant = Number(montant);
    if (isNaN(nMontant) || nMontant <= 0) {
      return res.status(400).json({ message: 'Montant invalide.' });
    }

    const recuNo = `REC-${Date.now().toString().slice(-6)}`;
    payment.montantPaye += nMontant;
    if (mois && !payment.moisPayes.includes(mois)) {
      payment.moisPayes.push(mois);
    }

    payment.historique.push({
      date: new Date(),
      montant: nMontant,
      recuNo,
      methode: methode || 'Espèces',
      note: note || `Paiement écolage`
    });

    payment.statut = payment.moisPayes.length >= 10 || payment.montantPaye >= payment.montantTotal ? 'Payé' : 'Non payé';

    await payment.save();
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Erreur enregistrement versement.' });
  }
});

// PUT update payment status or details directly
router.put('/:id', async (req, res) => {
  try {
    const { statut, mois, montantPaye, montantTotal } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Écolage non trouvé' });

    if (statut) payment.statut = statut;
    if (montantPaye !== undefined) {
      payment.montantPaye = Number(montantPaye);
    }
    if (montantTotal !== undefined) payment.montantTotal = Number(montantTotal);

    await payment.save();
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour écolage.' });
  }
});

export default router;
