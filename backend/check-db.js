require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Organization = require('./models/Organization');

async function checkDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📋 === ORGANIZATIONS ===');
    const orgs = await Organization.find();
    if (orgs.length === 0) {
      console.log('No organizations found');
    } else {
      orgs.forEach(org => {
        console.log(`\nOrg ID: ${org._id}`);
        console.log(`  Name: ${org.orgName}`);
        console.log(`  Code: ${org.orgCode}`);
        console.log(`  Address: ${org.address}`);
      });
    }

    console.log('\n\n📋 === USERS ===');
    const users = await User.find().populate('orgId');
    if (users.length === 0) {
      console.log('No users found');
    } else {
      users.forEach(user => {
        console.log(`\nUser ID: ${user._id}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Password Hash: ${user.password.substring(0, 20)}...`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Reg Number: ${user.registrationNumber}`);
        if (user.orgId) {
          console.log(`  Org: ${user.orgId.orgName} (${user.orgId.orgCode})`);
        }
      });
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkDB();
