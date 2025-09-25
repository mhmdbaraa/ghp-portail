import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Settings,
  Close,
  Person,
  Security,
  Notifications,
  Palette,
  Language,
  Help,
  Logout,
} from '@mui/icons-material';

const SettingsDropdown = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const settingsOptions = [
    {
      id: 'profile',
      icon: <Person />,
      label: 'Profil utilisateur',
      description: 'Gérer vos informations personnelles',
      action: () => {
        console.log('Ouvrir profil utilisateur');
        handleClose();
      },
    },
    {
      id: 'security',
      icon: <Security />,
      label: 'Sécurité',
      description: 'Paramètres de sécurité et mots de passe',
      action: () => {
        console.log('Ouvrir paramètres de sécurité');
        handleClose();
      },
    },
    {
      id: 'notifications',
      icon: <Notifications />,
      label: 'Notifications',
      description: 'Configurer les préférences de notifications',
      action: () => {
        console.log('Ouvrir paramètres de notifications');
        handleClose();
      },
    },
    {
      id: 'appearance',
      icon: <Palette />,
      label: 'Apparence',
      description: 'Personnaliser l\'interface utilisateur',
      action: () => {
        console.log('Ouvrir paramètres d\'apparence');
        handleClose();
      },
    },
    {
      id: 'language',
      icon: <Language />,
      label: 'Langue',
      description: 'Changer la langue de l\'application',
      action: () => {
        console.log('Ouvrir paramètres de langue');
        handleClose();
      },
    },
    {
      id: 'help',
      icon: <Help />,
      label: 'Aide & Support',
      description: 'Documentation et support technique',
      action: () => {
        console.log('Ouvrir aide et support');
        handleClose();
      },
    },
  ];

  const handleLogout = () => {
    console.log('Déconnexion...');
    // Ici vous pouvez ajouter la logique de déconnexion
    // Par exemple : localStorage.removeItem('token'), redirection, etc.
    handleClose();
  };

  return (
    <Box>
      <Tooltip title="Paramètres">
        <IconButton
          onClick={handleClick}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
            },
          }}
        >
          <Settings />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 288,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Paramètres</Typography>
          <IconButton size="small" onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>

        <Divider />

        <Box sx={{ py: 1 }}>
          {settingsOptions.map((option) => (
            <MenuItem
              key={option.id}
              onClick={option.action}
              sx={{
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    backgroundColor: 'action.hover',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.secondary',
                  }}
                >
                  {option.icon}
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={option.label}
                secondary={option.description}
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: 500,
                }}
                secondaryTypographyProps={{
                  variant: 'caption',
                }}
              />
            </MenuItem>
          ))}
        </Box>

        <Divider />

        <Box sx={{ p: 2 }}>
          <MenuItem
            onClick={handleLogout}
            sx={{
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'error.contrastText',
              },
            }}
          >
            <ListItemIcon>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  backgroundColor: 'error.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'error.main',
                }}
              >
                <Logout />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary="Se déconnecter"
              secondary="Fermer votre session"
              primaryTypographyProps={{
                variant: 'body2',
                fontWeight: 500,
              }}
              secondaryTypographyProps={{
                variant: 'caption',
              }}
            />
          </MenuItem>
        </Box>
      </Menu>
    </Box>
  );
};

export default SettingsDropdown;
