const PartnerRegistration = require('../models/PartnerRegistration');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Register as a partner
// @route   POST /api/partners
// @access  Public
const createPartner = asyncHandler(async (req, res) => {
  const { name, phone, email, company, website, field, message } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập họ và tên'
    });
  }

  if (!phone || !phone.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập số điện thoại'
    });
  }

  const partner = new PartnerRegistration({
    name: name.trim(),
    phone: phone.trim(),
    email: email ? email.trim() : '',
    company: company ? company.trim() : '',
    website: website ? website.trim() : '',
    field: field ? field.trim() : '',
    message: message ? message.trim() : '',
    status: 'new'
  });

  await partner.save();

  res.status(201).json({
    success: true,
    message: 'Đăng ký đối tác thành công! Bộ phận phát triển đối tác sẽ liên hệ với bạn trong vòng 24h làm việc.'
  });
});

// ================= ADMIN CONTROLLERS =================

// @desc    Get all partner registrations for Admin
// @route   GET /api/admin/partners
// @access  Private (Admin)
const getAdminPartners = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 20 } = req.query;
  const query = {};

  if (search && search.trim()) {
    const s = search.trim();
    query.$or = [
      { name: { $regex: s, $options: 'i' } },
      { phone: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } },
      { company: { $regex: s, $options: 'i' } }
    ];
  }

  if (status && ['new', 'contacted', 'approved', 'rejected'].includes(status)) {
    query.status = status;
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (parsedPage - 1) * parsedLimit;

  const total = await PartnerRegistration.countDocuments(query);
  const partners = await PartnerRegistration.find(query).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit);

  res.status(200).json({
    success: true,
    data: partners,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.ceil(total / parsedLimit)
    }
  });
});

// @desc    Update partner status
// @route   PUT /api/admin/partners/:id
// @access  Private (Admin)
const updatePartnerStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['new', 'contacted', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Trạng thái không hợp lệ'
    });
  }

  const partner = await PartnerRegistration.findById(id);
  if (!partner) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy đơn đăng ký'
    });
  }

  partner.status = status;
  await partner.save();

  res.status(200).json({
    success: true,
    message: 'Cập nhật trạng thái đối tác thành công',
    data: partner
  });
});

// @desc    Delete partner registration
// @route   DELETE /api/admin/partners/:id
// @access  Private (Admin)
const deletePartner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const partner = await PartnerRegistration.findById(id);

  if (!partner) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy đơn đăng ký'
    });
  }

  await PartnerRegistration.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Xóa đơn đăng ký thành công'
  });
});

module.exports = {
  createPartner,
  getAdminPartners,
  updatePartnerStatus,
  deletePartner
};
