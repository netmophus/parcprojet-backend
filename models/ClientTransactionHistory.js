const mongoose = require('mongoose');

const clientTransactionHistorySchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  cardNumber: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['debit', 'credit'],
    default: 'debit',
  },
  description: {
    type: String,
    default: '',
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  balanceBefore: {
    type: Number,
    required: true,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('ClientTransactionHistory', clientTransactionHistorySchema);
