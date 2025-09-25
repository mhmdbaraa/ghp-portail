import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  FormControlLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  useTheme,
  Paper,
  Divider,
  Switch,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Security,
  Shield,
  Key,
  Save,
  Cancel,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import UserSidebar from './UserSidebar';
import djangoApiService from '../../shared/services/djangoApiService';

const PermissionManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [permissionForm, setPermissionForm] = useState({
    name: '',
    codename: '',
    description: '',
    category: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      
      // Simuler des permissions - à remplacer par l'API Django
      const mockPermissions = [
        {
          id: 1,
          name: 'Can view user',
          codename: 'view_user',
          description: 'Peut voir les informations des utilisateurs',
          category: 'users',
          is_active: true,
        },
        {
          id: 2,
          name: 'Can add user',
          codename: 'add_user',
          description: 'Peut ajouter de nouveaux utilisateurs',
          category: 'users',
          is_active: true,
        },
        {
          id: 3,
          name: 'Can change user',
          codename: 'change_user',
          description: 'Peut modifier les informations des utilisateurs',
          category: 'users',
          is_active: true,
        },
        {
          id: 4,
          name: 'Can delete user',
          codename: 'delete_user',
          description: 'Peut supprimer des utilisateurs',
          category: 'users',
          is_active: true,
        },
        {
          id: 5,
          name: 'Can view project',
          codename: 'view_project',
          description: 'Peut voir les projets',
          category: 'projects',
          is_active: true,
        },
        {
          id: 6,
          name: 'Can add project',
          codename: 'add_project',
          description: 'Peut créer de nouveaux projets',
          category: 'projects',
          is_active: true,
        },
        {
          id: 7,
          name: 'Can change project',
          codename: 'change_project',
          description: 'Peut modifier les projets',
          category: 'projects',
          is_active: true,
        },
        {
          id: 8,
          name: 'Can delete project',
          codename: 'delete_project',
          description: 'Peut supprimer des projets',
          category: 'projects',
          is_active: true,
        },
        {
          id: 9,
          name: 'Can view task',
          codename: 'view_task',
          description: 'Peut voir les tâches',
          category: 'tasks',
          is_active: true,
        },
        {
          id: 10,
          name: 'Can add task',
          codename: 'add_task',
          description: 'Peut créer de nouvelles tâches',
          category: 'tasks',
          is_active: true,
        },
        {
          id: 11,
          name: 'Can change task',
          codename: 'change_task',
          description: 'Peut modifier les tâches',
          category: 'tasks',
          is_active: true,
        },
        {
          id: 12,
          name: 'Can delete task',
          codename: 'delete_task',
          description: 'Peut supprimer des tâches',
          category: 'tasks',
          is_active: true,
        },
      ];

      setPermissions(mockPermissions);
    } catch (error) {
      console.error('Error loading permissions:', error);
      showSnackbar('Erreur lors du chargement des permissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreatePermission = () => {
    setEditingPermission(null);
    setPermissionForm({
      name: '',
      codename: '',
      description: '',
      category: '',
    });
    setDialogOpen(true);
  };

  const handleEditPermission = (permission) => {
    setEditingPermission(permission);
    setPermissionForm({
      name: permission.name,
      codename: permission.codename,
      description: permission.description,
      category: permission.category,
    });
    setDialogOpen(true);
  };

  const handleSavePermission = async () => {
    try {
      // Ici, vous feriez l'appel API pour sauvegarder la permission
      if (editingPermission) {
        showSnackbar('Permission modifiée avec succès', 'success');
      } else {
        showSnackbar('Permission créée avec succès', 'success');
      }
      setDialogOpen(false);
      loadPermissions();
    } catch (error) {
      showSnackbar('Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleDeletePermission = async (permission) => {
    try {
      // Ici, vous feriez l'appel API pour supprimer la permission
      showSnackbar('Permission supprimée avec succès', 'success');
      loadPermissions();
    } catch (error) {
      showSnackbar('Erreur lors de la suppression', 'error');
    }
  };

  const handleTogglePermission = async (permission) => {
    try {
      // Ici, vous feriez l'appel API pour activer/désactiver la permission
      showSnackbar(`Permission ${permission.is_active ? 'désactivée' : 'activée'}`, 'success');
      loadPermissions();
    } catch (error) {
      showSnackbar('Erreur lors de la modification', 'error');
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'users': return '#6366f1';
      case 'projects': return '#10b981';
      case 'tasks': return '#f59e0b';
      case 'system': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'users': return 'Utilisateurs';
      case 'projects': return 'Projets';
      case 'tasks': return 'Tâches';
      case 'system': return 'Système';
      default: return category;
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <UserSidebar />

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Gestion des Permissions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadPermissions}
                sx={{ borderRadius: 2 }}
              >
                Actualiser
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreatePermission}
                sx={{ borderRadius: 2 }}
              >
                Ajouter une permission
              </Button>
            </Box>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Gérez les permissions système et contrôlez l'accès aux fonctionnalités
          </Typography>
        </Box>

        {/* Permissions by Category */}
        {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
          <Card
            key={category}
            sx={{
              mb: 3,
              background: theme.palette.mode === 'light'
                ? 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))'
                : 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(30,41,59,0.7))',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Shield sx={{ color: getCategoryColor(category), mr: 2 }} />
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  {getCategoryLabel(category)}
                </Typography>
                <Chip
                  label={categoryPermissions.length}
                  size="small"
                  sx={{
                    ml: 2,
                    background: `${getCategoryColor(category)}20`,
                    color: getCategoryColor(category),
                    fontWeight: 600,
                  }}
                />
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Permission</TableCell>
                      <TableCell>Code</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="center">Statut</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categoryPermissions.map((permission) => (
                      <TableRow key={permission.id} hover>
                        <TableCell>
                          <Typography variant="body1" fontWeight={600} color="text.primary">
                            {permission.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                            {permission.codename}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {permission.description}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <FormControlLabel
                            control={
                              <Switch
                                checked={permission.is_active}
                                onChange={() => handleTogglePermission(permission)}
                                size="small"
                              />
                            }
                            label={permission.is_active ? 'Actif' : 'Inactif'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleEditPermission(permission)}
                            sx={{ mr: 1 }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeletePermission(permission)}
                            sx={{ color: 'error.main' }}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        ))}

        {/* Create/Edit Permission Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingPermission ? 'Modifier la permission' : 'Créer une nouvelle permission'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom de la permission"
                  value={permissionForm.name}
                  onChange={(e) => setPermissionForm({ ...permissionForm, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Code de la permission"
                  value={permissionForm.codename}
                  onChange={(e) => setPermissionForm({ ...permissionForm, codename: e.target.value })}
                  required
                  helperText="Ex: view_user, add_project"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={permissionForm.description}
                  onChange={(e) => setPermissionForm({ ...permissionForm, description: e.target.value })}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Catégorie"
                  value={permissionForm.category}
                  onChange={(e) => setPermissionForm({ ...permissionForm, category: e.target.value })}
                  required
                  helperText="Ex: users, projects, tasks, system"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              <Cancel sx={{ mr: 1 }} />
              Annuler
            </Button>
            <Button onClick={handleSavePermission} variant="contained">
              <Save sx={{ mr: 1 }} />
              {editingPermission ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default PermissionManagement;
