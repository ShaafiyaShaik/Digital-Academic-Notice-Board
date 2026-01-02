/**
 * Permission Middleware
 * Checks admin level and department scope for feature access
 */

// Permission definitions
const PERMISSIONS = {
  // Department Management
  MANAGE_DEPARTMENTS: ['SUPER_ADMIN'],
  
  // Class Management
  MANAGE_ALL_CLASSES: ['SUPER_ADMIN'],
  MANAGE_DEPT_CLASSES: ['SUPER_ADMIN', 'DEPT_ADMIN'],
  
  // Subject Management
  MANAGE_ALL_SUBJECTS: ['SUPER_ADMIN'],
  MANAGE_DEPT_SUBJECTS: ['SUPER_ADMIN', 'DEPT_ADMIN'],
  
  // Teacher Assignment
  ASSIGN_ALL_TEACHERS: ['SUPER_ADMIN'],
  ASSIGN_DEPT_TEACHERS: ['SUPER_ADMIN', 'DEPT_ADMIN'],
  
  // Notice Management
  CREATE_ORG_NOTICE: ['SUPER_ADMIN', 'DEPT_ADMIN', 'ACADEMIC_ADMIN'],
  MARK_MANDATORY: ['SUPER_ADMIN', 'ACADEMIC_ADMIN'],
  
  // Analytics
  VIEW_ALL_ANALYTICS: ['SUPER_ADMIN'],
  VIEW_DEPT_ANALYTICS: ['SUPER_ADMIN', 'DEPT_ADMIN'],
  
  // User Management
  CREATE_ADMIN: ['SUPER_ADMIN'],
  MANAGE_USERS: ['SUPER_ADMIN', 'DEPT_ADMIN'],
};

/**
 * Check if user has a specific permission
 */
const hasPermission = (user, permission) => {
  // Must be admin
  if (user.role !== 'admin') return false;
  
  // Check if admin level has this permission
  const allowedLevels = PERMISSIONS[permission];
  if (!allowedLevels) return false;
  
  return allowedLevels.includes(user.adminLevel);
};

/**
 * Middleware: Require specific permission
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    console.log('DEBUG - Permission check:', {
      permission,
      user: {
        _id: req.user._id,
        role: req.user.role,
        adminLevel: req.user.adminLevel
      }
    });
    
    if (!hasPermission(req.user, permission)) {
      console.log('DEBUG - Permission DENIED');
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        required: permission,
        yourLevel: req.user.adminLevel,
        yourRole: req.user.role,
        DEBUG: req.user
      });
    }
    console.log('DEBUG - Permission GRANTED');
    next();
  };
};

/**
 * Check if admin can access department
 */
const canAccessDepartment = (user, departmentId) => {
  // Super admin can access all departments
  if (user.adminLevel === 'SUPER_ADMIN') return true;
  
  // Dept admin can only access their department
  if (user.adminLevel === 'DEPT_ADMIN') {
    return user.departmentId && user.departmentId.toString() === departmentId.toString();
  }
  
  return false;
};

/**
 * Get department filter for queries
 * Returns null for super admin (no filter), departmentId for dept admin
 */
const getDepartmentFilter = (user) => {
  if (user.adminLevel === 'SUPER_ADMIN') return null;
  if (user.adminLevel === 'DEPT_ADMIN' && user.departmentId) {
    return user.departmentId;
  }
  return null;
};

module.exports = {
  PERMISSIONS,
  hasPermission,
  requirePermission,
  canAccessDepartment,
  getDepartmentFilter
};
