// const User = require('../models/User');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');

// // Génère un token JWT
// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
// };

// // Enregistrement
// const register = async (req, res) => {
//   try {
//     const { name, phone, password, role } = req.body;

//     if (!name || !phone || !password || !role) {
//       return res.status(400).json({ message: 'Tous les champs sont requis' });
//     }

//     const userExists = await User.findOne({ phone });
//     if (userExists) {
//       return res.status(400).json({ message: 'Ce numéro est déjà utilisé' });
//     }

//     const newUser = new User({
//       name,
//       phone,
//       password,
//       role,
//       qrcode: `QR-${Date.now()}`,
//     });

//     await newUser.save();

//     res.status(201).json({
//       _id: newUser._id,
//       name: newUser.name,
//       phone: newUser.phone,
//       role: newUser.role,
//       token: generateToken(newUser._id),
//     });
//   } catch (err) {
//     res.status(500).json({ message: 'Erreur serveur', error: err.message });
//   }
// };

// // Connexion
// const login = async (req, res) => {
//   try {
//     const { phone, password } = req.body;
//      console.log('📥 Données reçues :', req.body); // <-- Ajout ici

//     const user = await User.findOne({ phone });
//     if (!user || !user.password) {
//       return res.status(400).json({ message: 'Utilisateur introuvable ou mot de passe absent' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Mot de passe incorrect' });
//     }

//     res.json({
//       _id: user._id,
//       name: user.name,
//       phone: user.phone,
//       role: user.role,
//       token: generateToken(user._id),
//     });
//   } catch (err) {
//     res.status(500).json({ message: 'Erreur serveur', error: err.message });
//   }
// };

// module.exports = { register, login };






const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Enregistrement
const register = async (req, res) => {
  try {
    const { name, phone, password, role } = req.body;
    if (!name || !phone || !password || !role) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }
    const userExists = await User.findOne({ phone });
    if (userExists) {
      return res.status(400).json({ message: 'Ce numéro est déjà utilisé' });
    }
    const newUser = new User({
      name,
      phone,
      password,
      role,
      qrcode: `QR-${Date.now()}`,
    });
    await newUser.save();

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      phone: newUser.phone,
      role: newUser.role,
      token: generateToken(newUser._id),
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Connexion
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user || !user.password) {
      return res.status(400).json({ message: 'Utilisateur introuvable ou mot de passe absent' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ➜ NOUVEAU: renvoie l'utilisateur courant (utilise ton authMiddleware)
const me = async (req, res) => {
  // grâce à ton middleware, req.user contient déjà l'utilisateur sans password
  const { _id, name, phone, role } = req.user || {};
  if (!_id) return res.status(404).json({ message: 'Utilisateur introuvable' });
  res.json({ _id, name, phone, role });
};

module.exports = { register, login, me };
