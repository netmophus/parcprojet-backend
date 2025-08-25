const mongoose = require('mongoose');

const playHistorySchema = new mongoose.Schema({
  child: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gameName: { type: String, required: true },
  amountDeducted: { type: Number, required: true },
  playedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PlayHistory', playHistorySchema);
