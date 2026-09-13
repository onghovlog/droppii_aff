const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
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
    message: {
      type: String,
      required: [true, 'Nội dung tin nhắn là bắt buộc'],
      trim: true
    },
    status: {
      type: String,
      enum: ['new', 'processing', 'completed', 'spam'],
      default: 'new',
      index: true
    }
  },
  {
    timestamps: true
  }
);

contactSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);
