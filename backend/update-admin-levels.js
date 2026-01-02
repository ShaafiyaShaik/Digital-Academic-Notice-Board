require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const User = require('./models/User');

async function updateAdmins() {
  try {
    // Update all existing admins to have SUPER_ADMIN level if they don't have one
    const result = await User.updateMany(
      { 
        role: 'admin',
        adminLevel: { $exists: false }
      },
      { 
        $set: { adminLevel: 'SUPER_ADMIN' }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} admin users to SUPER_ADMIN level`);
    
    // Show all admin users
    const admins = await User.find({ role: 'admin' }).select('name email adminLevel');
    console.log('\n📋 Current Admin Users:');
    console.log('======================');
    admins.forEach(admin => {
      console.log(`- ${admin.name} (${admin.email}) - ${admin.adminLevel || 'NO LEVEL SET'}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

updateAdmins();
