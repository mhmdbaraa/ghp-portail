import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Business,
  Shield,
  Group,
  TrendingUp,
  ArrowForward,
  Google,
  Person,
  CheckCircle,
} from '@mui/icons-material';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptNewsletter: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Effacer les messages quand l'utilisateur tape
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      throw new Error('Veuillez remplir tous les champs obligatoires');
    }

    if (!formData.email.includes('@')) {
      throw new Error('Veuillez entrer une adresse email valide');
    }

    if (formData.password.length < 8) {
      throw new Error('Le mot de passe doit contenir au moins 8 caractères');
    }

    if (formData.password !== formData.confirmPassword) {
      throw new Error('Les mots de passe ne correspondent pas');
    }

    if (!formData.acceptTerms) {
      throw new Error('Veuillez accepter les conditions d\'utilisation');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validation du formulaire
      validateForm();

      // Simulation d'une API d'inscription
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Inscription réussie
      console.log('Inscription réussie:', formData);
      setSuccess('Compte créé avec succès ! Redirection en cours...');
      
      // Stocker les informations utilisateur (simulation)
      localStorage.setItem('user', JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        company: formData.company,
        role: 'Project Manager',
      }));

      // Redirection vers le dashboard après 2 secondes
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    {
      icon: <Business sx={{ fontSize: 24, color: 'primary.main' }} />,
      title: 'Gestion de Projets Avancée',
      description: 'Planifiez, suivez et gérez vos projets avec des outils professionnels',
    },
    {
      icon: <Group sx={{ fontSize: 24, color: 'success.main' }} />,
      title: 'Collaboration d\'Équipe',
      description: 'Travaillez efficacement avec votre équipe en temps réel',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 24, color: 'secondary.main' }} />,
      title: 'Analytics et Rapports',
      description: 'Analysez vos performances avec des tableaux de bord détaillés',
    },
    {
      icon: <Shield sx={{ fontSize: 24, color: 'warning.main' }} />,
      title: 'Sécurité Enterprise',
      description: 'Vos données sont protégées par des standards de sécurité élevés',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Section d'inscription */}
      <Container maxWidth="md" sx={{ display: 'flex', alignItems: 'center', py: 4 }}>
        <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto' }}>
          {/* Logo et titre */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 2,
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
              }}
            >
              <Business sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              Créer un compte
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Rejoignez ProjectTracker et gérez vos projets avec excellence
            </Typography>
          </Box>

          {/* Formulaire d'inscription */}
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 3,
            }}
          >
            <form onSubmit={handleSubmit}>
              {/* Prénom et Nom */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Prénom *"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Votre prénom"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom *"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Votre nom"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {/* Email */}
              <TextField
                fullWidth
                label="Adresse email *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="votre@email.com"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              {/* Entreprise */}
              <TextField
                fullWidth
                label="Entreprise"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="Nom de votre entreprise"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              {/* Mot de passe */}
              <TextField
                fullWidth
                label="Mot de passe *"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
                Minimum 8 caractères
              </Typography>

              {/* Confirmation du mot de passe */}
              <TextField
                fullWidth
                label="Confirmer le mot de passe *"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              {/* Options */}
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      color="primary"
                      required
                    />
                  }
                  label={
                    <Typography variant="body2">
                      J'accepte les{' '}
                      <Link to="/terms" style={{ color: 'inherit', textDecoration: 'underline' }}>
                        conditions d'utilisation
                      </Link>{' '}
                      et la{' '}
                      <Link to="/privacy" style={{ color: 'inherit', textDecoration: 'underline' }}>
                        politique de confidentialité
                      </Link> *
                    </Typography>
                  }
                  sx={{ mb: 2 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="acceptNewsletter"
                      checked={formData.acceptNewsletter}
                      onChange={handleInputChange}
                      color="primary"
                    />
                  }
                  label="J'accepte de recevoir des newsletters et des mises à jour (optionnel)"
                />
              </Box>

              {/* Messages d'erreur et de succès */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}
                </Alert>
              )}

              {/* Bouton d'inscription */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                size="large"
                sx={{
                  py: 1.5,
                  mb: 3,
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                  },
                }}
              >
                {isLoading ? 'Création du compte...' : (
                  <>
                    Créer mon compte
                    <ArrowForward sx={{ ml: 1 }} />
                  </>
                )}
              </Button>
            </form>

            {/* Séparateur */}
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                ou
              </Typography>
            </Divider>

            {/* Inscription avec Google */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<Google />}
              sx={{
                py: 1.5,
                mb: 3,
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                },
              }}
            >
              Continuer avec Google
            </Button>

            {/* Lien de connexion */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Déjà un compte ?{' '}
                <Button
                  component={Link}
                  to="/login"
                  color="primary"
                  sx={{ textDecoration: 'none' }}
                >
                  Se connecter
                </Button>
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>

      {/* Section des avantages */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          flex: 1,
          background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
          alignItems: 'center',
          justifyContent: 'center',
          p: 6,
        }}
      >
        <Box sx={{ maxWidth: 500, color: 'white' }}>
          <Typography variant="h2" fontWeight={700} gutterBottom>
            Commencez votre succès
          </Typography>
          <Typography variant="h6" sx={{ mb: 6, opacity: 0.9 }}>
            Rejoignez des milliers de professionnels qui utilisent ProjectTracker pour transformer leur gestion de projets.
          </Typography>

          <Grid container spacing={3} sx={{ mb: 6 }}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} key={benefit.title}>
                <Card
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {benefit.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {benefit.title}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {benefit.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Statistiques */}
          <Grid container spacing={4}>
            <Grid item xs={6} sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700}>
                30 jours
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Essai gratuit
              </Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700}>
                24/7
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Support client
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;
