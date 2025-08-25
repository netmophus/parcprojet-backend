const Game = require('../models/Game');

// ✅ Créer un nouveau jeu
exports.createGame = async (req, res) => {
  try {
    const { name, price, maxPlayers, operator } = req.body;

    if (!name || !price || !operator) {
      return res.status(400).json({ message: 'Nom, prix et opérateur sont requis.' });
    }

    const existing = await Game.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Ce jeu existe déjà.' });
    }

    const newGame = new Game({ name, price, maxPlayers, operator });
    await newGame.save();

    res.status(201).json(newGame);
  } catch (error) {
    console.error('Erreur création jeu :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};


// ✅ Récupérer tous les jeux
exports.getAllGames = async (req, res) => {
  try {
   const games = await Game.find().populate('operator', 'name phone').sort({ createdAt: -1 });

    res.json(games);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ✅ Activer / Désactiver un jeu
exports.toggleGameStatus = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Jeu non trouvé.' });
    }

    game.isActive = !game.isActive;
    await game.save();

    res.json({ message: `Jeu ${game.isActive ? 'activé' : 'désactivé'}.`, game });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ✅ Modifier un jeu
exports.updateGame = async (req, res) => {
  try {
    const { name, price, maxPlayers } = req.body;
    const updatedGame = await Game.findByIdAndUpdate(
      req.params.id,
      { name, price, maxPlayers },
      { new: true }
    );

    if (!updatedGame) {
      return res.status(404).json({ message: 'Jeu non trouvé.' });
    }

    res.json(updatedGame);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ✅ Supprimer un jeu
exports.deleteGame = async (req, res) => {
  try {
    const deleted = await Game.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Jeu non trouvé.' });
    }
    res.json({ message: 'Jeu supprimé.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
