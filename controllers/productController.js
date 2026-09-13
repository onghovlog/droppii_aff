const Product = require('../models/Product');
const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const { createSlug, isSafeUrl } = require('../utils/helpers');

// @desc    Get all active products with filters & pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    promotion,
    new: isNew,
    featured,
    search,
    sort,
    page = 1,
    limit = 20
  } = req.query;

  const query = { status: true };

  // Category filter by slug or ObjectId
  if (category) {
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      query.categoryId = category;
    } else {
      const foundCategory = await Category.findOne({ slug: category, status: true });
      if (foundCategory) {
        query.categoryId = foundCategory._id;
      } else {
        return res.status(200).json({
          success: true,
          data: [],
          pagination: { page: Number(page), limit: Number(limit), total: 0, totalPages: 0 }
        });
      }
    }
  }

  // Boolean flag filters
  if (promotion === 'true' || promotion === true) query.isPromotion = true;
  if (isNew === 'true' || isNew === true) query.isNew = true;
  if (featured === 'true' || featured === true) query.isFeatured = true;

  // Search by name
  if (search && search.trim()) {
    query.name = { $regex: search.trim(), $options: 'i' };
  }

  // Sorting
  let sortOption = { sortOrder: 1, createdAt: -1 };
  if (sort === 'price-asc') sortOption = { priceSale: 1 };
  else if (sort === 'price-desc') sortOption = { priceSale: -1 };
  else if (sort === 'discount') sortOption = { discountPercent: -1 };
  else if (sort === 'newest') sortOption = { createdAt: -1 };
  else if (sort === 'name') sortOption = { name: 1 };

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (parsedPage - 1) * parsedLimit;

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('categoryId', 'name slug')
    .sort(sortOption)
    .skip(skip)
    .limit(parsedLimit);

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.ceil(total / parsedLimit)
    }
  });
});

// @desc    Get single product by slug or ID
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  let product;

  if (slug.match(/^[0-9a-fA-F]{24}$/)) {
    product = await Product.findOne({ _id: slug, status: true }).populate('categoryId', 'name slug');
  } else {
    product = await Product.findOne({ slug, status: true }).populate('categoryId', 'name slug');
  }

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy sản phẩm yêu cầu'
    });
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// ================= ADMIN CONTROLLERS =================

// @desc    Get all products for Admin (with search & filters)
// @route   GET /api/admin/products
// @access  Private (Admin)
const getAdminProducts = asyncHandler(async (req, res) => {
  const { search, category, status, sort, page = 1, limit = 20 } = req.query;
  const query = {};

  if (search && search.trim()) {
    query.name = { $regex: search.trim(), $options: 'i' };
  }

  if (category) {
    query.categoryId = category;
  }

  if (status !== undefined && status !== '') {
    query.status = status === 'true';
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'oldest') sortOption = { createdAt: 1 };
  else if (sort === 'name') sortOption = { name: 1 };
  else if (sort === 'price-asc') sortOption = { priceSale: 1 };
  else if (sort === 'price-desc') sortOption = { priceSale: -1 };

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (parsedPage - 1) * parsedLimit;

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('categoryId', 'name slug')
    .sort(sortOption)
    .skip(skip)
    .limit(parsedLimit);

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.ceil(total / parsedLimit)
    }
  });
});

