const Product = require('../models/Product');
const { asyncHandler, ApiError, sendSuccess } = require('../utils/helpers');
const { cloudinary, setupCloudinary } = require('../config/cloudinary');

setupCloudinary();

const buildFilter = (q) => {
  const filter = {};
  if (q.category) filter.category = q.category;
  if (q.featured === 'true') filter.featured = true;
  if (q.available === 'true') { filter.isAvailable = true; filter.stock = { $gt: 0 }; }
  if (q.minPrice || q.maxPrice) {
    filter.price = {};
    if (q.minPrice) filter.price.$gte = Number(q.minPrice);
    if (q.maxPrice) filter.price.$lte = Number(q.maxPrice);
  }
  if (q.search) filter.$text = { $search: q.search };
  return filter;
};

const listProducts = asyncHandler(async (req, res) => {
  const { sort = 'newest', page = 1, limit = 24 } = req.query;
  const filter = buildFilter(req.query);
  // customers only see available? admin can pass all=true
  if (req.query.all !== 'true') {
    // keep all but default: show everything, frontend filters availability
  }
  let sortBy = { createdAt: -1 };
  if (sort === 'price_asc') sortBy = { price: 1 };
  else if (sort === 'price_desc') sortBy = { price: -1 };
  else if (sort === 'popular') sortBy = { sold: -1 };
  else if (sort === 'name') sortBy = { name: 1 };

  const pg = Math.max(1, Number(page));
  const lim = Math.min(100, Math.max(1, Number(limit)));
  const [items, total] = await Promise.all([
    Product.find(filter).populate('category', 'name slug').sort(sortBy).skip((pg - 1) * lim).limit(lim),
    Product.countDocuments(filter),
  ]);
  sendSuccess(res, 'Products fetched', {
    items, total, page: pg, pages: Math.ceil(total / lim),
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id).populate('category', 'name slug');
  if (!p) throw new ApiError('Product not found', 404);
  sendSuccess(res, 'Product fetched', p);
});

const uploadImagesToCloudinary = async (files) => {
  if (!files || !files.length) return [];
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new ApiError('Cloudinary not configured. Set CLOUDINARY_* env vars.', 500);
  }
  const urls = [];
  for (const f of files) {
    const b64 = `data:${f.mimetype};base64,${f.buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(b64, { folder: 'farm-products' });
    urls.push(result.secure_url);
  }
  return urls;
};

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, mrp, unit, stock, category, isAvailable, featured, images } = req.body;
  if (!name || price === undefined || !category) throw new ApiError('Name, price and category are required', 400);
  let imageUrls = [];
  if (Array.isArray(images)) imageUrls = images.filter(Boolean);
  else if (typeof images === 'string' && images) imageUrls = [images];
  if (req.files && req.files.length) {
    const uploaded = await uploadImagesToCloudinary(req.files);
    imageUrls = [...imageUrls, ...uploaded];
  }
  const p = await Product.create({
    name, description: description || '', price: Number(price), mrp: Number(mrp || 0),
    unit: unit || 'kg', stock: Number(stock ?? 0), category,
    images: imageUrls, isAvailable: isAvailable !== 'false' && isAvailable !== false,
    featured: featured === 'true' || featured === true,
  });
  const populated = await p.populate('category', 'name slug');
  // realtime inventory broadcast
  req.app.get('io')?.emit('product:updated', populated);
  sendSuccess(res, 'Product created', populated, 201);
});

const updateProduct = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) throw new ApiError('Product not found', 404);
  const fields = ['name', 'description', 'price', 'mrp', 'unit', 'stock', 'category', 'isAvailable', 'featured'];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      if (['price', 'mrp', 'stock'].includes(f)) p[f] = Number(req.body[f]);
      else if (f === 'isAvailable' || f === 'featured')
        p[f] = req.body[f] === 'true' || req.body[f] === true;
      else p[f] = req.body[f];
    }
  }
  if (req.body.images !== undefined) {
    p.images = Array.isArray(req.body.images) ? req.body.images : [req.body.images].filter(Boolean);
  }
  if (req.files && req.files.length) {
    const uploaded = await uploadImagesToCloudinary(req.files);
    p.images = [...(p.images || []), ...uploaded];
  }
  if (req.body.removeImages) {
    const remove = Array.isArray(req.body.removeImages) ? req.body.removeImages : [req.body.removeImages];
    p.images = (p.images || []).filter((u) => !remove.includes(u));
  }
  if (p.stock === 0) p.isAvailable = false;
  await p.save();
  const populated = await p.populate('category', 'name slug');
  req.app.get('io')?.emit('product:updated', populated);
  sendSuccess(res, 'Product updated', populated);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) throw new ApiError('Product not found', 404);
  await p.deleteOne();
  req.app.get('io')?.emit('product:deleted', req.params.id);
  sendSuccess(res, 'Product deleted');
});

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
