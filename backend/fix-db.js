const mongoose = require('mongoose');

const fixDb = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/urbanflow');
  const db = mongoose.connection;

  try {
    await db.collection('users').dropIndex('phone_1');
    console.log('Dropped old phone_1 index');
  } catch (e) {
    console.log('Index drop skipped:', e.message);
  }

  // Remove the phone field where it is null to avoid sparse index conflicts
  await db.collection('users').updateMany({ phone: null }, { $unset: { phone: '' } });
  console.log('Cleared null phone fields from existing documents');

  // Recreate as sparse unique
  await db.collection('users').createIndex({ phone: 1 }, { unique: true, sparse: true });
  console.log('Recreated sparse phone index OK');

  await mongoose.disconnect();
  console.log('Done.');
};

fixDb().catch(err => { console.error(err); process.exit(1); });
