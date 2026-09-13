const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = require('./config/db');
connectDB();

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows CDN Chart.js, Google Fonts, YouTube iframe embeds
    crossOriginEmbedderPolicy: false
  })
);

app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate Limiting for public submissions (contacts, subscribers, partners)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu từ địa chỉ IP của bạn. Vui lòng thử lại sau ít phút.'
  }
});

const submissionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 15, // limit submissions
  message: {
    success: false,
    message: 'Bạn đã gửi yêu cầu quá nhiều lần. Vui lòng thử lại sau 10 phút.'
  }
});

app.use('/api', apiLimiter);
app.use('/api/contacts', submissionLimiter);
app.use('/api/subscribers', submissionLimiter);
app.use('/api/partners', submissionLimiter);

// Serve static assets with caching
app.use(
  express.static(path.join(__dirname, 'public'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0
  })
);

// Ensure upload folders exist
const fs = require('fs');
['products', 'banners', 'news', 'videos', 'categories', 'settings'].forEach((dir) => {
  const fullPath = path.join(__dirname, 'public', 'uploads', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Mount Public API routes
app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/videos', require('./routes/videoRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/subscribers', require('./routes/subscriberRoutes'));
app.use('/api/partners', require('./routes/partnerRoutes'));
app.use('/api/affiliate-clicks', require('./routes/affiliateRoutes'));

// Mount Admin API routes
app.use('/api/admin', require('./routes/adminRoutes'));

// Client and Admin direct HTML routing
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'login.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

app.get('/partner', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'partner.html'));
});

// Handle 404 for API requests
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
app.use('/api', notFound);

// Centralized error handler
app.use(errorHandler);

// Fallback to index.html for root or client navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Droppii Affiliate Server is running on port ${PORT}`);
  console.log(`🌐 Website: http://localhost:${PORT}`);
  console.log(`🔑 Admin Login: http://localhost:${PORT}/admin/login`);
  console.log(`📊 Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`====================================================`);
});
