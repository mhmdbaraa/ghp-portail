import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  LinearProgress,
  Typography,
  Slider,
  IconButton,
  Tooltip,
  useTheme,
  Fade,
  ClickAwayListener,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const EditableProgressBar = ({ 
  value, 
  onUpdate, 
  projectId, 
  disabled = false,
  size = 'medium',
  showPercentage = true,
  sx = {}
}) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isUpdating, setIsUpdating] = useState(false);
  const inputRef = useRef(null);

  // Update editValue when value prop changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(value);
  };

  const handleSave = async () => {
    if (editValue < 0 || editValue > 100) {
      setEditValue(value); // Reset to original value
      setIsEditing(false);
      return;
    }

    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(projectId, editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating progress:', error);
      setEditValue(value); // Reset on error
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSave();
    } else if (event.key === 'Escape') {
      handleCancel();
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return theme.palette.success.main;
    if (progress >= 75) return theme.palette.primary.main;
    if (progress >= 50) return theme.palette.warning.main;
    if (progress >= 25) return theme.palette.info.main;
    return theme.palette.grey[500];
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          height: 4,
          borderRadius: 2,
          fontSize: '0.65rem',
          minWidth: 20,
        };
      case 'large':
        return {
          height: 8,
          borderRadius: 4,
          fontSize: '0.8rem',
          minWidth: 28,
        };
      default: // medium
        return {
          height: 6,
          borderRadius: 3,
          fontSize: '0.7rem',
          minWidth: 24,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  if (isEditing) {
    return (
      <ClickAwayListener onClickAway={handleCancel}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', p: 1, ...sx }}>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ minWidth: 20, fontSize: sizeStyles.fontSize, fontWeight: 600 }}>
              0%
            </Typography>
            <Slider
              value={editValue}
              onChange={(event, newValue) => setEditValue(newValue)}
              min={0}
              max={100}
              step={1}
              disabled={isUpdating}
              sx={{
                flex: 1,
                '& .MuiSlider-thumb': {
                  width: 16,
                  height: 16,
                },
                '& .MuiSlider-track': {
                  height: 4,
                },
                '& .MuiSlider-rail': {
                  height: 4,
                },
              }}
            />
            <Typography variant="caption" sx={{ minWidth: 20, fontSize: sizeStyles.fontSize, fontWeight: 600 }}>
              100%
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ 
              minWidth: 30, 
              fontSize: sizeStyles.fontSize, 
              fontWeight: 700,
              color: theme.palette.primary.main,
              textAlign: 'center'
            }}>
              {editValue}%
            </Typography>
            <Tooltip title="Sauvegarder">
              <IconButton
                size="small"
                onClick={handleSave}
                disabled={isUpdating}
                sx={{ 
                  color: theme.palette.success.main,
                  p: 0.5,
                  '&:hover': {
                    backgroundColor: theme.palette.success.light + '20',
                  }
                }}
              >
                <CheckIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Annuler">
              <IconButton
                size="small"
                onClick={handleCancel}
                disabled={isUpdating}
                sx={{ 
                  color: theme.palette.error.main,
                  p: 0.5,
                  '&:hover': {
                    backgroundColor: theme.palette.error.light + '20',
                  }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </ClickAwayListener>
    );
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1, 
        width: '100%',
        cursor: disabled ? 'default' : 'pointer',
        '&:hover': disabled ? {} : {
          '& .progress-bar': {
            opacity: 0.8,
            transform: 'scale(1.02)',
          }
        },
        ...sx 
      }}
      onClick={handleEdit}
    >
      <Box sx={{ flex: 1, position: 'relative' }}>
        <LinearProgress
          className="progress-bar"
          variant="determinate"
          value={value}
          sx={{
            height: sizeStyles.height,
            borderRadius: sizeStyles.borderRadius,
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease-in-out',
            '& .MuiLinearProgress-bar': {
              borderRadius: sizeStyles.borderRadius,
              background: `linear-gradient(90deg, ${getProgressColor(value)}, ${getProgressColor(value)}dd)`,
            },
          }}
        />
      </Box>
      {showPercentage && (
        <Typography 
          variant="caption" 
          sx={{ 
            minWidth: sizeStyles.minWidth, 
            fontSize: sizeStyles.fontSize,
            fontWeight: 600,
            color: theme.palette.text.primary,
            textAlign: 'center',
          }}
        >
          {value}%
        </Typography>
      )}
    </Box>
  );
};

export default EditableProgressBar;
