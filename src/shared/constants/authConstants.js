// Authentication and authorization constants

// User roles
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  DEVELOPER: 'developer',
  DESIGNER: 'designer',
  TESTER: 'tester',
  USER: 'user',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  PROJECT_USER: 'PROJECT_USER',
};

// Permission strings
export const PERMISSIONS = {
  // Project permissions
  PROJECT_VIEW: 'project:view',
  PROJECT_CREATE: 'project:create',
  PROJECT_EDIT: 'project:edit',
  PROJECT_DELETE: 'project:delete',
  
  // Task permissions
  TASK_VIEW: 'task:view',
  TASK_CREATE: 'task:create',
  TASK_EDIT: 'task:edit',
  TASK_DELETE: 'task:delete',
  
  // User management permissions
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  USER_MANAGE: 'user:manage',
  
  // Permission management
  PERMISSION_VIEW: 'permission:view',
  PERMISSION_CHANGE: 'permission:change',
  ROLE_VIEW: 'role:view',
  ROLE_CHANGE: 'role:change',
  
  // System permissions
  SYSTEM_ADMIN: 'system:admin',
  TEAM_VIEW: 'team:view',
  TEAM_MANAGE: 'team:manage',
};

// Role-based permission groups
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    name: 'Administrateur',
    description: 'Accès total au système',
    permissions: ['*'], // All permissions
    color: '#ef4444',
    icon: 'admin_panel_settings',
  },
  
  [ROLES.MANAGER]: {
    name: 'Manager',
    description: 'Gestion des modules et équipes',
    permissions: [
      PERMISSIONS.PROJECT_VIEW, PERMISSIONS.PROJECT_CREATE, PERMISSIONS.PROJECT_EDIT, PERMISSIONS.PROJECT_DELETE,
      PERMISSIONS.TASK_VIEW, PERMISSIONS.TASK_CREATE, PERMISSIONS.TASK_EDIT, PERMISSIONS.TASK_DELETE,
      PERMISSIONS.USER_VIEW, PERMISSIONS.USER_CREATE, PERMISSIONS.USER_EDIT,
    ],
    color: '#6366f1',
    icon: 'manage_accounts',
  },
  
  [ROLES.PROJECT_MANAGER]: {
    name: 'Gestionnaire de Module',
    description: 'Gestion complète des modules',
    permissions: [
      PERMISSIONS.PROJECT_VIEW, PERMISSIONS.PROJECT_CREATE, PERMISSIONS.PROJECT_EDIT, PERMISSIONS.PROJECT_DELETE,
      PERMISSIONS.TASK_VIEW, PERMISSIONS.TASK_CREATE, PERMISSIONS.TASK_EDIT, PERMISSIONS.TASK_DELETE,
      PERMISSIONS.USER_VIEW, PERMISSIONS.USER_CREATE, PERMISSIONS.USER_EDIT,
    ],
    color: '#6366f1',
    icon: 'manage_accounts',
  },
  
  [ROLES.DEVELOPER]: {
    name: 'Développeur',
    description: 'Développement et maintenance',
    permissions: [
      PERMISSIONS.PROJECT_VIEW,
      PERMISSIONS.TASK_VIEW, PERMISSIONS.TASK_CREATE, PERMISSIONS.TASK_EDIT,
    ],
    color: '#10b981',
    icon: 'code',
  },
  
  [ROLES.DESIGNER]: {
    name: 'Designer',
    description: 'Design et interface utilisateur',
    permissions: [
      PERMISSIONS.PROJECT_VIEW,
      PERMISSIONS.TASK_VIEW, PERMISSIONS.TASK_CREATE, PERMISSIONS.TASK_EDIT,
    ],
    color: '#f59e0b',
    icon: 'palette',
  },
  
  [ROLES.TESTER]: {
    name: 'Testeur',
    description: 'Tests et validation',
    permissions: [
      PERMISSIONS.PROJECT_VIEW,
      PERMISSIONS.TASK_VIEW, PERMISSIONS.TASK_EDIT,
    ],
    color: '#8b5cf6',
    icon: 'bug_report',
  },
  
  [ROLES.USER]: {
    name: 'Utilisateur',
    description: 'Consultation et participation',
    permissions: [
      PERMISSIONS.PROJECT_VIEW,
      PERMISSIONS.TASK_VIEW,
    ],
    color: '#6b7280',
    icon: 'person',
  },
  
  [ROLES.PROJECT_USER]: {
    name: 'Utilisateur de Module',
    description: 'Consultation des modules',
    permissions: [
      PERMISSIONS.PROJECT_VIEW,
      PERMISSIONS.TASK_VIEW,
    ],
    color: '#6b7280',
    icon: 'person',
  },
};

