import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  useTheme,
  FormControlLabel,
  Checkbox,
  FormHelperText,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Login as LoginIcon,
  Business,
  Security,
  Speed,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login, isLoading, getStoredPreferences } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Charger uniquement l'option "Se souvenir de moi" sans pré-remplir les champs
  React.useEffect(() => {
    const savedPreferences = getStoredPreferences();
    if (savedPreferences) {
      setRememberMe(savedPreferences.rememberMe || false);
    }
  }, [getStoredPreferences]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const result = await login(formData.username, formData.password, rememberMe);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Box sx={{ display: 'flex', gap: 4, maxWidth: 1200, width: '100%' }}>
        {/* Section de présentation */}
        <Box sx={{ flex: 1, display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'center', color: 'white' }}>
          <Typography variant="h3" fontWeight={800} sx={{ mb: 3 }}>
            GHP Portail
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Plateforme d'entreprise nouvelle génération
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Business sx={{ fontSize: 32, color: 'rgba(255,255,255,0.8)' }} />
              <Typography variant="h6">Modules intégrés complets</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Security sx={{ fontSize: 32, color: 'rgba(255,255,255,0.8)' }} />
              <Typography variant="h6">Sécurité et permissions avancées</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Speed sx={{ fontSize: 32, color: 'rgba(255,255,255,0.8)' }} />
              <Typography variant="h6">Interface rapide et intuitive</Typography>
            </Box>
          </Box>
        </Box>

        {/* Formulaire de connexion */}
        <Paper
          elevation={24}
          sx={{
            p: 4,
            width: { xs: '100%', md: 400 },
            borderRadius: 3,
            background: theme.palette.mode === 'dark'
              ? 'rgba(30, 41, 59, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 25px 50px rgba(0, 0, 0, 0.5)'
              : '0 25px 50px rgba(0, 0, 0, 0.15)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #818cf8, #f472b6)'
                  : 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 8px 25px rgba(129, 140, 248, 0.4)'
                  : '0 8px 25px rgba(102, 126, 234, 0.4)',
              }}
            >
              <LoginIcon sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 1, color: theme.palette.text.primary }}>
              Connexion
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Accédez à votre espace de travail
            </Typography>
          </Box>

          <form onSubmit={handleSubmit} autoComplete="off">
            <TextField
              fullWidth
              name="username"
              label="Utilisateur"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="off"
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              name="password"
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Option "Se souvenir de moi" */}
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                  />
                }
                label="Se souvenir de moi"
              />
              <FormHelperText sx={{ ml: 4, color: 'text.secondary' }}>
                Restez connecté pendant 30 jours
              </FormHelperText>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting || isLoading}
              sx={{
                py: 1.5,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #818cf8, #f472b6)'
                  : 'linear-gradient(135deg, #667eea, #764ba2)',
                '&:hover': {
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #a5b4fc, #f9a8d4)'
                    : 'linear-gradient(135deg, #5a6fd8, #6a4190)',
                  transform: 'translateY(-1px)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 8px 25px rgba(129, 140, 248, 0.4)'
                    : '0 8px 25px rgba(102, 126, 234, 0.4)',
                },
                transition: 'all 0.2s ease',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 4px 15px rgba(129, 140, 248, 0.3)'
                  : '0 4px 15px rgba(102, 126, 234, 0.3)',
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Pas encore de compte ?{' '}
              <Link 
                to="/register" 
                style={{ 
                  color: theme.palette.primary.main, 
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Créer un compte
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;
