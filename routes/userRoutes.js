const express = require('express');
const router = express.Router();
const {
  createUser,
  getAllUsers,
  updateUser,
  toggleUserStatus,
  // getAllParents,
  getUsers,
  getClients,
  getParents,
   createChild,
   getAllChildren,
     getMyChildren,
} = require('../controllers/userController');

const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
const  roleMiddleware  = require('../middleware/roleMiddleware');
const uploadChildPhoto = require('../middleware/uploadChildPhoto');


// Toutes les routes sont protégées par un admin
router.post('/', authMiddleware, isAdmin, createUser);
router.get('/', authMiddleware, isAdmin, getAllUsers);
router.put('/:id', authMiddleware, isAdmin, updateUser);
router.patch('/:id/status', authMiddleware, isAdmin, toggleUserStatus);
// router.get('/parents', authMiddleware,isAdmin,  getAllParents);

router.get('/clients', authMiddleware, roleMiddleware('caissier'), getClients);

router.get('/parents', authMiddleware, roleMiddleware('caissier'), getParents);


// Route de création d'enfant avec upload de photo
router.post(
  '/children',
  authMiddleware,
  roleMiddleware('caissier'),
  uploadChildPhoto, // 📸 gestion de l'upload
  createChild
);


router.get('/children', authMiddleware, roleMiddleware('caissier'), getAllChildren);



// 🔍 Route pour rechercher des utilisateurs (par rôle et/ou nom)
router.get('/', authMiddleware,isAdmin, getUsers);


// ➕ liste des enfants du parent connecté
router.get(
  '/children/mine',
  authMiddleware,
  roleMiddleware('parent'),
  getMyChildren
);

module.exports = router;
