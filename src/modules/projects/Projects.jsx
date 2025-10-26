// React imports
import React, { useState, useEffect, useMemo, useCallback, useTransition, useDeferredValue, memo } from 'react';
import { Navigate } from 'react-router-dom';

// Helper function to convert French status to Django format
const convertStatusToDjango = (frenchStatus) => {
  const statusMap = {
    'Planification': 'planification',
    'En cours': 'en_cours',
    'En attente': 'en_attente',
    'En retard': 'en_retard',
    'Terminé': 'termine',
    'Annulé': 'annule'
  };
  return statusMap[frenchStatus] || frenchStatus.toLowerCase().replace(/ /g, '_');
};

// Material-UI core components
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
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Divider,
  useTheme,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';

// Material-UI icons
import {
  Add,
  Visibility,
  Edit,
  Delete,
  MoreVert,
  ViewColumn,
  TableChart,
  DragIndicator,
  CheckCircle,
  Schedule,
  Warning,
  Search,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';

// Date picker components
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';

// Data grid components
import { DataGrid, GridToolbar, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';

// Services
import projectService from '../../shared/services/projectService';
import userService from '../../shared/services/userService';
import axiosInstance from '../../shared/services/axiosInstance';
import ProjectDataTransformer from '../../shared/services/projectDataTransformer';

// Contexts and hooks
import { useAuth } from '../../shared/contexts/AuthContext';
import { useProjectNavigation } from './useProjectNavigation';

// Components
import EditableProgressBar from '../../shared/components/ui/EditableProgressBar';
import ProjectPermissionGuard, { useProjectPermissions } from '../../shared/components/ui/ProjectPermissionGuard';
import NoProjectAccess from '../../shared/components/ui/NoProjectAccess';
import ProjectDetails from './ProjectDetails';
import FileUpload from '../../shared/components/ui/FileUpload';
import AttachmentList from '../../shared/components/ui/AttachmentList';
import attachmentService from '../../shared/services/attachmentService';

// Constants
import {
  PROJECT_STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  CATEGORY_OPTIONS,
  DEPARTMENT_OPTIONS,
  KANBAN_COLUMNS,
  PAGINATION_CONFIG,
  TASK_STATUS_MAPPING,
  PRIORITY_MAPPING,
  CATEGORY_MAPPING,
  DEFAULT_PROJECT_FORM,
  DEFAULT_FIELD_ERRORS,
  DEFAULT_EDIT_FIELD_ERRORS,
  DATA_GRID_STYLES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from './constants';

// Utils
import { 
  handleApiError, 
  showErrorSnackbar, 
  showSuccessSnackbar, 
  handleValidationError 
} from './utils/errorHandler';

// Styles
import { 
  projectStyles, 
  getStatusStyles, 
  getPriorityStyles, 
  getHoverStyles,
  getLoadingStyles 
} from './styles';

const Projects = () => {
  const theme = useTheme();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { canEdit, canCreate, canDelete, isProjectManager, isProjectUser, canView, userRole } = useProjectPermissions();
  
  // Utiliser le hook de navigation pour définir le menu du module
  useProjectNavigation();
  
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
  
  // Block access if user doesn't have required roles
  if (!canView) {
    return <NoProjectAccess userRole={userRole} />;
  }
  
  // Use transition for smoother updates
  const [isPending, startTransition] = useTransition();
  
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' ou 'tableur' (kanban par défaut)
  const [editingCell, setEditingCell] = useState(null);
  
  // Core projects state
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Attachments state
  const [projectAttachments, setProjectAttachments] = useState([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [selectedProjectForAttachments, setSelectedProjectForAttachments] = useState(null);
  
  // Pagination state
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: PAGINATION_CONFIG.defaultPageSize,
  });
  const [totalProjects, setTotalProjects] = useState(0);
  const [paginationLoading, setPaginationLoading] = useState(false);
  
  // Kanban state
  const [kanbanProjects, setKanbanProjects] = useState([]);
  const [kanbanLoading, setKanbanLoading] = useState(false);
  const [kanbanPage, setKanbanPage] = useState(1);
  const [kanbanHasMore, setKanbanHasMore] = useState(true);
  const [kanbanTotalCount, setKanbanTotalCount] = useState(0);
  const [kanbanColumnData, setKanbanColumnData] = useState(KANBAN_COLUMNS);
  
  // Use deferred value for ultra-smooth data updates
  const deferredProjects = useDeferredValue(projects);
  
  // Memoized DataGrid component to prevent unnecessary re-renders
  const MemoizedDataGrid = useMemo(() => {
    return memo(({ rows, columns, paginationModel, onPaginationModelChange, rowCount, loading, components }) => (
      <DataGrid
        rows={rows}
        columns={columns}
        components={components}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        rowCount={rowCount}
        paginationMode="server"
        pageSizeOptions={PAGINATION_CONFIG.pageSizeOptions}
        checkboxSelection
        disableSelectionOnClick
        disableColumnReorder
        hideFooterSelectedRowCount
        density="compact"
        rowHeight={56}
        columnHeaderHeight={44}
        autoHeight={false}
        loading={loading}
        sx={projectStyles.dataGrid}
      />
    ));
  }, []);

  // Memoized columns for DataGrid to prevent unnecessary re-renders
  const dataGridColumns = useMemo(() => [
    {
      field: 'name',
      headerName: 'Nom du Projet',
      width: 350,
      flex: 2,
      minWidth: 300,
      resizable: true,
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          width: '100%', 
          py: 1.5,
          px: 1,
          minHeight: 'auto',
          height: 'auto',
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          overflow: 'visible'
        }}>
          <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: 'primary.main', flexShrink: 0 }}>
            {params.value?.charAt(0)}
          </Avatar>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minWidth: 0, 
            flex: 1, 
            overflow: 'visible',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            justifyContent: 'center'
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600, 
                wordBreak: 'break-word',
                whiteSpace: 'normal',
                lineHeight: 1.3,
                overflow: 'visible',
                textOverflow: 'unset',
                maxWidth: 'none'
              }}
            >
              {params.value}
            </Typography>
            {params.row.description && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary', 
                  wordBreak: 'break-word',
                  whiteSpace: 'normal',
                  lineHeight: 1.2,
                  mt: 0.5,
                  overflow: 'visible',
                  textOverflow: 'unset',
                  maxWidth: 'none'
                }}
              >
                {params.row.description}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Statut',
      width: 100,
      flex: 0,
      resizable: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 1 }}>
          <Chip
            label={params.value}
            size="small"
            color={
              params.value === 'Terminé' ? 'success' :
              params.value === 'En cours' ? 'primary' :
              params.value === 'En attente' ? 'warning' : 'default'
            }
            sx={{ textTransform: 'capitalize' }}
          />
        </Box>
      ),
    },
    {
      field: 'priority',
      headerName: 'Prio',
      width: 80,
      flex: 0,
      resizable: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 1 }}>
          <Chip
            label={params.value}
            size="small"
            variant="outlined"
            color={
              params.value === 'Élevé' ? 'error' :
              params.value === 'Moyen' ? 'warning' : 'default'
            }
            sx={{ textTransform: 'capitalize' }}
          />
        </Box>
      ),
    },
    {
      field: 'progress',
      headerName: 'Progrès',
      width: 120,
      flex: 0,
      resizable: true,
      renderCell: (params) => (
        <Box sx={{ width: '100%', py: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption">{params.value}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={params.value}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
      ),
    },
    {
      field: 'manager_name',
      headerName: 'Chef',
      width: 120,
      flex: 0,
      resizable: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1, justifyContent: 'center' }}>
          <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: 'primary.main' }}>
            {params.value?.charAt(0)}
          </Avatar>
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'deadline',
      headerName: 'Échéance',
      width: 100,
      flex: 0,
      resizable: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 1 }}>
          <Typography variant="body2">
            {params.value ? new Date(params.value).toLocaleDateString('fr-FR') : 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'budget',
      headerName: 'Budget',
      width: 100,
      flex: 0,
      resizable: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.value ? `${params.value.toLocaleString('fr-FR')} DZD` : 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      flex: 0,
      sortable: false,
      filterable: false,
      resizable: false,
      renderCell: (params) => (
        <ActionMenuCell
          row={params.row}
          onView={(project) => {
            setSelectedProject(project);
            setDetailsDialog(true);
          }}
          onEdit={(project) => {
            setEditingProject(project);
            setEditProject({
              name: project.name || '',
              description: project.description || '',
              startDate: project.startDate || '',
              deadline: project.deadline || '',
              status: project.status || 'Planification',
              priority: PRIORITY_MAPPING[project.priority] || project.priority || 'Moyen',
              category: CATEGORY_MAPPING[project.category] || project.category || 'App Web',
              department: project.department || 'Comptabilité',
              budget: project.budget ? project.budget.replace(/[DZD,\s]/g, '') : '',
              projectManager: project.manager || '',
              filiales: project.filiales || []
            });
            setEditSelectedEmployee(
              (project.manager || project.manager_name || project.projectManager)
                ? { id: String(project.manager || ''), name: project.manager_name || project.projectManager || '', function: project.manager_position || project.projectManagerFunction || 'Chef de Projet' }
                : null
            );
            setEditFieldErrors(DEFAULT_EDIT_FIELD_ERRORS);
            setEditProjectDialog(true);
          }}
          onDelete={handleDeleteProject}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      ),
    },
  ], [canEdit, canDelete]);
  
  // Employés réels depuis le backend
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setEmployeesLoading(true);
        // fetch many users (adapt pageSize as needed)
        const result = await userService.getUsers({ page: 1, pageSize: 1000 });
        if (result.success) {
          const apiUsers = result.data.results || result.data || [];
          const mapped = apiUsers.map(u => ({
            id: String(u.id),
            name: u.full_name || u.username || 'Utilisateur',
            function: u.position || u.role || '',
            department: u.department || '',
            email: u.email || '',
            phone: u.phone || '',
            status: u.is_active === false ? 'Inactif' : 'Actif'
          }));
          const sorted = mapped.sort((a, b) => a.name.localeCompare(b.name));
          setEmployees(sorted);
          setFilteredEmployees(sorted);
        } else {
          setEmployees([]);
          setFilteredEmployees([]);
        }
      } finally {
        setEmployeesLoading(false);
      }
    };
    loadEmployees();
  }, []);
  
  // États pour la modale de création de projet
  const [newProjectDialog, setNewProjectDialog] = useState(false);
  const [newProject, setNewProject] = useState(DEFAULT_PROJECT_FORM);

  // États pour la modale d'édition de projet
  const [editProjectDialog, setEditProjectDialog] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editProject, setEditProject] = useState(DEFAULT_PROJECT_FORM);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  // États pour le DataGrid des employés
  const [employeeDialog, setEmployeeDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // États d'erreur pour les champs obligatoires
  const [fieldErrors, setFieldErrors] = useState(DEFAULT_FIELD_ERRORS);

  // États d'erreur pour l'édition
  const [editFieldErrors, setEditFieldErrors] = useState(DEFAULT_EDIT_FIELD_ERRORS);
  
  // État pour contrôler l'ouverture du Select des filiales
  const [filialesSelectOpen, setFilialesSelectOpen] = useState(false);
  const [editFilialesSelectOpen, setEditFilialesSelectOpen] = useState(false);
  const [editSelectedEmployee, setEditSelectedEmployee] = useState(null);

  // États pour le drag & drop
  const [draggedProject, setDraggedProject] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // États pour la confirmation de suppression
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // État pour le dialog de détails
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const ActionMenuCell = ({ row }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleOpen = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const handleView = () => { 
      setSelectedProject(row);
      setDetailsDialog(true);
      handleClose(); 
    };
    const handleEdit = () => { 
      setEditingProject(row);
      setEditProject({
        name: row.name || '',
        description: row.description || '',
        startDate: row.startDate || '',
        deadline: row.deadline || '',
        status: row.status || 'Planification',
        priority: row.priority === 'haute' || row.priority === 'Haute' ? 'Élevé' : row.priority === 'moyenne' || row.priority === 'Moyenne' ? 'Moyen' : row.priority === 'faible' || row.priority === 'Faible' ? 'Faible' : 'Moyen',
        category: row.category === 'développement' || row.category === 'Développement' ? 'App Web' : row.category || 'App Web',
        department: row.department || 'Comptabilité',
        budget: row.budget ? row.budget.replace(/[DZD,\s]/g, '') : '',
        projectManager: row.manager || '',
        filiales: row.filiales || []
      });
      setEditSelectedEmployee(
        (row.manager || row.manager_name || row.projectManager)
          ? { id: String(row.manager || ''), name: row.manager_name || row.projectManager || '', function: row.manager_position || row.projectManagerFunction || 'Chef de Projet' }
          : null
      );
      // Reset field errors when opening edit dialog
      setEditFieldErrors({
        name: false,
        description: false,
        startDate: false,
        deadline: false,
        projectManager: false,
        status: false,
        priority: false,
        category: false,
        budget: false,
        filiales: false
      });
      setEditProjectDialog(true);
      handleClose();
    };
    const handleDelete = () => { 
      handleDeleteProject(row); 
      handleClose(); 
    };

    return (
      <Box sx={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
        <Tooltip title="Actions">
          <IconButton size="small" color="default" sx={{ p: 0.5 }} onClick={handleOpen}>
            <MoreVert fontSize="small" />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              minWidth: 160,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.palette.mode === 'light'
                ? '0 10px 25px rgba(0,0,0,0.12)'
                : '0 10px 25px rgba(0,0,0,0.6)'
            }
          }}
        >
          <MenuItem onClick={handleView}>
            <Visibility fontSize="small" style={{ marginRight: 8 }} /> Voir
          </MenuItem>
          {canEdit && (
            <MenuItem onClick={handleEdit}>
              <Edit fontSize="small" style={{ marginRight: 8 }} /> Modifier
            </MenuItem>
          )}
          {canDelete && (
            <MenuItem onClick={handleDelete}>
              <Delete fontSize="small" style={{ marginRight: 8 }} /> Supprimer
            </MenuItem>
          )}
        </Menu>
      </Box>
    );
  };

  // Composant d'actions pour les cartes Kanban
  const KanbanActionMenu = ({ project }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleOpen = (event) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => setAnchorEl(null);
    
    const handleView = () => { 
      setSelectedProject(project);
      setDetailsDialog(true);
      handleClose(); 
    };
    
    const handleEdit = () => { 
      setEditingProject(project);
      setEditProject({
        name: project.name || '',
        description: project.description || '',
        startDate: project.startDate || project.start_date || '',
        deadline: project.deadline || project.end_date || '',
        status: project.status || 'Planification',
        priority: project.priority === 'haute' || project.priority === 'Haute' ? 'Élevé' : project.priority === 'moyenne' || project.priority === 'Moyenne' ? 'Moyen' : project.priority === 'faible' || project.priority === 'Faible' ? 'Faible' : 'Moyen',
        category: project.category === 'développement' || project.category === 'Développement' ? 'App Web' : project.category || 'App Web',
        department: project.department || 'Comptabilité',
        budget: project.budget ? project.budget.replace(/[DZD,\s]/g, '') : '',
        projectManager: project.manager || project.manager_id || '',
        filiales: project.filiales || project.tags || []
      });
      
      // Handle manager selection with multiple possible property names
      const managerId = project.manager || project.manager_id || project.managerId;
      const managerName = project.manager_name || project.managerName || project.projectManager;
      const managerPosition = project.manager_position || project.managerPosition || project.projectManagerFunction;
      
      setEditSelectedEmployee(
        (managerId || managerName)
          ? { 
              id: String(managerId || ''), 
              name: managerName || '', 
              function: managerPosition || 'Chef de Projet' 
            }
          : null
      );
      
      // Reset field errors when opening edit dialog
      setEditFieldErrors({
        name: false,
        description: false,
        startDate: false,
        deadline: false,
        projectManager: false,
        status: false,
        priority: false,
        category: false,
        budget: false,
        filiales: false
      });
      setEditProjectDialog(true);
      handleClose();
    };
    
    const handleDelete = () => { 
      handleDeleteProject(project); 
      handleClose(); 
    };

    return (
      <Box sx={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
        <Tooltip title="Actions">
          <IconButton size="small" color="default" sx={{ p: 0.5 }} onClick={handleOpen}>
            <MoreVert fontSize="small" />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              minWidth: 160,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.palette.mode === 'light'
                ? '0 10px 25px rgba(0,0,0,0.12)'
                : '0 10px 25px rgba(0,0,0,0.6)'
            }
          }}
        >
          <MenuItem onClick={handleView}>
            <Visibility fontSize="small" style={{ marginRight: 8 }} /> Détail
          </MenuItem>
          {canEdit && (
            <MenuItem onClick={handleEdit}>
              <Edit fontSize="small" style={{ marginRight: 8 }} /> Modifier
            </MenuItem>
          )}
          {canDelete && (
            <MenuItem onClick={handleDelete}>
              <Delete fontSize="small" style={{ marginRight: 8 }} /> Supprimer
            </MenuItem>
          )}
        </Menu>
      </Box>
    );
  };

  // Load projects from API with pagination (legacy function - use loadProjectsForPage instead)
  const loadProjects = async (page = paginationModel.page + 1, pageSize = paginationModel.pageSize) => {
    return loadProjectsForPage(page, pageSize);
  };

  // Separate function for loading projects without affecting pagination state
  const loadProjectsForPage = async (page, pageSize) => {
    try {
      // Single state update to set loading
      setLoading(true);
      setError(null);
      setPaginationLoading(false);
      
      const response = await projectService.getProjects({}, page, pageSize);
      
      if (response.success) {
        // Single state update with all data
        setProjects(response.data);
        setTotalProjects(response.totalCount);
        setLoading(false);
        setPaginationLoading(false);
      } else {
        setError(response.error || 'Failed to load projects');
        setLoading(false);
        setPaginationLoading(false);
        console.error('❌ Error loading projects:', response.error);
      }
    } catch (error) {
      setError('Error loading projects');
      setLoading(false);
      setPaginationLoading(false);
      console.error('❌ Exception loading projects:', error);
    }
  };

  // Handle pagination changes (ultra-optimized to minimize re-renders)
  const handlePaginationModelChange = useCallback((newModel) => {
    // Use transition to make this update non-blocking
    startTransition(() => {
      // Update pagination model immediately for responsive UI
      setPaginationModel(newModel);
    });
    
    // Load new data asynchronously with smart loading state
    const loadData = async () => {
      try {
        // Show pagination loading only if we have existing data (not initial load)
        if (projects.length > 0) {
          setPaginationLoading(true);
        }
        
        const response = await projectService.getProjects({}, newModel.page + 1, newModel.pageSize);
        
        if (response.success) {
          // Use transition for smooth data update
          startTransition(() => {
            setProjects(response.data);
            setTotalProjects(response.totalCount);
            setPaginationLoading(false);
          });
        } else {
          setError(response.error || 'Failed to load projects');
          setLoading(false);
          setPaginationLoading(false);
        }
    } catch (error) {
      const errorInfo = handleApiError(error, 'loading projects');
      setError(errorInfo.message);
      setLoading(false);
      setPaginationLoading(false);
      showErrorSnackbar(setSnackbar, error, 'loading projects');
    }
    };
    
    loadData();
  }, [projects.length]);

  // Load projects for specific kanban column (10 projects per column)
  const loadKanbanColumnProjects = async (status, page = 1) => {
    try {
      setKanbanLoading(true);
      
      // Load 10 projects for this specific status/column
      const response = await projectService.getProjects({ status }, page, 10);
      
      if (response.success) {
        
        setKanbanColumnData(prev => ({
          ...prev,
          [status]: {
            projects: response.data,
            currentPage: page,
            totalPages: Math.ceil(response.totalCount / 10),
            hasMore: page < Math.ceil(response.totalCount / 10),
            totalCount: response.totalCount
          }
        }));
        setKanbanLoading(false);
      } else {
        console.error('❌ Failed to load kanban projects:', response.error);
        setKanbanLoading(false);
        setError(response.error || 'Failed to load kanban projects');
      }
    } catch (error) {
      console.error('❌ Exception loading kanban projects:', error);
      setKanbanLoading(false);
      setError(`Error loading kanban projects: ${error.message}`);
    }
  };

  // Load next page for specific kanban column
  const loadNextKanbanColumnPage = async (status) => {
    const columnData = kanbanColumnData[status];
    
    if (!kanbanLoading && columnData.hasMore) {
      await loadKanbanColumnProjects(status, columnData.currentPage + 1);
    }
  };

  // Load projects on component mount only
  useEffect(() => {
    loadProjectsForPage(1, paginationModel.pageSize);
    
    // Load first 10 projects for each kanban column
    const statuses = ['En attente', 'En cours', 'En retard', 'Terminé'];
    statuses.forEach(status => {
      loadKanbanColumnProjects(status, 1);
    });
  }, []); // Empty dependency array - only runs on mount

  // Project management functions
  const handleCreateProject = async () => {
    try {
      // Validate required (create)
      let hasErrors = false;
      const newErrors = { ...fieldErrors };
      if (!newProject.name?.trim()) { newErrors.name = true; hasErrors = true; }
      if (!newProject.description?.trim()) { newErrors.description = true; hasErrors = true; }
      if (!newProject.startDate) { newErrors.startDate = true; hasErrors = true; }
      if (!newProject.deadline) { newErrors.deadline = true; hasErrors = true; }
      if (!newProject.priority) { newErrors.priority = true; hasErrors = true; }
      if (!newProject.category) { newErrors.category = true; hasErrors = true; }
      if (!newProject.department) { newErrors.department = true; hasErrors = true; }
      if (!selectedEmployee?.id) { newErrors.projectManager = true; hasErrors = true; }

      if (newProject.startDate && newProject.deadline) {
        const start = new Date(newProject.startDate + 'T00:00:00');
        const end = new Date(newProject.deadline + 'T00:00:00');
        if (start >= end) {
          newErrors.deadline = true; hasErrors = true;
          setSnackbar({ open: true, message: 'La date de fin doit être postérieure à la date de début', severity: 'error' });
        }
      }

      // Budget required and must be >= 0
      if (
        newProject.budget === '' ||
        isNaN(Number(newProject.budget)) ||
        Number(newProject.budget) < 0
      ) {
        newErrors.budget = true; hasErrors = true;
      }

      // Filiales required
      if (!newProject.filiales || newProject.filiales.length === 0) {
        newErrors.filiales = true; hasErrors = true;
      }

      if (hasErrors) {
        setFieldErrors(newErrors);
        if (!snackbar.open) setSnackbar({ open: true, message: 'Veuillez remplir les champs obligatoires', severity: 'error' });
        return;
      }
      // Create project data in React format
      const reactProjectData = {
        name: newProject.name,
        description: newProject.description,
        status: 'En attente', // Utiliser le statut par défaut français
        priority: newProject.priority,
        category: newProject.category || 'App Web',
        department: newProject.department || 'Comptabilité',
        startDate: newProject.startDate,
        deadline: newProject.deadline,
        budget: newProject.budget || 0,
        progress: 0,
        notes: newProject.description,
        filiales: newProject.filiales || []
      };
      
      
      
      // Transform to API format
      const transformedData = ProjectDataTransformer.transformProjectForAPI(reactProjectData);
      
      // Add manager from selected employee (required)
      const managerId = selectedEmployee?.id;
      if (!managerId) {
        setFieldErrors(prev => ({ ...prev, projectManager: true }));
        setSnackbar({ open: true, message: 'Veuillez sélectionner un chef de projet', severity: 'error' });
        return;
      }
      const projectData = { ...transformedData, manager: managerId };
      
      // Ensure we have valid data
      if (!projectData.manager) {
        throw new Error('Manager ID is required');
      }
      if (!projectData.start_date) {
        throw new Error('Start date is required');
      }
      if (!projectData.deadline) {
        throw new Error('Deadline is required');
      }
      
      
      const response = await projectService.createProject(projectData);
      
      if (response.success) {
        // Refresh first page to show the new project
        setPaginationModel(prev => ({ ...prev, page: 0 }));
        loadProjectsForPage(1, paginationModel.pageSize);
        // Also refresh kanban data
        // Refresh all kanban columns
        const statuses = ['En attente', 'En cours', 'En retard', 'Terminé'];
        statuses.forEach(status => {
          loadKanbanColumnProjects(status, 1);
        });
        
        // Fermer le dialogue
        setNewProjectDialog(false);
        
        // Réinitialiser le formulaire
        setNewProject({
          name: '',
          description: '',
          startDate: '',
          deadline: '',
          priority: 'Moyen',
          category: 'App Web',
          department: 'Comptabilité',
          budget: '',
          filiales: [],
          projectManager: '',
          projectManagerFunction: ''
        });
        setSelectedEmployee(null);
        
        // Afficher un message de succès
        setSnackbar({
          open: true,
          message: `Projet "${newProject.name}" créé avec succès !`,
          severity: 'success'
        });
        
      } else {
        console.error('Erreur lors de la création du projet:', response.error);
        setSnackbar({
          open: true,
          message: `Erreur lors de la création: ${response.error}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      setSnackbar({
        open: true,
        message: `Erreur de connexion: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const handleUpdateProject = async () => {
    try {
      // Validate form before submitting
      let hasErrors = false;
      const newFieldErrors = { ...editFieldErrors };
      
      if (!editProject.name?.trim()) {
        newFieldErrors.name = true;
        hasErrors = true;
      }
      
      if (!editProject.description?.trim()) {
        newFieldErrors.description = true;
        hasErrors = true;
      }
      
      if (!editProject.startDate) {
        newFieldErrors.startDate = true;
        hasErrors = true;
      }
      
      if (!editProject.deadline) {
        newFieldErrors.deadline = true;
        hasErrors = true;
      }
      
      if (!editSelectedEmployee) {
        newFieldErrors.projectManager = true;
        hasErrors = true;
      }
      
      if (!editProject.priority) {
        newFieldErrors.priority = true;
        hasErrors = true;
      }
      
      if (!editProject.status) {
        newFieldErrors.status = true;
        hasErrors = true;
      }
      
      if (!editProject.category) {
        newFieldErrors.category = true;
        hasErrors = true;
      }
      
      if (!editProject.department) {
        newFieldErrors.department = true;
        hasErrors = true;
      }
      
      if (!editProject.budget || editProject.budget === '') {
        newFieldErrors.budget = true;
        hasErrors = true;
      }
      
      if (!editProject.filiales || editProject.filiales.length === 0) {
        newFieldErrors.filiales = true;
        hasErrors = true;
      }
      
      // Validate date logic
      if (editProject.startDate && editProject.deadline) {
        const startDate = new Date(editProject.startDate + 'T00:00:00');
        const endDate = new Date(editProject.deadline + 'T00:00:00');
        
        if (startDate >= endDate) {
          newFieldErrors.deadline = true;
          hasErrors = true;
          setSnackbar({
            open: true,
            message: 'La date de fin doit être postérieure à la date de début',
            severity: 'error'
          });
        }
      }
      
      if (hasErrors) {
        setEditFieldErrors(newFieldErrors);
        setSnackbar({
          open: true,
          message: 'Veuillez corriger les erreurs avant de soumettre',
          severity: 'error'
        });
        return;
      }
      
      // Create project data in React format (keep French values for transformer)
      const reactProjectData = {
        name: editProject.name,
        description: editProject.description,
        status: editProject.status || 'Planification',
        priority: editProject.priority, // Keep French values (Élevé, Moyen, Faible)
        category: editProject.category, // Keep French values (Web, Mobile, etc.)
        department: editProject.department || 'Comptabilité',
        startDate: editProject.startDate,
        deadline: editProject.deadline,
        budget: editProject.budget || 0,
        progress: editProject.progress || 0,
        notes: editProject.description,
        filiales: editProject.filiales || []
      };
      
      // Transform to API format
      const projectData = ProjectDataTransformer.transformProjectForAPI(reactProjectData);
      
      // Add manager (required for Django backend)
      const managerId = editSelectedEmployee?.id || user?.id;
      if (!managerId) {
        throw new Error('User ID is required to update a project');
      }
      projectData.manager = managerId;
      
      
      // Ensure we have valid data
      if (!projectData.start_date) {
        throw new Error('Start date is required');
      }
      if (!projectData.deadline) {
        throw new Error('Deadline is required');
      }
      
      const response = await projectService.updateProject(editingProject.id, projectData);
      
      if (response.success) {
        // Update the projects state
        setProjects(prev => {
          if (Array.isArray(prev)) {
            return prev.map(project => 
              project.id === editingProject.id ? response.data : project
            );
          } else if (prev && prev.projects && Array.isArray(prev.projects)) {
            return {
              ...prev,
              projects: prev.projects.map(project => 
                project.id === editingProject.id ? response.data : project
              )
            };
          } else {
            // Handle case where prev.projects might be undefined
            const currentProjects = prev?.projects || [];
            return {
              ...prev,
              projects: currentProjects.map(project => 
                project.id === editingProject.id ? response.data : project
              )
            };
          }
          return prev;
        });
        
        // Also update kanban column data if needed
        setKanbanColumnData(prev => {
          // Check if kanbanColumnData exists and has the status column
          if (prev[response.data.status] && prev[response.data.status].projects) {
            return {
              ...prev,
              [response.data.status]: {
                ...prev[response.data.status],
                projects: prev[response.data.status].projects.map(project => 
                  project.id === editingProject.id ? response.data : project
                )
              }
            };
          }
          // If the status doesn't exist in kanban data, just return the previous state
          // This can happen if the status is not one of the kanban columns
          return prev;
        });
        
        setEditProjectDialog(false);
        setEditingProject(null);
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Projet modifié avec succès !',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: `Erreur lors de la modification: ${response.error || 'Failed to update project'}`,
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Erreur lors de la modification: ${error.message}`,
        severity: 'error'
      });
      console.error('Error updating project:', error);
    }
  };

  // Fonctions pour l'édition inline du statut
  const handleStatusChange = async (projectId, newStatus) => {
    try {
      
      // Find the current project to get its original status
      const currentProject = projects.find(p => p.id === projectId);
      const originalStatus = currentProject?.status;
      
      // Update local state immediately for better UX
      setProjects(prev => {
        if (Array.isArray(prev)) {
          return prev.map(project => 
            project.id === projectId ? { ...project, status: newStatus } : project
          );
        } else if (prev && prev.projects && Array.isArray(prev.projects)) {
          return {
            ...prev,
            projects: prev.projects.map(project => 
              project.id === projectId ? { ...project, status: newStatus } : project
            )
          };
        } else {
          // Handle case where prev.projects might be undefined
          const currentProjects = prev?.projects || [];
          return {
            ...prev,
            projects: currentProjects.map(project => 
              project.id === projectId ? { ...project, status: newStatus } : project
            )
          };
        }
        return prev;
      });

      // Call API to update the project
      // Convert status to Django format before sending
      const djangoStatus = convertStatusToDjango(newStatus);
      const result = await projectService.updateProject(projectId, { status: djangoStatus });
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: `Statut mis à jour avec succès: ${getStatusLabel(newStatus)}`,
          severity: 'success'
        });
        
        // Update Kanban columns immediately
        setKanbanColumnData(prev => {
          const newData = { ...prev };
          
          // Remove project from old status column
          if (originalStatus && newData[originalStatus]) {
            newData[originalStatus] = {
              ...newData[originalStatus],
              projects: newData[originalStatus].projects.filter(p => p.id !== projectId),
              totalCount: Math.max(0, newData[originalStatus].totalCount - 1)
            };
          }
          
          // Add project to new status column
          if (newData[newStatus]) {
            const updatedProject = { ...currentProject, status: newStatus };
            newData[newStatus] = {
              ...newData[newStatus],
              projects: [updatedProject, ...newData[newStatus].projects],
              totalCount: newData[newStatus].totalCount + 1
            };
          }
          
          return newData;
        });
        
        // Refresh current page to ensure data consistency
        setTimeout(() => {
          loadProjectsForPage(paginationModel.page + 1, paginationModel.pageSize);
        }, 500);
      } else {
          console.error('❌ API update failed:', result.error);
          // Revert local state if API call failed
          setProjects(prev => {
            if (Array.isArray(prev)) {
              return prev.map(project => 
                project.id === projectId ? { ...project, status: originalStatus } : project
              );
            } else if (prev && prev.projects && Array.isArray(prev.projects)) {
              return {
                ...prev,
                projects: prev.projects.map(project => 
                  project.id === projectId ? { ...project, status: originalStatus } : project
                )
              };
            }
            return prev;
          });
          
          // Extract error message properly
          let errorMessage = 'Erreur inconnue';
          if (typeof result.error === 'string') {
            errorMessage = result.error;
          } else if (result.error && typeof result.error === 'object') {
            // Handle Django validation errors
            if (result.error.status) {
              errorMessage = `Statut invalide: ${result.error.status.join(', ')}`;
            } else if (result.error.detail) {
              errorMessage = result.error.detail;
            } else if (result.error.message) {
              errorMessage = result.error.message;
            } else {
              errorMessage = `Erreur API: ${JSON.stringify(result.error)}`;
            }
          }
          
          setSnackbar({
            open: true,
            message: `Erreur lors de la mise à jour: ${errorMessage}`,
            severity: 'error'
          });
        }
    } catch (error) {
      console.error('❌ Exception during status update:', error);
      // Revert local state
      const currentProject = projects.find(p => p.id === projectId);
      const originalStatus = currentProject?.status;
      setProjects(prev => {
        if (Array.isArray(prev)) {
          return prev.map(project => 
            project.id === projectId ? { ...project, status: originalStatus } : project
          );
        } else if (prev && prev.projects && Array.isArray(prev.projects)) {
          return {
            ...prev,
            projects: prev.projects.map(project => 
              project.id === projectId ? { ...project, status: originalStatus } : project
            )
          };
        }
        return prev;
      });
      setSnackbar({
        open: true,
        message: `Erreur lors de la mise à jour: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setEditingCell(null);
    }
  };

  const handleCellDoubleClick = (projectId) => {
    setEditingCell(projectId);
  };

  // Handle project progress update
  const handleProgressUpdate = async (projectId, newProgress) => {
    try {
      // Find the current project to get its original progress
      const currentProject = projects.find(p => p.id === projectId);
      const originalProgress = currentProject?.progress;
      
      // Update local state immediately for better UX
      setProjects(prev => {
        if (Array.isArray(prev)) {
          return prev.map(project => 
            project.id === projectId ? { ...project, progress: newProgress } : project
          );
        } else if (prev && prev.projects && Array.isArray(prev.projects)) {
          return {
            ...prev,
            projects: prev.projects.map(project => 
              project.id === projectId ? { ...project, progress: newProgress } : project
            )
          };
        }
        return prev;
      });

      // Call API to update the project progress
      const result = await projectService.updateProjectProgress(projectId, newProgress);
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: `Progrès mis à jour avec succès: ${newProgress}%`,
          severity: 'success'
        });
        // Update with the returned data from API
        setProjects(prev => {
          // Handle both array and object structures
          if (Array.isArray(prev)) {
            return prev.map(project => 
              project.id === projectId ? result.data : project
            );
          } else if (prev && prev.projects && Array.isArray(prev.projects)) {
            return {
              ...prev,
              projects: prev.projects.map(project => 
                project.id === projectId ? result.data : project
              )
            };
          } else if (prev && typeof prev === 'object') {
            // If prev is an object but doesn't have a projects array, return as is
            return prev;
          }
          return prev;
        });
        // Update Kanban columns immediately with updated project data
        setKanbanColumnData(prev => {
          const newData = { ...prev };
          const currentStatus = result.data?.status;
          
          if (currentStatus && newData[currentStatus]) {
            // Find and update the project in the appropriate column
            newData[currentStatus] = {
              ...newData[currentStatus],
              projects: newData[currentStatus].projects.map(p => 
                p.id === projectId ? result.data : p
              )
            };
          }
          
          return newData;
        });
        
        // Refresh current page to ensure data consistency
        setTimeout(() => {
          loadProjectsForPage(paginationModel.page + 1, paginationModel.pageSize);
        }, 500);
      } else {
        console.error('❌ API progress update failed:', result.error);
        // Revert local state if API call failed
        setProjects(prev => {
          if (Array.isArray(prev)) {
            return prev.map(project => 
              project.id === projectId ? { ...project, progress: originalProgress } : project
            );
          } else if (prev && prev.projects && Array.isArray(prev.projects)) {
            return {
              ...prev,
              projects: prev.projects.map(project => 
                project.id === projectId ? { ...project, progress: originalProgress } : project
              )
            };
          }
          return prev;
        });
        
        setSnackbar({
          open: true,
          message: `Erreur lors de la mise à jour du progrès: ${result.error}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('❌ Exception during progress update:', error);
      // Revert local state
      setProjects(prev => {
        if (Array.isArray(prev)) {
          return prev.map(project => 
            project.id === projectId ? { ...project, progress: projects.find(p => p.id === projectId)?.progress } : project
          );
        } else if (prev && prev.projects && Array.isArray(prev.projects)) {
          return {
            ...prev,
            projects: prev.projects.map(project => 
              project.id === projectId ? { ...project, progress: projects.find(p => p.id === projectId)?.progress } : project
            )
          };
        }
        return prev;
      });
      setSnackbar({
        open: true,
        message: `Erreur lors de la mise à jour du progrès: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const getStatusLabel = (status) => {
    // Mapping des statuts vers les labels (gère les valeurs françaises et anglaises)
    const statusLabelMap = {
      // Valeurs françaises existantes
      'Planification': 'Planification',
      'En cours': 'En cours',
      'En attente': 'En attente',
      'En retard': 'En retard',
      'Terminé': 'Terminé',
      'Annulé': 'Annulé',
      'paused': 'En pause',
      'active': 'En cours',
      // Valeurs Django (anglaises)
      'planning': 'Planification',
      'in_progress': 'En cours',
      'on_hold': 'En attente',
      'completed': 'Terminé',
      'cancelled': 'Annulé',
    };
    
    return statusLabelMap[status] || status;
  };

  // Colonnes pour le DataGrid optimisées pour l'espace maximum et responsives
  const columns = [
    {
      field: 'projectNumber',
      headerName: 'N°',
      flex: 0.8,
      minWidth: 90,
      renderCell: (params) => (
        <Typography 
          variant="caption" 
          sx={{ 
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'primary.main',
            fontFamily: 'monospace',
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(99, 102, 241, 0.1)' 
              : 'rgba(99, 102, 241, 0.08)',
            padding: '4px 8px',
            borderRadius: 1,
            display: 'inline-block',
          }}
        >
          {params.value || '—'}
        </Typography>
      ),
    },
    {
      field: 'name',
      headerName: 'Projet',
      flex: 2.5,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, width: '100%' }}>
          <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
            {params.value.charAt(0)}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography 
              variant="body2" 
              fontWeight={600} 
              sx={{ 
                lineHeight: 1.2, 
                fontSize: '0.8rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {params.value}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                lineHeight: 1.1, 
                fontSize: '0.7rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {params.row.category}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Statut',
      flex: 1.2,
      minWidth: 100,
      renderCell: (params) => (
        <Box
          onDoubleClick={() => handleCellDoubleClick(params.id)}
          sx={{ 
            cursor: 'pointer',
            '&:hover': { backgroundColor: 'action.hover' },
            position: 'relative',
            backgroundColor: editingCell === params.id ? 'action.selected' : 'transparent',
            borderRadius: 1,
            p: 0.5
          }}
        >
          {editingCell === params.id ? (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={params.value || 'Planification'}
                onChange={(e) => handleStatusChange(params.id, e.target.value)}
                onBlur={() => setEditingCell(null)}
                autoFocus
                open
                sx={{ fontSize: '0.7rem' }}
              >
                {PROJECT_STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Chip 
                      size="small" 
                      color={option.color} 
                      label={option.label}
                      sx={{ mr: 1, fontSize: '0.7rem', height: 20 }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Chip
              label={getStatusLabel(params.value)}
              size="small"
              color={getStatusColor(params.value)}
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
        </Box>
      ),
    },
    {
      field: 'progress',
      headerName: 'Progrès',
      flex: 2.0,
      minWidth: 140,
      renderCell: (params) => (
        <EditableProgressBar
          value={params.value || 0}
          onUpdate={handleProgressUpdate}
          projectId={params.id}
          size="small"
          showPercentage={true}
          sx={{ width: '100%' }}
        />
      ),
    },
    {
      field: 'priority',
      headerName: 'Priorité',
      flex: 1.0,
      minWidth: 90,
      renderCell: (params) => (
        <Chip
          label={getPriorityText(params.value)}
          size="small"
          color={getPriorityColor(params.value)}
          sx={{ fontSize: '0.7rem', height: 20 }}
        />
      ),
    },
    {
      field: 'deadline',
      headerName: 'Échéance',
      flex: 1.3,
      minWidth: 110,
      renderCell: (params) => (
        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'budget',
      headerName: 'Budget',
      flex: 1.2,
      minWidth: 100,
      renderCell: (params) => (
        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'filiales',
      headerName: 'Filiales',
      flex: 1.5,
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {params.value && params.value.map((filiale, index) => (
            <Chip
              key={index}
              label={filiale}
              size="small"
                                      sx={{
                                        fontSize: '0.65rem',
                                        height: 18,
                                        backgroundColor: filiale === 'TOUT' ? 'secondary.main' : 'primary.main',
                                        color: 'white',
                                        '& .MuiChip-label': {
                                          px: 0.4
                                        }
                                      }}
            />
          ))}
        </Box>
      ),
    },
    {
      field: 'projectManager',
      headerName: 'Chef de Projet',
      flex: 1.8,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
            {params.value}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
            {params.row.projectManagerFunction}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 40,
      minWidth: 40,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <ActionMenuCell row={params.row} />
      ),
    },
  ];

  const getPriorityColor = (priority) => {
    return ProjectDataTransformer.getPriorityColor(priority);
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'Élevé':
        return 'Élevé';
      case 'Moyen':
        return 'Moyen';
      case 'Faible':
        return 'Faible';
      default:
        return 'Non définie';
    }
  };

  const getStatusColor = (status) => {
    // Mapping des statuts vers les couleurs (gère les valeurs françaises et anglaises)
    const statusColorMap = {
      // Valeurs françaises existantes
      'Planification': 'default',
      'En cours': 'primary',
      'En attente': 'warning',
      'En retard': 'error',
      'Terminé': 'success',
      'Annulé': 'error',
      'paused': 'warning',
      'active': 'primary',
      // Valeurs Django (anglaises)
      'planning': 'default',
      'in_progress': 'primary',
      'on_hold': 'warning',
      'completed': 'success',
      'cancelled': 'error',
    };
    
    return statusColorMap[status] || 'default';
  };

  // Fonction pour convertir les statuts (maintenant Django accepte les statuts français)
  const convertStatusToDjango = (status) => {
    // Django accepte maintenant les statuts français directement
    // Retourner le statut tel quel (pas de conversion)
    return status;
  };

  // Helper function to safely update projects state
  const updateProjectsState = (prev, updateFn) => {
    const currentProjects = Array.isArray(prev) ? prev : (prev?.projects || []);
    const updatedProjects = updateFn(currentProjects);
    
    if (Array.isArray(prev)) {
      return updatedProjects;
    } else {
      return {
        ...prev,
        projects: updatedProjects
      };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'En cours':
        return <Schedule color="primary" />;
      case 'Presque terminé':
        return <CheckCircle color="success" />;
      case 'En attente':
        return <Warning color="warning" />;
      case 'Terminé':
        return <CheckCircle color="success" />;
      default:
        return <Schedule />;
    }
  };

  // Function to handle Excel export
  const handleExportExcel = async () => {
    try {
      const response = await axiosInstance.get('/projects/export/excel/', {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `export_projets_${new Date().toISOString().slice(0,10)}.xlsx`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSnackbar({
        open: true,
        message: 'Export Excel réussi !',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error exporting Excel:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'export Excel',
        severity: 'error'
      });
    }
  };

  // Toolbar personnalisée avec seulement recherche et export
  const CustomToolbar = () => {
    return (
      <GridToolbarContainer sx={{ 
        p: 1,
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(30, 41, 59, 0.3)'
          : 'rgba(255, 255, 255, 0.3)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2
      }}>
        <GridToolbarQuickFilter 
          placeholder="Rechercher dans les projets..."
          sx={{
            flex: 1,
            maxWidth: 300,
            '& .MuiInputBase-root': {
              backgroundColor: theme.palette.background.paper,
              borderRadius: 1,
              '& fieldset': {
                borderColor: theme.palette.divider,
              },
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
              },
            },
            '& .MuiInputBase-input': {
              color: theme.palette.text.primary,
              fontSize: '0.875rem',
            },
          }}
        />
        <Tooltip title="Exporter vers Excel (Projets + Tâches + Combiné)">
          <Button
            size="small"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportExcel}
            sx={{
              color: theme.palette.primary.main,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(129, 140, 248, 0.1)'
                  : 'rgba(99, 102, 241, 0.1)'
              }
            }}
          >
            Export Excel
          </Button>
        </Tooltip>
      </GridToolbarContainer>
    );
  };

  // Gestionnaire pour le changement de vue
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  // Fonctions pour le drag & drop
  const handleDragStart = (event, project) => {
    setDraggedProject(project);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', event.target.outerHTML);
  };

  const handleDragOver = (event, status) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOverColumn(null);
  };

  const handleDrop = async (event, targetStatus) => {
    event.preventDefault();
    
    if (draggedProject && draggedProject.status !== targetStatus) {
      
      // Update local state immediately for better UX
      setProjects(prev => updateProjectsState(prev, projects => 
        projects.map(project => 
          project.id === draggedProject.id 
            ? { ...project, status: targetStatus }
            : project
        )
      ));
      
      try {
        // Convert status to Django format before sending
        const djangoStatus = convertStatusToDjango(targetStatus);
        
        // Call API to update the project status
        const result = await projectService.updateProject(draggedProject.id, { status: djangoStatus });
        
        if (result.success) {
          setSnackbar({
            open: true,
            message: `Projet "${draggedProject.name}" déplacé vers "${getStatusLabel(targetStatus)}"`,
            severity: 'success'
          });
          // Refresh current page to ensure data consistency
          setTimeout(() => {
            loadProjectsForPage(paginationModel.page + 1, paginationModel.pageSize);
            // Also refresh kanban data
            // Refresh all kanban columns
        const statuses = ['En attente', 'En cours', 'En retard', 'Terminé'];
        statuses.forEach(status => {
          loadKanbanColumnProjects(status, 1);
        });
          }, 1000);
        } else {
          console.error('❌ API update failed:', result.error);
          // Revert local state if API call failed
          setProjects(prev => updateProjectsState(prev, projects => 
            projects.map(project => 
              project.id === draggedProject.id 
                ? { ...project, status: draggedProject.status }
                : project
            )
          ));
          
          // Extract error message properly
          let errorMessage = 'Erreur inconnue';
          if (typeof result.error === 'string') {
            errorMessage = result.error;
          } else if (result.error && typeof result.error === 'object') {
            // Handle Django validation errors
            if (result.error.status) {
              errorMessage = `Statut invalide: ${result.error.status.join(', ')}`;
            } else if (result.error.detail) {
              errorMessage = result.error.detail;
            } else if (result.error.message) {
              errorMessage = result.error.message;
            } else {
              errorMessage = `Erreur API: ${JSON.stringify(result.error)}`;
            }
          }
          
          setSnackbar({
            open: true,
            message: `Erreur lors du déplacement: ${errorMessage}`,
            severity: 'error'
          });
        }
      } catch (error) {
        console.error('❌ Exception during drag & drop update:', error);
        // Revert local state
        setProjects(prev => ({
          ...prev,
          projects: prev.projects.map(project => 
            project.id === draggedProject.id 
              ? { ...project, status: draggedProject.status }
              : project
          )
        }));
        setSnackbar({
          open: true,
          message: `Erreur lors du déplacement: ${error.message}`,
          severity: 'error'
        });
      }
    }
    
    setDraggedProject(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedProject(null);
    setDragOverColumn(null);
  };

  // Fonctions pour la suppression de projet
  const handleDeleteProject = (project) => {
    setProjectToDelete(project);
    setDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (projectToDelete) {
      try {
        const response = await projectService.deleteProject(projectToDelete.id);
        
        if (response.success) {
          // Supprimer le projet de la liste
          setProjects(prev => ({
            ...prev,
            projects: prev.projects.filter(project => project.id !== projectToDelete.id)
          }));
          
          // Afficher un message de succès
          setSnackbar({
            open: true,
            message: `Projet "${projectToDelete.name}" supprimé avec succès`,
            severity: 'success'
          });
        } else {
          setSnackbar({
            open: true,
            message: `Erreur lors de la suppression: ${response.error || 'Failed to delete project'}`,
            severity: 'error'
          });
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: `Erreur lors de la suppression: ${error.message}`,
          severity: 'error'
        });
        console.error('Error deleting project:', error);
      }
    }
    
    setDeleteDialog(false);
    setProjectToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialog(false);
    setProjectToDelete(null);
  };

  // Gestionnaires pour la modale de création de module
  const handleNewProject = () => {
    setNewProjectDialog(true);
  };

  const handleCloseDialog = () => {
    setNewProjectDialog(false);
    setNewProject({ 
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
    });
    setSelectedEmployee(null);
    setFieldErrors({
      name: false,
      description: false,
      startDate: false,
      deadline: false,
      projectManager: false,
      priority: false,
      category: false,
      budget: false,
      filiales: false
    });
  };

  // Fonctions pour le modal d'édition
  const handleCloseEditDialog = () => {
    setEditProjectDialog(false);
    setEditingProject(null);
    // Don't reset the form immediately to avoid controlled/uncontrolled warnings
    // The form will be properly initialized when the dialog opens again
    setEditSelectedEmployee(null);
    setEditFieldErrors({
      name: false,
      description: false,
      startDate: false,
      deadline: false,
      projectManager: false,
      priority: false,
      category: false,
      budget: false,
      filiales: false
    });
  };

  const handleSubmitProject = async () => {
    // Réinitialiser les erreurs
    setFieldErrors({
      name: false,
      description: false,
      startDate: false,
      deadline: false,
      projectManager: false,
      priority: false,
      category: false,
      budget: false,
      filiales: false
    });
    
    let hasErrors = false;
    const newFieldErrors = { ...fieldErrors };
    
    // Validation des champs obligatoires
    if (!newProject.name.trim()) {
      newFieldErrors.name = true;
      hasErrors = true;
    }
    
    if (!newProject.description.trim()) {
      newFieldErrors.description = true;
      hasErrors = true;
    }
    
    if (!newProject.startDate) {
      newFieldErrors.startDate = true;
      hasErrors = true;
    }
    
    if (!newProject.deadline) {
      newFieldErrors.deadline = true;
      hasErrors = true;
    }
    
    if (!newProject.priority) {
      newFieldErrors.priority = true;
      hasErrors = true;
    }
    
    if (!newProject.category) {
      newFieldErrors.category = true;
      hasErrors = true;
    }
    
    if (!newProject.department) {
      newFieldErrors.department = true;
      hasErrors = true;
    }
    
    // Validation des dates
    if (newProject.startDate && newProject.deadline) {
      const startDate = new Date(newProject.startDate + 'T00:00:00');
      const endDate = new Date(newProject.deadline + 'T00:00:00');
      
      if (startDate >= endDate) {
        newFieldErrors.deadline = true;
        hasErrors = true;
        setSnackbar({
          open: true,
          message: 'La date de fin doit être postérieure à la date de début',
          severity: 'error'
        });
        setFieldErrors(newFieldErrors);
        return;
      }
    }
    
    if (hasErrors) {
      setFieldErrors(newFieldErrors);
      setSnackbar({
        open: true,
        message: 'Veuillez remplir tous les champs obligatoires',
        severity: 'error'
      });
      return;
    }
    
    // Appeler la fonction de création de projet avec l'API
    await handleCreateProject();
  };

  const handleSubmitEditProject = () => {
    // Call the actual update function which now includes all validation
    handleUpdateProject();
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fonctions pour effacer les erreurs lors de la saisie
  const handleNameChange = (e) => {
    setNewProject({ ...newProject, name: e.target.value });
    if (fieldErrors.name) {
      setFieldErrors({ ...fieldErrors, name: false });
    }
  };

  const handleDescriptionChange = (e) => {
    setNewProject({ ...newProject, description: e.target.value });
    if (fieldErrors.description) {
      setFieldErrors({ ...fieldErrors, description: false });
    }
  };

  const handleStartDateChange = (date) => {
    let formattedDate = '';
    if (date && !isNaN(date.getTime())) {
      // Vérifier que la date est valide avant de la formater
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      formattedDate = `${year}-${month}-${day}`;
    }
    
    setNewProject({ 
      ...newProject, 
      startDate: formattedDate
    });
    
    // Validation en temps réel : vérifier si la date de début est antérieure à la date de fin
    if (formattedDate && newProject.deadline) {
      const startDate = new Date(formattedDate + 'T00:00:00');
      const endDate = new Date(newProject.deadline + 'T00:00:00');
      
      if (startDate >= endDate) {
        setFieldErrors({ ...fieldErrors, deadline: true });
        setSnackbar({
          open: true,
          message: 'La date de fin doit être postérieure à la date de début',
          severity: 'error'
        });
        return;
      }
    }
    
    if (fieldErrors.startDate) {
      setFieldErrors({ ...fieldErrors, startDate: false });
    }
  };

  const handleDeadlineChange = (date) => {
    let formattedDate = '';
    if (date && !isNaN(date.getTime())) {
      // Vérifier que la date est valide avant de la formater
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      formattedDate = `${year}-${month}-${day}`;
    }
    
    setNewProject({ 
      ...newProject, 
      deadline: formattedDate
    });
    
    // Validation en temps réel : vérifier si la date de fin est postérieure à la date de début
    if (formattedDate && newProject.startDate) {
      const startDate = new Date(newProject.startDate + 'T00:00:00');
      const endDate = new Date(formattedDate + 'T00:00:00');
      
      if (startDate >= endDate) {
        setFieldErrors({ ...fieldErrors, deadline: true });
        setSnackbar({
          open: true,
          message: 'La date de fin doit être postérieure à la date de début',
          severity: 'error'
        });
        return;
      }
    }
    
    if (fieldErrors.deadline) {
      setFieldErrors({ ...fieldErrors, deadline: false });
    }
  };

  const handlePriorityChange = (e) => {
    setNewProject({ ...newProject, priority: e.target.value });
    if (fieldErrors.priority) {
      setFieldErrors({ ...fieldErrors, priority: false });
    }
  };

  const handleCategoryChange = (e) => {
    setNewProject({ ...newProject, category: e.target.value });
    if (fieldErrors.category) {
      setFieldErrors({ ...fieldErrors, category: false });
    }
  };

  const handleDepartmentChange = (e) => {
    setNewProject({ ...newProject, department: e.target.value });
    if (fieldErrors.department) {
      setFieldErrors({ ...fieldErrors, department: false });
    }
  };

  const handleBudgetChange = (e) => {
    console.log('💰 Budget change:', e.target.value);
    setNewProject({ ...newProject, budget: e.target.value });
    if (fieldErrors.budget) {
      setFieldErrors({ ...fieldErrors, budget: false });
    }
  };

  // Gestionnaires pour le DataGrid des employés
  const handleOpenEmployeeDialog = () => {
    setEmployeeDialog(true);
    setSearchTerm('');
    setFilteredEmployees(employees);
  };

  const handleCloseEmployeeDialog = () => {
    setEmployeeDialog(false);
    setSearchTerm('');
    // Ne pas réinitialiser selectedEmployee ici car il peut être sélectionné
  };

  const handleSearchChange = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === '') {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(employee => 
        employee.name.toLowerCase().includes(term) ||
        employee.function.toLowerCase().includes(term) ||
        employee.department.toLowerCase().includes(term) ||
        employee.email.toLowerCase().includes(term)
      );
      setFilteredEmployees(filtered);
    }
  };

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setNewProject({ ...newProject, projectManager: employee.id });
    if (fieldErrors.projectManager) {
      setFieldErrors({ ...fieldErrors, projectManager: false });
    }
    handleCloseEmployeeDialog();
  };

  const handleSelectEditEmployee = (employee) => {
    setEditSelectedEmployee(employee);
    setEditProject({ ...editProject, projectManager: employee.id });
    if (editFieldErrors.projectManager) {
      setEditFieldErrors({ ...editFieldErrors, projectManager: false });
    }
    handleCloseEmployeeDialog();
  };

  // Fonction de gestion des filiales avec logique spéciale pour "TOUT"
  const handleFilialesChange = (event) => {
    const value = event.target.value;
    console.log('🏢 Filiales change:', value);
    let newFiliales = typeof value === 'string' ? value.split(',') : (value || []);
    
    // S'assurer que newFiliales est toujours un tableau
    if (!Array.isArray(newFiliales)) {
      newFiliales = [];
    }
    
    // Logique spéciale pour "TOUT"
    if (newFiliales.includes('TOUT')) {
      // Si "TOUT" est sélectionné, ne garder que "TOUT"
      newFiliales = ['TOUT'];
    } else if (newFiliales.length > 1) {
      // Si plusieurs options sont sélectionnées, s'assurer qu'il n'y a pas de doublons
      newFiliales = [...new Set(newFiliales)];
    }
    
    console.log('🏢 New filiales:', newFiliales);
    setNewProject({ ...newProject, filiales: newFiliales });
    if (fieldErrors.filiales) {
      setFieldErrors({ ...fieldErrors, filiales: false });
    }
    
    // Fermer automatiquement le panneau après la sélection
    setFilialesSelectOpen(false);
  };

  // Fonctions de gestion des champs pour l'édition
  const handleEditNameChange = (e) => {
    setEditProject({ ...editProject, name: e.target.value });
    if (editFieldErrors.name) {
      setEditFieldErrors({ ...editFieldErrors, name: false });
    }
  };

  const handleEditDescriptionChange = (e) => {
    setEditProject({ ...editProject, description: e.target.value });
    if (editFieldErrors.description) {
      setEditFieldErrors({ ...editFieldErrors, description: false });
    }
  };

  const handleEditStartDateChange = (date) => {
    let formattedDate = '';
    if (date && !isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      formattedDate = `${year}-${month}-${day}`;
    }
    setEditProject({ ...editProject, startDate: formattedDate });
    
    if (formattedDate && editProject.deadline) {
      const startDate = new Date(formattedDate + 'T00:00:00');
      const endDate = new Date(editProject.deadline + 'T00:00:00');
      
      if (startDate >= endDate) {
        setEditFieldErrors({ ...editFieldErrors, deadline: true });
        setSnackbar({
          open: true,
          message: 'La date de fin doit être postérieure à la date de début',
          severity: 'error'
        });
        return;
      }
    }
    
    if (editFieldErrors.startDate) {
      setEditFieldErrors({ ...editFieldErrors, startDate: false });
    }
  };

  const handleEditDeadlineChange = (date) => {
    let formattedDate = '';
    if (date && !isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      formattedDate = `${year}-${month}-${day}`;
    }
    setEditProject({ ...editProject, deadline: formattedDate });
    
    if (formattedDate && editProject.startDate) {
      const startDate = new Date(editProject.startDate + 'T00:00:00');
      const endDate = new Date(formattedDate + 'T00:00:00');
      
      if (startDate >= endDate) {
        setEditFieldErrors({ ...editFieldErrors, deadline: true });
        setSnackbar({
          open: true,
          message: 'La date de fin doit être postérieure à la date de début',
          severity: 'error'
        });
        return;
      }
    }
    
    if (editFieldErrors.deadline) {
      setEditFieldErrors({ ...editFieldErrors, deadline: false });
    }
  };

  const handleEditPriorityChange = (e) => {
    setEditProject({ ...editProject, priority: e.target.value });
    if (editFieldErrors.priority) {
      setEditFieldErrors({ ...editFieldErrors, priority: false });
    }
  };

  const handleEditStatusChange = (e) => {
    setEditProject({ ...editProject, status: e.target.value });
    if (editFieldErrors.status) {
      setEditFieldErrors({ ...editFieldErrors, status: false });
    }
  };

  const handleEditCategoryChange = (e) => {
    setEditProject({ ...editProject, category: e.target.value });
    if (editFieldErrors.category) {
      setEditFieldErrors({ ...editFieldErrors, category: false });
    }
  };

  const handleEditDepartmentChange = (e) => {
    setEditProject({ ...editProject, department: e.target.value });
    if (editFieldErrors.department) {
      setEditFieldErrors({ ...editFieldErrors, department: false });
    }
  };

  const handleEditBudgetChange = (e) => {
    setEditProject({ ...editProject, budget: e.target.value });
    if (editFieldErrors.budget) {
      setEditFieldErrors({ ...editFieldErrors, budget: false });
    }
  };

  const handleEditFilialesChange = (event) => {
    const value = event.target.value;
    let newFiliales = typeof value === 'string' ? value.split(',') : (value || []);
    
    // S'assurer que newFiliales est toujours un tableau
    if (!Array.isArray(newFiliales)) {
      newFiliales = [];
    }
    
    // Logique spéciale pour "TOUT"
    if (newFiliales.includes('TOUT')) {
      // Si "TOUT" est sélectionné, ne garder que "TOUT"
      newFiliales = ['TOUT'];
    } else if (newFiliales.length > 1) {
      // Si plusieurs options sont sélectionnées, s'assurer qu'il n'y a pas de doublons
      newFiliales = [...new Set(newFiliales)];
    }
    
    setEditProject({ ...editProject, filiales: newFiliales });
    if (editFieldErrors.filiales) {
      setEditFieldErrors({ ...editFieldErrors, filiales: false });
    }
    
    // Fermer automatiquement le panneau après la sélection
    setEditFilialesSelectOpen(false);
  };

  // Fonction utilitaire pour créer une date valide
  const createValidDate = (dateString) => {
    if (!dateString) return null;
    
    // Si c'est déjà au format YYYY-MM-DD, créer la date directement
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const date = new Date(dateString + 'T00:00:00');
      return !isNaN(date.getTime()) ? date : null;
    }
    
    return null;
  };

  const handleRowClick = (params) => {
    // Check which dialog is open to use the correct handler
    if (editProjectDialog) {
      handleSelectEditEmployee(params.row);
    } else {
      handleSelectEmployee(params.row);
    }
  };

  // Colonnes pour le DataGrid des employés
  const employeeColumns = [
    {
      field: 'name',
      headerName: 'Nom',
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, fontSize: '0.85rem' }}>
            {params.value.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'function',
      headerName: 'Fonction',
      flex: 2,
      minWidth: 180,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'department',
      headerName: 'Département',
      flex: 1.5,
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontSize: '0.75rem' }}
        />
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
        <Typography variant="caption" sx={{ fontSize: '0.8rem' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Statut',
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Actif' ? 'success' : params.value === 'Inactif' ? 'error' : 'warning'}
          sx={{ fontSize: '0.75rem' }}
        />
      ),
    },
  ];

  // Memoized Kanban columns to prevent unnecessary re-renders
  const kanbanColumns = useMemo(() => [
    {
      id: 'En attente',
      title: 'En attente',
      color: theme.palette.warning.main,
      projects: kanbanColumnData['En attente']?.projects || [],
      hasMore: kanbanColumnData['En attente']?.hasMore || false,
      onLoadMore: () => loadNextKanbanColumnPage('En attente'),
    },
    {
      id: 'En cours',
      title: 'En cours',
      color: theme.palette.primary.main,
      projects: kanbanColumnData['En cours']?.projects || [],
      hasMore: kanbanColumnData['En cours']?.hasMore || false,
      onLoadMore: () => loadNextKanbanColumnPage('En cours'),
    },
    {
      id: 'En retard',
      title: 'En retard',
      color: theme.palette.error.main,
      projects: kanbanColumnData['En retard']?.projects || [],
      hasMore: kanbanColumnData['En retard']?.hasMore || false,
      onLoadMore: () => loadNextKanbanColumnPage('En retard'),
    },
    {
      id: 'Terminé',
      title: 'Terminé',
      color: theme.palette.success.main,
      projects: kanbanColumnData['Terminé']?.projects || [],
      hasMore: kanbanColumnData['Terminé']?.hasMore || false,
      onLoadMore: () => loadNextKanbanColumnPage('Terminé'),
    },
  ], [kanbanColumnData, theme.palette]);

  // Grouper les projets par statut pour la vue Kanban (using column-specific data) - memoized for performance
  const groupedProjects = useMemo(() => {
    // Use column-specific data (10 projects per column) with safety checks
    const kanbanData = kanbanColumnData || {};
    const grouped = {
      'En attente': kanbanData['En attente']?.projects || [],
      'En cours': kanbanData['En cours']?.projects || [],
      'En retard': kanbanData['En retard']?.projects || [],
      'Terminé': kanbanData['Terminé']?.projects || [],
    };
    
    // console.log('📊 Column projects (10 per column):', {
    //   'En attente': grouped['En attente'].length,
    //   'En cours': grouped['En cours'].length,
    //   'En retard': grouped['En retard'].length,
    //   'Terminé': grouped['Terminé'].length,
    // });
    
    return grouped;
  }, [kanbanColumnData]);

  // Show loading state only for initial load, not for pagination
  if ((loading && projects.length === 0) || (viewMode === 'kanban' && kanbanLoading && projects.length === 0)) {
    return (
      <Box sx={{ 
        p: { xs: 0.25, sm: 0.5, md: 0.75 }, 
        height: 'calc(100vh - 120px)',
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
      }}>
        <Typography variant="h6" color="text.secondary">
          Chargement des projets...
        </Typography>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ 
        p: { xs: 0.25, sm: 0.5, md: 0.75 }, 
        height: 'calc(100vh - 120px)',
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
      }}>
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          <Typography variant="h6" gutterBottom>
            Erreur de chargement
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => loadProjectsForPage(paginationModel.page + 1, paginationModel.pageSize)}
            sx={{ mt: 2 }}
          >
            Réessayer
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 0.25, sm: 0.5, md: 0.75 }, 
      height: 'calc(100vh - 120px)',
      minHeight: 'calc(100vh - 120px)',
      maxHeight: 'calc(100vh - 120px)', 
      display: 'flex', 
      flexDirection: 'column',
      width: '100%',
      maxWidth: '100vw',
      overflow: 'hidden'
    }}>
      {/* En-tête de la page avec toggle intégré - optimisé pour l'espace */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        mb: 0.25,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 0.75
      }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h4" fontWeight={700} sx={{ 
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
            mb: 0.25
          }}>
            Projets
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ 
            fontSize: { xs: '0.75rem', sm: '0.8rem' },
            lineHeight: 1.3
          }}>
            Gérez tous vos projets et suivez leur progression
            {editingCell && (
              <Typography variant="caption" color="primary" sx={{ ml: 2 }}>
                (Double-cliquez sur le statut pour l'éditer)
              </Typography>
            )}
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1, sm: 2 },
          flexShrink: 0,
          flexWrap: 'wrap'
        }}>
          {/* Toggle de vue compact avec thème adaptatif */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewChange}
            aria-label="Mode d'affichage"
            size="small"
            sx={{
              background: theme.palette.mode === 'dark' 
                ? 'rgba(30, 41, 59, 0.8)' 
                : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              '& .MuiToggleButton-root': {
                px: { xs: 1, sm: 1.5 },
                py: 1,
                border: 'none',
                borderRadius: 2,
                color: theme.palette.text.secondary,
                minWidth: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(129, 140, 248, 0.15)'
                    : 'rgba(99, 102, 241, 0.15)',
                  color: theme.palette.primary.main,
                  transform: 'scale(1.05)',
                },
                '&.Mui-selected': {
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #818cf8, #f472b6)'
                    : 'linear-gradient(135deg, #6366f1, #ec4899)',
                  color: theme.palette.mode === 'dark' ? '#000000' : '#ffffff',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 4px 12px rgba(129, 140, 248, 0.4)'
                    : '0 4px 12px rgba(99, 102, 241, 0.4)',
                  '&:hover': {
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, #a5b4fc, #f9a8d4)'
                      : 'linear-gradient(135deg, #818cf8, #f472b6)',
                    transform: 'scale(1.05)',
                  },
                },
              },
            }}
          >
            <ToggleButton value="kanban" aria-label="Vue Kanban">
              <ViewColumn sx={{ fontSize: { xs: 16, sm: 18 } }} />
            </ToggleButton>
            <ToggleButton value="tableur" aria-label="Vue Tableur">
              <TableChart sx={{ fontSize: { xs: 16, sm: 18 } }} />
            </ToggleButton>
          </ToggleButtonGroup>

          <ProjectPermissionGuard requireManager>
            <Button
              variant="contained"
              startIcon={<Add />}
              size="small"
              onClick={handleNewProject}
              sx={{
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #818cf8 0%, #f472b6 100%)'
                  : 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                '&:hover': {
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #a5b4fc 0%, #f9a8d4 100%)'
                    : 'linear-gradient(135deg, #818cf8 0%, #f472b6 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 6px 20px rgba(129, 140, 248, 0.4)'
                    : '0 6px 20px rgba(99, 102, 241, 0.4)',
                },
                transition: 'all 0.2s ease',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 4px 12px rgba(129, 140, 248, 0.3)'
                  : '0 4px 12px rgba(99, 102, 241, 0.3)',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.5, sm: 1 },
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Nouveau
              </Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                +
              </Box>
            </Button>
          </ProjectPermissionGuard>

        </Box>
      </Box>

      {/* Contenu selon le mode de vue - optimisé pour l'espace */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {viewMode === 'kanban' ? (
          /* Vue Kanban optimisée pour l'espace maximum */
          <Box sx={{ 
            height: '100%', 
            overflowX: 'auto', 
            overflowY: 'hidden',
            width: '100%',
            // Ensure scrollbars are visible
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(0, 0, 0, 0.1)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.3)' 
                : 'rgba(0, 0, 0, 0.3)',
              borderRadius: '4px',
              '&:hover': {
                background: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.5)' 
                  : 'rgba(0, 0, 0, 0.5)',
              },
            },
          }}>
            <Grid 
              container 
              spacing={{ xs: 1, sm: 1.5, md: 2 }} 
              wrap="nowrap" 
              sx={{ 
                height: '100%', 
                minWidth: { xs: '100%', sm: 800, md: 1000, lg: 1200 },
                width: '100%'
              }}
            >
              {Object.entries(groupedProjects).map(([status, statusProjects]) => (
                <Grid 
                  item 
                  key={status} 
                  sx={{ 
                    height: '100%', 
                    flex: '1 1 0',
                    minWidth: 0,
                    maxWidth: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 'calc(100vh - 200px)', // Ensure minimum height for scrolling
                  }}
                >
                                     <Paper
                     sx={{
                       height: '100%',
                       width: '100%',
                       p: 1.5,
                       background: theme.palette.mode === 'dark'
                         ? 'rgba(30, 41, 59, 0.8)'
                         : 'rgba(255, 255, 255, 0.8)',
                       backdropFilter: 'blur(20px)',
                       border: `1px solid ${theme.palette.divider}`,
                       borderRadius: 2,
                       display: 'flex',
                       flexDirection: 'column',
                       boxShadow: theme.palette.mode === 'dark'
                         ? '0 4px 20px rgba(0, 0, 0, 0.3)'
                         : '0 4px 20px rgba(0, 0, 0, 0.1)',
                       minHeight: 'calc(100vh - 200px)', // Ensure minimum height
                       maxHeight: 'calc(100vh - 200px)', // Limit maximum height
                       overflow: 'visible' // Allow scrolling
                     }}
                   >
                    {/* En-tête de la colonne compact */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      {getStatusIcon(status)}
                      <Typography variant="subtitle2" fontWeight={600} sx={{ flex: 1 }}>
                        {status}
                      </Typography>
                      <Chip
                        label={statusProjects.length}
                        size="small"
                        color="primary"
                        sx={{ minWidth: 24, height: 20, fontSize: '0.75rem' }}
                      />
                    </Box>

                    <Divider sx={{ mb: 1.5 }} />

                    {/* Cartes des projets optimisées */}
                    <Box 
                      onDragOver={(e) => handleDragOver(e, status)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, status)}
                      onScroll={(e) => {
                        // Infinite scroll detection with better logic
                        const { scrollTop, scrollHeight, clientHeight } = e.target;
                        const threshold = 200; // Load when 200px from bottom (increased for better detection)
                        
                        // Reduced logging for performance - only log when near bottom
                        if (scrollTop + clientHeight >= scrollHeight - threshold) {
                          console.log('📜 Near bottom scroll event:', {
                            scrollTop,
                            scrollHeight,
                            clientHeight,
                            threshold,
                            nearBottom: true,
                            kanbanLoading: kanbanLoading,
                            kanbanHasMore: kanbanHasMore
                          });
                        }
                        
                        // Check if we're near the bottom and not already loading
                        const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold;
                        const isVeryClose = scrollTop + clientHeight >= scrollHeight - 50; // Fallback threshold
                        
                        if ((isNearBottom || isVeryClose) && 
                            !kanbanLoading && 
                            kanbanColumnData[status].hasMore) {
                          console.log(`🔄 Triggering next page load for ${status} column`, {
                            isNearBottom,
                            isVeryClose,
                            distanceFromBottom: scrollHeight - (scrollTop + clientHeight),
                            currentPage: kanbanColumnData[status].currentPage,
                            nextPage: kanbanColumnData[status].currentPage + 1
                          });
                          loadNextKanbanColumnPage(status);
                        }
                      }}
                      sx={{
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 1.5, 
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        minHeight: 0,
                        width: '100%',
                        backgroundColor: dragOverColumn === status 
                          ? theme.palette.mode === 'dark'
                            ? 'rgba(129, 140, 248, 0.1)'
                            : 'rgba(99, 102, 241, 0.1)'
                          : 'transparent',
                        border: dragOverColumn === status 
                          ? `2px dashed ${theme.palette.primary.main}`
                          : '2px dashed transparent',
                        borderRadius: 1,
                        transition: 'all 0.3s ease-in-out',
                        // Enhanced scrollbar styling - more visible
                        '&::-webkit-scrollbar': {
                          width: '12px', // Increased width
                        },
                        '&::-webkit-scrollbar-track': {
                          background: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.2)' 
                            : 'rgba(0, 0, 0, 0.2)', // More visible track
                          borderRadius: '6px',
                          border: `1px solid ${theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.1)' 
                            : 'rgba(0, 0, 0, 0.1)'}`,
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.6)' 
                            : 'rgba(0, 0, 0, 0.6)', // More visible thumb
                          borderRadius: '6px',
                          border: `1px solid ${theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.3)' 
                            : 'rgba(0, 0, 0, 0.3)'}`,
                          '&:hover': {
                            background: theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.8)' 
                              : 'rgba(0, 0, 0, 0.8)',
                          },
                        },
                        // Force scrollbar to always be visible
                        scrollbarWidth: 'thin',
                        scrollbarColor: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.6) rgba(255, 255, 255, 0.2)' 
                          : 'rgba(0, 0, 0, 0.6) rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      {statusProjects.map((project) => (
                        <Card
                          key={project.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, project)}
                          onDragEnd={handleDragEnd}
                          sx={{
                            cursor: 'grab',
                            width: '100%',
                            background: theme.palette.mode === 'dark'
                              ? 'rgba(30, 41, 59, 0.8)'
                              : 'rgba(255, 255, 255, 0.95)',
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 2,
                            boxShadow: theme.palette.mode === 'dark'
                              ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                              : '0 2px 8px rgba(0, 0, 0, 0.1)',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: theme.palette.mode === 'dark'
                                ? '0 8px 25px rgba(0, 0, 0, 0.4)'
                                : '0 8px 25px rgba(0, 0, 0, 0.15)',
                              background: theme.palette.mode === 'dark'
                                ? 'rgba(30, 41, 59, 0.95)'
                                : 'rgba(255, 255, 255, 1)',
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            flexShrink: 0,
                            opacity: draggedProject && draggedProject.id === project.id ? 0.5 : 1,
                            transform: draggedProject && draggedProject.id === project.id ? 'rotate(5deg)' : 'none'
                          }}
                        >
                          <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
                            {/* En-tête du projet avec priorité */}
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flex: 1, minWidth: 0 }}>
                                <DragIndicator sx={{ fontSize: 14, color: 'text.secondary', flexShrink: 0 }} />
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Typography variant="subtitle2" fontWeight={700} sx={{ 
                                    fontSize: '0.8rem',
                                    lineHeight: 1.2,
                                    wordBreak: 'break-word',
                                    color: theme.palette.text.primary
                              }}>
                                {project.name}
                              </Typography>
                              {project.project_number && (
                                <Typography variant="caption" sx={{ 
                                  color: theme.palette.primary.main,
                                  fontWeight: 600,
                                  fontSize: '0.65rem',
                                  display: 'block',
                                  mt: 0.2
                                }}>
                                  {project.project_number}
                                </Typography>
                              )}
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ 
                                      fontSize: '0.65rem'
                                    }}>
                                      {project.category}
                                    </Typography>
                                    <Chip
                                      label={project.status}
                                      size="small"
                                      color={getStatusColor(project.status)}
                                      sx={{
                                        height: 14,
                                        fontSize: '0.6rem',
                                        fontWeight: 600
                                      }}
                                    />
                                  </Box>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Chip
                                  label={getPriorityText(project.priority)}
                                  size="small"
                                  color={getPriorityColor(project.priority)}
                                  sx={{ 
                                    height: 18, 
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                    flexShrink: 0
                                  }}
                                />
                                <KanbanActionMenu project={project} />
                              </Box>
                            </Box>

                            {/* Description compacte */}
                            <Typography variant="body2" color="text.secondary" sx={{ 
                              mb: 1, 
                              lineHeight: 1.3,
                              fontSize: '0.7rem',
                              wordBreak: 'break-word'
                            }}>
                              {project.description}
                            </Typography>

                            {/* Progression compacte */}
                            <Box sx={{ mb: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ 
                                  fontSize: '0.65rem',
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  letterSpacing: 0.3
                                }}>
                                  Progrès
                                </Typography>
                                <Typography variant="caption" fontWeight={700} sx={{ 
                                  fontSize: '0.7rem',
                                  color: theme.palette.primary.main
                                }}>
                                  {project.progress}%
                                </Typography>
                              </Box>
                                                             <LinearProgress
                                 variant="determinate"
                                 value={project.progress}
                                 sx={{
                                  height: 4,
                                  borderRadius: 2,
                                   backgroundColor: theme.palette.mode === 'dark'
                                     ? 'rgba(255, 255, 255, 0.1)'
                                     : 'rgba(0, 0, 0, 0.1)',
                                   '& .MuiLinearProgress-bar': {
                                    borderRadius: 2,
                                     background: theme.palette.mode === 'dark'
                                       ? 'linear-gradient(90deg, #818cf8, #f472b6)'
                                       : 'linear-gradient(90deg, #6366f1, #ec4899)',
                                   },
                                 }}
                               />
                            </Box>

                            {/* Chef de Projet compact */}
                            {project.projectManager && (
                              <Box sx={{ 
                                mb: 1,
                                p: 0.75,
                                backgroundColor: theme.palette.mode === 'dark' 
                                  ? 'rgba(255, 255, 255, 0.05)' 
                                  : 'rgba(0, 0, 0, 0.02)',
                                borderRadius: 0.75,
                                border: `1px solid ${theme.palette.divider}`
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                  <Avatar sx={{ 
                                    width: 20, 
                                    height: 20, 
                                    fontSize: '0.65rem',
                                    backgroundColor: theme.palette.primary.main,
                                    color: 'white'
                                  }}>
                                    {project.projectManager.charAt(0)}
                                  </Avatar>
                                  <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography variant="caption" sx={{ 
                                      fontSize: '0.65rem', 
                                      fontWeight: 600,
                                      display: 'block',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {project.projectManager}
                                    </Typography>
                                    {project.projectManagerFunction && (
                                      <Typography variant="caption" color="text.secondary" sx={{ 
                                        fontSize: '0.6rem',
                                        display: 'block',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                      }}>
                                        {project.projectManagerFunction}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              </Box>
                            )}

                            {/* Filiales compactes */}
                            {(() => {
                              return project.filiales && project.filiales.length > 0;
                            })() && (
                              <Box sx={{ mb: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ 
                                  fontSize: '0.65rem', 
                                  mb: 0.5, 
                                  display: 'block',
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  letterSpacing: 0.3
                                }}>
                                  Filiales
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4 }}>
                                  {project.filiales.map((filiale, index) => (
                              <Chip
                                    key={index}
                                      label={filiale}
                                      size="small"
                                    sx={{
                                        fontSize: '0.65rem',
                                      height: 18,
                                        backgroundColor: filiale === 'TOUT' 
                                          ? theme.palette.secondary.main 
                                          : theme.palette.primary.main,
                                        color: 'white',
                                        fontWeight: 600,
                                        '& .MuiChip-label': {
                                          px: 0.75
                                        }
                                      }}
                                    />
                                  ))}
                                </Box>
                              </Box>
                            )}

                            {/* Informations compactes du formulaire */}
                            <Box sx={{ 
                              pt: 0.75,
                              borderTop: `1px solid ${theme.palette.divider}`
                            }}>
                              {/* Dates compactes */}
                              <Box sx={{ mb: 0.75 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ 
                                  fontSize: '0.65rem',
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  letterSpacing: 0.3,
                                  display: 'block',
                                  mb: 0.4
                                }}>
                                  Dates
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ 
                                      fontSize: '0.6rem',
                                      display: 'block'
                                    }}>
                                      Début
                                    </Typography>
                                    <Typography variant="caption" sx={{ 
                                      fontSize: '0.65rem',
                                      fontWeight: 600
                                    }}>
                                      {project.startDate}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ 
                                      fontSize: '0.6rem',
                                      display: 'block'
                                    }}>
                                      Fin
                                    </Typography>
                                    <Typography variant="caption" sx={{ 
                                      fontSize: '0.65rem',
                                      fontWeight: 600
                                    }}>
                                      {project.deadline}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>

                              {/* Budget compact */}
                              <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                p: 0.6,
                                backgroundColor: theme.palette.mode === 'dark' 
                                  ? 'rgba(255, 255, 255, 0.03)' 
                                  : 'rgba(0, 0, 0, 0.02)',
                                borderRadius: 0.75,
                                border: `1px solid ${theme.palette.divider}`
                              }}>
                                <Typography variant="caption" color="text.secondary" sx={{ 
                                  fontSize: '0.65rem',
                                  fontWeight: 600
                                }}>
                                  Budget
                                </Typography>
                                <Typography variant="caption" sx={{ 
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  color: theme.palette.success.main
                                }}>
                                  {project.budget}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {/* Loading indicator for infinite scroll */}
                      {kanbanLoading && (
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          py: 2,
                          px: 1
                        }}>
                          <LinearProgress 
                            sx={{ 
                              width: '100%',
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.1)' 
                                : 'rgba(0, 0, 0, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 2,
                                background: theme.palette.mode === 'dark'
                                  ? 'linear-gradient(90deg, #818cf8, #f472b6)'
                                  : 'linear-gradient(90deg, #6366f1, #ec4899)',
                              },
                            }}
                          />
                        </Box>
                      )}
                      
                      {/* Bouton "Charger plus" pour cette colonne spécifique */}
                      {!kanbanLoading && kanbanColumnData[status].hasMore && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => loadNextKanbanColumnPage(status)}
                          sx={{
                            mt: 2,
                            mb: 1,
                            fontSize: '0.8rem',
                            py: 1,
                            px: 2,
                            background: theme.palette.mode === 'dark'
                              ? 'linear-gradient(135deg, #818cf8, #f472b6)'
                              : 'linear-gradient(135deg, #6366f1, #ec4899)',
                            color: theme.palette.mode === 'dark' ? '#000000' : '#ffffff',
                            border: 'none',
                            borderRadius: 2,
                            boxShadow: theme.palette.mode === 'dark'
                              ? '0 4px 12px rgba(129, 140, 248, 0.4)'
                              : '0 4px 12px rgba(99, 102, 241, 0.4)',
                            '&:hover': {
                              background: theme.palette.mode === 'dark'
                                ? 'linear-gradient(135deg, #a5b4fc, #f9a8d4)'
                                : 'linear-gradient(135deg, #818cf8, #f472b6)',
                              transform: 'scale(1.05)',
                              boxShadow: theme.palette.mode === 'dark'
                                ? '0 6px 16px rgba(129, 140, 248, 0.6)'
                                : '0 6px 16px rgba(99, 102, 241, 0.6)',
                            },
                            transition: 'all 0.3s ease-in-out',
                          }}
                        >
                          📥 {status} - Page {kanbanColumnData[status].currentPage + 1}/{kanbanColumnData[status].totalPages}
                        </Button>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          /* Vue Tableur optimisée pour l'espace maximum */
          <Paper
            sx={{
              height: '100%',
              width: '100%',
              maxWidth: '100%',
              background: theme.palette.mode === 'dark'
                ? 'rgba(30, 41, 59, 0.8)'
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 4px 20px rgba(0, 0, 0, 0.3)'
                : '0 4px 20px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <DataGrid
              rows={deferredProjects}
              columns={columns}
              components={{ Toolbar: CustomToolbar }}
              paginationModel={paginationModel}
              onPaginationModelChange={handlePaginationModelChange}
              rowCount={totalProjects}
              paginationMode="server"
              pageSizeOptions={[10, 25, 50, 100, 200]}
              checkboxSelection
              disableSelectionOnClick
              disableColumnReorder
              hideFooterSelectedRowCount
              density="compact"
              getRowHeight={() => 'auto'}
              columnHeaderHeight={44}
              autoHeight={false}
              loading={paginationLoading}
              sx={{
                border: 'none',
                width: '100%',
                height: '100%',
                flex: 1,
                scrollbarGutter: 'stable both-edges',
                '& .MuiDataGrid-main': {
                  width: '100%',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(129, 140, 248, 0.1)'
                    : 'rgba(99, 102, 241, 0.1)',
                  borderBottom: `2px solid ${theme.palette.primary.main}40`,
                  padding: '4px 2px',
                  minHeight: '36px !important',
                },
                '& .MuiDataGrid-columnHeader': {
                  padding: '0 6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  padding: '12px 8px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  minHeight: 'auto !important',
                  height: 'auto !important',
                  whiteSpace: 'normal !important',
                  wordBreak: 'break-word !important',
                  overflow: 'visible !important',
                },
                '& .MuiDataGrid-row': {
                  minHeight: 'auto !important',
                  height: 'auto !important',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(129, 140, 248, 0.05)'
                      : 'rgba(99, 102, 241, 0.05)',
                  },
                },
                '& .MuiDataGrid-cell[data-field="name"]': {
                  whiteSpace: 'normal !important',
                  wordBreak: 'break-word !important',
                  overflow: 'visible !important',
                  textOverflow: 'unset !important',
                  maxWidth: 'none !important',
                },
                '& .MuiDataGrid-cell[data-field="name"] *': {
                  whiteSpace: 'normal !important',
                  wordBreak: 'break-word !important',
                  overflow: 'visible !important',
                  textOverflow: 'unset !important',
                },
                '& .MuiDataGrid-cell[data-field="name"] .MuiTypography-root': {
                  whiteSpace: 'normal !important',
                  wordBreak: 'break-word !important',
                  overflow: 'visible !important',
                  textOverflow: 'unset !important',
                  maxWidth: 'none !important',
                },
                '& .MuiDataGrid-virtualScroller': {
                  backgroundColor: 'transparent',
                  overflowY: 'auto',
                  scrollbarGutter: 'stable both-edges',
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(30, 41, 59, 0.5)'
                    : 'rgba(255, 255, 255, 0.5)',
                  padding: '2px 8px',
                  minHeight: '32px !important',
                },
                '& .MuiDataGrid-toolbarContainer': {
                  padding: '4px 8px',
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(30, 41, 59, 0.3)'
                    : 'rgba(255, 255, 255, 0.3)',
                  minHeight: '36px !important',
                },
              }}
            />
          </Paper>
        )}
      </Box>

      {/* Modale de création de projet */}
      <Dialog 
        open={newProjectDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            backgroundImage: 'none',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            border: `1px solid ${theme.palette.divider}`,
            transition: 'all 0.3s ease-in-out',
            minHeight: '600px',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(129, 140, 248, 0.05)'
            : 'rgba(99, 102, 241, 0.02)',
          transition: 'all 0.3s ease-in-out',
          flexShrink: 0
        }}>
          Nouveau Projet
        </DialogTitle>
        <DialogContent sx={{ 
          backgroundColor: theme.palette.background.paper,
          transition: 'all 0.3s ease-in-out',
          flex: 1,
          overflow: 'auto',
          minHeight: 0,
          '& .MuiTextField-root': {
            '& .MuiOutlinedInput-root': {
              backgroundColor: theme.palette.background.paper,
              transition: 'all 0.3s ease-in-out',
              '& fieldset': {
                borderColor: theme.palette.divider,
                transition: 'border-color 0.3s ease-in-out',
              },
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
              },
            },
            '& .MuiInputLabel-root': {
              color: theme.palette.text.secondary,
              transition: 'color 0.3s ease-in-out',
              '&.Mui-focused': {
                color: theme.palette.primary.main,
              },
            },
            '& .MuiInputBase-input': {
              color: theme.palette.text.primary,
              transition: 'color 0.3s ease-in-out',
            },
          },
        }}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
          <TextField
            autoFocus
            margin="dense"
            label="Nom du Projet"
            type="text"
            fullWidth
            variant="outlined"
            required
            error={fieldErrors.name}
            value={newProject.name}
            onChange={handleNameChange}
            helperText={fieldErrors.name ? "Ce champ est obligatoire" : ""}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: fieldErrors.name ? theme.palette.error.main : theme.palette.divider,
                },
                '&:hover fieldset': {
                  borderColor: fieldErrors.name ? theme.palette.error.main : theme.palette.primary.main,
                },
                '&.Mui-focused fieldset': {
                  borderColor: fieldErrors.name ? theme.palette.error.main : theme.palette.primary.main,
                },
              },
              '& .MuiInputLabel-root': {
                color: fieldErrors.name ? theme.palette.error.main : theme.palette.text.secondary,
                '&.Mui-focused': {
                  color: fieldErrors.name ? theme.palette.error.main : theme.palette.primary.main,
                },
              },
              '& .MuiFormHelperText-root': {
                color: fieldErrors.name ? theme.palette.error.main : 'transparent',
              },
            }}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            required
            error={fieldErrors.description}
            multiline
            rows={3}
            value={newProject.description}
            onChange={handleDescriptionChange}
            helperText={fieldErrors.description ? "Ce champ est obligatoire" : ""}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: fieldErrors.description ? theme.palette.error.main : theme.palette.divider,
                },
                '&:hover fieldset': {
                  borderColor: fieldErrors.description ? theme.palette.error.main : theme.palette.primary.main,
                },
                '&.Mui-focused fieldset': {
                  borderColor: fieldErrors.description ? theme.palette.error.main : theme.palette.primary.main,
                },
              },
              '& .MuiInputLabel-root': {
                color: fieldErrors.description ? theme.palette.error.main : theme.palette.text.secondary,
                '&.Mui-focused': {
                  color: fieldErrors.description ? theme.palette.error.main : theme.palette.primary.main,
                },
              },
              '& .MuiFormHelperText-root': {
                color: fieldErrors.description ? theme.palette.error.main : 'transparent',
              },
            }}
          />
          <DatePicker
            label="Date de début"
            value={createValidDate(newProject.startDate)}
            onChange={handleStartDateChange}
            inputFormat="dd/MM/yyyy"
            mask="__/__/____"
            allowSameDateSelection
            slotProps={{
              textField: {
                margin: "dense",
                fullWidth: true,
                variant: "outlined",
                required: true,
                error: fieldErrors.startDate,
                helperText: fieldErrors.startDate ? "Ce champ est obligatoire" : "",
                placeholder: "Cliquez pour sélectionner",
                inputProps: { readOnly: true },
                sx: {
                  '& .MuiOutlinedInput-root': {
                    color: theme.palette.text.primary,
                    cursor: 'pointer',
                    '& fieldset': {
                      borderColor: fieldErrors.startDate ? theme.palette.error.main : theme.palette.divider,
                    },
                    '&:hover fieldset': {
                      borderColor: fieldErrors.startDate ? theme.palette.error.main : theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: fieldErrors.startDate ? theme.palette.error.main : theme.palette.primary.main,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: fieldErrors.startDate ? theme.palette.error.main : theme.palette.text.secondary,
                    '&.Mui-focused': {
                      color: fieldErrors.startDate ? theme.palette.error.main : theme.palette.primary.main,
                    },
                  },
                  '& .MuiFormHelperText-root': {
                    color: fieldErrors.startDate ? theme.palette.error.main : 'transparent',
                  },
                },
              },
              popper: {
                sx: {
                  '& .MuiPaper-root': {
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    border: `1px solid ${theme.palette.divider}`,
                  },
                  '& .MuiPickersCalendarHeader-root': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.3)' : 'rgba(0, 0, 0, 0.02)',
                  },
                  '& .MuiDayCalendar-weekDayLabel': {
                    color: theme.palette.text.secondary,
                  },
                  '& .MuiPickersDay-root': {
                    color: theme.palette.text.primary,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                    },
                  },
                },
              },
            }}
          />
          <DatePicker
            label="Date de fin"
            value={createValidDate(newProject.deadline)}
            onChange={handleDeadlineChange}
            inputFormat="dd/MM/yyyy"
            mask="__/__/____"
            allowSameDateSelection
            slotProps={{
              textField: {
                margin: "dense",
                fullWidth: true,
                variant: "outlined",
                required: true,
                error: fieldErrors.deadline,
                helperText: fieldErrors.deadline ? "La date de fin doit être postérieure à la date de début" : "",
                placeholder: "Cliquez pour sélectionner",
                inputProps: { readOnly: true },
                sx: {
                  '& .MuiOutlinedInput-root': {
                    color: theme.palette.text.primary,
                    cursor: 'pointer',
                    '& fieldset': {
                      borderColor: fieldErrors.deadline ? theme.palette.error.main : theme.palette.divider,
                    },
                    '&:hover fieldset': {
                      borderColor: fieldErrors.deadline ? theme.palette.error.main : theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: fieldErrors.deadline ? theme.palette.error.main : theme.palette.primary.main,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: fieldErrors.deadline ? theme.palette.error.main : theme.palette.text.secondary,
                    '&.Mui-focused': {
                      color: fieldErrors.deadline ? theme.palette.error.main : theme.palette.primary.main,
                    },
                  },
                  '& .MuiFormHelperText-root': {
                    color: fieldErrors.deadline ? theme.palette.error.main : 'transparent',
                  },
                },
              },
              popper: {
                sx: {
                  '& .MuiPaper-root': {
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    border: `1px solid ${theme.palette.divider}`,
                  },
                  '& .MuiPickersCalendarHeader-root': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.3)' : 'rgba(0, 0, 0, 0.02)',
                  },
                  '& .MuiDayCalendar-weekDayLabel': {
                    color: theme.palette.text.secondary,
                  },
                  '& .MuiPickersDay-root': {
                    color: theme.palette.text.primary,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                    },
                  },
                },
              },
            }}
          />
          <FormControl fullWidth margin="dense" required error={fieldErrors.priority}>
            <InputLabel sx={{
              color: fieldErrors.priority ? theme.palette.error.main : theme.palette.text.secondary,
              '&.Mui-focused': {
                color: fieldErrors.priority ? theme.palette.error.main : theme.palette.primary.main,
              },
            }}>
              Priorité
            </InputLabel>
            <Select
              value={newProject.priority}
              label="Priorité"
              error={fieldErrors.priority}
              onChange={handlePriorityChange}
            >
              <MenuItem value="Élevé">Élevé</MenuItem>
              <MenuItem value="Moyen">Moyen</MenuItem>
              <MenuItem value="Faible">Faible</MenuItem>
            </Select>
            {fieldErrors.priority && (
              <FormHelperText error>
                Ce champ est obligatoire
              </FormHelperText>
            )}
          </FormControl>
          
          {/* Champ Catégorie */}
          <FormControl fullWidth margin="dense" required error={fieldErrors.category}>
            <InputLabel sx={{
              color: fieldErrors.category ? theme.palette.error.main : theme.palette.text.secondary,
              '&.Mui-focused': {
                color: fieldErrors.category ? theme.palette.error.main : theme.palette.primary.main,
              },
            }}>
              Catégorie
            </InputLabel>
            <Select
              value={newProject.category}
              label="Catégorie"
              error={fieldErrors.category}
              onChange={handleCategoryChange}
            >
              <MenuItem value="App Web">App Web</MenuItem>
              <MenuItem value="App Mobile">App Mobile</MenuItem>
              <MenuItem value="Reporting">Reporting</MenuItem>
              <MenuItem value="Digitalisation">Digitalisation</MenuItem>
              <MenuItem value="ERP">ERP</MenuItem>
              <MenuItem value="AI">AI</MenuItem>
              <MenuItem value="Web & Mobile">Web & Mobile</MenuItem>
              <MenuItem value="Autre">Autre</MenuItem>
            </Select>
            {fieldErrors.category && (
              <FormHelperText error>
                Ce champ est obligatoire
              </FormHelperText>
            )}
          </FormControl>
          
          {/* Champ Département */}
          <FormControl fullWidth margin="dense" required error={fieldErrors.department}>
            <InputLabel sx={{
              color: fieldErrors.department ? theme.palette.error.main : theme.palette.text.secondary,
              '&.Mui-focused': {
                color: fieldErrors.department ? theme.palette.error.main : theme.palette.primary.main,
              },
            }}>
              Département
            </InputLabel>
            <Select
              value={newProject.department}
              label="Département"
              error={fieldErrors.department}
              onChange={handleDepartmentChange}
            >
              {DEPARTMENT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {fieldErrors.department && (
              <FormHelperText error>
                Ce champ est obligatoire
              </FormHelperText>
            )}
          </FormControl>
          
          {/* Champ Budget */}
          <TextField
            margin="dense"
            label="Budget (DZD)"
            type="number"
            fullWidth
            variant="outlined"
            value={newProject.budget || ''}
            onChange={handleBudgetChange}
            error={fieldErrors.budget}
            helperText={fieldErrors.budget ? "Veuillez saisir un budget valide" : ""}
            inputProps={{
              min: 0,
              step: 0.01
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: fieldErrors.budget ? theme.palette.error.main : theme.palette.divider,
                },
                '&:hover fieldset': {
                  borderColor: fieldErrors.budget ? theme.palette.error.main : theme.palette.primary.main,
                },
                '&.Mui-focused fieldset': {
                  borderColor: fieldErrors.budget ? theme.palette.error.main : theme.palette.primary.main,
                },
              },
              '& .MuiInputLabel-root': {
                color: fieldErrors.budget ? theme.palette.error.main : theme.palette.text.secondary,
                '&.Mui-focused': {
                  color: fieldErrors.budget ? theme.palette.error.main : theme.palette.primary.main,
                },
              },
              '& .MuiFormHelperText-root': {
                color: fieldErrors.budget ? theme.palette.error.main : 'transparent',
              },
            }}
          />
          
          {/* Champ Filiales */}
          <FormControl 
            margin="dense" 
            fullWidth 
            variant="outlined" 
            required
            error={fieldErrors.filiales}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: theme.palette.text.primary,
                '& fieldset': {
                  borderColor: fieldErrors.filiales ? theme.palette.error.main : theme.palette.divider,
                },
                '&:hover fieldset': {
                  borderColor: fieldErrors.filiales ? theme.palette.error.main : theme.palette.primary.main,
                },
                '&.Mui-focused fieldset': {
                  borderColor: fieldErrors.filiales ? theme.palette.error.main : theme.palette.primary.main,
                },
              },
            }}
          >
            <InputLabel 
              sx={{
                color: fieldErrors.filiales ? theme.palette.error.main : theme.palette.text.secondary,
                '&.Mui-focused': {
                  color: fieldErrors.filiales ? theme.palette.error.main : theme.palette.primary.main,
                },
              }}>
              Filiales
            </InputLabel>
            <Select
              multiple
              value={newProject.filiales || []}
              label="Filiales"
              error={fieldErrors.filiales}
              onChange={handleFilialesChange}
              open={filialesSelectOpen}
              onOpen={() => setFilialesSelectOpen(true)}
              onClose={() => setFilialesSelectOpen(false)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip 
                      key={value} 
                      label={value} 
                      size="small" 
                      sx={{ 
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        fontSize: '0.75rem'
                      }} 
                    />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="GHMED">GHMED</MenuItem>
              <MenuItem value="DEFMED">DEFMED</MenuItem>
              <MenuItem value="ABCMED">ABCMED</MenuItem>
              <MenuItem value="MEDIJK">MEDIJK</MenuItem>
              <MenuItem value="HPC">HPC</MenuItem>
              <MenuItem value="HP">HP</MenuItem>
              <MenuItem value="AT">AT</MenuItem>
              <MenuItem value="MDP">MDP</MenuItem>
              <MenuItem value="DG">DG</MenuItem>
              <MenuItem value="TOUT">TOUT</MenuItem>
            </Select>
            {fieldErrors.filiales && (
              <FormHelperText error>
                Ce champ est obligatoire
              </FormHelperText>
            )}
          </FormControl>
          
          <TextField
            margin="dense"
            label="Chef de projet"
            fullWidth
            variant="outlined"
            required
            error={fieldErrors.projectManager}
            value={selectedEmployee ? `${selectedEmployee.name} - ${selectedEmployee.function}` : ''}
            onClick={handleOpenEmployeeDialog}
            helperText={fieldErrors.projectManager ? "Ce champ est obligatoire" : ""}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <Button
                  size="small"
                  onClick={handleOpenEmployeeDialog}
                  sx={{ 
                    minWidth: 'auto', 
                    px: 1,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(129, 140, 248, 0.1)'
                        : 'rgba(99, 102, 241, 0.1)',
                    },
                  }}
                >
                  <Add />
                </Button>
              ),
            }}
            placeholder="Cliquez pour sélectionner un employé"
            sx={{
              cursor: 'pointer',
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.background.paper,
                '& fieldset': {
                  borderColor: fieldErrors.projectManager ? theme.palette.error.main : theme.palette.divider,
                },
                '&:hover fieldset': {
                  borderColor: fieldErrors.projectManager ? theme.palette.error.main : theme.palette.primary.main,
                },
                '&.Mui-focused fieldset': {
                  borderColor: fieldErrors.projectManager ? theme.palette.error.main : theme.palette.primary.main,
                },
              },
              '& .MuiInputBase-input': {
                cursor: 'pointer',
                color: selectedEmployee ? theme.palette.text.primary : theme.palette.text.secondary,
              },
              '& .MuiInputBase-input::placeholder': {
                color: theme.palette.text.secondary,
                opacity: 1,
              },
              '& .MuiInputLabel-root': {
                color: fieldErrors.projectManager ? theme.palette.error.main : theme.palette.text.secondary,
                '&.Mui-focused': {
                  color: fieldErrors.projectManager ? theme.palette.error.main : theme.palette.primary.main,
                },
              },
              '& .MuiFormHelperText-root': {
                color: fieldErrors.projectManager ? theme.palette.error.main : 'transparent',
              },
            }}
          />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ 
          p: 2, 
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(30, 41, 59, 0.3)'
            : 'rgba(248, 250, 252, 0.5)',
          flexShrink: 0,
          mt: 'auto'
        }}>
          <Button 
            onClick={handleCloseDialog} 
            color="primary"
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(129, 140, 248, 0.1)'
                  : 'rgba(99, 102, 241, 0.1)',
              },
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmitProject} 
            color="primary" 
            variant="contained"
            sx={{
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #818cf8 0%, #f472b6 100%)'
                : 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              '&:hover': {
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #a5b4fc 0%, #f9a8d4 100%)'
                  : 'linear-gradient(135deg, #818cf8 0%, #f472b6 100%)',
              },
            }}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal d'édition de projet */}
      <Dialog 
        open={editProjectDialog} 
        onClose={handleCloseEditDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            backgroundImage: 'none',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            border: `1px solid ${theme.palette.divider}`,
            transition: 'all 0.3s ease-in-out',
            minHeight: '600px',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(129, 140, 248, 0.05)'
            : 'rgba(99, 102, 241, 0.02)',
          transition: 'all 0.3s ease-in-out',
          flexShrink: 0
        }}>
          Modifier le Projet
        </DialogTitle>
        <DialogContent sx={{ 
          backgroundColor: theme.palette.background.paper,
          transition: 'all 0.3s ease-in-out',
          flex: 1,
          overflow: 'auto',
          minHeight: 0,
          '& .MuiTextField-root': {
            '& .MuiOutlinedInput-root': {
              backgroundColor: theme.palette.background.paper,
              transition: 'all 0.3s ease-in-out',
              '& fieldset': {
                borderColor: theme.palette.divider,
                transition: 'border-color 0.3s ease-in-out',
              },
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
              },
            },
            '& .MuiInputLabel-root': {
              color: theme.palette.text.secondary,
              transition: 'color 0.3s ease-in-out',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: theme.palette.primary.main,
            },
            '& .MuiInputLabel-root.Mui-error': {
              color: theme.palette.error.main,
            },
            '& .MuiFormHelperText-root': {
              color: theme.palette.text.secondary,
              transition: 'color 0.3s ease-in-out',
            },
            '& .MuiFormHelperText-root.Mui-error': {
              color: theme.palette.error.main,
            },
          },
          '& .MuiFormControl-root': {
            '& .MuiInputLabel-root': {
              color: theme.palette.text.secondary,
              transition: 'color 0.3s ease-in-out',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: theme.palette.primary.main,
            },
            '& .MuiInputLabel-root.Mui-error': {
              color: theme.palette.error.main,
            },
            '& .MuiOutlinedInput-root': {
              backgroundColor: theme.palette.background.paper,
              transition: 'all 0.3s ease-in-out',
              '& fieldset': {
                borderColor: theme.palette.divider,
                transition: 'border-color 0.3s ease-in-out',
              },
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
              },
              '&.Mui-error fieldset': {
                borderColor: theme.palette.error.main,
              },
            },
            '& .MuiSelect-select': {
              color: theme.palette.text.primary,
            },
            '& .MuiFormHelperText-root': {
              color: theme.palette.text.secondary,
              transition: 'color 0.3s ease-in-out',
            },
            '& .MuiFormHelperText-root.Mui-error': {
              color: theme.palette.error.main,
            },
          },
        }}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <TextField
              label="Nom du Projet"
              value={editProject.name || ''}
              onChange={handleEditNameChange}
              margin="dense"
              fullWidth
              variant="outlined"
              required
              error={editFieldErrors.name}
              helperText={editFieldErrors.name ? "Ce champ est obligatoire" : ""}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: editFieldErrors.name ? theme.palette.error.main : theme.palette.divider,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: editFieldErrors.name ? theme.palette.error.main : theme.palette.text.secondary,
                },
                '& .MuiFormHelperText-root': {
                  color: editFieldErrors.name ? theme.palette.error.main : 'transparent',
                },
              }}
            />
            
            <TextField
              label="Description"
              value={editProject.description || ''}
              onChange={handleEditDescriptionChange}
              margin="dense"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              required
              error={editFieldErrors.description}
              helperText={editFieldErrors.description ? "Ce champ est obligatoire" : ""}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: editFieldErrors.description ? theme.palette.error.main : theme.palette.divider,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: editFieldErrors.description ? theme.palette.error.main : theme.palette.text.secondary,
                },
                '& .MuiFormHelperText-root': {
                  color: editFieldErrors.description ? theme.palette.error.main : 'transparent',
                },
              }}
            />

            <DatePicker
              label="Date de début"
              value={createValidDate(editProject.startDate)}
              onChange={handleEditStartDateChange}
              inputFormat="dd/MM/yyyy"
              mask="__/__/____"
              allowSameDateSelection
              slotProps={{
                textField: {
                  margin: "dense",
                  fullWidth: true,
                  variant: "outlined",
                  required: true,
                  error: editFieldErrors.startDate,
                  helperText: editFieldErrors.startDate ? "Ce champ est obligatoire" : "",
                  placeholder: "Cliquez pour sélectionner",
                  inputProps: { readOnly: true },
                  sx: {
                    cursor: 'pointer',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: editFieldErrors.startDate ? theme.palette.error.main : theme.palette.divider,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: editFieldErrors.startDate ? theme.palette.error.main : theme.palette.text.secondary,
                    },
                    '& .MuiFormHelperText-root': {
                      color: editFieldErrors.startDate ? theme.palette.error.main : 'transparent',
                    },
                  },
                },
                popper: {
                  sx: {
                    '& .MuiPaper-root': {
                      backgroundColor: theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      border: `1px solid ${theme.palette.divider}`,
                    },
                    '& .MuiPickersCalendarHeader-root': {
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.3)' : 'rgba(0, 0, 0, 0.02)',
                    },
                    '& .MuiDayCalendar-weekDayLabel': {
                      color: theme.palette.text.secondary,
                    },
                    '& .MuiPickersDay-root': {
                      color: theme.palette.text.primary,
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark'
                          ? 'rgba(129, 140, 248, 0.16)'
                          : 'rgba(99, 102, 241, 0.12)',
                      },
                    },
                  },
                },
              }}
            />

            <DatePicker
              label="Date de fin"
              value={createValidDate(editProject.deadline)}
              onChange={handleEditDeadlineChange}
              inputFormat="dd/MM/yyyy"
              mask="__/__/____"
              allowSameDateSelection
              slotProps={{
                textField: {
                  margin: "dense",
                  fullWidth: true,
                  variant: "outlined",
                  required: true,
                  error: editFieldErrors.deadline,
                  helperText: editFieldErrors.deadline ? "La date de fin doit être postérieure à la date de début" : "",
                  placeholder: "Cliquez pour sélectionner",
                  inputProps: { readOnly: true },
                  sx: {
                    cursor: 'pointer',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: editFieldErrors.deadline ? theme.palette.error.main : theme.palette.divider,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: editFieldErrors.deadline ? theme.palette.error.main : theme.palette.text.secondary,
                    },
                    '& .MuiFormHelperText-root': {
                      color: editFieldErrors.deadline ? theme.palette.error.main : 'transparent',
                    },
                  },
                },
                popper: {
                  sx: {
                    '& .MuiPaper-root': {
                      backgroundColor: theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      border: `1px solid ${theme.palette.divider}`,
                    },
                    '& .MuiPickersCalendarHeader-root': {
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.3)' : 'rgba(0, 0, 0, 0.02)',
                    },
                    '& .MuiDayCalendar-weekDayLabel': {
                      color: theme.palette.text.secondary,
                    },
                    '& .MuiPickersDay-root': {
                      color: theme.palette.text.primary,
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark'
                          ? 'rgba(129, 140, 248, 0.16)'
                          : 'rgba(99, 102, 241, 0.12)',
                      },
                    },
                  },
                },
              }}
            />

            <TextField
              label="Chef de Projet"
              value={editSelectedEmployee ? `${editSelectedEmployee.name} - ${editSelectedEmployee.function}` : ''}
              margin="dense"
              fullWidth
              variant="outlined"
              required
              error={editFieldErrors.projectManager}
              helperText={editFieldErrors.projectManager ? "Ce champ est obligatoire" : ""}
              onClick={() => {
                setEmployeeDialog(true);
                setSearchTerm('');
                setFilteredEmployees(employees);
              }}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEmployeeDialog(true);
                      setSearchTerm('');
                      setFilteredEmployees(employees);
                    }}
                    sx={{ color: theme.palette.primary.main }}
                  >
                    <Search />
                  </IconButton>
                ),
              }}
              sx={{
                cursor: 'pointer',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: editFieldErrors.projectManager ? theme.palette.error.main : theme.palette.divider,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: editFieldErrors.projectManager ? theme.palette.error.main : theme.palette.text.secondary,
                },
                '& .MuiFormHelperText-root': {
                  color: editFieldErrors.projectManager ? theme.palette.error.main : 'transparent',
                },
              }}
            />

            <FormControl 
              margin="dense" 
              fullWidth 
              variant="outlined" 
              required
              error={editFieldErrors.priority}
              sx={{
                '& .MuiInputLabel-root': {
                  color: editFieldErrors.priority ? theme.palette.error.main : theme.palette.text.secondary,
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: editFieldErrors.priority ? theme.palette.error.main : theme.palette.divider,
                  },
                },
              }}
            >
              <InputLabel>Priorité</InputLabel>
              <Select
                value={editProject.priority || 'Moyen'}
                label="Priorité"
                error={editFieldErrors.priority}
                onChange={handleEditPriorityChange}
                sx={{
                  '& .MuiSelect-select': {
                    color: theme.palette.text.primary,
                  },
                }}
              >
                <MenuItem value="Faible">Faible</MenuItem>
                <MenuItem value="Moyen">Moyen</MenuItem>
                <MenuItem value="Élevé">Élevé</MenuItem>
              </Select>
              {editFieldErrors.priority && (
                <FormHelperText error>
                  Ce champ est obligatoire
                </FormHelperText>
              )}
            </FormControl>

            <FormControl 
              margin="dense" 
              fullWidth 
              variant="outlined" 
              required
              error={editFieldErrors.status}
              sx={{
                '& .MuiInputLabel-root': {
                  color: editFieldErrors.status ? theme.palette.error.main : theme.palette.text.secondary,
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: editFieldErrors.status ? theme.palette.error.main : theme.palette.divider,
                  },
                },
              }}
            >
              <InputLabel>Statut</InputLabel>
              <Select
                value={editProject.status || 'Planification'}
                label="Statut"
                error={editFieldErrors.status}
                onChange={handleEditStatusChange}
                sx={{
                  '& .MuiSelect-select': {
                    color: theme.palette.text.primary,
                  },
                }}
              >
                <MenuItem value="Planification">Planification</MenuItem>
                <MenuItem value="En attente">En attente</MenuItem>
                <MenuItem value="En cours">En cours</MenuItem>
                <MenuItem value="En retard">En retard</MenuItem>
                <MenuItem value="Terminé">Terminé</MenuItem>
                <MenuItem value="Annulé">Annulé</MenuItem>
              </Select>
              {editFieldErrors.status && (
                <FormHelperText error>
                  Ce champ est obligatoire
                </FormHelperText>
              )}
            </FormControl>

            <FormControl 
              margin="dense" 
              fullWidth 
              variant="outlined" 
              required
              error={editFieldErrors.category}
              sx={{
                '& .MuiInputLabel-root': {
                  color: editFieldErrors.category ? theme.palette.error.main : theme.palette.text.secondary,
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: editFieldErrors.category ? theme.palette.error.main : theme.palette.divider,
                  },
                },
              }}
            >
              <InputLabel>Catégorie</InputLabel>
              <Select
                value={editProject.category || 'App Web'}
                label="Catégorie"
                error={editFieldErrors.category}
                onChange={handleEditCategoryChange}
                sx={{
                  '& .MuiSelect-select': {
                    color: theme.palette.text.primary,
                  },
                }}
              >
                <MenuItem value="App Web">App Web</MenuItem>
                <MenuItem value="App Mobile">App Mobile</MenuItem>
                <MenuItem value="Reporting">Reporting</MenuItem>
                <MenuItem value="Digitalisation">Digitalisation</MenuItem>
                <MenuItem value="ERP">ERP</MenuItem>
                <MenuItem value="AI">AI</MenuItem>
                <MenuItem value="Web & Mobile">Web & Mobile</MenuItem>
                <MenuItem value="Autre">Autre</MenuItem>
              </Select>
              {editFieldErrors.category && (
                <FormHelperText error>
                  Ce champ est obligatoire
                </FormHelperText>
              )}
            </FormControl>

            <FormControl 
              margin="dense" 
              fullWidth 
              variant="outlined" 
              required
              error={editFieldErrors.department}
              sx={{
                '& .MuiInputLabel-root': {
                  color: editFieldErrors.department ? theme.palette.error.main : theme.palette.text.secondary,
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: editFieldErrors.department ? theme.palette.error.main : theme.palette.divider,
                  },
                },
              }}
            >
              <InputLabel>Département</InputLabel>
              <Select
                value={editProject.department || 'Comptabilité'}
                label="Département"
                error={editFieldErrors.department}
                onChange={handleEditDepartmentChange}
                sx={{
                  '& .MuiSelect-select': {
                    color: theme.palette.text.primary,
                  },
                }}
              >
                {DEPARTMENT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {editFieldErrors.department && (
                <FormHelperText error>
                  Ce champ est obligatoire
                </FormHelperText>
              )}
            </FormControl>

            {/* Champ Budget */}
            <TextField
              margin="dense"
              label="Budget (DZD)"
              type="number"
              fullWidth
              variant="outlined"
              value={editProject.budget || ''}
              onChange={handleEditBudgetChange}
              error={editFieldErrors.budget}
              helperText={editFieldErrors.budget ? "Veuillez saisir un budget valide" : ""}
              inputProps={{
                min: 0,
                step: 0.01
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: editFieldErrors.budget ? theme.palette.error.main : theme.palette.divider,
                  },
                  '&:hover fieldset': {
                    borderColor: editFieldErrors.budget ? theme.palette.error.main : theme.palette.primary.main,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: editFieldErrors.budget ? theme.palette.error.main : theme.palette.primary.main,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: editFieldErrors.budget ? theme.palette.error.main : theme.palette.text.secondary,
                  '&.Mui-focused': {
                    color: editFieldErrors.budget ? theme.palette.error.main : theme.palette.primary.main,
                  },
                },
                '& .MuiFormHelperText-root': {
                  color: editFieldErrors.budget ? theme.palette.error.main : 'transparent',
                },
              }}
            />

            <FormControl 
              margin="dense" 
              fullWidth 
              variant="outlined" 
              required
              error={editFieldErrors.filiales}
              sx={{
                '& .MuiInputLabel-root': {
                  color: editFieldErrors.filiales ? theme.palette.error.main : theme.palette.text.secondary,
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: editFieldErrors.filiales ? theme.palette.error.main : theme.palette.divider,
                  },
                },
              }}
            >
              <InputLabel>Filiales</InputLabel>
              <Select
                multiple
                value={editProject.filiales || []}
                label="Filiales"
                error={editFieldErrors.filiales}
                onChange={handleEditFilialesChange}
                open={editFilialesSelectOpen}
                onOpen={() => setEditFilialesSelectOpen(true)}
                onClose={() => setEditFilialesSelectOpen(false)}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={value} 
                        size="small" 
                        sx={{ 
                          backgroundColor: theme.palette.primary.main,
                          color: theme.palette.primary.contrastText,
                          fontSize: '0.75rem'
                        }} 
                      />
                    ))}
                  </Box>
                )}
                sx={{
                  '& .MuiSelect-select': {
                    color: theme.palette.text.primary,
                  },
                }}
              >
                <MenuItem value="GHMED">GHMED</MenuItem>
                <MenuItem value="DEFMED">DEFMED</MenuItem>
                <MenuItem value="ABCMED">ABCMED</MenuItem>
                <MenuItem value="MEDIJK">MEDIJK</MenuItem>
                <MenuItem value="HPC">HPC</MenuItem>
                <MenuItem value="HP">HP</MenuItem>
                <MenuItem value="AT">AT</MenuItem>
                <MenuItem value="MDP">MDP</MenuItem>
                <MenuItem value="DG">DG</MenuItem>
                <MenuItem value="TOUT">TOUT</MenuItem>
              </Select>
              {editFieldErrors.filiales && (
                <FormHelperText error>
                  Ce champ est obligatoire
                </FormHelperText>
              )}
            </FormControl>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ 
          p: 2, 
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(30, 41, 59, 0.3)'
            : 'rgba(248, 250, 252, 0.5)',
          flexShrink: 0,
          mt: 'auto'
        }}>
          <Button 
            onClick={handleCloseEditDialog} 
            color="primary"
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(129, 140, 248, 0.1)'
                  : 'rgba(99, 102, 241, 0.1)',
              },
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmitEditProject} 
            color="primary"
            variant="contained"
            sx={{
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #a5b4fc 0%, #f9a8d4 100%)'
                : 'linear-gradient(135deg, #818cf8 0%, #f472b6 100%)',
            }}
          >
            Modifier
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal DataGrid pour sélection d'employé */}
      <Dialog 
        open={employeeDialog} 
        onClose={handleCloseEmployeeDialog} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { 
            height: '80vh',
            backgroundColor: theme.palette.background.paper,
            backgroundImage: 'none',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            border: `1px solid ${theme.palette.divider}`,
          }
        }}
      >
        <DialogTitle sx={{ 
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(129, 140, 248, 0.05)'
            : 'rgba(99, 102, 241, 0.02)',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
              Sélectionner un Chef de Projet
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {filteredEmployees.length} employé(s) trouvé(s)
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%' }}>
          {/* Barre de recherche */}
          <Box sx={{ 
            p: 2, 
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(30, 41, 59, 0.3)'
              : 'rgba(248, 250, 252, 0.5)',
          }}>
            <TextField
              fullWidth
              placeholder="Rechercher par nom, fonction, département ou email..."
              value={searchTerm}
              onChange={handleSearchChange}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.palette.background.paper,
                  '& fieldset': {
                    borderColor: theme.palette.divider,
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
                '& .MuiInputBase-input': {
                  color: theme.palette.text.primary,
                  '&::placeholder': {
                    color: theme.palette.text.secondary,
                    opacity: 1,
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: theme.palette.text.secondary }}>
                    <Search />
                  </Box>
                ),
              }}
            />
          </Box>
          
          {/* DataGrid */}
          <Box sx={{ height: 'calc(100% - 80px)', width: '100%' }}>
            <DataGrid
              rows={filteredEmployees}
              columns={employeeColumns}
              onRowClick={handleRowClick}
              initialState={{
                pagination: { 
                  paginationModel: { pageSize: 25, page: 0 } 
                },
                sorting: {
                  sortModel: [{ field: 'name', sort: 'asc' }],
                },
              }}
              pageSizeOptions={[10, 25, 50, 100, 200]}
              checkboxSelection={false}
              disableColumnReorder
              hideFooterSelectedRowCount
              density="compact"
              rowHeight={60}
              columnHeaderHeight={56}
              autoHeight={false}
              sx={{
                border: 'none',
                width: '100%',
                height: '100%',
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                transition: 'all 0.3s ease-in-out',
                '& .MuiDataGrid-main': {
                  width: '100%',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(129, 140, 248, 0.15)'
                    : 'rgba(99, 102, 241, 0.08)',
                  borderBottom: `2px solid ${theme.palette.primary.main}30`,
                  color: theme.palette.text.primary,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                },
                '& .MuiDataGrid-columnHeader': {
                  color: theme.palette.text.primary,
                  '&:focus': {
                    outline: `2px solid ${theme.palette.primary.main}40`,
                    outlineOffset: -2,
                  },
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  color: theme.palette.text.primary,
                  '&:focus': {
                    outline: `2px solid ${theme.palette.primary.main}40`,
                    outlineOffset: -2,
                  },
                },
                '& .MuiDataGrid-row': {
                  backgroundColor: theme.palette.background.paper,
                  transition: 'background-color 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(129, 140, 248, 0.08)'
                      : 'rgba(99, 102, 241, 0.04)',
                    cursor: 'pointer',
                  },
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(129, 140, 248, 0.12)'
                      : 'rgba(99, 102, 241, 0.08)',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(129, 140, 248, 0.16)'
                        : 'rgba(99, 102, 241, 0.12)',
                    },
                  },
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(30, 41, 59, 0.8)'
                    : 'rgba(248, 250, 252, 0.8)',
                  color: theme.palette.text.primary,
                },
                '& .MuiTablePagination-root': {
                  color: theme.palette.text.primary,
                },
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  color: theme.palette.text.primary,
                },
                '& .MuiIconButton-root': {
                  color: theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(129, 140, 248, 0.1)'
                      : 'rgba(99, 102, 241, 0.1)',
                  },
                },
                '& .MuiDataGrid-virtualScroller': {
                  backgroundColor: 'transparent',
                },
                '& .MuiDataGrid-overlay': {
                  backgroundColor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 2, 
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(30, 41, 59, 0.3)'
            : 'rgba(248, 250, 252, 0.5)',
        }}>
          <Button 
            onClick={handleCloseEmployeeDialog} 
            color="primary"
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(129, 140, 248, 0.1)'
                  : 'rgba(99, 102, 241, 0.1)',
              },
            }}
          >
            Annuler
          </Button>
          <Typography variant="body2" sx={{ 
            flex: 1, 
            color: theme.palette.text.secondary,
            textAlign: 'center',
          }}>
            Cliquez sur une ligne pour sélectionner un employé
          </Typography>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmation de suppression */}
      <Dialog 
        open={deleteDialog} 
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: theme.palette.mode === 'dark'
              ? 'rgba(30, 41, 59, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.4)'
              : '0 8px 32px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <DialogTitle sx={{
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: theme.palette.error.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 1
          }}>
            <Delete sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          Confirmer la suppression
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2, color: theme.palette.text.primary }}>
            Êtes-vous sûr de vouloir supprimer le projet :
          </Typography>
          
          {projectToDelete && (
            <Box sx={{
              p: 2,
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(239, 68, 68, 0.1)'
                : 'rgba(239, 68, 68, 0.05)',
              border: `1px solid ${theme.palette.error.main}20`,
              borderRadius: 1,
              mb: 2
            }}>
              <Typography variant="h6" sx={{ 
                color: theme.palette.error.main, 
                fontWeight: 600,
                mb: 1
              }}>
                {projectToDelete.name}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: theme.palette.text.secondary,
                mb: 1
              }}>
                {projectToDelete.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={projectToDelete.status} 
                  size="small" 
                  color={getStatusColor(projectToDelete.status)}
                  sx={{ fontSize: '0.75rem' }}
                />
                <Chip 
                  label={getPriorityText(projectToDelete.priority)} 
                  size="small" 
                  color={getPriorityColor(projectToDelete.priority)}
                  sx={{ fontSize: '0.75rem' }}
                />
              </Box>
            </Box>
          )}
          
          <Typography variant="body2" sx={{ 
            color: theme.palette.warning.main,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Warning sx={{ fontSize: 18 }} />
            Cette action est irréversible et supprimera définitivement le projet.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          pt: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          gap: 1
        }}>
          <Button 
            onClick={handleCancelDelete}
            variant="outlined"
            sx={{
              color: theme.palette.text.primary,
              borderColor: theme.palette.divider,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(129, 140, 248, 0.1)'
                  : 'rgba(99, 102, 241, 0.1)',
              },
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            startIcon={<Delete />}
            sx={{
              backgroundColor: theme.palette.error.main,
              '&:hover': {
                backgroundColor: theme.palette.error.dark,
              },
            }}
          >
            Supprimer définitivement
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Project Details Dialog */}
      <ProjectDetails
        open={detailsDialog}
        onClose={() => {
          setDetailsDialog(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
      />
    </Box>
  );
};

export default Projects;
