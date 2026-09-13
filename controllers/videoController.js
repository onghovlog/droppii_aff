const Video = require('../models/Video');
const asyncHandler = require('../utils/asyncHandler');
const { isSafeUrl } = require('../utils/helpers');

// @desc    Get all active videos
// @route   GET /api/videos
// @access  Public
const getVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({ status: true }).sort({ sortOrder: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    data: videos
  });
});

// ================= ADMIN CONTROLLERS =================

// @desc    Get all videos for Admin
// @route   GET /api/admin/videos
// @access  Private (Admin)
const getAdminVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find().sort({ sortOrder: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    data: videos
  });
});

// @desc    Create new Video
// @route   POST /api/admin/videos
// @access  Private (Admin)
const createVideo = asyncHandler(async (req, res) => {
  const { title, description, platform, videoUrl, isVertical, sortOrder, status } = req.body;

  if (!videoUrl || !videoUrl.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Đường dẫn video là bắt buộc'
    });
  }

  const cleanUrl = videoUrl.trim();
  const isShort = cleanUrl.includes('/shorts/') || isVertical === 'true' || isVertical === true;

  let thumbnail = '';
  if (req.file) {
    thumbnail = `/uploads/videos/${req.file.filename}`;
  } else if (req.body.thumbnail && req.body.thumbnail.trim()) {
    thumbnail = req.body.thumbnail.trim();
  } else if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
    // Auto extract YouTube thumbnail (supports standard, shorts, embed, youtu.be)
    const ytMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      thumbnail = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    }
  }

  const finalTitle = (title && title.trim()) ? title.trim() : 'Video Đánh Giá Sản Phẩm';

  const video = new Video({
    title: finalTitle,
    description: description ? description.trim() : '',
    platform: platform || 'youtube',
    videoUrl: cleanUrl,
    thumbnail,
    isVertical: isShort,
    sortOrder: Number(sortOrder) || 0,
    status: status === undefined ? true : (status === 'true' || status === true)
  });

  const createdVideo = await video.save();

  res.status(201).json({
    success: true,
    message: 'Thêm video thành công',
    data: createdVideo
  });
});

// @desc    Update Video
// @route   PUT /api/admin/videos/:id
// @access  Private (Admin)
const updateVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);

  if (!video) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy video'
    });
  }

  const { title, description, platform, videoUrl, isVertical, sortOrder, status } = req.body;

  if (title !== undefined) video.title = title.trim();
  if (description !== undefined) video.description = description.trim();
  if (platform !== undefined) video.platform = platform;
  if (videoUrl !== undefined) {
    video.videoUrl = videoUrl.trim();
    if (video.videoUrl.includes('/shorts/')) {
      video.isVertical = true;
    }
  }
  if (isVertical !== undefined) video.isVertical = isVertical === 'true' || isVertical === true;
  if (sortOrder !== undefined) video.sortOrder = Number(sortOrder) || 0;
  if (status !== undefined) video.status = status === 'true' || status === true;

  if (req.file) {
    video.thumbnail = `/uploads/videos/${req.file.filename}`;
  } else if (req.body.thumbnail !== undefined && req.body.thumbnail.trim()) {
    video.thumbnail = req.body.thumbnail.trim();
  } else if (video.videoUrl && (video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be')) && !video.thumbnail) {
    const ytMatch = video.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      video.thumbnail = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    }
  }

  const updatedVideo = await video.save();

  res.status(200).json({
    success: true,
    message: 'Cập nhật video thành công',
    data: updatedVideo
  });
});

// @desc    Delete Video
// @route   DELETE /api/admin/videos/:id
// @access  Private (Admin)
const deleteVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);

  if (!video) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy video'
    });
  }

  await Video.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Xóa video thành công'
  });
});

module.exports = {
  getVideos,
  getAdminVideos,
  createVideo,
  updateVideo,
  deleteVideo
};
