const User = require('../models/User');
const PlayHistory = require('../models/PlayHistory');

const Child = require('../models/Child');

exports.playGame = async (req, res) => {
  try {
    const { qrcode, gameName } = req.body;

    // 🔍 Trouver l’enfant par qrcode
    const child = await Child.findOne({ qrcode }).populate('games');

    if (!child) {
      return res.status(404).json({ message: 'Enfant non trouvé avec ce QR code.' });
    }

    if (!child.isActive) {
      return res.status(403).json({ message: 'Compte enfant inactif.' });
    }

    const game = child.games.find((g) => g.name === gameName);
    if (!game) {
      return res.status(400).json({ message: 'Jeu non autorisé pour cet enfant.' });
    }

    if (child.balance < game.cost) {
      return res.status(400).json({ message: 'Solde insuffisant.' });
    }

    child.balance -= game.cost;
    await child.save();

    res.status(200).json({
      message: `🎮 ${child.name} a joué à ${game.name}`,
      newBalance: child.balance,
    });
  } catch (error) {
    console.error('Erreur jeu:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
