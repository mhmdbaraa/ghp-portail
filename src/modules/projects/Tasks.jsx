import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogContentText,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add,
  Visibility,
  Edit,
  Delete,
  MoreVert,
  Assignment,
  Schedule,
  Person,
  Close,
  Search,
} from '@mui/icons-material';
import taskService from '../../shared/services/taskService';
import { useAuth } from '../../shared/contexts/AuthContext';

const Tasks = () => {
  const { isAuthenticated, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // CRUD Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Task details page state
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  
  // Assignee selection dialog
  const [assigneeDialogOpen, setAssigneeDialogOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  
  // Form states
  const [taskForm, setTaskForm] = useState({
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
  });

  // Load tasks and projects from API
  useEffect(() => {
    loadTasks();
    loadProjects();
    loadUsers();
  }, []);


  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
      case 'critical':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
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

  const getProjectName = (projectId) => {
    if (!projectId) return 'Projet non assigné';
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : `Projet ${projectId}`;
  };


  const getAssigneeName = (assigneeId) => {
    if (!assigneeId) return 'Non assigné';
    const assignee = users.find(u => u.id === assigneeId);
    return assignee ? `${assignee.first_name || ''} ${assignee.last_name || ''}`.trim() || assignee.username : `Utilisateur ${assigneeId}`;
  };

  const getTaskTypeLabel = (type) => {
    const types = {
      'task': 'Tâche',
      'bug': 'Bug',
      'feature': 'Fonctionnalité',
      'improvement': 'Amélioration'
    };
    return types[type] || type;
  };

  const getPriorityLabel = (priority) => {
    const priorities = {
      'low': 'Basse',
      'medium': 'Moyenne',
      'high': 'Haute',
      'urgent': 'Urgente'
    };
    return priorities[priority] || priority;
  };

  const openAssigneeDialog = () => {
    setAssigneeDialogOpen(true);
    setSearchTerm('');
    setFilteredUsers(users);
  };

  const closeAssigneeDialog = () => {
    setAssigneeDialogOpen(false);
    setSearchTerm('');
  };

  const handleSearchChange = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        (user.first_name && user.first_name.toLowerCase().includes(term)) ||
        (user.last_name && user.last_name.toLowerCase().includes(term)) ||
        (user.username && user.username.toLowerCase().includes(term)) ||
        (user.email && user.email.toLowerCase().includes(term))
      );
      setFilteredUsers(filtered);
    }
  };

  const handleAssigneeSelect = (user) => {
    setSelectedAssignee(user);
    setTaskForm(prev => ({ ...prev, assignee: user.id }));
    closeAssigneeDialog();
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'not_started': 'Non démarré',
      'in_progress': 'En cours',
      'completed': 'Terminé',
      'on_hold': 'En attente',
      'cancelled': 'Annulé',
    };
    return statusMap[status] || status;
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high':
      case 'critical':
        return 'Élevée';
      case 'medium':
        return 'Moyenne';
      case 'low':
        return 'Faible';
      default:
        return 'Non définie';
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // CRUD Operations
  const handleCreateTask = async () => {
    try {
      setLoading(true);
      
      const taskData = {
        ...taskForm,
        estimated_time: parseFloat(taskForm.estimated_time) || 0
      };
      
      const result = await taskService.createTask(taskData);
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Tâche créée avec succès',
          severity: 'success'
        });
        setCreateDialogOpen(false);
        resetForm();
        // Add a small delay to ensure the database is updated
        setTimeout(async () => {
          await loadTasks(); // Reload tasks
        }, 500);
      } else {
        setSnackbar({
          open: true,
          message: `Erreur: ${result.error}`,
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Erreur: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = async () => {
    try {
      setLoading(true);
      
      const taskData = {
        ...taskForm,
        estimated_time: parseFloat(taskForm.estimated_time) || 0
      };
      
      
      const result = await taskService.updateTask(selectedTask.id, taskData);
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Tâche mise à jour avec succès',
          severity: 'success'
        });
        setEditDialogOpen(false);
        resetForm();
        loadTasks(); // Reload tasks
      } else {
        setSnackbar({
          open: true,
          message: `Erreur: ${result.error}`,
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Erreur: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    try {
      setLoading(true);
      
      const result = await taskService.deleteTask(selectedTask.id);
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Tâche supprimée avec succès',
          severity: 'success'
        });
        setDeleteDialogOpen(false);
        loadTasks(); // Reload tasks
      } else {
        setSnackbar({
          open: true,
          message: `Erreur: ${result.error}`,
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Erreur: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const result = await taskService.changeTaskStatus(taskId, newStatus);
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Statut mis à jour avec succès',
          severity: 'success'
        });
        loadTasks(); // Reload tasks
      } else {
        setSnackbar({
          open: true,
          message: `Erreur: ${result.error}`,
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Erreur: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Dialog handlers
  const openCreateDialog = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const openDetailsDialog = (task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const openEditDialog = (task) => {
    setSelectedTask(task);
    
    // Find the assignee user if task has an assignee
    const assigneeUser = task.assignee ? users.find(u => u.id === task.assignee) : null;
    setSelectedAssignee(assigneeUser);
    
    // Validate project exists in projects list
    const projectId = task.project ? String(task.project) : '';
    const validProject = projects.find(p => String(p.id) === projectId);
    
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'not_started',
      priority: task.priority || 'medium',
      task_type: task.task_type || 'task',
      project: validProject ? projectId : '',
      assignee: task.assignee || '',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      estimated_time: task.estimated_time || 0,
      notes: task.notes || ''
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (task) => {
    setSelectedTask(task);
    setDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setTaskForm({
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
    });
    setSelectedAssignee(null);
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await taskService.getTasks();
      
      if (result.success) {
        setTasks(result.data || []);
      } else {
        setError(result.error || 'Failed to load tasks');
      }
    } catch (err) {
      console.error('❌ Error loading tasks:', err);
      setError('Error loading tasks: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      if (!isAuthenticated) {
        setProjects([]);
        return;
      }
      
      const token = localStorage.getItem('accessToken');
      
      // Use axiosInstance for proper authentication
      const response = await fetch('/api/projects/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          
          // Handle different response formats
          let projectsList = [];
          if (data.results) {
            projectsList = data.results;
          } else if (Array.isArray(data)) {
            projectsList = data;
          } else if (data.data) {
            projectsList = data.data;
          }
          
          setProjects(projectsList);
        } else {
          setProjects([]);
        }
      } else {
        setProjects([]);
      }
    } catch (err) {
      setProjects([]);
    }
  };

  const loadUsers = async () => {
    try {
      if (!isAuthenticated) {
        setUsers([]);
        return;
      }
      
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/auth/users/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        let usersList = [];
        if (data.results) {
          usersList = data.results;
        } else if (Array.isArray(data)) {
          usersList = data;
        } else if (data.data) {
          usersList = data.data;
        }
        
        setUsers(usersList);
      } else {
        setUsers([]);
      }
    } catch (err) {
      setUsers([]);
    }
  };

  // Task details page
  if (showTaskDetails && selectedTask) {
    const project = projects.find(p => p.id === selectedTask.project);
    const assignee = users.find(u => u.id === selectedTask.assignee);

  return (
    <Box sx={{ p: 3 }}>
        {/* Header with back button */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<Close />}
            onClick={() => setShowTaskDetails(false)}
            sx={{ mr: 2 }}
          >
            Retour
          </Button>
          <Typography variant="h4" fontWeight={600}>
            Détails de la tâche
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Task Information */}
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {selectedTask.title}
                </Typography>
                {selectedTask.task_number && (
                  <Typography variant="body2" sx={{ 
                    color: 'primary.main',
                    fontWeight: 600,
                    mb: 2
                  }}>
                    {selectedTask.task_number}
                  </Typography>
                )}
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {selectedTask.description || 'Aucune description'}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2, 
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2d2d2d' : 'grey.50',
                      borderRadius: 1,
                      border: (theme) => theme.palette.mode === 'dark' ? '1px solid #404040' : 'none'
                    }}>
                      <Typography variant="caption" sx={{ 
                        color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : 'text.secondary'
                      }}>
                        Statut
                      </Typography>
                      <Chip 
                        label={getStatusLabel(selectedTask.status)} 
                        color={getStatusColor(selectedTask.status)}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2, 
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2d2d2d' : 'grey.50',
                      borderRadius: 1,
                      border: (theme) => theme.palette.mode === 'dark' ? '1px solid #404040' : 'none'
                    }}>
                      <Typography variant="caption" sx={{ 
                        color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : 'text.secondary'
                      }}>
                        Priorité
                      </Typography>
                      <Chip 
                        label={getPriorityLabel(selectedTask.priority)} 
                        color={getPriorityColor(selectedTask.priority)}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2, 
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2d2d2d' : 'grey.50',
                      borderRadius: 1,
                      border: (theme) => theme.palette.mode === 'dark' ? '1px solid #404040' : 'none'
                    }}>
                      <Typography variant="caption" sx={{ 
                        color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : 'text.secondary'
                      }}>
                        Type
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        mt: 1,
                        color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'
                      }}>
                        {getTaskTypeLabel(selectedTask.task_type) || 'Non défini'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2, 
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2d2d2d' : 'grey.50',
                      borderRadius: 1,
                      border: (theme) => theme.palette.mode === 'dark' ? '1px solid #404040' : 'none'
                    }}>
                      <Typography variant="caption" sx={{ 
                        color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : 'text.secondary'
                      }}>
                        Temps estimé
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        mt: 1,
                        color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'
                      }}>
                        {selectedTask.estimated_time || 0}h
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Notes */}
            {selectedTask.notes && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Notes
                  </Typography>
                  <Typography variant="body1">
                    {selectedTask.notes}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Project Information */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📁 Projet associé
                </Typography>
                {project ? (
        <Box>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {project.name}
          </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {project.description || 'Aucune description'}
          </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip 
                        label={project.status} 
                        color={getStatusColor(project.status)}
                        size="small"
                      />
                      <Chip 
                        label={project.priority} 
                        color={getPriorityColor(project.priority)}
                        size="small"
                      />
        </Box>
                    <Typography variant="caption" color="text.secondary">
                      Début: {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Non défini'}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      Fin: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Non défini'}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Aucun projet associé
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Assignee Information */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  👤 Assigné à
                </Typography>
                {assignee ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {assignee.first_name ? assignee.first_name[0] : assignee.username[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {assignee.first_name && assignee.last_name 
                          ? `${assignee.first_name} ${assignee.last_name}`
                          : assignee.username
                        }
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {assignee.email}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'grey.400' }}>
                      ?
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={500} color="text.secondary">
                        Non assigné
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Aucun utilisateur assigné à cette tâche
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Task Actions */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => {
                      setShowTaskDetails(false);
                      openEditDialog(selectedTask);
                    }}
                    fullWidth
                  >
                    Modifier la tâche
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Delete />}
                    color="error"
                    onClick={() => {
                      setShowTaskDetails(false);
                      openDeleteDialog(selectedTask);
                    }}
                    fullWidth
                  >
                    Supprimer la tâche
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 400,
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress />
        <Typography>Chargement des tâches...</Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
        >
          Réessayer
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* En-tête avec bouton d'ajout */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
            Tâches
          </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
            disabled={!isAuthenticated}
            sx={{ borderRadius: 2 }}
            onClick={openCreateDialog}
          >
            Nouvelle tâche
        </Button>
        </Box>
      </Box>


      {/* Authentication status */}
      {!isAuthenticated && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
          <Typography variant="body1" color="warning.dark">
            <strong>⚠️ Non authentifié</strong> - Vous devez vous connecter pour accéder aux projets et créer des tâches.
          </Typography>
        </Box>
      )}


      {/* Grille des tâches */}
      {tasks.length === 0 && !loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aucune tâche trouvée
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Créez votre première tâche en cliquant sur "Nouvelle tâche"
          </Typography>
        </Box>
      ) : (
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
                    {task.task_number && (
                      <Typography variant="caption" sx={{ 
                        color: 'primary.main',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        display: 'block',
                        mb: 1
                      }}>
                        {task.task_number}
                      </Typography>
                    )}
                    <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 500 }}>
                      📁 {getProjectName(task.project)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {task.description || 'Aucune description'}
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
                          {getProjectName(task.project)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                          {task.assignee_name || 'Non assigné'}
                    </Typography>
                  </Box>
                </Box>

                {/* Statuts et priorités */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                        label={getStatusLabel(task.status)} 
                    color={getStatusColor(task.status)}
                    size="small"
                  />
                  <Chip
                    label={getPriorityLabel(task.priority)}
                    color={getPriorityColor(task.priority)}
                    size="small"
                  />
                </Box>

                    {/* Barre de progression */}
                <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Progression
                    </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {task.progress_percentage || 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                        value={task.progress_percentage || 0}
                        sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>

                    {/* Date d'échéance et temps estimé */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Schedule sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                          {task.due_date ? new Date(task.due_date).toLocaleDateString('fr-FR') : 'Pas de date'}
                      </Typography>
                    </Box>
                      <Typography variant="body2" color="text.secondary">
                        {task.estimated_time || 0}h
                    </Typography>
                  </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        variant="outlined"
                        sx={{ flex: 1 }}
                        onClick={() => openDetailsDialog(task)}
                      >
                        Détails
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        variant="outlined"
                        sx={{ flex: 1 }}
                        onClick={() => openEditDialog(task)}
                      >
                        Modifier
                      </Button>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => openDeleteDialog(task)}
                      >
                      <Delete />
                    </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      )}


      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Create Task Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Créer une nouvelle tâche
            <IconButton onClick={() => setCreateDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Titre de la tâche"
              value={taskForm.title}
              onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={taskForm.description}
              onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={3}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={taskForm.status}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, status: e.target.value }))}
                >
                  <MenuItem value="not_started">Non commencé</MenuItem>
                  <MenuItem value="in_progress">En cours</MenuItem>
                  <MenuItem value="completed">Terminé</MenuItem>
                  <MenuItem value="on_hold">En attente</MenuItem>
                  <MenuItem value="cancelled">Annulé</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Priorité</InputLabel>
                <Select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <MenuItem value="low">Faible</MenuItem>
                  <MenuItem value="medium">Moyenne</MenuItem>
                  <MenuItem value="high">Élevée</MenuItem>
                  <MenuItem value="critical">Critique</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <FormControl fullWidth>
              <InputLabel>Projet</InputLabel>
              <Select
                value={taskForm.project}
                onChange={(e) => setTaskForm(prev => ({ ...prev, project: e.target.value }))}
                required
                error={!!(taskForm.project && !projects.find(p => String(p.id) === String(taskForm.project)))}
              >
                <MenuItem value="">Sélectionner un projet</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Assigné à"
              fullWidth
              variant="outlined"
              required
              value={selectedAssignee ? `${selectedAssignee.first_name || ''} ${selectedAssignee.last_name || ''}`.trim() || selectedAssignee.username : ''}
              onClick={openAssigneeDialog}
              helperText="Cliquez pour sélectionner un utilisateur"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <Button
                    size="small"
                    onClick={openAssigneeDialog}
                    sx={{ 
                      minWidth: 'auto',
                      px: 1,
                      py: 0.5,
                      fontSize: '0.75rem'
                    }}
                  >
                    <Search />
                  </Button>
                )
              }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Date d'échéance"
                type="date"
                value={taskForm.due_date}
                onChange={(e) => setTaskForm(prev => ({ ...prev, due_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Temps estimé (heures)"
                type="number"
                value={taskForm.estimated_time}
                onChange={(e) => setTaskForm(prev => ({ ...prev, estimated_time: e.target.value }))}
                fullWidth
              />
            </Box>
            <TextField
              label="Notes"
              value={taskForm.notes}
              onChange={(e) => setTaskForm(prev => ({ ...prev, notes: e.target.value }))}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleCreateTask} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Task Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            background: (theme) => theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
              : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 3,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #667eea, #764ba2)',
          }
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                📋 Détails de la tâche
              </Typography>
              {selectedTask && (
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Créée le {selectedTask.created_at ? new Date(selectedTask.created_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
                </Typography>
              )}
            </Box>
            <IconButton 
              onClick={() => setDetailsDialogOpen(false)}
              sx={{ 
                color: 'white',
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.1)' 
                }
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {selectedTask && (
            <Box sx={{ p: 3 }}>
              {/* Task Header */}
              <Card sx={{ 
                mb: 3, 
                background: (theme) => theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                border: (theme) => theme.palette.mode === 'dark' 
                  ? '1px solid #404040'
                  : '1px solid #e9ecef',
                boxShadow: (theme) => theme.palette.mode === 'dark' 
                  ? '0 2px 8px rgba(0,0,0,0.3)'
                  : '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <CardContent>
                  <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                    {selectedTask.title}
                  </Typography>
                  {selectedTask.task_number && (
                    <Typography variant="h6" sx={{ 
                      color: 'primary.main',
                      fontWeight: 600,
                      mb: 2
                    }}>
                      {selectedTask.task_number}
                    </Typography>
                  )}
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                    {selectedTask.description || 'Aucune description fournie'}
                  </Typography>
                  
                  {/* Status and Priority Cards */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 2, 
                        borderRadius: 2,
                        background: (theme) => theme.palette.mode === 'dark' 
                          ? '#2d2d2d'
                          : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        border: (theme) => theme.palette.mode === 'dark' 
                          ? '1px solid #404040'
                          : '1px solid #dee2e6'
                      }}>
                        <Typography variant="caption" sx={{ 
                          fontWeight: 600,
                          color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : 'text.secondary'
                        }}>
                          STATUT
                        </Typography>
                        <Chip 
                          label={getStatusLabel(selectedTask.status)} 
                          color={getStatusColor(selectedTask.status)}
                          sx={{ 
                            mt: 1, 
                            fontWeight: 600,
                            '& .MuiChip-label': { fontSize: '0.875rem' }
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 2, 
                        borderRadius: 2,
                        background: (theme) => theme.palette.mode === 'dark' 
                          ? '#2d2d2d'
                          : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        border: (theme) => theme.palette.mode === 'dark' 
                          ? '1px solid #404040'
                          : '1px solid #dee2e6'
                      }}>
                        <Typography variant="caption" sx={{ 
                          fontWeight: 600,
                          color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : 'text.secondary'
                        }}>
                          PRIORITÉ
                        </Typography>
                        <Chip 
                          label={getPriorityLabel(selectedTask.priority)} 
                          color={getPriorityColor(selectedTask.priority)}
                          sx={{ 
                            mt: 1, 
                            fontWeight: 600,
                            '& .MuiChip-label': { fontSize: '0.875rem' }
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 2, 
                        borderRadius: 2,
                        background: (theme) => theme.palette.mode === 'dark' 
                          ? '#2d2d2d'
                          : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        border: (theme) => theme.palette.mode === 'dark' 
                          ? '1px solid #404040'
                          : '1px solid #dee2e6'
                      }}>
                        <Typography variant="caption" sx={{ 
                          fontWeight: 600,
                          color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : 'text.secondary'
                        }}>
                          TYPE
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          mt: 1, 
                          fontWeight: 600,
                          color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                          textShadow: (theme) => theme.palette.mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
                        }}>
                          {getTaskTypeLabel(selectedTask.task_type) || 'Non défini'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 2, 
                        borderRadius: 2,
                        background: (theme) => theme.palette.mode === 'dark' 
                          ? '#2d2d2d'
                          : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        border: (theme) => theme.palette.mode === 'dark' 
                          ? '1px solid #404040'
                          : '1px solid #dee2e6'
                      }}>
                        <Typography variant="caption" sx={{ 
                          fontWeight: 600,
                          color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : 'text.secondary'
                        }}>
                          TEMPS ESTIMÉ
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          mt: 1, 
                          fontWeight: 600,
                          color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                          textShadow: (theme) => theme.palette.mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
                        }}>
                          {selectedTask.estimated_time || 0}h
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Project and Assignee Info */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    height: '100%',
                    background: (theme) => theme.palette.mode === 'dark' 
                      ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
                      : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    border: (theme) => theme.palette.mode === 'dark' 
                      ? '1px solid #404040'
                      : '1px solid #e9ecef',
                    boxShadow: (theme) => theme.palette.mode === 'dark' 
                      ? '0 2px 8px rgba(0,0,0,0.3)'
                      : '0 2px 8px rgba(0,0,0,0.06)'
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          📁 Projet associé
                        </Typography>
                      </Box>
                      <Typography variant="h6" color="primary" gutterBottom>
                        {getProjectName(selectedTask.project)}
                      </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Projet lié à cette tâche
                    </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    height: '100%',
                    background: (theme) => theme.palette.mode === 'dark' 
                      ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
                      : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    border: (theme) => theme.palette.mode === 'dark' 
                      ? '1px solid #404040'
                      : '1px solid #e9ecef',
                    boxShadow: (theme) => theme.palette.mode === 'dark' 
                      ? '0 2px 8px rgba(0,0,0,0.3)'
                      : '0 2px 8px rgba(0,0,0,0.06)'
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          👤 Assigné à
                        </Typography>
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {getAssigneeName(selectedTask.assignee)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Responsable de cette tâche
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Additional Info */}
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    background: (theme) => theme.palette.mode === 'dark' 
                      ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
                      : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    border: (theme) => theme.palette.mode === 'dark' 
                      ? '1px solid #404040'
                      : '1px solid #e9ecef',
                    boxShadow: (theme) => theme.palette.mode === 'dark' 
                      ? '0 2px 8px rgba(0,0,0,0.3)'
                      : '0 2px 8px rgba(0,0,0,0.06)'
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        📅 Dates importantes
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Échéance:</Typography>
                    <Typography variant="body2" fontWeight={500}>
                            {selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString('fr-FR') : 'Non définie'}
                    </Typography>
                  </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Créée:</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {selectedTask.created_at ? new Date(selectedTask.created_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
                          </Typography>
                </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    background: (theme) => theme.palette.mode === 'dark' 
                      ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
                      : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    border: (theme) => theme.palette.mode === 'dark' 
                      ? '1px solid #404040'
                      : '1px solid #e9ecef',
                    boxShadow: (theme) => theme.palette.mode === 'dark' 
                      ? '0 2px 8px rgba(0,0,0,0.3)'
                      : '0 2px 8px rgba(0,0,0,0.06)'
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        ⏱️ Temps de travail
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Estimé:</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {selectedTask.estimated_time || 0} heures
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Temps réel:</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {selectedTask.actual_time || 0} heures
                          </Typography>
                        </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
      </Grid>

              {/* Notes Section */}
              {selectedTask.notes && (
                <Card sx={{ 
                  mt: 3,
                  background: (theme) => theme.palette.mode === 'dark' 
                    ? '#2d2d2d'
                    : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  border: (theme) => theme.palette.mode === 'dark' 
                    ? '1px solid #404040'
                    : '1px solid #e9ecef',
                  boxShadow: (theme) => theme.palette.mode === 'dark' 
                    ? '0 2px 8px rgba(0,0,0,0.3)'
                    : '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      📝 Notes
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      lineHeight: 1.6,
                      p: 2,
                      backgroundColor: (theme) => theme.palette.mode === 'dark' 
                        ? '#404040'
                        : '#f8f9fa',
                      borderRadius: 1,
                      border: (theme) => theme.palette.mode === 'dark' 
                        ? '1px solid #555555'
                        : '1px solid #e9ecef'
                    }}>
                      {selectedTask.notes}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          background: (theme) => theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
            : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderTop: (theme) => theme.palette.mode === 'dark' 
            ? '1px solid #404040'
            : '1px solid #dee2e6'
        }}>
          <Button 
            onClick={() => setDetailsDialogOpen(false)}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600
            }}
          >
            Fermer
          </Button>
          <Button 
            onClick={() => {
              setDetailsDialogOpen(false);
              openEditDialog(selectedTask);
            }}
            variant="contained"
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            Modifier la tâche
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Modifier la tâche
            <IconButton onClick={() => setEditDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Titre de la tâche"
              value={taskForm.title}
              onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={taskForm.description}
              onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={3}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={taskForm.status}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, status: e.target.value }))}
                >
                  <MenuItem value="not_started">Non commencé</MenuItem>
                  <MenuItem value="in_progress">En cours</MenuItem>
                  <MenuItem value="completed">Terminé</MenuItem>
                  <MenuItem value="on_hold">En attente</MenuItem>
                  <MenuItem value="cancelled">Annulé</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Priorité</InputLabel>
                <Select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <MenuItem value="low">Faible</MenuItem>
                  <MenuItem value="medium">Moyenne</MenuItem>
                  <MenuItem value="high">Élevée</MenuItem>
                  <MenuItem value="critical">Critique</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <FormControl fullWidth>
              <InputLabel>Projet</InputLabel>
              <Select
                value={taskForm.project}
                onChange={(e) => setTaskForm(prev => ({ ...prev, project: e.target.value }))}
                required
                error={!!(taskForm.project && !projects.find(p => String(p.id) === String(taskForm.project)))}
              >
                <MenuItem value="">Sélectionner un projet</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Assigné à"
              fullWidth
              variant="outlined"
              required
              value={selectedAssignee ? `${selectedAssignee.first_name || ''} ${selectedAssignee.last_name || ''}`.trim() || selectedAssignee.username : ''}
              onClick={openAssigneeDialog}
              helperText="Cliquez pour sélectionner un utilisateur"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <Button
                    size="small"
                    onClick={openAssigneeDialog}
                    sx={{ 
                      minWidth: 'auto',
                      px: 1,
                      py: 0.5,
                      fontSize: '0.75rem'
                    }}
                  >
                    <Search />
                  </Button>
                )
              }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Date d'échéance"
                type="date"
                value={taskForm.due_date}
                onChange={(e) => setTaskForm(prev => ({ ...prev, due_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Temps estimé (heures)"
                type="number"
                value={taskForm.estimated_time}
                onChange={(e) => setTaskForm(prev => ({ ...prev, estimated_time: e.target.value }))}
                fullWidth
              />
            </Box>
            <TextField
              label="Notes"
              value={taskForm.notes}
              onChange={(e) => setTaskForm(prev => ({ ...prev, notes: e.target.value }))}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleEditTask} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Mettre à jour'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assignee Selection Dialog */}
      <Dialog open={assigneeDialogOpen} onClose={closeAssigneeDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Sélectionner un utilisateur
            <IconButton onClick={closeAssigneeDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Rechercher par nom, prénom, nom d'utilisateur ou email..."
              value={searchTerm}
              onChange={handleSearchChange}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <Search />
                  </Box>
                ),
              }}
            />
          </Box>
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={filteredUsers.map(user => ({
                id: user.id,
                username: user.username,
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username
              }))}
              columns={[
                { 
                  field: 'full_name', 
                  headerName: 'Nom complet', 
                  width: 200,
                  renderCell: (params) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                        {params.row.first_name ? params.row.first_name[0] : params.row.username[0]}
                      </Avatar>
                      <Typography variant="body2">
                        {params.value}
                      </Typography>
                    </Box>
                  )
                },
                { field: 'username', headerName: 'Nom d\'utilisateur', width: 150 },
                { field: 'email', headerName: 'Email', width: 200 }
              ]}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              onRowClick={(params) => {
                const user = users.find(u => u.id === params.id);
                if (user) {
                  handleAssigneeSelect(user);
                }
              }}
              sx={{
                '& .MuiDataGrid-row:hover': {
                  cursor: 'pointer',
                  backgroundColor: 'action.hover'
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAssigneeDialog}>Annuler</Button>
          <Button 
            onClick={() => {
              if (selectedAssignee) {
                handleAssigneeSelect(selectedAssignee);
              }
            }}
            variant="contained"
            disabled={!selectedAssignee}
          >
            Sélectionner
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Task Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer la tâche "{selectedTask?.title}" ? 
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleDeleteTask} color="error" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tasks;
