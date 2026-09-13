const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'droppii_affiliate_super_secret_jwt_key_2026', {
    expiresIn: '7d'
  });
};

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập đầy đủ Email và Mật khẩu'
    });
  }

  const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!admin) {
    return res.status(401).json({
      success: false,
      message: 'Email hoặc mật khẩu không chính xác'
    });
  }

  if (!admin.status) {
    return res.status(403).json({
      success: false,
      message: 'Tài khoản admin này đã bị vô hiệu hóa'
    });
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Email hoặc mật khẩu không chính xác'
    });
  }

  const token = generateToken(admin._id);

  res.status(200).json({
    success: true,
    message: 'Đăng nhập thành công',
    data: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token
    }
  });
});

// @desc    Get current admin profile
// @route   GET /api/admin/me
// @access  Private (Admin)
const getMe = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id).select('-password');
  res.status(200).json({
    success: true,
    data: admin
  });
});

// @desc    Update admin password & profile
// @route   PUT /api/admin/profile
// @access  Private (Admin)
const updateProfile = asyncHandler(async (req, res) => {
  const { name, currentPassword, newPassword } = req.body;
  const admin = await Admin.findById(req.admin._id).select('+password');

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy tài khoản admin'
    });
  }

  if (name) {
    admin.name = name.trim();
  }

  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu mới'
      });
    }

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không chính xác'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có tối thiểu 6 ký tự'
      });
    }

    admin.password = newPassword;
  }

  await admin.save();

  res.status(200).json({
    success: true,
    message: 'Cập nhật thông tin quản trị thành công',
    data: {
      _id: admin._id,
      name: admin.name,
      email: admin.email
    }
  });
});

module.exports = {
  loginAdmin,
  getMe,
  updateProfile
};
