
import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip, Avatar, LinearProgress } from '@mui/material';
import { Work, Assignment, Warning, Timer, TrendingUp } from '@mui/icons-material';

const ScreenshotDashboard = () => {
  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196F3', mb: 1 }}>
          Bonjour, Mohamed Bara 👋
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          Vue d'ensemble de vos projets et tâches
        </Typography>
      </Box>

      {/* Métriques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #2196F3, #21CBF3)',
            color: 'white',
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(33, 150, 243, 0.3)'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Work sx={{ mr: 1.5, fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Projets Actifs
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                2
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                4 projets au total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #00BCD4, #4DD0E1)',
            color: 'white',
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0, 188, 212, 0.3)'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assignment sx={{ mr: 1.5, fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Tâches En Cours
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                1
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                4 tâches au total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #FF9800, #FFB74D)',
            color: 'white',
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(255, 152, 0, 0.3)'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Warning sx={{ mr: 1.5, fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Tâches En Retard
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                0
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Parfait
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4CAF50, #81C784)',
            color: 'white',
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(76, 175, 80, 0.3)'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Timer sx={{ mr: 1.5, fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Efficacité Temps
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                95%
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Excellent
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Projets Récents */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#333' }}>
                Projets Récents
              </Typography>
              
              {/* Projet 1 */}
              <Box sx={{ 
                p: 2, 
                mb: 2, 
                border: '1px solid #e0e0e0', 
                borderRadius: 2,
                bgcolor: '#f8f9fa'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                      Système de Gestion RH
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                      Développement d'un système complet de gestion des ressources humaines
                    </Typography>
                  </Box>
                  <Chip 
                    label="En cours" 
                    color="primary" 
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: '#2196F3' }}>
                      MB
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Mohamed Bara
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                    1,500,000 DZD
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Progression
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      75%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={75} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#4CAF50'
                      }
                    }}
                  />
                </Box>
              </Box>

              {/* Projet 2 */}
              <Box sx={{ 
                p: 2, 
                mb: 2, 
                border: '1px solid #e0e0e0', 
                borderRadius: 2,
                bgcolor: '#f8f9fa'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                      Application Mobile
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                      Développement d'une application mobile pour la gestion des projets
                    </Typography>
                  </Box>
                  <Chip 
                    label="En attente" 
                    color="warning" 
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: '#FF9800' }}>
                      AB
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Ahmed Benali
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                    800,000 DZD
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Progression
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      25%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={25} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#FF9800'
                      }
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#333' }}>
                Tâches Urgentes
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: '#4CAF50', 
                    mr: 1.5 
                  }} />
                  <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                    Finaliser l'interface utilisateur
                  </Typography>
                  <Chip label="Haute" size="small" color="error" />
                </Box>
                <Typography variant="caption" sx={{ color: '#666', ml: 3 }}>
                  Projet: Système RH • Échéance: 15 Oct
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: '#2196F3', 
                    mr: 1.5 
                  }} />
                  <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                    Tests d'intégration
                  </Typography>
                  <Chip label="Moyen" size="small" color="primary" />
                </Box>
                <Typography variant="caption" sx={{ color: '#666', ml: 3 }}>
                  Projet: App Mobile • Échéance: 20 Oct
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: '#FF9800', 
                    mr: 1.5 
                  }} />
                  <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                    Documentation API
                  </Typography>
                  <Chip label="Faible" size="small" color="warning" />
                </Box>
                <Typography variant="caption" sx={{ color: '#666', ml: 3 }}>
                  Projet: Système RH • Échéance: 25 Oct
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ScreenshotDashboard;
