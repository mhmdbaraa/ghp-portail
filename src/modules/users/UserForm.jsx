import React, { useState, useEffect, useRef } from 'react';
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
  Alert,
  Snackbar,
  useTheme,
  Divider,
  Chip,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Save,
  Cancel,
  Person,
  Email,
  Phone,
  Business,
  Work,
  Security,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserNavigation } from './useUserNavigation';
import userService from '../../shared/services/userService';
import roleService from '../../shared/services/roleService';

const UserForm = ({ onSuccess, onCancel, onShowSuccessMessage, userId }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Utiliser le hook de navigation pour définir le menu du module seulement si ce n'est pas un modal
  const isModal = Boolean(onSuccess || onCancel);
  useUserNavigation(isModal);
  const isEdit = Boolean(id || userId);

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
    filiale: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  
  // Références pour les champs de formulaire
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  useEffect(() => {
    loadRoles();
    if (isEdit) {
      loadUser();
    } else if (isModal) {
      // Réinitialiser le formulaire pour les nouveaux utilisateurs en modal
      setFormData({
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
        filiale: '',
        password: '',
        confirmPassword: '',
      });
      setErrors({});
      
      // Vider explicitement les champs pour empêcher l'autocomplétion
      setTimeout(() => {
        if (usernameRef.current) usernameRef.current.value = '';
        if (emailRef.current) emailRef.current.value = '';
        if (passwordRef.current) passwordRef.current.value = '';
        if (confirmPasswordRef.current) confirmPasswordRef.current.value = '';
      }, 100);
    }
  }, [id, isEdit, isModal]);

  // Debug effect to log roles changes
  useEffect(() => {
    console.log('Roles state updated:', roles);
  }, [roles]);

  const loadRoles = async () => {
    try {
      setLoadingRoles(true);
      console.log('Loading roles...');
      const response = await roleService.getRoles();
      console.log('Roles response:', response);
      if (response.success) {
        console.log('Roles loaded successfully:', response.data);
        setRoles(response.data || []);
      } else {
        console.log('API failed, using fallback roles');
        // Fallback to hardcoded roles if API fails
        const fallbackRoles = [
          { id: 1, name: 'admin', description: 'Administrator' },
          { id: 2, name: 'manager', description: 'Manager' },
          { id: 3, name: 'developer', description: 'Developer' },
          { id: 4, name: 'designer', description: 'Designer' },
          { id: 5, name: 'tester', description: 'Tester' },
          { id: 6, name: 'user', description: 'User' },
          { id: 7, name: 'PROJECT_MANAGER', description: 'Project Manager' },
          { id: 8, name: 'PROJECT_USER', description: 'Project User' }
        ];
        setRoles(fallbackRoles);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      console.log('Using fallback roles due to error');
      // Fallback to hardcoded roles if API fails
      const fallbackRoles = [
        { id: 1, name: 'admin', description: 'Administrator' },
        { id: 2, name: 'manager', description: 'Manager' },
        { id: 3, name: 'developer', description: 'Developer' },
        { id: 4, name: 'designer', description: 'Designer' },
        { id: 5, name: 'tester', description: 'Tester' },
        { id: 6, name: 'user', description: 'User' },
        { id: 7, name: 'PROJECT_MANAGER', description: 'Project Manager' },
        { id: 8, name: 'PROJECT_USER', description: 'Project User' }
      ];
      setRoles(fallbackRoles);
    } finally {
      setLoadingRoles(false);
    }
  };

  const loadUser = async () => {
    try {
      setLoading(true);
      const userIdToLoad = id || userId; // Utiliser id (URL) ou userId (modal)
      const result = await userService.getUser(userIdToLoad);
      if (result.success) {
        setFormData(result.data);
      } else {
        showSnackbar(result.message || 'Erreur lors du chargement de l\'utilisateur', 'error');
      }
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

    // Empêcher les clics multiples
    if (submitLoading) {
      return;
    }

    try {
      setSubmitLoading(true);
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
        department: formData.department || '',
        position: formData.position || '',
        phone: formData.phone || '',
        filiale: formData.filiale || '',
        location: '', // Add missing field
        preferences: {} // Add missing field
      };

      console.log('Sending user data:', userData);

      if (!isEdit && formData.password) {
        userData.password = formData.password;
      }

      // Appel API pour créer/modifier l'utilisateur
      const userIdToUpdate = id || userId; // Utiliser id (URL) ou userId (modal)
      const result = isEdit 
        ? await userService.updateUser(userIdToUpdate, userData)
        : await userService.createUser(userData);

      if (result.success) {
        // Si onSuccess est fourni (modal), fermer immédiatement
        if (onSuccess) {
          onSuccess(); // Fermer le modal immédiatement
          // Afficher le message de succès via la fonction parent ou localement
          const successMessage = isEdit ? 'Utilisateur modifié avec succès' : 'Utilisateur créé avec succès';
          if (onShowSuccessMessage) {
            onShowSuccessMessage(successMessage);
          } else {
            setTimeout(() => {
              showSnackbar(successMessage, 'success');
            }, 100);
          }
        } else {
          // Pour les pages normales, afficher le message puis naviguer
          showSnackbar(
            isEdit ? 'Utilisateur modifié avec succès' : 'Utilisateur créé avec succès',
            'success'
          );
          setTimeout(() => {
            navigate('/users/list');
          }, 1500);
        }
      } else {
        console.error('Update failed:', result);
        const errorMessage = result.error?.errors ? 
          Object.values(result.error.errors).flat().join(', ') : 
          result.message || 'Erreur lors de la sauvegarde';
        showSnackbar(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      showSnackbar('Erreur lors de la sauvegarde', 'error');
    } finally {
      setLoading(false);
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    // Si onCancel est fourni (modal), l'utiliser, sinon naviguer
    if (onCancel) {
      onCancel();
    } else {
      navigate('/users/list');
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
      case 'user': return 'Utilisateur';
      case 'PROJECT_MANAGER': return 'Gestionnaire de Module';
      case 'PROJECT_USER': return 'Utilisateur de Projet';
      default: return role;
    }
  };


  return (
    <Box sx={{ p: { xs: 1, sm: 1.5 } }}>

               <form onSubmit={handleSubmit} autoComplete="off">
          {/* Progress bar pour le chargement */}
          {submitLoading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress 
                sx={{
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: theme.palette.primary.main,
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                {isEdit ? 'Modification en cours...' : 'Création en cours...'}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ position: 'relative' }}>
            {/* Overlay pour désactiver le formulaire pendant le chargement */}
            {submitLoading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(0, 0, 0, 0.7)' 
                    : 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(2px)',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress 
                    size={40} 
                    sx={{
                      color: theme.palette.primary.main,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {isEdit ? 'Modification en cours...' : 'Création en cours...'}
                  </Typography>
                </Box>
              </Box>
            )}
            
            <Grid container spacing={{ xs: 1, sm: 2 }}>
            {/* Form Fields - Full Width */}
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
                <CardContent sx={{ p: { xs: 1, sm: 1.5 } }}>
                  {/* Personal Information */}
                  <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                    <Typography variant="subtitle2" fontWeight={500} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem' }}>
                      <Person sx={{ fontSize: '1rem' }} />
                      Informations personnelles
                    </Typography>
                    <Grid container spacing={{ xs: 1, sm: 1.5 }}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
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
                          size="small"
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
                                     size="small"
                                     label="Nom d'utilisateur"
                                     value={formData.username}
                                     onChange={handleChange('username')}
                                     error={Boolean(errors.username)}
                                     helperText={errors.username}
                                     required
                                     autoComplete="new-username"
                                     inputRef={usernameRef}
                                     inputProps={{
                                       autoComplete: "new-username",
                                       form: {
                                         autoComplete: "off"
                                       }
                                     }}
                                   />
                                 </Grid>
                                 <Grid item xs={12} sm={6}>
                                   <TextField
                                     fullWidth
                                     size="small"
                                     label="Email"
                                     type="email"
                                     value={formData.email}
                                     onChange={handleChange('email')}
                                     error={Boolean(errors.email)}
                                     helperText={errors.email}
                                     required
                                     autoComplete="new-email"
                                     inputRef={emailRef}
                                     inputProps={{
                                       autoComplete: "new-email",
                                       form: {
                                         autoComplete: "off"
                                       }
                                     }}
                                     InputProps={{
                                       startAdornment: <Email sx={{ mr: 1, color: 'text.secondary', fontSize: '1rem' }} />,
                                     }}
                                   />
                                 </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: { xs: 1, sm: 1.5 } }} />

                  {/* Professional Information */}
                  <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                    <Typography variant="subtitle2" fontWeight={500} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem' }}>
                      <Work sx={{ fontSize: '1rem' }} />
                      Informations professionnelles
                    </Typography>
                    <Grid container spacing={{ xs: 1, sm: 1.5 }}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Rôle</InputLabel>
                          <Select
                            value={formData.role}
                            label="Rôle"
                            onChange={handleChange('role')}
                            disabled={loadingRoles}
                          >
                            {loadingRoles ? (
                              <MenuItem disabled>
                                <CircularProgress size={16} sx={{ mr: 1 }} />
                                Chargement des rôles...
                              </MenuItem>
                            ) : (
                              roles.length > 0 ? (
                                roles.map((role) => (
                                  <MenuItem key={role.id} value={role.name}>
                                    {getRoleLabel(role.name)}
                                  </MenuItem>
                                ))
                              ) : (
                                <MenuItem disabled>
                                  Aucun rôle disponible
                                </MenuItem>
                              )
                            )}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Statut</InputLabel>
                          <Select
                            value={formData.status}
                            label="Statut"
                            onChange={handleChange('status')}
                          >
                            <MenuItem value="active">Actif</MenuItem>
                            <MenuItem value="inactive">Inactif</MenuItem>
                            <MenuItem value="suspended">Suspendu</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Département"
                          value={formData.department}
                          onChange={handleChange('department')}
                          InputProps={{
                            startAdornment: <Business sx={{ mr: 1, color: 'text.secondary', fontSize: '1rem' }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Filiale</InputLabel>
                          <Select
                            value={formData.filiale}
                            onChange={handleChange('filiale')}
                            label="Filiale"
                          >
                            <MenuItem value="GH MED">GH MED</MenuItem>
                            <MenuItem value="DEF MED">DEF MED</MenuItem>
                            <MenuItem value="ABC MED">ABC MED</MenuItem>
                            <MenuItem value="MED IJK">MED IJK</MenuItem>
                            <MenuItem value="HPC">HPC</MenuItem>
                            <MenuItem value="HP">HP</MenuItem>
                            <MenuItem value="AT IMP">AT IMP</MenuItem>
                            <MenuItem value="AT PROD">AT PROD</MenuItem>
                            <MenuItem value="CEGEDIS">CEGEDIS</MenuItem>
                            <MenuItem value="MDP">MDP</MenuItem>
                            <MenuItem value="DG">DG</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Poste"
                          value={formData.position}
                          onChange={handleChange('position')}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Téléphone"
                          value={formData.phone}
                          onChange={handleChange('phone')}
                          InputProps={{
                            startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary', fontSize: '1rem' }} />,
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: { xs: 1, sm: 1.5 } }} />

                  {/* Permissions */}
                  <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                    <Typography variant="subtitle2" fontWeight={500} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem' }}>
                      <Security sx={{ fontSize: '1rem' }} />
                      Permissions
                    </Typography>
                    <Grid container spacing={{ xs: 1, sm: 1.5 }}>
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
                    <Divider sx={{ my: { xs: 1, sm: 1.5 } }} />
                    <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                      <Typography variant="subtitle2" fontWeight={500} sx={{ mb: 1, fontSize: '0.875rem' }}>
                        Mot de passe
                      </Typography>
                      <Grid container spacing={{ xs: 1, sm: 1.5 }}>
                                     <Grid item xs={12} sm={6}>
                                       <TextField
                                         fullWidth
                                         size="small"
                                         label="Mot de passe"
                                         type="password"
                                         value={formData.password}
                                         onChange={handleChange('password')}
                                         error={Boolean(errors.password)}
                                         helperText={errors.password}
                                         required
                                         autoComplete="new-password"
                                         inputRef={passwordRef}
                                         inputProps={{
                                           autoComplete: "new-password",
                                           form: {
                                             autoComplete: "off"
                                           }
                                         }}
                                       />
                                     </Grid>
                                     <Grid item xs={12} sm={6}>
                                       <TextField
                                         fullWidth
                                         size="small"
                                         label="Confirmer le mot de passe"
                                         type="password"
                                         value={formData.confirmPassword}
                                         onChange={handleChange('confirmPassword')}
                                         error={Boolean(errors.confirmPassword)}
                                         helperText={errors.confirmPassword}
                                         required
                                         autoComplete="new-password"
                                         inputRef={confirmPasswordRef}
                                         inputProps={{
                                           autoComplete: "new-password",
                                           form: {
                                             autoComplete: "off"
                                           }
                                         }}
                                       />
                                     </Grid>
                        </Grid>
                      </Box>
                    </>
                  )}

                  {/* Action Buttons */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: { xs: 1, sm: 1.5 }, 
                    justifyContent: { xs: 'center', sm: 'flex-end' },
                    flexDirection: { xs: 'column', sm: 'row' },
                    mt: { xs: 1.5, sm: 0 }
                  }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleCancel}
                      disabled={submitLoading}
                      sx={{ borderRadius: 2, px: 2 }}
                    >
                      <Cancel sx={{ mr: 0.5, fontSize: '1rem' }} />
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      size="small"
                      disabled={submitLoading || loading}
                      sx={{ borderRadius: 2, minWidth: 100, px: 2 }}
                    >
                      {submitLoading ? (
                        <>
                          <CircularProgress 
                            size={14} 
                            sx={{ 
                              mr: 0.5,
                              color: theme.palette.mode === 'dark' ? 'white' : 'white'
                            }} 
                          />
                          {isEdit ? 'Modification...' : 'Création...'}
                        </>
                      ) : (
                        <>
                          <Save sx={{ mr: 0.5, fontSize: '1rem' }} />
                          {isEdit ? 'Modifier' : 'Créer'}
                        </>
                      )}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            </Grid>
          </Box>
        </form>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ 
              width: '100%',
              backgroundColor: theme.palette.mode === 'dark' 
                ? theme.palette.grey[800] 
                : theme.palette.background.paper,
              color: theme.palette.text.primary,
              '& .MuiAlert-icon': {
                color: snackbar.severity === 'success' 
                  ? theme.palette.success.main 
                  : theme.palette.error.main
              }
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
    </Box>
  );
};

export default UserForm;
