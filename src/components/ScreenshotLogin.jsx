
import React from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Container } from '@mui/material';
import { Lock, Person } from '@mui/icons-material';

const ScreenshotLogin = () => {
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <Container maxWidth="sm">
        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: '#333',
                mb: 1
              }}>
                Connexion
              </Typography>
              <Typography variant="body1" sx={{ color: '#666' }}>
                Accédez à votre espace de travail
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Nom d'utilisateur"
                variant="outlined"
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: '#666' }} />
                }}
                sx={{ mb: 2 }}
                defaultValue="mohamed.bara"
              />
              
              <TextField
                fullWidth
                label="Mot de passe"
                type="password"
                variant="outlined"
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: '#666' }} />
                }}
                defaultValue="••••••••"
              />
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #2196F3, #21CBF3)',
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: '0 8px 24px rgba(33, 150, 243, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1976D2, #1E88E5)',
                  boxShadow: '0 12px 32px rgba(33, 150, 243, 0.4)'
                }
              }}
            >
              Se connecter
            </Button>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Mot de passe oublié ? 
                <Button variant="text" sx={{ textTransform: 'none', ml: 1 }}>
                  Cliquez ici
                </Button>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ScreenshotLogin;
