import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Chip,
  Avatar,
  LinearProgress,
  Card,
  CardContent,
  Grid,
  Divider,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  useTheme,
  alpha,
  Tooltip,
  AvatarGroup,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  CalendarToday,
  TrendingUp,
  AttachMoney,
  Group,
  Assignment,
  CheckCircle,
  Schedule,
  LocalOffer,
  Description,
  AccountCircle,
  Edit,
  PlayArrow,
  ChatBubbleOutline,
  Send,
  FavoriteBorder,
  Favorite,
} from '@mui/icons-material';
import djangoApiService from '../../shared/services/djangoApiService';
import { useAuth } from '../../shared/contexts/AuthContext';

const ProjectDetails = ({ open, onClose, project }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [postingNote, setPostingNote] = useState(false);
  const notesEndRef = useRef(null);

  useEffect(() => {
    if (open && project) {
      setActiveTab(0); // Reset to first tab when opening
      loadProjectTasks();
      loadProjectNotes();
    }
  }, [open, project]);

  useEffect(() => {
    if (activeTab === 3 && notes.length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [activeTab]);

  const scrollToBottom = () => {
    notesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadProjectTasks = async () => {
    if (!project?.id) return;
    
    setLoadingTasks(true);
    try {
      const result = await djangoApiService.getTasks();
      if (result.success) {
        const projectTasks = (result.data.results || result.data).filter(
          task => task.project === project.id
        );
        setTasks(projectTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const loadProjectNotes = async () => {
    if (!project?.id) return;
    
    setLoadingNotes(true);
    try {
      const result = await djangoApiService.getProjectNotes(project.id);
      if (result.success) {
        setNotes(result.data || []);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handlePostNote = async () => {
    if (!newNote.trim() || !project?.id) return;
    
    setPostingNote(true);
    try {
      const result = await djangoApiService.createProjectNote(project.id, newNote);
      if (result.success) {
        setNotes([result.data, ...notes]);
        setNewNote('');
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Error posting note:', error);
    } finally {
      setPostingNote(false);
    }
  };

  const handleToggleLike = async (noteId) => {
    try {
      const result = await djangoApiService.toggleNoteLike(noteId);
      if (result.success) {
        setNotes(notes.map(note => 
          note.id === noteId 
            ? { ...note, is_liked: result.data.liked, likes_count: result.data.likes_count }
            : note
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Planification': theme.palette.info,
      'En cours': theme.palette.primary,
      'Terminé': theme.palette.success,
      'En attente': theme.palette.warning,
      'En retard': theme.palette.error,
      'Annulé': theme.palette.grey,
    };
    return colors[status] || theme.palette.grey;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Élevé': theme.palette.error,
      'Moyen': theme.palette.warning,
      'Faible': theme.palette.success,
      'high': theme.palette.error,
      'medium': theme.palette.warning,
      'low': theme.palette.success,
    };
    return colors[priority] || theme.palette.grey;
  };

  const getTaskStatusColor = (status) => {
    const colors = {
      'not_started': 'default',
      'in_progress': 'primary',
      'completed': 'success',
      'on_hold': 'warning',
      'cancelled': 'error',
    };
    return colors[status] || 'default';
  };

  const getTaskStatusLabel = (status) => {
    const labels = {
      'not_started': 'Non démarré',
      'in_progress': 'En cours',
      'completed': 'Terminé',
      'on_hold': 'En pause',
      'cancelled': 'Annulé',
    };
    return labels[status] || status;
  };

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const tasksProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  if (!project) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          height: '90vh',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${getStatusColor(project.status).main} 0%, ${getStatusColor(project.status).dark} 100%)`,
          color: 'white',
          p: 3,
          position: 'relative',
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: 'white',
            '&:hover': {
              backgroundColor: alpha('#fff', 0.2),
            }
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              fontSize: '1.5rem',
              bgcolor: alpha('#fff', 0.2),
              border: '3px solid rgba(255,255,255,0.3)',
            }}
          >
            {project.name?.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="overline" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
              {project.projectNumber || 'N/A'}
            </Typography>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {project.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              <Chip
                label={project.status}
                size="small"
                sx={{
                  bgcolor: alpha('#fff', 0.25),
                  color: 'white',
                  fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              />
              <Chip
                icon={<LocalOffer sx={{ color: 'white !important' }} />}
                label={project.priority}
                size="small"
                sx={{
                  bgcolor: alpha('#fff', 0.25),
                  color: 'white',
                  fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              />
              <Chip
                label={project.category}
                size="small"
                sx={{
                  bgcolor: alpha('#fff', 0.25),
                  color: 'white',
                  fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Progression du projet
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {project.progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={project.progress || 0}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: alpha('#fff', 0.2),
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                bgcolor: 'white',
              }
            }}
          />
        </Box>
      </Box>

      <DialogContent sx={{ p: 0, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
              }
            }}
          >
            <Tab label="Vue d'ensemble" icon={<Description />} iconPosition="start" />
            <Tab label={`Tâches (${tasks.length})`} icon={<Assignment />} iconPosition="start" />
            <Tab label="Équipe" icon={<Group />} iconPosition="start" />
            <Tab label={`Notes (${notes.length})`} icon={<ChatBubbleOutline />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
          {/* Overview Tab */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* Stats Cards */}
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <CalendarToday sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h6" fontWeight={700}>
                          {project.deadline}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Échéance
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <AttachMoney sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                        <Typography variant="h6" fontWeight={700}>
                          {project.budget || '€0'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Budget
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Assignment sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
                        <Typography variant="h6" fontWeight={700}>
                          {tasks.length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Tâches totales
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <TrendingUp sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                        <Typography variant="h6" fontWeight={700}>
                          {tasksProgress}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Tâches complétées
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>

              {/* Description */}
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Description color="primary" />
                      Description du projet
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      {project.description || 'Aucune description disponible'}
                    </Typography>

                    {project.notes && (
                      <>
                        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Edit color="primary" />
                          Notes
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                          {project.notes}
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Project Manager */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountCircle color="primary" />
                      Chef de Projet
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                        {project.projectManager?.charAt(0) || 'N'}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {project.projectManager || 'Non assigné'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {project.projectManagerFunction || 'Chef de Projet'}
                        </Typography>
                      </Box>
                    </Box>

                    {project.filiales && project.filiales.length > 0 && (
                      <>
                        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 3 }}>
                          Filiales
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {project.filiales.map((filiale, index) => (
                            <Chip key={index} label={filiale} size="small" color="primary" variant="outlined" />
                          ))}
                        </Box>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Tasks Tab */}
          {activeTab === 1 && (
            <Box>
              {loadingTasks ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography>Chargement des tâches...</Typography>
                </Box>
              ) : tasks.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Aucune tâche pour ce projet
                  </Typography>
                </Box>
              ) : (
                <List>
                  {tasks.map((task, index) => (
                    <React.Fragment key={task.id}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          borderRadius: 2,
                          mb: 1,
                          '&:hover': {
                            bgcolor: 'action.hover',
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: getStatusColor(task.status).main }}>
                            {task.status === 'completed' ? <CheckCircle /> : <Schedule />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="body1" fontWeight={600}>
                                {task.title}
                              </Typography>
                              <Chip
                                label={getTaskStatusLabel(task.status)}
                                size="small"
                                color={getTaskStatusColor(task.status)}
                              />
                              {task.task_number && (
                                <Typography variant="caption" color="primary" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                  {task.task_number}
                                </Typography>
                              )}
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {task.description || 'Aucune description'}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {task.assignee_name && (
                                  <Chip
                                    icon={<AccountCircle />}
                                    label={task.assignee_name}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                                {task.due_date && (
                                  <Chip
                                    icon={<CalendarToday />}
                                    label={new Date(task.due_date).toLocaleDateString('fr-FR')}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            </>
                          }
                        />
                      </ListItem>
                      {index < tasks.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}

          {/* Team Tab */}
          {activeTab === 2 && (
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Group color="primary" />
                    Membres de l'équipe
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  {project.team && project.team.length > 0 ? (
                    <List>
                      {project.team.map((member, index) => (
                        <ListItem key={index}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {member.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={member}
                            secondary="Membre de l'équipe"
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Group sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        Aucun membre d'équipe assigné
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Notes Tab - Social Media Style */}
          {activeTab === 3 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Post New Note */}
              <Card sx={{ mb: 2, flexShrink: 0 }}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mt: 1 }}>
                      {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Écrivez une note sur ce projet..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                        <Button
                          variant="contained"
                          size="small"
                          endIcon={postingNote ? <CircularProgress size={16} color="inherit" /> : <Send fontSize="small" />}
                          onClick={handlePostNote}
                          disabled={!newNote.trim() || postingNote}
                          sx={{ borderRadius: 20, textTransform: 'none' }}
                        >
                          {postingNote ? 'Envoi...' : 'Publier'}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Notes Feed */}
              <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
                {loadingNotes ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Chargement des notes...
                    </Typography>
                  </Box>
                ) : notes.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <ChatBubbleOutline sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Aucune note pour le moment
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Soyez le premier à publier une note !
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ py: 0 }}>
                    {notes.map((note) => (
                      <Card key={note.id} sx={{ mb: 1.5, borderRadius: 2 }}>
                        <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                          <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                              {note.author_name?.charAt(0) || note.author_username?.charAt(0) || 'U'}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                                <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                                  {note.author_name || note.author_username}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                  {note.author_position && `${note.author_position} • `}
                                  {new Date(note.created_at).toLocaleString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </Typography>
                              </Box>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  mb: 1, 
                                  whiteSpace: 'pre-wrap',
                                  fontSize: '0.875rem',
                                  lineHeight: 1.5
                                }}
                              >
                                {note.content}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleLike(note.id)}
                                  sx={{
                                    p: 0.5,
                                    color: note.is_liked ? 'error.main' : 'text.secondary',
                                    '&:hover': {
                                      backgroundColor: note.is_liked ? alpha(theme.palette.error.main, 0.1) : 'action.hover',
                                    }
                                  }}
                                >
                                  {note.is_liked ? <Favorite sx={{ fontSize: 18 }} /> : <FavoriteBorder sx={{ fontSize: 18 }} />}
                                </IconButton>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                  {note.likes_count || 0}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                    <div ref={notesEndRef} />
                  </List>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetails;
