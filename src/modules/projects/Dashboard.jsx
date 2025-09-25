import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  LinearProgress,
  Tooltip,
  Badge,
  Stack,
  Skeleton,
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
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import djangoApiService from '../../shared/services/djangoApiService';
import { useAuth } from '../../shared/contexts/AuthContext';

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await djangoApiService.getDashboard();
      
      if (response.success) {
        setDashboardData(response.data);
      } else {
        console.error('Erreur API Dashboard:', response.error);
        // Set empty data structure to avoid crashes
        setDashboardData({
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
      console.error('Erreur lors du chargement des données du tableau de bord:', error);
      // Set empty data structure to avoid crashes
      setDashboardData({
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
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color, trend, trendValue }) => (
    <Card 
      role="region"
      aria-label={`${title}: ${value}`}
      sx={{ 
        height: '100%',
        borderRadius: 4,
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 8px 32px rgba(0,0,0,0.4)' 
          : '0 8px 32px rgba(0,0,0,0.06)',
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${color}, ${color}80)`,
        },
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 16px 48px rgba(0,0,0,0.5)' 
            : '0 16px 48px rgba(0,0,0,0.15)',
        }
      }}
    >
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ 
            width: { xs: 56, sm: 64 }, 
            height: { xs: 56, sm: 64 }, 
            borderRadius: 4, 
            background: `linear-gradient(135deg, ${color}20, ${color}10)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${color}25`,
            boxShadow: `0 4px 16px ${color}20`
          }}>
            {React.cloneElement(icon, { 
              sx: { color, fontSize: { xs: 28, sm: 32 } } 
            })}
          </Box>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {trend === 'up' ? (
                <TrendingUp sx={{ color: theme.palette.success.main, fontSize: 18 }} />
              ) : (
                <TrendingDown sx={{ color: theme.palette.error.main, fontSize: 18 }} />
              )}
              <Typography variant="caption" sx={{ 
                color: trend === 'up' ? theme.palette.success.main : theme.palette.error.main,
                fontWeight: 600,
                fontSize: '0.75rem'
              }}>
                {trendValue}
              </Typography>
            </Box>
          )}
        </Box>
        <Typography variant="h3" sx={{ 
          fontWeight: 800, 
          mb: 1, 
          color: theme.palette.text.primary,
          fontSize: { xs: '2rem', sm: '2.5rem' },
          letterSpacing: '-0.02em',
          lineHeight: 1.1
        }}>
          {value}
        </Typography>
        <Typography variant="h6" sx={{ 
          color: theme.palette.text.primary, 
          fontWeight: 600,
          mb: 1,
          fontSize: { xs: '0.875rem', sm: '1rem' },
          letterSpacing: '0.01em'
        }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ 
          color: theme.palette.text.secondary,
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
          fontWeight: 500,
          opacity: 0.8
        }}>
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );

  const ProjectCard = ({ project }) => (
    <Card sx={{ 
      mb: 3,
      borderRadius: 4,
      boxShadow: theme.palette.mode === 'dark' 
        ? '0 4px 20px rgba(0,0,0,0.3)' 
        : '0 4px 20px rgba(0,0,0,0.06)',
      border: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: project.status === 'completed' 
          ? `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.main}80)`
          : project.status === 'in_progress' 
            ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.main}80)`
            : project.status === 'planning'
              ? `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.warning.main}80)`
              : `linear-gradient(90deg, ${theme.palette.grey[500]}, ${theme.palette.grey[500]}80)`,
      },
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 8px 32px rgba(0,0,0,0.4)' 
          : '0 8px 32px rgba(0,0,0,0.12)',
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 700, 
              color: theme.palette.text.primary,
              mb: 1,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              letterSpacing: '-0.01em',
              lineHeight: 1.3
            }}>
              {project.name}
            </Typography>
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.secondary,
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
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
            <MoreVert sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
          <Chip 
            label={project.status} 
            size="small"
            color={
              project.status === 'completed' ? 'success' :
              project.status === 'in_progress' ? 'primary' :
              project.status === 'planning' ? 'warning' : 'default'
            }
            sx={{ 
              fontSize: '0.75rem', 
              height: 28,
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
              fontSize: '0.75rem', 
              height: 28,
              fontWeight: 600,
              textTransform: 'capitalize'
            }}
          />
          {project.tasks_count > 0 && (
            <Chip 
              label={`${project.completed_tasks_count}/${project.tasks_count} tâches`}
              size="small"
              variant="outlined"
              sx={{ 
                fontSize: '0.7rem', 
                height: 26,
                fontWeight: 500,
                color: theme.palette.text.secondary,
                borderColor: theme.palette.divider
              }}
            />
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.secondary,
              fontWeight: 600,
              fontSize: '0.8rem'
            }}>
              Progression
            </Typography>
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.primary,
              fontWeight: 700,
              fontSize: '0.9rem'
            }}>
              {project.progress}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={project.progress} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: theme.palette.action.hover,
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ 
              width: 32, 
              height: 32, 
              fontSize: '0.8rem',
              fontWeight: 600,
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText
            }}>
              {project.manager_name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ 
                color: theme.palette.text.primary,
                fontWeight: 600,
                fontSize: '0.8rem',
                lineHeight: 1.2
              }}>
                {project.manager_name}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.7rem'
              }}>
                Chef de projet
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ 
              color: theme.palette.text.secondary,
              fontSize: '0.7rem',
              display: 'block'
            }}>
              Créé le
            </Typography>
            <Typography variant="caption" sx={{ 
              color: theme.palette.text.primary,
              fontWeight: 600,
              fontSize: '0.75rem'
            }}>
              {new Date(project.created_at).toLocaleDateString('fr-FR')}
            </Typography>
            {project.budget > 0 && (
              <>
                <Typography variant="caption" sx={{ 
                  color: theme.palette.text.secondary,
                  fontSize: '0.7rem',
                  display: 'block',
                  mt: 0.5
                }}>
                  Budget
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: theme.palette.success.main,
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}>
                  {project.budget.toLocaleString('fr-FR')} €
                </Typography>
              </>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const TaskItem = ({ task }) => (
    <ListItem sx={{ 
      px: 0, 
      py: 1.5,
      borderRadius: 2,
      mb: 1,
      backgroundColor: theme.palette.background.default,
      border: `1px solid ${theme.palette.divider}`,
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
        transform: 'translateX(4px)',
      }
    }}>
      <ListItemAvatar>
        <Avatar sx={{ 
          width: 40, 
          height: 40, 
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
      <ListItemText
        primary={
          <Typography variant="body2" sx={{ 
            fontWeight: 600, 
            color: theme.palette.text.primary,
            lineHeight: 1.3,
            mb: 0.5
          }}>
            {task.title}
          </Typography>
        }
        secondary={
          <Box>
            <Typography variant="caption" sx={{ 
              color: theme.palette.text.secondary, 
              display: 'block',
              fontWeight: 500,
              mb: 0.5
            }}>
              {task.project_name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label={task.status} 
                size="small"
                color={
                  task.status === 'completed' ? 'success' :
                  task.status === 'in_progress' ? 'primary' :
                  task.status === 'overdue' ? 'error' : 'default'
                }
                sx={{ fontSize: '0.65rem', height: 20 }}
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
        }
      />
    </ListItem>
  );

  const SkeletonCard = () => (
    <Card sx={{ 
      height: '100%',
      borderRadius: 3,
      boxShadow: theme.palette.mode === 'dark' 
        ? '0 4px 20px rgba(0,0,0,0.3)' 
        : '0 4px 20px rgba(0,0,0,0.08)',
      border: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper,
    }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Skeleton variant="circular" width={56} height={56} />
          <Skeleton variant="text" width={60} height={20} />
        </Box>
        <Skeleton variant="text" width="80%" height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="40%" height={16} />
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ 
        p: { xs: 2, sm: 3 }, 
        backgroundColor: theme.palette.background.default, 
        minHeight: '100vh',
        maxWidth: '100%'
      }}>
        {/* Welcome Header Skeleton */}
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="40%" height={24} />
        </Box>

        {/* Statistics Cards Skeleton */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} lg={3} key={item}>
              <SkeletonCard />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Main Content Skeleton */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ 
              borderRadius: 3,
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 4px 20px rgba(0,0,0,0.3)' 
                : '0 4px 20px rgba(0,0,0,0.08)',
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
            }}>
              <CardContent sx={{ p: 3 }}>
                <Skeleton variant="text" width="40%" height={32} sx={{ mb: 3 }} />
                <Skeleton variant="rectangular" width="100%" height={300} />
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar Skeleton */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {[1, 2].map((item) => (
                <Card key={item} sx={{ 
                  borderRadius: 3,
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 4px 20px rgba(0,0,0,0.3)' 
                    : '0 4px 20px rgba(0,0,0,0.08)',
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.paper,
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Skeleton variant="text" width="50%" height={24} sx={{ mb: 2 }} />
                    {[1, 2, 3].map((task) => (
                      <Box key={task} sx={{ mb: 2 }}>
                        <Skeleton variant="rectangular" width="100%" height={60} />
                      </Box>
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
        gap: 2
      }}>
        <Error sx={{ fontSize: 48, color: theme.palette.error.main }} />
        <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
          Erreur lors du chargement des données
        </Typography>
        <Button variant="contained" onClick={loadDashboardData}>
          Réessayer
        </Button>
      </Box>
    );
  }

  const { statistics, recent_projects, upcoming_tasks, my_tasks } = dashboardData;

  // Chart data for project status distribution
  const projectStatusData = [
    { name: 'En cours', value: statistics.projects.active, color: theme.palette.primary.main },
    { name: 'Terminés', value: statistics.projects.completed, color: theme.palette.success.main },
    { name: 'Planification', value: statistics.projects.planning, color: theme.palette.warning.main },
  ];

  // Chart data for task status distribution
  const taskStatusData = [
    { name: 'Terminées', value: statistics.tasks.completed, color: theme.palette.success.main },
    { name: 'En cours', value: statistics.tasks.in_progress, color: theme.palette.primary.main },
    { name: 'Non démarrées', value: statistics.tasks.not_started, color: theme.palette.grey[500] },
    { name: 'En retard', value: statistics.tasks.overdue, color: theme.palette.error.main },
  ];

  return (
    <Box 
      role="main"
      aria-label="Tableau de bord principal"
      sx={{ 
        p: { xs: 2, sm: 3 }, 
        backgroundColor: theme.palette.background.default, 
        minHeight: '100vh',
        maxWidth: '100%'
      }}
    >
      {/* Welcome Header */}
      <Box sx={{ 
        mb: { xs: 4, sm: 5 },
        p: { xs: 3, sm: 4 },
        borderRadius: 4,
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(25, 118, 210, 0.05))'
          : 'linear-gradient(135deg, rgba(25, 118, 210, 0.08), rgba(25, 118, 210, 0.03))',
        border: `1px solid ${theme.palette.primary.main}20`,
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
        <Typography variant="h3" sx={{ 
          fontWeight: 800, 
          color: theme.palette.text.primary,
          mb: 1.5,
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
          letterSpacing: '-0.02em',
          lineHeight: 1.1
        }}>
          Bonjour, {user?.full_name || user?.username} 👋
        </Typography>
        <Typography variant="h6" sx={{ 
          color: theme.palette.text.secondary,
          fontSize: { xs: '1rem', sm: '1.25rem' },
          fontWeight: 500,
          opacity: 0.9
        }}>
          Voici un aperçu de vos projets et tâches
        </Typography>
      </Box>

      {/* Main Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Projets Actifs"
            value={statistics.projects.active}
            subtitle={`${statistics.projects.total} projets au total`}
            icon={<Work />}
            color={theme.palette.primary.main}
            trend="up"
            trendValue={`${statistics.projects.completion_rate}%`}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Tâches En Cours"
            value={statistics.tasks.in_progress}
            subtitle={`${statistics.tasks.total} tâches au total`}
            icon={<Assignment />}
            color={theme.palette.info.main}
            trend="up"
            trendValue={`${statistics.tasks.completion_rate}%`}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Tâches En Retard"
            value={statistics.tasks.overdue}
            subtitle="Nécessitent une attention"
            icon={<Warning />}
            color={theme.palette.error.main}
            trend={statistics.tasks.overdue > 0 ? "down" : "up"}
            trendValue={statistics.tasks.overdue > 0 ? "Attention" : "Parfait"}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Efficacité Temps"
            value={`${statistics.time_tracking.efficiency}%`}
            subtitle="Temps estimé vs réel"
            icon={<Timer />}
            color={theme.palette.success.main}
            trend={statistics.time_tracking.efficiency > 100 ? "up" : "down"}
            trendValue={statistics.time_tracking.efficiency > 100 ? "Excellent" : "À améliorer"}
          />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Left Column - Charts and Recent Projects */}
        <Grid item xs={12} lg={8}>
          {/* Charts Row */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                borderRadius: 4,
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 8px 32px rgba(0,0,0,0.4)' 
                  : '0 8px 32px rgba(0,0,0,0.06)',
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 12px 40px rgba(0,0,0,0.5)' 
                    : '0 12px 40px rgba(0,0,0,0.1)',
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.text.primary,
                    mb: 4,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    letterSpacing: '-0.01em'
                  }}>
                    Répartition des Projets
                  </Typography>
                  <Box sx={{ height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={projectStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
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
                            borderRadius: 8,
                            color: theme.palette.text.primary
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                borderRadius: 4,
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 8px 32px rgba(0,0,0,0.4)' 
                  : '0 8px 32px rgba(0,0,0,0.06)',
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 12px 40px rgba(0,0,0,0.5)' 
                    : '0 12px 40px rgba(0,0,0,0.1)',
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.text.primary,
                    mb: 4,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    letterSpacing: '-0.01em'
                  }}>
                    Statut des Tâches
                  </Typography>
                  <Box sx={{ height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={taskStatusData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis 
                          dataKey="name" 
                          stroke={theme.palette.text.secondary}
                          fontSize={12}
                        />
                        <YAxis stroke={theme.palette.text.secondary} />
                        <RechartsTooltip 
                          contentStyle={{
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 8,
                            color: theme.palette.text.primary
                          }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {taskStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Projects */}
          <Card sx={{ 
            borderRadius: 4,
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 8px 32px rgba(0,0,0,0.4)' 
              : '0 8px 32px rgba(0,0,0,0.06)',
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 12px 40px rgba(0,0,0,0.5)' 
                : '0 12px 40px rgba(0,0,0,0.1)',
            }
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" sx={{ 
                  fontWeight: 700, 
                  color: theme.palette.text.primary,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  letterSpacing: '-0.01em'
                }}>
                  Derniers Projets
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<Add />}
                  onClick={() => navigate('/projects')}
                >
                  Voir tous
                </Button>
              </Box>
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {recent_projects?.slice(0, 3).map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
                {(!recent_projects || recent_projects.length === 0) && (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    color: theme.palette.text.secondary
                  }}>
                    <Typography variant="body2">
                      Aucun projet récent trouvé
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Tasks */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={4}>

            {/* My Tasks */}
            <Card sx={{ 
              borderRadius: 4,
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 8px 32px rgba(0,0,0,0.4)' 
                : '0 8px 32px rgba(0,0,0,0.06)',
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 12px 40px rgba(0,0,0,0.5)' 
                  : '0 12px 40px rgba(0,0,0,0.1)',
              }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.text.primary,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    letterSpacing: '-0.01em'
                  }}>
                    Mes Tâches
                  </Typography>
                  <Badge badgeContent={my_tasks?.length || 0} color="primary">
                    <Assignment sx={{ color: theme.palette.primary.main }} />
                  </Badge>
                </Box>
                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  <List sx={{ p: 0 }}>
                    {my_tasks?.slice(0, 5).map((task) => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </List>
                </Box>
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card sx={{ 
              borderRadius: 4,
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 8px 32px rgba(0,0,0,0.4)' 
                : '0 8px 32px rgba(0,0,0,0.06)',
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 12px 40px rgba(0,0,0,0.5)' 
                  : '0 12px 40px rgba(0,0,0,0.1)',
              }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.text.primary,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    letterSpacing: '-0.01em'
                  }}>
                    Tâches à Venir
                  </Typography>
                  <Badge badgeContent={upcoming_tasks?.length || 0} color="warning">
                    <Schedule sx={{ color: theme.palette.warning.main }} />
                  </Badge>
                </Box>
                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  <List sx={{ p: 0 }}>
                    {upcoming_tasks?.slice(0, 5).map((task) => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;