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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
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
import { useUserNavigation } from './useUserNavigation';
import permissionService from '../../shared/services/permissionService';

const PermissionManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Utiliser le hook de navigation pour définir le menu du module
  useUserNavigation();
  const [permissions, setPermissions] = useState([]);
  const [permissionsByCategory, setPermissionsByCategory] = useState({});
  const [categories, setCategories] = useState([]);
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
  const [activeTab, setActiveTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPermission, setDeletingPermission] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      
      // Load all permissions first
      const result = await permissionService.getPermissions();
      console.log('All permissions result:', result); // Debug log
      
      if (result.success) {
        const allPermissions = result.data.results || result.data || [];
        setPermissions(allPermissions);
        
        // Group permissions by category
        const groupedPermissions = {};
        const categoryList = [];
        
        allPermissions.forEach(permission => {
          const category = permission.category;
          if (!groupedPermissions[category]) {
            groupedPermissions[category] = {
              name: getCategoryLabel(category),
              permissions: []
            };
            categoryList.push({
              value: category,
              label: getCategoryLabel(category)
            });
          }
          groupedPermissions[category].permissions.push(permission);
        });
        
        setPermissionsByCategory(groupedPermissions);
        setCategories(categoryList);
      } else {
        console.error('Error loading permissions:', result.error);
        showSnackbar(result.message || 'Erreur lors du chargement des permissions', 'error');
      }
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
      let result;
      if (editingPermission) {
        result = await permissionService.updatePermission(editingPermission.id, permissionForm);
      } else {
        result = await permissionService.createPermission(permissionForm);
      }
      
      if (result.success) {
        showSnackbar(
          editingPermission ? 'Permission modifiée avec succès' : 'Permission créée avec succès', 
          'success'
        );
        setDialogOpen(false);
        setEditingPermission(null);
        setPermissionForm({
          name: '',
          codename: '',
          description: '',
          category: '',
        });
        loadPermissions();
      } else {
        showSnackbar(result.message || 'Erreur lors de la sauvegarde', 'error');
      }
    } catch (error) {
      console.error('Error saving permission:', error);
      showSnackbar('Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleDeletePermission = (permission) => {
    setDeletingPermission(permission);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePermission = async () => {
    if (!deletingPermission) return;
    
    try {
      setDeleting(true);
      const result = await permissionService.deletePermission(deletingPermission.id);
      if (result.success) {
        showSnackbar('Permission supprimée avec succès', 'success');
        loadPermissions();
        setDeleteDialogOpen(false);
        setDeletingPermission(null);
      } else {
        showSnackbar(result.message || 'Erreur lors de la suppression', 'error');
      }
    } catch (error) {
      showSnackbar('Erreur lors de la suppression', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePermission = async (permission) => {
    try {
      const result = await permissionService.togglePermissionStatus(permission.id);
      if (result.success) {
        showSnackbar(`Permission ${permission.is_active ? 'désactivée' : 'activée'}`, 'success');
        loadPermissions();
      } else {
        showSnackbar(result.message || 'Erreur lors de la modification', 'error');
      }
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const getCurrentPermissions = () => {
    if (selectedCategory === 'all') {
      return permissions || [];
    }
    return permissionsByCategory[selectedCategory]?.permissions || [];
  };

  const getCurrentCategoryName = () => {
    if (selectedCategory === 'all') {
      return 'Toutes les permissions';
    }
    return permissionsByCategory[selectedCategory]?.name || selectedCategory || 'Catégorie inconnue';
  };

  return (
    <Box sx={{ p: 3 }}>
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

        {/* Category Selector */}
        <Card sx={{ mb: 3, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Filtrer par catégorie :
            </Typography>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Catégorie</InputLabel>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Catégorie"
              >
                <MenuItem value="all">Toutes les catégories</MenuItem>
                {(categories || []).map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Card>

        {/* Permissions Display */}
        <Card
          sx={{
            background: theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))'
              : 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(30,41,59,0.7))',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              {getCurrentCategoryName()} ({getCurrentPermissions().length || 0} permissions)
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nom</TableCell>
                      <TableCell>Code</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Catégorie</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(getCurrentPermissions() || []).map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Shield sx={{ color: getCategoryColor(permission.category), fontSize: 20 }} />
                            <Typography variant="body1" fontWeight={600}>
                              {permission.name || 'Permission sans nom'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={permission.codename || 'N/A'}
                            size="small"
                            sx={{
                              background: `${getCategoryColor(permission.category)}20`,
                              color: getCategoryColor(permission.category),
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {permission.description || 'Aucune description'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getCategoryLabel(permission.category)}
                            size="small"
                            sx={{
                              background: `${getCategoryColor(permission.category)}20`,
                              color: getCategoryColor(permission.category),
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={permission.is_active || false}
                                onChange={() => handleTogglePermission(permission)}
                                color="primary"
                              />
                            }
                            label={permission.is_active ? 'Actif' : 'Inactif'}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleEditPermission(permission)}
                              sx={{ color: 'primary.main' }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeletePermission(permission)}
                              sx={{ color: 'error.main' }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Card>

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
                <FormControl fullWidth required>
                  <InputLabel>Catégorie</InputLabel>
                  <Select
                    value={permissionForm.category}
                    onChange={(e) => setPermissionForm({ ...permissionForm, category: e.target.value })}
                    label="Catégorie"
                  >
                    <MenuItem value="users">Utilisateurs</MenuItem>
                    <MenuItem value="projects">Projets</MenuItem>
                    <MenuItem value="tasks">Tâches</MenuItem>
                    <MenuItem value="teams">Équipes</MenuItem>
                    <MenuItem value="reports">Rapports</MenuItem>
                    <MenuItem value="settings">Paramètres</MenuItem>
                  </Select>
                </FormControl>
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
              Êtes-vous sûr de vouloir supprimer la permission{' '}
              <strong>"{deletingPermission?.name}"</strong> ?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Cette action est irréversible et peut affecter les rôles qui utilisent cette permission.
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
              onClick={confirmDeletePermission}
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

export default PermissionManagement;
