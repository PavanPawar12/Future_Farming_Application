const mongoose = require('mongoose');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const { asyncHandler, ApiError, sendSuccess } = require('../utils/helpers');
const getRazorpay = require('../config/razorpay');

async function getDeliveryConfig() {
  const s = await Settings.findOne({ key: 'default' });
  return {
    deliveryCharge: s?.deliveryCharge ?? Number(process.env.DEFAULT_DELIVERY_CHARGE || 30),
    freeAbove: s?.freeDeliveryMinAmount ?? Number(process.env.FREE_DELIVERY_MIN_AMOUNT || 500),
  };
}

// POST /api/orders — COD or "create order + razorpay order"
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod = 'COD' } = req.body;
  if (!Array.isArray(items) || !items.length) throw new ApiError('Cart is empty', 400);
  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.addressLine)
    throw new ApiError('Valid delivery address required', 400);

  const allowedPM = ['COD', 'UPI', 'Card', 'NetBanking', 'Online'];
  if (!allowedPM.includes(paymentMethod)) throw new ApiError('Invalid payment method', 400);

  // Verify products, price & stock on backend. Decrement atomically.
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const orderItems = [];
    let subtotal = 0;
    for (const it of items) {
      if (!it.product || !it.quantity || it.quantity < 1) throw new ApiError('Invalid cart item', 400);
      const qty = Math.floor(Number(it.quantity));
      // Atomic stock decrement — prevents overselling
      const product = await Product.findOneAndUpdate(
        { _id: it.product, stock: { $gte: qty }, isAvailable: true },
        { $inc: { stock: -qty, sold: qty } },
        { new: true, session }
      ).populate('category', 'name');
      if (!product) throw new ApiError(`Insufficient stock or unavailable product (${it.product})`, 400);
      if (product.stock === 0) {
        product.isAvailable = false;
        await product.save({ session });
      }
      const lineTotal = product.price * qty;
      subtotal += lineTotal;
      orderItems.push({
        product: product._id, name: product.name,
        image: product.images?.[0] || '', price: product.price,
        unit: product.unit, quantity: qty, lineTotal,
      });
    }

    const { deliveryCharge, freeAbove } = await getDeliveryConfig();
    const charge = subtotal >= freeAbove ? 0 : deliveryCharge;
    const totalAmount = subtotal + charge;

    const isOnline = paymentMethod !== 'COD';

    const order = await Order.create(
      [{
        user: req.user._id, items: orderItems, shippingAddress,
        subtotal, deliveryCharge: charge, discount: 0, totalAmount,
        paymentMethod, paymentStatus: 'pending',
        orderStatus: 'pending',
      }],
      { session }
    );

    let razorpayOrder = null;
    if (isOnline) {
      const rzp = getRazorpay();
      if (!rzp) throw new ApiError('Online payments not configured', 500);
      razorpayOrder = await rzp.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        receipt: `order_${order[0]._id}`,
      });
      order[0].razorpayOrderId = razorpayOrder.id;
      await order[0].save({ session });
    }

    await session.commitTransaction();
    const saved = await Order.findById(order[0]._id).populate('user', 'name email phone');

    // realtime → admin room
    req.app.get('io')?.to('admin').emit('order:new', saved);
    req.app.get('io')?.emit('product:stock-changed', orderItems.map((i) => ({ product: i.product, quantity: i.quantity })));

    sendSuccess(res, isOnline ? 'Order created. Complete payment.' : 'Order placed successfully', {
      order: saved, razorpayOrder,
      razorpayKeyId: isOnline ? process.env.RAZORPAY_KEY_ID : undefined,
    }, 201);
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
});

const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  sendSuccess(res, 'Orders fetched', orders);
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) throw new ApiError('Order not found', 404);
  if (req.user.role !== 'admin' && String(order.user._id || order.user) !== String(req.user._id))
    throw new ApiError('Not authorized', 403);
  sendSuccess(res, 'Order fetched', order);
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw new ApiError('Order not found', 404);
  if (!['pending', 'confirmed'].includes(order.orderStatus))
    throw new ApiError('Order cannot be cancelled at this stage', 400);
  // restore stock
  for (const it of order.items) {
    await Product.findByIdAndUpdate(it.product, { $inc: { stock: it.quantity, sold: -it.quantity } });
  }
  const p = await Product.findOne({ _id: { $in: order.items.map((i) => i.product) }, stock: { $gt: 0 } });
  if (p && !p.isAvailable) { /* leave availability decision to admin restock */ }
  order.orderStatus = 'cancelled';
  order.cancelledAt = new Date();
  await order.save();
  req.app.get('io')?.to('admin').emit('order:updated', order);
  req.app.get('io')?.to(`user:${order.user}`).emit('order:updated', order);
  sendSuccess(res, 'Order cancelled', order);
});

// ADMIN
const allOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.orderStatus = status;
  const pg = Math.max(1, Number(page));
  const lim = Math.min(100, Number(limit));
  const [items, total] = await Promise.all([
    Order.find(filter).populate('user', 'name email phone').sort({ createdAt: -1 }).skip((pg - 1) * lim).limit(lim),
    Order.countDocuments(filter),
  ]);
  sendSuccess(res, 'Orders fetched', { items, total, page: pg, pages: Math.ceil(total / lim) });
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!valid.includes(status)) throw new ApiError('Invalid status', 400);
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError('Order not found', 404);
  order.orderStatus = status;
  if (status === 'delivered') {
    order.deliveredAt = new Date();
    if (order.paymentMethod === 'COD') order.paymentStatus = 'paid';
  }
  if (status === 'cancelled') order.cancelledAt = new Date();
  await order.save();
  req.app.get('io')?.to(`user:${order.user}`).emit('order:updated', order);
  req.app.get('io')?.to('admin').emit('order:updated', order);
  sendSuccess(res, `Order ${status}`, order);
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError('Order not found', 404);
  if (order.paymentStatus === 'paid') return sendSuccess(res, 'Payment already verified', order);
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
  if (expected !== razorpay_signature) {
    order.paymentStatus = 'failed';
    await order.save();
    throw new ApiError('Payment verification failed', 400);
  }
  order.paymentStatus = 'paid';
  order.razorpayPaymentId = razorpay_payment_id;
  order.razorpaySignature = razorpay_signature;
  if (order.orderStatus === 'pending') order.orderStatus = 'confirmed';
  await order.save();
  req.app.get('io')?.to('admin').emit('order:updated', order);
  req.app.get('io')?.to(`user:${order.user}`).emit('order:updated', order);
  sendSuccess(res, 'Payment verified', order);
});

module.exports = { createOrder, myOrders, getOrder, cancelOrder, allOrders, updateStatus, verifyPayment };
