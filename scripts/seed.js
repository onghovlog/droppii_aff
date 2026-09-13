const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Models
const Category = require('../models/Category');
const Product = require('../models/Product');
const Banner = require('../models/Banner');
const News = require('../models/News');
const Video = require('../models/Video');
const Setting = require('../models/Setting');
const Admin = require('../models/Admin');
const AffiliateClick = require('../models/AffiliateClick');
const Contact = require('../models/Contact');
const Subscriber = require('../models/Subscriber');
const PartnerRegistration = require('../models/PartnerRegistration');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/affiliate_web';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected successfully.');

    // Clear existing collections
    console.log('[Seed] Clearing old data...');
    await Promise.all([
      Category.deleteMany(),
      Product.deleteMany(),
      Banner.deleteMany(),
      News.deleteMany(),
      Video.deleteMany(),
      Setting.deleteMany(),
      Admin.deleteMany(),
      AffiliateClick.deleteMany(),
      Contact.deleteMany(),
      Subscriber.deleteMany(),
      PartnerRegistration.deleteMany()
    ]);

    // 1. Create Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
    console.log(`[Seed] Creating Admin account (${adminEmail})...`);
    
    // Note: adminSchema pre('save') hashes the password
    const admin = new Admin({
      name: 'Droppii Administrator',
      email: adminEmail.toLowerCase().trim(),
      password: adminPassword,
      status: true
    });
    await admin.save();

    // 2. Create Settings
    console.log('[Seed] Creating Website Settings...');
    await Setting.create({
      siteName: 'Droppii Affiliate - Săn Deal & Sản Phẩm Chính Hãng',
      logo: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&auto=format&fit=crop&q=80',
      favicon: '',
      phone: '0901 234 567',
      email: 'hotro@droppiiaff.vn',
      address: 'Tầng 18, Tòa nhà Bitexco Financial Tower, Quận 1, TP. Hồ Chí Minh',
      zaloUrl: 'https://zalo.me/0901234567',
      messengerUrl: 'https://m.me/droppii.vietnam',
      facebookUrl: 'https://facebook.com/droppii.official',
      youtubeUrl: 'https://youtube.com/@DroppiiOfficial',
      tiktokUrl: 'https://tiktok.com/@droppii.vn',
      affiliateDisclosure: 'Một số liên kết trên website là liên kết tiếp thị liên kết (Affiliate Link). Chúng tôi có thể nhận hoa hồng từ các đối tác thương mại điện tử uy tín khi bạn mua sắm qua các liên kết này mà không làm tăng bất kỳ chi phí nào cho bạn. Xin chân thành cảm ơn sự đồng hành và ủng hộ của quý khách!',
      footerDescription: 'Droppii Affiliate - Cổng thông tin tổng hợp các sản phẩm chính hãng, deal giảm giá sốc, quà tặng hấp dẫn từ các thương hiệu hàng đầu và đối tác độc quyền.',
      primaryColor: '#FF7A00',
      secondaryColor: '#1976D2'
    });

    // 3. Create Categories
    console.log('[Seed] Creating Categories...');
    const categoriesData = [
      {
        name: 'Điện thoại & Công nghệ',
        slug: 'dien-thoai-cong-nghe',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80',
        description: 'Smartphone, đồng hồ thông minh, tai nghe bluetooth, phụ kiện công nghệ đỉnh cao',
        showOnHomepage: true,
        homepageOrder: 1,
        homepageProductLimit: 8,
        status: true
      },
      {
        name: 'Đồ gia dụng thông minh',
        slug: 'do-gia-dung-thong-minh',
        image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500&auto=format&fit=crop&q=80',
        description: 'Nồi chiên không dầu, robot hút bụi, máy lọc không khí và thiết bị nhà bếp hiện đại',
        showOnHomepage: true,
        homepageOrder: 2,
        homepageProductLimit: 8,
        status: true
      },
      {
        name: 'Mỹ phẩm & Chăm sóc da',
        slug: 'my-pham-cham-soc-da',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
        description: 'Kem chống nắng, serum dưỡng trắng, bộ chăm sóc da chuyên sâu từ Hàn Quốc, Nhật Bản',
        showOnHomepage: true,
        homepageOrder: 3,
        homepageProductLimit: 8,
        status: true
      },
      {
        name: 'Sức khỏe & Dinh dưỡng',
        slug: 'suc-khoe-dinh-duong',
        image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=500&auto=format&fit=crop&q=80',
        description: 'Đông trùng hạ thảo, nhân sâm, vitamin tổng hợp, thực phẩm bảo vệ sức khỏe gia đình',
        showOnHomepage: true,
        homepageOrder: 4,
        homepageProductLimit: 8,
        status: true
      },
      {
        name: 'Thời trang & Phụ kiện',
        slug: 'thoi-trang-phu-kien',
        image: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=500&auto=format&fit=crop&q=80',
        description: 'Túi xách cao cấp, kính mát thời thượng, đồng hồ nam nữ và phụ kiện phong cách',
        showOnHomepage: false,
        homepageOrder: 5,
        homepageProductLimit: 8,
        status: true
      }
    ];

    const savedCategories = await Category.insertMany(categoriesData);
    const catMap = {};
    savedCategories.forEach((c) => {
      catMap[c.slug] = c._id;
    });

    // 4. Create Banners (STRICT: ONLY image, targetUrl, sortOrder, status - NO TEXT FIELDS)
    console.log('[Seed] Creating Banners...');
    const bannersData = [
      {
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format&fit=crop&q=80',
        targetUrl: 'https://shopee.vn/search?keyword=droppii',
        sortOrder: 1,
        status: true
      },
      {
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80',
        targetUrl: 'https://lazada.vn',
        sortOrder: 2,
        status: true
      },
      {
        image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1600&auto=format&fit=crop&q=80',
        targetUrl: 'https://tiki.vn',
        sortOrder: 3,
        status: true
      },
      {
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
        targetUrl: 'https://shopee.vn',
        sortOrder: 4,
        status: true
      }
    ];
    await Banner.insertMany(bannersData);

    // 5. Create 20 Products
    console.log('[Seed] Creating 20 Products...');
    const productsData = [
      // 1-5 Công nghệ
      {
        name: 'iPhone 16 Pro Max 256GB Titan Tự Nhiên',
        slug: 'iphone-16-pro-max-256gb-titan-tu-nhien',
        shortDescription: 'Chip A18 Pro mạnh mẽ, camera 48MP zoom 5x, thời lượng pin cả ngày dài.',
        description: 'iPhone 16 Pro Max mang đến bước đột phá với vi xử lý A18 Pro, nút điều khiển Camera Control mới toanh và thiết kế titan bền bỉ. Màn hình Super Retina XDR 6.9 inch hiển thị sống động rực rỡ.',
        priceOriginal: 34990000,
        priceSale: 31490000,
        discountPercent: 10,
        gift: 'Tặng ốp lưng MagSafe chính hãng & Củ sạc 30W trị giá 990K',
        images: [
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'
        ],
        categoryId: catMap['dien-thoai-cong-nghe'],
        affiliateUrl: 'https://shopee.vn/universal-link/product-iphone-16-pro-max',
        isPromotion: true,
        isNew: true,
        isFeatured: true,
        status: true,
        sortOrder: 1
      },
      {
        name: 'Samsung Galaxy S24 Ultra 5G AI 512GB',
        slug: 'samsung-galaxy-s24-ultra-5g-ai-512gb',
        shortDescription: 'Quyền năng Galaxy AI, bút S-Pen tích hợp, khung viền titan siêu sang trọng.',
        description: 'Flagship đỉnh cao trang bị Snapdragon 8 Gen 3 for Galaxy, hệ thống camera 200MP zoom quang 100x và tính năng khoanh tròn để tìm kiếm thông minh hàng đầu thế giới.',
        priceOriginal: 37490000,
        priceSale: 29990000,
        discountPercent: 20,
        gift: 'Tặng bao da Smart View & Đế sạc không dây 15W',
        images: [
          'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80'
        ],
        categoryId: catMap['dien-thoai-cong-nghe'],
        affiliateUrl: 'https://shopee.vn/samsung-galaxy-s24-ultra',
        isPromotion: true,
        isNew: true,
        isFeatured: true,
        status: true,
        sortOrder: 2
      },
      {
        name: 'Tai nghe Bluetooth Sony WH-1000XM5 Chống Ồn',
        slug: 'tai-nghe-bluetooth-sony-wh-1000xm5-chong-on',
        shortDescription: 'Chống ồn chủ động đỉnh cao ngành âm thanh, thời lượng pin 30 giờ.',
        description: 'Sony WH-1000XM5 sở hữu 8 micro và 2 bộ xử lý Auto NC Optimizer, tái tạo chất âm Hi-Res sắc nét hoàn hảo trong mọi môi trường ồn ào.',
        priceOriginal: 8490000,
        priceSale: 6790000,
        discountPercent: 20,
        gift: 'Tặng hộp đựng cao cấp & Voucher bảo hành 2 năm',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&auto=format&fit=crop&q=80'
        ],
        categoryId: catMap['dien-thoai-cong-nghe'],
        affiliateUrl: 'https://shopee.vn/sony-wh-1000xm5',
        isPromotion: true,
        isNew: false,
        isFeatured: true,
        status: true,
        sortOrder: 3
      },
      {
        name: 'Đồng hồ thông minh Apple Watch Series 10 GPS',
        slug: 'apple-watch-series-10-gps-46mm',
        shortDescription: 'Màn hình OLED góc rộng sáng hơn 40%, đo điện tâm đồ và nồng độ Oxy.',
        description: 'Thiết kế mỏng nhẹ nhất từ trước đến nay, tính năng phát hiện ngưng thở khi ngủ và sạc nhanh lên 80% chỉ trong 30 phút.',
        priceOriginal: 11990000,
        priceSale: 10490000,
        discountPercent: 13,
        gift: 'Tặng thêm 01 dây đeo thể thao Silicon thể thao',
        images: [
          'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80'
        ],
        categoryId: catMap['dien-thoai-cong-nghe'],
        affiliateUrl: 'https://tiki.vn/apple-watch-series-10',
        isPromotion: false,
        isNew: true,
        isFeatured: false,
        status: true,
        sortOrder: 4
      },
      // 5-9 Gia dụng thông minh
      {
        name: 'Robot Hút Bụi Lau Nhà Dreame L20 Ultra Tự Động',
        slug: 'robot-hut-bui-lau-nha-dreame-l20-ultra-tu-dong',
        shortDescription: 'Lực hút siêu mạnh 7000Pa, tự giặt và sấy khô giẻ lau bằng khí nóng.',
        description: 'Dreame L20 Ultra là trợ thủ đắc lực giải phóng sức lao động với trạm sạc toàn năng tự động thêm nước lau sàn, tự hút bụi vào túi 3.2L tiện lợi.',
        priceOriginal: 24990000,
        priceSale: 18990000,
        discountPercent: 24,
        gift: 'Tặng kèm bộ phụ kiện giẻ lau + 2 chai nước lau chuyên dụng trị giá 1.5 Triệu',
        images: [
          'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop&q=80'
        ],
        categoryId: catMap['do-gia-dung-thong-minh'],
        affiliateUrl: 'https://lazada.vn/dreame-l20-ultra',
        isPromotion: true,
        isNew: false,
        isFeatured: true,
        status: true,
        sortOrder: 5
      },
      {
        name: 'Nồi Chiên Không Dầu Philips XXL 7.2L HD9650',
        slug: 'noi-chien-khong-dau-philips-xxl-72l-hd9650',
        shortDescription: 'Công nghệ Twin TurboStar loại bỏ 90% dầu mỡ dư thừa, giòn rụm bên ngoài.',
        description: 'Dung tích khủng 7.2 lít chiên nguyên con gà 1.8kg dễ dàng. Màn hình kỹ thuật số cài sẵn 5 chương trình nấu ăn nhanh chóng.',
        priceOriginal: 8290000,
        priceSale: 4990000,
        discountPercent: 40,
        gift: 'Tặng sách 100 công thức nấu ăn & Kẹp gắp silicon',
        images: [
          'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=600&auto=format&fit=crop&q=80'
        ],
        categoryId: catMap['do-gia-dung-thong-minh'],
        affiliateUrl: 'https://shopee.vn/philips-xxl-hd9650',
        isPromotion: true,
        isNew: false,
        isFeatured: true,
        status: true,
        sortOrder: 6
      },
      {
        name: 'Máy Lọc Không Khí Xiaomi Smart Air Purifier 4 Pro',
        slug: 'may-loc-khong-khi-xiaomi-smart-air-purifier-4-pro',
        shortDescription: 'Lọc 99.97% bụi mịn PM2.5, khử mùi hôi, diện tích bao phủ 60m².',
        description: 'Trang bị cảm biến laser độ chính xác cao, điều khiển từ xa thông minh qua ứng dụng Mi Home tiện lợi cho gia đình có trẻ nhỏ.',
        priceOriginal: 6290000,
        priceSale: 4490000,
        discountPercent: 29,
        gift: 'Tặng thêm 01 lõi lọc phụ kháng khuẩn chính hãng',
        images: [
          'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop&q=80'
        ],
        categoryId: catMap['do-gia-dung-thong-minh'],
        affiliateUrl: 'https://tiki.vn/xiaomi-air-purifier-4-pro',
        isPromotion: true,
        isNew: true,
        isFeatured: false,
        status: true,
        sortOrder: 7
      },
      {
        name: 'Máy Ép Chậm Hurom H400 Công Nghệ Ép Trục Vít',
        slug: 'may-ep-cham-hurom-h400-nhap-khau-han-quoc',
        shortDescription: 'Ép kiệt bã 98%, giữ nguyên enzyme và vitamin tự nhiên của trái cây.',
        description: 'Dòng máy ép chậm cao cấp nhất của Hurom Hàn Quốc với khoang chứa lớn không cần cắt nhỏ hoa quả, tự động cắt và ép chỉ với 1 nút bấm.',
        priceOriginal: 12900000,
        priceSale: 9890000,
        discountPercent: 23,
        gift: 'Tặng bình thủy tinh chịu nhiệt 1000ml đựng nước ép',
        images: [
          'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&auto=format&fit=crop&q=80'
        ],
        categoryId: catMap['do-gia-dung-thong-minh'],
        affiliateUrl: 'https://shopee.vn/hurom-h400',
        isPromotion: false,
        isNew: true,
        isFeatured: false,
        status: true,
        sortOrder: 8
      },
      // 9-12 Mỹ phẩm
      {
        name: 'Serum Phục Hồi Da Estee Lauder Advanced Night Repair 50ml',
        slug: 'serum-phuc-hoi-da-estee-lauder-advanced-night-repair-50ml',
        shortDescription: 'Công nghệ ChronoluxCB độc quyền giúp tái tạo da ban đêm, chống lão hóa.',
        description: 'Biểu tượng dưỡng da bán chạy số 1 toàn cầu, cung cấp độ ẩm suốt 72 giờ và giảm thiểu rõ rệt các nếp nhăn, mang lại làn da căng bóng mịn màng.',
        priceOriginal: 3750000,
        priceSale: 2850000,
        discountPercent: 24,
        gift: 'Tặng mini size 15ml cùng dòng & Kem mắt 5ml',
        images: [
          'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80'
        ],
        categoryId: catMap['my-pham-cham-soc-da'],
        affiliateUrl: 'https://shopee.vn/estee-lauder-anr',
        isPromotion: true,
        isNew: false,
        isFeatured: true,
        status: true,
        sortOrder: 9
      },
      {
        name: 'Kem Chống Nắng La Roche-Posay Anthelios UVMune 400 50ml',
        slug: 'kem-chong-nang-la-roche-posay-uvmune-400-50ml',
        shortDescription: 'Màng lọc Mexoryl 400 chống tia UVA siêu dài, kiềm dầu đến 12 giờ.',
        description: 'Bảo vệ da tối đa trước ánh nắng mặt trời và ô nhiễm môi trường, kết cấu mỏng nhẹ thấm nhanh không để lại vệt trắng, không gây mụn ẩn.',
        priceOriginal: 520000,
        priceSale: 395000,
        discountPercent: 24,
        gift: 'Tặng kèm xịt khoáng La Roche-Posay 50ml',
        images: [
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80'
        ],
        categoryId: catMap['my-pham-cham-soc-da'],
        affiliateUrl: 'https://lazada.vn/la-roche-posay-uvmune',
        isPromotion: true,
        isNew: true,
        isFeatured: true,
        status: true,
        sortOrder: 10
      },
      {
        name: 'Nước Thần Dưỡng Da SK-II Facial Treatment Essence 230ml',
        slug: 'nuoc-than-duong-da-sk-ii-facial-treatment-essence-230ml',
        shortDescription: 'Chứa hơn 90% Pitera tự nhiên giúp da trong suốt như pha lê.',
        description: 'Sản phẩm kinh điển của xứ sở hoa anh đào cải thiện 5 yếu tố cấu thành làn da khỏe đẹp: kết cấu, độ săn chắc, kiểm soát đốm nâu, nếp nhăn và độ rạng rỡ.',
        priceOriginal: 5400000,
        priceSale: 4200000,
        discountPercent: 22,
        gift: 'Tặng bông tẩy trang cao cấp Nhật Bản 120 miếng',
        images: [
          'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop&q=80'
        ],
        categoryId: catMap['my-pham-cham-soc-da'],
        affiliateUrl: 'https://tiki.vn/sk-ii-essence-230ml',
        isPromotion: false,
        isNew: false,
        isFeatured: false,
        status: true,
        sortOrder: 11
      },
      {
        name: 'Son Kem Lì Black Rouge Air Fit Velvet Tint Ver 9',
        slug: 'son-kem-li-black-rouge-air-fit-velvet-tint-ver-9',
        shortDescription: 'Chất son xốp mịn nhẹ môi, bảng màu thời thượng tôn da cực chuẩn.',
        description: 'Phiên bản cải tiến với độ bám màu lên đến 8 giờ không gây khô nứt, hương hoa quả ngọt ngào dễ chịu.',
        priceOriginal: 290000,
        priceSale: 189000,
        discountPercent: 35,
        gift: 'Tặng kèm túi đựng son hologram xinh xắn',
        images: [
          'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80'
        ],
        categoryId: catMap['my-pham-cham-soc-da'],
        affiliateUrl: 'https://shopee.vn/black-rouge-ver-9',
        isPromotion: true,
        isNew: true,
        isFeatured: false,
        status: true,
        sortOrder: 12
      },
      // 13-16 Sức khỏe dinh dưỡng
      {
        name: 'Đông Trùng Hạ Thảo Tươi Droppii Cordyceps Hộp 100g',
        slug: 'dong-trung-ha-thao-tuoi-droppii-cordyceps-100g',
        shortDescription: 'Hàm lượng Cordycepin và Adenosine tinh khiết cao, tăng cường miễn dịch.',
        description: 'Nuôi cấy trong môi trường phòng sạch đạt chuẩn GMP quốc tế, hỗ trợ bồi bổ cơ thể, bảo vệ tim mạch, giảm căng thẳng mệt mỏi cho người lớn tuổi và người bận rộn.',
        priceOriginal: 1500000,
        priceSale: 1090000,
        discountPercent: 27,
        gift: 'Tặng 1 hũ Mật ong hoa nhãn nguyên chất 250ml ngâm cùng',
        images: [
          'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&auto=format&fit=crop&q=80'
        ],
        categoryId: catMap['suc-khoe-dinh-duong'],
        affiliateUrl: 'https://shopee.vn/dong-trung-ha-thao-droppii',
        isPromotion: true,
        isNew: true,
        isFeatured: true,
        status: true,
        sortOrder: 13
      },
      {
        name: 'Hồng Sâm Củ Khô 6 Năm Tuổi KGC Cheong Kwan Jang 300g',
        slug: 'hong-sam-cu-kho-kgc-cheong-kwan-jang-300g',
        shortDescription: 'Thương hiệu sâm số 1 Hàn Quốc, chứng nhận tiêu chuẩn Hoàng gia KGC.',
        description: 'Hồng sâm nguyên củ được hấp sấy từ nhân sâm tươi 6 năm tuổi tuyển chọn, giàu saponin quý giúp lưu thông khí huyết, cải thiện trí nhớ và bồi bổ sinh lực.',
        priceOriginal: 4800000,
        priceSale: 3950000,
        discountPercent: 18,
        gift: 'Tặng hộp trà sâm hòa tan KGC cao cấp 50 gói',
        images: [
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
        ],
        categoryId: catMap['suc-khoe-dinh-duong'],
        affiliateUrl: 'https://lazada.vn/hong-sam-kgc',
        isPromotion: false,
        isNew: false,
        isFeatured: true,
        status: true,
        sortOrder: 14
      },
      {
        name: 'Viên Uống Collagen DHC Nhật Bản Gói 60 Ngày (360 viên)',
        slug: 'vien-uong-collagen-dhc-nhat-ban-60-ngay',
        shortDescription: 'Bổ sung 2.050mg Collagen Peptide chiết xuất từ cá, hấp thu cực nhanh.',
        description: 'Giúp duy trì độ đàn hồi săn chắc cho làn da, ngăn ngừa nếp nhăn và rụng tóc, thành phần an toàn lành tính từ Nhật Bản.',
        priceOriginal: 550000,
        priceSale: 385000,
        discountPercent: 30,
        gift: 'Tặng kèm 01 túi viên uống Vitamin C DHC 30 ngày',
        images: [
          'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'
        ],
        categoryId: catMap['suc-khoe-dinh-duong'],
        affiliateUrl: 'https://shopee.vn/collagen-dhc-60-ngay',
        isPromotion: true,
        isNew: true,
        isFeatured: false,
        status: true,
        sortOrder: 15
      },
      {
        name: 'Bột Cần Tây Sấy Lạnh Giảm Cân Detox Jan’s Hộp 30 Gói',
        slug: 'bot-can-tay-say-lanh-giam-can-detox-jans-30-goi',
        shortDescription: 'Công nghệ sấy lạnh Sasaki Nhật Bản giữ trọn vẹn chất xơ và khoáng chất.',
        description: 'Hỗ trợ thanh lọc gan, đào thải mỡ thừa tích tụ, hỗ trợ tiêu hóa khỏe mạnh và giúp giữ gìn vóc dáng thon gọn tự nhiên.',
        priceOriginal: 360000,
        priceSale: 249000,
        discountPercent: 31,
        gift: 'Tặng bình lắc Detox thể thao 500ml',
        images: [
          'https://images.unsplash.com/photo-1550989460-0adc9f6be9ab?w=600&auto=format&fit=crop&q=80'
        ],
        categoryId: catMap['suc-khoe-dinh-duong'],
        affiliateUrl: 'https://tiki.vn/bot-can-tay-jans',
        isPromotion: true,
        isNew: false,
        isFeatured: false,
        status: true,
        sortOrder: 16
      },
      // 17-20 Thời trang & Phụ kiện
      {
        name: 'Túi Xách Nữ Da Thật Phong Cách Minimalist Pedro',
        slug: 'tui-xach-nu-da-that-phong-cach-minimalist-pedro',
        shortDescription: 'Chất liệu da bò cao cấp, khóa kim loại mạ vàng sang trọng thanh lịch.',
        description: 'Thiết kế tinh tế phù hợp cho nàng công sở hay đi dạo phố, ngăn chứa rộng rãi vừa vặn điện thoại, ví tiền và mỹ phẩm tiện dụng.',
        priceOriginal: 2490000,
        priceSale: 1890000,
        discountPercent: 24,
        gift: 'Tặng khăn lụa thắt quai túi thời trang',
        images: [
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80'
        ],
        categoryId: catMap['thoi-trang-phu-kien'],
        affiliateUrl: 'https://shopee.vn/tui-pedro-da-that',
        isPromotion: false,
        isNew: true,
        isFeatured: false,
        status: true,
        sortOrder: 17
      },
      {
        name: 'Kính Mát Phân Cực Ray-Ban Aviator Classic Khung Vàng',
        slug: 'kinh-mat-phan-cuc-ray-ban-aviator-classic-khung-vang',
        shortDescription: 'Tròng kính Polarized chống tia UV400 bảo vệ mắt tuyệt đối dưới ánh nắng.',
        description: 'Biểu tượng phong cách phi công trường tồn từ năm 1937, gọng kim loại titan nhẹ nhàng ôm sát khuôn mặt tạo điểm nhấn đẳng cấp.',
        priceOriginal: 4850000,
        priceSale: 3650000,
        discountPercent: 25,
        gift: 'Tặng hộp da cứng nguyên seal và khăn lau chống xước',
        images: [
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80'
        ],
        categoryId: catMap['thoi-trang-phu-kien'],
        affiliateUrl: 'https://lazada.vn/ray-ban-aviator',
        isPromotion: true,
        isNew: false,
        isFeatured: true,
        status: true,
        sortOrder: 18
      },
      {
        name: 'Đồng Hồ Nam Casio Edifice Sapphire Chống Nước 100m',
        slug: 'dong-ho-nam-casio-edifice-sapphire-chong-nuoc-100m',
        shortDescription: 'Mặt kính Sapphire chống trầy xước, thiết kế thể thao nam tính.',
        description: 'Dây đeo thép không gỉ 316L sáng bóng, pin năng lượng mặt trời Tough Solar siêu bền bỉ không lo hết pin trong suốt 10 năm.',
        priceOriginal: 5200000,
        priceSale: 3890000,
        discountPercent: 25,
        gift: 'Tặng thêm 01 dây da bò thay đổi phong cách',
        images: [
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80'
        ],
        categoryId: catMap['thoi-trang-phu-kien'],
        affiliateUrl: 'https://tiki.vn/casio-edifice-sapphire',
        isPromotion: false,
        isNew: true,
        isFeatured: false,
        status: true,
        sortOrder: 19
      },
      {
        name: 'Balo Chống Nước Đa Năng Mark Ryden Đựng Laptop 15.6 Inch',
        slug: 'balo-chong-nuoc-da-nang-mark-ryden-laptop-15-6-inch',
        shortDescription: 'Tích hợp cổng sạc USB, khóa chống trộm TSA an toàn khi du lịch.',
        description: 'Vải Oxford 900D chống thấm nước vượt trội, đệm lưng thoáng khí 3D giảm tải trọng cột sống, lý tưởng cho dân văn phòng và công tác.',
        priceOriginal: 1250000,
        priceSale: 790000,
        discountPercent: 37,
        gift: 'Tặng túi bọc balo chống mưa bão chuyên dụng',
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80'
        ],
        categoryId: catMap['thoi-trang-phu-kien'],
        affiliateUrl: 'https://shopee.vn/balo-mark-ryden',
        isPromotion: true,
        isNew: false,
        isFeatured: false,
        status: true,
        sortOrder: 20
      }
    ];

    await Product.insertMany(productsData);

    // 6. Create 5 HOT News
    console.log('[Seed] Creating 5 Hot News...');
    const newsData = [
      {
        title: 'Bùng Nổ Siêu Sale Ngày Đôi: Săn Voucher Giảm Đến 50% Toàn Sàn Droppii',
        slug: 'bung-no-sieu-sale-ngay-doi-san-voucher-50-phan-tram',
        thumbnail: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=80',
        summary: 'Chương trình khuyến mãi lớn nhất tháng với hàng triệu mã giảm giá cực sốc, miễn phí vận chuyển 0Đ và quà tặng độc quyền từ các thương hiệu chính hãng.',
        content: `<h3>Đại tiệc siêu sale tháng này đã chính thức bắt đầu!</h3>
        <p>Để tri ân hàng triệu khách hàng tin yêu, hệ thống Droppii Affiliate phối hợp cùng các thương hiệu đối tác triển khai chuỗi ưu đãi lớn nhất:</p>
        <ul>
          <li><strong>Giảm trực tiếp đến 50%</strong> cho hàng nghìn sản phẩm điện máy, gia dụng, làm đẹp và sức khỏe.</li>
          <li><strong>Hàng triệu Voucher hoàn tiền</strong> và quà tặng đính kèm giá trị lên đến 2.000.000 VNĐ.</li>
          <li><strong>Freeship Extra</strong> toàn quốc cho mọi đơn hàng liên kết.</li>
        </ul>
        <p>Đừng bỏ lỡ cơ hội săn deal hot ngay hôm nay bằng cách bấm vào các sản phẩm được gắn nhãn khuyến mãi trên trang chủ!</p>`,
        isHot: true,
        status: true,
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        title: 'Top 5 Thiết Bị Gia Dụng Thông Minh Giúp Tiết Kiệm 2 Tiếng Dọn Nhà Mỗi Ngày',
        slug: 'top-5-thiet-bi-gia-dung-thong-minh-tiet-kiem-thoi-gian',
        thumbnail: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80',
        summary: 'Khám phá các thiết bị thông minh hiện đại: robot hút bụi lau nhà, máy rửa bát, nồi chiên không dầu giúp cuộc sống gia đình thêm thảnh thơi.',
        content: `<h3>Giải phóng sức lao động với công nghệ gia dụng hiện đại</h3>
        <p>Cuộc sống bận rộn khiến bạn không có nhiều thời gian cho bản thân và gia đình? Đây là 5 trợ thủ đắc lực không thể thiếu trong ngôi nhà hiện đại:</p>
        <ol>
          <li><strong>Robot hút bụi lau nhà tự giặt sấy</strong>: Tự động lên lịch quét dọn sàn nhà sạch bóng mỗi ngày.</li>
          <li><strong>Nồi chiên không dầu công suất lớn</strong>: Nấu nhanh, giảm dầu mỡ, bảo vệ sức khỏe tim mạch.</li>
          <li><strong>Máy lọc không khí cảm biến bụi mịn</strong>: Mang lại bầu không khí trong lành cho giấc ngủ ngon.</li>
          <li><strong>Máy ép chậm giữ nguyên dưỡng chất</strong>: Thưởng thức ly nước ép tươi ngon mỗi sáng.</li>
          <li><strong>Máy hút bụi nệm diệt khuẩn UV</strong>: Loại bỏ mạt bụi và vi khuẩn sâu trong sợi vải.</li>
        </ol>`,
        isHot: true,
        status: true,
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        title: 'Bí Quyết Chăm Sóc Da Căng Bóng Đón Tết: Quy Trình Chuẩn Y Khoa Cho Nàng',
        slug: 'bi-quyet-cham-soc-da-cang-bong-don-tet',
        thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
        summary: 'Hướng dẫn các bước phục hồi và nuôi dưỡng làn da sáng khỏe tự nhiên từ các chuyên gia da liễu hàng đầu.',
        content: `<h3>Quy trình 4 bước đơn giản cho làn da mọng nước</h3>
        <p>Chỉ cần kiên trì áp dụng đúng 4 bước cơ bản sau đây, bạn sẽ nhanh chóng cảm nhận sự thay đổi rõ rệt của làn da:</p>
        <p><strong>1. Làm sạch kép (Double Cleansing)</strong>: Dùng dầu/nước tẩy trang dịu nhẹ kết hợp sữa rửa mặt pH 5.5.</p>
        <p><strong>2. Cấp ẩm sâu với Serum phục hồi</strong>: Bổ sung Hyaluronic Acid, Peptide và B5 giúp củng cố hàng rào bảo vệ da.</p>
        <p><strong>3. Khóa ẩm bằng kem dưỡng phù hợp</strong>: Chọn kết cấu gel cream mỏng nhẹ thẩm thấu nhanh.</p>
        <p><strong>4. Chống nắng quang phổ rộng mỗi ngày</strong>: Thoa lại sau mỗi 3-4 giờ khi hoạt động ngoài trời.</p>`,
        isHot: true,
        status: true,
        publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000)
      },
      {
        title: 'Xu Hướng Affiliate Marketing 2026: Cơ Hội Kiếm Thu Nhập Thụ Động Bền Vững',
        slug: 'xu-huong-affiliate-marketing-2026-kiem-thu-nhap-thu-dong',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
        summary: 'Làm thế nào để xây dựng kênh tiếp thị liên kết chuyển đổi cao và hợp tác cùng các nhãn hàng uy tín tại Việt Nam?',
        content: `<h3>Tiếp thị liên kết trong kỷ nguyên số</h3>
        <p>Affiliate Marketing đang phát triển mạnh mẽ và trở thành nguồn thu nhập thụ động hấp dẫn cho nhà sáng tạo nội dung, KOC, Reviewer và người kinh doanh online.</p>
        <p>Để đạt được tỷ lệ chuyển đổi cao, yếu tố quan trọng nhất chính là <em>tính chân thực</em> trong trải nghiệm sản phẩm và lựa chọn đối tác phân phối chính hãng có chính sách hoa hồng minh bạch.</p>`,
        isHot: false,
        status: true,
        publishedAt: new Date(Date.now() - 72 * 60 * 60 * 1000)
      },
      {
        title: 'Chương Trình Đối Tác Toàn Diện Droppii: Kết Nối Nhà Bán Hàng & Nhà Sáng Tạo',
        slug: 'chuong-trinh-doi-tac-toan-dien-droppii',
        thumbnail: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&auto=format&fit=crop&q=80',
        summary: 'Đăng ký trở thành đối tác chiến lược để nhận mức chiết khấu hấp dẫn cùng hệ thống đào tạo chuyên sâu.',
        content: `<h3>Cơ hội hợp tác kinh doanh bứt phá</h3>
        <p>Chúng tôi chào đón tất cả các nhà cung cấp sản phẩm uy tín và đối tác phân phối cùng đồng hành xây dựng hệ sinh thái thương mại điện tử chất lượng cao.</p>
        <p>Bấm vào mục <strong>Đăng ký đối tác</strong> trên thanh điều hướng để gửi thông tin và nhận phản hồi chi tiết từ chúng tôi.</p>`,
        isHot: false,
        status: true,
        publishedAt: new Date(Date.now() - 96 * 60 * 60 * 1000)
      }
    ];

    await News.insertMany(newsData);

    // 7. Create 12 Videos (for 2 slides of 6 videos)
    console.log('[Seed] Creating 12 Videos (6 videos per slide)...');
    const videosData = [
      {
        title: 'Đập Hộp & Trải Nghiệm Siêu Phẩm iPhone 16 Pro Max Thực Tế',
        description: 'Đánh giá chi tiết camera Control, chip A18 Pro và thời lượng pin sau 1 tuần sử dụng thực tế.',
        platform: 'youtube',
        videoUrl: 'https://www.youtube.com/watch?v=65JrtwtTOdc',
        thumbnail: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
        isVertical: false,
        sortOrder: 1,
        status: true
      },
      {
        title: 'Trải Nghiệm Robot Hút Bụi Dreame L20 Ultra: Tự Giặt Sấy Có Thật Sự Sạch?',
        description: 'Thử thách dọn dẹp các loại vết bẩn cứng đầu trên sàn gạch và thảm với trợ lý Dreame.',
        platform: 'youtube',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80',
        isVertical: false,
        sortOrder: 2,
        status: true
      },
      {
        title: 'Review Serum Estee Lauder ANR: Bí Quyết Phục Hồi Làn Da Căng Mịn Sau 2 Tuần',
        description: 'Phân tích bảng thành phần và hướng dẫn cách kết hợp kem dưỡng để đạt hiệu quả chống lão hóa tối đa.',
        platform: 'youtube',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
        isVertical: false,
        sortOrder: 3,
        status: true
      },
      {
        title: 'Cách Nấu 5 Món Ăn Healthy Với Nồi Chiên Không Dầu Philips XXL',
        description: 'Hướng dẫn chế biến gà nướng mật ong, cá hồi sốt chanh leo và bánh bông lan siêu nhanh.',
        platform: 'youtube',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=600&auto=format&fit=crop&q=80',
        isVertical: false,
        sortOrder: 4,
        status: true
      },
      {
        title: 'Tìm Hiểu Công Dụng Của Đông Trùng Hạ Thảo Tươi Với Sức Khỏe Gia Đình',
        description: 'Chuyên gia dinh dưỡng chia sẻ cách dùng đông trùng hạ thảo đúng cách để bồi bổ khí huyết.',
        platform: 'youtube',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&auto=format&fit=crop&q=80',
        isVertical: false,
        sortOrder: 5,
        status: true
      },
      {
        title: 'Đánh Giá Tai Nghe Sony WH-1000XM5: Vua Chống Ồn Thế Hệ Mới',
        description: 'So sánh chất âm và khả năng cách âm nơi công cộng giữa Sony WH-1000XM5 và các đối thủ cùng phân khúc.',
        platform: 'youtube',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
        isVertical: false,
        sortOrder: 6,
        status: true
      },
      {
        title: 'Mẹo Chọn Kem Chống Nắng Phù Hợp Cho Da Dầu Mụn #Shorts',
        description: 'Bác sĩ da liễu chia sẻ 3 tiêu chí quan trọng khi chọn kem chống nắng mùa hè.',
        platform: 'youtube',
        videoUrl: 'https://www.youtube.com/shorts/65JrtwtTOdc',
        thumbnail: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
        isVertical: true,
        sortOrder: 7,
        status: true
      },
      {
        title: 'Hướng Dẫn Sử Dụng Máy Ép Chậm Hurom H400 Đúng Cách',
        description: 'Cách tháo lắp, vệ sinh nhanh chỉ trong 2 phút và công thức nước ép cần tây táo xanh.',
        platform: 'youtube',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&auto=format&fit=crop&q=80',
        isVertical: false,
        sortOrder: 8,
        status: true
      },
      {
        title: 'Cách Phân Biệt Sâm Hàn Quốc KGC Chính Hãng #Shorts',
        description: 'Kiểm tra mã tem chống hàng giả và logo Hoàng gia Cheong Kwan Jang trên vỏ hộp.',
        platform: 'youtube',
        videoUrl: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        isVertical: true,
        sortOrder: 9,
        status: true
      },
      {
        title: 'Mở Hộp & Test Lực Hút Máy Lọc Không Khí Xiaomi 4 Pro',
        description: 'Đo độ ồn ban đêm và tốc độ lọc bụi PM2.5 trong phòng ngủ 30m2.',
        platform: 'youtube',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop&q=80',
        isVertical: false,
        sortOrder: 10,
        status: true
      },
      {
        title: 'Bí Quyết Giữ Form Túi Xách Da Thật Luôn Bền Đẹp Như Mới',
        description: 'Cách bảo quản, vệ sinh da bò và chống ẩm mốc mùa mưa đơn giản tại nhà.',
        platform: 'youtube',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
        isVertical: false,
        sortOrder: 11,
        status: true
      },
      {
        title: 'Trải Nghiệm Galaxy S24 Ultra: Tính Năng Khoanh Vùng Tìm Kiếm AI #Shorts',
        description: 'Thao tác nhanh Circle to Search thông minh trên màn hình phẳng cực tiện lợi.',
        platform: 'youtube',
        videoUrl: 'https://www.youtube.com/shorts/65JrtwtTOdc',
        thumbnail: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
        isVertical: true,
        sortOrder: 12,
        status: true
      }
    ];

    await Video.insertMany(videosData);

    // 8. Create some sample initial clicks for Dashboard preview
    console.log('[Seed] Creating sample Affiliate clicks for Analytics preview...');
    const sampleProducts = await Product.find().limit(5);
    const clickDocs = [];
    const now = Date.now();
    for (let i = 0; i < 45; i++) {
      const prod = sampleProducts[i % sampleProducts.length];
      const daysAgo = Math.floor(Math.random() * 12);
      clickDocs.push({
        productId: prod._id,
        affiliateUrl: prod.affiliateUrl,
        source: i % 2 === 0 ? 'homepage_card' : 'modal_detail',
        campaign: 'deal_tet_2026',
        referrer: 'https://google.com',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ip: '127.0.0.1',
        createdAt: new Date(now - daysAgo * 24 * 60 * 60 * 1000 - Math.floor(Math.random() * 3600000))
      });
    }
    await AffiliateClick.insertMany(clickDocs);

    // 9. Sample Contacts and Subscribers
    await Contact.create([
      {
        name: 'Nguyễn Văn An',
        phone: '0987654321',
        email: 'nguyenvanan@gmail.com',
        message: 'Tôi muốn tìm hiểu thêm về chính sách bảo hành sản phẩm gia dụng thông minh.',
        status: 'new'
      },
      {
        name: 'Trần Thị Mai',
        phone: '0912345678',
        email: 'tranmai@gmail.com',
        message: 'Có thể tư vấn combo sản phẩm chăm sóc da chống lão hóa cho mẹ được không?',
        status: 'processing'
      }
    ]);

    await Subscriber.create([
      { email: 'khachhang1@gmail.com', phone: '0909111222', source: 'homepage_newsletter', status: true },
      { email: 'khachhang2@gmail.com', phone: '0909333444', source: 'homepage_newsletter', status: true }
    ]);

    console.log('====================================================');
    console.log('🎉 SEED DATABASE COMPLETED SUCCESSFULLY!');
    console.log(`👤 Admin Email:    ${adminEmail}`);
    console.log(`🔑 Admin Password: ${adminPassword}`);
    console.log(`📦 Categories:     ${categoriesData.length}`);
    console.log(`🛍️ Products:       ${productsData.length}`);
    console.log(`🖼️ Banners:        ${bannersData.length} (Strictly image + targetUrl)`);
    console.log(`🔥 Hot News:       ${newsData.length}`);
    console.log(`🎬 Videos:         ${videosData.length}`);
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
