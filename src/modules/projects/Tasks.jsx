import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Add,
  Visibility,
  Edit,
  Delete,
  MoreVert,
  Assignment,
  Schedule,
  Person,
} from '@mui/icons-material';

const Tasks = () => {
  const tasks = [
    {
      id: 1,
      title: 'Révision du design final',
      description: 'Réviser et valider le design final du site e-commerce avant la mise en production.',
      project: 'Site E-commerce',
      assignee: 'Sarah Martin',
      status: 'En cours',
      priority: 'high',
      progress: 75,
      dueDate: '2024-01-25',
      estimatedHours: 8,
    },
    {
      id: 2,
      title: 'Tests d\'intégration',
      description: 'Effectuer les tests d\'intégration pour l\'application mobile.',
      project: 'Application Mobile',
      assignee: 'Mike Johnson',
      status: 'En attente',
      priority: 'medium',
      progress: 30,
      dueDate: '2024-01-28',
      estimatedHours: 12,
    },
    {
      id: 3,
      title: 'Documentation API',
      description: 'Rédiger la documentation complète de l\'API REST.',
      project: 'Refonte UI/UX',
      assignee: 'Emma Davis',
      status: 'Presque terminé',
      priority: 'low',
      progress: 90,
      dueDate: '2024-01-30',
      estimatedHours: 6,
    },
    {
      id: 4,
      title: 'Optimisation des performances',
      description: 'Analyser et optimiser les performances du site web.',
      project: 'Site E-commerce',
      assignee: 'David Wilson',
      status: 'En cours',
      priority: 'high',
      progress: 45,
      dueDate: '2024-02-01',
      estimatedHours: 16,
    },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high':
        return 'Élevée';
      case 'medium':
        return 'Moyenne';
      case 'low':
        return 'Faible';
      default:
        return 'Non définie';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'En cours':
        return 'primary';
      case 'En attente':
        return 'warning';
      case 'Presque terminé':
        return 'success';
      case 'Terminé':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête de la page */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Tâches
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérez et suivez toutes vos tâches et sous-tâches
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
            },
          }}
        >
          Nouvelle Tâche
        </Button>
      </Box>

      {/* Grille des tâches */}
      <Grid container spacing={3}>
        {tasks.map((task) => (
          <Grid item xs={12} md={6} lg={4} key={task.id}>
            <Card
              sx={{
                height: '100%',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
                transition: 'all 0.3s ease',
              }}
            >
              <CardContent>
                {/* En-tête de la tâche */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {task.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {task.description}
                    </Typography>
                  </Box>
                  <IconButton size="small">
                    <MoreVert />
                  </IconButton>
                </Box>

                {/* Projet et assigné */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Assignment sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {task.project}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {task.assignee}
                    </Typography>
                  </Box>
                </Box>

                {/* Statuts et priorités */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={task.status}
                    size="small"
                    color={getStatusColor(task.status)}
                    variant="outlined"
                  />
                  <Chip
                    label={getPriorityText(task.priority)}
                    size="small"
                    color={getPriorityColor(task.priority)}
                  />
                </Box>

                {/* Progression */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Progression
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {task.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={task.progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>

                {/* Informations de la tâche */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Échéance:
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={500}>
                      {task.dueDate}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Heures estimées:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {task.estimatedHours}h
                    </Typography>
                  </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Voir les détails">
                    <IconButton size="small" color="primary" variant="outlined">
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Modifier">
                    <IconButton size="small" color="info" variant="outlined">
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton size="small" color="error" variant="outlined">
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Tasks;
