const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protectAdmin = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Không có quyền truy cập, vui lòng đăng nhập lại'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'droppii_affiliate_super_secret_jwt_key_2026');
    const admin = await Admin.findById(decoded.id);

    if (!admin || !admin.status) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản admin không tồn tại hoặc đã bị khóa'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn'
    });
  }
};

module.exports = { protectAdmin };
