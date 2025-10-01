// React imports
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// Services
import useJwt from '../jwt/useJwt';
import axiosInstance from '../services/axiosInstance';

// Constants
import {
  ROLES,
  PERMISSIONS,
  STORAGE_KEYS,
  ROLE_PERMISSIONS,
  getRolePermissions,
  hasPermission as checkPermission,
  isSuperUser,
} from '../constants/authConstants';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Re-export constants for backward compatibility
export { ROLES, PERMISSIONS };

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
        await axiosInstance.post('/authentication/logout/', { refresh_token: refreshToken });
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

  // Memoized user permissions for performance
  const userPermissions = useMemo(() => {
    if (!user) return [];
    return getRolePermissions(user.role);
  }, [user?.role]);

  // Optimized permission checking functions
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    
    // Superuser has all permissions
    if (isSuperUser(user)) return true;
    
    return checkPermission(userPermissions, permission);
  }, [user, userPermissions]);

  const hasRole = useCallback((role) => {
    if (!user) return false;
    return user.role === role;
  }, [user]);

  const hasAnyRole = useCallback((roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

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
