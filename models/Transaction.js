const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
  type: { type: String, enum: ['game', 'recharge'], required: true },
  amount: { type: Number, required: true },
  operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // opérateur ayant validé
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
