const express = require('express');
const router = express.Router();
const {
  createChild,
  getAllChildren,
  getMyChildren,
  getChildById,
  updateChild,
  toggleChildStatus,
  deleteChild,
  generateQRCode,
  rechargeChildBalance,
  getRechargeHistory,
  findChildByLast4Code,
  playGame,
  getChildByCodeVisible,
  getAllRecharges,
 
} = require('../controllers/childController');

const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
const  roleMiddleware  = require('../middleware/roleMiddleware');
const uploadChildPhoto = require('../middleware/uploadChildPhoto');

// ✅ Créer un enfant (parent ou admin)
// router.post('/', authMiddleware, createChild);

// Créer un enfant (parent/admin) + upload Cloudinary
router.post('/', authMiddleware, uploadChildPhoto, createChild);

// Modifier un enfant (si tu veux permettre de changer la photo)
router.put('/:id', authMiddleware, uploadChildPhoto, updateChild);

// ✅ Récupérer tous les enfants (admin seulement)
router.get('/', authMiddleware, isAdmin, getAllChildren);

// ✅ Récupérer les enfants du parent connecté
router.get('/mine', authMiddleware, getMyChildren);

// router.get('/search/:last4', authMiddleware, findChildByLast4Code);
router.get('/search-by-code/:last4', authMiddleware, findChildByLast4Code);


router.post('/play', authMiddleware, playGame);

router.get('/by-code/:codeVisible', authMiddleware, roleMiddleware('admin', 'caissier'), getChildByCodeVisible);

router.get('/recharges', authMiddleware, roleMiddleware('admin', 'caissier'), getAllRecharges);


// ✅ Détails d’un enfant
router.get('/:id', authMiddleware, getChildById);

// // ✅ Modifier un enfant
// router.put('/:id', authMiddleware, updateChild);

// ✅ Activer / désactiver (admin uniquement)
router.patch('/:id/status', authMiddleware, isAdmin, toggleChildStatus);

// ✅ Supprimer un enfant (admin uniquement)
router.delete('/:id', authMiddleware, isAdmin, deleteChild);

// ✅ Générer un QR Code pour un enfant donné
router.get('/:id/qrcode', authMiddleware, generateQRCode);

router.post('/:id/recharge', authMiddleware, roleMiddleware('admin', 'caissier'), rechargeChildBalance);


router.get('/history/:childId', authMiddleware, getRechargeHistory);

module.exports = router;
