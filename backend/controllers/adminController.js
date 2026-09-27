const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { asyncHandler, sendSuccess } = require('../utils/helpers');

const dashboard = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [totalOrders, todaysOrders, revenueAgg, customers, products, pendingOrders, lowStock] =
    await Promise.all([
      Order.countDocuments({ orderStatus: { $ne: 'cancelled' } }),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'cancelled' }, paymentStatus: { $in: ['paid', 'pending'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({}),
      Order.countDocuments({ orderStatus: 'pending' }),
      Product.find({ stock: { $lte: 5 } }).sort({ stock: 1 }).limit(10).populate('category', 'name'),
    ]);
  const recentOrders = await Order.find({}).populate('user', 'name').sort({ createdAt: -1 }).limit(8);
  sendSuccess(res, 'Dashboard stats', {
    totalOrders, todaysOrders,
    revenue: revenueAgg[0]?.total || 0,
    customers, products, pendingOrders, lowStock, recentOrders,
  });
});

const getCustomers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const filter = { role: 'customer' };
  if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
  const pg = Number(page), lim = Number(limit);
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((pg - 1) * lim).limit(lim),
    User.countDocuments(filter),
  ]);
  // attach order counts
  const withStats = await Promise.all(items.map(async (u) => {
    const orders = await Order.countDocuments({ user: u._id });
    const spent = await Order.aggregate([{ $match: { user: u._id, orderStatus: { $ne: 'cancelled' } } }, { $group: { _id: null, t: { $sum: '$totalAmount' } } }]);
    return { ...u.toSafeJSON(), orders, totalSpent: spent[0]?.t || 0 };
  }));
  sendSuccess(res, 'Customers fetched', { items: withStats, total, page: pg, pages: Math.ceil(total / lim) });
});

const getSettings = asyncHandler(async (req, res) => {
  let s = await Settings.findOne({ key: 'default' });
  if (!s) s = await Settings.create({ key: 'default' });
  sendSuccess(res, 'Settings fetched', s);
});

const updateSettings = asyncHandler(async (req, res) => {
  let s = await Settings.findOne({ key: 'default' });
  if (!s) s = new Settings({ key: 'default' });
  const fields = ['deliveryCharge', 'freeDeliveryMinAmount', 'deliveryAreas', 'farmName', 'farmPhone', 'farmEmail', 'farmAddress'];
  for (const f of fields) if (req.body[f] !== undefined) s[f] = req.body[f];
  await s.save();
  sendSuccess(res, 'Settings updated', s);
});

const inventory = asyncHandler(async (req, res) => {
  const items = await Product.find({}).populate('category', 'name').sort({ stock: 1 });
  sendSuccess(res, 'Inventory fetched', items);
});

module.exports = { dashboard, getCustomers, getSettings, updateSettings, inventory };
