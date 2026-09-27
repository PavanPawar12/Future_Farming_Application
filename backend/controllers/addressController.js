const Address = require('../models/Address');
const { asyncHandler, ApiError, sendSuccess } = require('../utils/helpers');

const listAddresses = asyncHandler(async (req, res) => {
  const items = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
  sendSuccess(res, 'Addresses fetched', items);
});

const createAddress = asyncHandler(async (req, res) => {
  const { fullName, phone, addressLine, village, city, district, state, pincode, landmark, isDefault } = req.body;
  if (!fullName || !phone || !addressLine || !city || !state || !pincode)
    throw new ApiError('fullName, phone, addressLine, city, state, pincode are required', 400);
  if (!/^\d{6}$/.test(String(pincode))) throw new ApiError('Pincode must be 6 digits', 400);
  if (isDefault) await Address.updateMany({ user: req.user._id }, { isDefault: false });
  const count = await Address.countDocuments({ user: req.user._id });
  const addr = await Address.create({
    user: req.user._id, fullName, phone, addressLine, village: village || '',
    city, district: district || '', state, pincode, landmark: landmark || '',
    isDefault: isDefault || count === 0,
  });
  sendSuccess(res, 'Address saved', addr, 201);
});

const updateAddress = asyncHandler(async (req, res) => {
  const addr = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!addr) throw new ApiError('Address not found', 404);
  const fields = ['fullName', 'phone', 'addressLine', 'village', 'city', 'district', 'state', 'pincode', 'landmark'];
  for (const f of fields) if (req.body[f] !== undefined) addr[f] = req.body[f];
  if (req.body.isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    addr.isDefault = true;
  }
  await addr.save();
  sendSuccess(res, 'Address updated', addr);
});

const deleteAddress = asyncHandler(async (req, res) => {
  const addr = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!addr) throw new ApiError('Address not found', 404);
  await addr.deleteOne();
  sendSuccess(res, 'Address deleted');
});

module.exports = { listAddresses, createAddress, updateAddress, deleteAddress };
