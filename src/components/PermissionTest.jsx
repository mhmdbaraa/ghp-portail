import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid,
  Button,
  Chip,
  Alert
} from '@mui/material';
import { 
  SimplePermissionGuard, 
  useSimplePermissions, 
  RoleInfo,
  useAuth 
} from '../shared';

const PermissionTest = () => {
  const { user } = useAuth();
  const permissions = useSimplePermissions();
  
  const testPermissions = [
    'project:view',
    'project:create', 
    'project:edit',
    'project:delete',
    'task:view',
    'task:create',
    'task:edit',
    'task:delete',
    'user:view',
    'user:create',
    'user:edit',
    'user:delete',
    'user:manage'
  ];
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Test du Système de Permissions
      </Typography>
      
      {/* Informations sur l'utilisateur */}
      <Box sx={{ mb: 3 }}>
        <RoleInfo showDetails={true} />
      </Box>
      
      {/* Statut superuser */}
      {permissions.isSuperuser && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="h6">
            ✅ SUPERUSER DÉTECTÉ - ACCÈS TOTAL
          </Typography>
          <Typography variant="body2">
            Vous avez accès à toutes les fonctionnalités sans restrictions.
          </Typography>
        </Alert>
      )}
      
      {/* Test des permissions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test des Permissions
          </Typography>
          <Grid container spacing={2}>
            {testPermissions.map((permission) => (
              <Grid item xs={12} sm={6} md={4} key={permission}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={permission}
                    color={permissions.hasPermission(permission) ? 'success' : 'error'}
                    size="small"
                  />
                  {permissions.hasPermission(permission) ? '✅' : '❌'}
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
      
      {/* Test des composants protégés */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test des Composants Protégés
          </Typography>
          
          <SimplePermissionGuard 
            requiredPermission="user:view"
            fallback={<Alert severity="error">❌ Pas de permission user:view</Alert>}
          >
            <Alert severity="success">✅ Accès autorisé à user:view</Alert>
          </SimplePermissionGuard>
          
          <Box sx={{ mt: 2 }}>
            <SimplePermissionGuard 
              requiredPermission="user:manage"
              fallback={<Alert severity="error">❌ Pas de permission user:manage</Alert>}
            >
              <Alert severity="success">✅ Accès autorisé à user:manage</Alert>
            </SimplePermissionGuard>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <SimplePermissionGuard 
              requiredPermission="system:admin"
              fallback={<Alert severity="error">❌ Pas de permission system:admin</Alert>}
            >
              <Alert severity="success">✅ Accès autorisé à system:admin</Alert>
            </SimplePermissionGuard>
          </Box>
        </CardContent>
      </Card>
      
      {/* Informations détaillées */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Informations Détaillées
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Rôle:</strong> {user?.role}
              </Typography>
              <Typography variant="body2">
                <strong>Superuser:</strong> {permissions.isSuperuser ? 'Oui' : 'Non'}
              </Typography>
              <Typography variant="body2">
                <strong>Manager:</strong> {permissions.isManager ? 'Oui' : 'Non'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Peut voir les projets:</strong> {permissions.canViewProjects ? 'Oui' : 'Non'}
              </Typography>
              <Typography variant="body2">
                <strong>Peut gérer les projets:</strong> {permissions.canManageProjects ? 'Oui' : 'Non'}
              </Typography>
              <Typography variant="body2">
                <strong>Peut voir les utilisateurs:</strong> {permissions.canViewUsers ? 'Oui' : 'Non'}
              </Typography>
              <Typography variant="body2">
                <strong>Peut gérer les utilisateurs:</strong> {permissions.canManageUsers ? 'Oui' : 'Non'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PermissionTest;

