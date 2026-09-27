const express = require('express');
const { createOrder, myOrders, getOrder, cancelOrder, allOrders, updateStatus, verifyPayment } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/my', protect, myOrders);
// admin list must come before /:id
router.get('/admin/all', protect, adminOnly, allOrders);
router.get('/:id', protect, getOrder);
router.post('/:id/cancel', protect, cancelOrder);
router.patch('/:id/status', protect, adminOnly, updateStatus);
router.post('/:id/verify-payment', protect, verifyPayment);

module.exports = router;
