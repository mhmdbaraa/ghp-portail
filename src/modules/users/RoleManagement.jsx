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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  CircularProgress,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Security,
  People,
  Save,
  Cancel,
  Refresh,
  Visibility,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUserNavigation } from './useUserNavigation';
import roleService from '../../shared/services/roleService';
import permissionService from '../../shared/services/permissionService';

const RoleManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Utiliser le hook de navigation pour définir le menu du module
  useUserNavigation();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [],
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingRole, setDeletingRole] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      
      const result = await roleService.getRoles();
      if (result.success) {
        setRoles(result.data.results || result.data);
      } else {
        console.error('Error loading roles:', result.error);
        showSnackbar(result.message || 'Erreur lors du chargement des rôles', 'error');
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      showSnackbar('Erreur lors du chargement des rôles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const result = await permissionService.getPermissions();
      if (result.success) {
        setPermissions(result.data.results || result.data);
      } else {
        console.error('Error loading permissions:', result.error);
        showSnackbar(result.message || 'Erreur lors du chargement des permissions', 'error');
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      showSnackbar('Erreur lors du chargement des permissions', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setRoleForm({
      name: '',
      description: '',
      permissions: [],
    });
    setDialogOpen(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description,
      permissions: role.permissions.map(p => typeof p === 'object' ? p.id : p),
    });
    setDialogOpen(true);
  };

  const handleSaveRole = async () => {
    try {
      // Transform permissions array to permission_ids for backend
      const roleData = {
        ...roleForm,
        permission_ids: roleForm.permissions,
        permissions: undefined // Remove permissions field
      };
      
      let result;
      if (editingRole) {
        result = await roleService.updateRole(editingRole.id, roleData);
      } else {
        result = await roleService.createRole(roleData);
      }
      
      if (result.success) {
        showSnackbar(
          editingRole ? 'Rôle modifié avec succès' : 'Rôle créé avec succès', 
          'success'
        );
        setDialogOpen(false);
        setEditingRole(null);
        setRoleForm({
          name: '',
          description: '',
          permissions: [],
        });
        loadRoles();
      } else {
        showSnackbar(result.message || 'Erreur lors de la sauvegarde', 'error');
      }
    } catch (error) {
      console.error('Error saving role:', error);
      showSnackbar('Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleDeleteRole = (role) => {
    setDeletingRole(role);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteRole = async () => {
    if (!deletingRole) return;
    
    try {
      setDeleting(true);
      const result = await roleService.deleteRole(deletingRole.id);
      if (result.success) {
        showSnackbar('Rôle supprimé avec succès', 'success');
        loadRoles();
        setDeleteDialogOpen(false);
        setDeletingRole(null);
      } else {
        showSnackbar(result.message || 'Erreur lors de la suppression', 'error');
      }
    } catch (error) {
      showSnackbar('Erreur lors de la suppression', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handlePermissionToggle = (permissionId) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const getRoleColor = (roleName) => {
    switch (roleName.toLowerCase()) {
      case 'administrateur': return '#ef4444';
      case 'manager': return '#6366f1';
      case 'développeur': return '#10b981';
      case 'designer': return '#f59e0b';
      case 'testeur': return '#8b5cf6';
      default: return '#6b7280';
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

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Gestion des Rôles
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadRoles}
                sx={{ borderRadius: 2 }}
              >
                Actualiser
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateRole}
                sx={{ borderRadius: 2 }}
              >
                Ajouter un rôle
              </Button>
            </Box>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Gérez les rôles utilisateur et leurs permissions associées
          </Typography>
        </Box>

        {/* Roles Grid */}
        <Grid container spacing={3}>
          {roles.map((role) => (
            <Grid item xs={12} md={6} lg={4} key={role.id}>
              <Card
                sx={{
                  height: '100%',
                  background: theme.palette.mode === 'light'
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))'
                    : 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(30,41,59,0.7))',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 32px ${getRoleColor(role.name)}20`,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Security sx={{ color: getRoleColor(role.name), fontSize: 32 }} />
                      <Box>
                        <Typography variant="h6" fontWeight={700} color="text.primary">
                          {role.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {role.user_count} utilisateur{role.user_count > 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleEditRole(role)}
                        sx={{ mr: 1 }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteRole(role)}
                        sx={{ color: 'error.main' }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {role.description}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
                      Permissions ({role.permissions.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {role.permissions.slice(0, 3).map((permissionId) => {
                        const permission = permissions.find(p => p.id === permissionId);
                        return permission ? (
                          <Chip
                            key={permissionId}
                            label={permission.codename}
                            size="small"
                            sx={{
                              background: `${getCategoryColor(permission.category)}20`,
                              color: getCategoryColor(permission.category),
                              fontSize: '0.7rem',
                            }}
                          />
                        ) : null;
                      })}
                      {role.permissions.length > 3 && (
                        <Chip
                          label={`+${role.permissions.length - 3} autres`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Visibility />}
                    fullWidth
                    onClick={() => handleEditRole(role)}
                    sx={{ borderRadius: 2 }}
                  >
                    Voir les détails
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Create/Edit Role Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingRole ? 'Modifier le rôle' : 'Créer un nouveau rôle'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom du rôle"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Description"
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Permissions
                </Typography>
                {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                  <Card key={category} sx={{ mb: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: getCategoryColor(category) }}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Typography>
                      <List dense>
                        {categoryPermissions.map((permission) => (
                          <ListItem key={permission.id} sx={{ py: 0.5 }}>
                            <ListItemText
                              primary={permission.name}
                              secondary={permission.codename}
                            />
                            <ListItemSecondaryAction>
                              <Checkbox
                                checked={roleForm.permissions.includes(permission.id)}
                                onChange={() => handlePermissionToggle(permission.id)}
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                ))}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              <Cancel sx={{ mr: 1 }} />
              Annuler
            </Button>
            <Button onClick={handleSaveRole} variant="contained">
              <Save sx={{ mr: 1 }} />
              {editingRole ? 'Modifier' : 'Créer'}
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

        {/* Confirmation Dialog for Delete */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => !deleting && setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Delete color="error" />
              <Typography variant="h6" fontWeight={600}>
                Confirmer la suppression
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" color="text.secondary">
              Êtes-vous sûr de vouloir supprimer le rôle{' '}
              <strong>"{deletingRole?.name}"</strong> ?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Cette action est irréversible et peut affecter les utilisateurs qui ont ce rôle.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button 
              onClick={() => setDeleteDialogOpen(false)} 
              disabled={deleting}
              sx={{ mr: 1 }}
            >
              Annuler
            </Button>
            <Button
              onClick={confirmDeleteRole}
              variant="contained"
              color="error"
              disabled={deleting}
              startIcon={deleting ? <CircularProgress size={16} /> : <Delete />}
            >
              {deleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogActions>
        </Dialog>
    </Box>
  );
};

export default RoleManagement;
