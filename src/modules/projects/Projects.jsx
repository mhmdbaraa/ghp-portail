import React, { useState, useEffect, useMemo, useCallback, useRef, startTransition, useTransition, useDeferredValue, memo } from 'react';
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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
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
} from '@mui/icons-material';
import { DataGrid, GridToolbar, GridToolbarContainer, GridToolbarExport, GridToolbarQuickFilter } from '@mui/x-data-grid';
import projectService from '../../shared/services/projectService';
import ProjectDataTransformer from '../../shared/services/projectDataTransformer';
import { useAuth } from '../../shared/contexts/AuthContext';

// Options de statut pour les projets (correspondant aux choix Django)
const PROJECT_STATUS_OPTIONS = [
  { value: 'planning', label: 'Planification', color: 'default' },
  { value: 'En cours', label: 'En cours', color: 'primary' },
  { value: 'En attente', label: 'En attente', color: 'warning' },
  { value: 'En retard', label: 'En retard', color: 'error' },
  { value: 'Terminé', label: 'Terminé', color: 'success' },
  { value: 'Annulé', label: 'Annulé', color: 'error' },
];

const Projects = () => {
  // Removed console.log to eliminate perceived "reload" feeling
  
  // Removed page reload detection to eliminate perceived "reload" feeling
  
  const theme = useTheme();
  const { user } = useAuth();
  
  // Use transition for smoother updates
  const [isPending, startTransition] = useTransition();
  
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' ou 'tableur' (kanban par défaut)
  const [editingCell, setEditingCell] = useState(null);
  
  // Combined state to reduce re-renders
  const [projectsState, setProjectsState] = useState({
    projects: [],
    loading: true,
    error: null,
    paginationModel: {
      page: 0,
      pageSize: 25,
    },
    totalProjects: 0,
    paginationLoading: false, // Separate loading state for pagination
    kanbanProjects: [], // Projects for kanban view (incremental loading)
    kanbanLoading: false, // Loading state for kanban
    kanbanPage: 1, // Current page for kanban loading
    kanbanHasMore: true, // Whether there are more projects to load
    kanbanTotalCount: 0, // Total count of projects
    kanbanColumnData: { // Column-specific data for 10 projects per column
      'En attente': { projects: [], currentPage: 1, totalPages: 0, hasMore: true, totalCount: 0 },
      'En cours': { projects: [], currentPage: 1, totalPages: 0, hasMore: true, totalCount: 0 },
      'En retard': { projects: [], currentPage: 1, totalPages: 0, hasMore: true, totalCount: 0 },
      'Terminé': { projects: [], currentPage: 1, totalPages: 0, hasMore: true, totalCount: 0 },
    },
  });
  
  // Use deferred value for ultra-smooth data updates (after projectsState is declared)
  const deferredProjects = useDeferredValue(projectsState.projects);
  
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
        pageSizeOptions={[10, 25, 50, 100, 200]}
        checkboxSelection
        disableSelectionOnClick
        disableColumnReorder
        hideFooterSelectedRowCount
        density="compact"
        rowHeight={56}
        columnHeaderHeight={44}
        autoHeight={false}
        loading={loading}
        sx={{
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
        }}
      />
    ));
  }, []);
  
  // Fonction pour générer un grand dataset d'employés (memoized pour performance)
  const employees = useMemo(() => {
    const firstNames = [
      'ABBAS', 'ABBAS', 'Abbas', 'ABBES', 'ABBES', 'ABBES', 'Abbes', 'ALI', 'AMAR', 'BENALI',
      'CHERIF', 'DJELLOULI', 'FERHAT', 'GHERBI', 'HAMIDI', 'IBRAHIM', 'JAMAL', 'KARIM', 'LARBI',
      'MOHAMED', 'NADIR', 'OMAR', 'RACHID', 'SALAH', 'TARIK', 'YACINE', 'ZAKARIA', 'AHMED',
      'BOUDJEMAA', 'CHERIF', 'DJAMEL', 'FARID', 'HOCINE', 'ISMAIL', 'JALAL', 'KHALED', 'LAKHDAR',
      'MUSTAPHA', 'NOUREDDINE', 'OUSSAMA', 'REDA', 'SAID', 'TAREK', 'YASSINE', 'ZINE', 'ADEL',
      'BILAL', 'CHOUAIB', 'DJAMAL', 'FARES', 'HASSAN', 'IDRIS', 'JIHAD', 'KAMEL', 'LOTFI'
    ];
    
    const lastNames = [
      'LARBAQUI', 'NAIT CHABANE', 'RADJI', 'BEROKIA', 'BOUNOUA', 'HABIS', 'HAMDI', 'BENCHERIF',
      'BOUZID', 'MOHAMED', 'BOUALEM', 'KARIM', 'YACINE', 'SALAH', 'NASSIM', 'BENALI', 'DJELLOULI',
      'FERHAT', 'GHERBI', 'HAMIDI', 'IBRAHIM', 'JAMAL', 'KARIM', 'LARBI', 'MOHAMED', 'NADIR',
      'OMAR', 'RACHID', 'SALAH', 'TARIK', 'YACINE', 'ZAKARIA', 'AHMED', 'BOUDJEMAA', 'CHERIF',
      'DJAMEL', 'FARID', 'HOCINE', 'ISMAIL', 'JALAL', 'KHALED', 'LAKHDAR', 'MUSTAPHA', 'NOUREDDINE',
      'OUSSAMA', 'REDA', 'SAID', 'TAREK', 'YASSINE', 'ZINE', 'ADEL', 'BILAL', 'CHOUAIB', 'DJAMAL',
      'FARES', 'HASSAN', 'IDRIS', 'JIHAD', 'KAMEL', 'LOTFI', 'MALIK', 'NASSER', 'OUMAR', 'PAPA',
      'QUASSIM', 'RACHID', 'SALIM', 'TARIK', 'UMAR', 'VICTOR', 'WALID', 'XAVIER', 'YOUSSEF', 'ZAKI'
    ];
    
    const functions = [
      'Agent de sécurité', 'Délégué aux visites officines', 'Responsable Informatique', 'Agent d\'entreposage',
      'Préparateur de commandes', 'Chauffeur livreur', 'Chef de projet', 'Ingénieur logiciel', 'Analyste système',
      'Développeur senior', 'Chef d\'équipe', 'Gestionnaire de projet', 'Superviseur technique', 'Coordinateur projet',
      'Technicien réseau', 'Administrateur système', 'Développeur frontend', 'Développeur backend', 'Architecte logiciel',
      'Testeur QA', 'Chef de produit', 'Scrum Master', 'DevOps Engineer', 'Data Analyst', 'UX/UI Designer',
      'Graphiste', 'Rédacteur technique', 'Formateur', 'Consultant', 'Auditeur', 'Contrôleur qualité',
      'Gestionnaire de stock', 'Logisticien', 'Comptable', 'Assistant RH', 'Secrétaire', 'Réceptionniste',
      'Agent d\'accueil', 'Commercial', 'Vendeur', 'Conseiller client', 'Support technique', 'Maintenance',
      'Électricien', 'Plombier', 'Mécanicien', 'Chauffeur', 'Livreur', 'Magasinier', 'Inventoriste'
    ];
    
    const employees = [];
    for (let i = 1; i <= 1200; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const employeeFunction = functions[Math.floor(Math.random() * functions.length)];
      
      employees.push({
        id: i.toString(),
        name: `${firstName} ${lastName}`,
        function: employeeFunction,
        department: ['IT', 'RH', 'Finance', 'Logistique', 'Commercial', 'Production', 'Qualité'][Math.floor(Math.random() * 7)],
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, '')}@company.com`,
        phone: `+213 ${Math.floor(Math.random() * 900000000) + 100000000}`,
        status: ['Actif', 'Inactif', 'En congé'][Math.floor(Math.random() * 3)]
      });
    }
    
    return employees.sort((a, b) => a.name.localeCompare(b.name));
  }, []); // Empty dependency array means this only runs once
  
  // États pour la modale de création de projet
  const [newProjectDialog, setNewProjectDialog] = useState(false);
  const [newProject, setNewProject] = useState({ 
    name: '', 
    description: '', 
    startDate: '',
    deadline: '', 
    priority: 'Moyen',
    category: 'Web',
    budget: '',
    projectManager: '',
    projectManagerFunction: '',
    filiales: []
  });

  // États pour la modale d'édition de projet
  const [editProjectDialog, setEditProjectDialog] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editProject, setEditProject] = useState({ 
    name: '', 
    description: '', 
    startDate: '',
    deadline: '', 
    priority: 'Moyen',
    category: 'Web',
    budget: '',
    projectManager: '',
    projectManagerFunction: '',
    filiales: []
  });
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  // États pour le DataGrid des employés
  const [employeeDialog, setEmployeeDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState(employees);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // États d'erreur pour les champs obligatoires
  const [fieldErrors, setFieldErrors] = useState({
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

  // États d'erreur pour l'édition
  const [editFieldErrors, setEditFieldErrors] = useState({
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

  const ActionMenuCell = ({ row }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleOpen = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const handleView = () => { handleClose(); };
    const handleEdit = () => { 
      setEditingProject(row);
      setEditProject({
        name: row.name,
        description: row.description,
        startDate: row.startDate,
        deadline: row.deadline,
        priority: row.priority,
        projectManager: row.projectManager,
        filiales: row.filiales || []
      });
      setEditSelectedEmployee({
        name: row.projectManager,
        function: row.projectManagerFunction
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
          <MenuItem onClick={handleEdit}>
            <Edit fontSize="small" style={{ marginRight: 8 }} /> Modifier
          </MenuItem>
          <MenuItem onClick={handleDelete}>
            <Delete fontSize="small" style={{ marginRight: 8 }} /> Supprimer
          </MenuItem>
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
      handleClose(); 
    };
    
    const handleEdit = () => { 
      setEditingProject(project);
      setEditProject({
        name: project.name,
        description: project.description,
        startDate: project.startDate,
        deadline: project.deadline,
        priority: project.priority,
        projectManager: project.projectManager,
        filiales: project.filiales || []
      });
      setEditSelectedEmployee({
        name: project.projectManager,
        function: project.projectManagerFunction
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
          <MenuItem onClick={handleEdit}>
            <Edit fontSize="small" style={{ marginRight: 8 }} /> Modifier
          </MenuItem>
          <MenuItem onClick={handleDelete}>
            <Delete fontSize="small" style={{ marginRight: 8 }} /> Supprimer
          </MenuItem>
        </Menu>
      </Box>
    );
  };

  // Load projects from API with pagination (legacy function - use loadProjectsForPage instead)
  const loadProjects = async (page = projectsState.paginationModel.page + 1, pageSize = projectsState.paginationModel.pageSize) => {
    return loadProjectsForPage(page, pageSize);
  };

  // Separate function for loading projects without affecting pagination state
  const loadProjectsForPage = async (page, pageSize) => {
    try {
      // Single state update to set loading
      setProjectsState(prev => ({ ...prev, loading: true, error: null, paginationLoading: false }));
      
      const response = await projectService.getProjects({}, page, pageSize);
      
      if (response.success) {
        // Single state update with all data
        setProjectsState(prev => ({
          ...prev,
          projects: response.data,
          totalProjects: response.totalCount,
          loading: false,
          paginationLoading: false,
        }));
      } else {
        setProjectsState(prev => ({
          ...prev,
          error: response.error || 'Failed to load projects',
          loading: false,
          paginationLoading: false,
        }));
        console.error('❌ Error loading projects:', response.error);
      }
    } catch (error) {
      setProjectsState(prev => ({
        ...prev,
        error: 'Error loading projects',
        loading: false,
        paginationLoading: false,
      }));
      console.error('❌ Exception loading projects:', error);
    }
  };

  // Handle pagination changes (ultra-optimized to minimize re-renders)
  const handlePaginationModelChange = useCallback((newModel) => {
    // Use transition to make this update non-blocking
    startTransition(() => {
      // Update pagination model immediately for responsive UI
      setProjectsState(prev => ({ ...prev, paginationModel: newModel }));
    });
    
    // Load new data asynchronously with smart loading state
    const loadData = async () => {
      try {
        // Show pagination loading only if we have existing data (not initial load)
        if (projectsState.projects.length > 0) {
          setProjectsState(prev => ({ ...prev, paginationLoading: true }));
        }
        
        const response = await projectService.getProjects({}, newModel.page + 1, newModel.pageSize);
        
        if (response.success) {
          // Use transition for smooth data update
          startTransition(() => {
            setProjectsState(prev => ({
              ...prev,
              projects: response.data,
              totalProjects: response.totalCount,
              paginationLoading: false,
            }));
          });
        } else {
          setProjectsState(prev => ({
            ...prev,
            error: response.error || 'Failed to load projects',
            loading: false,
            paginationLoading: false,
          }));
        }
      } catch (error) {
        setProjectsState(prev => ({
          ...prev,
          error: 'Error loading projects',
          loading: false,
          paginationLoading: false,
        }));
      }
    };
    
    loadData();
  }, [projectsState.projects.length]);

  // Load projects for specific kanban column (10 projects per column)
  const loadKanbanColumnProjects = async (status, page = 1) => {
    try {
      console.log(`🔄 Loading ${status} column projects - page ${page}`);
      setProjectsState(prev => ({ ...prev, kanbanLoading: true }));
      
      // Load 10 projects for this specific status/column
      const response = await projectService.getProjects({ status }, page, 10);
      
      if (response.success) {
        console.log(`✅ Loaded ${response.data.length} projects for ${status} column, page ${page}`);
        
        setProjectsState(prev => {
          // Update the specific column's projects
          const newColumnProjects = response.data;
          const totalPages = Math.ceil(response.totalCount / 10);
          const hasMore = page < totalPages;
          
          console.log(`📈 ${status} column updated:`, {
            projectsOnPage: newColumnProjects.length,
            currentPage: page,
            totalPages: totalPages,
            hasMore: hasMore
          });
          
          return {
            ...prev,
            kanbanColumnData: {
              ...prev.kanbanColumnData,
              [status]: {
                projects: newColumnProjects,
                currentPage: page,
                totalPages: totalPages,
                hasMore: hasMore,
                totalCount: response.totalCount
              }
            },
            kanbanLoading: false,
          };
        });
      } else {
        console.error('❌ Failed to load kanban projects:', response.error);
        setProjectsState(prev => ({
          ...prev,
          kanbanLoading: false,
          error: response.error || 'Failed to load kanban projects',
        }));
      }
    } catch (error) {
      console.error('❌ Exception loading kanban projects:', error);
      setProjectsState(prev => ({
        ...prev,
        kanbanLoading: false,
        error: `Error loading kanban projects: ${error.message}`,
      }));
    }
  };

  // Load next page for specific kanban column
  const loadNextKanbanColumnPage = async (status) => {
    const columnData = projectsState.kanbanColumnData[status];
    console.log(`🔄 loadNextKanbanColumnPage called for ${status}`, {
      kanbanLoading: projectsState.kanbanLoading,
      hasMore: columnData.hasMore,
      currentPage: columnData.currentPage,
      totalPages: columnData.totalPages,
      totalCount: columnData.totalCount
    });
    
    if (!projectsState.kanbanLoading && columnData.hasMore) {
      console.log(`✅ Loading next page for ${status} column...`);
      await loadKanbanColumnProjects(status, columnData.currentPage + 1);
    } else {
      console.log(`❌ Not loading next page for ${status}:`, {
        alreadyLoading: projectsState.kanbanLoading,
        noMorePages: !columnData.hasMore,
        currentPage: columnData.currentPage,
        totalPages: columnData.totalPages
      });
    }
  };

  // Load projects on component mount only
  useEffect(() => {
    loadProjectsForPage(1, projectsState.paginationModel.pageSize);
    
    // Load first 10 projects for each kanban column
    const statuses = ['En attente', 'En cours', 'En retard', 'Terminé'];
    statuses.forEach(status => {
      loadKanbanColumnProjects(status, 1);
    });
  }, []); // Empty dependency array - only runs on mount

  // Project management functions
  const handleCreateProject = async () => {
    try {
      // Create project data in React format
      const reactProjectData = {
        name: newProject.name,
        description: newProject.description,
        status: 'planning', // Utiliser le statut par défaut Django
        priority: newProject.priority,
        category: newProject.category || 'Web',
        startDate: newProject.startDate,
        deadline: newProject.deadline,
        budget: newProject.budget || 0,
        progress: 0,
        notes: newProject.description,
        filiales: newProject.filiales || []
      };
      
      // Transform to API format
      const transformedData = ProjectDataTransformer.transformProjectForAPI(reactProjectData);
      
      // Add manager (not handled by transformer) - create new object to avoid corruption
      const managerId = user?.id;
      if (!managerId) {
        throw new Error('User ID is required to create a project');
      }
      const projectData = {
        ...transformedData,
        manager: managerId
      };
      
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
        // Refresh current page to show the new project
        loadProjectsForPage(projectsState.paginationModel.page + 1, projectsState.paginationModel.pageSize);
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
          category: 'Web',
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
      // Create project data in React format
      const reactProjectData = {
        name: editProject.name,
        description: editProject.description,
        status: editProject.status || 'Planification',
        priority: editProject.priority,
        category: editProject.category || 'Web',
        startDate: editProject.startDate,
        deadline: editProject.deadline,
        budget: editProject.budget || 0,
        progress: editProject.progress || 0,
        notes: editProject.description,
        filiales: editProject.filiales || []
      };
      
      // Transform to API format
      const transformedData = ProjectDataTransformer.transformProjectForAPI(reactProjectData);
      
      // Add manager (not handled by transformer) - create new object to avoid corruption
      const managerId = user?.id;
      if (!managerId) {
        throw new Error('User ID is required to create a project');
      }
      const projectData = {
        ...transformedData,
        manager: managerId
      };
      
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
      
      const response = await projectService.updateProject(editingProject.id, projectData);
      
      if (response.success) {
        const updatedProjects = projects.map(project => 
          project.id === editingProject.id ? response.data : project
        );
        setProjects(updatedProjects);
        setEditProjectDialog(false);
        setEditingProject(null);
      } else {
        setError(response.error || 'Failed to update project');
      }
    } catch (error) {
      setError('Error updating project');
      console.error('Error updating project:', error);
    }
  };

  // Fonctions pour l'édition inline du statut
  const handleStatusChange = async (projectId, newStatus) => {
    try {
      
      // Find the current project to get its original status
      const currentProject = projectsState.projects.find(p => p.id === projectId);
      const originalStatus = currentProject?.status;
      
      // Update local state immediately for better UX
      setProjectsState(prev => ({
        ...prev,
        projects: prev.projects.map(project => 
          project.id === projectId ? { ...project, status: newStatus } : project
        )
      }));

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
        // Refresh current page to ensure data consistency
        setTimeout(() => {
          loadProjectsForPage(projectsState.paginationModel.page + 1, projectsState.paginationModel.pageSize);
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
          setProjectsState(prev => ({
            ...prev,
            projects: prev.projects.map(project => 
              project.id === projectId ? { ...project, status: originalStatus } : project
            )
          }));
          
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
      setProjectsState(prev => ({
        ...prev,
        projects: prev.projects.map(project => 
          project.id === projectId ? { ...project, status: originalStatus } : project
        )
      }));
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
                value={params.value || 'planning'}
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <LinearProgress
            variant="determinate"
            value={params.value}
            sx={{ flex: 1, height: 5, borderRadius: 2.5 }}
          />
          <Typography variant="caption" sx={{ minWidth: 24, fontSize: '0.7rem' }}>
            {params.value}%
          </Typography>
        </Box>
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
    // On garde juste la conversion pour les anciens statuts
    const statusMap = {
      'Planification': 'planning',
      'paused': 'En attente', // Convertir paused vers En attente
      'active': 'En cours', // Convertir active vers En cours
    };
    
    return statusMap[status] || status; // Retourner tel quel si déjà en français
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
        <GridToolbarExport 
          sx={{
            color: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(129, 140, 248, 0.1)'
                : 'rgba(99, 102, 241, 0.1)',
            },
          }}
        />
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
      setProjectsState(prev => ({
        ...prev,
        projects: prev.projects.map(project => 
          project.id === draggedProject.id 
            ? { ...project, status: targetStatus }
            : project
        )
      }));
      
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
            loadProjectsForPage(projectsState.paginationModel.page + 1, projectsState.paginationModel.pageSize);
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
          setProjectsState(prev => ({
            ...prev,
            projects: prev.projects.map(project => 
              project.id === draggedProject.id 
                ? { ...project, status: draggedProject.status }
                : project
            )
          }));
          
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
        setProjectsState(prev => ({
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
          const updatedProjects = projects.filter(project => project.id !== projectToDelete.id);
          setProjects(updatedProjects);
          
          // Afficher un message de succès
          setSnackbar({
            open: true,
            message: `Projet "${projectToDelete.name}" supprimé avec succès`,
            severity: 'success'
          });
        } else {
          setError(response.error || 'Failed to delete project');
          setSnackbar({
            open: true,
            message: `Erreur lors de la suppression: ${response.error}`,
            severity: 'error'
          });
        }
      } catch (error) {
        setError('Error deleting project');
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

  // Gestionnaires pour la modale de création de projet
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
      projectManager: '',
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
    setEditProject({
      name: '',
      description: '',
      startDate: '',
      deadline: '',
      priority: 'Moyen',
      category: 'Web',
      budget: '',
      projectManager: '',
      filiales: []
    });
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
    // Réinitialiser les erreurs
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
    
    let hasErrors = false;
    const newFieldErrors = { ...editFieldErrors };
    
    if (!editProject.name.trim()) {
      newFieldErrors.name = true;
      hasErrors = true;
    }
    
    if (!editProject.description.trim()) {
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
    
    if (!editProject.category) {
      newFieldErrors.category = true;
      hasErrors = true;
    }
    
    if (!editProject.filiales || editProject.filiales.length === 0) {
      newFieldErrors.filiales = true;
      hasErrors = true;
    }
    
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
        setEditFieldErrors(newFieldErrors);
        return;
      }
    }
    
    if (hasErrors) {
      setEditFieldErrors(newFieldErrors);
      setSnackbar({
        open: true,
        message: 'Veuillez remplir tous les champs obligatoires',
        severity: 'error'
      });
      return;
    }
    
    const projectData = {
      ...editProject,
      projectManagerName: editSelectedEmployee.name,
      projectManagerFunction: editSelectedEmployee.function
    };
    
    setSnackbar({
      open: true,
      message: `Projet modifié avec succès ! Chef de projet: ${editSelectedEmployee.name}`,
      severity: 'success'
    });
    handleCloseEditDialog();
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

  const handleBudgetChange = (e) => {
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

  // Fonction de gestion des filiales avec logique spéciale pour "TOUT"
  const handleFilialesChange = (event) => {
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
    } else if (newFiliales.length > 1 && newFiliales.includes('TOUT')) {
      // Si plusieurs options sont sélectionnées et "TOUT" est inclus, retirer "TOUT"
      newFiliales = newFiliales.filter(filiale => filiale !== 'TOUT');
    }
    
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

  const handleEditCategoryChange = (e) => {
    setEditProject({ ...editProject, category: e.target.value });
    if (editFieldErrors.category) {
      setEditFieldErrors({ ...editFieldErrors, category: false });
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
    } else if (newFiliales.length > 1 && newFiliales.includes('TOUT')) {
      // Si plusieurs options sont sélectionnées et "TOUT" est inclus, retirer "TOUT"
      newFiliales = newFiliales.filter(filiale => filiale !== 'TOUT');
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
    handleSelectEmployee(params.row);
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

  // Grouper les projets par statut pour la vue Kanban (using column-specific data) - memoized for performance
  const groupedProjects = useMemo(() => {
    // Use column-specific data (10 projects per column)
    const grouped = {
      'En attente': projectsState.kanbanColumnData['En attente'].projects,
      'En cours': projectsState.kanbanColumnData['En cours'].projects,
      'En retard': projectsState.kanbanColumnData['En retard'].projects,
      'Terminé': projectsState.kanbanColumnData['Terminé'].projects,
    };
    
    console.log('📊 Column projects (10 per column):', {
      'En attente': grouped['En attente'].length,
      'En cours': grouped['En cours'].length,
      'En retard': grouped['En retard'].length,
      'Terminé': grouped['Terminé'].length,
    });
    
    return grouped;
  }, [projectsState.kanbanColumnData]);

  // Show loading state only for initial load, not for pagination
  if ((projectsState.loading && projectsState.projects.length === 0) || (viewMode === 'kanban' && projectsState.kanbanLoading && projectsState.projects.length === 0)) {
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
  if (projectsState.error) {
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
            {projectsState.error}
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => loadProjectsForPage(projectsState.paginationModel.page + 1, projectsState.paginationModel.pageSize)}
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
                            kanbanLoading: projectsState.kanbanLoading,
                            kanbanHasMore: projectsState.kanbanHasMore
                          });
                        }
                        
                        // Check if we're near the bottom and not already loading
                        const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold;
                        const isVeryClose = scrollTop + clientHeight >= scrollHeight - 50; // Fallback threshold
                        
                        if ((isNearBottom || isVeryClose) && 
                            !projectsState.kanbanLoading && 
                            projectsState.kanbanColumnData[status].hasMore) {
                          console.log(`🔄 Triggering next page load for ${status} column`, {
                            isNearBottom,
                            isVeryClose,
                            distanceFromBottom: scrollHeight - (scrollTop + clientHeight),
                            currentPage: projectsState.kanbanColumnData[status].currentPage,
                            nextPage: projectsState.kanbanColumnData[status].currentPage + 1
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
                                    lineHeight: 1.1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    color: theme.palette.text.primary
                              }}>
                                {project.name}
                              </Typography>
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
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
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
                      {projectsState.kanbanLoading && (
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
                      {!projectsState.kanbanLoading && projectsState.kanbanColumnData[status].hasMore && (
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
                          📥 {status} - Page {projectsState.kanbanColumnData[status].currentPage + 1}/{projectsState.kanbanColumnData[status].totalPages}
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
              paginationModel={projectsState.paginationModel}
              onPaginationModelChange={handlePaginationModelChange}
              rowCount={projectsState.totalProjects}
              paginationMode="server"
              pageSizeOptions={[10, 25, 50, 100, 200]}
              checkboxSelection
              disableSelectionOnClick
              disableColumnReorder
              hideFooterSelectedRowCount
              density="compact"
              rowHeight={56}
              columnHeaderHeight={44}
              autoHeight={false}
              loading={projectsState.paginationLoading}
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
                  padding: '4px 6px',
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: '32px !important',
                },
                '& .MuiDataGrid-row': {
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(129, 140, 248, 0.05)'
                      : 'rgba(99, 102, 241, 0.05)',
                  },
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
              <MenuItem value="Web">Web</MenuItem>
              <MenuItem value="Mobile">Mobile</MenuItem>
              <MenuItem value="Desktop">Desktop</MenuItem>
              <MenuItem value="Data">Data</MenuItem>
              <MenuItem value="AI/ML">AI/ML</MenuItem>
              <MenuItem value="DevOps">DevOps</MenuItem>
              <MenuItem value="Gaming">Gaming</MenuItem>
              <MenuItem value="IoT">IoT</MenuItem>
            </Select>
            {fieldErrors.category && (
              <FormHelperText error>
                Ce champ est obligatoire
              </FormHelperText>
            )}
          </FormControl>
          
          {/* Champ Budget */}
          <TextField
            margin="dense"
            label="Budget (€)"
            type="number"
            fullWidth
            variant="outlined"
            value={newProject.budget}
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
              value={editProject.name}
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
              value={editProject.description}
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
                value={editProject.priority}
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
                value={editProject.category}
                label="Catégorie"
                error={editFieldErrors.category}
                onChange={handleEditCategoryChange}
                sx={{
                  '& .MuiSelect-select': {
                    color: theme.palette.text.primary,
                  },
                }}
              >
                <MenuItem value="Web">Web</MenuItem>
                <MenuItem value="Mobile">Mobile</MenuItem>
                <MenuItem value="Desktop">Desktop</MenuItem>
                <MenuItem value="Data">Data</MenuItem>
                <MenuItem value="AI/ML">AI/ML</MenuItem>
                <MenuItem value="DevOps">DevOps</MenuItem>
                <MenuItem value="Gaming">Gaming</MenuItem>
                <MenuItem value="IoT">IoT</MenuItem>
              </Select>
              {editFieldErrors.category && (
                <FormHelperText error>
                  Ce champ est obligatoire
                </FormHelperText>
              )}
            </FormControl>

            {/* Champ Budget */}
            <TextField
              margin="dense"
              label="Budget (€)"
              type="number"
              fullWidth
              variant="outlined"
              value={editProject.budget}
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
    </Box>
  );
};

export default Projects;
