const Child = require('../models/Child');
const Recharge = require('../models/rechargeModel'); // Assure-toi d'importer ce modèle en haut
const mongoose = require('mongoose');

const QRCode = require('qrcode');
const Game = require('../models/Game'); // à importer en haut
const PlayHistory = require('../models/PlayHistory');
const cloudinary = require('../config/cloudinary');

// exports.playGame = async (req, res) => {
//   try {
//     const { qrcode, gameName } = req.body;

//     // 1. Trouver l’enfant actif
//     const child = await Child.findOne({ codeVisible: qrcode, isActive: true });
//     if (!child) return res.status(404).json({ message: 'Enfant non trouvé ou inactif.' });

//     // 2. Trouver le jeu
//     const game = await Game.findOne({ name: gameName, isActive: true });
//     if (!game) return res.status(404).json({ message: 'Jeu non trouvé.' });

//     // 3. Vérifier le solde
//     if (child.balance < game.price) {
//       return res.status(400).json({ message: `Solde insuffisant. Le jeu coûte ${game.price} F.` });
//     }

//     // 4. Déduire le prix et ajouter à la liste des jeux joués
//     child.balance -= game.price;
//     if (!child.games.includes(game._id)) {
//   child.games.push(game._id);
// }

//     await child.save();


//     // ✅ Sauvegarder dans l'historique
// await PlayHistory.create({
//   child: child._id,
//   gameName: game.name,
//   amountDeducted: game.price,
// });


//     res.json({ message: 'Jeu validé avec succès.', newBalance: child.balance });
//   } catch (error) {
//     console.error('Erreur playGame:', error);
//     res.status(500).json({ message: 'Erreur serveur.' });
//   }
// };

