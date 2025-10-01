import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  useTheme,
} from '@mui/material';
import {
  Visibility,
  Edit,
  Delete,
  MoreVert,
} from '@mui/icons-material';

const ActionMenuCell = ({ 
  row, 
  onView, 
  onEdit, 
  onDelete, 
  canEdit, 
  canDelete 
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  
  const handleView = () => { 
    onView(row);
    handleClose(); 
  };
  
  const handleEdit = () => { 
    onEdit(row);
    handleClose();
  };
  
  const handleDelete = () => { 
    onDelete(row);
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

export default ActionMenuCell;
