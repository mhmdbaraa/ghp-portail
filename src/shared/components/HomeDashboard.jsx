import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Grid, 
  Typography, 
  useTheme, 
  useMediaQuery, 
  IconButton, 
  Tooltip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button 
} from '@mui/material';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import { Brightness4, Brightness7, ExitToApp } from '@mui/icons-material';
import './HomeDashboard.css';
import {
  Category1Svg,
  Category2Svg,
  Category3Svg,
  Category4Svg,
  Category5Svg,
  Category6Svg,
  Category7Svg,
  Category8Svg,
  Category9Svg,
  Category10Svg,
  Category11Svg,
  Category12Svg,
  Category18Svg,
  Category19Svg,
  Category20Svg,
  Category21Svg,
  Category22Svg,
  Category23Svg,
  Category24Svg,
  Category29Svg,
  Category30Svg
} from '../../assets/images/imagepath';

const HomeDashboard = () => {
  const theme = useTheme();
  const { theme: themeMode, toggleTheme } = useCustomTheme();
  const navigate = useNavigate();
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);
  
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"), {
    defaultMatches: true,
  });
  const isMed = useMediaQuery(theme.breakpoints.down("md"), {
    defaultMatches: true,
  });

  const handleModuleClick = (moduleName, route) => {
    if (route && route !== '#') {
      navigate(route);
    } else {
      console.log(`${moduleName} module clicked - functionality not implemented yet`);
    }
  };

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setLogoutDialogOpen(false);
    navigate('/login');
  };

  const cancelLogout = () => {
    setLogoutDialogOpen(false);
  };

  return (
    <Box 
      sx={{ 
        p: isMobile ? 0.25 : isMed ? 0.5 : 1,
        minHeight: '100vh',
        width: '100%',
        background: themeMode === 'dark' ? '#0f172a' : '#f8fafc',
        position: 'relative'
      }}
      data-theme={themeMode}
      className={themeMode === 'dark' ? 'dark-theme' : 'light-theme'}
    >
      {/* Theme Toggle Button */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1000,
          display: 'flex',
          gap: 1
        }}
      >
        <Tooltip title={themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
          <IconButton
            onClick={toggleTheme}
            sx={{
              backgroundColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              color: themeMode === 'dark' ? '#fff' : '#000',
              '&:hover': {
                backgroundColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              }
            }}
          >
            {themeMode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Se déconnecter">
          <IconButton
            onClick={handleLogout}
            sx={{
              backgroundColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              color: themeMode === 'dark' ? '#fff' : '#000',
              '&:hover': {
                backgroundColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              }
            }}
          >
            <ExitToApp />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Page Title */}
      <Box
        sx={{
          textAlign: 'center',
          mb: 2,
          mt: 0.25
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            color: themeMode === 'dark' ? '#f8fafc' : '#1e293b',
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            mb: 0.5
          }}
        >
          GHP Portail
        </Typography>
      </Box>

      <Grid
        container
        spacing={{ xs: 0.5, sm: 0.75, md: 1 }}
        columns={{ xs: 12, sm: 12, md: 21 }}
        alignItems="center"
        justify="center"
        justifyContent="center"
        sx={{
          maxHeight: 'calc(100vh - 120px)',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
            borderRadius: '4px',
            '&:hover': {
              background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
            },
          },
        }}
      >
        <Grid item xs={4} sm={4} md={3}>
          <div className="categories-content">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleModuleClick('Logistique', '/dashboard/logistique');
              }}
              className="text-center aos aos-init aos-animate"
              data-aos="fade-up"
            >
              <img src={Category1Svg} alt="logistique" />
              <h6>Logistique</h6>
            </a>          
          </div>
        </Grid>

        <Grid item xs={4} sm={4} md={3}>
          <div className="categories-content">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleModuleClick('Back-office', '#');
              }}
              className="text-center aos aos-init aos-animate"
              data-aos="fade-up"
            >
              <img src={Category2Svg} alt="back-office"  />
              <h6>Back-office</h6>
            </a>
          </div>
        </Grid>

        <Grid item xs={4} sm={4} md={3}>
          <div className="categories-content">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleModuleClick('Services généraux', '#');
              }}
              className="text-center aos aos-init aos-animate"
              data-aos="fade-up"
            >
              <img src={Category3Svg} alt="services-generaux"  />
              <h6>Services généraux</h6>
            </a>
          </div>
        </Grid>

        <Grid item xs={4} sm={4} md={3}>
          <div className="categories-content">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleModuleClick('Finance', '#');
              }}
              className="text-center aos aos-init aos-animate"
              data-aos="fade-up"
            >
              <img src={Category4Svg} alt="finance"  />
              <h6>Finance</h6>
            </a>
          </div>
        </Grid>

        <Grid item xs={4} sm={4} md={3}>
          <div className="categories-content">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleModuleClick('Comptabilite', '#');
              }}
              className="text-center aos aos-init aos-animate"
              data-aos="fade-up"
            >
              <img src={Category5Svg} alt="comptabilite"  />
              <h6>Comptabilite</h6>
            </a>
          </div>
        </Grid>

        <Grid item xs={4} sm={4} md={3}>
          <div className="categories-content">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleModuleClick('Resources humaine', '#');
              }}
              className="text-center aos aos-init aos-animate"
              data-aos="fade-up"
            >
              <img src={Category6Svg} alt="rh"  />
              <h6>Resources humaine</h6>
            </a>
          </div>
        </Grid>

        <Grid item xs={4} sm={4} md={3}>
          <div className="categories-content">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleModuleClick('Recouvrement', '#');
              }}
              className="text-center aos aos-init aos-animate"
              data-aos="fade-up"
            >
              <img src={Category7Svg} alt="recouvrement"  />
              <h6>Recouvrement</h6>
            </a>
          </div>
        </Grid>

        <Grid item xs={4} sm={4} md={3}>
          <div className="categories-content">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleModuleClick('Achats', '#');
              }}
              className="text-center aos aos-init aos-animate"
              data-aos="fade-up"
            >
              <img src={Category8Svg} alt="achats"  />
              <h6>Achats</h6>
            </a>
          </div>
        </Grid>

        <Grid item xs={4} sm={4} md={3}>
          <div className="categories-content">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleModuleClick('Ventes', '#');
              }}
              className="text-center aos aos-init aos-animate"
              data-aos="fade-up"
            >
              <img src={Category9Svg} alt="ventes"  />
              <h6>Ventes</h6>
            </a>
          </div>
        </Grid>

        <Grid item xs={4} sm={4} md={3}>
          <div className="categories-content">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleModuleClick('360 view', '#');
              }}
              className="text-center aos aos-init aos-animate"
              data-aos="fade-up"
            >
              <img src={Category10Svg} alt="360-view"  />
              <h6>360 view</h6>
            </a>
          </div>
        </Grid>

        <Grid item xs={4} sm={4} md={3}>
          <div className="categories-content">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleModuleClick('Parc roulant', '#');
              }}
              className="text-center aos aos-init aos-animate"
              data-aos="fade-up"
            >
              <img src={Category11Svg} alt="parc-roulant"  />
              <h6>Parc roulant</h6>
            </a>
          </div>
        </Grid>

        <Grid item xs={4} sm={4} md={3}>
          <div className="categories-content">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleModuleClick('Archives électronique', '#');
              }}
              className="text-center aos aos-init aos-animate"
              data-aos="fade-up"
            >
              <img src={Category12Svg} alt="archives"  />
              <h6>Archives électronique</h6>
            </a>
          </div>
        </Grid>

        <Grid item xs={4} sm={4} md={3}>
          <div className="categories-content">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleModuleClick('CRM', '#');
              }}
              className="text-center aos aos-init aos-animate"
              data-aos="fade-up"
            >
              <img src={Category18Svg} alt="crm"  />
              <h6>CRM</h6>
            </a>
          </div>
        </Grid>

        <Grid item xs={4} sm={4} md={3}>
          <div className="categories-content">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleModuleClick('KPI commercial', '#');
              }}
              className="text-center aos aos-init aos-animate"
              data-aos="fade-up"
            >
              <img src={Category19Svg} alt="kpi"  />
              <h6>KPI commercial</h6>
            </a>
          </div>
        </Grid>

        <Grid item xs={4} sm={4} md={3}>
          <div className="categories-content">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleModuleClick('Clients partenaires', '#');
              }}
              className="text-center aos aos-init aos-animate"
              data-aos="fade-up"
            >
              <img src={Category20Svg} alt="clients-partenaires"  />
              <h6>Clients partenaires</h6>
            </a>
          </div>
        </Grid>

        <Grid item xs={4} sm={4} md={3}>
          <div className="categories-content">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleModuleClick('Risques clients', '#');
              }}
              className="text-center aos aos-init aos-animate"
              data-aos="fade-up"
            >
              <img src={Category21Svg} alt="risques-clients"  />
              <h6>Risques clients</h6>
            </a>
          </div>
        </Grid>

        <Grid item xs={4} sm={4} md={3}>
          <div className="categories-content">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleModuleClick('TMS', '#');
              }}
              className="text-center aos aos-init aos-animate"
              data-aos="fade-up"
            >
              <img src={Category22Svg} alt="tms"  />
              <h6>TMS</h6>
            </a>
          </div>
        </Grid>

        <Grid item xs={4} sm={4} md={3}>
          <div className="categories-content">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleModuleClick('Juridique', '/projects');
              }}
              className="text-center aos aos-init aos-animate"
              data-aos="fade-up"
            >
              <img src={Category23Svg} alt="juridique"  />
              <h6>Juridique</h6>
            </a>
          </div>
        </Grid>

        <Grid item xs={4} sm={4} md={3}>
          <div className="categories-content">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleModuleClick('Projets', '/projects');
              }}
              className="text-center aos aos-init aos-animate"
              data-aos="fade-up"
            >
              <img src={Category29Svg} alt="projets"  />
              <h6>Projets</h6>
            </a>
          </div>
        </Grid>

        <Grid item xs={4} sm={4} md={3}>
          <div className="categories-content">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleModuleClick('Réclamations Fournisseurs', '#');
              }}
              className="text-center aos aos-init aos-animate"
              data-aos="fade-up"
            >
              <img src={Category30Svg} alt="reclamations"  />
              <h6>Réclamations Fournisseurs</h6>
            </a>
          </div>
        </Grid>

        <Grid item xs={4} sm={4} md={3}>
          <div className="categories-content">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleModuleClick('Utilisateurs', '/users/list');
              }}
              className="text-center aos aos-init aos-animate"
              data-aos="fade-up"
            >
              <img src={Category24Svg} alt="utilisateurs"  />
              <h6>Utilisateurs</h6>
            </a>
          </div>
        </Grid>

      </Grid>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={cancelLogout}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">
          Confirmation de déconnexion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à nouveau à l'application.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelLogout} color="primary">
            Annuler
          </Button>
          <Button onClick={confirmLogout} color="error" variant="contained">
            Se déconnecter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HomeDashboard;
