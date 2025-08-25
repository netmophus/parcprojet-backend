// // models/rechargeModel.js
// const mongoose = require('mongoose');

// const rechargeSchema = new mongoose.Schema(
//   {
//     child: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Child',
//       required: true,
//     },

//     admin: {
//   type: mongoose.Schema.Types.ObjectId,
//   ref: 'User', // ✔ OK puisque 'admin' est juste un user avec role = 'admin'
// },

//    parent: {
//   type: mongoose.Schema.Types.ObjectId,
//   ref: 'User',
//   required: false, // ou simplement retire "required"
//   default: null,
// },

//     amount: {
//       type: Number,
//       required: true,
//     },
//   },
//   {
//     timestamps: true, // pour createdAt et updatedAt
//   }
// );

// module.exports = mongoose.model('Recharge', rechargeSchema);















const mongoose = require('mongoose');

const rechargeSchema = new mongoose.Schema(
  {
    child: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Child',
      default: null,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Le client est dans la collection User
      default: null,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt
  }
);

module.exports = mongoose.model('Recharge', rechargeSchema);
