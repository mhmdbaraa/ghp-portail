// Project-specific theme styles and constants

export const projectStyles = {
  // Card styles
  card: {
    borderRadius: 2,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    }
  },

  // Kanban column styles
  kanbanColumn: {
    minHeight: '600px',
    backgroundColor: '#f8f9fa',
    borderRadius: 2,
    padding: 2,
    '&:hover': {
      backgroundColor: '#f0f1f2',
    }
  },

  // Kanban card styles
  kanbanCard: {
    mb: 2,
    borderRadius: 2,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      '& .action-menu': {
        opacity: 1,
      }
    },
    '& .action-menu': {
      opacity: 0,
      transition: 'opacity 0.2s',
    }
  },

  // Data grid styles
  dataGrid: {
    border: 'none',
    width: '100%',
    height: '100%',
    flex: 1,
    '& .MuiDataGrid-cell': {
      borderBottom: '1px solid #f0f0f0',
    },
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: '#fafafa',
      borderBottom: '2px solid #e0e0e0',
    },
    '& .MuiDataGrid-row:hover': {
      backgroundColor: '#f5f5f5',
    },
  },

  // Progress bar styles
  progressBar: {
    height: 6,
    borderRadius: 3,
    '& .MuiLinearProgress-bar': {
      borderRadius: 3,
    }
  },

  // Chip styles
  chip: {
    fontSize: '0.7rem',
    height: 24,
    fontWeight: 600,
    textTransform: 'capitalize'
  },

  // Avatar styles
  avatar: {
    width: 32,
    height: 32,
    fontSize: '0.8rem',
    fontWeight: 600,
  },

  // Typography styles
  title: {
    fontWeight: 600,
    color: 'text.primary',
    fontSize: '1rem',
    lineHeight: 1.3,
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },

  description: {
    color: 'text.secondary',
    fontSize: '0.8rem',
    lineHeight: 1.4,
    opacity: 0.9,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },

  // Status colors
  statusColors: {
    'Planification': 'info.main',
    'En cours': 'primary.main',
    'Terminé': 'success.main',
    'En attente': 'warning.main',
    'En retard': 'error.main',
    'Annulé': 'grey.main',
  },

  // Priority colors
  priorityColors: {
    'Élevé': 'error.main',
    'Moyen': 'warning.main',
    'Faible': 'success.main',
  },

  // Animation delays
  animationDelays: {
    metricCard: 0,
    taskItem: 50,
    projectCard: 100,
    chartCard: 150,
  },

  // Spacing
  spacing: {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
  },

  // Breakpoints
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
};

// Status-specific styles
export const getStatusStyles = (status, theme) => ({
  color: projectStyles.statusColors[status] || theme.palette.grey.main,
  backgroundColor: `${projectStyles.statusColors[status] || theme.palette.grey.main}15`,
  border: `1px solid ${projectStyles.statusColors[status] || theme.palette.grey.main}30`,
});

// Priority-specific styles
export const getPriorityStyles = (priority, theme) => ({
  color: projectStyles.priorityColors[priority] || theme.palette.grey.main,
  backgroundColor: `${projectStyles.priorityColors[priority] || theme.palette.grey.main}15`,
  border: `1px solid ${projectStyles.priorityColors[priority] || theme.palette.grey.main}30`,
});

// Responsive styles
export const getResponsiveStyles = (breakpoint) => ({
  xs: { display: { xs: 'block', sm: 'none' } },
  sm: { display: { xs: 'none', sm: 'block', md: 'none' } },
  md: { display: { xs: 'none', md: 'block', lg: 'none' } },
  lg: { display: { xs: 'none', lg: 'block' } },
});

// Animation styles
export const getAnimationStyles = (delay = 0) => ({
  animation: `fadeInUp 0.3s ease-out ${delay}ms both`,
  '@keyframes fadeInUp': {
    from: {
      opacity: 0,
      transform: 'translateY(20px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
});

// Hover effects
export const getHoverStyles = (theme) => ({
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 8px 24px rgba(0,0,0,0.4)' 
      : '0 8px 24px rgba(0,0,0,0.12)',
  },
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
});

// Focus styles
export const getFocusStyles = (theme) => ({
  '&:focus': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
});

// Loading styles
export const getLoadingStyles = () => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '200px',
});

// Error styles
export const getErrorStyles = (theme) => ({
  color: theme.palette.error.main,
  backgroundColor: theme.palette.error.light + '20',
  border: `1px solid ${theme.palette.error.light}`,
  borderRadius: 1,
  padding: 2,
});
