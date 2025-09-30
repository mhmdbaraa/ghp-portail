import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Lock as LockIcon, AdminPanelSettings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NoProjectAccess = ({ userRole }) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '70vh',
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 5,
          maxWidth: 600,
          textAlign: 'center',
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(254, 226, 226, 0.5) 0%, rgba(255, 237, 213, 0.5) 100%)',
        }}
      >
        <LockIcon
          sx={{
            fontSize: 80,
            color: 'error.main',
            mb: 2,
          }}
        />
        
        <Typography variant="h4" fontWeight={700} gutterBottom color="error.main">
          Accès Refusé
        </Typography>
        
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Vous n'avez pas accès au module Projets
        </Typography>
        
        <Box
          sx={{
            backgroundColor: 'background.paper',
            borderRadius: 2,
            p: 3,
            mb: 3,
          }}
        >
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Pour accéder aux projets, vous devez avoir l'un des rôles suivants :
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'primary.main',
              }}
            >
              <AdminPanelSettings color="primary" />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="subtitle1" fontWeight={600} color="primary.main">
                  PROJECT_MANAGER
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Accès complet : créer, modifier, supprimer des projets et tâches
                </Typography>
              </Box>
            </Box>
            
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'success.main',
              }}
            >
              <AdminPanelSettings color="success" />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="subtitle1" fontWeight={600} color="success.main">
                  PROJECT_USER
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Accès lecture seule : consulter les projets et tâches
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        
        {userRole && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Votre rôle actuel : <strong>{userRole || 'Aucun rôle'}</strong>
          </Typography>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Veuillez contacter votre administrateur système pour obtenir les permissions nécessaires.
        </Typography>
        
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Retour à l'Accueil
        </Button>
      </Paper>
    </Box>
  );
};

export default NoProjectAccess;
