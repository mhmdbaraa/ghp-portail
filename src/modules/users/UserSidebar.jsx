import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  useTheme,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Dashboard,
  People,
  PersonAdd,
  Security,
  AdminPanelSettings,
  Settings,
  ChevronRight,
  ChevronDown,
  Person,
  Group,
  Shield,
  Key,
} from '@mui/icons-material';

const UserSidebar = ({ collapsed = false, onItemClick }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState({
    users: true,
    permissions: false,
    roles: false,
  });

  const handleSectionToggle = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleNavigation = (path) => {
    if (onItemClick) {
      onItemClick(path);
    } else {
      navigate(path);
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const menuSections = [
    {
      id: 'dashboard',
      title: 'Tableau de bord',
      icon: <Dashboard />,
      path: '/users/dashboard',
      color: '#6366f1'
    },
    {
      id: 'users',
      title: 'Gestion des utilisateurs',
      icon: <People />,
      color: '#10b981',
      items: [
        {
          title: 'Liste des utilisateurs',
          icon: <Person />,
          path: '/users/list',
          description: 'Voir et gérer tous les utilisateurs'
        },
        {
          title: 'Ajouter un utilisateur',
          icon: <PersonAdd />,
          path: '/users/create',
          description: 'Créer un nouveau compte utilisateur'
        },
        {
          title: 'Groupes d\'utilisateurs',
          icon: <Group />,
          path: '/users/groups',
          description: 'Gérer les groupes d\'utilisateurs'
        }
      ]
    },
    {
      id: 'permissions',
      title: 'Permissions',
      icon: <Security />,
      color: '#f59e0b',
      items: [
        {
          title: 'Gestion des permissions',
          icon: <Shield />,
          path: '/users/permissions',
          description: 'Configurer les permissions système'
        },
        {
          title: 'Clés d\'accès',
          icon: <Key />,
          path: '/users/access-keys',
          description: 'Gérer les clés d\'accès API'
        }
      ]
    },
    {
      id: 'roles',
      title: 'Rôles',
      icon: <AdminPanelSettings />,
      color: '#ef4444',
      items: [
        {
          title: 'Gestion des rôles',
          icon: <AdminPanelSettings />,
          path: '/users/roles',
          description: 'Créer et modifier les rôles'
        }
      ]
    },
    {
      id: 'settings',
      title: 'Paramètres',
      icon: <Settings />,
      path: '/users/settings',
      color: '#8b5cf6'
    }
  ];

  const renderMenuItem = (item, level = 0) => {
    const isActive = isActiveRoute(item.path);
    const hasItems = item.items && item.items.length > 0;
    const isExpanded = expandedSections[item.id];

    if (hasItems) {
      return (
        <Box key={item.id}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleSectionToggle(item.id)}
              sx={{
                borderRadius: 2,
                mx: 1,
                mb: 0.5,
                background: isActive 
                  ? `linear-gradient(135deg, ${item.color}20, ${item.color}10)`
                  : 'transparent',
                border: isActive ? `1px solid ${item.color}40` : '1px solid transparent',
                '&:hover': {
                  background: `linear-gradient(135deg, ${item.color}15, ${item.color}05)`,
                  borderColor: `${item.color}30`,
                },
                transition: 'all 0.3s ease',
              }}
            >
              <ListItemIcon sx={{ color: item.color, minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={isActive ? item.color : 'text.primary'}
                      >
                        {item.title}
                      </Typography>
                    }
                  />
                  <IconButton size="small" sx={{ color: item.color }}>
                    {isExpanded ? <ChevronDown /> : <ChevronRight />}
                  </IconButton>
                </>
              )}
            </ListItemButton>
          </ListItem>
          
          {!collapsed && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.items.map((subItem, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemButton
                      onClick={() => handleNavigation(subItem.path)}
                      sx={{
                        borderRadius: 2,
                        mx: 2,
                        mb: 0.5,
                        pl: 4,
                        background: isActiveRoute(subItem.path)
                          ? `linear-gradient(135deg, ${item.color}15, ${item.color}05)`
                          : 'transparent',
                        border: isActiveRoute(subItem.path)
                          ? `1px solid ${item.color}30`
                          : '1px solid transparent',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${item.color}10, ${item.color}05)`,
                          borderColor: `${item.color}20`,
                          transform: 'translateX(4px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <ListItemIcon sx={{ color: item.color, minWidth: 32 }}>
                        {subItem.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            fontWeight={isActiveRoute(subItem.path) ? 600 : 500}
                            color={isActiveRoute(subItem.path) ? item.color : 'text.primary'}
                          >
                            {subItem.title}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {subItem.description}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          )}
        </Box>
      );
    }

    return (
      <ListItem key={item.id} disablePadding>
        <ListItemButton
          onClick={() => handleNavigation(item.path)}
          sx={{
            borderRadius: 2,
            mx: 1,
            mb: 0.5,
            background: isActive
              ? `linear-gradient(135deg, ${item.color}20, ${item.color}10)`
              : 'transparent',
            border: isActive ? `1px solid ${item.color}40` : '1px solid transparent',
            '&:hover': {
              background: `linear-gradient(135deg, ${item.color}15, ${item.color}05)`,
              borderColor: `${item.color}30`,
              transform: 'translateX(4px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <ListItemIcon sx={{ color: item.color, minWidth: 40 }}>
            {item.icon}
          </ListItemIcon>
          {!collapsed && (
            <ListItemText
              primary={
                <Typography
                  variant="body2"
                  fontWeight={isActive ? 600 : 500}
                  color={isActive ? item.color : 'text.primary'}
                >
                  {item.title}
                </Typography>
              }
            />
          )}
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Box
      sx={{
        width: collapsed ? 72 : 280,
        height: '100%',
        background: theme.palette.mode === 'light'
          ? 'linear-gradient(180deg, rgba(99, 102, 241, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)'
          : 'linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
        backdropFilter: 'blur(20px)',
        borderRight: `1px solid ${theme.palette.divider}`,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ p: collapsed ? 2 : 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box
            sx={{
              width: collapsed ? 32 : 40,
              height: collapsed ? 32 : 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: collapsed ? 0 : 2,
            }}
          >
            <People sx={{ color: 'white', fontSize: collapsed ? 16 : 20 }} />
          </Box>
          {!collapsed && (
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{
                background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}
            >
              Gestion Utilisateurs
            </Typography>
          )}
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ py: 2, flex: 1, overflow: 'auto' }}>
        <List>
          {menuSections.map((section) => renderMenuItem(section))}
        </List>
      </Box>
    </Box>
  );
};

export default UserSidebar;
