const express = require('express');
const { register, login, adminLogin, logout, me, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.post('/logout', logout);
router.get('/me', protect, me);
router.put('/profile', protect, updateProfile);

module.exports = router;
