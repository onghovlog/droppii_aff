const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: 'Droppii Affiliate - Mua Sắm Thông Minh',
      trim: true
    },
    logo: {
      type: String,
      default: ''
    },
    favicon: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: '0901 234 567',
      trim: true
    },
    email: {
      type: String,
      default: 'contact@droppiiaff.vn',
      trim: true
    },
    address: {
      type: String,
      default: 'Tòa nhà Landmark 81, 720A Điện Biên Phủ, P. 22, Bình Thạnh, TP. Hồ Chí Minh',
      trim: true
    },
    zaloUrl: {
      type: String,
      default: 'https://zalo.me/0901234567',
      trim: true
    },
    messengerUrl: {
      type: String,
      default: 'https://m.me/droppii.vietnam',
      trim: true
    },
    facebookUrl: {
      type: String,
      default: 'https://facebook.com',
      trim: true
    },
    youtubeUrl: {
      type: String,
      default: 'https://youtube.com',
      trim: true
    },
    tiktokUrl: {
      type: String,
      default: 'https://tiktok.com',
      trim: true
    },
    affiliateDisclosure: {
      type: String,
      default: 'Một số liên kết trên website là liên kết tiếp thị liên kết (Affiliate). Chúng tôi có thể nhận hoa hồng khi bạn mua hàng thông qua các liên kết này mà không làm tăng giá sản phẩm của bạn. Xin cảm ơn sự ủng hộ của bạn!',
      trim: true
    },
    footerDescription: {
      type: String,
      default: 'Nền tảng tổng hợp sản phẩm chính hãng chất lượng cao, ưu đãi độc quyền từ Droppii và các sàn thương mại điện tử hàng đầu.',
      trim: true
    },
    primaryColor: {
      type: String,
      default: '#FF7A00',
      trim: true
    },
    secondaryColor: {
      type: String,
      default: '#1976D2',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Setting', settingSchema);
