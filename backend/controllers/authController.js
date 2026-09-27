const User = require('../models/User');
const { asyncHandler, ApiError, sendSuccess } = require('../utils/helpers');
const { sendTokenCookie } = require('../utils/jwt');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) throw new ApiError('Name, email and password are required', 400);
  if (password.length < 6) throw new ApiError('Password must be at least 6 characters', 400);
  const exists = await User.findOne({ email: email.toLowerCase().trim() });
  if (exists) throw new ApiError('Email already registered', 400);
  const user = await User.create({ name, email: email.toLowerCase().trim(), password, phone: phone || '' });
  sendTokenCookie(res, user);
  sendSuccess(res, 'Registered successfully', user.toSafeJSON(), 201);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError('Email and password are required', 400);
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user || !user.isActive) throw new ApiError('Invalid email or password', 401);
  const ok = await user.comparePassword(password);
  if (!ok) throw new ApiError('Invalid email or password', 401);
  sendTokenCookie(res, user);
  sendSuccess(res, 'Logged in successfully', user.toSafeJSON());
});

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError('Email and password are required', 400);
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user || user.role !== 'admin') throw new ApiError('Invalid admin credentials', 401);
  const ok = await user.comparePassword(password);
  if (!ok) throw new ApiError('Invalid admin credentials', 401);
  sendTokenCookie(res, user);
  sendSuccess(res, 'Admin logged in', user.toSafeJSON());
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  sendSuccess(res, 'Logged out successfully');
});

const me = asyncHandler(async (req, res) => {
  sendSuccess(res, 'Profile fetched', req.user.toSafeJSON());
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  if (name) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  if (avatar !== undefined) req.user.avatar = avatar;
  await req.user.save();
  sendSuccess(res, 'Profile updated', req.user.toSafeJSON());
});

module.exports = { register, login, adminLogin, logout, me, updateProfile };
