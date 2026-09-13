const News = require('../models/News');
const asyncHandler = require('../utils/asyncHandler');
const { createSlug } = require('../utils/helpers');

// @desc    Get all active news (with isHot filter)
// @route   GET /api/news
// @access  Public
const getNews = asyncHandler(async (req, res) => {
  const { hot, limit = 10 } = req.query;
  const query = { status: true };

  if (hot === 'true' || hot === true) {
    query.isHot = true;
  }

  const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const newsList = await News.find(query).sort({ publishedAt: -1, createdAt: -1 }).limit(parsedLimit);

  res.status(200).json({
    success: true,
    data: newsList
  });
});

// @desc    Get single news by slug or ID
// @route   GET /api/news/:slug
// @access  Public
const getNewsBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  let news;

  if (slug.match(/^[0-9a-fA-F]{24}$/)) {
    news = await News.findOne({ _id: slug, status: true });
  } else {
    news = await News.findOne({ slug, status: true });
  }

  if (!news) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài viết'
    });
  }

  res.status(200).json({
    success: true,
    data: news
  });
});

// ================= ADMIN CONTROLLERS =================

// @desc    Get all news for Admin
// @route   GET /api/admin/news
// @access  Private (Admin)
const getAdminNews = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const query = {};

  if (search && search.trim()) {
    query.title = { $regex: search.trim(), $options: 'i' };
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (parsedPage - 1) * parsedLimit;

  const total = await News.countDocuments(query);
  const newsList = await News.find(query).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit);

  res.status(200).json({
    success: true,
    data: newsList,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.ceil(total / parsedLimit)
    }
  });
});

// @desc    Create new News
// @route   POST /api/admin/news
// @access  Private (Admin)
const createNews = asyncHandler(async (req, res) => {
  const { title, summary, content, isHot, status, publishedAt } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: 'Tiêu đề và nội dung bài viết là bắt buộc'
    });
  }

  let thumbnail = '';
  if (req.file) {
    thumbnail = `/uploads/news/${req.file.filename}`;
  } else if (req.body.thumbnail) {
    thumbnail = req.body.thumbnail;
  }

  const news = new News({
    title: title.trim(),
    slug: createSlug(title) + '-' + Math.floor(1000 + Math.random() * 9000),
    thumbnail,
    summary: summary ? summary.trim() : '',
    content: content.trim(),
    isHot: isHot === 'true' || isHot === true,
    status: status === undefined ? true : (status === 'true' || status === true),
    publishedAt: publishedAt ? new Date(publishedAt) : Date.now()
  });

  const createdNews = await news.save();

  res.status(201).json({
    success: true,
    message: 'Đăng tin tức thành công',
    data: createdNews
  });
});

// @desc    Update News
// @route   PUT /api/admin/news/:id
// @access  Private (Admin)
const updateNews = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const news = await News.findById(id);

  if (!news) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài viết'
    });
  }

  const { title, summary, content, isHot, status, publishedAt } = req.body;

  if (title && title.trim() !== news.title) {
    news.title = title.trim();
    news.slug = createSlug(title) + '-' + Math.floor(1000 + Math.random() * 9000);
  }

  if (summary !== undefined) news.summary = summary.trim();
  if (content !== undefined) news.content = content.trim();
  if (isHot !== undefined) news.isHot = isHot === 'true' || isHot === true;
  if (status !== undefined) news.status = status === 'true' || status === true;
  if (publishedAt) news.publishedAt = new Date(publishedAt);

  if (req.file) {
    news.thumbnail = `/uploads/news/${req.file.filename}`;
  } else if (req.body.thumbnail !== undefined) {
    news.thumbnail = req.body.thumbnail;
  }

  const updatedNews = await news.save();

  res.status(200).json({
    success: true,
    message: 'Cập nhật tin tức thành công',
    data: updatedNews
  });
});

// @desc    Delete News
// @route   DELETE /api/admin/news/:id
// @access  Private (Admin)
const deleteNews = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const news = await News.findById(id);

  if (!news) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài viết'
    });
  }

  await News.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Xóa bài viết thành công'
  });
});

module.exports = {
  getNews,
  getNewsBySlug,
  getAdminNews,
  createNews,
  updateNews,
  deleteNews
};
