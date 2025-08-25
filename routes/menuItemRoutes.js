// const express = require('express');
// const router = express.Router();

// const {
//   createMenuItem,
//   getMenuItemsBySalePoint,
//   updateMenuItem,
//   deleteMenuItem,
// } = require('../controllers/menuItemController');

// const { authMiddleware } = require('../middleware/authMiddleware');
// const roleMiddleware = require('../middleware/roleMiddleware');
// const uploadMenuPhoto = require('../middleware/uploadMenuPhoto');

// // ➕ Créer un menu (avec photo)


// router.post(
//   '/',
//   authMiddleware,
//   roleMiddleware('admin'),
//   uploadMenuPhoto.single('photo'), // ✅ Cela fonctionnera maintenant
//   createMenuItem
// );

// // 📄 Liste des menus d’un espace de vente
// router.get(
//   '/salepoint/:salePointId',
//   authMiddleware,
//   roleMiddleware('admin', 'agent'),
//   getMenuItemsBySalePoint
// );




// // ✏️ Modifier un menu
// router.put(
//   '/:id',
//   authMiddleware,
//   roleMiddleware('admin'),
//   uploadMenuPhoto.single('photo'),
//   updateMenuItem
// );

// // ❌ Supprimer un menu
// router.delete(
//   '/:id',
//   authMiddleware,
//   roleMiddleware('admin'),
//   deleteMenuItem
// );

// module.exports = router;




// routes/menuItemRoutes.js
const express = require('express');
const router = express.Router();

const {
  createMenuItem,
  getMenuItemsBySalePoint,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuItemController');

const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const uploadMenuPhoto = require('../middleware/uploadMenuPhoto'); // <-- mémoire

// ➕ Créer un menu (avec photo Cloudinary)
router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  uploadMenuPhoto.single('photo'),
  createMenuItem
);

// 📄 Liste des menus d’un espace de vente
router.get(
  '/salepoint/:salePointId',
  authMiddleware,
  roleMiddleware('admin', 'agent'),
  getMenuItemsBySalePoint
);

// ✏️ Modifier un menu
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  uploadMenuPhoto.single('photo'),
  updateMenuItem
);

// ❌ Supprimer un menu
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  deleteMenuItem
);

module.exports = router;
