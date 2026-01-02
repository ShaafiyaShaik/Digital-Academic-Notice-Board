require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
  registrationNumber: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['student', 'faculty', 'librarian', 'admin', 'teacher'] },
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  adminLevel: { type: String, enum: ['SUPER_ADMIN', 'DEPT_ADMIN', 'ACADEMIC_ADMIN'], sparse: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', sparse: true }
});

const User = mongoose.model('User', userSchema);

// Seed data
async function seedDatabase() {
  try {
    // Clear existing users (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});

    // Create test users
    const testUsers = [
      {
        name: 'Super Admin',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        adminLevel: 'SUPER_ADMIN',
        registrationNumber: 'ADMIN001'
      },
      {
        name: 'CSE Dept Admin',
        email: 'deptadmin@example.com',
        password: await bcrypt.hash('deptadmin123', 10),
        role: 'admin',
        adminLevel: 'DEPT_ADMIN',
        registrationNumber: 'DEPTADM001'
        // departmentId will be set after dept creation
      },
      {
        name: 'Academic Admin',
        email: 'academic@example.com',
        password: await bcrypt.hash('academic123', 10),
        role: 'admin',
        adminLevel: 'ACADEMIC_ADMIN',
        registrationNumber: 'ACADM001'
      },
      {
        name: 'John Student',
        email: 'student@example.com',
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        registrationNumber: 'STU001'
      },
      {
        name: 'Ravi Kumar (Teacher)',
        email: 'teacher@example.com',
        password: await bcrypt.hash('teacher123', 10),
        role: 'teacher',
        registrationNumber: 'TEACH001'
      },
      {
        name: 'Faculty Member',
        email: 'faculty@example.com',
        password: await bcrypt.hash('faculty123', 10),
        role: 'faculty',
        registrationNumber: 'FAC001'
      },
      {
        name: 'Librarian Staff',
        email: 'librarian@example.com',
        password: await bcrypt.hash('librarian123', 10),
        role: 'librarian',
        registrationNumber: 'LIB001'
      }
    ];

    // Insert users
    const users = await User.insertMany(testUsers, { ordered: false }).catch(err => {
      if (err.code === 11000) {
        console.log('Some users already exist, skipping duplicates...');
        return [];
      }
      throw err;
    });

    console.log('✅ Seed data created successfully!');
    console.log('\nTest Credentials:');
    console.log('================');
    console.log('\n🔴 SUPER ADMIN (Full Access):');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('   Can: Manage everything (depts, classes, subjects, teachers, notices)');
    console.log('\n🟡 DEPARTMENT ADMIN (Department Scope):');
    console.log('   Email: deptadmin@example.com');
    console.log('   Password: deptadmin123');
    console.log('   Can: Manage classes, subjects, assign teachers in THEIR department');
    console.log('\n🟢 ACADEMIC ADMIN (Notices Only):');
    console.log('   Email: academic@example.com');
    console.log('   Password: academic123');
    console.log('   Can: Create organizational notices, mark mandatory');
    console.log('\n👨‍🎓 Student Account:');
    console.log('   Email: student@example.com');
    console.log('   Password: student123');
    console.log('\n👨‍🏫 Teacher Account:');
    console.log('   Email: teacher@example.com');
    console.log('   Password: teacher123');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err.message);
    process.exit(1);
  }
}

seedDatabase();
