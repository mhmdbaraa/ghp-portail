import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Avatar,
  Chip,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Person,
  Settings,
  Logout,
  AccountCircle,
  Security,
  Info,
  Notifications,
  NotificationsOff,
  Language,
  Palette,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserProfileDropdown = () => {
  const { user, logout, getSessionInfo, updateUserPreferences } = useAuth() || {};
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const safeDisplayName = (u) => {
    if (!u) return 'Utilisateur';
    const name = u.name || u.fullName || u.username || u.email || 'Utilisateur';
    return name;
  };

  const safeInitial = (u) => {
    const name = safeDisplayName(u);
    return typeof name === 'string' && name.length > 0 ? name.charAt(0).toUpperCase() : 'U';
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout && logout();
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleSettings = () => {
    handleClose();
    navigate('/settings');
  };

  const toggleNotifications = () => {
    if (user && user.preferences && updateUserPreferences) {
      updateUserPreferences({
        notifications: !user.preferences.notifications
      });
    }
  };

  const getSessionDuration = () => {
    try {
      const sessionInfo = getSessionInfo ? getSessionInfo() : null;
      if (sessionInfo) {
        const loginTime = new Date(sessionInfo.loginTime);
        const now = new Date();
        const diffMs = now - loginTime;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return diffHours > 0 ? `${diffHours}h ${diffMinutes}m` : `${diffMinutes}m`;
      }
      return 'N/A';
    } catch (error) {
      return 'N/A';
    }
  };

  if (!user) return null;

  const displayName = safeDisplayName(user);
  const initial = safeInitial(user);
  
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
      default: return role || 'Utilisateur';
    }
  };
  
  const roleLabel = getRoleLabel(user.role);

  return (
    <>
      <Tooltip title="Profil utilisateur">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#4caf50',
                  border: '2px solid white',
                }}
              />
            }
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: '0.875rem',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
              }}
            >
              {user.avatar || initial}
            </Avatar>
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 280,
            zIndex: 1250,
            '& .MuiAvatar-root': { width: 32, height: 32, ml: -0.5, mr: 1 },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        disableScrollLock={true}
      >
        {/* En-tête du profil */}
        <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              fontSize: '1.5rem',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              mx: 'auto',
              mb: 1,
            }}
          >
            {user.avatar || initial}
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            {displayName}
          </Typography>
          <Chip label={roleLabel} size="small" color="primary" variant="outlined" sx={{ fontSize: '0.75rem' }} />
        </Box>

        {/* Informations de session */}
        <Box sx={{ p: 2, background: 'rgba(0, 0, 0, 0.02)' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Informations de session
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Connecté depuis</Typography>
            <Typography variant="body2" fontWeight={600}>{getSessionDuration()}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Dernière activité</Typography>
            <Typography variant="body2" fontWeight={600}>Maintenant</Typography>
          </Box>
        </Box>

        <Divider />

        {/* Actions rapides */}
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mon profil</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>Paramètres</ListItemText>
        </MenuItem>

        {/* Préférences de notifications */}
        <MenuItem onClick={toggleNotifications}>
          <ListItemIcon>
            {user?.preferences?.notifications ? (
              <Notifications fontSize="small" />
            ) : (
              <NotificationsOff fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {user?.preferences?.notifications ? 'Désactiver' : 'Activer'} les notifications
          </ListItemText>
        </MenuItem>

        <Divider />

        {/* Informations système */}
        <Box sx={{ p: 2, background: 'rgba(0, 0, 0, 0.02)' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Informations système
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Version</Typography>
            <Typography variant="body2" fontWeight={600}>v1.0.0</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Statut</Typography>
            <Chip label="En ligne" size="small" color="success" sx={{ height: 20, fontSize: '0.7rem' }} />
          </Box>
        </Box>

        <Divider />

        {/* Déconnexion */}
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Se déconnecter</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserProfileDropdown;