// Storage keys for localStorage
export const STORAGE_KEYS = {
  USER: 'userData',
  ACCESS: 'accessToken',
  REFRESH: 'refreshToken',
  LAST_LOGIN: 'ghpportail_last_login',
  REMEMBER_ME: 'ghpportail_remember_me',
  USER_PREFERENCES: 'ghpportail_user_preferences',
  SESSION_TIMEOUT: 'ghpportail_session_timeout',
};

// User status options
export const USER_STATUS_OPTIONS = [
  { value: 'active', label: 'Actif', color: 'success' },
  { value: 'inactive', label: 'Inactif', color: 'default' },
  { value: 'suspended', label: 'Suspendu', color: 'error' },
];

// Role display options
export const ROLE_OPTIONS = Object.entries(ROLE_PERMISSIONS).map(([key, config]) => ({
  value: key,
  label: config.name,
  description: config.description,
  color: config.color,
  icon: config.icon,
}));

// Permission categories for organization
export const PERMISSION_CATEGORIES = {
  PROJECT: {
    label: 'Gestion des Projets',
    permissions: [
      PERMISSIONS.PROJECT_VIEW,
      PERMISSIONS.PROJECT_CREATE,
      PERMISSIONS.PROJECT_EDIT,
      PERMISSIONS.PROJECT_DELETE,
    ],
  },
  TASK: {
    label: 'Gestion des Tâches',
    permissions: [
      PERMISSIONS.TASK_VIEW,
      PERMISSIONS.TASK_CREATE,
      PERMISSIONS.TASK_EDIT,
      PERMISSIONS.TASK_DELETE,
    ],
  },
  USER: {
    label: 'Gestion des Utilisateurs',
    permissions: [
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.USER_CREATE,
      PERMISSIONS.USER_EDIT,
      PERMISSIONS.USER_DELETE,
      PERMISSIONS.USER_MANAGE,
    ],
  },
  SYSTEM: {
    label: 'Administration Système',
    permissions: [
      PERMISSIONS.SYSTEM_ADMIN,
      PERMISSIONS.TEAM_VIEW,
      PERMISSIONS.TEAM_MANAGE,
      PERMISSIONS.PERMISSION_VIEW,
      PERMISSIONS.PERMISSION_CHANGE,
      PERMISSIONS.ROLE_VIEW,
      PERMISSIONS.ROLE_CHANGE,
    ],
  },
};

// Helper functions
export const getRoleConfig = (role) => ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[ROLES.USER];

export const getRolePermissions = (role) => {
  const config = getRoleConfig(role);
  return config.permissions.includes('*') ? Object.values(PERMISSIONS) : config.permissions;
};

export const hasPermission = (userPermissions, permission) => {
  if (!userPermissions) return false;
  return userPermissions.includes('*') || userPermissions.includes(permission);
};

export const isSuperUser = (user) => {
  return user?.role === ROLES.ADMIN || user?.is_superuser || user?.is_staff;
};

export const canManageUsers = (user) => {
  return isSuperUser(user) || user?.role === ROLES.MANAGER;
};
