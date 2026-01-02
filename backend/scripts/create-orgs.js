const mongoose = require('mongoose');
const Organization = require('../models/Organization');
require('dotenv').config();

async function createOrg() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const orgs = [
      { orgName: 'VFSTR College', orgCode: 'VFSTR1', address: 'Hyderabad, India' },
      { orgName: 'Vignan University', orgCode: 'VIGNAN1', address: 'Visakhapatnam, India' },
      { orgName: 'Sample Institute', orgCode: 'SAMPLE1', address: 'Bangalore, India' },
    ];

    for (const org of orgs) {
      const exists = await Organization.findOne({ orgCode: org.orgCode });
      if (!exists) {
        await Organization.create(org);
        console.log(`✅ Created org: ${org.orgCode} - ${org.orgName}`);
      } else {
        console.log(`⏭️  Org already exists: ${org.orgCode}`);
      }
    }

    console.log('\n📋 Available Organizations:');
    const allOrgs = await Organization.find().select('orgCode orgName');
    allOrgs.forEach(o => console.log(`  - ${o.orgCode}: ${o.orgName}`));

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createOrg();
