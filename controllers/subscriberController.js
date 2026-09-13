const Subscriber = require('../models/Subscriber');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Subscribe to promotional deals & news
// @route   POST /api/subscribers
// @access  Public
const createSubscriber = asyncHandler(async (req, res) => {
  const { email, phone, source } = req.body;

  const cleanEmail = email ? email.trim().toLowerCase() : '';
  const cleanPhone = phone ? phone.trim() : '';

  if (!cleanEmail && !cleanPhone) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập email hoặc số điện thoại để nhận thông báo khuyến mãi'
    });
  }

  // Check duplicate
  const query = [];
  if (cleanEmail) query.push({ email: cleanEmail });
  if (cleanPhone) query.push({ phone: cleanPhone });

  const existing = await Subscriber.findOne({ $or: query });
  if (existing) {
    return res.status(200).json({
      success: true,
      message: 'Thông tin của bạn đã được ghi nhận trước đó. Cảm ơn bạn đã quan tâm!'
    });
  }

  const subscriber = new Subscriber({
    email: cleanEmail || undefined,
    phone: cleanPhone || undefined,
    source: source ? source.trim() : 'homepage_newsletter',
    status: true
  });

  await subscriber.save();

  res.status(201).json({
    success: true,
    message: 'Đăng ký nhận khuyến mãi thành công! Ưu đãi mới nhất sẽ được gửi đến bạn sớm nhất.'
  });
});

// ================= ADMIN CONTROLLERS =================

// @desc    Get all subscribers for Admin
// @route   GET /api/admin/subscribers
// @access  Private (Admin)
const getAdminSubscribers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;
  const query = {};

  if (search && search.trim()) {
    const s = search.trim();
    query.$or = [
      { email: { $regex: s, $options: 'i' } },
      { phone: { $regex: s, $options: 'i' } }
    ];
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (parsedPage - 1) * parsedLimit;

  const total = await Subscriber.countDocuments(query);
  const subscribers = await Subscriber.find(query).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit);

  res.status(200).json({
    success: true,
    data: subscribers,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.ceil(total / parsedLimit)
    }
  });
});

// @desc    Toggle subscriber status
// @route   PUT /api/admin/subscribers/:id
// @access  Private (Admin)
const toggleSubscriberStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const subscriber = await Subscriber.findById(id);

  if (!subscriber) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy người đăng ký'
    });
  }

  subscriber.status = !subscriber.status;
  await subscriber.save();

  res.status(200).json({
    success: true,
    message: `Đã ${subscriber.status ? 'kích hoạt' : 'hủy kích hoạt'} người đăng ký`,
    data: subscriber
  });
});

// @desc    Delete subscriber
// @route   DELETE /api/admin/subscribers/:id
// @access  Private (Admin)
const deleteSubscriber = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const subscriber = await Subscriber.findById(id);

  if (!subscriber) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy người đăng ký'
    });
  }

  await Subscriber.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Xóa người đăng ký thành công'
  });
});

// @desc    Export subscribers to CSV
// @route   GET /api/admin/subscribers/export
// @access  Private (Admin)
const exportSubscribersCSV = asyncHandler(async (req, res) => {
  const subscribers = await Subscriber.find().sort({ createdAt: -1 });

  let csv = '\uFEFF'; // UTF-8 BOM for Excel Vietnamese display
  csv += 'STT,Email,Số điện thoại,Nguồn,Trạng thái,Ngày đăng ký\n';

  subscribers.forEach((sub, idx) => {
    const email = sub.email || '';
    const phone = sub.phone || '';
    const source = sub.source || '';
    const status = sub.status ? 'Đang hoạt động' : 'Tạm dừng';
    const date = new Date(sub.createdAt).toLocaleString('vi-VN');
    csv += `${idx + 1},"${email}","${phone}","${source}","${status}","${date}"\n`;
  });

  res.header('Content-Type', 'text/csv; charset=utf-8');
  res.attachment(`subscribers_${Date.now()}.csv`);
  return res.send(csv);
});

module.exports = {
  createSubscriber,
  getAdminSubscribers,
  toggleSubscriberStatus,
  deleteSubscriber,
  exportSubscribersCSV
};
