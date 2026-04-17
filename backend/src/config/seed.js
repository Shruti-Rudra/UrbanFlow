const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ADMIN_EMAIL = 'admin@urbanflow.com';
const ADMIN_PASSWORD = 'password123';
const ADMIN_NAME = 'UrbanFlow Admin';

const seedAdmin = async () => {
  try {
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log('✅ Admin user already exists, skipping seed.');
      return;
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    // Use insertOne directly to bypass pre-save hooks
    // Do NOT include phone field so the sparse index ignores it
    await User.collection.insertOne({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: passwordHash,
      role: 'admin',
      createdAt: new Date()
    });

    console.log(`✅ Admin user seeded: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } catch (error) {
    console.error(`❌ Admin seed failed: ${error.message}`);
  }
};

module.exports = { seedAdmin };
