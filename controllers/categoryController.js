const Category = require('../models/Category');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const { createSlug } = require('../utils/helpers');

// @desc    Get all active categories (optionally homepage categories only)
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const { homepage } = req.query;
  const query = { status: true };

  if (homepage === 'true' || homepage === true) {
    query.showOnHomepage = true;
  }

  const categories = await Category.find(query).sort({ homepageOrder: 1, name: 1 });

  res.status(200).json({
    success: true,
    data: categories
  });
});

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const category = await Category.findOne({ slug, status: true });

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy danh mục'
    });
  }

  res.status(200).json({
    success: true,
    data: category
  });
});

// ================= ADMIN CONTROLLERS =================

// @desc    Get all categories for Admin
// @route   GET /api/admin/categories
// @access  Private (Admin)
const getAdminCategories = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;
  const query = {};

  if (search && search.trim()) {
    query.name = { $regex: search.trim(), $options: 'i' };
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (parsedPage - 1) * parsedLimit;

  const total = await Category.countDocuments(query);
  const categories = await Category.find(query)
    .sort({ homepageOrder: 1, createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit);

  // Attach product counts to categories
  const categoriesWithCount = await Promise.all(
    categories.map(async (cat) => {
      const productCount = await Product.countDocuments({ categoryId: cat._id });
      return {
        ...cat.toObject(),
        productCount
      };
    })
  );

  res.status(200).json({
    success: true,
    data: categoriesWithCount,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.ceil(total / parsedLimit)
    }
  });
});

// @desc    Create new Category
// @route   POST /api/admin/categories
// @access  Private (Admin)
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, showOnHomepage, homepageOrder, homepageProductLimit, status } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Tên danh mục là bắt buộc'
    });
  }

  let image = '';
  if (req.file) {
    image = `/uploads/categories/${req.file.filename}`;
  } else if (req.body.image) {
    image = req.body.image;
  }

  const slug = createSlug(name);
  const existingCategory = await Category.findOne({ slug });
  if (existingCategory) {
    return res.status(400).json({
      success: false,
      message: 'Danh mục với tên này đã tồn tại'
    });
  }

  const category = new Category({
    name: name.trim(),
    slug,
    image,
    description: description ? description.trim() : '',
    showOnHomepage: showOnHomepage === 'true' || showOnHomepage === true,
    homepageOrder: Number(homepageOrder) || 0,
    homepageProductLimit: Number(homepageProductLimit) || 8,
    status: status === undefined ? true : (status === 'true' || status === true)
  });

  const createdCategory = await category.save();

  res.status(201).json({
    success: true,
    message: 'Thêm danh mục thành công',
    data: createdCategory
  });
});

// @desc    Update Category
// @route   PUT /api/admin/categories/:id
// @access  Private (Admin)
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy danh mục'
    });
  }

  const { name, description, showOnHomepage, homepageOrder, homepageProductLimit, status } = req.body;

  if (name && name.trim() !== category.name) {
    category.name = name.trim();
    category.slug = createSlug(name);
  }

  if (description !== undefined) category.description = description.trim();
  if (showOnHomepage !== undefined) category.showOnHomepage = showOnHomepage === 'true' || showOnHomepage === true;
  if (homepageOrder !== undefined) category.homepageOrder = Number(homepageOrder) || 0;
  if (homepageProductLimit !== undefined) category.homepageProductLimit = Number(homepageProductLimit) || 8;
  if (status !== undefined) category.status = status === 'true' || status === true;

  if (req.file) {
    category.image = `/uploads/categories/${req.file.filename}`;
  } else if (req.body.image !== undefined) {
    category.image = req.body.image;
  }

  const updatedCategory = await category.save();

  res.status(200).json({
    success: true,
    message: 'Cập nhật danh mục thành công',
    data: updatedCategory
  });
});

// @desc    Delete Category
// @route   DELETE /api/admin/categories/:id
// @access  Private (Admin)
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy danh mục'
    });
  }

  // Check if products exist in category
  const productCount = await Product.countDocuments({ categoryId: id });
  if (productCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Không thể xóa danh mục này vì đang có ${productCount} sản phẩm liên kết`
    });
  }

  await Category.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Xóa danh mục thành công'
  });
});

module.exports = {
  getCategories,
  getCategoryBySlug,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
