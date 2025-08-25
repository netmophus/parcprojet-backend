const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: [
    {
      menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
      quantity: { type: Number, default: 1 },
      unitPrice: { type: Number },
      totalPrice: { type: Number },
      salePoint: { type: mongoose.Schema.Types.ObjectId, ref: 'SalePoint' },
    },
  ],
  totalAmount: Number,
  cardNumber: String,
  status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // agent
  clientTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClientTransactionHistory',
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
