const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

const run = async () => {
  await connectDB();
  // admin
  const adminEmail = 'admin@farm.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({ name: 'Farm Owner', email: adminEmail, password: 'admin123', role: 'admin', phone: '9876543210' });
    console.log('Admin created: admin@farm.com / admin123');
  }
  const catNames = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Farm Products', 'Seasonal Products'];
  const cats = {};
  for (const n of catNames) {
    let c = await Category.findOne({ name: n });
    if (!c) c = await Category.create({ name: n, description: `${n} fresh from farm` });
    cats[n] = c;
  }
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.create([
      { name: 'Fresh Tomatoes', description: 'Freshly harvested farm tomatoes.', price: 40, mrp: 55, unit: 'kg', stock: 25, category: cats['Vegetables']._id, images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800'], featured: true },
      { name: 'Fresh Potatoes', description: 'Earthy farm potatoes.', price: 30, mrp: 40, unit: 'kg', stock: 40, category: cats['Vegetables']._id, images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800'], featured: true },
      { name: 'Alphonso Mangoes', description: 'Seasonal juicy mangoes.', price: 350, mrp: 450, unit: 'dozen', stock: 15, category: cats['Fruits']._id, images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?w=800'], featured: true },
      { name: 'Farm Fresh Milk', description: 'Pure cow milk, daily.', price: 60, mrp: 70, unit: 'litre', stock: 50, category: cats['Dairy']._id, images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800'], featured: true },
      { name: 'Whole Wheat Grains', description: 'Stone-ground quality wheat.', price: 45, mrp: 60, unit: 'kg', stock: 100, category: cats['Grains']._id, images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800'] },
      { name: 'Farm Eggs', description: 'Free-range eggs.', price: 90, mrp: 110, unit: 'dozen', stock: 30, category: cats['Farm Products']._id, images: ['https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800'] },
    ]);
    console.log('Sample products seeded');
  }
  console.log('Seed done');
  process.exit(0);
};

run().catch((e) => { console.error(e); process.exit(1); });
