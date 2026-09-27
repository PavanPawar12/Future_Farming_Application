const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true },
    deliveryCharge: { type: Number, default: 30 },
    freeDeliveryMinAmount: { type: Number, default: 500 },
    deliveryAreas: { type: [String], default: [] },
    farmName: { type: String, default: 'Green Acres Farm' },
    farmPhone: { type: String, default: '' },
    farmEmail: { type: String, default: '' },
    farmAddress: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
