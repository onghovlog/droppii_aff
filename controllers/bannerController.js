const Banner = require('../models/Banner');
const asyncHandler = require('../utils/asyncHandler');
const { isSafeUrl } = require('../utils/helpers');

// @desc    Get all active banners sorted by sortOrder
// @route   GET /api/banners
// @access  Public
const getBanners = asyncHandler(async (req, res) => {
  const { position } = req.query;
  const query = { status: true };

  if (position && ['square', 'horizontal', 'vertical'].includes(position)) {
    query.position = position;
  }

  const banners = await Banner.find(query).sort({ sortOrder: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    data: banners
  });
});

// ================= ADMIN CONTROLLERS =================

// @desc    Get all banners for Admin
// @route   GET /api/admin/banners
// @access  Private (Admin)
const getAdminBanners = asyncHandler(async (req, res) => {
  const { position } = req.query;
  const query = {};

  if (position && ['square', 'horizontal', 'vertical'].includes(position)) {
    query.position = position;
  }

  const banners = await Banner.find(query).sort({ position: 1, sortOrder: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    data: banners
  });
});

// @desc    Create new Banner
// @route   POST /api/admin/banners
// @access  Private (Admin)
const createBanner = asyncHandler(async (req, res) => {
  const { title, position, targetUrl, sortOrder, status } = req.body;

  let image = '';
  if (req.file) {
    image = `/uploads/banners/${req.file.filename}`;
  } else if (req.body.image) {
    image = req.body.image;
  }

  if (!image) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng tải lên hình ảnh banner'
    });
  }

  if (!targetUrl || !targetUrl.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Đường dẫn liên kết (Target URL) là bắt buộc'
    });
  }

  if (!isSafeUrl(targetUrl)) {
    return res.status(400).json({
      success: false,
      message: 'Đường dẫn liên kết không hợp lệ (phải bắt đầu bằng http://, https:// hoặc đường dẫn nội bộ)'
    });
  }

  const validPosition = ['square', 'horizontal', 'vertical'].includes(position) ? position : 'square';

  const banner = new Banner({
    title: title ? title.trim() : '',
    position: validPosition,
    image,
    targetUrl: targetUrl.trim(),
    sortOrder: Number(sortOrder) || 0,
    status: status === undefined ? true : (status === 'true' || status === true)
  });

  const createdBanner = await banner.save();

  res.status(201).json({
    success: true,
    message: 'Thêm banner thành công',
    data: createdBanner
  });
});

// @desc    Update Banner
// @route   PUT /api/admin/banners/:id
// @access  Private (Admin)
const updateBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const banner = await Banner.findById(id);

  if (!banner) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy banner'
    });
  }

  const { title, position, targetUrl, sortOrder, status } = req.body;

  if (title !== undefined) banner.title = title.trim();
  if (position !== undefined && ['square', 'horizontal', 'vertical'].includes(position)) {
    banner.position = position;
  }

  if (targetUrl !== undefined) {
    if (!targetUrl.trim() || !isSafeUrl(targetUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Đường dẫn liên kết không hợp lệ'
      });
    }
    banner.targetUrl = targetUrl.trim();
  }

  if (sortOrder !== undefined) banner.sortOrder = Number(sortOrder) || 0;
  if (status !== undefined) banner.status = status === 'true' || status === true;

  if (req.file) {
    banner.image = `/uploads/banners/${req.file.filename}`;
  } else if (req.body.image) {
    banner.image = req.body.image;
  }

  const updatedBanner = await banner.save();

  res.status(200).json({
    success: true,
    message: 'Cập nhật banner thành công',
    data: updatedBanner
  });
});

// @desc    Delete Banner
// @route   DELETE /api/admin/banners/:id
// @access  Private (Admin)
const deleteBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const banner = await Banner.findById(id);

  if (!banner) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy banner'
    });
  }

  await Banner.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Xóa banner thành công'
  });
});

module.exports = {
  getBanners,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner
};
