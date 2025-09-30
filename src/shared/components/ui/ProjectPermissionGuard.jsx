import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Permission Guard Component for Project Management
 * 
 * Roles:
 * - PROJECT_MANAGER: Full access (can create, edit, delete)
 * - PROJECT_USER: Read-only access (can only view)
 * 
 * Usage:
 * <ProjectPermissionGuard requireManager>
 *   <Button>Edit Project</Button>
 * </ProjectPermissionGuard>
 */
const ProjectPermissionGuard = ({ 
  children, 
  requireManager = false,
  fallback = null 
}) => {
  const { user } = useAuth();
  
  // If no user, don't render
  if (!user) {
    return fallback;
  }
  
  const userRole = user.role || user.user_role || '';
  
  // Define roles that have project access
  const projectManagerRoles = ['admin', 'manager', 'PROJECT_MANAGER'];
  const projectUserRoles = ['admin', 'manager', 'developer', 'designer', 'tester', 'user', 'PROJECT_MANAGER', 'PROJECT_USER'];
  
  // If requireManager is true, only manager-level roles can see the content
  if (requireManager) {
    if (projectManagerRoles.includes(userRole)) {
      return <>{children}</>;
    }
    return fallback;
  }
  
  // If not requireManager, all project-related roles can see
  if (projectUserRoles.includes(userRole)) {
    return <>{children}</>;
  }
  
  return fallback;
};

/**
 * Hook to check project permissions
 */
export const useProjectPermissions = () => {
  const { user } = useAuth();
  
  const userRole = user?.role || user?.user_role || '';
  
  // Define roles that have project access
  const projectManagerRoles = ['admin', 'manager', 'PROJECT_MANAGER'];
  const projectUserRoles = ['admin', 'manager', 'developer', 'designer', 'tester', 'user', 'PROJECT_MANAGER', 'PROJECT_USER'];
  
  return {
    isProjectManager: projectManagerRoles.includes(userRole),
    isProjectUser: projectUserRoles.includes(userRole),
    canView: projectUserRoles.includes(userRole),
    canEdit: projectManagerRoles.includes(userRole),
    canCreate: projectManagerRoles.includes(userRole),
    canDelete: projectManagerRoles.includes(userRole),
    userRole: userRole,
  };
};

export default ProjectPermissionGuard;
