// const express = require('express');
// const router = express.Router();
// const { registerClientWithCard, getAllClients, getClientByCodeVisible, rechargeClientBalance, getClientRecharges,  playClient} = require('../controllers/clientController');
// const { authMiddleware } = require('../middleware/authMiddleware');
// const roleMiddleware = require('../middleware/roleMiddleware');
// const uploadClient = require('../middleware/uploadClient');



// // 🔐 Création d’un client avec carte par l’admin ou caissier
// // router.post('/registerWithCard', authMiddleware, uploadClient, roleMiddleware('admin', 'caissier'), registerClientWithCard);


// router.post(
//   '/registerWithCard',
//   authMiddleware,
//   roleMiddleware('admin', 'caissier'),
//   uploadClient,
//   registerClientWithCard
// );




// router.get('/by-code/:codeVisible', authMiddleware, roleMiddleware('admin', 'caissier', 'agent'), getClientByCodeVisible);
// router.get('/recharges', authMiddleware, roleMiddleware('admin', 'caissier'), getClientRecharges);

// // 🔍 Liste des clients
// router.get('/', authMiddleware, roleMiddleware('admin', 'caissier'), getAllClients);

// router.post('/:id/recharge', authMiddleware, roleMiddleware('admin', 'caissier'), rechargeClientBalance);




// module.exports = router;






// routes/clientRoutes.js
const express = require('express');
const router = express.Router();

const {
  registerClientWithCard,
  getAllClients,
  getClientByCodeVisible,
  rechargeClientBalance,
  getClientRecharges,
  playClient, // ✅ on l’utilise vraiment (et il est exporté ci-dessous)
} = require('../controllers/clientController');

const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const uploadClient = require('../middleware/uploadClient');

// Création d’un client (admin/caissier)
router.post(
  '/registerWithCard',
  authMiddleware,
  roleMiddleware('admin', 'caissier'),
  uploadClient,
  registerClientWithCard
);

// Recherche par codeVisible (OK 4 derniers chiffres) — autorise aussi l’opérateur
router.get(
  '/by-code/:codeVisible',
  authMiddleware,
  roleMiddleware('admin', 'caissier', 'agent', 'operator'),
  getClientByCodeVisible
);

// Valider une partie pour un CLIENT
router.post(
  '/play',
  authMiddleware,
  roleMiddleware('operator', 'admin', 'caissier'),
  playClient
);

// Liste + recharges
router.get('/recharges', authMiddleware, roleMiddleware('admin', 'caissier'), getClientRecharges);
router.get('/', authMiddleware, roleMiddleware('admin', 'caissier'), getAllClients);
router.post('/:id/recharge', authMiddleware, roleMiddleware('admin', 'caissier'), rechargeClientBalance);

module.exports = router;
