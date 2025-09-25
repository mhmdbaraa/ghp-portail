import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Button,
  useTheme,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  People,
  PersonAdd,
  Security,
  TrendingUp,
  TrendingDown,
  MoreVert,
  Refresh,
  FilterList,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import djangoApiService from '../../shared/services/djangoApiService';
import { useUserNavigation } from './useUserNavigation';

const UserDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Utiliser le hook de navigation pour définir le menu du module
  useUserNavigation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    adminUsers: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simuler des données pour l'instant - à remplacer par les vraies API calls
      const mockStats = {
        totalUsers: 156,
        activeUsers: 142,
        newUsers: 8,
        adminUsers: 12,
      };
      
      const mockRecentUsers = [
        {
          id: 1,
          name: 'Ahmed Ben Ali',
          email: 'ahmed.benali@ghp.com',
          role: 'Manager',
          status: 'active',
          avatar: null,
          joinDate: '2024-01-15',
        },
        {
          id: 2,
          name: 'Fatma Khelil',
          email: 'fatma.khelil@ghp.com',
          role: 'Developer',
          status: 'active',
          avatar: null,
          joinDate: '2024-01-14',
        },
        {
          id: 3,
          name: 'Mohamed Bara',
          email: 'mohamed.bara@ghp.com',
          role: 'Admin',
          status: 'active',
          avatar: null,
          joinDate: '2024-01-13',
        },
        {
          id: 4,
          name: 'Salma Trabelsi',
          email: 'salma.trabelsi@ghp.com',
          role: 'Designer',
          status: 'inactive',
          avatar: null,
          joinDate: '2024-01-12',
        },
      ];

      setStats(mockStats);
      setRecentUsers(mockRecentUsers);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, trend, trendValue, onClick }) => (
    <Card
      sx={{
        background: theme.palette.mode === 'light'
          ? 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))'
          : 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(30,41,59,0.7))',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 32px ${color}20`,
          borderColor: color,
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Avatar
            sx={{
              background: `linear-gradient(135deg, ${color}, ${color}80)`,
              width: 48,
              height: 48,
            }}
          >
            {icon}
          </Avatar>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {trend === 'up' ? (
                <TrendingUp sx={{ color: '#10b981', fontSize: 20 }} />
              ) : (
                <TrendingDown sx={{ color: '#ef4444', fontSize: 20 }} />
              )}
              <Typography variant="caption" color={trend === 'up' ? '#10b981' : '#ef4444'}>
                {trendValue}%
              </Typography>
            </Box>
          )}
        </Box>
        <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return '#ef4444';
      case 'Manager': return '#6366f1';
      case 'Developer': return '#10b981';
      case 'Designer': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Tableau de bord Utilisateurs
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                sx={{ borderRadius: 2 }}
              >
                Filtrer
              </Button>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={loadDashboardData}
                disabled={loading}
                sx={{ borderRadius: 2 }}
              >
                Actualiser
              </Button>
            </Box>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Gérez les utilisateurs, permissions et rôles de votre organisation
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Utilisateurs"
              value={stats.totalUsers}
              icon={<People />}
              color="#6366f1"
              trend="up"
              trendValue="12"
              onClick={() => navigate('/users/list')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Utilisateurs Actifs"
              value={stats.activeUsers}
              icon={<Security />}
              color="#10b981"
              trend="up"
              trendValue="8"
              onClick={() => navigate('/users/list?status=active')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Nouveaux Utilisateurs"
              value={stats.newUsers}
              icon={<PersonAdd />}
              color="#f59e0b"
              trend="up"
              trendValue="25"
              onClick={() => navigate('/users/list?new=true')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Administrateurs"
              value={stats.adminUsers}
              icon={<Security />}
              color="#ef4444"
              trend="down"
              trendValue="5"
              onClick={() => navigate('/users/list?role=admin')}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Recent Users */}
          <Grid item xs={12} md={8}>
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
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" fontWeight={600} color="text.primary">
                    Utilisateurs Récents
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => navigate('/users/list')}
                    sx={{ color: 'primary.main' }}
                  >
                    Voir tout
                  </Button>
                </Box>
                <List>
                  {recentUsers.map((user, index) => (
                    <React.Fragment key={user.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              background: `linear-gradient(135deg, ${getRoleColor(user.role)}, ${getRoleColor(user.role)}80)`,
                            }}
                          >
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.name}
                          primaryTypographyProps={{
                            variant: "body1",
                            fontWeight: 600,
                            color: "text.primary"
                          }}
                          secondary={user.email}
                          secondaryTypographyProps={{
                            variant: "body2",
                            color: "text.secondary"
                          }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, ml: 7 }}>
                          <Chip
                            label={user.role}
                            size="small"
                            sx={{
                              background: `${getRoleColor(user.role)}20`,
                              color: getRoleColor(user.role),
                              fontWeight: 600,
                            }}
                          />
                          <Chip
                            label={user.status}
                            size="small"
                            sx={{
                              background: `${getStatusColor(user.status)}20`,
                              color: getStatusColor(user.status),
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                        <ListItemSecondaryAction>
                          <IconButton size="small">
                            <MoreVert />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < recentUsers.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
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
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 3 }}>
                  Actions Rapides
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<PersonAdd />}
                    onClick={() => navigate('/users/create')}
                    sx={{ borderRadius: 2, py: 1.5 }}
                  >
                    Ajouter un utilisateur
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Security />}
                    onClick={() => navigate('/users/permissions')}
                    sx={{ borderRadius: 2, py: 1.5 }}
                  >
                    Gérer les permissions
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Security />}
                    onClick={() => navigate('/users/roles')}
                    sx={{ borderRadius: 2, py: 1.5 }}
                  >
                    Gérer les rôles
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
    </Box>
  );
};

export default UserDashboard;
