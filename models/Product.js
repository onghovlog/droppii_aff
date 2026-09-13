const mongoose = require('mongoose');
const { createSlug } = require('../utils/helpers');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên sản phẩm là bắt buộc'],
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      index: true
    },
    shortDescription: {
      type: String,
      default: '',
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    priceOriginal: {
      type: Number,
      default: 0,
      min: [0, 'Giá gốc không được nhỏ hơn 0']
    },
    priceSale: {
      type: Number,
      default: 0,
      min: [0, 'Giá khuyến mãi không được nhỏ hơn 0']
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    gift: {
      type: String,
      default: '',
      trim: true
    },
    images: {
      type: [String],
      default: []
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Danh mục là bắt buộc'],
      index: true
    },
    affiliateUrl: {
      type: String,
      required: [true, 'Link Affiliate là bắt buộc'],
      trim: true
    },
    isPromotion: {
      type: Boolean,
      default: false,
      index: true
    },
    isNew: {
      type: Boolean,
      default: false,
      index: true
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    status: {
      type: Boolean,
      default: true,
      index: true
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true
  }
);

// Auto slug and discount calculation
productSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = createSlug(this.name) + '-' + Math.floor(1000 + Math.random() * 9000);
  }
  if (this.priceOriginal > 0 && this.priceSale > 0 && this.priceSale < this.priceOriginal) {
    this.discountPercent = Math.round(((this.priceOriginal - this.priceSale) / this.priceOriginal) * 100);
  } else if (!this.discountPercent) {
    this.discountPercent = 0;
  }
  next();
});

productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
