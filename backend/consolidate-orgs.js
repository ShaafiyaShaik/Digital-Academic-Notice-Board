require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  
  // Get admin1's org
  const admin1 = await User.findOne({ email: 'admin11@gmail.com' });
  const targetOrgId = admin1.orgId;
  
  console.log(`\nMoving all users to admin1's org: ${targetOrgId}`);
  
  // Update all users to have the same orgId
  const result = await User.updateMany(
    { email: { $ne: 'admin11@gmail.com' } },
    { $set: { orgId: targetOrgId } }
  );
  
  console.log(`✅ Updated ${result.modifiedCount} users`);
  
  // Show final state
  const allUsers = await User.find({}, 'name email role orgId').lean();
  console.log(`\nAll users now in org: ${targetOrgId}`);
  allUsers.slice(0, 5).forEach(u => {
    console.log(`  ${u.role}: ${u.name} (${u.email})`);
  });
  if (allUsers.length > 5) console.log(`  ... and ${allUsers.length - 5} more`);
  
  mongoose.connection.close();
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
