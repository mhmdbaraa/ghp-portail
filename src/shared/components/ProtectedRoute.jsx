import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ 
  children, 
  requiredPermission = null, 
  requiredRole = null, 
  requiredAnyRole = null,
  fallback = null 
}) => {
  const { user, isAuthenticated, isLoading, hasPermission, hasRole, hasAnyRole: hasAnyRoleCheck } = useAuth();
  const location = useLocation();

  // Affichage du chargement
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Chargement...
        </Typography>
      </Box>
    );
  }

  // Redirection vers la page de connexion si non authentifié
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Superuser (admin) : ACCÈS TOTAL - AUCUN VÉRROU
  if (user.role === 'admin' || user.is_superuser || user.is_staff) {
    return children;
  }

  // Vérification des permissions requises pour les autres utilisateurs
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          p: 3,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            maxWidth: 500,
            borderRadius: 3,
          }}
        >
          <Typography variant="h4" color="error" gutterBottom>
            Accès refusé
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Vous n'avez pas la permission d'accéder à cette page.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Permission requise : <strong>{requiredPermission}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Votre rôle : <strong>{user.role}</strong>
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Vérification du rôle requis
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          p: 3,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            maxWidth: 500,
            borderRadius: 3,
          }}
        >
          <Typography variant="h4" color="error" gutterBottom>
            Accès refusé
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Cette page nécessite un rôle spécifique.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Rôle requis : <strong>{requiredRole}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Votre rôle : <strong>{user.role}</strong>
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Vérification d'un des rôles requis
  if (requiredAnyRole && !hasAnyRoleCheck(requiredAnyRole)) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          p: 3,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            maxWidth: 500,
            borderRadius: 3,
          }}
        >
          <Typography variant="h4" color="error" gutterBottom>
            Accès refusé
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Cette page nécessite un des rôles suivants.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Rôles acceptés : <strong>{requiredAnyRole.join(', ')}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Votre rôle : <strong>{user.role}</strong>
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Affichage du composant fallback personnalisé
  if (fallback) {
    return fallback;
  }

  // Accès autorisé
  return children;
};

export default ProtectedRoute;
