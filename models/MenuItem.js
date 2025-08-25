// // models/MenuItem.js

// const mongoose = require('mongoose');

// const menuItemSchema = new mongoose.Schema(
//   {
//     salePoint: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'SalePoint',
//       required: true,
//     },
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     description: {
//       type: String,
//       default: '',
//     },
//     price: {
//       type: Number,
//       required: true,
//     },
//     photo: {
//       type: String,
//       default: '',
//     },
//     isAvailable: {
//       type: Boolean,
//       default: true,
//     },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       default: null,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model('MenuItem', menuItemSchema);




// models/MenuItem.js
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    salePoint: { type: mongoose.Schema.Types.ObjectId, ref: 'SalePoint', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    photo: { type: String, default: '' },     // URL Cloudinary (secure_url)
    photoId: { type: String, default: '' },    // public_id (pour destroy/update)
    isAvailable: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