// @desc    Create new Product
// @route   POST /api/admin/products
// @access  Private (Admin)
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    shortDescription,
    description,
    priceOriginal,
    priceSale,
    discountPercent,
    gift,
    categoryId,
    affiliateUrl,
    isPromotion,
    isNew,
    isFeatured,
    status,
    sortOrder,
    existingImages
  } = req.body;

  if (!name || !categoryId || !affiliateUrl) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp đầy đủ tên sản phẩm, danh mục và link affiliate'
    });
  }

  if (!isSafeUrl(affiliateUrl)) {
    return res.status(400).json({
      success: false,
      message: 'Đường dẫn Affiliate không an toàn hoặc không đúng định dạng (phải bắt đầu bằng http:// hoặc https://)'
    });
  }

  let images = [];
  if (existingImages) {
    try {
      images = Array.isArray(existingImages) ? existingImages : JSON.parse(existingImages);
    } catch (e) {
      images = [existingImages];
    }
  }

  if (req.files && req.files.length > 0) {
    const uploaded = req.files.map((file) => `/uploads/products/${file.filename}`);
    images = [...images, ...uploaded];
  }

  const pOriginal = Number(priceOriginal) || 0;
  const pSale = Number(priceSale) || 0;
  let discount = Number(discountPercent) || 0;
  if (pOriginal > 0 && pSale > 0 && pSale < pOriginal) {
    discount = Math.round(((pOriginal - pSale) / pOriginal) * 100);
  }

  const product = new Product({
    name: name.trim(),
    slug: createSlug(name) + '-' + Math.floor(1000 + Math.random() * 9000),
    shortDescription: shortDescription ? shortDescription.trim() : '',
    description: description ? description.trim() : '',
    priceOriginal: pOriginal,
    priceSale: pSale,
    discountPercent: discount,
    gift: gift ? gift.trim() : '',
    images,
    categoryId,
    affiliateUrl: affiliateUrl.trim(),
    isPromotion: isPromotion === 'true' || isPromotion === true,
    isNew: isNew === 'true' || isNew === true,
    isFeatured: featuredBoolean(isFeatured),
    status: status === undefined ? true : (status === 'true' || status === true),
    sortOrder: Number(sortOrder) || 0
  });

  const createdProduct = await product.save();
  await createdProduct.populate('categoryId', 'name slug');

  res.status(201).json({
    success: true,
    message: 'Thêm sản phẩm thành công',
    data: createdProduct
  });
});

// @desc    Update Product
// @route   PUT /api/admin/products/:id
// @access  Private (Admin)
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy sản phẩm'
    });
  }

  const {
    name,
    shortDescription,
    description,
    priceOriginal,
    priceSale,
    discountPercent,
    gift,
    categoryId,
    affiliateUrl,
    isPromotion,
    isNew,
    isFeatured,
    status,
    sortOrder,
    existingImages
  } = req.body;

  if (affiliateUrl && !isSafeUrl(affiliateUrl)) {
    return res.status(400).json({
      success: false,
      message: 'Đường dẫn Affiliate không hợp lệ'
    });
  }

  if (name && name.trim() !== product.name) {
    product.name = name.trim();
    product.slug = createSlug(name) + '-' + Math.floor(1000 + Math.random() * 9000);
  }

  if (shortDescription !== undefined) product.shortDescription = shortDescription.trim();
  if (description !== undefined) product.description = description.trim();
  if (priceOriginal !== undefined) product.priceOriginal = Number(priceOriginal) || 0;
  if (priceSale !== undefined) product.priceSale = Number(priceSale) || 0;
  if (gift !== undefined) product.gift = gift.trim();
  if (categoryId) product.categoryId = categoryId;
  if (affiliateUrl) product.affiliateUrl = affiliateUrl.trim();
  if (isPromotion !== undefined) product.isPromotion = isPromotion === 'true' || isPromotion === true;
  if (isNew !== undefined) product.isNew = isNew === 'true' || isNew === true;
  if (isFeatured !== undefined) product.isFeatured = featuredBoolean(isFeatured);
  if (status !== undefined) product.status = status === 'true' || status === true;
  if (sortOrder !== undefined) product.sortOrder = Number(sortOrder) || 0;

  // Auto calculate discount
  if (product.priceOriginal > 0 && product.priceSale > 0 && product.priceSale < product.priceOriginal) {
    product.discountPercent = Math.round(((product.priceOriginal - product.priceSale) / product.priceOriginal) * 100);
  } else if (discountPercent !== undefined) {
    product.discountPercent = Number(discountPercent) || 0;
  }

  // Handle images
  let images = [];
  if (existingImages !== undefined) {
    try {
      images = Array.isArray(existingImages) ? existingImages : JSON.parse(existingImages);
    } catch (e) {
      images = [existingImages].filter(Boolean);
    }
  } else {
    images = product.images;
  }

  if (req.files && req.files.length > 0) {
    const uploaded = req.files.map((file) => `/uploads/products/${file.filename}`);
    images = [...images, ...uploaded];
  }
  product.images = images;

  const updatedProduct = await product.save();
  await updatedProduct.populate('categoryId', 'name slug');

  res.status(200).json({
    success: true,
    message: 'Cập nhật sản phẩm thành công',
    data: updatedProduct
  });
});

// @desc    Delete Product
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin)
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy sản phẩm'
    });
  }

  await Product.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Xóa sản phẩm thành công'
  });
});

function featuredBoolean(val) {
  return val === 'true' || val === true;
}

module.exports = {
  getProducts,
  getProductBySlug,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
