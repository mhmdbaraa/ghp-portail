import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Avatar,
  IconButton,
  Alert,
  Snackbar,
  useTheme,
  Divider,
  Chip,
} from '@mui/material';
import {
  Save,
  Cancel,
  PhotoCamera,
  Person,
  Email,
  Phone,
  Business,
  Work,
  Security,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import UserSidebar from './UserSidebar';
import djangoApiService from '../../shared/services/djangoApiService';

const UserForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'user',
    status: 'active',
    is_staff: false,
    is_active: true,
    department: '',
    position: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (isEdit) {
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
      };
      setFormData(mockUser);
    } catch (error) {
      console.error('Error loading user:', error);
      showSnackbar('Erreur lors du chargement de l\'utilisateur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Le prénom est requis';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Le nom est requis';
    }

    if (!isEdit && !formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    }

    if (!isEdit && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const userData = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        status: formData.status,
        is_staff: formData.is_staff,
        is_active: formData.is_active,
        department: formData.department,
        position: formData.position,
        phone: formData.phone,
      };

      if (!isEdit && formData.password) {
        userData.password = formData.password;
      }

      // Ici, vous feriez l'appel API pour créer/modifier l'utilisateur
      // const response = isEdit 
      //   ? await djangoApiService.updateUser(id, userData)
      //   : await djangoApiService.createUser(userData);

      showSnackbar(
        isEdit ? 'Utilisateur modifié avec succès' : 'Utilisateur créé avec succès',
        'success'
      );
      
      setTimeout(() => {
        navigate('/users/list');
      }, 1500);
    } catch (error) {
      console.error('Error saving user:', error);
      showSnackbar('Erreur lors de la sauvegarde', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/users/list');
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
      case 'user': return 'Utilisateur';
      default: return role;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <UserSidebar />

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
            {isEdit ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isEdit 
              ? 'Modifiez les informations de l\'utilisateur' 
              : 'Remplissez les informations pour créer un nouveau compte utilisateur'
            }
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Avatar Section */}
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
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                    Photo de profil
                  </Typography>
                  <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        background: `linear-gradient(135deg, ${getRoleColor(formData.role)}, ${getRoleColor(formData.role)}80)`,
                        fontSize: '2rem',
                        mb: 2,
                      }}
                    >
                      {formData.first_name[0]}{formData.last_name[0]}
                    </Avatar>
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        background: theme.palette.primary.main,
                        color: 'white',
                        '&:hover': {
                          background: theme.palette.primary.dark,
                        },
                      }}
                    >
                      <PhotoCamera />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Cliquez pour changer la photo
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Form Fields */}
            <Grid item xs={12} md={8}>
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
                  {/* Personal Information */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person />
                      Informations personnelles
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Prénom"
                          value={formData.first_name}
                          onChange={handleChange('first_name')}
                          error={Boolean(errors.first_name)}
                          helperText={errors.first_name}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Nom"
                          value={formData.last_name}
                          onChange={handleChange('last_name')}
                          error={Boolean(errors.last_name)}
                          helperText={errors.last_name}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Nom d'utilisateur"
                          value={formData.username}
                          onChange={handleChange('username')}
                          error={Boolean(errors.username)}
                          helperText={errors.username}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange('email')}
                          error={Boolean(errors.email)}
                          helperText={errors.email}
                          required
                          InputProps={{
                            startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Professional Information */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Work />
                      Informations professionnelles
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Rôle</InputLabel>
                          <Select
                            value={formData.role}
                            label="Rôle"
                            onChange={handleChange('role')}
                          >
                            <MenuItem value="user">Utilisateur</MenuItem>
                            <MenuItem value="admin">Administrateur</MenuItem>
                            <MenuItem value="manager">Manager</MenuItem>
                            <MenuItem value="developer">Développeur</MenuItem>
                            <MenuItem value="designer">Designer</MenuItem>
                            <MenuItem value="tester">Testeur</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Statut</InputLabel>
                          <Select
                            value={formData.status}
                            label="Statut"
                            onChange={handleChange('status')}
                          >
                            <MenuItem value="active">Actif</MenuItem>
                            <MenuItem value="inactive">Inactif</MenuItem>
                            <MenuItem value="pending">En attente</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Département"
                          value={formData.department}
                          onChange={handleChange('department')}
                          InputProps={{
                            startAdornment: <Business sx={{ mr: 1, color: 'text.secondary' }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Poste"
                          value={formData.position}
                          onChange={handleChange('position')}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Téléphone"
                          value={formData.phone}
                          onChange={handleChange('phone')}
                          InputProps={{
                            startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Permissions */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Security />
                      Permissions
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.is_staff}
                              onChange={handleChange('is_staff')}
                            />
                          }
                          label="Accès administrateur"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.is_active}
                              onChange={handleChange('is_active')}
                            />
                          }
                          label="Compte actif"
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Password Section (only for new users) */}
                  {!isEdit && (
                    <>
                      <Divider sx={{ my: 3 }} />
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                          Mot de passe
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Mot de passe"
                              type="password"
                              value={formData.password}
                              onChange={handleChange('password')}
                              error={Boolean(errors.password)}
                              helperText={errors.password}
                              required
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Confirmer le mot de passe"
                              type="password"
                              value={formData.confirmPassword}
                              onChange={handleChange('confirmPassword')}
                              error={Boolean(errors.confirmPassword)}
                              helperText={errors.confirmPassword}
                              required
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </>
                  )}

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      sx={{ borderRadius: 2 }}
                    >
                      <Cancel sx={{ mr: 1 }} />
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      sx={{ borderRadius: 2 }}
                    >
                      <Save sx={{ mr: 1 }} />
                      {loading ? 'Sauvegarde...' : (isEdit ? 'Modifier' : 'Créer')}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </form>

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

export default UserForm;
