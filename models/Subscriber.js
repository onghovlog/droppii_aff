const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      index: true
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
      index: true
    },
    status: {
      type: Boolean,
      default: true,
      index: true
    },
    source: {
      type: String,
      default: 'homepage_newsletter',
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

// Ensure at least email or phone is present
subscriberSchema.pre('validate', function (next) {
  if (!this.email && !this.phone) {
    next(new Error('Vui lòng cung cấp email hoặc số điện thoại để đăng ký'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Subscriber', subscriberSchema);
