import React, { useState } from 'react';
import { IconButton, Tooltip, Box, Fade, Grow, useTheme as useMuiTheme } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme: themeMode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    setTimeout(() => {
      toggleTheme();
      setIsAnimating(false);
    }, 300);
  };

  const getThemeIcon = () => {
    return themeMode === 'light' ? <DarkMode /> : <LightMode />;
  };

  return (
    <Tooltip 
      title={`Basculer vers le thème ${themeMode === 'light' ? 'sombre' : 'clair'}`}
      placement="bottom"
      arrow
      TransitionComponent={Grow}
    >
      <IconButton
        onClick={handleToggle}
        size="medium"
        sx={{
          width: 40,
          height: 40,
          background: themeMode === 'light'
            ? 'rgba(99, 102, 241, 0.1)'
            : 'rgba(255, 255, 255, 0.1)',
          border: `1px solid ${themeMode === 'light'
            ? 'rgba(99, 102, 241, 0.2)'
            : 'rgba(255, 255, 255, 0.2)'}`,
          color: themeMode === 'light'
            ? muiTheme.palette.primary.main
            : muiTheme.palette.text.primary,
          transition: 'all 0.3s ease',
          '&:hover': {
            background: themeMode === 'light'
              ? 'rgba(99, 102, 241, 0.2)'
              : 'rgba(255, 255, 255, 0.2)',
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 25px ${themeMode === 'light'
              ? 'rgba(99, 102, 241, 0.3)'
              : 'rgba(255, 255, 255, 0.3)'}`,
          },
        }}
      >
        <Fade in={!isAnimating} timeout={200}>
          {getThemeIcon()}
        </Fade>
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
