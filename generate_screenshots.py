#!/usr/bin/env python3
"""
Script pour générer des captures d'écran automatiques des composants existants
"""

import os
import sys
import time
import subprocess
from pathlib import Path

def create_screenshot_components():
    """Créer des composants React pour les captures d'écran"""
    
    # Composant Dashboard pour capture
    dashboard_component = '''
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
'''

    # Sauvegarder le composant
    with open('src/components/ScreenshotDashboard.jsx', 'w', encoding='utf-8') as f:
        f.write(dashboard_component)
    
    print("✅ Composant Dashboard créé pour capture")

def create_login_component():
    """Créer un composant de login pour capture"""
    
    login_component = '''
import React from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Container } from '@mui/material';
import { Lock, Person } from '@mui/icons-material';

const ScreenshotLogin = () => {
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <Container maxWidth="sm">
        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: '#333',
                mb: 1
              }}>
                Connexion
              </Typography>
              <Typography variant="body1" sx={{ color: '#666' }}>
                Accédez à votre espace de travail
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Nom d'utilisateur"
                variant="outlined"
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: '#666' }} />
                }}
                sx={{ mb: 2 }}
                defaultValue="mohamed.bara"
              />
              
              <TextField
                fullWidth
                label="Mot de passe"
                type="password"
                variant="outlined"
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: '#666' }} />
                }}
                defaultValue="••••••••"
              />
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #2196F3, #21CBF3)',
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: '0 8px 24px rgba(33, 150, 243, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1976D2, #1E88E5)',
                  boxShadow: '0 12px 32px rgba(33, 150, 243, 0.4)'
                }
              }}
            >
              Se connecter
            </Button>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Mot de passe oublié ? 
                <Button variant="text" sx={{ textTransform: 'none', ml: 1 }}>
                  Cliquez ici
                </Button>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ScreenshotLogin;
'''

    with open('src/components/ScreenshotLogin.jsx', 'w', encoding='utf-8') as f:
        f.write(login_component)
    
    print("✅ Composant Login créé pour capture")

def create_kanban_component():
    """Créer un composant Kanban pour capture"""
    
    kanban_component = '''
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
'''

    with open('src/components/ScreenshotKanban.jsx', 'w', encoding='utf-8') as f:
        f.write(kanban_component)
    
    print("✅ Composant Kanban créé pour capture")

def create_screenshot_page():
    """Créer une page pour afficher tous les composants de capture"""
    
    page_component = '''
import React, { useState } from 'react';
import { Box, Button, Typography, Container, Grid, Card, CardContent } from '@mui/material';
import ScreenshotLogin from './components/ScreenshotLogin';
import ScreenshotDashboard from './components/ScreenshotDashboard';
import ScreenshotKanban from './components/ScreenshotKanban';

const ScreenshotPage = () => {
  const [currentView, setCurrentView] = useState('login');

  const views = [
    { id: 'login', name: 'Page de Connexion', component: ScreenshotLogin },
    { id: 'dashboard', name: 'Dashboard', component: ScreenshotDashboard },
    { id: 'kanban', name: 'Vue Kanban', component: ScreenshotKanban }
  ];

  const CurrentComponent = views.find(v => v.id === currentView)?.component;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
          📸 Composants pour Captures d'Écran
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {views.map((view) => (
            <Grid item key={view.id}>
              <Button
                variant={currentView === view.id ? 'contained' : 'outlined'}
                onClick={() => setCurrentView(view.id)}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                {view.name}
              </Button>
            </Grid>
          ))}
        </Grid>

        <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <CardContent sx={{ p: 0 }}>
            {CurrentComponent && <CurrentComponent />}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ScreenshotPage;
'''

    with open('src/pages/ScreenshotPage.jsx', 'w', encoding='utf-8') as f:
        f.write(page_component)
    
    print("✅ Page de capture créée")

def main():
    """Fonction principale"""
    print("🚀 Génération des composants pour captures d'écran")
    print("=" * 50)
    
    # Créer le dossier components s'il n'existe pas
    os.makedirs('src/components', exist_ok=True)
    os.makedirs('src/pages', exist_ok=True)
    
    # Générer les composants
    create_screenshot_components()
    create_login_component()
    create_kanban_component()
    create_screenshot_page()
    
    print("\n✅ Tous les composants ont été créés !")
    print("\n📋 Prochaines étapes :")
    print("1. Ajouter la route dans votre application React")
    print("2. Accéder à la page de capture")
    print("3. Prendre les captures d'écran")
    print("4. Mettre à jour le guide HTML")
    
    print("\n🔗 Route à ajouter :")
    print("import ScreenshotPage from './pages/ScreenshotPage';")
    print("<Route path='/screenshots' element={<ScreenshotPage />} />")

if __name__ == "__main__":
    main()
