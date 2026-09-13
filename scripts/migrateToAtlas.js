const mongoose = require('mongoose');

const LOCAL_URI = 'mongodb://127.0.0.1:27017/affiliate_web';
const ATLAS_URI = 'mongodb+srv://tranbaho_db_user:Tuong29042011@mooncake.jrfchyc.mongodb.net/affiliate_web?retryWrites=true&w=majority&appName=mooncake';

async function migrate() {
  console.log('--- Starting Migration from Local to Atlas ---');

  // 1. Connect Local
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log('✓ Connected to Local MongoDB');

  // 2. Connect Atlas
  const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
  console.log('✓ Connected to MongoDB Atlas');

  // 3. List Collections
  const collections = await localConn.db.listCollections().toArray();
  console.log(`Found ${collections.length} collections to migrate.`);

  for (const col of collections) {
    const colName = col.name;
    if (colName.startsWith('system.')) continue;

    const localCol = localConn.db.collection(colName);
    const atlasCol = atlasConn.db.collection(colName);

    const docs = await localCol.find({}).toArray();
    console.log(`\nMigrating collection [${colName}]: ${docs.length} documents...`);

    if (docs.length > 0) {
      // Clear target collection first to avoid duplicates
      await atlasCol.deleteMany({});
      await atlasCol.insertMany(docs);
      console.log(`✓ Inserted ${docs.length} documents into Atlas [${colName}]`);
    } else {
      console.log(`- Collection [${colName}] is empty, skipped insert.`);
    }

    // Copy Indexes
    try {
      const indexes = await localCol.indexes();
      for (const idx of indexes) {
        if (idx.name === '_id_') continue;
        const keys = idx.key;
        const options = { name: idx.name };
        if (idx.unique) options.unique = true;
        if (idx.sparse) options.sparse = true;
        await atlasCol.createIndex(keys, options);
      }
      console.log(`✓ Synchronized indexes for [${colName}]`);
    } catch (idxErr) {
      console.warn(`! Warning syncing indexes for [${colName}]:`, idxErr.message);
    }
  }

  // 4. Verify Atlas Counts
  console.log('\n--- Verifying MongoDB Atlas Collections ---');
  const atlasCollections = await atlasConn.db.listCollections().toArray();
  for (const c of atlasCollections) {
    const count = await atlasConn.db.collection(c.name).countDocuments();
    console.log(`Atlas [${c.name}]: ${count} documents`);
  }

  await localConn.close();
  await atlasConn.close();
  console.log('\n🎉 Migration completed successfully!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
