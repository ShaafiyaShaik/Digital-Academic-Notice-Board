require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  const allUsers = await User.find({}, 'name email role orgId').lean();
  console.log(`\nUsers with their orgId:`);
  allUsers.forEach(u => {
    console.log(`  ${u.role}: ${u.name} - orgId: ${u.orgId}`);
  });
  
  const uniqueOrgs = [...new Set(allUsers.map(u => u.orgId?.toString()))];
  console.log(`\nUnique orgIds: ${uniqueOrgs.length}`);
  uniqueOrgs.forEach(org => console.log(`  - ${org}`));
  
  mongoose.connection.close();
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
