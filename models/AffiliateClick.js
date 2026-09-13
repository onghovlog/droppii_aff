const mongoose = require('mongoose');

const affiliateClickSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false,
      index: true
    },
    affiliateUrl: {
      type: String,
      required: [true, 'Affiliate URL là bắt buộc'],
      trim: true
    },
    source: {
      type: String,
      default: 'website_homepage',
      trim: true
    },
    campaign: {
      type: String,
      default: '',
      trim: true
    },
    referrer: {
      type: String,
      default: '',
      trim: true
    },
    userAgent: {
      type: String,
      default: ''
    },
    ip: {
      type: String,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  }
);

module.exports = mongoose.model('AffiliateClick', affiliateClickSchema);
