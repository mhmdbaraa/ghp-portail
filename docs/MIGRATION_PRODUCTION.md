# Guide de Migration vers la Production

## Vue d'ensemble

Ce document décrit le processus de migration du système Project Tracker depuis l'API simulée (fake) vers une vraie API de production.

## Architecture Actuelle vs Production

### Architecture Actuelle (Développement)
```
Frontend React → apiService.js → fakeDB.js (données en mémoire)
```

### Architecture Production
```
Frontend React → apiService.js → Vraie API REST → Base de données
```

## Étapes de Migration

### 1. Préparation de l'Environnement

#### Variables d'Environnement
Créez un fichier `.env.production` :

```bash
# API Configuration
REACT_APP_API_BASE_URL=https://api.yourcompany.com/v1
REACT_APP_API_TIMEOUT=10000
REACT_APP_API_RETRY_ATTEMPTS=3

# Authentication
REACT_APP_JWT_SECRET=your_jwt_secret_key
REACT_APP_REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Database
REACT_APP_DB_HOST=your_db_host
REACT_APP_DB_PORT=5432
REACT_APP_DB_NAME=projecttracker
REACT_APP_DB_USER=your_db_user
REACT_APP_DB_PASSWORD=your_db_password

# Redis (pour les sessions)
REACT_APP_REDIS_HOST=your_redis_host
REACT_APP_REDIS_PORT=6379
REACT_APP_REDIS_PASSWORD=your_redis_password

# Email Service
REACT_APP_SMTP_HOST=smtp.yourcompany.com
REACT_APP_SMTP_PORT=587
REACT_APP_SMTP_USER=your_smtp_user
REACT_APP_SMTP_PASSWORD=your_smtp_password

# File Storage
REACT_APP_S3_BUCKET=your-s3-bucket
REACT_APP_S3_REGION=eu-west-1
REACT_APP_S3_ACCESS_KEY=your_s3_access_key
REACT_APP_S3_SECRET_KEY=your_s3_secret_key
```

### 2. Modification du Service API

#### Mise à jour de `apiService.js`

```javascript
// Remplacer la simulation par de vrais appels HTTP
import axios from 'axios';

class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL;
    this.authToken = localStorage.getItem('authToken');
    this.refreshToken = localStorage.getItem('refreshToken');
    
    // Configuration Axios
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: process.env.REACT_APP_API_TIMEOUT || 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter le token d'authentification
    this.api.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur pour gérer le refresh token
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const response = await this.refreshAuthToken();
            this.setAuthToken(response.data.access);
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            this.clearAuthToken();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Méthodes d'authentification mises à jour
  async login(credentials) {
    try {
      const response = await this.api.post('/auth/login', credentials);
      const { user, tokens } = response.data;
      
      this.setAuthToken(tokens.access, tokens.refresh);
      return { success: true, data: { user, tokens } };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur de connexion' 
      };
    }
  }

  async refreshAuthToken() {
    return this.api.post('/auth/refresh', {
      refreshToken: this.refreshToken
    });
  }

  // Méthodes CRUD mises à jour
  async getProjects(id = null) {
    try {
      const endpoint = id ? `/projects/${id}` : '/projects';
      const response = await this.api.get(endpoint);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la récupération des projets' 
      };
    }
  }

  async createProject(projectData) {
    try {
      const response = await this.api.post('/projects', projectData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la création du projet' 
      };
    }
  }

  async updateProject(id, projectData) {
    try {
      const response = await this.api.put(`/projects/${id}`, projectData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la mise à jour du projet' 
      };
    }
  }

  async deleteProject(id) {
    try {
      const response = await this.api.delete(`/projects/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la suppression du projet' 
      };
    }
  }

  // Méthodes de recherche mises à jour
  async searchProjects(query, filters = {}) {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.category) params.append('category', filters.category);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      
      const response = await this.api.get(`/projects/search?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la recherche' 
      };
    }
  }

  // Méthodes de statistiques mises à jour
  async getProjectStatistics(projectId = null) {
    try {
      const endpoint = projectId ? `/statistics/projects/${projectId}` : '/statistics/projects';
      const response = await this.api.get(endpoint);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la récupération des statistiques' 
      };
    }
  }

  async getUserStatistics(userId) {
    try {
      const response = await this.api.get(`/statistics/users/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la récupération des statistiques utilisateur' 
      };
    }
  }
}

export default new ApiService();
```

### 3. Gestion des Erreurs

#### Création d'un gestionnaire d'erreurs centralisé

```javascript
// src/utils/errorHandler.js
export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export const handleApiError = (error) => {
  if (error.response) {
    // Erreur de réponse du serveur
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return new ApiError(data.message || 'Données invalides', status, 'BAD_REQUEST');
      case 401:
        return new ApiError('Non autorisé', status, 'UNAUTHORIZED');
      case 403:
        return new ApiError('Accès interdit', status, 'FORBIDDEN');
      case 404:
        return new ApiError('Ressource non trouvée', status, 'NOT_FOUND');
      case 422:
        return new ApiError(data.message || 'Données de validation invalides', status, 'VALIDATION_ERROR');
      case 429:
        return new ApiError('Trop de requêtes', status, 'RATE_LIMIT_EXCEEDED');
      case 500:
        return new ApiError('Erreur serveur interne', status, 'INTERNAL_SERVER_ERROR');
      default:
        return new ApiError(data.message || 'Erreur inconnue', status, 'UNKNOWN_ERROR');
    }
  } else if (error.request) {
    // Erreur de réseau
    return new ApiError('Erreur de connexion au serveur', 0, 'NETWORK_ERROR');
  } else {
    // Erreur de configuration
    return new ApiError('Erreur de configuration', 0, 'CONFIGURATION_ERROR');
  }
};
```

### 4. Migration des Données

#### Script de migration des données

```javascript
// scripts/migrateData.js
import { fakeDB } from '../src/data/fakeDB';
import apiService from '../src/services/apiService';

