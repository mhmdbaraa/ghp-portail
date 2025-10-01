// Task status options
export const TASK_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Non démarré', color: 'default' },
  { value: 'in_progress', label: 'En cours', color: 'primary' },
  { value: 'completed', label: 'Terminé', color: 'success' },
  { value: 'on_hold', label: 'En attente', color: 'warning' },
  { value: 'cancelled', label: 'Annulé', color: 'error' },
];

// Task priority options
export const TASK_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Basse', color: 'success' },
  { value: 'medium', label: 'Moyenne', color: 'warning' },
  { value: 'high', label: 'Haute', color: 'error' },
  { value: 'urgent', label: 'Urgente', color: 'error' },
];

// Task type options
export const TASK_TYPE_OPTIONS = [
  { value: 'task', label: 'Tâche' },
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Fonctionnalité' },
  { value: 'improvement', label: 'Amélioration' },
];

// Status mapping
export const STATUS_MAPPING = {
  'not_started': 'Non démarré',
  'in_progress': 'En cours',
  'completed': 'Terminé',
  'on_hold': 'En attente',
  'cancelled': 'Annulé',
};

// Priority mapping
export const PRIORITY_MAPPING = {
  'low': 'Basse',
  'medium': 'Moyenne',
  'high': 'Haute',
  'urgent': 'Urgente',
};

// Task type mapping
export const TASK_TYPE_MAPPING = {
  'task': 'Tâche',
  'bug': 'Bug',
  'feature': 'Fonctionnalité',
  'improvement': 'Amélioration',
};

// Default task form
export const DEFAULT_TASK_FORM = {
  title: '',
  description: '',
  status: 'not_started',
  priority: 'medium',
  task_type: 'task',
  project: '',
  assignee: '',
  due_date: '',
  estimated_time: 0,
  notes: ''
};

// Default field errors
export const DEFAULT_FIELD_ERRORS = {
  title: false,
  description: false,
  status: false,
  priority: false,
  task_type: false,
  project: false,
  assignee: false,
  due_date: false,
  estimated_time: false,
  notes: false
};

// Error messages
export const ERROR_MESSAGES = {
  LOAD_TASKS: 'Erreur lors du chargement des tâches.',
  CREATE_TASK: 'Erreur lors de la création de la tâche.',
  UPDATE_TASK: 'Erreur lors de la mise à jour de la tâche.',
  DELETE_TASK: 'Erreur lors de la suppression de la tâche.',
  LOAD_PROJECTS: 'Erreur lors du chargement des projets.',
  LOAD_USERS: 'Erreur lors du chargement des utilisateurs.',
  REQUIRED_FIELD: 'Veuillez remplir tous les champs obligatoires.',
  SELECT_PROJECT: 'Veuillez sélectionner un projet.',
  SELECT_ASSIGNEE: 'Veuillez sélectionner un assigné.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  CREATE_TASK: 'Tâche créée avec succès !',
  UPDATE_TASK: 'Tâche mise à jour avec succès !',
  DELETE_TASK: 'Tâche supprimée avec succès !',
};

// Data grid columns configuration (JSX version should be in a separate .jsx file)
export const DATA_GRID_COLUMNS = [
  {
    field: 'title',
    headerName: 'Titre',
    width: 200,
    // renderCell should be implemented in the component file
  },
  {
    field: 'status',
    headerName: 'Statut',
    width: 120,
    // renderCell should be implemented in the component file
  },
  {
    field: 'priority',
    headerName: 'Priorité',
    width: 100,
    // renderCell should be implemented in the component file
  },
  {
    field: 'assignee',
    headerName: 'Assigné',
    width: 150,
    // renderCell should be implemented in the component file
  },
  {
    field: 'due_date',
    headerName: 'Échéance',
    width: 120,
    // renderCell should be implemented in the component file
  },
];

// Helper functions for colors
export const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'primary';
    case 'on_hold':
      return 'warning';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high':
    case 'critical':
    case 'urgent':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'default';
  }
};
