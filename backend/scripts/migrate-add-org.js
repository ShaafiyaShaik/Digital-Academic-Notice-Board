require('dotenv').config();
const mongoose = require('mongoose');
const Organization = require('../models/Organization');
const User = require('../models/User');
const Notice = require('../models/Notice');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Create default organization for legacy data
    let defaultOrg = await Organization.findOne({ orgCode: 'LEGACY001' });
    if (!defaultOrg) {
      defaultOrg = await Organization.create({
        orgName: 'Legacy College',
        orgCode: 'LEGACY001',
        address: 'Default Organization',
      });
      console.log(`Created default org: ${defaultOrg.orgCode}`);
    }

    // Update users without orgId
    const usersUpdated = await User.updateMany(
      { orgId: { $exists: false } },
      { $set: { orgId: defaultOrg._id } }
    );
    console.log(`Updated ${usersUpdated.modifiedCount} users with default orgId`);

    // Update notices without orgId
    const noticesUpdated = await Notice.updateMany(
      { orgId: { $exists: false } },
      { $set: { orgId: defaultOrg._id } }
    );
    console.log(`Updated ${noticesUpdated.modifiedCount} notices with default orgId`);

    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
