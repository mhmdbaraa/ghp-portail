import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Grid,
  Chip,
  Divider,
  IconButton,
  useTheme,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Edit,
  Email,
  Phone,
  Business,
  Work,
  CalendarToday,
  Security,
  Person,
  LocationOn,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserNavigation } from './useUserNavigation';
import djangoApiService from '../../shared/services/djangoApiService';

const UserProfile = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Utiliser le hook de navigation pour définir le menu du module
  useUserNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      
      // Simuler le chargement d'un utilisateur - à remplacer par l'API
      const mockUser = {
        id: parseInt(id),
        username: 'ahmed.benali',
        email: 'ahmed.benali@ghp.com',
        first_name: 'Ahmed',
        last_name: 'Ben Ali',
        role: 'manager',
        status: 'active',
        is_staff: true,
        is_active: true,
        department: 'IT',
        position: 'IT Manager',
        phone: '+216 12 345 678',
        location: 'Tunis, Tunisie',
        date_joined: '2024-01-15T10:30:00Z',
        last_login: '2024-01-20T14:22:00Z',
        avatar: null,
        permissions: [
          'view_user',
          'add_user',
          'change_user',
          'view_project',
          'add_project',
          'change_project',
          'view_task',
          'add_task',
          'change_task',
        ],
      };

      setUser(mockUser);
    } catch (error) {
      console.error('Error loading user:', error);
      showSnackbar('Erreur lors du chargement du profil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <Typography>Chargement...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <Alert severity="error">Utilisateur non trouvé</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Profil Utilisateur
            </Typography>
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => navigate(`/users/edit/${user.id}`)}
              sx={{ borderRadius: 2 }}
            >
              Modifier le profil
            </Button>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Informations détaillées de l'utilisateur
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Profile Card */}
          <Grid item xs={12} md={4}>
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
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    background: `linear-gradient(135deg, ${getRoleColor(user.role)}, ${getRoleColor(user.role)}80)`,
                    fontSize: '2.5rem',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  {user.first_name[0]}{user.last_name[0]}
                </Avatar>
                
                <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
                  {user.first_name} {user.last_name}
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  @{user.username}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                  <Chip
                    label={getRoleLabel(user.role)}
                    sx={{
                      background: `${getRoleColor(user.role)}20`,
                      color: getRoleColor(user.role),
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    label={user.status === 'active' ? 'Actif' : 'Inactif'}
                    sx={{
                      background: `${getStatusColor(user.status)}20`,
                      color: getStatusColor(user.status),
                      fontWeight: 600,
                    }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Email color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={user.email}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Phone color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Téléphone"
                      secondary={user.phone}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Business color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Département"
                      secondary={user.department}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Work color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Poste"
                      secondary={user.position}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Details */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {/* Account Information */}
              <Grid item xs={12}>
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
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person />
                      Informations du compte
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Nom d'utilisateur
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color="text.primary">
                          {user.username}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Statut du compte
                        </Typography>
                        <Chip
                          label={user.is_active ? 'Actif' : 'Inactif'}
                          size="small"
                          sx={{
                            background: `${getStatusColor(user.is_active ? 'active' : 'inactive')}20`,
                            color: getStatusColor(user.is_active ? 'active' : 'inactive'),
                            fontWeight: 600,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Date d'inscription
                        </Typography>
                        <Typography variant="body1" color="text.primary">
                          {formatDate(user.date_joined)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Dernière connexion
                        </Typography>
                        <Typography variant="body1" color="text.primary">
                          {formatDate(user.last_login)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Permissions */}
              <Grid item xs={12}>
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
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Security />
                      Permissions ({user.permissions.length})
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {user.permissions.map((permission, index) => (
                        <Chip
                          key={index}
                          label={permission}
                          size="small"
                          sx={{
                            background: theme.palette.primary.main + '20',
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

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

export default UserProfile;
