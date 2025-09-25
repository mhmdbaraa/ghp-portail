import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Grow,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Folder,
  Assignment,
  CalendarToday,
  Close,
  Notifications,
  Person,
  TrendingUp,
  AutoAwesome,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import ThemeToggle from './ui/ThemeToggle';
import NotificationDropdown from './ui/NotificationDropdown';
import UserProfileDropdown from './ui/UserProfileDropdown';

import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Collapsed par défaut
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();
  const drawerWidth = 240; // Largeur réduite de 300px à 240px
  const collapsedWidth = 72; // Largeur en mode collapsed

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigationItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: <Dashboard />
    },
    { 
      path: '/projects', 
      label: 'Projets', 
      icon: <Folder />
    },
    { 
      path: '/tasks', 
      label: 'Tâches', 
      icon: <Assignment />
    },
    { 
      path: '/calendar', 
      label: 'Calendrier', 
      icon: <CalendarToday />
    },
  ];

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleSidebarToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleSidebarMouseEnter = () => {
    if (sidebarCollapsed && !isMobile) {
      setSidebarHovered(true);
    }
  };

  const handleSidebarMouseLeave = () => {
    if (sidebarCollapsed && !isMobile) {
      setSidebarHovered(false);
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Calculer la largeur effective (collapsed + hover)
  const effectiveWidth = sidebarCollapsed && !sidebarHovered ? collapsedWidth : drawerWidth;
  const isEffectivelyExpanded = !sidebarCollapsed || sidebarHovered;

  const sidebarContent = (
    <Box sx={{ 
      width: effectiveWidth, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: theme.palette.mode === 'light' 
        ? 'linear-gradient(180deg, rgba(99, 102, 241, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)'
        : 'linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
      backdropFilter: 'blur(20px)',
      borderRight: `1px solid ${theme.palette.divider}`,
      position: 'relative',
      overflow: 'hidden',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      {/* Effet de fond animé */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.mode === 'light'
            ? 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.05) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)',
          zIndex: 0,
        }}
      />
      
      {/* Logo et titre */}
      <Box sx={{ 
        p: isEffectivelyExpanded ? 3 : 2, 
        borderBottom: `1px solid ${theme.palette.divider}`,
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mb: isEffectivelyExpanded ? 2 : 0,
        }}>
          <Box
            component={Link}
            to="/"
            sx={{
              width: isEffectivelyExpanded ? 40 : 32,
              height: isEffectivelyExpanded ? 40 : 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: isEffectivelyExpanded ? 2 : 0,
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              }
            }}
          >
            <AutoAwesome sx={{ color: 'white', fontSize: isEffectivelyExpanded ? 20 : 16 }} />
          </Box>
          {isEffectivelyExpanded && (
            <Typography 
              variant="h5" 
              fontWeight={800}
              sx={{ 
                background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8,
                }
              }}
              component={Link}
              to="/"
            >
              GHP Portail
            </Typography>
          )}
        </Box>

        {/* Bouton toggle collapse (desktop seulement) */}
        {!isMobile && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            mt: isEffectivelyExpanded ? 2 : 1,
          }}>
            <IconButton
              onClick={handleSidebarToggleCollapse}
              size="small"
              sx={{
                background: theme.palette.mode === 'light'
                  ? 'rgba(99, 102, 241, 0.1)'
                  : 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${theme.palette.divider}`,
                color: theme.palette.text.primary,
                '&:hover': {
                  background: theme.palette.mode === 'light'
                    ? 'rgba(99, 102, 241, 0.2)'
                    : 'rgba(255,255,255,0.2)',
                },
              }}
            >
              {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Navigation */}
      <List sx={{ py: 2, flex: 1, position: 'relative', zIndex: 1 }}>
        {navigationItems.map((item, index) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 1, px: isEffectivelyExpanded ? 2 : 1 }}>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={isActiveRoute(item.path)}
              onClick={isMobile ? handleSidebarClose : undefined}
              sx={{
                borderRadius: 3,
                height: 52,
                justifyContent: isEffectivelyExpanded ? 'flex-start' : 'center',
                px: isEffectivelyExpanded ? 2 : 1,
                background: isActiveRoute(item.path) 
                  ? theme.palette.mode === 'light'
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1))'
                    : 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2))'
                  : 'transparent',
                border: isActiveRoute(item.path) 
                  ? `1px solid ${theme.palette.primary.main}`
                  : '1px solid transparent',
                backdropFilter: isActiveRoute(item.path) ? 'blur(10px)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: `fadeInLeft 0.6s ease-out ${index * 0.1}s both`,
                '&:hover': {
                  background: isActiveRoute(item.path)
                    ? theme.palette.mode === 'light'
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(236, 72, 153, 0.15))'
                      : 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(236, 72, 153, 0.3))'
                    : theme.palette.mode === 'light'
                      ? 'rgba(99, 102, 241, 0.05)'
                      : 'rgba(255,255,255,0.05)',
                  transform: isEffectivelyExpanded ? 'translateX(8px)' : 'scale(1.05)',
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-selected': {
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                  '& .MuiListItemText-primary': {
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: isEffectivelyExpanded ? 40 : 'auto',
                  color: isActiveRoute(item.path) ? theme.palette.primary.main : theme.palette.text.secondary,
                  transition: 'all 0.3s ease',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {isEffectivelyExpanded && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActiveRoute(item.path) ? 700 : 600,
                    fontSize: '0.9rem',
                    color: isActiveRoute(item.path) ? theme.palette.primary.main : theme.palette.text.primary,
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: theme.palette.background.default 
    }}>
      {/* Sidebar pour desktop */}
      {!isMobile && (
        <Fade in={mounted} timeout={800}>
          <Box
            component="nav"
            onMouseEnter={handleSidebarMouseEnter}
            onMouseLeave={handleSidebarMouseLeave}
            sx={{
              width: effectiveWidth,
              flexShrink: 0,
              position: 'fixed',
              height: '100vh',
              zIndex: 1300, // Z-index le plus élevé pour la sidebar
              left: 0,
              top: 0,
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {sidebarContent}
          </Box>
        </Fade>
      )}

      {/* Sidebar mobile */}
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={handleSidebarClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
          },
        }}
      >
        <Slide direction="left" in={sidebarOpen} timeout={300}>
          <Box>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              p: 2,
              position: 'absolute',
              top: 0,
              right: 0,
              zIndex: 2,
            }}>
              <IconButton 
                onClick={handleSidebarClose} 
                size="small"
                sx={{
                  background: theme.palette.mode === 'light'
                    ? 'rgba(99, 102, 241, 0.1)'
                    : 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${theme.palette.divider}`,
                  color: theme.palette.text.primary,
                  '&:hover': {
                    background: theme.palette.mode === 'light'
                      ? 'rgba(99, 102, 241, 0.2)'
                      : 'rgba(255,255,255,0.2)',
                  },
                }}
              >
                <Close />
              </IconButton>
            </Box>
            {sidebarContent}
          </Box>
        </Slide>
      </Drawer>

      {/* Contenu principal */}
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        ml: { lg: `${effectiveWidth}px` },
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        height: '100vh',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: theme.palette.mode === 'light'
              ? 'rgba(255,255,255,0.8)'
              : 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${theme.palette.divider}`,
            color: theme.palette.text.primary,
            zIndex: 1200, // Z-index entre la sidebar (1300) et les menus (1200)
          }}
        >
          <Toolbar sx={{ minHeight: 72, px: 4 }}>
            {/* Bouton menu mobile */}
            <IconButton
              color="inherit"
              aria-label="ouvrir le menu"
              edge="start"
              onClick={handleSidebarToggle}
              sx={{ 
                mr: 3, 
                display: { lg: 'none' },
                color: theme.palette.text.primary,
                background: theme.palette.mode === 'light'
                  ? 'rgba(99, 102, 241, 0.1)'
                  : 'rgba(99, 102, 241, 0.2)',
                '&:hover': {
                  background: theme.palette.mode === 'light'
                    ? 'rgba(99, 102, 241, 0.2)'
                    : 'rgba(99, 102, 241, 0.3)',
                },
              }}
            >
              <MenuIcon />
            </IconButton>


            {/* Actions du header */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              ml: 'auto',
              flexGrow: 1,
              justifyContent: 'flex-end'
            }}>
              {/* Informations utilisateur */}
              {user && (
                <Box sx={{ 
                  display: { xs: 'none', md: 'flex' }, 
                  alignItems: 'center', 
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  background: theme.palette.mode === 'light'
                    ? 'rgba(99, 102, 241, 0.1)'
                    : 'rgba(99, 102, 241, 0.2)',
                  border: `1px solid ${theme.palette.mode === 'light'
                    ? 'rgba(99, 102, 241, 0.2)'
                    : 'rgba(99, 102, 241, 0.3)'}`,
                }}>
                  <Typography variant="body2" fontWeight={600} color="primary.main">
                    {user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.role}
                  </Typography>
                </Box>
              )}

              <ThemeToggle />
              <NotificationDropdown />
              <UserProfileDropdown />
            </Box>
          </Toolbar>
        </AppBar>

        {/* Contenu de la page */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 3, md: 4 },
            background: 'transparent',
            height: 'calc(100vh - 72px)',
            width: '100%',
            overflowY: 'auto',
            scrollbarGutter: 'stable both-edges',
          }}
        >
          <Fade in={mounted} timeout={1000}>
            <Box>
              {children}
            </Box>
          </Fade>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
