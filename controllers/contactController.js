const Contact = require('../models/Contact');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Submit new contact message
// @route   POST /api/contacts
// @access  Public
const createContact = asyncHandler(async (req, res) => {
  const { name, phone, email, message } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập họ và tên'
    });
  }

  if (!phone || !phone.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập số điện thoại liên hệ'
    });
  }

  if (!message || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập nội dung liên hệ'
    });
  }

  const contact = new Contact({
    name: name.trim(),
    phone: phone.trim(),
    email: email ? email.trim() : '',
    message: message.trim(),
    status: 'new'
  });

  await contact.save();

  res.status(201).json({
    success: true,
    message: 'Thông tin của bạn đã được gửi thành công. Chúng tôi sẽ liên hệ lại sớm nhất!'
  });
});

// ================= ADMIN CONTROLLERS =================

// @desc    Get contacts list for Admin
// @route   GET /api/admin/contacts
// @access  Private (Admin)
const getAdminContacts = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 20 } = req.query;
  const query = {};

  if (search && search.trim()) {
    const s = search.trim();
    query.$or = [
      { name: { $regex: s, $options: 'i' } },
      { phone: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } }
    ];
  }

  if (status && ['new', 'processing', 'completed', 'spam'].includes(status)) {
    query.status = status;
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (parsedPage - 1) * parsedLimit;

  const total = await Contact.countDocuments(query);
  const contacts = await Contact.find(query).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit);

  res.status(200).json({
    success: true,
    data: contacts,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.ceil(total / parsedLimit)
    }
  });
});

// @desc    Update contact status
// @route   PUT /api/admin/contacts/:id
// @access  Private (Admin)
const updateContactStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['new', 'processing', 'completed', 'spam'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Trạng thái không hợp lệ'
    });
  }

  const contact = await Contact.findById(id);
  if (!contact) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy liên hệ'
    });
  }

  contact.status = status;
  await contact.save();

  res.status(200).json({
    success: true,
    message: 'Cập nhật trạng thái liên hệ thành công',
    data: contact
  });
});

// @desc    Delete contact
// @route   DELETE /api/admin/contacts/:id
// @access  Private (Admin)
const deleteContact = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const contact = await Contact.findById(id);

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy liên hệ'
    });
  }

  await Contact.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Xóa liên hệ thành công'
  });
});

module.exports = {
  createContact,
  getAdminContacts,
  updateContactStatus,
  deleteContact
};
