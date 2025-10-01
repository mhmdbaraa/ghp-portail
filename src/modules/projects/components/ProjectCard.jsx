import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  LinearProgress,
  Box,
  useTheme,
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  Warning,
  LocalOffer,
} from '@mui/icons-material';
import KanbanActionMenu from './KanbanActionMenu';
import { TASK_STATUS_MAPPING } from '../constants';

const ProjectCard = ({ 
  project, 
  onView, 
  onEdit, 
  onDelete, 
  canEdit, 
  canDelete 
}) => {
  const theme = useTheme();

  const getStatusColor = (status) => {
    const colors = {
      'Planification': theme.palette.info.main,
      'En cours': theme.palette.primary.main,
      'Terminé': theme.palette.success.main,
      'En attente': theme.palette.warning.main,
      'En retard': theme.palette.error.main,
      'Annulé': theme.palette.grey.main,
    };
    return colors[status] || theme.palette.grey.main;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Élevé': theme.palette.error.main,
      'Moyen': theme.palette.warning.main,
      'Faible': theme.palette.success.main,
    };
    return colors[priority] || theme.palette.grey.main;
  };

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 8px 24px rgba(0,0,0,0.4)' 
            : '0 8px 24px rgba(0,0,0,0.12)',
          '& .action-menu': {
            opacity: 1,
          }
        },
        '& .action-menu': {
          opacity: 0,
          transition: 'opacity 0.2s',
        }
      }}
      onClick={() => onView(project)}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 600, 
              color: theme.palette.text.primary,
              mb: 0.5,
              fontSize: '1rem',
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
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={project.status} 
            size="small"
            color={
              project.status === 'Terminé' ? 'success' :
              project.status === 'En cours' ? 'primary' :
              project.status === 'En attente' ? 'warning' : 'default'
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
              project.priority === 'Élevé' ? 'error' :
              project.priority === 'Moyen' ? 'warning' : 'default'
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
                background: project.status === 'Terminé' 
                  ? `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`
                  : project.status === 'En cours' 
                    ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
                    : project.status === 'En attente'
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

        <KanbanActionMenu
          project={project}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
