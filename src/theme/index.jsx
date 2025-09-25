import { createTheme } from '@mui/material/styles';

// Helper to scale typography sizes down
const scale = (px) => `calc(${px} * 0.85)`;

// Créer un thème personnalisé
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6366f1', light: '#818cf8', dark: '#4f46e5', contrastText: '#ffffff' },
    secondary: { main: '#ec4899', light: '#f472b6', dark: '#db2777', contrastText: '#ffffff' },
    success: { main: '#10b981', light: '#34d399', dark: '#059669', contrastText: '#ffffff' },
    warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706', contrastText: '#ffffff' },
    error: { main: '#ef4444', light: '#f87171', dark: '#dc2626', contrastText: '#ffffff' },
    info: { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb', contrastText: '#ffffff' },
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#1e293b', secondary: '#64748b' },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, fontSize: scale('2.25rem') },
    h2: { fontWeight: 700, fontSize: scale('1.875rem') },
    h3: { fontWeight: 600, fontSize: scale('1.5rem') },
    h4: { fontWeight: 600, fontSize: scale('1.25rem') },
    h5: { fontWeight: 600, fontSize: scale('1.125rem') },
    h6: { fontWeight: 600, fontSize: scale('1rem') },
    body1: { fontSize: scale('1rem'), lineHeight: 1.5 },
    body2: { fontSize: scale('0.875rem'), lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  spacing: 7, // reduce default spacing from 8px to ~7px (~-12%)
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, padding: '8px 16px', fontWeight: 600 },
      },
    },
    MuiCard: {
      styleOverrides: { root: { boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)', borderRadius: 12 } },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#818cf8', light: '#a5b4fc', dark: '#6366f1', contrastText: '#000000' },
    secondary: { main: '#f472b6', light: '#f9a8d4', dark: '#ec4899', contrastText: '#000000' },
    success: { main: '#34d399', light: '#6ee7b7', dark: '#10b981', contrastText: '#000000' },
    warning: { main: '#fbbf24', light: '#fcd34d', dark: '#f59e0b', contrastText: '#000000' },
    error: { main: '#f87171', light: '#fca5a5', dark: '#ef4444', contrastText: '#000000' },
    info: { main: '#60a5fa', light: '#93c5fd', dark: '#3b82f6', contrastText: '#000000' },
    background: { default: '#0f172a', paper: '#1e293b' },
    text: { primary: '#f8fafc', secondary: '#cbd5e1' },
    divider: '#334155',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, fontSize: scale('2.25rem') },
    h2: { fontWeight: 700, fontSize: scale('1.875rem') },
    h3: { fontWeight: 600, fontSize: scale('1.5rem') },
    h4: { fontWeight: 600, fontSize: scale('1.25rem') },
    h5: { fontWeight: 600, fontSize: scale('1.125rem') },
    h6: { fontWeight: 600, fontSize: scale('1rem') },
    body1: { fontSize: scale('1rem'), lineHeight: 1.5 },
    body2: { fontSize: scale('0.875rem'), lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  spacing: 7,
  components: {
    MuiButton: {
      styleOverrides: { root: { borderRadius: 8, padding: '8px 16px', fontWeight: 600 } },
    },
    MuiCard: { styleOverrides: { root: { boxShadow: '0 1px 3px 0 rgba(0,0,0,0.3), 0 1px 2px 0 rgba(0,0,0,0.2)', borderRadius: 12 } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
  },
});
