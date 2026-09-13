const mongoose = require('mongoose');
const { createSlug } = require('../utils/helpers');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên danh mục là bắt buộc'],
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      index: true
    },
    image: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    showOnHomepage: {
      type: Boolean,
      default: true,
      index: true
    },
    homepageOrder: {
      type: Number,
      default: 0
    },
    homepageProductLimit: {
      type: Number,
      default: 8
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

categorySchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = createSlug(this.name);
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
