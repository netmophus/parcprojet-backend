const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  role: {
    type: String,
    enum: ['admin', 'caissier', 'agent', 'operator', 'parent', 'child', 'client'],
    required: true,
  },

  phone: {
    type: String,
    unique: true,
    sparse: true, // tolère null tant qu'il n'est pas dupliqué
  },

  password: {
    type: String,
  },

  balance: {
    type: Number,
    default: 0,
  },

  qrcode: {
    type: String,
    unique: true,
    required: true,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

}, { timestamps: true });


// Hash du mot de passe avant enregistrement
userSchema.pre('save', async function (next) {
  const rolesWithPassword = ['admin', 'parent', 'operator', 'agent', 'caissier', 'client'];

  // Vérification des rôles nécessitant un mot de passe
  if (rolesWithPassword.includes(this.role) && !this.password) {
    return next(new Error('Password is required for this role'));
  }

  // Vérification du rôle enfant
  if (this.role === 'child') {
    if (this.password || this.phone) {
      return next(new Error('Child role must not have password or phone'));
    }
  }

  // Hash si mot de passe modifié
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});

// Méthode pour comparer les mots de passe
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

