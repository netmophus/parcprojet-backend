// const express = require('express');
// const router = express.Router();
// const { register, login } = require('../controllers/authController');

// // Route POST /api/auth/register
// router.post('/register', register);

// // Route POST /api/auth/login
// router.post('/login', login);

// module.exports = router;



const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me  → retourne {_id, name, phone, role} de l’utilisateur connecté
router.get('/me', authMiddleware, me);

module.exports = router;
