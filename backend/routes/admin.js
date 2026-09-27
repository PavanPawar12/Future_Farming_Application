const express = require('express');
const { dashboard, getCustomers, getSettings, updateSettings, inventory } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');
const { me, updateProfile } = require('../controllers/authController');
const User = require('../models/User');
const { sendSuccess } = require('../utils/helpers');

const router = express.Router();
router.use(protect, adminOnly);

router.get('/dashboard', dashboard);
router.get('/customers', getCustomers);
router.get('/inventory', inventory);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/profile', me);
router.put('/profile', updateProfile);

// toggle user active
router.patch('/customers/:id/toggle', async (req, res, next) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ success: false, message: 'User not found' });
    u.isActive = !u.isActive;
    await u.save();
    sendSuccess(res, 'Customer status updated', u.toSafeJSON());
  } catch (e) { next(e); }
});

module.exports = router;
