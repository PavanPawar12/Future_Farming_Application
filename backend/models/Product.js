const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name required'], trim: true, maxlength: 120 },
    description: { type: String, default: '', maxlength: 2000 },
    price: { type: Number, required: [true, 'Price required'], min: 0 },
    mrp: { type: Number, default: 0, min: 0 },
    unit: {
      type: String, required: true, default: 'kg',
      enum: ['kg', 'gram', 'litre', 'dozen', 'piece', 'packet'],
    },
    stock: { type: Number, required: true, default: 0, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    sold: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
