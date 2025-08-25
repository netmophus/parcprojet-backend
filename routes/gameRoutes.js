const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware'); // ✅ destructuré ici

// Créer un jeu (réservé à l’admin)
router.post('/', authMiddleware, isAdmin, gameController.createGame);

// Obtenir tous les jeux
router.get('/', authMiddleware, gameController.getAllGames);

// Activer/Désactiver un jeu
router.put('/toggle/:id', authMiddleware, isAdmin, gameController.toggleGameStatus);

// Mettre à jour un jeu
router.put('/:id', authMiddleware, isAdmin, gameController.updateGame);

// Supprimer un jeu
router.delete('/:id', authMiddleware, isAdmin, gameController.deleteGame);

module.exports = router;

