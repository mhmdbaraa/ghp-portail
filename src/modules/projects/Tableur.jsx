import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip,
  Select,
  MenuItem,
  FormControl,
  Snackbar,
  Alert,
  Button
} from '@mui/material';
import { fakeDB } from '../../data/fakeDB';
import djangoApiService from '../../shared/services/djangoApiService';

const getPriorityColor = (p) => (p === 'high' ? 'error' : p === 'medium' ? 'warning' : 'success');

// Status options from Django model
const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started', color: 'default' },
  { value: 'in_progress', label: 'In Progress', color: 'primary' },
  { value: 'completed', label: 'Completed', color: 'success' },
  { value: 'on_hold', label: 'On Hold', color: 'warning' },
  { value: 'cancelled', label: 'Cancelled', color: 'error' },
];

const getStatusColor = (status) => {
  const statusOption = STATUS_OPTIONS.find(option => option.value === status);
  return statusOption ? statusOption.color : 'default';
};

const getStatusLabel = (status) => {
  const statusOption = STATUS_OPTIONS.find(option => option.value === status);
  return statusOption ? statusOption.label : status;
};

const Tableur = () => {
  const [editingCell, setEditingCell] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load tasks from API
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const result = await djangoApiService.getTasks();
        if (result.success) {
          setTasks(result.data.results || result.data);
        } else {
          // Fallback to fake data if API fails
          setTasks(fakeDB.tasks);
          console.warn('API failed, using fake data:', result.error);
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
        // Fallback to fake data
        setTasks(fakeDB.tasks);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Debug: Log tasks when they change
  useEffect(() => {
    console.log('Tasks loaded:', tasks);
  }, [tasks]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // Update local state immediately for better UX
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      // Call API to update the task
      const result = await djangoApiService.updateTask(taskId, { status: newStatus });
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Statut mis à jour avec succès',
          severity: 'success'
        });
      } else {
        // Revert local state if API call failed
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? { ...task, status: tasks.find(t => t.id === taskId)?.status } : task
          )
        );
        setSnackbar({
          open: true,
          message: 'Erreur lors de la mise à jour du statut',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      // Revert local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: tasks.find(t => t.id === taskId)?.status } : task
        )
      );
      setSnackbar({
        open: true,
        message: 'Erreur lors de la mise à jour du statut',
        severity: 'error'
      });
    } finally {
      setEditingCell(null);
    }
  };

  const handleCellDoubleClick = (taskId) => {
    console.log('Double-click detected for task:', taskId);
    setEditingCell(taskId);
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <Typography>Chargement des tâches...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>Tableur des tâches</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Double-cliquez sur le statut d'une tâche pour le modifier
        </Typography>
        {editingCell && (
          <Typography variant="caption" color="primary">
            (Mode édition activé)
          </Typography>
        )}
      </Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell>N° Tâche</TableCell>
              <TableCell>Projet</TableCell>
              <TableCell>N° Projet</TableCell>
              <TableCell>Assigné</TableCell>
              <TableCell>Priorité</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="right">Échéance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map(t => (
              <TableRow key={t.id} hover>
                <TableCell>{t.title}</TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{ 
                    color: 'primary.main',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}>
                    {t.task_number || '—'}
                  </Typography>
                </TableCell>
                <TableCell>{fakeDB.projects.find(p => p.id === t.project)?.name || '—'}</TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{ 
                    color: 'secondary.main',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}>
                    {fakeDB.projects.find(p => p.id === t.project)?.project_number || '—'}
                  </Typography>
                </TableCell>
                <TableCell>{fakeDB.users.find(u => u.id === t.assignee)?.name || '—'}</TableCell>
                <TableCell><Chip size="small" color={getPriorityColor(t.priority)} label={t.priority} /></TableCell>
                <TableCell 
                  onDoubleClick={() => handleCellDoubleClick(t.id)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'action.hover' },
                    position: 'relative',
                    backgroundColor: editingCell === t.id ? 'action.selected' : 'transparent'
                  }}
                >
                  {editingCell === t.id ? (
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.id, e.target.value)}
                        onBlur={() => setEditingCell(null)}
                        autoFocus
                        open
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <Chip 
                              size="small" 
                              color={option.color} 
                              label={option.label}
                              sx={{ mr: 1 }}
                            />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Chip 
                      size="small" 
                      color={getStatusColor(t.status)} 
                      label={getStatusLabel(t.status)}
                    />
                  )}
                </TableCell>
                <TableCell align="right">{t.dueDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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
    </Box>
  );
};

export default Tableur;


