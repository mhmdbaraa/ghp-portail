// Calendar constants and configuration

export const DATE_RANGE_OPTIONS = [
  { value: '7', label: '7 jours' },
  { value: '30', label: '30 jours' },
  { value: '90', label: '90 jours' },
  { value: '365', label: '1 an' },
];

export const EVENT_TYPES = {
  PROJECT_DEADLINE: 'project_deadline',
  TASK_DEADLINE: 'task_deadline',
  OVERDUE_PROJECT: 'overdue_project',
  OVERDUE_TASK: 'overdue_task',
};

export const EVENT_TYPE_CONFIG = {
  [EVENT_TYPES.PROJECT_DEADLINE]: {
    color: 'primary',
    text: 'Échéance Projet',
    icon: 'Business',
  },
  [EVENT_TYPES.TASK_DEADLINE]: {
    color: 'warning',
    text: 'Échéance Tâche',
    icon: 'Assignment',
  },
  [EVENT_TYPES.OVERDUE_PROJECT]: {
    color: 'error',
    text: 'Projet en Retard',
    icon: 'Warning',
  },
  [EVENT_TYPES.OVERDUE_TASK]: {
    color: 'error',
    text: 'Tâche en Retard',
    icon: 'Warning',
  },
};

export const DEFAULT_DATE_RANGE = '30';

export const ERROR_MESSAGES = {
  LOAD_CALENDAR: 'Erreur lors du chargement des données du calendrier',
  CONNECTION_ERROR: 'Erreur de connexion au serveur',
  FETCH_ERROR: 'Erreur lors de la récupération des données',
};

export const SUCCESS_MESSAGES = {
  DATA_LOADED: 'Données du calendrier chargées avec succès',
};

export const CALENDAR_STYLES = {
  loadingContainer: {
    p: 3,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
  },
  errorContainer: {
    p: 3,
  },
  summaryCard: {
    mb: 3,
    borderRadius: 2,
    boxShadow: 2,
  },
  eventCard: {
    mb: 2,
    borderRadius: 2,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      boxShadow: 4,
      transform: 'translateY(-2px)',
    },
  },
  dateHeader: {
    fontWeight: 600,
    fontSize: '1.1rem',
    mb: 2,
    color: 'primary.main',
  },
  eventChip: {
    fontSize: '0.75rem',
    height: 24,
    fontWeight: 600,
  },
  avatar: {
    width: 32,
    height: 32,
    fontSize: '0.8rem',
  },
};
