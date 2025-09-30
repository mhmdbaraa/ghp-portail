import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  AdminPanelSettings,
  ManageAccounts,
  Code,
  Palette,
  BugReport,
  Person,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { getRoleInfo, AVAILABLE_PERMISSIONS } from '../utils/rolePermissions';

const RoleInfo = ({ showDetails = false }) => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const roleInfo = getRoleInfo(user.role);
  const isSuperuser = user.role === 'admin' || user.is_superuser;
  
  const getRoleIcon = (role) => {
    const icons = {
      admin: <AdminPanelSettings />,
      manager: <ManageAccounts />,
      PROJECT_MANAGER: <ManageAccounts />,
      developer: <Code />,
      designer: <Palette />,
      tester: <BugReport />,
      user: <Person />,
      PROJECT_USER: <Person />
    };
    return icons[role] || <Person />;
  };
  
  return (
    <Card sx={{ maxWidth: 600, mx: 'auto' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: roleInfo.color, 
              mr: 2,
              width: 48,
              height: 48
            }}
          >
            {getRoleIcon(user.role)}
          </Avatar>
          <Box>
            <Typography variant="h6" component="div">
              {roleInfo.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {roleInfo.description}
            </Typography>
            {isSuperuser && (
              <Chip 
                label="SUPERUSER" 
                color="error" 
                size="small" 
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        </Box>
        
        {showDetails && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Permissions
            </Typography>
            {isSuperuser ? (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" color="success.main">
                  Accès total - Toutes les permissions
                </Typography>
              </Box>
            ) : (
              <List dense>
                {roleInfo.permissions.map((permission) => (
                  <ListItem key={permission} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={AVAILABLE_PERMISSIONS[permission] || permission}
                      secondary={permission}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RoleInfo;

