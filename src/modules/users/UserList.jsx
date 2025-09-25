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
import UserSidebar from './UserSidebar';
import UserForm from './UserForm';
import djangoApiService from '../../shared/services/djangoApiService';

const UserList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadUsers();
  }, [page, rowsPerPage, searchTerm, statusFilter, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Simuler des données pour l'instant - à remplacer par les vraies API calls
      const mockUsers = [
        {
          id: 1,
          username: 'ahmed.benali',
          email: 'ahmed.benali@ghp.com',
          first_name: 'Ahmed',
          last_name: 'Ben Ali',
          role: 'manager',
          status: 'active',
          is_staff: true,
          is_active: true,
          date_joined: '2024-01-15T10:30:00Z',
          last_login: '2024-01-20T14:22:00Z',
          department: 'IT',
          position: 'IT Manager',
          phone: '+216 12 345 678',
          avatar: null,
        },
        {
          id: 2,
          username: 'fatma.khelil',
          email: 'fatma.khelil@ghp.com',
          first_name: 'Fatma',
          last_name: 'Khelil',
          role: 'developer',
          status: 'active',
          is_staff: false,
          is_active: true,
          date_joined: '2024-01-14T09:15:00Z',
          last_login: '2024-01-20T16:45:00Z',
          department: 'Development',
          position: 'Senior Developer',
          phone: '+216 23 456 789',
          avatar: null,
        },
        {
          id: 3,
          username: 'mohamed.bara',
          email: 'mohamed.bara@ghp.com',
          first_name: 'Mohamed',
          last_name: 'Bara',
          role: 'admin',
          status: 'active',
          is_staff: true,
          is_active: true,
          date_joined: '2024-01-13T08:00:00Z',
          last_login: '2024-01-20T17:30:00Z',
          department: 'Administration',
          position: 'System Administrator',
          phone: '+216 34 567 890',
          avatar: null,
        },
        {
          id: 4,
          username: 'salma.trabelsi',
          email: 'salma.trabelsi@ghp.com',
          first_name: 'Salma',
          last_name: 'Trabelsi',
          role: 'designer',
          status: 'inactive',
          is_staff: false,
          is_active: false,
          date_joined: '2024-01-12T11:20:00Z',
          last_login: '2024-01-18T13:15:00Z',
          department: 'Design',
          position: 'UI/UX Designer',
          phone: '+216 45 678 901',
          avatar: null,
        },
        {
          id: 5,
          username: 'youssef.mansouri',
          email: 'youssef.mansouri@ghp.com',
          first_name: 'Youssef',
          last_name: 'Mansouri',
          role: 'tester',
          status: 'active',
          is_staff: false,
          is_active: true,
          date_joined: '2024-01-11T14:45:00Z',
          last_login: '2024-01-20T12:00:00Z',
          department: 'Quality Assurance',
          position: 'QA Tester',
          phone: '+216 56 789 012',
          avatar: null,
        },
      ];

      // Filtrer les utilisateurs
      let filteredUsers = mockUsers;
      
      if (searchTerm) {
        filteredUsers = filteredUsers.filter(user =>
          user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (statusFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.status === statusFilter);
      }
      
      if (roleFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
      }

      setUsers(filteredUsers);
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

  const handleEdit = () => {
    navigate(`/users/edit/${selectedUser.id}`);
    handleMenuClose();
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
      const newStatus = selectedUser.status === 'active' ? 'inactive' : 'active';
      // Ici, vous feriez l'appel API pour changer le statut
      showSnackbar(`Statut de l'utilisateur changé en ${newStatus}`, 'success');
      loadUsers();
    } catch (error) {
      showSnackbar('Erreur lors du changement de statut', 'error');
    }
    handleMenuClose();
  };

  const confirmDelete = async () => {
    try {
      // Ici, vous feriez l'appel API pour supprimer l'utilisateur
      showSnackbar('Utilisateur supprimé avec succès', 'success');
      loadUsers();
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
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <UserSidebar />

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Gestion des Utilisateurs
            </Typography>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => navigate('/users/create')}
              sx={{ borderRadius: 2 }}
            >
              Ajouter un utilisateur
            </Button>
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
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Département</TableCell>
                  <TableCell>Dernière connexion</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              background: `linear-gradient(135deg, ${getRoleColor(user.role)}, ${getRoleColor(user.role)}80)`,
                            }}
                          >
                            {user.first_name[0]}{user.last_name[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight={600} color="text.primary">
                              {user.first_name} {user.last_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getRoleLabel(user.role)}
                          size="small"
                          sx={{
                            background: `${getRoleColor(user.role)}20`,
                            color: getRoleColor(user.role),
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status === 'active' ? 'Actif' : 'Inactif'}
                          size="small"
                          sx={{
                            background: `${getStatusColor(user.status)}20`,
                            color: getStatusColor(user.status),
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.primary">
                          {user.department}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.position}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.primary">
                          {formatDate(user.last_login)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, user)}
                          size="small"
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={users.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
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

export default UserList;
