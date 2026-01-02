require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  const allUsers = await User.find({}, 'name email role orgId').lean();
  console.log(`\nTotal users: ${allUsers.length}`);
  console.log('\nAll users by role:');
  allUsers.forEach(u => {
    console.log(`  ${u.role}: ${u.name} (${u.email})`);
  });
  mongoose.connection.close();
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
