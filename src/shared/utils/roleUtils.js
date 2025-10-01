// Role and permission utility functions

import { ROLES, ROLE_PERMISSIONS, isSuperUser, canManageUsers } from '../constants/authConstants';

/**
 * Get role display information
 */
export const getRoleInfo = (role) => {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[ROLES.USER];
};

/**
 * Get all available roles for selection
 */
export const getAvailableRoles = () => {
  return Object.entries(ROLE_PERMISSIONS).map(([key, config]) => ({
    value: key,
    label: config.name,
    description: config.description,
    color: config.color,
    icon: config.icon,
  }));
};

/**
 * Check if user can perform action based on role hierarchy
 */
export const canPerformAction = (user, targetUser, action) => {
  if (!user || !targetUser) return false;
  
  // Superuser can do anything
  if (isSuperUser(user)) return true;
  
  // Cannot modify superusers unless you are one
  if (isSuperUser(targetUser) && !isSuperUser(user)) return false;
  
  // Role hierarchy: admin > manager > others
  const roleHierarchy = {
    [ROLES.ADMIN]: 4,
    [ROLES.MANAGER]: 3,
    [ROLES.PROJECT_MANAGER]: 3,
    [ROLES.DEVELOPER]: 2,
    [ROLES.DESIGNER]: 2,
    [ROLES.TESTER]: 2,
    [ROLES.USER]: 1,
    [ROLES.PROJECT_USER]: 1,
  };
  
  const userLevel = roleHierarchy[user.role] || 0;
  const targetLevel = roleHierarchy[targetUser.role] || 0;
  
  // Can only modify users at lower or equal level
  return userLevel >= targetLevel;
};

/**
 * Get role color for UI display
 */
export const getRoleColor = (role) => {
  const roleInfo = getRoleInfo(role);
  return roleInfo.color;
};

/**
 * Get role icon for UI display
 */
export const getRoleIcon = (role) => {
  const roleInfo = getRoleInfo(role);
  return roleInfo.icon;
};

/**
 * Check if role is protected (cannot be deleted/modified)
 */
export const isProtectedRole = (role) => {
  return role === ROLES.ADMIN;
};

/**
 * Check if user is protected (superuser)
 */
export const isProtectedUser = (user) => {
  return isSuperUser(user);
};

/**
 * Get role badge props for Material-UI Chip
 */
export const getRoleBadgeProps = (role) => {
  const roleInfo = getRoleInfo(role);
  return {
    label: roleInfo.name,
    color: roleInfo.color === '#ef4444' ? 'error' : 
           roleInfo.color === '#6366f1' ? 'primary' :
           roleInfo.color === '#10b981' ? 'success' :
           roleInfo.color === '#f59e0b' ? 'warning' : 'default',
    variant: 'outlined',
  };
};

/**
 * Get user status badge props for Material-UI Chip
 */
export const getStatusBadgeProps = (status) => {
  const statusConfig = {
    active: { color: 'success', label: 'Actif' },
    inactive: { color: 'default', label: 'Inactif' },
    suspended: { color: 'error', label: 'Suspendu' },
  };
  
  const config = statusConfig[status] || statusConfig.inactive;
  return {
    label: config.label,
    color: config.color,
    variant: 'outlined',
  };
};

/**
 * Filter users based on role and permissions
 */
export const filterUsersByRole = (users, currentUser) => {
  if (!currentUser) return users;
  
  // Superuser can see all users
  if (isSuperUser(currentUser)) return users;
  
  // Manager can see all users except other managers and admins
  if (currentUser.role === ROLES.MANAGER) {
    return users.filter(user => 
      user.role !== ROLES.ADMIN && 
      user.role !== ROLES.MANAGER &&
      !isSuperUser(user)
    );
  }
  
  // Others can only see users at their level or below
  return users.filter(user => 
    canPerformAction(currentUser, user, 'view')
  );
};

/**
 * Get available actions for a user based on current user's role
 */
export const getAvailableUserActions = (targetUser, currentUser) => {
  if (!currentUser || !targetUser) return [];
  
  const actions = [];
  
  // View action - everyone can view
  actions.push('view');
  
  // Edit action
  if (canPerformAction(currentUser, targetUser, 'edit')) {
    actions.push('edit');
  }
  
  // Delete action - only for non-protected users
  if (!isProtectedUser(targetUser) && canPerformAction(currentUser, targetUser, 'delete')) {
    actions.push('delete');
  }
  
  // Manage permissions - only superusers
  if (isSuperUser(currentUser) && !isProtectedUser(targetUser)) {
    actions.push('manage_permissions');
  }
  
  return actions;
};

/**
 * Validate role assignment
 */
export const validateRoleAssignment = (newRole, currentUser, targetUser) => {
  if (!currentUser || !targetUser) return { valid: false, message: 'Invalid users' };
  
  // Cannot change superuser role
  if (isProtectedUser(targetUser)) {
    return { valid: false, message: 'Cannot modify superuser role' };
  }
  
  // Cannot assign admin role unless you are superuser
  if (newRole === ROLES.ADMIN && !isSuperUser(currentUser)) {
    return { valid: false, message: 'Only superusers can assign admin role' };
  }
  
  // Cannot assign role higher than your own
  if (!canPerformAction(currentUser, targetUser, 'assign_role')) {
    return { valid: false, message: 'Cannot assign role higher than your own' };
  }
  
  return { valid: true };
};
