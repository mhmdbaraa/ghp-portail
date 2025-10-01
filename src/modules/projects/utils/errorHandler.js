// Standardized error handling utilities

export const handleApiError = (error, context = '') => {
  console.error(`API Error ${context}:`, error);
  
  // Extract meaningful error message
  let errorMessage = 'Une erreur inattendue s\'est produite';
  
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        errorMessage = data?.message || 'Données invalides';
        break;
      case 401:
        errorMessage = 'Non autorisé - veuillez vous reconnecter';
        break;
      case 403:
        errorMessage = 'Accès refusé';
        break;
      case 404:
        errorMessage = 'Ressource non trouvée';
        break;
      case 422:
        errorMessage = data?.message || 'Erreur de validation des données';
        break;
      case 500:
        errorMessage = 'Erreur serveur interne';
        break;
      default:
        errorMessage = data?.message || `Erreur serveur (${status})`;
    }
  } else if (error.request) {
    // Network error
    errorMessage = 'Erreur de connexion réseau';
  } else {
    // Other error
    errorMessage = error.message || 'Erreur inconnue';
  }
  
  return {
    message: errorMessage,
    status: error.response?.status,
    data: error.response?.data,
    originalError: error
  };
};

export const showErrorSnackbar = (setSnackbar, error, context = '') => {
  const errorInfo = handleApiError(error, context);
  setSnackbar({
    open: true,
    message: errorInfo.message,
    severity: 'error'
  });
};

export const showSuccessSnackbar = (setSnackbar, message) => {
  setSnackbar({
    open: true,
    message,
    severity: 'success'
  });
};

export const showWarningSnackbar = (setSnackbar, message) => {
  setSnackbar({
    open: true,
    message,
    severity: 'warning'
  });
};

export const showInfoSnackbar = (setSnackbar, message) => {
  setSnackbar({
    open: true,
    message,
    severity: 'info'
  });
};

// Validation error handler
export const handleValidationError = (errors, setFieldErrors) => {
  const fieldErrorMap = {};
  
  Object.keys(errors).forEach(field => {
    fieldErrorMap[field] = true;
  });
  
  setFieldErrors(prev => ({ ...prev, ...fieldErrorMap }));
};

// Network error handler
export const isNetworkError = (error) => {
  return !error.response && error.request;
};

// Retry mechanism for failed requests
export const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Only retry on network errors
      if (isNetworkError(error)) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      
      throw error;
    }
  }
};

// Error boundary helper (JSX version should be in a separate .jsx file)
export const createErrorBoundary = (Component, fallback) => {
  // This function should be implemented in a .jsx file if JSX is needed
  console.warn('createErrorBoundary: JSX version should be implemented in a .jsx file');
  return Component;
};
