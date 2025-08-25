const express = require('express');
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getOrdersByAgent,
  confirmOrderAndPay,
   getMyPaidOrders,
} = require('../controllers/orderController');

const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// 🔐 Créer une commande (si utilisé hors paiement)
router.post('/', authMiddleware, roleMiddleware('agent'), createOrder);

// 📋 Voir toutes les commandes (admin uniquement)
router.get('/', authMiddleware, roleMiddleware('admin'), getAllOrders);

// 📋 Voir les commandes d’un agent connecté
router.get('/my-orders', authMiddleware, roleMiddleware('agent'), getOrdersByAgent);

router.post(
  '/pay',
  authMiddleware,
  roleMiddleware('agent'),
  confirmOrderAndPay
);


router.get(
  '/my-payments',
  authMiddleware,
  roleMiddleware('agent'),
 getMyPaidOrders
);




module.exports = router;
