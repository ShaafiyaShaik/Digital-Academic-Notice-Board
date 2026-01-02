require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const User = require('./models/User');

async function fixUserRoles() {
  try {
    // 1. Fix teacher1 and teacher2 - remove admin level, set role to teacher
    const teacherUpdate = await User.updateMany(
      { 
        email: { $in: ['teacher1@gmail.com', 'teacher2@gmail.com'] }
      },
      { 
        $set: { role: 'teacher' },
        $unset: { adminLevel: "" }
      }
    );
    console.log(`✅ Fixed ${teacherUpdate.modifiedCount} teachers (removed admin level)`);

    // 2. Delete admin@example.com user
    const deleteResult = await User.deleteOne({ email: 'admin@example.com' });
    console.log(`✅ Deleted ${deleteResult.deletedCount} user (admin@example.com)`);

    // 3. Ensure admin1 is SUPER_ADMIN
    await User.updateOne(
      { email: 'admin11@gmail.com' },
      { 
        $set: { 
          role: 'admin',
          adminLevel: 'SUPER_ADMIN' 
        }
      }
    );
    console.log('✅ Confirmed admin1 as SUPER_ADMIN');

    // Show final state
    console.log('\n📋 Final User List:');
    console.log('===================');
    
    const allUsers = await User.find({}).select('name email role adminLevel');
    
    console.log('\n🔴 ADMINS:');
    allUsers.filter(u => u.role === 'admin').forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.adminLevel || 'NO LEVEL'}`);
    });
    
    console.log('\n👨‍🏫 TEACHERS:');
    allUsers.filter(u => u.role === 'teacher').forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
    });
    
    console.log('\n👨‍🎓 STUDENTS:');
    allUsers.filter(u => u.role === 'student').forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
    });
    
    console.log('\n👥 OTHERS:');
    allUsers.filter(u => !['admin', 'teacher', 'student'].includes(u.role)).forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixUserRoles();
