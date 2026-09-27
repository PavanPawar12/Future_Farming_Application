const Category = require('../models/Category');
const { asyncHandler, ApiError, sendSuccess } = require('../utils/helpers');

const listCategories = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.activeOnly === 'true') filter.isActive = true;
  const cats = await Category.find(filter).sort({ name: 1 });
  sendSuccess(res, 'Categories fetched', cats);
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;
  if (!name) throw new ApiError('Category name required', 400);
  const exists = await Category.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
  if (exists) throw new ApiError('Category already exists', 400);
  const cat = await Category.create({
    name: name.trim(), description: description || '', image: image || req.body.imageUrl || '',
  });
  sendSuccess(res, 'Category created', cat, 201);
});

const updateCategory = asyncHandler(async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) throw new ApiError('Category not found', 404);
  const { name, description, image, isActive } = req.body;
  if (name) cat.name = name.trim();
  if (description !== undefined) cat.description = description;
  if (image !== undefined) cat.image = image;
  if (isActive !== undefined) cat.isActive = !!isActive;
  await cat.save();
  sendSuccess(res, 'Category updated', cat);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) throw new ApiError('Category not found', 404);
  await cat.deleteOne();
  sendSuccess(res, 'Category deleted');
});

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