exports.playGame = async (req, res) => {
  try {
    const { codeVisible, gameName } = req.body;

    console.log("🎯 Requête reçue pour jouer :", { codeVisible, gameName });

    // 1. Trouver l’enfant actif avec le code visible complet
    const child = await Child.findOne({ codeVisible, isActive: true });
    console.log("👶 Enfant trouvé :", child ? child.name : "Aucun");

    if (!child) {
      return res.status(404).json({ message: 'Enfant non trouvé ou inactif.' });
    }

    // 2. Trouver le jeu
    const game = await Game.findOne({ name: gameName, isActive: true });
    console.log("🎮 Jeu trouvé :", game ? game.name : "Aucun");

    if (!game) {
      return res.status(404).json({ message: 'Jeu non trouvé.' });
    }

    // 3. Vérifier le solde
    if (child.balance < game.price) {
      return res.status(400).json({ message: `Solde insuffisant. Le jeu coûte ${game.price} F.` });
    }

    // 4. Déduire le prix et ajouter le jeu s’il n’a pas encore été joué
    child.balance -= game.price;

    if (!child.games) child.games = []; // en cas de champ manquant
    if (!child.games.includes(game._id)) {
      child.games.push(game._id);
    }

    await child.save();

    // ✅ 5. Sauvegarder dans l'historique
    await PlayHistory.create({
      child: child._id,
      gameName: game.name,
      amountDeducted: game.price,
    });

    console.log("✅ Jeu enregistré, nouveau solde :", child.balance);

    res.json({
      message: 'Jeu validé avec succès.',
      newBalance: child.balance,
    });
  } catch (error) {
    console.error('💥 Erreur playGame:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};


exports.generateQRCode = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    if (!child) return res.status(404).json({ message: 'Enfant non trouvé' });

    const qrData = `${child._id}`;
    const qrImage = await QRCode.toDataURL(qrData);

    res.status(200).json({ qrCode: qrImage });
  } catch (error) {
    console.error('Erreur QR Code :', error);
    res.status(500).json({ message: 'Erreur QR Code' });
  }
};


// Génère un code unique à 8 chiffres
// const generateVisibleCode = () => {
//   const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
//   const part2 = Math.floor(1000 + Math.random() * 9000); // ex : 4281
//   return `${part1}-${part2}`;
// };




// ✅ Créer un enfant (parent ou admin)
exports.createChild = async (req, res) => {
  try {
    const { name, birthDate, gender, photo } = req.body;

    const _id = new mongoose.Types.ObjectId();

    // Code visible (ABCD-1234)
    const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const part2 = Math.floor(1000 + Math.random() * 9000);
    const visibleCode = `${part1}-${part2}`;

    // ⚠️ Source photo : si tu envoies une URL “texte” (photo) on la garde,
    // sinon on prend l’upload Cloudinary (req.fileUrl)
    const photoUrl = req.fileUrl || photo || null;
    const photoPublicId = req.filePublicId || null;

    const newChild = new Child({
      _id,
      name,
      birthDate,
      gender,
      photo: photoUrl,
      photoPublicId,
      parent: req.user.role === 'parent' ? req.user._id : (req.body.parent || null),
      qrcode: _id.toString(),
      codeVisible: visibleCode,
    });

    await newChild.save();
    res.status(201).json(newChild);
  } catch (error) {
    console.error('Erreur création enfant :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};



// ✅ Récupérer tous les enfants (admin)
exports.getAllChildren = async (req, res) => {
  try {
    const children = await Child.find()
      .populate('parent', 'name phone'); // ✅ On garde uniquement le parent

    res.json(children);
  } catch (error) {
    console.error('Erreur getAllChildren:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};


// ✅ Récupérer les enfants d’un parent connecté
exports.getMyChildren = async (req, res) => {
  try {
    const children = await Child.find({ parent: req.user._id }).populate('games', 'name');
    res.json(children);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ✅ Détails d’un enfant
exports.getChildById = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id)
      .populate('games', 'name')
      .populate('parent', 'name phone');

    if (!child) return res.status(404).json({ message: 'Enfant non trouvé.' });

    res.json(child);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ✅ Modifier un enfant (admin ou parent uniquement s’il est le sien)



// exports.updateChild = async (req, res) => {
//   try {
//     const child = await Child.findById(req.params.id);
//     if (!child) return res.status(404).json({ message: 'Enfant non trouvé.' });

//     if (req.user.role === 'parent' && child.parent?.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: 'Accès interdit.' });
//     }

//     const { name, birthDate, gender, games, parent, photo } = req.body;

//     // Mises à jour de base
//     if (name !== undefined) child.name = name;
//     if (birthDate !== undefined) child.birthDate = birthDate;
//     if (gender !== undefined) child.gender = gender;
//     if (games !== undefined) child.games = games;
//     if (photo !== undefined) child.photo = photo;

//     // Mise à jour du parent : admin uniquement
//     if (req.user.role === 'admin') {
//       child.parent = parent || null; // autorise suppression du parent
//     }

//     if (req.body.codeVisible && req.user.role === 'admin') {
//   child.codeVisible = req.body.codeVisible;
// }


//     // Assurer le QR code
//     if (!child.qrcode) {
//       child.qrcode = child._id.toString();
//     }



//     await child.save();
//     res.json(child);
//   } catch (error) {
//     console.error('Erreur updateChild:', error);
//     res.status(500).json({ message: 'Erreur serveur.' });
//   }
// };




exports.updateChild = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    if (!child) return res.status(404).json({ message: 'Enfant non trouvé.' });

    if (req.user.role === 'parent' && child.parent?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès interdit.' });
    }

    const { name, birthDate, gender, games, parent, photo } = req.body;

    if (name !== undefined) child.name = name;
    if (birthDate !== undefined) child.birthDate = birthDate;
    if (gender !== undefined) child.gender = gender;
    if (games !== undefined) child.games = games;

    // 🔄 Gestion de la photo
    // - si req.fileUrl existe -> nouvelle photo Cloudinary uploadée
    // - sinon si "photo" texte est envoyé -> on remplace juste l’URL
    if (req.fileUrl) {
      // supprime l’ancienne si présente
      if (child.photoPublicId) {
        try { await cloudinary.uploader.destroy(child.photoPublicId); } catch (_) {}
      }
      child.photo = req.fileUrl;
      child.photoPublicId = req.filePublicId || child.photoPublicId;
    } else if (photo !== undefined) {
      // on accepte un remplacement par URL (externe) si tu le souhaites
      child.photo = photo;
    }

    // Mise à jour du parent : admin uniquement
    if (req.user.role === 'admin') {
      child.parent = parent || null;
    }

    if (req.body.codeVisible && req.user.role === 'admin') {
      child.codeVisible = req.body.codeVisible;
    }

    if (!child.qrcode) {
      child.qrcode = child._id.toString();
    }

    await child.save();
    res.json(child);
  } catch (error) {
    console.error('Erreur updateChild:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};





// ✅ Activer ou désactiver un enfant
exports.toggleChildStatus = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    if (!child) return res.status(404).json({ message: 'Enfant non trouvé.' });

    child.isActive = !child.isActive;
    await child.save();

    res.json({ message: `Enfant ${child.isActive ? 'activé' : 'désactivé'}.`, child });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ✅ Supprimer un enfant
exports.deleteChild = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    if (!child) return res.status(404).json({ message: 'Enfant non trouvé.' });

    if (child.photoPublicId) {
      try { await cloudinary.uploader.destroy(child.photoPublicId); } catch (_) {}
    }

    await child.deleteOne();
    res.json({ message: 'Enfant supprimé.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};


exports.rechargeChildBalance = async (req, res) => {
  try {
    const { amount } = req.body;
    const child = await Child.findById(req.params.id);

    if (!child) return res.status(404).json({ message: 'Enfant non trouvé.' });
    if (amount <= 0) return res.status(400).json({ message: 'Montant invalide.' });

    // Mise à jour du solde
    child.balance += amount;
    await child.save();

    // Création d’un historique de recharge
const recharge = new Recharge({
  child: child._id,
  parent: child.parent, // ou `req.user._id` si l'admin est aussi parent
  amount,
  admin: req.user._id, // ✅ ajoute cette ligne
});

    
    await recharge.save();

    res.json({ message: 'Solde rechargé avec succès.', balance: child.balance });
  } catch (err) {
    console.error('Erreur recharge solde:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};



exports.getChildByCodeVisible = async (req, res) => {
  try {
    const child = await Child.findOne({
      codeVisible: req.params.codeVisible,
      isActive: true,
    }).populate('parent', 'name phone');

    if (!child) return res.status(404).json({ message: 'Carte introuvable.' });

    res.json({
      _id: child._id,
      name: child.name,
      balance: child.balance,
      parent: {
        name: child.parent?.name || '',
        phone: child.parent?.phone || '',
      },
    });
  } catch (error) {
    console.error('Erreur getChildByCodeVisible:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};


// ✅ Historique des recharges d’un enfant donné (accessible par le parent ou l'admin)
exports.getRechargeHistory = async (req, res) => {
  try {
    const { childId } = req.params;

    const query = { child: childId };

    // Si l'utilisateur est un parent, il ne peut voir que ses propres enfants
    if (req.user.role === 'parent') {
      query.parent = req.user._id;
    }

const recharges = await Recharge.find({ child: childId })
  .populate('admin', 'name phone role') // ✔ pour que le frontend ait accès à admin.name
  .sort({ createdAt: -1 });


    res.json(recharges);
  } catch (error) {
    console.error('Erreur récupération historique :', error); // 🛑 Log complet ici
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};


exports.getAllRecharges = async (req, res) => {
  try {
    console.log('📥 Requête reçue pour récupérer toutes les recharges');

    
const recharges = await Recharge.find({ child: { $ne: null } })
  .sort({ createdAt: -1 })
  .limit(50)
  .populate('child', 'name codeVisible balance isActive')
  .populate({ path: 'parent', select: 'name phone', strictPopulate: false })
  .populate({ path: 'admin', select: 'name phone', strictPopulate: false });


    console.log('✅ Recharges récupérées avec succès :');
    console.log(recharges);

    res.json(recharges);
  } catch (error) {
    console.error('❌ Erreur getAllRecharges:', error.message);
    console.error('📌 Stack trace:', error.stack);
    res.status(500).json({ message: 'Erreur lors de la récupération des recharges' });
  }
};



// ✅ Rechercher un enfant par les 4 derniers chiffres de son code
// exports.findChildByLast4Code = async (req, res) => {
//   try {
//     const { last4 } = req.params;

//     if (!/^\d{4}$/.test(last4)) {
//       return res.status(400).json({ message: "Format invalide. Entrez 4 chiffres." });
//     }

//    const child = await Child.findOne({
//  codeVisible: { $regex: `${last4}$`, $options: 'i' },
//   isActive: true,
// })
// .populate('parent', 'name phone') // ✅ ceci ajoute le parent complet
// .populate('games', 'name cost');  // (optionnel) aussi pour les jeux


//     if (!child) return res.status(404).json({ message: "Enfant non trouvé." });

//     res.json(child);
//   } catch (error) {
//     console.error("Erreur findChildByLast4Code:", error);
//     res.status(500).json({ message: "Erreur serveur." });
//   }
// };



exports.findChildByLast4Code = async (req, res) => {
  try {
    const { last4 } = req.params;
    console.log("🔍 Requête reçue avec les 4 derniers chiffres :", last4);

    if (!/^\d{4}$/.test(last4)) {
      console.log("❌ Format invalide :", last4);
      return res.status(400).json({ message: "Format invalide. Entrez 4 chiffres." });
    }

    const regex = new RegExp(`${last4}$`, 'i');
    console.log("📌 Regex utilisée :", regex);

    const child = await Child.findOne({
      codeVisible: { $regex: regex },
      isActive: true,
    })
      .populate('parent', 'name phone')
    

    if (!child) {
      console.log("❗ Aucun enfant trouvé pour ce code.");
      return res.status(404).json({ message: "Enfant non trouvé." });
    }

    console.log("✅ Enfant trouvé :", child);
    res.json(child);
  } catch (error) {
    console.error("💥 Erreur dans findChildByLast4Code :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
