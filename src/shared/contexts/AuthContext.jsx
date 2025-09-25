import React, { createContext, useContext, useState, useEffect } from 'react';
import useJwt from '../jwt/useJwt'
import axiosInstance from '../services/axiosInstance'

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Rôles et permissions
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user'
};

export const PERMISSIONS = {
  PROJECT_VIEW: 'project:view',
  PROJECT_CREATE: 'project:create',
  PROJECT_EDIT: 'project:edit',
  PROJECT_DELETE: 'project:delete',
  TASK_VIEW: 'task:view',
  TASK_CREATE: 'task:create',
  TASK_EDIT: 'task:edit',
  TASK_DELETE: 'task:delete',
  USER_VIEW: 'user:view',
  USER_ADD: 'user:add',
  USER_CHANGE: 'user:change',
  USER_DELETE: 'user:delete',
  USER_MANAGE: 'user:manage',
  PERMISSION_VIEW: 'permission:view',
  PERMISSION_CHANGE: 'permission:change',
  ROLE_VIEW: 'role:view',
  ROLE_CHANGE: 'role:change'
};

// Clés pour le localStorage (alignées avec axiosInstance)
const STORAGE_KEYS = {
  USER: 'userData',
  ACCESS: 'accessToken',
  REFRESH: 'refreshToken',
  LAST_LOGIN: 'projecttracker_last_login',
  REMEMBER_ME: 'projecttracker_remember_me',
  USER_PREFERENCES: 'projecttracker_user_preferences',
  SESSION_TIMEOUT: 'projecttracker_session_timeout',
};

export const AuthProvider = ({ children }) => {
  const { jwt } = useJwt();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS);
      if (savedUser && accessToken) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Erreur lors du parsing des données utilisateur:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const getStoredPreferences = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  };

  const login = async (identifier, password, rememberMe = false) => {
    setIsLoading(true);
    try {
      const payload = identifier && identifier.includes('@')
        ? { email: identifier, password }
        : { username: identifier, password }
      const response = await jwt.login(payload)

      const data = response?.data || {}
      const userFromApi = data.user || null
      const accessToken = data.tokens?.access || null
      const refreshToken = data.tokens?.refresh || null

      if (!userFromApi || !accessToken) {
        throw new Error('Réponse de connexion invalide')
      }

      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userFromApi));
      localStorage.setItem(STORAGE_KEYS.ACCESS, accessToken);
      if (refreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH, refreshToken);
      setUser(userFromApi);
      setIsAuthenticated(true);
      return { success: true, user: userFromApi };
    } catch (error) {
      return { success: false, error: error?.response?.data?.message || error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try { 
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH);
      if (refreshToken) {
        await axiosInstance.post('/auth/logout/', { refresh_token: refreshToken });
      }
    } catch (e) {
      console.error('Logout error:', e);
    }
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ACCESS);
    localStorage.removeItem(STORAGE_KEYS.REFRESH);
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  // Fonctions de vérification des permissions et rôles
  const hasPermission = (permission) => {
    if (!user) return false;
    // Pour simplifier, tous les utilisateurs connectés ont toutes les permissions
    // Dans une vraie app, vous vérifieriez les permissions depuis l'API
    return true;
  };

  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  const hasAnyRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    getStoredPreferences,
    hasPermission,
    hasRole,
    hasAnyRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Default export for React Fast Refresh compatibility
export default AuthProvider;
