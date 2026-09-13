const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb+srv://tranbaho_db_user:Tuong29042011@mooncake.jrfchyc.mongodb.net/affiliate_web?retryWrites=true&w=majority&appName=mooncake';

async function updateBanners() {
  await mongoose.connect(uri);
  const Banner = mongoose.model('Banner', new mongoose.Schema({}, { strict: false }));

  const banners = await Banner.find({});
  console.log(`Found ${banners.length} banners in DB.`);

  if (banners.length >= 4) {
    await Banner.updateOne({ _id: banners[0]._id }, { $set: { position: 'square', title: 'Banner Vuông 1 - Săn Quà Cực Chất', sortOrder: 1 } });
    await Banner.updateOne({ _id: banners[1]._id }, { $set: { position: 'square', title: 'Banner Vuông 2 - Mua 10 Tặng 1', sortOrder: 2 } });
    await Banner.updateOne({ _id: banners[2]._id }, { $set: { position: 'horizontal', title: 'Banner Ngang - Cà Phê Sâm Canada Combo 550K', sortOrder: 1 } });
    await Banner.updateOne({ _id: banners[3]._id }, { $set: { position: 'vertical', title: 'Banner Dọc - Sâm Canada Deal Hot', sortOrder: 1 } });
  } else {
    for (const b of banners) {
      if (!b.position) {
        await Banner.updateOne({ _id: b._id }, { $set: { position: 'square', title: 'Banner Khuyến Mãi' } });
      }
    }
  }

  const updated = await Banner.find({});
  console.log('Updated Banners:');
  updated.forEach(b => {
    console.log(`- [${b.position}] ${b.title || 'No Title'} (Sort: ${b.sortOrder}, Status: ${b.status}) -> ${b.image}`);
  });

  await mongoose.disconnect();
  console.log('Done!');
}

updateBanners().catch(console.error);
