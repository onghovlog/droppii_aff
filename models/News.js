const mongoose = require('mongoose');
const { createSlug } = require('../utils/helpers');

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề tin tức là bắt buộc'],
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      index: true
    },
    thumbnail: {
      type: String,
      default: ''
    },
    summary: {
      type: String,
      default: '',
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Nội dung chi tiết là bắt buộc'],
      trim: true
    },
    isHot: {
      type: Boolean,
      default: false,
      index: true
    },
    status: {
      type: Boolean,
      default: true,
      index: true
    },
    publishedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

newsSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = createSlug(this.title) + '-' + Math.floor(1000 + Math.random() * 9000);
  }
  next();
});

module.exports = mongoose.model('News', newsSchema);
