
import React from 'react';
import { Box, Typography, Card, CardContent, Chip, Avatar, LinearProgress, Grid } from '@mui/material';
import { DragIndicator } from '@mui/icons-material';

const ScreenshotKanban = () => {
  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#333' }}>
        Gestion des Projets - Vue Kanban
      </Typography>

      <Grid container spacing={3}>
        {/* Colonne En Attente */}
        <Grid item xs={12} md={3}>
          <Box sx={{ 
            bgcolor: '#fff3cd', 
            borderRadius: 2, 
            p: 2, 
            minHeight: 500,
            border: '2px solid #ffc107'
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: '#856404', 
              mb: 2,
              textAlign: 'center'
            }}>
              En Attente (2)
            </Typography>
            
            <Card sx={{ mb: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DragIndicator sx={{ mr: 1, color: '#666' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Application Mobile
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                  Développement d'une application mobile pour la gestion des projets
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: '#FF9800' }}>AB</Avatar>
                  <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                    800,000 DZD
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={25} sx={{ height: 6, borderRadius: 3 }} />
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* Colonne En Cours */}
        <Grid item xs={12} md={3}>
          <Box sx={{ 
            bgcolor: '#d1ecf1', 
            borderRadius: 2, 
            p: 2, 
            minHeight: 500,
            border: '2px solid #17a2b8'
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: '#0c5460', 
              mb: 2,
              textAlign: 'center'
            }}>
              En Cours (2)
            </Typography>
            
            <Card sx={{ mb: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DragIndicator sx={{ mr: 1, color: '#666' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Système de Gestion RH
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                  Développement d'un système complet de gestion des ressources humaines
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: '#2196F3' }}>MB</Avatar>
                  <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                    1,500,000 DZD
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={75} sx={{ height: 6, borderRadius: 3 }} />
              </CardContent>
            </Card>

            <Card sx={{ mb: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DragIndicator sx={{ mr: 1, color: '#666' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Site Web E-commerce
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                  Création d'une plateforme de vente en ligne
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: '#4CAF50' }}>SK</Avatar>
                  <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                    2,200,000 DZD
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={60} sx={{ height: 6, borderRadius: 3 }} />
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* Colonne En Retard */}
        <Grid item xs={12} md={3}>
          <Box sx={{ 
            bgcolor: '#f8d7da', 
            borderRadius: 2, 
            p: 2, 
            minHeight: 500,
            border: '2px solid #dc3545'
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: '#721c24', 
              mb: 2,
              textAlign: 'center'
            }}>
              En Retard (1)
            </Typography>
            
            <Card sx={{ mb: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DragIndicator sx={{ mr: 1, color: '#666' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Migration Base de Données
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                  Migration vers une nouvelle architecture de base de données
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: '#f44336' }}>NM</Avatar>
                  <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                    1,200,000 DZD
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={40} sx={{ height: 6, borderRadius: 3 }} />
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* Colonne Terminé */}
        <Grid item xs={12} md={3}>
          <Box sx={{ 
            bgcolor: '#d4edda', 
            borderRadius: 2, 
            p: 2, 
            minHeight: 500,
            border: '2px solid #28a745'
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: '#155724', 
              mb: 2,
              textAlign: 'center'
            }}>
              Terminé (1)
            </Typography>
            
            <Card sx={{ mb: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DragIndicator sx={{ mr: 1, color: '#666' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Système de Facturation
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                  Développement d'un système de gestion des factures
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: '#4CAF50' }}>FK</Avatar>
                  <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                    950,000 DZD
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={100} sx={{ height: 6, borderRadius: 3 }} />
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ScreenshotKanban;
