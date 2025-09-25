import React, { useState, useEffect } from 'react';
import { useAuth } from '../shared/contexts/AuthContext';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Chip,
  Divider,
  Alert
} from '@mui/material';
import { 
  CheckCircle, 
  Error, 
  Refresh,
  Login,
  Logout
} from '@mui/icons-material';

const AuthDebug = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [localStorageData, setLocalStorageData] = useState({});
  const [apiTest, setApiTest] = useState(null);

  useEffect(() => {
    // Récupérer les données du localStorage
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userData = localStorage.getItem('userData');

    setLocalStorageData({
      accessToken: accessToken ? '✅ Présent' : '❌ Absent',
      refreshToken: refreshToken ? '✅ Présent' : '❌ Absent',
      userData: userData ? '✅ Présent' : '❌ Absent',
      accessTokenValue: accessToken ? `${accessToken.substring(0, 20)}...` : null,
      userDataValue: userData ? JSON.parse(userData) : null
    });
  }, []);

  const testAPI = async () => {
    setApiTest({ loading: true, result: null, error: null });
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/auth/users/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApiTest({ 
          loading: false, 
          result: { status: response.status, data }, 
          error: null 
        });
      } else {
        const errorText = await response.text();
        setApiTest({ 
          loading: false, 
          result: null, 
          error: { status: response.status, message: errorText } 
        });
      }
    } catch (error) {
      setApiTest({ 
        loading: false, 
        result: null, 
        error: { message: error.message } 
      });
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    window.location.reload();
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🔐 Debug d'Authentification
      </Typography>

      {/* État de l'authentification */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            État de l'Authentification
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Chip
              icon={isAuthenticated ? <CheckCircle /> : <Error />}
              label={isAuthenticated ? 'Connecté' : 'Non connecté'}
              color={isAuthenticated ? 'success' : 'error'}
            />
            <Chip
              label={isLoading ? 'Chargement...' : 'Prêt'}
              color={isLoading ? 'warning' : 'default'}
            />
          </Box>
          
          {user && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Utilisateur connecté :
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {user.id} | Nom: {user.username || user.email} | Rôle: {user.role || 'N/A'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Données du localStorage */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Données du LocalStorage
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2">
              Access Token: {localStorageData.accessToken}
            </Typography>
            <Typography variant="body2">
              Refresh Token: {localStorageData.refreshToken}
            </Typography>
            <Typography variant="body2">
              User Data: {localStorageData.userData}
            </Typography>
          </Box>
          
          {localStorageData.accessTokenValue && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Token (début): {localStorageData.accessTokenValue}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Test de l'API */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test de l'API
          </Typography>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={testAPI}
            disabled={apiTest?.loading}
            sx={{ mb: 2 }}
          >
            {apiTest?.loading ? 'Test en cours...' : 'Tester l\'API'}
          </Button>
          
          {apiTest?.result && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2">
                ✅ API accessible (Status: {apiTest.result.status})
              </Typography>
            </Alert>
          )}
          
          {apiTest?.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2">
                ❌ Erreur API (Status: {apiTest.error.status || 'N/A'}): {apiTest.error.message}
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Logout />}
              onClick={logout}
              color="error"
            >
              Se déconnecter
            </Button>
            <Button
              variant="outlined"
              startIcon={<Login />}
              onClick={clearStorage}
              color="warning"
            >
              Vider le Storage
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuthDebug;
