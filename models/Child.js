const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  birthDate: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ['masculin', 'féminin'],
    required: true,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // si un parent est enregistré
    default: null,
  },
 
  photo: {
    type: String, // URL de la photo (Cloudinary, etc.)
    default: '',
  },


   photoPublicId: { type: String },  // public_id Cloudinary

  qrcode: {
  type: String,
  unique: true,
  required: true,
},
  balance: {
    type: Number,
    default: 0,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  codeVisible: {
  type: String,
  unique: true,
  required: true,
},

  
//   games: [
//   {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Game',
//   }
// ],
  // 🔵 OPTIONNEL : Historique des jeux joués (à implémenter plus tard)
  // gamesHistory: [
  //   {
  //     game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
  //     playedAt: { type: Date, default: Date.now },
  //   }
  // ],

  // 🔵 OPTIONNEL : Historique des recharges de solde
  // recharges: [
  //   {
  //     amount: Number,
  //     date: { type: Date, default: Date.now },
  //     mode: String, // 'espèces', 'mobile money', etc.
  //   }
  // ],

  // 🔵 OPTIONNEL : Informations médicales (pour restrictions ou précautions)
  // medicalNotes: {
  //   type: String,
  //   default: '',
  // },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Child', childSchema);
