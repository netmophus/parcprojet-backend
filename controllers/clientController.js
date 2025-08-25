// const User = require('../models/User');
// const Client = require('../models/Client');
// const bcrypt = require('bcryptjs');



// const Recharge = require('../models/rechargeModel'); // Assure-toi de l’avoir importé




// // controllers/clientController.js
// const registerClientWithCard = async (req, res) => {
//   try {
//     const { name, phone, password, birthDate, gender } = req.body;
//     if (!name || !phone || !password || !birthDate || !gender) {
//       return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
//     }

//     const phoneNorm = String(phone).trim();
//     const existingUser = await User.findOne({ phone: phoneNorm });
//     if (existingUser) {
//       return res.status(400).json({ message: 'Ce numéro est déjà utilisé' });
//     }

//     const ts = Date.now();
//     const codeVisible = `CL-${ts}`;
//     const qrcode = `QR-${ts}`;

//     // ✅ NE PAS hasher ici si le modèle s’en charge
//     const newUser = await User.create({
//       name,
//       phone: phoneNorm,
//       password,        // ← brut, le hook pre('save') va le hasher
//       role: 'client',
//       qrcode,
//     });

//     // URL Cloudinary posée par ton middleware uploadClient (si présent)
//     const photoUrl = req.fileUrl || null;
//     const photoPublicId = req.filePublicId || null;

//     const clientCard = await Client.create({
//       user: newUser._id,
//       codeVisible,
//       qrcode,
//       birthDate: new Date(birthDate),
//       gender,
//       photo: photoUrl,
//       photoPublicId,
//       balance: 0,
//     });

//     return res.status(201).json({
//       message: 'Client créé avec sa carte',
//       user: { id: newUser._id, name: newUser.name, phone: newUser.phone },
//       card: clientCard,
//     });
//   } catch (error) {
//     console.error('❌ Erreur création client :', error);
//     res.status(500).json({ message: 'Erreur serveur', error: error.message });
//   }
// };





// const getClientRecharges = async (req, res) => {
//   try {
//     const recharges = await Recharge.find({ client: { $ne: null } })
//       .sort({ createdAt: -1 })
//       .limit(50)
//       .populate('client', 'name phone');

//     res.json(recharges);
//   } catch (error) {
//     console.error('Erreur récupération recharges client :', error);
//     res.status(500).json({ message: 'Erreur serveur' });
//   }
// };




// const rechargeClientBalance = async (req, res) => {
//   try {
//     const clientId = req.params.id;
//     const { amount } = req.body;
//     const adminId = req.user._id; // Assuré par authMiddleware

//     const client = await Client.findById(clientId).populate('user');
//     if (!client) {
//       return res.status(404).json({ message: 'Client introuvable' });
//     }

//     // Mettre à jour le solde
//     client.balance += amount;
//     await client.save();

//     // Créer une entrée de recharge
//     await Recharge.create({
//       client: client.user._id,
//       admin: adminId,
//       amount,
//     });

//     res.status(200).json({ balance: client.balance });
//   } catch (error) {
//     console.error('❌ Erreur recharge client :', error);
//     res.status(500).json({ message: 'Erreur lors de la recharge' });
//   }
// };



// const getClientByCodeVisible = async (req, res) => {
//   try {
//     const { codeVisible } = req.params;
//     const client = await Client.findOne({ codeVisible }).populate('user');

//     if (!client) {
//       return res.status(404).json({ message: 'Client non trouvé' });
//     }

//     res.status(200).json({
//       _id: client._id,
//       name: client.user.name,
//       phone: client.user.phone,
//       balance: client.balance,
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Erreur serveur' });
//   }
// };




// // 📋 Liste des clients (avec leurs cartes)
// const getAllClients = async (req, res) => {
//   try {
//     const clients = await Client.find()
//       .populate('user', 'name phone createdAt')
//       .sort({ createdAt: -1 });

//     res.json(clients);
//   } catch (error) {
//     console.error('❌ Erreur récupération clients :', error);
//     res.status(500).json({ message: 'Erreur serveur' });
//   }
// };







// module.exports = {
//   registerClientWithCard,
//   getAllClients,
//   getClientByCodeVisible,
//   rechargeClientBalance,
//   getClientRecharges,
   
// };





// controllers/clientController.js
const User = require('../models/User');
const Client = require('../models/Client');
const Game = require('../models/Game');             // ✅ pour récupérer le prix du jeu
const Recharge = require('../models/rechargeModel');
const bcrypt = require('bcryptjs');                 // utile si tu hashes ici (sinon OK)

