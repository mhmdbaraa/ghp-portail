import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, 
  Paper, 
  Typography, 
  Alert,
  Button 
} from '@mui/material';
import { 
  AdminPanelSettings,
  Security,
  Lock
} from '@mui/icons-material';

/**
 * Composant de protection pour l'accès exclusif aux superusers
 * Seuls les superusers peuvent voir le contenu
 */
const SuperuserOnlyGuard = ({ 
  children, 
  fallback = null,
  showAccessDenied = true 
}) => {
  const { user } = useAuth();
  
  // Si pas d'utilisateur, ne pas afficher
  if (!user) {
    return fallback;
  }
  
  // Vérifier si l'utilisateur est superuser
  const isSuperuser = user.role === 'admin' || user.is_superuser || user.is_staff;
  
  // Si superuser, afficher le contenu
  if (isSuperuser) {
    return <>{children}</>;
  }
  
  // Si pas superuser et showAccessDenied est true, afficher le message d'accès refusé
  if (showAccessDenied) {
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
          <Box sx={{ mb: 3 }}>
            <Security 
              sx={{ 
                fontSize: 64, 
                color: 'error.main',
                mb: 2 
              }} 
            />
            <Typography variant="h4" color="error" gutterBottom>
              Accès Restreint
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Cette section est réservée aux administrateurs système uniquement.
            </Typography>
          </Box>
          
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            icon={<AdminPanelSettings />}
          >
            <Typography variant="body2">
              <strong>Permission requise :</strong> Superuser (Administrateur)
            </Typography>
            <Typography variant="body2">
              <strong>Votre rôle :</strong> {user.role || 'Utilisateur'}
            </Typography>
          </Alert>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<Lock />}
              onClick={() => window.history.back()}
            >
              Retour
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }
  
  // Si showAccessDenied est false, ne rien afficher
  return fallback;
};

export default SuperuserOnlyGuard;

