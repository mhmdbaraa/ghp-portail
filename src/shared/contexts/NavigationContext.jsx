import React, { createContext, useContext, useState, useCallback } from 'react';

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

  const setModule = useCallback((moduleName, navigationItems) => {
    setCurrentModule(moduleName);
    setModuleNavigation(navigationItems || []);
  }, []);

  const resetToDefault = useCallback(() => {
    setCurrentModule('dashboard');
    setModuleNavigation([]);
  }, []);

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
