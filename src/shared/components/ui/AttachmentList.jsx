import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Grid,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  AttachFile,
  Download,
  Delete,
  Visibility,
  Description,
  MoreVert,
  CloudUpload,
  FileCopy
} from '@mui/icons-material';

const AttachmentList = ({ 
  projectId, 
  attachments = [], 
  onDelete, 
  onRefresh,
  canUpload = true,
  canDelete = true 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);

  const handleDownload = async (attachment) => {
    if (!attachment || !attachment.id) {
      setError('Erreur: Fichier non trouvé');
      return;
    }
    
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`/api/projects/${projectId}/attachments/${attachment.id}/download/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Download failed: ${response.statusText}`);
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Download error:', error);
      setError(`Erreur lors du téléchargement: ${error.message}`);
      throw error; // Re-throw to let caller handle it
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (attachment) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${attachment.file_name}" ?`)) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`/api/projects/${projectId}/attachments/${attachment.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      if (onDelete) {
        onDelete(attachment.id);
      }

    } catch (error) {
      console.error('Delete error:', error);
      setError('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (attachment) => {
    setSelectedAttachment(attachment);
    setOpenPreview(true);
  };

  const canPreview = (fileType) => {
    // Check if file type can be previewed
    const previewableTypes = [
      'image/',
      'application/pdf',
      'text/',
      'application/json',
      'application/xml'
    ];
    return previewableTypes.some(type => fileType.startsWith(type));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📈';
    return '📎';
  };

  const getFileColor = (fileType) => {
    if (fileType.startsWith('image/')) return '#4caf50';
    if (fileType.startsWith('video/')) return '#ff9800';
    if (fileType.startsWith('audio/')) return '#9c27b0';
    if (fileType.includes('pdf')) return '#f44336';
    if (fileType.includes('word')) return '#2196f3';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '#4caf50';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '#ff5722';
    return '#757575';
  };

  const handleMenuClick = (event, attachment) => {
    setAnchorEl(event.currentTarget);
    setSelectedAttachment(attachment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Don't reset selectedAttachment here to avoid null reference errors
  };

  const resetSelectedAttachment = () => {
    setSelectedAttachment(null);
  };

  if (attachments.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <AttachFile sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Aucune pièce jointe
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ajoutez des fichiers pour partager des documents avec l'équipe
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {attachments.map((attachment) => (
          <Grid item xs={12} sm={6} md={4} key={attachment.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 3
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: getFileColor(attachment.file_type),
                      mr: 2,
                      width: 40,
                      height: 40
                    }}
                  >
                    <Typography sx={{ fontSize: '1.2rem' }}>
                      {getFileIcon(attachment.file_type)}
                    </Typography>
                  </Avatar>
                  
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography 
                      variant="subtitle2" 
                      noWrap
                      title={attachment.file_name}
                    >
                      {attachment.file_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(attachment.file_size)}
                    </Typography>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, attachment)}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>

                {attachment.description && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {attachment.description}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    {attachment.uploaded_by_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(attachment.uploaded_at)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={async () => {
          if (selectedAttachment) {
            try {
              await handleDownload(selectedAttachment);
              resetSelectedAttachment();
            } catch (error) {
              console.error('Download error:', error);
            }
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          <ListItemText>Télécharger</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => {
          if (selectedAttachment) {
            handlePreview(selectedAttachment);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>Aperçu</ListItemText>
        </MenuItem>

        {canDelete && (
          <MenuItem 
            onClick={async () => {
              if (selectedAttachment) {
                try {
                  await handleDelete(selectedAttachment);
                  resetSelectedAttachment();
                } catch (error) {
                  console.error('Delete error:', error);
                }
              }
              handleMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Supprimer</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Preview Dialog */}
      <Dialog 
        open={openPreview} 
        onClose={() => setOpenPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedAttachment?.file_name}
        </DialogTitle>
        <DialogContent>
          {selectedAttachment && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Taille: {formatFileSize(selectedAttachment.file_size)} | 
                Type: {selectedAttachment.file_type} | 
                Ajouté par: {selectedAttachment.uploaded_by_name}
              </Typography>
              
              {selectedAttachment.description && (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {selectedAttachment.description}
                </Typography>
              )}

              {canPreview(selectedAttachment.file_type) ? (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  {selectedAttachment.file_type.startsWith('image/') ? (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Aperçu de l'image
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        L'aperçu des images sera disponible prochainement
                      </Typography>
                    </Box>
                  ) : selectedAttachment.file_type === 'application/pdf' ? (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Aperçu PDF
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        L'aperçu des PDFs sera disponible prochainement
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Aperçu du fichier
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        L'aperçu de ce type de fichier sera disponible prochainement
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    Aperçu non disponible
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ce type de fichier ne peut pas être prévisualisé
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreview(false)}>
            Fermer
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Download />}
            onClick={async () => {
              if (!selectedAttachment) {
                setError('Erreur: Fichier non sélectionné');
                return;
              }
              try {
                await handleDownload(selectedAttachment);
                setOpenPreview(false);
              } catch (error) {
                console.error('Download error in preview:', error);
                // Don't close the dialog on error, let user see the error message
              }
            }}
          >
            Télécharger
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttachmentList;
