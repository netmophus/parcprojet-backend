const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Accès non autorisé, token manquant' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    req.user = user; // Attache l'utilisateur au `req`

       // ✅ Log utile pour debug
    console.log("✅ Utilisateur connecté :", user.role, '-', user.phone);

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};


// Autoriser uniquement les admins
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Accès refusé : Admin uniquement' });
};

module.exports = {
  authMiddleware,
  isAdmin,
};



