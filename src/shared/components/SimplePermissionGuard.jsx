import React from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Composant de protection simplifié
 * - Superuser (admin) : Accès total, aucun verrou
 * - Autres utilisateurs : Vérification des permissions par groupe de rôle
 */
const SimplePermissionGuard = ({ 
  children, 
  requiredPermission = null,
  requiredRole = null,
  fallback = null 
}) => {
  const { user, hasPermission, hasRole } = useAuth();
  
  // Si pas d'utilisateur, ne pas afficher
  if (!user) {
    return fallback;
  }
  
  // Superuser (admin) : ACCÈS TOTAL - AUCUN VÉRROU
  if (user.role === 'admin' || user.is_superuser || user.is_staff) {
    return <>{children}</>;
  }
  
  // Vérification du rôle requis
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback;
  }
  
  // Vérification de la permission requise
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback;
  }
  
  // Accès autorisé
  return <>{children}</>;
};

/**
 * Hook pour vérifier les permissions de manière simplifiée
 */
export const useSimplePermissions = () => {
  const { user, hasPermission, hasRole } = useAuth();
  
  return {
    // Superuser a tout
    isSuperuser: user?.role === 'admin' || user?.is_superuser || user?.is_staff,
    
    // Permissions de base
    canViewProjects: hasPermission('project:view'),
    canManageProjects: hasPermission('project:create') || hasPermission('project:edit'),
    canViewTasks: hasPermission('task:view'),
    canManageTasks: hasPermission('task:create') || hasPermission('task:edit'),
    canViewUsers: hasPermission('user:view'),
    canManageUsers: hasPermission('user:create') || hasPermission('user:edit'),
    
    // Rôles
    isManager: hasRole('manager') || hasRole('PROJECT_MANAGER'),
    isDeveloper: hasRole('developer'),
    isDesigner: hasRole('designer'),
    isTester: hasRole('tester'),
    isUser: hasRole('user') || hasRole('PROJECT_USER'),
    
    // Fonctions utilitaires
    hasPermission,
    hasRole,
    userRole: user?.role,
    user: user
  };
};

export default SimplePermissionGuard;