const registerClientWithCard = async (req, res) => {
  try {
    const { name, phone, password, birthDate, gender } = req.body;
    if (!name || !phone || !password || !birthDate || !gender) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }

    const phoneNorm = String(phone).trim();
    const existingUser = await User.findOne({ phone: phoneNorm });
    if (existingUser) {
      return res.status(400).json({ message: 'Ce numéro est déjà utilisé' });
    }

    const ts = Date.now();
    const codeVisible = `CL-${ts}`;
    const qrcode = `QR-${ts}`;

    // ⛔️ Si le hash est déjà fait ailleurs, laisse tel quel
    const newUser = await User.create({
      name,
      phone: phoneNorm,
      password,          // le hook pre('save') de User peut hasher
      role: 'client',
      qrcode,
    });

    const photoUrl = req.fileUrl || null;          // fourni par uploadClient (Cloudinary)
    const photoPublicId = req.filePublicId || null;

    const clientCard = await Client.create({
      user: newUser._id,
      codeVisible,
      qrcode,
      birthDate: new Date(birthDate),
      gender,
      photo: photoUrl,
      photoPublicId,
      balance: 0,
    });

    return res.status(201).json({
      message: 'Client créé avec sa carte',
      user: { id: newUser._id, name: newUser.name, phone: newUser.phone },
      card: clientCard,
    });
  } catch (error) {
    console.error('❌ Erreur création client :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// 🔎 Recherche client par code visible (accepte 4 derniers chiffres)
const getClientByCodeVisible = async (req, res) => {
  try {
    const raw = String(req.params.codeVisible || '').trim();
    const last4 = raw.slice(-4);

    const client = await Client.findOne({
      codeVisible: { $regex: `${last4}$`, $options: 'i' }
    }).populate('user', 'name phone isActive');

    if (!client) return res.status(404).json({ message: 'Client non trouvé' });
    if (client.user?.isActive === false) {
      return res.status(403).json({ message: 'Client inactif' });
    }

    return res.status(200).json({
      _id: client._id,
      codeVisible: client.codeVisible,
      qrcode: client.qrcode,
      name: client.user?.name,
      phone: client.user?.phone,
      balance: client.balance || 0,
      photo: client.photo || null,
      birthDate: client.birthDate || null,
      gender: client.gender || null,
    });
  } catch (error) {
    console.error('❌ getClientByCodeVisible:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ▶️ Valider une partie pour un CLIENT
const playClient = async (req, res) => {
  try {
    const { codeVisible, gameName } = req.body;
    if (!codeVisible || !gameName) {
      return res.status(400).json({ message: 'codeVisible et gameName sont requis' });
    }

    // on exige le code complet ici (tu peux passer en regex si tu veux)
    const client = await Client.findOne({ codeVisible }).populate('user', 'name isActive');
    if (!client) return res.status(404).json({ message: 'Client introuvable' });
    if (client.user?.isActive === false) {
      return res.status(403).json({ message: 'Client inactif' });
    }

    const game = await Game.findOne({ name: gameName, isActive: true });
    if (!game) return res.status(404).json({ message: 'Jeu introuvable' });

    const price = Number(game.price || 0);
    if ((client.balance || 0) < price) {
      return res.status(400).json({ message: 'Solde insuffisant' });
    }

    client.balance = (client.balance || 0) - price;
    await client.save();

    return res.json({
      message: `Partie "${game.name}" validée`,
      newBalance: client.balance
    });
  } catch (e) {
    console.error('❌ playClient:', e);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 📒 Historique recharges
const getClientRecharges = async (req, res) => {
  try {
    const recharges = await Recharge.find({ client: { $ne: null } })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('client', 'name phone');

    res.json(recharges);
  } catch (error) {
    console.error('Erreur récupération recharges client :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 💳 Recharge solde
const rechargeClientBalance = async (req, res) => {
  try {
    const clientId = req.params.id;
    const amount = Number(req.body.amount || 0);
    const adminId = req.user._id;

    if (!(amount > 0)) {
      return res.status(400).json({ message: 'Montant invalide' });
    }

    const client = await Client.findById(clientId).populate('user');
    if (!client) return res.status(404).json({ message: 'Client introuvable' });

    client.balance = (client.balance || 0) + amount;
    await client.save();

    await Recharge.create({
      client: client.user._id,
      admin: adminId,
      amount,
    });

    res.status(200).json({ balance: client.balance });
  } catch (error) {
    console.error('❌ Erreur recharge client :', error);
    res.status(500).json({ message: 'Erreur lors de la recharge' });
  }
};

// 📋 Liste des clients
const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find()
      .populate('user', 'name phone createdAt')
      .sort({ createdAt: -1 });

    res.json(clients);
  } catch (error) {
    console.error('❌ Erreur récupération clients :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  registerClientWithCard,
  getAllClients,
  getClientByCodeVisible,
  rechargeClientBalance,
  getClientRecharges,
  playClient,               // ✅ important pour éviter "handler must be a function"
};
