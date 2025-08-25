const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // Le lien avec le user authentifié
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
 photo: {
    type: String,
    default: '',
  },

  codeVisible: {
    type: String,
    unique: true,
    required: true,
  },
  qrcode: {
    type: String,
    unique: true,
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  photo: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
