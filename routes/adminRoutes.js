const express = require('express');
const router = express.Router();

// Middleware
const { protectAdmin } = require('../middleware/authMiddleware');
const {
  uploadProduct,
  uploadBanner,
  uploadNews,
  uploadVideo,
  uploadCategory,
  uploadSetting
} = require('../middleware/uploadMiddleware');

// Controllers
const { loginAdmin, getMe, updateProfile } = require('../controllers/adminController');
const {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const {
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner
} = require('../controllers/bannerController');
const {
  getAdminNews,
  createNews,
  updateNews,
  deleteNews
} = require('../controllers/newsController');
const {
  getAdminVideos,
  createVideo,
  updateVideo,
  deleteVideo
} = require('../controllers/videoController');
const {
  getAdminContacts,
  updateContactStatus,
  deleteContact
} = require('../controllers/contactController');
const {
  getAdminSubscribers,
  toggleSubscriberStatus,
  deleteSubscriber,
  exportSubscribersCSV
} = require('../controllers/subscriberController');
const {
  getAdminPartners,
  updatePartnerStatus,
  deletePartner
} = require('../controllers/partnerController');
const {
  getSettings,
  updateSettings
} = require('../controllers/settingController');
const {
  getAdminClicks,
  getAdminStats
} = require('../controllers/affiliateController');

// ================= AUTHENTICATION =================
router.post('/login', loginAdmin);
router.get('/me', protectAdmin, getMe);
router.put('/profile', protectAdmin, updateProfile);

// ================= PRODUCTS =================
router.get('/products', protectAdmin, getAdminProducts);
router.post('/products', protectAdmin, uploadProduct.array('images', 8), createProduct);
router.put('/products/:id', protectAdmin, uploadProduct.array('images', 8), updateProduct);
router.delete('/products/:id', protectAdmin, deleteProduct);

// ================= CATEGORIES =================
router.get('/categories', protectAdmin, getAdminCategories);
router.post('/categories', protectAdmin, uploadCategory.single('image'), createCategory);
router.put('/categories/:id', protectAdmin, uploadCategory.single('image'), updateCategory);
router.delete('/categories/:id', protectAdmin, deleteCategory);

// ================= BANNERS =================
router.get('/banners', protectAdmin, getAdminBanners);
router.post('/banners', protectAdmin, uploadBanner.single('image'), createBanner);
router.put('/banners/:id', protectAdmin, uploadBanner.single('image'), updateBanner);
router.delete('/banners/:id', protectAdmin, deleteBanner);

// ================= NEWS =================
router.get('/news', protectAdmin, getAdminNews);
router.post('/news', protectAdmin, uploadNews.single('thumbnail'), createNews);
router.put('/news/:id', protectAdmin, uploadNews.single('thumbnail'), updateNews);
router.delete('/news/:id', protectAdmin, deleteNews);

// ================= VIDEOS =================
router.get('/videos', protectAdmin, getAdminVideos);
router.post('/videos', protectAdmin, uploadVideo.single('thumbnail'), createVideo);
router.put('/videos/:id', protectAdmin, uploadVideo.single('thumbnail'), updateVideo);
router.delete('/videos/:id', protectAdmin, deleteVideo);

// ================= CONTACTS =================
router.get('/contacts', protectAdmin, getAdminContacts);
router.put('/contacts/:id', protectAdmin, updateContactStatus);
router.delete('/contacts/:id', protectAdmin, deleteContact);

// ================= SUBSCRIBERS =================
router.get('/subscribers/export', protectAdmin, exportSubscribersCSV);
router.get('/subscribers', protectAdmin, getAdminSubscribers);
router.put('/subscribers/:id', protectAdmin, toggleSubscriberStatus);
router.delete('/subscribers/:id', protectAdmin, deleteSubscriber);

// ================= PARTNERS =================
router.get('/partners', protectAdmin, getAdminPartners);
router.put('/partners/:id', protectAdmin, updatePartnerStatus);
router.delete('/partners/:id', protectAdmin, deletePartner);

// ================= SETTINGS =================
router.get('/settings', protectAdmin, getSettings);
router.put(
  '/settings',
  protectAdmin,
  uploadSetting.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 }
  ]),
  updateSettings
);

// ================= AFFILIATE STATS =================
router.get('/affiliate-clicks/stats', protectAdmin, getAdminStats);
router.get('/affiliate-clicks', protectAdmin, getAdminClicks);

module.exports = router;
