import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Typography, useTheme, useMediaQuery, IconButton, Tooltip } from '@mui/material';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import { Brightness4, Brightness7 } from '@mui/icons-material';
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
  Category25Svg,
  Category29Svg,
  Category30Svg
} from '../../assets/images/imagepath';

const HomeDashboard = () => {
  const theme = useTheme();
  const { theme: themeMode, toggleTheme } = useCustomTheme();
  const navigate = useNavigate();
  
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
    // Handle logout logic
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Box 
      sx={{ 
        p: isMobile ? 1 : isMed ? 2 : 4,
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
          zIndex: 1000
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
      </Box>

      {/* Page Title */}
      <Box
        sx={{
          textAlign: 'center',
          mb: 4,
          mt: 2
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            color: themeMode === 'dark' ? '#f8fafc' : '#1e293b',
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            mb: 1
          }}
        >
          GHP Portail
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
          }}
        >
          Choisissez votre module
        </Typography>
      </Box>

      <Grid
        container
        spacing={{ xs: 1, md: 1 }}
        columns={{ xs: 12, sm: 12, md: 18 }}
        alignItems="center"
        justify="center"
        justifyContent="center"
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
              <img src={Category1Svg} alt="logistique" width="120" height="120" />
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
              <img src={Category2Svg} alt="back-office" width="120" height="120" />
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
              <img src={Category3Svg} alt="services-generaux" width="120" height="120" />
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
              <img src={Category4Svg} alt="finance" width="120" height="120" />
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
              <img src={Category5Svg} alt="comptabilite" width="120" height="120" />
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
              <img src={Category6Svg} alt="rh" width="120" height="120" />
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
              <img src={Category7Svg} alt="recouvrement" width="120" height="120" />
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
              <img src={Category8Svg} alt="achats" width="120" height="120" />
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
              <img src={Category9Svg} alt="ventes" width="120" height="120" />
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
              <img src={Category10Svg} alt="360-view" width="120" height="120" />
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
              <img src={Category11Svg} alt="parc-roulant" width="120" height="120" />
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
              <img src={Category12Svg} alt="archives" width="120" height="120" />
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
              <img src={Category18Svg} alt="crm" width="120" height="120" />
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
              <img src={Category19Svg} alt="kpi" width="200" height="120" />
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
              <img src={Category20Svg} alt="clients-partenaires" width="120" height="120" />
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
              <img src={Category21Svg} alt="risques-clients" width="120" height="120" />
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
              <img src={Category22Svg} alt="tms" width="200" height="120" />
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
              <img src={Category23Svg} alt="juridique" width="120" height="120" />
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
              <img src={Category29Svg} alt="projets" width="120" height="120" />
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
              <img src={Category30Svg} alt="reclamations" width="120" height="120" />
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
              <img src={Category24Svg} alt="utilisateurs" width="120" height="120" />
              <h6>Utilisateurs</h6>
            </a>
          </div>
        </Grid>

        <Grid item xs={4} sm={4} md={3}>
          <div className="categories-content">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              className="text-center aos aos-init aos-animate"
              data-aos="fade-up"
            >
              <img src={Category25Svg} alt="logout" width="120" height="120" />
              <h6>Sortir</h6>
            </a>
          </div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomeDashboard;
