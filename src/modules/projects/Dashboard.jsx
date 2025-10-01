import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Button,
  useTheme,
  List,
  ListItem,
  ListItemAvatar,
  LinearProgress,
  Badge,
  Stack,
  Skeleton,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Alert,
  AlertTitle,
  Paper,
  Divider,
  Tooltip,
  Fade,
  Zoom,
  Slide,
} from '@mui/material';
import {
  Work,
  Assignment,
  TrendingUp,
  TrendingDown,
  Schedule,
  People,
  AttachMoney,
  Timer,
  CheckCircle,
  Warning,
  Error,
  Info,
  Event,
  MoreVert,
  Add,
  Dashboard as DashboardIcon,
  CalendarToday,
  Assessment,
  Settings,
  Refresh,
  Business,
  Task,
  Analytics,
  Speed,
  Star,
  Notifications,
  FilterList,
  Search,
  Download,
  Share,
  Edit,
  Delete,
  Visibility,
  TrendingFlat,
  Timeline,
  PieChart,
  BarChart,
  ShowChart,
} from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  BarChart as RechartsBarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  Area, 
  AreaChart,
  Scatter,
  ScatterChart,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  Legend
} from 'recharts';
import djangoApiService from '../../shared/services/djangoApiService';
import { useAuth } from '../../shared/contexts/AuthContext';

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  useEffect(() => {
    loadDashboardData();
  }, [selectedTimeframe]);

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      console.log('🔄 Chargement des données du dashboard...');
      console.log('🔗 URL de l\'API:', 'http://localhost:8000/api/projects/dashboard/');
      
      const response = await djangoApiService.getDashboard();
      
      console.log('📊 Réponse de l\'API Dashboard:', response);
      
      if (response.success) {
        console.log('✅ Données du dashboard chargées avec succès:', response.data);
        setDashboardData(response.data);
      } else {
        console.error('❌ Erreur API Dashboard:', response.error);
        console.log('🔄 Utilisation des données de fallback...');
        setDashboardData({
          user: { full_name: user?.full_name || user?.username, role: 'user' },
          statistics: {
            projects: { total: 0, active: 0, completed: 0, planning: 0, completion_rate: 0 },
            tasks: { total: 0, completed: 0, in_progress: 0, not_started: 0, overdue: 0, completion_rate: 0 },
            time_tracking: { total_estimated: 0, total_actual: 0, variance: 0, efficiency: 0 },
            budget: { total_budget: 0, total_spent: 0, utilization_rate: 0 }
          },
          recent_projects: [],
          upcoming_tasks: [],
          my_tasks: [],
          team_members: []
        });
      }
    } catch (error) {
      console.error('💥 Erreur lors du chargement des données du tableau de bord:', error);
      console.log('🔄 Utilisation des données de fallback...');
      setDashboardData({
        user: { full_name: user?.full_name || user?.username, role: 'user' },
        statistics: {
          projects: { total: 0, active: 0, completed: 0, planning: 0, completion_rate: 0 },
          tasks: { total: 0, completed: 0, in_progress: 0, not_started: 0, overdue: 0, completion_rate: 0 },
          time_tracking: { total_estimated: 0, total_actual: 0, variance: 0, efficiency: 0 },
          budget: { total_budget: 0, total_spent: 0, utilization_rate: 0 }
        },
        recent_projects: [],
        upcoming_tasks: [],
        my_tasks: [],
        team_members: []
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  // Composant de métrique compacte
  const CompactMetricCard = ({ title, value, subtitle, icon, color, trend, trendValue, onClick, delay = 0 }) => (
    <Fade in timeout={200 + delay}>
      <Card 
        onClick={onClick}
        sx={{ 
          height: '100%',
          borderRadius: 2,
          background: `linear-gradient(135deg, ${color}06, ${color}02)`,
          border: `1px solid ${color}15`,
          boxShadow: `0 4px 16px ${color}10`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${color}, ${color}80)`,
          },
          '&:hover': {
            transform: 'translateY(-4px) scale(1.01)',
            boxShadow: `0 8px 24px ${color}20`,
            border: `1px solid ${color}30`,
          }
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: 2, 
              background: `linear-gradient(135deg, ${color}15, ${color}08)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${color}25`,
              boxShadow: `0 4px 12px ${color}15`
            }}>
              {React.cloneElement(icon, { 
                sx: { color, fontSize: 20 } 
              })}
            </Box>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {trend === 'up' ? (
                  <TrendingUp sx={{ color: theme.palette.success.main, fontSize: 16 }} />
                ) : (
                  <TrendingDown sx={{ color: theme.palette.error.main, fontSize: 16 }} />
                )}
                <Typography variant="caption" sx={{ 
                  color: trend === 'up' ? theme.palette.success.main : theme.palette.error.main,
                  fontWeight: 600,
                  fontSize: '0.7rem'
                }}>
                  {trendValue}
                </Typography>
              </Box>
            )}
          </Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            mb: 0.5, 
            color: theme.palette.text.primary,
            fontSize: '1.8rem',
            letterSpacing: '-0.01em',
            lineHeight: 1.1
          }}>
            {value}
          </Typography>
          <Typography variant="body1" sx={{ 
            color: theme.palette.text.primary, 
            fontWeight: 600,
            mb: 0.5,
            fontSize: '0.9rem',
            letterSpacing: '0.01em'
          }}>
            {title}
          </Typography>
          <Typography variant="caption" sx={{ 
            color: theme.palette.text.secondary,
            fontSize: '0.75rem',
            fontWeight: 500,
            opacity: 0.8
          }}>
            {subtitle}
          </Typography>
        </CardContent>
      </Card>
    </Fade>
  );

  // Composant de projet compact
  const CompactProjectCard = ({ project, index }) => (
    <Slide direction="up" in timeout={200 + (index * 50)}>
      <Card sx={{ 
        mb: 2,
        borderRadius: 2,
        background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 4px 16px rgba(0,0,0,0.3)' 
          : '0 4px 16px rgba(0,0,0,0.06)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: project.status === 'completed' 
            ? `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`
            : project.status === 'in_progress' 
              ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
              : project.status === 'planning'
                ? `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`
                : `linear-gradient(90deg, ${theme.palette.grey[500]}, ${theme.palette.grey[400]})`,
        },
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 8px 24px rgba(0,0,0,0.4)' 
            : '0 8px 24px rgba(0,0,0,0.12)',
        }
      }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ 
                fontWeight: 600, 
                color: theme.palette.text.primary,
                mb: 0.5,
                fontSize: '1rem',
                letterSpacing: '-0.01em',
                lineHeight: 1.3,
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {project.name}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: theme.palette.text.secondary,
                mb: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontSize: '0.8rem',
                lineHeight: 1.4,
                opacity: 0.9
              }}>
                {project.description}
              </Typography>
            </Box>
            <IconButton 
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.text.primary
                }
              }}
            >
              <MoreVert sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={project.status} 
              size="small"
              color={
                project.status === 'completed' ? 'success' :
                project.status === 'in_progress' ? 'primary' :
                project.status === 'planning' ? 'warning' : 'default'
              }
              sx={{ 
                fontSize: '0.7rem', 
                height: 24,
                fontWeight: 600,
                textTransform: 'capitalize'
              }}
            />
            <Chip 
              label={project.priority} 
              size="small"
              variant="outlined"
              color={
                project.priority === 'high' ? 'error' :
                project.priority === 'medium' ? 'warning' : 'default'
              }
              sx={{ 
                fontSize: '0.7rem', 
                height: 24,
                fontWeight: 600,
                textTransform: 'capitalize'
              }}
            />
            {project.tasks_count > 0 && (
              <Chip 
                label={`${project.completed_tasks_count}/${project.tasks_count}`}
                size="small"
                variant="outlined"
                sx={{ 
                  fontSize: '0.65rem', 
                  height: 22,
                  fontWeight: 500,
                  color: theme.palette.text.secondary,
                  borderColor: theme.palette.divider
                }}
              />
            )}
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" sx={{ 
                color: theme.palette.text.secondary,
                fontWeight: 600,
                fontSize: '0.75rem'
              }}>
                Progression
              </Typography>
              <Typography variant="caption" sx={{ 
                color: theme.palette.text.primary,
                fontWeight: 700,
                fontSize: '0.8rem'
              }}>
                {project.progress}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={project.progress} 
              sx={{ 
                height: 6, 
                borderRadius: 3,
                backgroundColor: theme.palette.action.hover,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  background: project.status === 'completed' 
                    ? `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`
                    : project.status === 'in_progress' 
                      ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
                      : project.status === 'planning'
                        ? `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`
                        : `linear-gradient(90deg, ${theme.palette.grey[500]}, ${theme.palette.grey[400]})`,
                }
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ 
                width: 28, 
                height: 28, 
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText
              }}>
                {project.manager_name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="caption" sx={{ 
                  color: theme.palette.text.primary,
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  lineHeight: 1.2
                }}>
                  {project.manager_name}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.7rem',
                display: 'block'
              }}>
                {new Date(project.created_at).toLocaleDateString('fr-FR')}
              </Typography>
              {project.budget > 0 && (
                <Typography variant="caption" sx={{ 
                  color: theme.palette.success.main,
                  fontWeight: 600,
                  fontSize: '0.7rem'
                }}>
                  {project.budget.toLocaleString('fr-FR')} DZD
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Slide>
  );

  // Composant de tâche compacte
  const CompactTaskItem = ({ task, index }) => (
    <Zoom in timeout={150 + (index * 30)}>
      <ListItem sx={{ 
        px: 0, 
        py: 1,
        borderRadius: 1.5,
        mb: 0.5,
        background: `linear-gradient(135deg, ${theme.palette.background.default}, ${theme.palette.background.paper})`,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
          transform: 'translateX(4px)',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 2px 8px rgba(0,0,0,0.3)' 
            : '0 2px 8px rgba(0,0,0,0.1)',
        }
      }}>
        <ListItemAvatar>
          <Avatar sx={{ 
            width: 32, 
            height: 32, 
            backgroundColor: 
              task.status === 'completed' ? theme.palette.success.main :
              task.status === 'in_progress' ? theme.palette.primary.main :
              task.status === 'overdue' ? theme.palette.error.main :
              theme.palette.grey[500],
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            {task.status === 'completed' ? <CheckCircle /> :
             task.status === 'in_progress' ? <Timer /> :
             task.status === 'overdue' ? <Warning /> : <Schedule />}
          </Avatar>
        </ListItemAvatar>
        <Box sx={{ flex: 1, ml: 1.5 }}>
          <Typography variant="body2" sx={{ 
            fontWeight: 600, 
            color: theme.palette.text.primary,
            lineHeight: 1.3,
            mb: 0.5,
            fontSize: '0.85rem',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {task.title}
          </Typography>
          <Typography variant="caption" sx={{ 
            color: theme.palette.text.secondary, 
            fontWeight: 500,
            mb: 0.5,
            fontSize: '0.75rem',
            display: 'block'
          }}>
            {task.project_name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip 
              label={task.status} 
              size="small"
              color={
                task.status === 'completed' ? 'success' :
                task.status === 'in_progress' ? 'primary' :
                task.status === 'overdue' ? 'error' : 'default'
              }
              sx={{ fontSize: '0.65rem', height: 18 }}
            />
            {task.due_date && (
              <Typography variant="caption" sx={{ 
                color: theme.palette.text.disabled,
                fontSize: '0.7rem'
              }}>
                {new Date(task.due_date).toLocaleDateString('fr-FR')}
              </Typography>
            )}
          </Box>
        </Box>
      </ListItem>
    </Zoom>
  );

  // Actions pour le SpeedDial
  const speedDialActions = [
    {
      icon: <Add />,
      name: 'Nouveau Projet',
      onClick: () => navigate('/projects/new')
    },
    {
      icon: <CalendarToday />,
      name: 'Calendrier',
      onClick: () => navigate('/calendar')
    },
    {
      icon: <Assessment />,
      name: 'Rapports',
      onClick: () => navigate('/reports')
    },
    {
      icon: <Settings />,
      name: 'Paramètres',
      onClick: () => navigate('/settings')
    }
  ];

  if (loading) {
    return (
      <Box sx={{ 
        p: { xs: 2, sm: 3 }, 
        backgroundColor: theme.palette.background.default, 
        minHeight: '100vh',
        maxWidth: '100%'
      }}>
        {/* Header Skeleton */}
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="60%" height={48} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="40%" height={24} />
        </Box>

        {/* Statistics Cards Skeleton */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} lg={3} key={item}>
              <Card sx={{ height: 200, borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Skeleton variant="circular" width={56} height={56} sx={{ mb: 3 }} />
                  <Skeleton variant="text" width="80%" height={40} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="60%" height={24} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="40%" height={16} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card sx={{ borderRadius: 3, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Skeleton variant="text" width="40%" height={32} sx={{ mb: 3 }} />
                <Skeleton variant="rectangular" width="100%" height={300} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {[1, 2].map((item) => (
                <Card key={item} sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Skeleton variant="text" width="50%" height={24} sx={{ mb: 2 }} />
                    {[1, 2, 3].map((task) => (
                      <Skeleton key={task} variant="rectangular" width="100%" height={60} sx={{ mb: 1 }} />
                    ))}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 3
      }}>
        <Error sx={{ fontSize: 64, color: theme.palette.error.main }} />
        <Typography variant="h4" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
          Erreur lors du chargement des données
        </Typography>
        <Button variant="contained" size="large" onClick={loadDashboardData} startIcon={<Refresh />}>
          Réessayer
        </Button>
      </Box>
    );
  }

  const { user: userData, statistics, recent_projects, upcoming_tasks, my_tasks } = dashboardData;

  // Données pour les graphiques
  const projectStatusData = [
    { name: 'En cours', value: statistics.projects.active, color: theme.palette.primary.main },
    { name: 'Terminés', value: statistics.projects.completed, color: theme.palette.success.main },
    { name: 'En attente', value: statistics.projects.planning, color: theme.palette.warning.main },
  ];

  const taskStatusData = [
    { name: 'Terminées', value: statistics.tasks.completed, color: theme.palette.success.main },
    { name: 'En cours', value: statistics.tasks.in_progress, color: theme.palette.primary.main },
    { name: 'Non démarrées', value: statistics.tasks.not_started, color: theme.palette.grey[500] },
    { name: 'En retard', value: statistics.tasks.overdue, color: theme.palette.error.main },
  ];

  return (
    <Box 
      role="main"
      aria-label="Tableau de bord professionnel"
      sx={{ 
        p: { xs: 2, sm: 3 }, 
        backgroundColor: theme.palette.background.default, 
        minHeight: '100vh',
        maxWidth: '100%'
      }}
    >
      {/* Header Compact */}
      <Box sx={{ 
        mb: 3,
        p: 3,
        borderRadius: 3,
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(25, 118, 210, 0.08), rgba(25, 118, 210, 0.04))'
          : 'linear-gradient(135deg, rgba(25, 118, 210, 0.06), rgba(25, 118, 210, 0.02))',
        border: `1px solid ${theme.palette.primary.main}15`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        }
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              color: theme.palette.text.primary,
              mb: 0.5,
              fontSize: { xs: '1.5rem', sm: '2rem' },
              letterSpacing: '-0.01em',
              lineHeight: 1.2
            }}>
              Bonjour, {userData?.full_name || userData?.username} 👋
            </Typography>
            <Typography variant="body1" sx={{ 
              color: theme.palette.text.secondary,
              fontSize: '0.9rem',
              fontWeight: 500,
              opacity: 0.8
            }}>
              Vue d'ensemble de vos projets et tâches
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="outlined"
              size="medium"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              {refreshing ? 'Actualisation...' : 'Actualiser'}
            </Button>
            <Button
              variant="contained"
              size="medium"
              onClick={async () => {
                console.log('🧪 Test de connexion Django...');
                try {
                  const response = await djangoApiService.getDashboard();
                  console.log('✅ Test réussi:', response);
                  alert(`Connexion Django: ${response.success ? 'SUCCÈS' : 'ÉCHEC'}\nMessage: ${response.message}`);
                } catch (error) {
                  console.error('❌ Test échoué:', error);
                  alert(`Connexion Django: ÉCHEC\nErreur: ${error.message}`);
                }
              }}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                backgroundColor: theme.palette.success.main,
                '&:hover': {
                  backgroundColor: theme.palette.success.dark
                }
              }}
            >
              Test Django
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Alertes importantes */}
      {statistics.tasks.overdue > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 4, borderRadius: 3 }}
          action={
            <Button color="inherit" size="large" onClick={() => navigate('/tasks?status=overdue')}>
              Voir les tâches
            </Button>
          }
        >
          <AlertTitle sx={{ fontWeight: 700 }}>Attention requise</AlertTitle>
          Vous avez {statistics.tasks.overdue} tâche(s) en retard nécessitant votre attention immédiate.
        </Alert>
      )}

      {/* Métriques Compactes */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <CompactMetricCard
            title="Projets Actifs"
            value={statistics.projects.active}
            subtitle={`${statistics.projects.total} projets au total`}
            icon={<Work />}
            color={theme.palette.primary.main}
            trend="up"
            trendValue={`${statistics.projects.completion_rate}%`}
            onClick={() => navigate('/projects')}
            delay={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <CompactMetricCard
            title="Tâches En Cours"
            value={statistics.tasks.in_progress}
            subtitle={`${statistics.tasks.total} tâches au total`}
            icon={<Assignment />}
            color={theme.palette.info.main}
            trend="up"
            trendValue={`${statistics.tasks.completion_rate}%`}
            onClick={() => navigate('/tasks')}
            delay={50}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <CompactMetricCard
            title="Tâches En Retard"
            value={statistics.tasks.overdue}
            subtitle="Nécessitent attention"
            icon={<Warning />}
            color={theme.palette.error.main}
            trend={statistics.tasks.overdue > 0 ? "down" : "up"}
            trendValue={statistics.tasks.overdue > 0 ? "Attention" : "Parfait"}
            onClick={() => navigate('/tasks?status=overdue')}
            delay={100}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <CompactMetricCard
            title="Efficacité Temps"
            value={`${statistics.time_tracking.efficiency}%`}
            subtitle="Temps estimé vs réel"
            icon={<Timer />}
            color={theme.palette.success.main}
            trend={statistics.time_tracking.efficiency > 100 ? "up" : "down"}
            trendValue={statistics.time_tracking.efficiency > 100 ? "Excellent" : "À améliorer"}
            onClick={() => navigate('/reports')}
            delay={150}
          />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Colonne Principale */}
        <Grid item xs={12} lg={8}>
          {/* Graphiques Compacts */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                borderRadius: 3,
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 4px 16px rgba(0,0,0,0.3)' 
                  : '0 4px 16px rgba(0,0,0,0.06)',
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 8px 24px rgba(0,0,0,0.4)' 
                    : '0 8px 24px rgba(0,0,0,0.1)',
                }
              }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: theme.palette.text.primary,
                    mb: 2,
                    fontSize: '1.1rem',
                    letterSpacing: '-0.01em'
                  }}>
                    Répartition des Projets
                  </Typography>
                  <Box sx={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={projectStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {projectStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 6,
                            color: theme.palette.text.primary,
                            fontSize: '0.8rem'
                          }}
                        />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                borderRadius: 3,
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 4px 16px rgba(0,0,0,0.3)' 
                  : '0 4px 16px rgba(0,0,0,0.06)',
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 8px 24px rgba(0,0,0,0.4)' 
                    : '0 8px 24px rgba(0,0,0,0.1)',
                }
              }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: theme.palette.text.primary,
                    mb: 2,
                    fontSize: '1.1rem',
                    letterSpacing: '-0.01em'
                  }}>
                    Répartition des Tâches
                  </Typography>
                  <Box sx={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={taskStatusData}>
                        <CartesianGrid strokeDasharray="2 2" stroke={theme.palette.divider} />
                        <XAxis 
                          dataKey="name" 
                          stroke={theme.palette.text.secondary}
                          fontSize={10}
                        />
                        <YAxis stroke={theme.palette.text.secondary} fontSize={10} />
                        <RechartsTooltip 
                          contentStyle={{
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 6,
                            color: theme.palette.text.primary,
                            fontSize: '0.8rem'
                          }}
                        />
                        <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                          {taskStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Projets Récents Compacts */}
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 4px 16px rgba(0,0,0,0.3)' 
              : '0 4px 16px rgba(0,0,0,0.06)',
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 8px 24px rgba(0,0,0,0.4)' 
                : '0 8px 24px rgba(0,0,0,0.1)',
            }
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: theme.palette.text.primary,
                  fontSize: '1.1rem',
                  letterSpacing: '-0.01em'
                }}>
                  Projets Récents
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<Add />}
                  onClick={() => navigate('/projects')}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.8rem'
                  }}
                >
                  Voir tous
                </Button>
              </Box>
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {recent_projects?.slice(0, 4).map((project, index) => (
                  <CompactProjectCard key={project.id} project={project} index={index} />
                ))}
                {(!recent_projects || recent_projects.length === 0) && (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    color: theme.palette.text.secondary
                  }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      Aucun projet récent trouvé
                    </Typography>
                    <Button variant="contained" size="small" onClick={() => navigate('/projects/new')}>
                      Créer un nouveau projet
                    </Button>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Colonne Latérale */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={2}>
            {/* Mes Tâches Compactes */}
            <Card sx={{ 
              borderRadius: 3,
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 4px 16px rgba(0,0,0,0.3)' 
                : '0 4px 16px rgba(0,0,0,0.06)',
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 8px 24px rgba(0,0,0,0.4)' 
                  : '0 8px 24px rgba(0,0,0,0.1)',
              }
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: theme.palette.text.primary,
                    fontSize: '1.1rem',
                    letterSpacing: '-0.01em'
                  }}>
                    Mes Tâches
                  </Typography>
                  <Badge badgeContent={my_tasks?.length || 0} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }}>
                    <Assignment sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                  </Badge>
                </Box>
                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  <List sx={{ p: 0 }}>
                    {my_tasks?.slice(0, 4).map((task, index) => (
                      <CompactTaskItem key={task.id} task={task} index={index} />
                    ))}
                  </List>
                </Box>
              </CardContent>
            </Card>

            {/* Tâches à Venir Compactes */}
            <Card sx={{ 
              borderRadius: 3,
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 4px 16px rgba(0,0,0,0.3)' 
                : '0 4px 16px rgba(0,0,0,0.06)',
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 8px 24px rgba(0,0,0,0.4)' 
                  : '0 8px 24px rgba(0,0,0,0.1)',
              }
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: theme.palette.text.primary,
                    fontSize: '1.1rem',
                    letterSpacing: '-0.01em'
                  }}>
                    Tâches à Venir
                  </Typography>
                  <Badge badgeContent={upcoming_tasks?.length || 0} color="warning" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }}>
                    <Schedule sx={{ color: theme.palette.warning.main, fontSize: 20 }} />
                  </Badge>
                </Box>
                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  <List sx={{ p: 0 }}>
                    {upcoming_tasks?.slice(0, 4).map((task, index) => (
                      <CompactTaskItem key={task.id} task={task} index={index} />
                    ))}
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* SpeedDial pour Actions Rapides */}
      <SpeedDial
        ariaLabel="Actions rapides"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        icon={<SpeedDialIcon />}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
        open={speedDialOpen}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.onClick}
          />
        ))}
      </SpeedDial>
    </Box>
  );
};

export default Dashboard;