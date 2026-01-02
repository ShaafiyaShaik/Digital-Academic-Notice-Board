require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const User = require('./models/User');
const Notice = require('./models/Notice');
const Organization = require('./models/Organization');
const NoticeRead = require('./models/NoticeRead');
const Department = require('./models/Department');
const Class = require('./models/Class');
const Subject = require('./models/Subject');
const TeachingAssignment = require('./models/TeachingAssignment');
const authMiddleware = require('./middleware/authMiddleware');
const tenantMiddleware = require('./middleware/tenantMiddleware');
const { requirePermission, getDepartmentFilter, canAccessDepartment } = require('./middleware/permissionMiddleware');
const generateOrgCode = require('./utils/generateOrgCode');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Routes

// User Registration
app.post('/register', async (req, res) => {
  const { registrationNumber, name, email, password, role, orgCode } = req.body;

  try {
    const org = await Organization.findOne({ orgCode });
    if (!org) return res.status(400).json({ message: 'Invalid organization code' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ registrationNumber, name, email, password: hashedPassword, role, orgId: org._id });
    await user.save();
    res.status(201).json({ message: 'User registered successfully', org: { id: org._id, orgCode: org.orgCode, orgName: org.orgName } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// User Login
app.post('/login', async (req, res) => {
  const { email, registrationNumber, password, role } = req.body;

  try {
    const user = await User.findOne({ $or: [{ email }, { registrationNumber }] }).populate('orgId');
    if (!user) return res.status(400).json({ message: 'User not found.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid password.' });

    if (user.role !== role) return res.status(400).json({ message: 'Role mismatch.' });

    const token = jwt.sign({ 
      _id: user._id, 
      role: user.role, 
      orgId: user.orgId,
      adminLevel: user.adminLevel,
      departmentId: user.departmentId
    }, process.env.JWT_SECRET);
    const org = user.orgId;
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, orgId: org._id, adminLevel: user.adminLevel },
      org: { id: org._id, orgCode: org.orgCode, orgName: org.orgName, logoUrl: org.logoUrl },
      redirectTo: role === 'admin' ? '/admin' : '/',
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Notice CRUD Operations

// Create Notice
app.post('/notices', authMiddleware(['admin']), async (req, res) => {
  const { title, description, category, date, urgent } = req.body;

  try {
    if (!req.orgId) return res.status(400).json({ message: 'Organization context missing' });

    const notice = new Notice({
      title,
      description,
      category,
      date,
      urgent: urgent || false,
      orgId: req.orgId,
    });
    await notice.save();
    res.status(200).json(notice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Public/tenant-scoped fetch of notices
app.get('/notices', tenantMiddleware, async (req, res) => {
  try {
    const query = { orgId: req.orgId };
    if (req.query.category) query.category = req.query.category;
    const notices = await Notice.find(query).sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Notice
app.put('/notices/:id', authMiddleware(['admin']), async (req, res) => {
  const { id } = req.params;
  const { title, description, category, date, urgent, file } = req.body;

  try {
    if (!req.orgId) return res.status(400).json({ message: 'Organization context missing' });

    const notice = await Notice.findOneAndUpdate(
      { _id: id, orgId: req.orgId },
      { title, description, category, date, urgent, file },
      { new: true }
    );
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    res.json(notice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete Notice
app.delete('/notices/:id', authMiddleware(['admin']), async (req, res) => {
  const { id } = req.params;

  try {
    if (!req.orgId) return res.status(400).json({ message: 'Organization context missing' });

    const result = await Notice.findOneAndDelete({ _id: id, orgId: req.orgId });
    if (!result) return res.status(404).json({ message: 'Notice not found' });
    res.json({ message: 'Notice deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Mark Notice as Read
app.post('/notices/:id/mark-read', authMiddleware(), async (req, res) => {
  const { id } = req.params;
  
  try {
    if (!req.orgId) return res.status(400).json({ message: 'Organization context missing' });
    
    // Verify notice exists and belongs to same org
    const notice = await Notice.findOne({ _id: id, orgId: req.orgId });
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    
    // Try to create read record (will fail silently if already exists due to unique index)
    try {
      const readRecord = new NoticeRead({
        noticeId: id,
        userId: req.user._id,
        orgId: req.orgId,
      });
      await readRecord.save();
      res.json({ message: 'Notice marked as read', readAt: readRecord.readAt });
    } catch (err) {
      // If duplicate key error (user already read it), return success anyway
      if (err.code === 11000) {
        const existingRead = await NoticeRead.findOne({ noticeId: id, userId: req.user._id });
        res.json({ message: 'Already marked as read', readAt: existingRead?.readAt });
      } else {
        throw err;
      }
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Read Statistics for a Notice (Admin only)
app.get('/notices/:id/read-stats', authMiddleware(['admin']), async (req, res) => {
  const { id } = req.params;
  
  try {
    if (!req.orgId) return res.status(400).json({ message: 'Organization context missing' });
    
    // Verify notice exists and belongs to same org
    const notice = await Notice.findOne({ _id: id, orgId: req.orgId });
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    
    // Get all users in the organization
    const allUsers = await User.find({ orgId: req.orgId }).select('_id name email role registrationNumber');
    
    // Get all read records for this notice
    const readRecords = await NoticeRead.find({ noticeId: id, orgId: req.orgId })
      .populate('userId', 'name email role registrationNumber')
      .sort({ readAt: -1 });
    
    // Create a set of user IDs who read the notice
    const readUserIds = new Set(readRecords.map(record => record.userId._id.toString()));
    
    // Separate users into readers and non-readers
    const readers = readRecords.map(record => ({
      userId: record.userId._id,
      name: record.userId.name,
      email: record.userId.email,
      role: record.userId.role,
      registrationNumber: record.userId.registrationNumber,
      readAt: record.readAt,
    }));
    
    const nonReaders = allUsers
      .filter(user => !readUserIds.has(user._id.toString()))
      .map(user => ({
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        registrationNumber: user.registrationNumber,
      }));
    
    res.json({
      noticeId: id,
      noticeTitle: notice.title,
      totalUsers: allUsers.length,
      readCount: readers.length,
      unreadCount: nonReaders.length,
      readers,
      nonReaders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Organization Routes
app.post('/api/orgs', async (req, res) => {
  try {
    const { orgName, address, logoUrl } = req.body;
    let orgCode = generateOrgCode(orgName);

    while (await Organization.findOne({ orgCode })) {
      orgCode = generateOrgCode(orgName);
    }

    const org = new Organization({ orgName, orgCode, address, logoUrl });
    await org.save();
    res.status(201).json(org);
  } catch (err) {
    res.status(500).json({ message: 'Could not create organization.' });
  }
});

// Get org by code (public)
app.get('/api/orgs/by-code/:code', async (req, res) => {
  try {
    const org = await Organization.findOne({ orgCode: req.params.code }).select('-__v');
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    res.json(org);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User Profile Update
app.put('/api/users/:id', authMiddleware(), async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  try {
    // Verify user is updating their own profile or is admin
    if (req.user._id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this profile' });
    }

    const user = await User.findOneAndUpdate(
      { _id: id, orgId: req.orgId },
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all teachers (for admin)
app.get('/api/users/teachers', authMiddleware(['admin']), async (req, res) => {
  try {
    if (!req.orgId) return res.status(400).json({ message: 'Organization context missing' });
    
    const teachers = await User.find({ orgId: req.orgId, role: 'teacher' })
      .select('name email registrationNumber');
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users (for admin user management)
app.get('/api/users/all', authMiddleware(['admin']), requirePermission('MANAGE_USERS'), async (req, res) => {
  try {
    if (!req.orgId) return res.status(400).json({ message: 'Organization context missing' });
    
    const filter = { orgId: req.orgId };
    
    // Dept admin can only see users in their department
    if (req.user.adminLevel === 'DEPT_ADMIN' && req.user.departmentId) {
      // For now, show all users but in production you'd filter by department
      // filter.$or = [
      //   { departmentId: req.user.departmentId },
      //   { classId: { $in: classIdsFromThisDept } }
      // ];
    }
    
    const users = await User.find(filter)
      .populate('classId', 'name')
      .populate('departmentId', 'name code')
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user
app.put('/api/users/:id', authMiddleware(['admin']), requirePermission('MANAGE_USERS'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Don't allow updating password this way
    delete updates.password;
    delete updates.orgId;
    
    // Check if user belongs to this org
    const user = await User.findOne({ _id: id, orgId: req.orgId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true })
      .select('-password');
    
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete user
app.delete('/api/users/:id', authMiddleware(['admin']), requirePermission('MANAGE_USERS'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user belongs to this org
    const user = await User.findOne({ _id: id, orgId: req.orgId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Don't allow deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get admin permissions (for frontend UI control)
app.get('/api/admin/permissions', authMiddleware(['admin']), async (req, res) => {
  try {
    const { hasPermission } = require('./middleware/permissionMiddleware');
    
    const permissions = {
      adminLevel: req.user.adminLevel || 'SUPER_ADMIN', // Default for backward compatibility
      departmentId: req.user.departmentId || null,
      
      // Feature flags
      canManageDepartments: hasPermission(req.user, 'MANAGE_DEPARTMENTS'),
      canManageAllClasses: hasPermission(req.user, 'MANAGE_ALL_CLASSES'),
      canManageDeptClasses: hasPermission(req.user, 'MANAGE_DEPT_CLASSES'),
      canManageAllSubjects: hasPermission(req.user, 'MANAGE_ALL_SUBJECTS'),
      canManageDeptSubjects: hasPermission(req.user, 'MANAGE_DEPT_SUBJECTS'),
      canAssignAllTeachers: hasPermission(req.user, 'ASSIGN_ALL_TEACHERS'),
      canAssignDeptTeachers: hasPermission(req.user, 'ASSIGN_DEPT_TEACHERS'),
      canCreateOrgNotice: hasPermission(req.user, 'CREATE_ORG_NOTICE'),
      canMarkMandatory: hasPermission(req.user, 'MARK_MANDATORY'),
      canViewAllAnalytics: hasPermission(req.user, 'VIEW_ALL_ANALYTICS'),
      canViewDeptAnalytics: hasPermission(req.user, 'VIEW_DEPT_ANALYTICS'),
      canCreateAdmin: hasPermission(req.user, 'CREATE_ADMIN'),
      canManageUsers: hasPermission(req.user, 'MANAGE_USERS'),
    };
    
    res.json(permissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============= ACADEMIC STRUCTURE ROUTES (Admin Only) =============

// Create Department (SUPER_ADMIN only)
app.post('/api/departments', authMiddleware(['admin']), requirePermission('MANAGE_DEPARTMENTS'), async (req, res) => {
  const { name, code, description } = req.body;
  try {
    if (!req.orgId) return res.status(400).json({ message: 'Organization context missing' });
    
    const dept = new Department({
      orgId: req.orgId,
      name,
      code: code.toUpperCase(),
      description
    });
    await dept.save();
    res.status(201).json(dept);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all departments
app.get('/api/departments', authMiddleware(), async (req, res) => {
  try {
    if (!req.orgId) return res.status(400).json({ message: 'Organization context missing' });
    
    const depts = await Department.find({ orgId: req.orgId }).sort({ code: 1 });
    res.json(depts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Class (SUPER_ADMIN or DEPT_ADMIN for their dept)
app.post('/api/classes', authMiddleware(['admin']), requirePermission('MANAGE_DEPT_CLASSES'), async (req, res) => {
  const { departmentId, year, section } = req.body;
  try {
    // Check department access for dept admins
    if (req.user.adminLevel === 'DEPT_ADMIN') {
      if (!canAccessDepartment(req.user, departmentId)) {
        return res.status(403).json({ message: 'Cannot create class for other departments' });
      }
    }
    if (!req.orgId) return res.status(400).json({ message: 'Organization context missing' });
    
    const dept = await Department.findOne({ _id: departmentId, orgId: req.orgId });
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    
    const name = `${dept.code}-${year} Year-${section}`;
    
    const cls = new Class({
      orgId: req.orgId,
      departmentId,
      year,
      section,
      name
    });
    await cls.save();
    res.status(201).json(cls);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all classes
app.get('/api/classes', authMiddleware(), async (req, res) => {
  try {
    if (!req.orgId) return res.status(400).json({ message: 'Organization context missing' });
    
    const classes = await Class.find({ orgId: req.orgId })
      .populate('departmentId')
      .sort({ year: 1, section: 1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get classes by department
app.get('/api/departments/:deptId/classes', authMiddleware(), async (req, res) => {
  try {
    if (!req.orgId) return res.status(400).json({ message: 'Organization context missing' });
    
    const classes = await Class.find({ 
      orgId: req.orgId, 
      departmentId: req.params.deptId 
    }).sort({ year: 1, section: 1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Subject (SUPER_ADMIN or DEPT_ADMIN)
app.post('/api/subjects', authMiddleware(['admin']), requirePermission('MANAGE_DEPT_SUBJECTS'), async (req, res) => {
  const { name, code, description, departmentId, year } = req.body;
  try {
    if (!req.orgId) return res.status(400).json({ message: 'Organization context missing' });
    if (!departmentId || !year) return res.status(400).json({ message: 'Department and year are required' });
    
    const subject = new Subject({
      orgId: req.orgId,
      departmentId,
      name,
      code: code.toUpperCase(),
      year: parseInt(year),
      description
    });
    await subject.save();
    await subject.populate('departmentId');
    res.status(201).json(subject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all subjects
app.get('/api/subjects', authMiddleware(), async (req, res) => {
  try {
    if (!req.orgId) return res.status(400).json({ message: 'Organization context missing' });
    
    const subjects = await Subject.find({ orgId: req.orgId })
      .populate('departmentId')
      .sort({ code: 1 });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Teaching Assignment (SUPER_ADMIN or DEPT_ADMIN for their dept)
app.post('/api/teaching-assignments', authMiddleware(['admin']), requirePermission('ASSIGN_DEPT_TEACHERS'), async (req, res) => {
  const { teacherId, subjectId, classIds } = req.body;
  try {
    if (!req.orgId) return res.status(400).json({ message: 'Organization context missing' });
    
    // Verify teacher exists and has teacher role
    const teacher = await User.findOne({ _id: teacherId, orgId: req.orgId, role: 'teacher' });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    
    // Verify subject exists
    const subject = await Subject.findOne({ _id: subjectId, orgId: req.orgId });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    
    // Verify all classes exist
    const classes = await Class.find({ _id: { $in: classIds }, orgId: req.orgId });
    if (classes.length !== classIds.length) return res.status(404).json({ message: 'One or more classes not found' });
    
    const assignment = new TeachingAssignment({
      orgId: req.orgId,
      teacherId,
      subjectId,
      classIds
    });
    await assignment.save();
    
    const populated = await assignment.populate(['teacherId', 'subjectId', 'classIds']);
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get teacher's teaching assignments
app.get('/api/teaching-assignments/my', authMiddleware(['teacher']), async (req, res) => {
  try {
    if (!req.orgId) return res.status(400).json({ message: 'Organization context missing' });
    
    const assignments = await TeachingAssignment.find({ 
      orgId: req.orgId,
      teacherId: req.user._id 
    })
      .populate('subjectId')
      .populate('classIds')
      .sort({ createdAt: 1 });
    
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all teaching assignments (Admin)
app.get('/api/teaching-assignments', authMiddleware(['admin']), async (req, res) => {
  try {
    if (!req.orgId) return res.status(400).json({ message: 'Organization context missing' });
    
    const assignments = await TeachingAssignment.find({ orgId: req.orgId })
      .populate('teacherId', 'name email')
      .populate('subjectId', 'name code')
      .populate('classIds', 'name');
    
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============= NOTICE CREATION (UPDATED) =============

// Create Notice (Admin or Teacher)
app.post('/notices', authMiddleware(['admin', 'teacher']), async (req, res) => {
  const { title, description, category, date, urgent, noticeType, subjectId, targetClassIds } = req.body;

  try {
    if (!req.orgId) return res.status(400).json({ message: 'Organization context missing' });

    // Validation for subject notices
    if (noticeType === 'subject') {
      if (!subjectId || !targetClassIds || targetClassIds.length === 0) {
        return res.status(400).json({ message: 'Subject and target classes are required for subject notices' });
      }

      // For teacher: verify they teach this subject and these classes
      if (req.user.role === 'teacher') {
        const assignment = await TeachingAssignment.findOne({
          orgId: req.orgId,
          teacherId: req.user._id,
          subjectId,
          classIds: { $all: targetClassIds }
        });
        
        if (!assignment) {
          return res.status(403).json({ message: 'You are not assigned to teach this subject to these classes' });
        }
      }
    }

    const notice = new Notice({
      title,
      description,
      category,
      date,
      urgent: urgent || false,
      noticeType: noticeType || 'admin',
      orgId: req.orgId,
      createdBy: req.user._id,
      subjectId: noticeType === 'subject' ? subjectId : null,
      targetClassIds: noticeType === 'subject' ? targetClassIds : []
    });
    
    await notice.save();
    const populated = await notice.populate(['createdBy', 'subjectId', 'targetClassIds']);
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get notices visible to student
app.get('/notices/student/feed', authMiddleware(['student']), async (req, res) => {
  try {
    if (!req.orgId) return res.status(400).json({ message: 'Organization context missing' });
    
    const user = await User.findById(req.user._id);
    if (!user || !user.classId) {
      return res.status(400).json({ message: 'Student class not assigned' });
    }

    // Get all admin notices
    const adminNotices = await Notice.find({
      orgId: req.orgId,
      noticeType: 'admin'
    })
      .populate('createdBy', 'name role')
      .populate('subjectId', 'name code')
      .sort({ createdAt: -1 });

    // Get subject notices for this student's class
    const subjectNotices = await Notice.find({
      orgId: req.orgId,
      noticeType: 'subject',
      targetClassIds: user.classId
    })
      .populate('createdBy', 'name role')
      .populate('subjectId', 'name code')
      .populate('targetClassIds', 'name')
      .sort({ createdAt: -1 });

    const allNotices = [...adminNotices, ...subjectNotices].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json(allNotices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));