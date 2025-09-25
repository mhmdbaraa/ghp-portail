import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Shared imports
import { 
  ThemeProvider, 
  AuthProvider, 
  Layout, 
  ProtectedRoute, 
  PERMISSIONS,
  HomeDashboard,
  Login,
  Register
} from './shared';

// Module imports
import { Projects, Tasks, Tableur, Calendar, Dashboard } from './modules/projects';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Routes publiques */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Routes protégées avec Layout */}
            <Route path="/" element={
              <ProtectedRoute>
                <HomeDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute requiredPermission={PERMISSIONS.PROJECT_VIEW}>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/projects" element={
              <ProtectedRoute requiredPermission={PERMISSIONS.PROJECT_VIEW}>
                <Layout>
                  <Projects />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/tasks" element={
              <ProtectedRoute requiredPermission={PERMISSIONS.TASK_VIEW}>
                <Layout>
                  <Tasks />
                </Layout>
              </ProtectedRoute>
            } />


            <Route path="/tableur" element={
              <ProtectedRoute requiredPermission={PERMISSIONS.TASK_VIEW}>
                <Layout>
                  <Tableur />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/calendar" element={
              <ProtectedRoute requiredPermission={PERMISSIONS.PROJECT_VIEW}>
                <Layout>
                  <Calendar />
                </Layout>
              </ProtectedRoute>
            } />
            
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
