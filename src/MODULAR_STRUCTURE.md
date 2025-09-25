# Modular Project Structure

This project has been reorganized into a modular structure to support scalability and maintainability for a large application with multiple business modules.

## 📁 Directory Structure

```
src/
├── shared/                    # Common components and utilities
│   ├── components/           # Shared UI components
│   │   ├── ui/              # Reusable UI components
│   │   ├── Layout.jsx       # Main layout wrapper
│   │   ├── ProtectedRoute.jsx
│   │   ├── HomeDashboard.jsx # Main portal page
│   │   ├── Dashboard.jsx    # Project management dashboard
│   │   ├── Login.jsx        # Authentication
│   │   ├── Register.jsx
│   │   ├── Calendar.jsx
│   │   └── Team.jsx
│   ├── contexts/            # React contexts
│   │   ├── AuthContext.jsx  # Authentication & permissions
│   │   └── ThemeContext.jsx # Theme management
│   ├── services/            # API services
│   │   ├── apiService.js
│   │   └── axiosInstance.js
│   ├── jwt/                 # JWT authentication
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   └── index.js             # Shared exports
│
├── modules/                 # Business modules
│   ├── projects/           # Project management module
│   │   ├── Projects.jsx    # Project listing & management
│   │   ├── Tasks.jsx       # Task management
│   │   ├── Kanban.jsx      # Kanban board
│   │   ├── Tableur.jsx     # Table view
│   │   └── index.js        # Module exports
│   ├── achat/              # Purchasing module
│   ├── juridique/          # Legal module
│   ├── finance/            # Finance module
│   ├── rh/                 # Human resources module
│   ├── ventes/             # Sales module
│   ├── logistique/         # Logistics module
│   └── backoffice/         # Back office module
│
├── assets/                 # Static assets
├── data/                   # Mock data
├── styles/                 # Global styles
├── theme/                  # Theme configuration
└── App.jsx                 # Main application
```

## 🎯 Benefits of This Structure

### 1. **Scalability**
- Easy to add new business modules
- Each module is self-contained
- Clear separation of concerns

### 2. **Maintainability**
- Common code is centralized in `shared/`
- Module-specific code is isolated
- Easy to locate and modify features

### 3. **Team Collaboration**
- Different teams can work on different modules
- Reduced merge conflicts
- Clear ownership boundaries

### 4. **Code Reusability**
- Shared components can be used across modules
- Common utilities and services
- Consistent UI patterns

## 📦 Module Structure

Each business module should follow this structure:

```
modules/[module-name]/
├── components/          # Module-specific components
├── pages/              # Module pages
├── services/           # Module-specific API calls
├── hooks/              # Module-specific hooks
├── types/              # Module-specific types
├── utils/              # Module utilities
└── index.js            # Module exports
```

## 🔧 Adding a New Module

1. **Create module directory:**
   ```bash
   mkdir modules/new-module
   ```

2. **Create module structure:**
   ```bash
   mkdir modules/new-module/{components,pages,services,hooks,types,utils}
   ```

3. **Create module components:**
   ```jsx
   // modules/new-module/NewModulePage.jsx
   import React from 'react';
   import Layout from '../../shared/components/Layout';
   
   const NewModulePage = () => {
     return (
       <Layout>
         <div>New Module Content</div>
       </Layout>
     );
   };
   
   export default NewModulePage;
   ```

4. **Create module index:**
   ```js
   // modules/new-module/index.js
   export { default as NewModulePage } from './NewModulePage';
   ```

5. **Add routes in App.jsx:**
   ```jsx
   import { NewModulePage } from './modules/new-module';
   
   // Add route
   <Route path="/new-module" element={
     <ProtectedRoute>
       <NewModulePage />
     </ProtectedRoute>
   } />
   ```

## 🚀 Import Patterns

### Shared Components
```jsx
import { Layout, ProtectedRoute, useAuth } from '../shared';
```

### Module Components
```jsx
import { Projects, Tasks } from './modules/projects';
```

### Relative Imports (within module)
```jsx
import { SomeComponent } from './components/SomeComponent';
import { apiService } from '../../shared/services/apiService';
```

## 🎨 HomeDashboard Integration

The `HomeDashboard` component serves as the main portal after login, providing access to all business modules through a grid of icons. Each module icon can navigate to its respective pages.

### Adding Module to HomeDashboard

1. **Add icon import** in `shared/components/HomeDashboard.jsx`
2. **Add grid item** with navigation to module route
3. **Update routing** in `App.jsx`

## 🔐 Authentication & Permissions

- **AuthContext**: Centralized authentication management
- **ProtectedRoute**: Route protection with permission checking
- **Permission System**: Role-based access control

## 🎨 Theming

- **ThemeContext**: Centralized theme management
- **Dark/Light Mode**: Toggle support
- **Consistent Styling**: Shared theme across all modules

## 📱 Responsive Design

All components are built with Material-UI and support:
- Mobile-first design
- Responsive breakpoints
- Touch-friendly interfaces

## 🧪 Testing

Each module should include:
- Unit tests for components
- Integration tests for services
- E2E tests for user flows

## 📚 Best Practices

1. **Keep modules independent** - minimize cross-module dependencies
2. **Use shared components** - don't duplicate common UI elements
3. **Follow naming conventions** - consistent file and component naming
4. **Document module APIs** - clear interfaces between modules
5. **Version control** - each module can have its own versioning
6. **Performance** - lazy load modules when possible

## 🔄 Migration Guide

If you need to move existing components to this structure:

1. **Identify module ownership** - which module does this component belong to?
2. **Move to appropriate location** - shared/ or modules/[module]/
3. **Update import paths** - fix all references
4. **Test thoroughly** - ensure nothing is broken
5. **Update documentation** - reflect new structure

This modular structure provides a solid foundation for building and maintaining a large-scale business application with multiple modules.
