const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true },
    unit: { type: String, default: 'kg' },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: {
      fullName: String, phone: String, addressLine: String, village: String,
      city: String, district: String, state: String, pincode: String, landmark: String,
    },
    subtotal: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String, enum: ['UPI', 'Card', 'NetBanking', 'COD', 'Online'], default: 'COD',
    },
    paymentStatus: {
      type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    deliveredAt: Date,
    cancelledAt: Date,
    orderNumber: { type: Number, unique: true },
  },
  { timestamps: true }
);

// Auto-increment orderNumber
orderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderNumber) {
    const last = await this.constructor.findOne().sort({ orderNumber: -1 }).select('orderNumber');
    this.orderNumber = last && last.orderNumber ? last.orderNumber + 1 : 1001;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
