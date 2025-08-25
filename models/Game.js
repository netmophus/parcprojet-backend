const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  maxPlayers: { type: Number },
  operator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // chaque jeu doit être supervisé par un opérateur
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);
