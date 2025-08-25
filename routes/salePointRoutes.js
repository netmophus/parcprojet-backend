// // routes/salePointRoutes.js

// const express = require('express');
// const router = express.Router();
// const {
//   createSalePoint,
//   getAllSalePoints,
//   updateSalePoint,
//   deleteSalePoint,
// } = require('../controllers/salePointController');
// const { authMiddleware } = require('../middleware/authMiddleware');
// const roleMiddleware = require('../middleware/roleMiddleware');

// // 🔐 Admin uniquement
// router.post('/', authMiddleware, roleMiddleware('admin'), createSalePoint);
// router.get('/', authMiddleware, roleMiddleware('admin'), getAllSalePoints);
// router.put('/:id', authMiddleware, roleMiddleware('admin'), updateSalePoint);
// router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteSalePoint);

// module.exports = router;




const express = require('express');
const router = express.Router();
const {
  createSalePoint,
  getAllSalePoints,
  updateSalePoint,
  deleteSalePoint,
} = require('../controllers/salePointController');

const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadSalePointPhoto'); // importe le middleware multer

// 🟡 Ajoute le middleware upload pour traiter 'multipart/form-data'
router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  upload.single('photo'), // 👈 AJOUT OBLIGATOIRE
  createSalePoint
);

router.get('/', authMiddleware, roleMiddleware('admin', 'agent'), getAllSalePoints);

router.put('/:id', authMiddleware, roleMiddleware('admin'), updateSalePoint);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteSalePoint);

module.exports = router;
