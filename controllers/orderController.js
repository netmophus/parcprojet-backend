const Order = require('../models/Order');
const Client = require('../models/Client');
const ClientTransactionHistory = require('../models/ClientTransactionHistory');
const { sendSMS } = require("../utils/sendSMS");



const confirmOrderAndPay = async (req, res) => {
  try {
    const { cardNumber, items, amount } = req.body;

    const client = await Client.findOne({ codeVisible: cardNumber }).populate('user');
    console.log("🧍‍♂️ Client récupéré via codeVisible :", {
  clientId: client._id,
  name: client?.user?.name,
  phone: client?.user?.phone,
  balance: client.balance,
  cardNumber: client.codeVisible,
});

    if (!client) {
      return res.status(404).json({ success: false, message: 'Carte non trouvée' });
    }

    if (client.balance < amount) {
      return res.status(400).json({ success: false, message: 'Solde insuffisant' });
    }

    const balanceBefore = client.balance;
    client.balance -= amount;
    const balanceAfter = client.balance;
    await client.save();

    // 🟢 Créer d'abord la transaction
    const transaction = await ClientTransactionHistory.create({
      client: client._id,
      cardNumber,
      amount,
      type: 'debit',
      description: 'Paiement de commande',
      balanceBefore,
      balanceAfter,
      createdBy: req.user.id,
    });

    // 🟢 Ensuite créer la commande en liant l’ID de la transaction
    const order = await Order.create({
      items: items.map((item) => ({
        menuItem: item.id,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.total,
        salePoint: item.salePointId || null,
      })),
      totalAmount: amount,
      cardNumber,
      status: 'paid',
      createdBy: req.user.id,
      clientTransaction: transaction._id, // ✅ maintenant transaction est bien défini
    });

    // 🟢 Optionnel : Mettre à jour la transaction avec l'ID de la commande si besoin
    transaction.order = order._id;
    await transaction.save();

    res.status(201).json({
      success: true,
      message: 'Commande enregistrée et paiement effectué',
      order,
    });

if (client?.user?.phone) {
  const smsMessage = `✅ Bonjour ${client.user.name}, votre paiement de ${amount} FCFA a été effectué avec succès. Solde restant : ${balanceAfter} FCFA. Merci pour votre achat.`;
  
  await sendSMS(client.user.phone, smsMessage);
}




  } catch (error) {
    console.error('Erreur paiement :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};


// 🟢 Créer une nouvelle commande (si besoin en dehors du paiement)
const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, cardNumber } = req.body;

    const newOrder = await Order.create({
      items: items.map((item) => ({
        menuItem: item.id,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.total,
        salePoint: item.salePointId || null,
      })),
      totalAmount,
      cardNumber,
      status: 'paid',
      createdBy: req.user.id,
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Erreur lors de la création de commande :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 🟢 Lister les commandes (par agent ou toutes)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.menuItem')
      .populate('items.salePoint')
      .populate('createdBy', 'name');

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des commandes' });
  }
};

// 🟢 Lister les commandes de l’agent connecté
const getOrdersByAgent = async (req, res) => {
  try {
    const orders = await Order.find({ createdBy: req.user.id })
      .populate('items.menuItem')
      .populate('items.salePoint');

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des commandes' });
  }
};



// 🟢 Historique des paiements de l’agent connecté
const getMyPaidOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments({
      createdBy: req.user.id,
      status: 'paid',
    });





    // const orders = await Order.find({
    //   createdBy: req.user.id,
    //   status: 'paid',
    // })
    //   .skip(skip)
    //   .limit(limit)
    //   .populate('items.menuItem')
    //   .populate('items.salePoint')
    //   .populate('clientTransaction')
    //   .sort({ createdAt: -1 });


const orders = await Order.find({
  createdBy: req.user.id,
  status: 'paid',
})
  .skip(skip)
  .limit(limit)
  .populate('items.menuItem')
  .populate('items.salePoint')
  .populate({
    path: 'clientTransaction',
    populate: {
      path: 'client',
      populate: {
        path: 'user',  // <- c’est ici qu’on atteint le nom et téléphone
        select: 'name phone',
      },
    },
  })
  .sort({ createdAt: -1 });




    res.status(200).json({
      orders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
       totalOrders // 👈 ici
    });
  } catch (error) {
    console.error('Erreur historique des paiements :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};



module.exports = {
  createOrder,
  getAllOrders,
  getOrdersByAgent,
  confirmOrderAndPay,
  getMyPaidOrders,
};
