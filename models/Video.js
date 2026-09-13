const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề video là bắt buộc'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    platform: {
      type: String,
      enum: ['youtube', 'tiktok', 'facebook'],
      default: 'youtube'
    },
    videoUrl: {
      type: String,
      required: [true, 'Đường dẫn video là bắt buộc'],
      trim: true
    },
    thumbnail: {
      type: String,
      default: ''
    },
    isVertical: {
      type: Boolean,
      default: false
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

module.exports = mongoose.model('Video', videoSchema);
