/**
 * Système de rôles et permissions simplifié
 * 
 * PRINCIPE :
 * - Superuser (admin) : Accès total, aucun verrou
 * - Autres rôles : Groupes de permissions prédéfinis
 */

// Groupes de permissions par rôle
export const ROLE_PERMISSIONS = {
  // Superuser - ACCÈS TOTAL
  admin: {
    name: 'Administrateur',
    description: 'Accès total au système',
    permissions: ['*'], // Toutes les permissions
    color: '#ef4444',
    icon: 'admin_panel_settings'
  },
  
  // Gestionnaires - GESTION COMPLÈTE
  manager: {
    name: 'Manager',
    description: 'Gestion des projets et équipes',
    permissions: [
      'project:view', 'project:create', 'project:edit', 'project:delete',
      'task:view', 'task:create', 'task:edit', 'task:delete',
      'user:view', 'user:create', 'user:edit'
    ],
    color: '#6366f1',
    icon: 'manage_accounts'
  },
  
  PROJECT_MANAGER: {
    name: 'Gestionnaire de Projet',
    description: 'Gestion complète des projets',
    permissions: [
      'project:view', 'project:create', 'project:edit', 'project:delete',
      'task:view', 'task:create', 'task:edit', 'task:delete',
      'user:view', 'user:create', 'user:edit'
    ],
    color: '#6366f1',
    icon: 'manage_accounts'
  },
  
  // Développeurs - TRAVAIL SUR PROJETS
  developer: {
    name: 'Développeur',
    description: 'Développement et maintenance',
    permissions: [
      'project:view',
      'task:view', 'task:create', 'task:edit'
    ],
    color: '#10b981',
    icon: 'code'
  },
  
  designer: {
    name: 'Designer',
    description: 'Design et interface utilisateur',
    permissions: [
      'project:view',
      'task:view', 'task:create', 'task:edit'
    ],
    color: '#f59e0b',
    icon: 'palette'
  },
  
  // Testeurs - VALIDATION
  tester: {
    name: 'Testeur',
    description: 'Tests et validation',
    permissions: [
      'project:view',
      'task:view', 'task:edit'
    ],
    color: '#8b5cf6',
    icon: 'bug_report'
  },
  
  // Utilisateurs - CONSULTATION
  user: {
    name: 'Utilisateur',
    description: 'Consultation des projets',
    permissions: [
      'project:view',
      'task:view'
    ],
    color: '#6b7280',
    icon: 'person'
  },
  
  PROJECT_USER: {
    name: 'Utilisateur de Projet',
    description: 'Consultation des projets',
    permissions: [
      'project:view',
      'task:view'
    ],
    color: '#6b7280',
    icon: 'person'
  }
};

// Permissions disponibles
export const AVAILABLE_PERMISSIONS = {
  // Projets
  'project:view': 'Voir les projets',
  'project:create': 'Créer des projets',
  'project:edit': 'Modifier les projets',
  'project:delete': 'Supprimer les projets',
  
  // Tâches
  'task:view': 'Voir les tâches',
  'task:create': 'Créer des tâches',
  'task:edit': 'Modifier les tâches',
  'task:delete': 'Supprimer les tâches',
  
  // Utilisateurs
  'user:view': 'Voir les utilisateurs',
  'user:create': 'Créer des utilisateurs',
  'user:edit': 'Modifier les utilisateurs',
  'user:delete': 'Supprimer les utilisateurs',
  'user:manage': 'Gérer les utilisateurs',
  
  // Équipes
  'team:view': 'Voir les équipes',
  'team:manage': 'Gérer les équipes',
  
  // Système
  'system:admin': 'Administration système'
};

// Fonctions utilitaires
export const getRoleInfo = (role) => {
  return ROLE_PERMISSIONS[role] || {
    name: role,
    description: 'Rôle personnalisé',
    permissions: [],
    color: '#6b7280',
    icon: 'person'
  };
};

export const getUserPermissions = (role) => {
  const roleInfo = getRoleInfo(role);
  return roleInfo.permissions;
};

export const hasUserPermission = (userRole, permission) => {
  // Superuser a tout
  if (userRole === 'admin') {
    return true;
  }
  
  const permissions = getUserPermissions(userRole);
  return permissions.includes('*') || permissions.includes(permission);
};

export const getRoleColor = (role) => {
  return getRoleInfo(role).color;
};

export const getRoleIcon = (role) => {
  return getRoleInfo(role).icon;
};

