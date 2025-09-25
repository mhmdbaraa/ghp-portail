import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  useTheme,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Search,
  Add,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Block,
  CheckCircle,
  FilterList,
  Refresh,
  PersonAdd,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUserNavigation } from './useUserNavigation';
import UserForm from './UserForm';
import userService from '../../shared/services/userService';

const UserList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Utiliser le hook de navigation pour définir le menu du module
  useUserNavigation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [modalKey, setModalKey] = useState(0);

  useEffect(() => {
    loadUsers();
  }, [page, rowsPerPage, searchTerm, statusFilter, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: page + 1, // Django pagination starts from 1
        pageSize: rowsPerPage,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined
      };

      const result = await userService.getUsers(params);
      
      if (result.success) {
        setUsers(result.data.results || result.data);
        setTotalUsers(result.data.count || result.data.length);
      } else {
        console.error('Error loading users:', result.error);
        showSnackbar(result.message || 'Erreur lors du chargement des utilisateurs', 'error');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      showSnackbar('Erreur lors du chargement des utilisateurs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditUserModalOpen(true);
    setModalKey(prev => prev + 1); // Force re-render
    handleMenuClose();
  };

  const handleEdit = () => {
    handleEditUser(selectedUser);
  };

  const handleView = () => {
    navigate(`/users/profile/${selectedUser.id}`);
    handleMenuClose();
  };

  const handleDelete = () => {
    setUserToDelete(selectedUser);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleToggleStatus = async () => {
    try {
      const result = await userService.toggleUserStatus(selectedUser.id);
      if (result.success) {
        showSnackbar('Statut de l\'utilisateur modifié avec succès', 'success');
        loadUsers();
      } else {
        showSnackbar(result.message || 'Erreur lors du changement de statut', 'error');
      }
    } catch (error) {
      showSnackbar('Erreur lors du changement de statut', 'error');
    }
    handleMenuClose();
  };

  const confirmDelete = async () => {
    try {
      const result = await userService.deleteUser(userToDelete.id);
      if (result.success) {
        showSnackbar('Utilisateur supprimé avec succès', 'success');
        loadUsers();
      } else {
        showSnackbar(result.message || 'Erreur lors de la suppression', 'error');
      }
    } catch (error) {
      showSnackbar('Erreur lors de la suppression', 'error');
    }
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#ef4444';
      case 'manager': return '#6366f1';
      case 'developer': return '#10b981';
      case 'designer': return '#f59e0b';
      case 'tester': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'manager': return 'Manager';
      case 'developer': return 'Développeur';
      case 'designer': return 'Designer';
      case 'tester': return 'Testeur';
      default: return role;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Gestion des Utilisateurs
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => {
                  setAddUserModalOpen(true);
                  setModalKey(prev => prev + 1); // Incrémenter la clé pour forcer la réinitialisation
                }}
                sx={{ borderRadius: 2 }}
              >
                Ajouter un utilisateur
              </Button>
            </Box>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Gérez tous les utilisateurs de votre organisation
          </Typography>
        </Box>

        {/* Filters */}
        <Card
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
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Statut</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Statut"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">Tous les statuts</MenuItem>
                    <MenuItem value="active">Actif</MenuItem>
                    <MenuItem value="inactive">Inactif</MenuItem>
                    <MenuItem value="pending">En attente</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Rôle</InputLabel>
                  <Select
                    value={roleFilter}
                    label="Rôle"
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <MenuItem value="all">Tous les rôles</MenuItem>
                    <MenuItem value="admin">Administrateur</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                    <MenuItem value="developer">Développeur</MenuItem>
                    <MenuItem value="designer">Designer</MenuItem>
                    <MenuItem value="tester">Testeur</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={loadUsers}
                  fullWidth
                  sx={{ borderRadius: 2 }}
                >
                  Actualiser
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Users Table */}
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
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ py: 1.5, fontWeight: 600 }}>Utilisateur</TableCell>
                  <TableCell sx={{ py: 1.5, fontWeight: 600 }}>Rôle</TableCell>
                  <TableCell sx={{ py: 1.5, fontWeight: 600 }}>Statut</TableCell>
                  <TableCell sx={{ py: 1.5, fontWeight: 600 }}>Département</TableCell>
                  <TableCell sx={{ py: 1.5, fontWeight: 600 }}>Dernière connexion</TableCell>
                  <TableCell align="center" sx={{ py: 1.5, fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user.id} hover sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                      <TableCell sx={{ py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: '0.75rem',
                              background: `linear-gradient(135deg, ${getRoleColor(user.role)}, ${getRoleColor(user.role)}80)`,
                            }}
                          >
                            {user.first_name[0]}{user.last_name[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2 }}>
                              {user.first_name} {user.last_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Chip
                          label={getRoleLabel(user.role)}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            background: `${getRoleColor(user.role)}20`,
                            color: getRoleColor(user.role),
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Chip
                          label={user.status === 'active' ? 'Actif' : 'Inactif'}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            background: `${getStatusColor(user.status)}20`,
                            color: getStatusColor(user.status),
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Typography variant="caption" color="text.primary" sx={{ lineHeight: 1.2, display: 'block' }}>
                          {user.department}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, display: 'block' }}>
                          {user.position}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Typography variant="caption" color="text.primary" sx={{ lineHeight: 1.2 }}>
                          {formatDate(user.last_login)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1 }}>
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, user)}
                          size="small"
                          title="Actions"
                          sx={{ p: 0.5 }}
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalUsers}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              '& .MuiTablePagination-toolbar': {
                minHeight: 44,
                paddingLeft: 2,
                paddingRight: 2,
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontSize: '0.875rem',
              },
            }}
          />
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleView}>
            <Visibility sx={{ mr: 1 }} />
            Voir le profil
          </MenuItem>
          <MenuItem onClick={handleEdit}>
            <Edit sx={{ mr: 1 }} />
            Modifier
          </MenuItem>
          <MenuItem onClick={handleToggleStatus}>
            {selectedUser?.status === 'active' ? (
              <>
                <Block sx={{ mr: 1 }} />
                Désactiver
              </>
            ) : (
              <>
                <CheckCircle sx={{ mr: 1 }} />
                Activer
              </>
            )}
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} />
            Supprimer
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
              <strong>{userToDelete?.first_name} {userToDelete?.last_name}</strong> ?
              Cette action est irréversible.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add User Modal */}
        <Dialog 
          open={addUserModalOpen} 
          onClose={() => setAddUserModalOpen(false)}
          maxWidth="sm"
          fullWidth
          fullScreen={{ xs: true, sm: false }}
          sx={{
            '& .MuiDialog-paper': {
              margin: { xs: 0, sm: 1.5 },
              maxHeight: { xs: '100vh', sm: '85vh' },
              maxWidth: { xs: '100%', sm: '600px' }
            }
          }}
        >
          <DialogTitle sx={{ 
            fontSize: { xs: '1rem', sm: '1.1rem' },
            p: { xs: 1, sm: 1.5 },
            fontWeight: 500
          }}>
            Ajouter un nouvel utilisateur
          </DialogTitle>
          <DialogContent sx={{ p: { xs: 1, sm: 1.5 } }}>
            <UserForm 
              key={modalKey} // Clé unique pour forcer la réinitialisation
              onSuccess={() => {
                setAddUserModalOpen(false);
                loadUsers();
              }}
              onCancel={() => setAddUserModalOpen(false)}
              onShowSuccessMessage={(message) => {
                setSnackbar({
                  open: true,
                  message: message,
                  severity: 'success'
                });
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Modal d'édition */}
        <Dialog
          open={editUserModalOpen}
          onClose={() => setEditUserModalOpen(false)}
          maxWidth="md"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              margin: { xs: 0, sm: 1.5 },
              maxHeight: { xs: '100vh', sm: '85vh' },
              maxWidth: { xs: '100%', sm: '600px' }
            }
          }}
        >
          <DialogTitle sx={{ 
            fontSize: { xs: '1rem', sm: '1.1rem' },
            p: { xs: 1, sm: 1.5 },
            fontWeight: 500
          }}>
            Modifier l'utilisateur
          </DialogTitle>
          <DialogContent sx={{ p: { xs: 1, sm: 1.5 } }}>
            <UserForm 
              key={`edit-${modalKey}`} // Clé unique pour forcer la réinitialisation du modal
              userId={editingUser?.id} // Passer l'ID de l'utilisateur à éditer
              onSuccess={() => {
                setEditUserModalOpen(false);
                setEditingUser(null);
                loadUsers();
              }}
              onCancel={() => {
                setEditUserModalOpen(false);
                setEditingUser(null);
              }}
              onShowSuccessMessage={(message) => {
                setSnackbar({
                  open: true,
                  message: message,
                  severity: 'success'
                });
              }}
            />
          </DialogContent>
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
  );
};

export default UserList;
