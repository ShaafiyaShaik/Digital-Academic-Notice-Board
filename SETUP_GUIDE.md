# 🚀 Complete Setup Guide

## 📋 Prerequisites
- Node.js installed
- MongoDB running locally or Atlas connection

---

## 🔧 Step 1: Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in `backend/` folder:
```env
MONGO_URI=mongodb://localhost:27017/dnb
JWT_SECRET=your_secret_key_here
PORT=5000
```

### Create Test Accounts (IMPORTANT)
Run the seed script to create test accounts:
```bash
node seed.js
```

**This creates 5 test accounts:**
- ✅ **Admin**: admin@example.com / admin123
- ✅ **Teacher**: teacher@example.com / teacher123  
- ✅ **Student**: student@example.com / student123
- ✅ Faculty: faculty@example.com / faculty123
- ✅ Librarian: librarian@example.com / librarian123

### Start Backend Server
```bash
npm start
```
Server runs on: `http://localhost:5000`

---

## 🎨 Step 2: Frontend Setup

Open new terminal:
```bash
cd my-app
npm install
npm start
```
Frontend runs on: `http://localhost:3000`

---

## 🔐 Step 3: Login to Different Roles

### 1️⃣ **Admin Dashboard**
1. Go to `http://localhost:3000/login`
2. Select **Role: Admin** from dropdown
3. Login with:
   - Email: `admin@example.com`
   - Password: `admin123`
4. You'll be redirected to `/admin` dashboard

**Admin Can:**
- Create academic structure (Departments, Classes, Subjects)
- Create teaching assignments (assign teachers to subjects & classes)
- Create organizational notices (visible to ALL users)
- View all users
- View read statistics for all notices

---

### 2️⃣ **Teacher Dashboard**
1. Go to `http://localhost:3000/login`
2. Select **Role: Teacher** from dropdown
3. Login with:
   - Email: `teacher@example.com`
   - Password: `teacher123`
4. You'll be redirected to `/teacher` dashboard

**Teacher Can:**
- View their teaching assignments
- Create subject-specific notices for assigned classes ONLY
- View read statistics for their own notices
- Cannot create organizational notices
- Cannot post to classes they don't teach

---

### 3️⃣ **Student Dashboard**
1. Go to `http://localhost:3000/login`
2. Select **Role: Student** from dropdown
3. Login with:
   - Email: `student@example.com`
   - Password: `student123`
4. You'll be redirected to `/student` dashboard

**Student Can:**
- See TWO sections of notices:
  - **Official College Notices** (from admin)
  - **Class Notices** (from their teachers)
- Click notice to mark as read
- Cannot create notices

---

## 🏗️ Step 4: Setup Academic Structure (ADMIN ONLY)

Before teachers can post class notices, admin must set up the structure:

### A. Login as Admin
Use admin@example.com / admin123

### B. Go to "Academic Structure" (in admin sidebar)

### C. Create in This Order:

**1. Create Department**
- Name: Computer Science
- Code: CSE
- Click "Create Department"

**2. Create Classes**
- Select Department: CSE
- Year: 3
- Section: A
- Click "Create Class"
- (System auto-generates name: "CSE-3rd Year-A")

Repeat for more classes (CSE-3rd Year-B, etc.)

**3. Create Subjects**
- Name: Database Management Systems
- Code: DBMS
- Description: Database concepts
- Click "Create Subject"

Repeat for more subjects (Operating Systems, Data Structures, etc.)

**4. Create Teaching Assignment**
- Select Teacher: teacher@example.com (dropdown shows all teachers)
- Select Subject: DBMS
- Select Classes: ☑️ CSE-3rd Year-A, ☑️ CSE-3rd Year-B (multi-select)
- Click "Create Assignment"

This means: Teacher can now post DBMS notices to CSE-3A and CSE-3B

---

## 🔄 Step 5: Assign Student to Class

Students need to be assigned to a class to see class notices.

**Option 1: Manually in MongoDB**
```javascript
db.users.updateOne(
  { email: "student@example.com" },
  { $set: { classId: ObjectId("your_class_id_here") } }
)
```

**Option 2: During Registration**
(Add classId dropdown to register form - not implemented yet)

---

## 🎯 Step 6: Test the Complete Flow

### Test Admin Notices
1. Login as **Admin**
2. Go to "Create Notice"
3. Fill form (title, description, category, date)
4. System automatically sets `noticeType: "admin"`
5. Click "Create Notice"
6. **Result**: ALL users (teachers + students) will see this

### Test Teacher Notices
1. Login as **Teacher**
2. You'll see "My Teaching Assignments" section
3. Example: "DBMS – CSE-3rd Year-A, CSE-3rd Year-B"
4. Click "Create Notice" button for that assignment
5. Fill form (system auto-fills subject and classes)
6. Click "Create Notice"
7. **Result**: Only students in CSE-3A and CSE-3B will see this

### Test Student View
1. Login as **Student** (assigned to CSE-3rd Year-A)
2. Dashboard shows TWO sections:
   - **Official College Notices** (all admin notices)
   - **Class Notices** (only DBMS notices for CSE-3A)
3. Click any notice to view details
4. System automatically marks as read

### Test Read Statistics
1. Login as **Admin**
2. Go to "Manage Notices"
3. Click "View Stats" on any notice
4. See: "45 read, 15 not read" with full reader list

---

## 🔍 Troubleshooting

### Issue: Teacher can't create notices
**Solution**: Admin must create Teaching Assignment first

### Issue: Student sees no class notices
**Solution**: Student needs `classId` field populated in database

### Issue: Login redirects to wrong dashboard
**Solution**: Check role dropdown matches account role

### Issue: "Organization not found" error
**Solution**: Run backend seed script or create org manually

---

## 📊 System Architecture Summary

```
Admin creates:
├── Departments (CSE, ECE, IT)
├── Classes (CSE-3A, CSE-3B)
├── Subjects (DBMS, OS)
└── Teaching Assignments (Teacher → Subject → Classes)

Notice Flow:
├── Admin Notice → noticeType="admin" → Visible to ALL
└── Teacher Notice → noticeType="subject" + targetClassIds → Visible to THOSE classes only

Student Dashboard:
├── Official College Notices (admin)
└── Class Notices (teachers of their class)
```

---

## 🎓 Key Concepts

| Concept | Meaning |
|---------|---------|
| **Teaching Assignment** | Connects Teacher + Subject + Classes (enables authorization) |
| **noticeType** | Determines visibility (admin = all, subject = class-specific) |
| **targetClassIds** | Array of classes that can see the subject notice |
| **classId** | Student's enrolled class (determines which subject notices they see) |
| **orgId** | Multi-tenant isolation (all queries filtered by organization) |

---

## ✅ Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Test accounts created (seed.js executed)
- [ ] Can login as admin, teacher, student
- [ ] Academic structure created (dept, class, subject, assignment)
- [ ] Teacher can create class notices
- [ ] Student sees both notice types in separate sections
- [ ] Read tracking works (stats show reader lists)

---

## 🚀 You're All Set!

The system is now fully operational. Each role has clear boundaries and the notice system mirrors real college communication patterns.
