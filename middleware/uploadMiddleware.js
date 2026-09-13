const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const createUploadFolder = (folderName) => {
  const dir = path.join(__dirname, '..', 'public', 'uploads', folderName);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

// Storage factory for different resource types
const createStorage = (folderName) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = createUploadFolder(folderName);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${folderName}-${uniqueSuffix}${ext}`);
    }
  });
};

// File filter for allowed image types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận các định dạng ảnh: JPG, JPEG, PNG, WEBP, SVG!'), false);
  }
};

const createUploader = (folderName, limits = { fileSize: 5 * 1024 * 1024 }) => {
  return multer({
    storage: createStorage(folderName),
    limits: limits,
    fileFilter: fileFilter
  });
};

module.exports = {
  uploadProduct: createUploader('products'),
  uploadBanner: createUploader('banners'),
  uploadNews: createUploader('news'),
  uploadVideo: createUploader('videos'),
  uploadCategory: createUploader('categories'),
  uploadSetting: createUploader('settings')
};
