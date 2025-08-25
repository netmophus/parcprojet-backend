// controllers/salePointController.js

const SalePoint = require('../models/SalePoint');

// ➕ Créer un espace de vente
exports.createSalePoint = async (req, res) => {
  try {
    const { name, description, type } = req.body;

    const salePoint = await SalePoint.create({
      name,
      description,
      type,
      photo: req.file ? `/uploads/salepoints/${req.file.filename}` : '',
      createdBy: req.user._id,
    });

    res.status(201).json(salePoint);
  } catch (error) {
    console.error('Erreur création espace de vente:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};


// 📄 Liste des espaces de vente
exports.getAllSalePoints = async (req, res) => {
  try {
    const salePoints = await SalePoint.find().sort({ createdAt: -1 });
    res.json(salePoints);
  } catch (error) {
    console.error('Erreur chargement espaces de vente:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ✏️ Modifier un espace de vente
exports.updateSalePoint = async (req, res) => {
  try {
    const { name, description, type } = req.body;
    const salePoint = await SalePoint.findByIdAndUpdate(
      req.params.id,
      { name, description, type },
      { new: true }
    );
    if (!salePoint) return res.status(404).json({ message: 'Non trouvé' });

    res.json(salePoint);
  } catch (error) {
    console.error('Erreur modification espace de vente:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ❌ Supprimer un espace de vente
exports.deleteSalePoint = async (req, res) => {
  try {
    const deleted = await SalePoint.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Non trouvé' });

    res.json({ message: 'Espace supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression espace de vente:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