const migrateData = async () => {
  console.log('🚀 Début de la migration des données...');
  
  try {
    // Migration des utilisateurs
    console.log('📝 Migration des utilisateurs...');
    for (const user of fakeDB.users) {
      const { password, ...userData } = user;
      await apiService.api.post('/users', {
        ...userData,
        password: 'password123' // Mot de passe temporaire
      });
    }
    
    // Migration des projets
    console.log('📁 Migration des projets...');
    for (const project of fakeDB.projects) {
      await apiService.api.post('/projects', project);
    }
    
    // Migration des tâches
    console.log('✅ Migration des tâches...');
    for (const task of fakeDB.tasks) {
      await apiService.api.post('/tasks', task);
    }
    
    // Migration des équipes
    console.log('👥 Migration des équipes...');
    for (const team of fakeDB.teams) {
      await apiService.api.post('/teams', team);
    }
    
    console.log('✅ Migration terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  }
};

export default migrateData;
```

### 5. Tests de Migration

#### Tests de régression

```javascript
// tests/migration.test.js
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import apiService from '../src/services/apiService';

describe('Migration Tests', () => {
  test('Authentification fonctionne avec la nouvelle API', async () => {
    const credentials = {
      email: 'admin@projecttracker.com',
      password: 'password123'
    };
    
    const result = await apiService.login(credentials);
    expect(result.success).toBe(true);
    expect(result.data.user).toBeDefined();
    expect(result.data.tokens).toBeDefined();
  });

  test('Récupération des projets fonctionne', async () => {
    const result = await apiService.getProjects();
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
  });

  test('Création de projet fonctionne', async () => {
    const projectData = {
      name: 'Projet Test Migration',
      description: 'Test de migration vers la production',
      status: 'not_started',
      priority: 'medium',
      category: 'Test'
    };
    
    const result = await apiService.createProject(projectData);
    expect(result.success).toBe(true);
    expect(result.data.name).toBe(projectData.name);
  });
});
```

### 6. Configuration de Production

#### Webpack Configuration

```javascript
// webpack.config.prod.js
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

module.exports = {
  mode: 'production',
  plugins: [
    new Dotenv({
      path: './.env.production',
      safe: true
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ],
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};
```

### 7. Monitoring et Observabilité

#### Intégration de Sentry

```javascript
// src/utils/monitoring.js
import * as Sentry from '@sentry/react';

export const initMonitoring = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay()
      ],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0
    });
  }
};

export const captureApiError = (error, context = {}) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      extra: context
    });
  }
};
```

### 8. Déploiement

#### Script de déploiement

```bash
#!/bin/bash
# scripts/deploy.sh

echo "🚀 Déploiement en production..."

# Build de production
echo "📦 Build de production..."
npm run build:prod

# Tests de régression
echo "🧪 Tests de régression..."
npm run test:migration

# Migration des données
echo "🔄 Migration des données..."
node scripts/migrateData.js

# Déploiement
echo "🌐 Déploiement..."
aws s3 sync build/ s3://your-bucket --delete

# Invalidation du cache CloudFront
echo "🗑️ Invalidation du cache..."
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"

echo "✅ Déploiement terminé !"
```

## Checklist de Migration

### Pré-migration
- [ ] Tests unitaires et d'intégration passent
- [ ] Variables d'environnement configurées
- [ ] Base de données de production prête
- [ ] API de production déployée et testée
- [ ] Plan de rollback préparé

### Migration
- [ ] Sauvegarde des données actuelles
- [ ] Migration des données
- [ ] Tests de régression
- [ ] Validation des fonctionnalités
- [ ] Monitoring activé

### Post-migration
- [ ] Vérification des performances
- [ ] Validation des métriques
- [ ] Tests de charge
- [ ] Documentation mise à jour
- [ ] Formation de l'équipe

## Gestion des Risques

### Risques Identifiés
1. **Perte de données** : Sauvegarde complète avant migration
2. **Temps d'arrêt** : Migration en dehors des heures de pointe
3. **Problèmes de performance** : Tests de charge préalables
4. **Erreurs de configuration** : Tests d'intégration complets

### Plan de Rollback
```bash
# Restauration de la version précédente
git checkout HEAD~1
npm run build:prod
aws s3 sync build/ s3://your-bucket --delete
```

## Support et Maintenance

### Contact d'Urgence
- **DevOps** : devops@yourcompany.com
- **DBA** : dba@yourcompany.com
- **Lead Developer** : lead@yourcompany.com

### Documentation
- **API Production** : https://api.yourcompany.com/docs
- **Monitoring** : https://monitoring.yourcompany.com
- **Logs** : https://logs.yourcompany.com

## Conclusion

Cette migration permettra de passer d'un système de développement avec des données simulées à une solution de production robuste et scalable. Suivez attentivement chaque étape et testez rigoureusement avant de passer en production.

