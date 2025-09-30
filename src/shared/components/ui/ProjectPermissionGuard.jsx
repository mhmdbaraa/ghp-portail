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
  
  // If requireManager is true, only PROJECT_MANAGER can see the content
  if (requireManager) {
    if (userRole === 'PROJECT_MANAGER') {
      return <>{children}</>;
    }
    return fallback;
  }
  
  // If not requireManager, both PROJECT_MANAGER and PROJECT_USER can see
  if (userRole === 'PROJECT_MANAGER' || userRole === 'PROJECT_USER') {
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
  
  return {
    isProjectManager: userRole === 'PROJECT_MANAGER',
    isProjectUser: userRole === 'PROJECT_USER',
    canView: userRole === 'PROJECT_MANAGER' || userRole === 'PROJECT_USER',
    canEdit: userRole === 'PROJECT_MANAGER',
    canCreate: userRole === 'PROJECT_MANAGER',
    canDelete: userRole === 'PROJECT_MANAGER',
    userRole: userRole,
  };
};

export default ProjectPermissionGuard;
