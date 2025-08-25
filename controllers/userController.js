const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Child = require('../models/Child');
const path = require('path');

// exports.createChild = async (req, res) => {
//   try {
    
//     const { name, birthDate, gender, parent, balance } = req.body;


//     if (!name || !birthDate || !gender || !parent) {
//       return res.status(400).json({ message: 'Tous les champs sont requis' });
//     }

//     const filePath = req.file ? `/uploads/children/${req.file.filename}` : '';

//     // Exemple de génération de qrcode/codeVisible
//     const randomCode = Math.random().toString(36).substr(2, 8).toUpperCase();

//     const newChild = new Child({
//       name,
//       birthDate,
//       gender,
//       parent,
//       photo: filePath,
//       qrcode: randomCode,
//       codeVisible: randomCode,
//        balance: balance || 0,
//     });

//     await newChild.save();

//     res.status(201).json({ message: 'Enfant créé avec succès', child: newChild });
//   } catch (error) {
//     res.status(500).json({ message: 'Erreur serveur', error: error.message });
//   }
// };
exports.createChild = async (req, res) => {
  try {
    const { name, birthDate, gender, parent, balance } = req.body;

    if (!name || !birthDate || !gender || !parent) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    const filePath = req.file ? `/uploads/children/${req.file.filename}` : '';

    // ✅ Code qui se termine par 4 chiffres
    const letters = Math.random().toString(36).substr(2, 4).toUpperCase();
    const digits = Math.floor(1000 + Math.random() * 9000); // 4 chiffres
    const randomCode = `${letters}${digits}`;

    const newChild = new Child({
      name,
      birthDate,
      gender,
      parent,
      photo: filePath,
      qrcode: randomCode,
      codeVisible: randomCode,
      balance: balance || 0,
    });

    await newChild.save();

    res.status(201).json({ message: 'Enfant créé avec succès', child: newChild });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


exports.getClients = async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' }).sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};


exports.getParents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const parents = await User.find({ role: 'parent' })
      .skip(skip)
      .limit(limit)
      .select('-password') // Exclure le mot de passe
      .sort({ createdAt: -1 });

    const total = await User.countDocuments({ role: 'parent' });

    res.status(200).json({
      data: parents,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


exports.getAllChildren = async (req, res) => {
  try {
    const children = await Child.find()
      .populate('parent', 'name phone') // Associe le parent avec nom et téléphone
      .sort({ createdAt: -1 }); // Les plus récents d'abord

    res.status(200).json(children);
  } catch (error) {
    console.error('Erreur lors du chargement des enfants :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


// ✅ Créer un utilisateur (admin, opérateur, parent, enfant)
exports.createUser = async (req, res) => {
  try {
    const { name, role, phone, password, balance, qrcode } = req.body;

    // Unicité du numéro ou du qrcode
    const existing = await User.findOne({ $or: [{ phone }, { qrcode }] });
    if (existing) return res.status(400).json({ message: 'Téléphone ou QR code déjà utilisé' });

    if (role === 'admin') {
  return res.status(403).json({ message: 'Création d’administrateur non autorisée via cette interface' });
}

    const newUser = new User({ name, role, phone, password, balance, qrcode });
    await newUser.save();

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ✅ Récupérer tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ✅ Modifier un utilisateur
exports.updateUser = async (req, res) => {
  try {
    const { name, phone, balance } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.balance = balance !== undefined ? balance : user.balance;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ✅ Activer/Désactiver
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `Utilisateur ${user.isActive ? 'activé' : 'désactivé'}` });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};




// GET /api/users?role=parent&search=Jean
exports.getUsers = async (req, res) => {
  const { role, search } = req.query;

  const query = {};
  if (role) query.role = role;
  if (search) {
    query.name = { $regex: search, $options: 'i' }; // recherche insensible à la casse
  }

  const users = await User.find(query).limit(10); // Limite pour performance
  res.json(users);
};



// ➕ enfants du parent connecté
exports.getMyChildren = async (req, res) => {
  try {
    // req.user est rempli par authMiddleware
    const kids = await Child.find({ parent: req.user._id })
      .select('-__v')
      .sort({ createdAt: -1 });

    return res.json(kids);
  } catch (err) {
    console.error('getMyChildren error:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};