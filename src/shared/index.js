// Shared Components Exports
export { default as Layout } from './components/Layout';
export { default as ProtectedRoute } from './components/ProtectedRoute';
export { default as SimplePermissionGuard, useSimplePermissions } from './components/SimplePermissionGuard';
export { default as RoleInfo } from './components/RoleInfo';
export { default as HomeDashboard } from './components/HomeDashboard';
export { default as Login } from './components/Login';
export { default as Register } from './components/Register';

// Shared Contexts
export { default as AuthProvider, useAuth, PERMISSIONS, ROLES } from './contexts/AuthContext';
export { default as ThemeProvider, useTheme } from './contexts/ThemeContext';

// Shared Services
export { default as apiService } from './services/apiService';
export { default as axiosInstance } from './services/axiosInstance';

// Shared Utils
export * from './utils/rolePermissions';

// Shared Auth
export { default as useJwt } from './jwt/useJwt';
export { default as jwtService } from './jwt/jwtService';
export { default as jwtDefaultConfig } from './jwt/jwtDefaultConfig';
