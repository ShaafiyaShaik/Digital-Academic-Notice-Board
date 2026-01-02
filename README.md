# Digital Notice Board

A modern digital notice board system for educational institutions with role-based access control.

## Features
- Multi-tenant organization support
- Role-based access (Admin, Teacher, Student)
- Hierarchical admin permissions (Super Admin, Dept Admin, Academic Admin)
- Academic structure management (Departments, Classes, Subjects)
- User management system
- Teaching assignments
- Notice board with categories

## Tech Stack
- **Backend**: Node.js, Express, MongoDB
- **Frontend**: React, React Router
- **Authentication**: JWT
- **Database**: MongoDB Atlas

## Setup

### Backend
```bash
cd backend
npm install
# Create .env file with your MongoDB URI
npm start
```

### Frontend
```bash
cd my-app
npm install
npm start
```

## Deployment
- Backend: Render.com
- Frontend: Vercel
- Database: MongoDB Atlas

## Environment Variables

### Backend (.env)
```
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
PORT=5000
```

### Frontend (.env)
```
REACT_APP_API_URL=your_backend_url
PORT=3003
```
