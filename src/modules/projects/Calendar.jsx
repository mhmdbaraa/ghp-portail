import React from 'react';
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
} from '@mui/material';
import {
  Today,
  Event,
  Schedule,
  Person,
  Add,
  Edit,
  Delete,
} from '@mui/icons-material';

const Calendar = () => {
  const events = [
    {
      id: 1,
      title: 'Réunion équipe projet',
      date: '2024-01-25',
      time: '10:00 - 11:00',
      type: 'meeting',
      attendees: ['Sarah', 'Mike', 'Emma'],
      project: 'Site E-commerce',
      description: 'Réunion hebdomadaire pour faire le point sur l\'avancement du projet.',
    },
    {
      id: 2,
      title: 'Deadline design final',
      date: '2024-01-26',
      time: '17:00',
      type: 'deadline',
      attendees: ['Sarah'],
      project: 'Site E-commerce',
      description: 'Date limite pour la validation du design final.',
    },
    {
      id: 3,
      title: 'Présentation client',
      date: '2024-01-28',
      time: '14:00 - 15:30',
      type: 'presentation',
      attendees: ['Mike', 'Emma', 'David'],
      project: 'Application Mobile',
      description: 'Présentation de l\'avancement à notre client principal.',
    },
    {
      id: 4,
      title: 'Tests d\'intégration',
      date: '2024-01-29',
      time: '09:00 - 12:00',
      type: 'task',
      attendees: ['John', 'Lisa'],
      project: 'Application Mobile',
      description: 'Session de tests d\'intégration pour l\'application mobile.',
    },
    {
      id: 5,
      title: 'Révision code',
      date: '2024-01-30',
      time: '16:00 - 17:00',
      type: 'review',
      attendees: ['Alex', 'Maria'],
      project: 'Refonte UI/UX',
      description: 'Révision du code pour la refonte de l\'interface.',
    },
  ];

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'meeting':
        return 'primary';
      case 'deadline':
        return 'error';
      case 'presentation':
        return 'info';
      case 'task':
        return 'warning';
      case 'review':
        return 'success';
      default:
        return 'default';
    }
  };

  const getEventTypeText = (type) => {
    switch (type) {
      case 'meeting':
        return 'Réunion';
      case 'deadline':
        return 'Échéance';
      case 'presentation':
        return 'Présentation';
      case 'task':
        return 'Tâche';
      case 'review':
        return 'Révision';
      default:
        return 'Événement';
    }
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'meeting':
        return <Event />;
      case 'deadline':
        return <Schedule />;
      case 'presentation':
        return <Person />;
      case 'task':
        return <Today />;
      case 'review':
        return <Edit />;
      default:
        return <Event />;
    }
  };

  // Grouper les événements par date
  const eventsByDate = events.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {});

  // Trier les dates
  const sortedDates = Object.keys(eventsByDate).sort();

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
        <IconButton
          color="primary"
          sx={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
            },
          }}
        >
          <Add />
        </IconButton>
      </Box>

      {/* Vue calendrier */}
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
                        <Chip
                          label={event.project}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>

                      {/* Heure */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" fontWeight={500}>
                          {event.time}
                        </Typography>
                      </Box>

                      {/* Participants */}
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Participants:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {event.attendees.map((attendee, index) => (
                            <Avatar
                              key={index}
                              sx={{
                                width: 28,
                                height: 28,
                                fontSize: '0.75rem',
                                backgroundColor: 'primary.main',
                              }}
                            >
                              {attendee.charAt(0)}
                            </Avatar>
                          ))}
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Calendar;
