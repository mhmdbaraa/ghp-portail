// Project status options
export const PROJECT_STATUS_OPTIONS = [
  { value: 'Planification', label: 'Planification', color: 'default' },
  { value: 'En cours', label: 'En cours', color: 'primary' },
  { value: 'En attente', label: 'En attente', color: 'warning' },
  { value: 'En retard', label: 'En retard', color: 'error' },
  { value: 'Terminé', label: 'Terminé', color: 'success' },
  { value: 'Annulé', label: 'Annulé', color: 'error' },
];

// Priority options
export const PRIORITY_OPTIONS = [
  { value: 'Élevé', label: 'Élevé', color: 'error' },
  { value: 'Moyen', label: 'Moyen', color: 'warning' },
  { value: 'Faible', label: 'Faible', color: 'success' },
];

// Category options
export const CATEGORY_OPTIONS = [
  { value: 'App Web', label: 'App Web' },
  { value: 'App Mobile', label: 'App Mobile' },
  { value: 'Reporting', label: 'Reporting' },
  { value: 'Digitalisation', label: 'Digitalisation' },
  { value: 'ERP', label: 'ERP' },
  { value: 'AI', label: 'AI' },
  { value: 'Web & Mobile', label: 'Web & Mobile' },
  { value: 'Autre', label: 'Autre' },
];

// Department options
export const DEPARTMENT_OPTIONS = [
  { value: 'Comptabilité', label: 'Comptabilité' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Service clients', label: 'Service clients' },
  { value: 'Risque clients', label: 'Risque clients' },
  { value: 'Service généraux', label: 'Service généraux' },
  { value: 'Contrôle de gestion', label: 'Contrôle de gestion' },
  { value: 'Juridique', label: 'Juridique' },
  { value: 'Événementiel', label: 'Événementiel' },
];

// Kanban columns
export const KANBAN_COLUMNS = {
  'En attente': { 
    projects: [], 
    currentPage: 1, 
    totalPages: 0, 
    hasMore: true, 
    totalCount: 0 
  },
  'En cours': { 
    projects: [], 
    currentPage: 1, 
    totalPages: 0, 
    hasMore: true, 
    totalCount: 0 
  },
  'En retard': { 
    projects: [], 
    currentPage: 1, 
    totalPages: 0, 
    hasMore: true, 
    totalCount: 0 
  },
  'Terminé': { 
    projects: [], 
    currentPage: 1, 
    totalPages: 0, 
    hasMore: true, 
    totalCount: 0 
  },
};

// Pagination settings
export const PAGINATION_CONFIG = {
  defaultPageSize: 25,
  pageSizeOptions: [10, 25, 50, 100, 200],
  kanbanProjectsPerColumn: 10,
};

// Task status mapping
export const TASK_STATUS_MAPPING = {
  'not_started': { label: 'Non démarré', color: 'default' },
  'in_progress': { label: 'En cours', color: 'primary' },
  'completed': { label: 'Terminé', color: 'success' },
  'on_hold': { label: 'En pause', color: 'warning' },
  'cancelled': { label: 'Annulé', color: 'error' },
};

// Priority mapping for data transformation
export const PRIORITY_MAPPING = {
  'haute': 'Élevé',
  'Haute': 'Élevé',
  'moyenne': 'Moyen',
  'Moyenne': 'Moyen',
  'faible': 'Faible',
  'Faible': 'Faible',
};

// Category mapping for data transformation
export const CATEGORY_MAPPING = {
  'développement': 'App Web',
  'Développement': 'App Web',
};

// Default form values
export const DEFAULT_PROJECT_FORM = {
  name: '',
  description: '',
  startDate: '',
  deadline: '',
  priority: 'Moyen',
  category: 'App Web',
  department: 'Comptabilité',
  budget: '',
  projectManager: '',
  projectManagerFunction: '',
  filiales: []
};

// Field validation errors
export const DEFAULT_FIELD_ERRORS = {
  name: false,
  description: false,
  startDate: false,
  deadline: false,
  projectManager: false,
  priority: false,
  category: false,
  department: false,
  budget: false,
  filiales: false
};

// Edit field validation errors
export const DEFAULT_EDIT_FIELD_ERRORS = {
  name: false,
  description: false,
  startDate: false,
  deadline: false,
  projectManager: false,
  status: false,
  priority: false,
  category: false,
  department: false,
  budget: false,
  filiales: false
};

// Animation delays
export const ANIMATION_DELAYS = {
  metricCard: 0,
  taskItem: 50,
  projectCard: 100,
  chartCard: 150,
};

// Chart colors
export const CHART_COLORS = {
  primary: '#1976d2',
  success: '#2e7d32',
  warning: '#ed6c02',
  error: '#d32f2f',
  info: '#0288d1',
  grey: '#757575',
};

// Data grid styling
export const DATA_GRID_STYLES = {
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
};

// API endpoints
export const API_ENDPOINTS = {
  projects: '/api/projects/',
  dashboard: '/api/projects/dashboard/',
  tasks: '/api/tasks/',
  users: '/api/users/',
};

// Error messages
export const ERROR_MESSAGES = {
  LOADING_FAILED: 'Erreur lors du chargement des données',
  SAVE_FAILED: 'Erreur lors de la sauvegarde',
  DELETE_FAILED: 'Erreur lors de la suppression',
  VALIDATION_FAILED: 'Veuillez remplir tous les champs obligatoires',
  NETWORK_ERROR: 'Erreur de connexion réseau',
};

// Success messages
export const SUCCESS_MESSAGES = {
  PROJECT_CREATED: 'Projet créé avec succès',
  PROJECT_UPDATED: 'Projet mis à jour avec succès',
  PROJECT_DELETED: 'Projet supprimé avec succès',
  NOTE_POSTED: 'Note publiée avec succès',
};
