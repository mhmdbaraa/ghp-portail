import React, { useState, useEffect } from 'react';
import { useAuth } from '../shared/contexts/AuthContext';
import { Box, Button, Typography, Alert, CircularProgress } from '@mui/material';

const AuthTest = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const testAPI = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        setTestResult({
          success: false,
          message: 'Aucun token d\'accès trouvé'
        });
        return;
      }

      const response = await fetch('http://localhost:8000/api/authentication/users/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult({
          success: true,
          message: `API accessible (${response.status})`,
          data: data
        });
      } else {
        setTestResult({
          success: false,
          message: `Erreur API (${response.status})`,
          status: response.status
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Erreur réseau: ${error.message}`
      });
    } finally {
      setTesting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        🔐 Test d'Authentification
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          <strong>État de l'authentification:</strong> {isAuthenticated ? '✅ Connecté' : '❌ Non connecté'}
        </Typography>
        {user && (
          <Typography variant="body2" color="text.secondary">
            Utilisateur: {user.username || user.email} (ID: {user.id})
          </Typography>
        )}
      </Box>

      <Button
        variant="contained"
        onClick={testAPI}
        disabled={testing}
        sx={{ mb: 2 }}
      >
        {testing ? 'Test en cours...' : 'Tester l\'API des utilisateurs'}
      </Button>

      {testResult && (
        <Alert 
          severity={testResult.success ? 'success' : 'error'}
          sx={{ mt: 2 }}
        >
          <Typography variant="body2">
            {testResult.message}
          </Typography>
          {testResult.data && (
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Données reçues: {JSON.stringify(testResult.data, null, 2)}
            </Typography>
          )}
        </Alert>
      )}

      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Informations de debug:
        </Typography>
        <Typography variant="caption" display="block">
          Access Token: {localStorage.getItem('accessToken') ? '✅ Présent' : '❌ Absent'}
        </Typography>
        <Typography variant="caption" display="block">
          Refresh Token: {localStorage.getItem('refreshToken') ? '✅ Présent' : '❌ Absent'}
        </Typography>
        <Typography variant="caption" display="block">
          User Data: {localStorage.getItem('userData') ? '✅ Présent' : '❌ Absent'}
        </Typography>
      </Box>
    </Box>
  );
};

export default AuthTest;
