import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  IconButton,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  CloudUpload,
  AttachFile,
  Delete,
  Download,
  Visibility,
  Description
} from '@mui/icons-material';

const FileUpload = ({ 
  projectId, 
  onUploadSuccess, 
  onUploadError,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['*/*']
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  const handleFileSelect = useCallback((event) => {
    const selectedFiles = Array.from(event.target.files);
    
    // Validate file count
    if (files.length + selectedFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file size and type
    const validFiles = [];
    const errors = [];

    selectedFiles.forEach(file => {
      if (file.size > maxFileSize) {
        errors.push(`${file.name}: File too large (max ${maxFileSize / (1024 * 1024)}MB)`);
        return;
      }

      if (acceptedTypes.length > 0 && acceptedTypes[0] !== '*/*') {
        const fileType = file.type;
        const isAccepted = acceptedTypes.some(type => {
          if (type.endsWith('/*')) {
            return fileType.startsWith(type.slice(0, -1));
          }
          return fileType === type;
        });

        if (!isAccepted) {
          errors.push(`${file.name}: File type not allowed`);
          return;
        }
      }

      validFiles.push({
        file,
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        description: '',
        status: 'pending'
      });
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      setError(null);
    }
  }, [files.length, maxFiles, maxFileSize, acceptedTypes]);

  const handleUpload = async (fileData) => {
    if (!projectId) {
      setError('Project ID is required');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', fileData.file);
      formData.append('description', fileData.description || '');
      formData.append('project', projectId);

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/projects/${projectId}/attachments/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Update file status
      setFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { ...f, status: 'uploaded', serverId: result.id }
          : f
      ));

      if (onUploadSuccess) {
        onUploadSuccess(result);
      }

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message);
      
      // Update file status
      setFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { ...f, status: 'error' }
          : f
      ));

      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleUploadAll = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    for (const fileData of pendingFiles) {
      await handleUpload(fileData);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'uploaded': return 'success';
      case 'error': return 'error';
      case 'uploading': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <input
          accept={acceptedTypes.join(',')}
          style={{ display: 'none' }}
          id="file-upload"
          multiple
          type="file"
          onChange={handleFileSelect}
        />
        <label htmlFor="file-upload">
          <Button
            variant="outlined"
            component="span"
            startIcon={<CloudUpload />}
            disabled={uploading || files.length >= maxFiles}
          >
            Ajouter des fichiers
          </Button>
        </label>
        
        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
          Maximum {maxFiles} fichiers, {maxFileSize / (1024 * 1024)}MB par fichier
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {uploading && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Upload en cours...
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {files.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Fichiers sélectionnés ({files.length})
          </Typography>
          
          {files.map((fileData) => (
            <Box
              key={fileData.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1
              }}
            >
              <Typography sx={{ mr: 1, fontSize: '1.2rem' }}>
                {getFileIcon(fileData.type)}
              </Typography>
              
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap>
                  {fileData.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(fileData.size)}
                </Typography>
              </Box>

              <Chip
                label={fileData.status}
                color={getStatusColor(fileData.status)}
                size="small"
                sx={{ mr: 1 }}
              />

              <IconButton
                size="small"
                onClick={() => {
                  setSelectedFile(fileData);
                  setDescription(fileData.description);
                  setOpenDialog(true);
                }}
                disabled={fileData.status === 'uploading'}
              >
                <Description />
              </IconButton>

              <IconButton
                size="small"
                onClick={() => handleRemoveFile(fileData.id)}
                disabled={fileData.status === 'uploading'}
              >
                <Delete />
              </IconButton>
            </Box>
          ))}

          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleUploadAll}
              disabled={uploading || files.filter(f => f.status === 'pending').length === 0}
              startIcon={<CloudUpload />}
            >
              Uploader tous les fichiers
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => setFiles([])}
              disabled={uploading}
            >
              Effacer la sélection
            </Button>
          </Box>
        </Box>
      )}

      {/* Description Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Description du fichier</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button 
            onClick={() => {
              setFiles(prev => prev.map(f => 
                f.id === selectedFile.id 
                  ? { ...f, description }
                  : f
              ));
              setOpenDialog(false);
            }}
            variant="contained"
          >
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileUpload;
