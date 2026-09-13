const Setting = require('../models/Setting');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get website settings
// @route   GET /api/settings
// @access  Public
const getSettings = asyncHandler(async (req, res) => {
  let setting = await Setting.findOne();

  if (!setting) {
    setting = await Setting.create({});
  }

  res.status(200).json({
    success: true,
    data: setting
  });
});

// @desc    Update website settings
// @route   PUT /api/admin/settings
// @access  Private (Admin)
const updateSettings = asyncHandler(async (req, res) => {
  let setting = await Setting.findOne();

  if (!setting) {
    setting = new Setting();
  }

  const {
    siteName,
    phone,
    email,
    address,
    zaloUrl,
    messengerUrl,
    facebookUrl,
    youtubeUrl,
    tiktokUrl,
    affiliateDisclosure,
    footerDescription,
    primaryColor,
    secondaryColor
  } = req.body;

  if (siteName !== undefined) setting.siteName = siteName.trim();
  if (phone !== undefined) setting.phone = phone.trim();
  if (email !== undefined) setting.email = email.trim();
  if (address !== undefined) setting.address = address.trim();
  if (zaloUrl !== undefined) setting.zaloUrl = zaloUrl.trim();
  if (messengerUrl !== undefined) setting.messengerUrl = messengerUrl.trim();
  if (facebookUrl !== undefined) setting.facebookUrl = facebookUrl.trim();
  if (youtubeUrl !== undefined) setting.youtubeUrl = youtubeUrl.trim();
  if (tiktokUrl !== undefined) setting.tiktokUrl = tiktokUrl.trim();
  if (affiliateDisclosure !== undefined) setting.affiliateDisclosure = affiliateDisclosure.trim();
  if (footerDescription !== undefined) setting.footerDescription = footerDescription.trim();
  if (primaryColor !== undefined) setting.primaryColor = primaryColor.trim();
  if (secondaryColor !== undefined) setting.secondaryColor = secondaryColor.trim();

  // Handle logo and favicon upload
  if (req.files) {
    if (req.files.logo && req.files.logo[0]) {
      setting.logo = `/uploads/settings/${req.files.logo[0].filename}`;
    }
    if (req.files.favicon && req.files.favicon[0]) {
      setting.favicon = `/uploads/settings/${req.files.favicon[0].filename}`;
    }
  }

  const updated = await setting.save();

  res.status(200).json({
    success: true,
    message: 'Cập nhật cấu hình website thành công',
    data: updated
  });
});

module.exports = {
  getSettings,
  updateSettings
};
