const mongoose = require('mongoose');

const partnerRegistrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Họ và tên là bắt buộc'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Số điện thoại là bắt buộc'],
      trim: true
    },
    email: {
      type: String,
      default: '',
      trim: true
    },
    company: {
      type: String,
      default: '',
      trim: true
    },
    website: {
      type: String,
      default: '',
      trim: true
    },
    field: {
      type: String,
      default: '',
      trim: true
    },
    message: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'approved', 'rejected'],
      default: 'new',
      index: true
    }
  },
  {
    timestamps: true
  }
);

partnerRegistrationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PartnerRegistration', partnerRegistrationSchema);
