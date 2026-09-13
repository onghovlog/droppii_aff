const AffiliateClick = require('../models/AffiliateClick');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Contact = require('../models/Contact');
const Subscriber = require('../models/Subscriber');
const PartnerRegistration = require('../models/PartnerRegistration');
const asyncHandler = require('../utils/asyncHandler');
const { isSafeUrl } = require('../utils/helpers');

// @desc    Record affiliate click before external redirection
// @route   POST /api/affiliate-clicks
// @access  Public
const logClick = asyncHandler(async (req, res) => {
  const { productId, affiliateUrl, source, campaign, referrer } = req.body;

  if (!affiliateUrl || !isSafeUrl(affiliateUrl)) {
    return res.status(400).json({
      success: false,
      message: 'Đường dẫn affiliate không hợp lệ'
    });
  }

  const click = new AffiliateClick({
    productId: productId || undefined,
    affiliateUrl: affiliateUrl.trim(),
    source: source ? source.trim() : 'website_homepage',
    campaign: campaign ? campaign.trim() : '',
    referrer: referrer ? referrer.trim() : (req.headers.referer || ''),
    userAgent: req.headers['user-agent'] || '',
    ip: req.ip || req.connection.remoteAddress || ''
  });

  await click.save();

  res.status(201).json({
    success: true,
    message: 'Ghi nhận click thành công'
  });
});

// ================= ADMIN CONTROLLERS =================

// @desc    Get affiliate clicks list with pagination
// @route   GET /api/admin/affiliate-clicks
// @access  Private (Admin)
const getAdminClicks = asyncHandler(async (req, res) => {
  const { productId, page = 1, limit = 50 } = req.query;
  const query = {};

  if (productId) {
    query.productId = productId;
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (parsedPage - 1) * parsedLimit;

  const total = await AffiliateClick.countDocuments(query);
  const clicks = await AffiliateClick.find(query)
    .populate('productId', 'name slug images priceSale')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit);

  res.status(200).json({
    success: true,
    data: clicks,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.ceil(total / parsedLimit)
    }
  });
});

// @desc    Get comprehensive stats for Admin Dashboard
// @route   GET /api/admin/affiliate-clicks/stats
// @access  Private (Admin)
const getAdminStats = asyncHandler(async (req, res) => {
  const now = new Date();

  // Today start
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 7 days ago start
  const start7DaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // 30 days ago start
  const start30DaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // 14 days ago for chart
  const start14DaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Basic counters
  const [
    totalClicks,
    todayClicks,
    clicks7Days,
    clicks30Days,
    totalProducts,
    totalCategories,
    newContacts,
    totalSubscribers,
    totalPartners
  ] = await Promise.all([
    AffiliateClick.countDocuments(),
    AffiliateClick.countDocuments({ createdAt: { $gte: startOfToday } }),
    AffiliateClick.countDocuments({ createdAt: { $gte: start7DaysAgo } }),
    AffiliateClick.countDocuments({ createdAt: { $gte: start30DaysAgo } }),
    Product.countDocuments(),
    Category.countDocuments(),
    Contact.countDocuments({ status: 'new' }),
    Subscriber.countDocuments({ status: true }),
    PartnerRegistration.countDocuments({ status: 'new' })
  ]);

  // Aggregate Top 10 Clicked Products
  const topProductsRaw = await AffiliateClick.aggregate([
    { $match: { productId: { $exists: true, $ne: null } } },
    { $group: { _id: '$productId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  const topProducts = await Promise.all(
    topProductsRaw.map(async (item) => {
      const product = await Product.findById(item._id).select('name slug images priceSale priceOriginal');
      return {
        product: product || { name: 'Sản phẩm đã xóa' },
        count: item.count
      };
    })
  );

  // Aggregate Clicks by Day for the last 14 days (for Chart.js)
  const chartAgg = await AffiliateClick.aggregate([
    { $match: { createdAt: { $gte: start14DaysAgo } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Fill in missing days in 14-day range
  const chartLabels = [];
  const chartData = [];
  const mapDateToCount = {};
  chartAgg.forEach((item) => {
    mapDateToCount[item._id] = item.count;
  });

  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const displayStr = `${d.getDate()}/${d.getMonth() + 1}`;
    chartLabels.push(displayStr);
    chartData.push(mapDateToCount[dateStr] || 0);
  }

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalClicks,
        todayClicks,
        clicks7Days,
        clicks30Days,
        totalProducts,
        totalCategories,
        newContacts,
        totalSubscribers,
        totalPartners
      },
      topProducts,
      chart: {
        labels: chartLabels,
        data: chartData
      }
    }
  });
});

module.exports = {
  logClick,
  getAdminClicks,
  getAdminStats
};
