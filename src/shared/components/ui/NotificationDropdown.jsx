import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Button,
  Chip,
  Paper,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Notifications,
  Close,
  CheckCircle,
  Warning,
  Info,
  Error,
} from '@mui/icons-material';

const NotificationDropdown = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'success',
      title: 'Projet terminé',
      message: 'Site E-commerce livré au client',
      time: '5 min',
      read: false,
    },
    {
      id: '2',
      type: 'warning',
      title: 'Échéance proche',
      message: 'Design UI/UX expire dans 2 jours',
      time: '1h',
      read: false,
    },
    {
      id: '3',
      type: 'info',
      title: 'Nouveau membre',
      message: 'Sarah rejoint l\'équipe Mobile',
      time: '3h',
      read: true,
    },
    {
      id: '4',
      type: 'error',
      title: 'Build échoué',
      message: 'API Backend - vérification requise',
      time: '30 min',
      read: false,
    },
  ]);

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'error':
        return <Error color="error" />;
      default:
        return <Info color="info" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Box>
      <Tooltip title="Notifications">
        <IconButton
          onClick={handleClick}
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': {
              color: theme.palette.primary.main,
            },
          }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <Notifications />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            minWidth: 300,
            maxHeight: 500,
            mt: 1,
            background: theme.palette.mode === 'light' 
              ? 'rgba(255, 255, 255, 0.95)' 
              : 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.palette.mode === 'light'
              ? '0 20px 60px rgba(0, 0, 0, 0.15)'
              : '0 20px 60px rgba(0, 0, 0, 0.4)',
            zIndex: 1250, // Z-index entre le header (1200) et la sidebar (1300)
            overflow: 'hidden', // Empêche le scroll sur le conteneur principal
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        disableScrollLock={true}
      >
        <Box sx={{ 
          p: 2, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: theme.palette.mode === 'light'
            ? 'rgba(99, 102, 241, 0.05)'
            : 'rgba(99, 102, 241, 0.1)',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography component="div" variant="h6" sx={{ color: theme.palette.text.primary }}>
              Notifications
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                size="small" 
                onClick={markAllAsRead}
                sx={{
                  color: theme.palette.primary.main,
                  borderColor: theme.palette.primary.main,
                  '&:hover': {
                    background: theme.palette.mode === 'light'
                      ? 'rgba(99, 102, 241, 0.1)'
                      : 'rgba(99, 102, 241, 0.2)',
                  },
                }}
                variant="outlined"
              >
                Tout marquer comme lu
              </Button>
              <IconButton 
                size="small" 
                onClick={handleClose}
                sx={{
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    background: theme.palette.mode === 'light'
                      ? 'rgba(99, 102, 241, 0.1)'
                      : 'rgba(99, 102, 241, 0.2)',
                  },
                }}
              >
                <Close />
              </IconButton>
            </Box>
          </Box>
        </Box>

        <Divider />

        <Box sx={{ 
          maxHeight: 350, 
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.mode === 'light' 
              ? 'rgba(0, 0, 0, 0.2)' 
              : 'rgba(255, 255, 255, 0.2)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: theme.palette.mode === 'light' 
              ? 'rgba(0, 0, 0, 0.3)' 
              : 'rgba(255, 255, 255, 0.3)',
          },
        }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography color={theme.palette.text.secondary}>
                Aucune notification
              </Typography>
            </Box>
          ) : (
            notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                sx={{
                  p: 1.2,
                  borderLeft: 3,
                  borderColor: `${getTypeColor(notification.type)}.main`,
                  backgroundColor: notification.read 
                    ? 'transparent' 
                    : theme.palette.mode === 'light'
                      ? 'rgba(99, 102, 241, 0.05)'
                      : 'rgba(99, 102, 241, 0.1)',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'light'
                      ? 'rgba(99, 102, 241, 0.1)'
                      : 'rgba(99, 102, 241, 0.2)',
                  },
                }}
              >
                <ListItemIcon>
                  {getIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography 
                      component="div"
                      variant="subtitle2" 
                      sx={{ 
                        color: theme.palette.text.primary,
                        fontWeight: 600,
                      }}
                    >
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography 
                        component="div"
                        variant="body2" 
                        sx={{ 
                          mb: 0.5,
                          color: theme.palette.text.secondary,
                          lineHeight: 1.3,
                          fontSize: '0.85rem',
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography 
                          component="div"
                          variant="caption" 
                          sx={{ 
                            color: theme.palette.text.secondary,
                            fontSize: '0.7rem',
                          }}
                        >
                          {notification.time}
                        </Typography>
                        {!notification.read && (
                          <Button
                            size="small"
                            onClick={() => markAsRead(notification.id)}
                            sx={{ 
                              minWidth: 'auto',
                              color: theme.palette.primary.main,
                              fontSize: '0.7rem',
                              py: 0.25,
                              px: 1,
                              '&:hover': {
                                background: theme.palette.mode === 'light'
                                  ? 'rgba(99, 102, 241, 0.1)'
                                  : 'rgba(99, 102, 241, 0.2)',
                              },
                            }}
                          >
                            Marquer comme lu
                          </Button>
                        )}
                      </Box>
                    </Box>
                  }
                />
              </MenuItem>
            ))
          )}
        </Box>

        <Divider />

        <Box sx={{ 
          p: 2, 
          borderTop: `1px solid ${theme.palette.divider}`,
          background: theme.palette.mode === 'light'
            ? 'rgba(99, 102, 241, 0.02)'
            : 'rgba(99, 102, 241, 0.05)',
        }}>
          <Button 
            fullWidth 
            variant="text" 
            color="primary"
            sx={{
              '&:hover': {
                background: theme.palette.mode === 'light'
                  ? 'rgba(99, 102, 241, 0.1)'
                  : 'rgba(99, 102, 241, 0.2)',
              },
            }}
          >
            Voir toutes les notifications
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default NotificationDropdown;
