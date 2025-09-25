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
import { NavigationProvider } from './shared/contexts/NavigationContext';

// Module imports
import { Projects, Tasks, Tableur, Calendar, Dashboard } from './modules/projects';
import { 
  UserDashboard, 
  UserList, 
  UserForm, 
  UserProfile, 
  PermissionManagement, 
  RoleManagement 
} from './modules/users';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationProvider>
          <Router future={{ v7_relativeSplatPath: true }}>
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
            
            {/* User Management Routes */}
            <Route path="/users/dashboard" element={
              <ProtectedRoute requiredPermission={PERMISSIONS.USER_VIEW}>
                <Layout>
                  <UserDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/users/list" element={
              <ProtectedRoute requiredPermission={PERMISSIONS.USER_VIEW}>
                <Layout>
                  <UserList />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/users/create" element={
              <ProtectedRoute requiredPermission={PERMISSIONS.USER_ADD}>
                <Layout>
                  <UserForm />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/users/edit/:id" element={
              <ProtectedRoute requiredPermission={PERMISSIONS.USER_CHANGE}>
                <Layout>
                  <UserForm />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/users/profile/:id" element={
              <ProtectedRoute requiredPermission={PERMISSIONS.USER_VIEW}>
                <Layout>
                  <UserProfile />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/users/permissions" element={
              <ProtectedRoute requiredPermission={PERMISSIONS.USER_CHANGE}>
                <Layout>
                  <PermissionManagement />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/users/roles" element={
              <ProtectedRoute requiredPermission={PERMISSIONS.USER_CHANGE}>
                <Layout>
                  <RoleManagement />
                </Layout>
              </ProtectedRoute>
            } />
            
            
            
          </Routes>
          </Router>
        </NavigationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
