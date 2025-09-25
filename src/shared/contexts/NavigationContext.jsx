import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({ children }) => {
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [moduleNavigation, setModuleNavigation] = useState([]);
  const location = useLocation();

  const setModule = useCallback((moduleName, navigationItems) => {
    setCurrentModule(moduleName);
    setModuleNavigation(navigationItems || []);
  }, []);

  const resetToDefault = useCallback(() => {
    setCurrentModule('dashboard');
    setModuleNavigation([]);
  }, []);

  // Réinitialiser le contexte quand on quitte le module utilisateur
  useEffect(() => {
    const pathname = location.pathname;
    
    // Si on n'est plus dans le module utilisateur, réinitialiser
    if (!pathname.startsWith('/users/') && currentModule === 'users') {
      resetToDefault();
    }
    // Si on n'est plus dans le module projets, réinitialiser
    else if (!pathname.startsWith('/projects/') && !pathname.startsWith('/tasks/') && 
             !pathname.startsWith('/tableur/') && !pathname.startsWith('/calendar/') && 
             !pathname.startsWith('/dashboard') && currentModule === 'projects') {
      resetToDefault();
    }
  }, [location.pathname, currentModule, resetToDefault]);

  return (
    <NavigationContext.Provider
      value={{
        currentModule,
        moduleNavigation,
        setModule,
        resetToDefault,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};
