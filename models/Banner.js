const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: ''
    },
    position: {
      type: String,
      enum: ['square', 'horizontal', 'vertical'],
      default: 'square',
      index: true
    },
    image: {
      type: String,
      required: [true, 'Hình ảnh banner là bắt buộc'],
      trim: true
    },
    targetUrl: {
      type: String,
      required: [true, 'Đường dẫn liên kết (Target URL) là bắt buộc'],
      trim: true
    },
    sortOrder: {
      type: Number,
      default: 0
    },
    status: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Banner', bannerSchema);
