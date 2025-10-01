
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
