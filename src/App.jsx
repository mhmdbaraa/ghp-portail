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
import SuperuserOnlyGuard from './shared/components/SuperuserOnlyGuard';
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
import AuthDebug from './components/AuthDebug'; // Added for debugging
import AuthTest from './components/AuthTest'; // Added for testing
import PermissionTest from './components/PermissionTest'; // Added for permission testing

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <NavigationProvider>
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
            
            {/* User Management Routes - Superuser Only */}
            <Route path="/users/dashboard" element={
              <ProtectedRoute>
                <SuperuserOnlyGuard>
                  <Layout>
                    <UserList />
                  </Layout>
                </SuperuserOnlyGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/users/list" element={
              <ProtectedRoute>
                <SuperuserOnlyGuard>
                  <Layout>
                    <UserList />
                  </Layout>
                </SuperuserOnlyGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/users/create" element={
              <ProtectedRoute>
                <SuperuserOnlyGuard>
                  <Layout>
                    <UserForm />
                  </Layout>
                </SuperuserOnlyGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/users/edit/:id" element={
              <ProtectedRoute>
                <SuperuserOnlyGuard>
                  <Layout>
                    <UserForm />
                  </Layout>
                </SuperuserOnlyGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/users/profile/:id" element={
              <ProtectedRoute>
                <SuperuserOnlyGuard>
                  <Layout>
                    <UserProfile />
                  </Layout>
                </SuperuserOnlyGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/users/permissions" element={
              <ProtectedRoute>
                <SuperuserOnlyGuard>
                  <Layout>
                    <PermissionManagement />
                  </Layout>
                </SuperuserOnlyGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/users/roles" element={
              <ProtectedRoute>
                <SuperuserOnlyGuard>
                  <Layout>
                    <RoleManagement />
                  </Layout>
                </SuperuserOnlyGuard>
              </ProtectedRoute>
            } />
            
            
            {/* Debug routes - temporaires */}
            <Route path="/debug/auth" element={<AuthDebug />} />
            <Route path="/test/auth" element={<AuthTest />} />
            <Route path="/test/permissions" element={
              <ProtectedRoute>
                <Layout>
                  <PermissionTest />
                </Layout>
              </ProtectedRoute>
            } />
            
            </Routes>
          </NavigationProvider>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
