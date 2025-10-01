// React imports
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navigate } from 'react-router-dom';

// Material-UI core components
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from '@mui/material';

// Material-UI icons
import {
  Today,
  Event,
  Schedule,
  Person,
  Add,
  Edit,
  Delete,
  Warning,
  Assignment,
  Business,
} from '@mui/icons-material';

// Services and contexts
import axiosInstance from '../../shared/services/axiosInstance';
import { useAuth } from '../../shared/contexts/AuthContext';

// Constants
import {
  DATE_RANGE_OPTIONS,
  EVENT_TYPE_CONFIG,
  DEFAULT_DATE_RANGE,
  ERROR_MESSAGES,
  CALENDAR_STYLES,
} from './calendarConstants';

const Calendar = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const theme = useTheme();
  
  // Show loading while checking authentication
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(DEFAULT_DATE_RANGE);
  const [eventsByDate, setEventsByDate] = useState({});
  const [summary, setSummary] = useState({});

  // Fetch calendar data from backend
  useEffect(() => {
    fetchCalendarData();
  }, [dateRange]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const today = new Date();
      const toDate = new Date();
      toDate.setDate(today.getDate() + parseInt(dateRange));
      
      const response = await axiosInstance.get('/projects/calendar/', {
        params: {
          from_date: today.toISOString().split('T')[0],
          to_date: toDate.toISOString().split('T')[0]
        }
      });
      
      if (response.data.success) {
        const { events_by_date, summary: summaryData } = response.data.data;
        setEventsByDate(events_by_date);
        setSummary(summaryData);
        
        // Flatten events for easier processing
        const allEvents = Object.values(events_by_date).flat();
        setEvents(allEvents);
      } else {
        setError(ERROR_MESSAGES.LOAD_CALENDAR);
      }
    } catch (err) {
      setError(ERROR_MESSAGES.CONNECTION_ERROR);
    } finally {
      setLoading(false);
    }
  };

  // Memoized helper functions for better performance
  const getEventTypeColor = useCallback((type) => {
    return EVENT_TYPE_CONFIG[type]?.color || 'default';
  }, []);

  const getEventTypeText = useCallback((type) => {
    return EVENT_TYPE_CONFIG[type]?.text || 'Événement';
  }, []);

  const getEventTypeIcon = useCallback((type) => {
    const iconType = EVENT_TYPE_CONFIG[type]?.icon;
    switch (iconType) {
      case 'Business':
        return <Business />;
      case 'Assignment':
        return <Assignment />;
      case 'Warning':
        return <Warning />;
      default:
        return <Event />;
    }
  }, []);

  // Get sorted dates from eventsByDate state (memoized for performance)
  const sortedDates = useMemo(() => Object.keys(eventsByDate).sort(), [eventsByDate]);

  if (loading) {
    return (
      <Box sx={CALENDAR_STYLES.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={CALENDAR_STYLES.errorContainer}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchCalendarData}>
          Réessayer
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête de la page */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Calendrier
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visualisez et gérez tous vos événements et échéances
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Période</InputLabel>
            <Select
              value={dateRange}
              label="Période"
              onChange={(e) => setDateRange(e.target.value)}
            >
              <MenuItem value="7">7 jours</MenuItem>
              <MenuItem value="30">30 jours</MenuItem>
              <MenuItem value="60">60 jours</MenuItem>
              <MenuItem value="90">90 jours</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={fetchCalendarData}
            startIcon={<Add />}
            sx={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
              },
            }}
          >
            Actualiser
          </Button>
        </Box>
      </Box>

      {/* Résumé des événements */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Projets à venir
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {summary.upcoming_projects || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tâches à venir
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {summary.upcoming_tasks || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Projets en retard
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {summary.overdue_projects || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tâches en retard
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {summary.overdue_tasks || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Vue calendrier */}
      {sortedDates.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Event sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucun événement trouvé
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aucune échéance de projet ou de tâche dans la période sélectionnée.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {sortedDates.map((date) => (
          <Grid item xs={12} md={6} lg={4} key={date}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {new Date(date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>

                <Box sx={{ space: 2 }}>
                  {eventsByDate[date].map((event) => (
                    <Paper
                      key={event.id}
                      sx={{
                        p: 2,
                        mb: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        '&:hover': {
                          boxShadow: 2,
                          borderColor: 'primary.main',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {/* En-tête de l'événement */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight={600} gutterBottom>
                            {event.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {event.description}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Modifier">
                            <IconButton size="small" color="info">
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton size="small" color="error">
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      {/* Type et projet */}
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip
                          icon={getEventTypeIcon(event.type)}
                          label={getEventTypeText(event.type)}
                          size="small"
                          color={getEventTypeColor(event.type)}
                          variant="outlined"
                        />
                        {event.project_name && (
                          <Chip
                            label={event.project_name}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        {event.priority && (
                          <Chip
                            label={`Priorité: ${event.priority}`}
                            size="small"
                            color={event.priority === 'high' || event.priority === 'critical' ? 'error' : 'default'}
                            variant="outlined"
                          />
                        )}
                      </Box>

                      {/* Heure et jours restants */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" fontWeight={500}>
                          {event.time}
                        </Typography>
                        {event.days_remaining !== undefined && (
                          <Chip
                            label={`${event.days_remaining > 0 ? 'Dans' : 'Depuis'} ${Math.abs(event.days_remaining)} jour(s)`}
                            size="small"
                            color={event.days_remaining < 0 ? 'error' : event.days_remaining <= 3 ? 'warning' : 'success'}
                            variant="filled"
                          />
                        )}
                      </Box>

                      {/* Informations spécifiques */}
                      <Box sx={{ mb: 2 }}>
                        {event.manager_name && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Gestionnaire:</strong> {event.manager_name}
                          </Typography>
                        )}
                        {event.assignee_name && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Assigné à:</strong> {event.assignee_name}
                          </Typography>
                        )}
                        {event.progress !== undefined && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Progrès:</strong> {event.progress}%
                          </Typography>
                        )}
                        {event.team_count && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Équipe:</strong> {event.team_count} membre(s)
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        </Grid>
      )}
    </Box>
  );
};

export default Calendar;
