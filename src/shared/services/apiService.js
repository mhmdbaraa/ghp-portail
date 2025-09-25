// API Service - Simulation d'appels HTTP vers la fake DB
// À remplacer par de vraies APIs en production

import { fakeDB, generateId, getCurrentTimestamp } from '../../data/fakeDB';

// Configuration de l'API
const API_CONFIG = {
  baseURL: 'https://api.projecttracker.com/v1',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000
};

// Simulation de délai réseau
const simulateNetworkDelay = (min = 100, max = 800) => {
  return new Promise(resolve => {
    setTimeout(resolve, Math.random() * (max - min) + min);
  });
};

// Simulation d'erreurs réseau (5% de chance)
const simulateNetworkError = () => {
  if (Math.random() < 0.05) {
    throw new Error('Erreur réseau simulée');
  }
};

// Classe pour gérer les réponses API
class ApiResponse {
  constructor(success, data = null, error = null, message = '') {
    this.success = success;
    this.data = data;
    this.error = error;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }

  static success(data, message = 'Opération réussie') {
    return new ApiResponse(true, data, null, message);
  }

  static error(error, message = 'Erreur lors de l\'opération') {
    return new ApiResponse(false, null, error, message);
  }
}

// Classe principale du service API
class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.authToken = localStorage.getItem('authToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  // Méthodes d'authentification
  setAuthToken(token, refreshToken = null) {
    this.authToken = token;
    if (refreshToken) this.refreshToken = refreshToken;
    localStorage.setItem('authToken', token);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  }

  clearAuthToken() {
    this.authToken = null;
    this.refreshToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }

  // Méthode générique pour les appels API
  async apiCall(operation, entity, data = null, id = null) {
    try {
      // Simulation de délai réseau
      await simulateNetworkDelay();
      
      // Simulation d'erreur réseau
      simulateNetworkError();

      // Vérification de l'authentification
      if (!this.authToken && entity !== 'auth') {
        throw new Error('Token d\'authentification manquant');
      }

      let result;
      switch (operation) {
        case 'GET':
          result = await this.handleGet(entity, id);
          break;
        case 'POST':
          result = await this.handlePost(entity, data);
          break;
        case 'PUT':
          result = await this.handlePut(entity, id, data);
          break;
        case 'DELETE':
          result = await this.handleDelete(entity, id);
          break;
        default:
          throw new Error(`Opération non supportée: ${operation}`);
      }

      return ApiResponse.success(result);
    } catch (error) {
      console.error(`Erreur API ${operation} ${entity}:`, error);
      return ApiResponse.error(error.message || 'Erreur inconnue');
    }
  }

  // Gestion des opérations GET
  async handleGet(entity, id = null) {
    switch (entity) {
      case 'users':
        return id ? fakeDB.users.find(u => u.id === parseInt(id)) : fakeDB.users;
      
      case 'projects':
        if (id) {
          const project = fakeDB.projects.find(p => p.id === parseInt(id));
          if (project) {
            // Enrichir avec les données des utilisateurs
            return {
              ...project,
              manager: fakeDB.users.find(u => u.id === project.manager),
              team: fakeDB.users.filter(u => project.team.includes(u.id))
            };
          }
          throw new Error('Projet non trouvé');
        }
        return fakeDB.projects.map(project => ({
          ...project,
          manager: fakeDB.users.find(u => u.id === project.manager),
          team: fakeDB.users.filter(u => project.team.includes(u.id))
        }));
      
      case 'tasks':
        if (id) {
          const task = fakeDB.tasks.find(t => t.id === parseInt(id));
          if (task) {
            return {
              ...task,
              assignee: fakeDB.users.find(u => u.id === task.assignee),
              reporter: fakeDB.users.find(u => u.id === task.reporter),
              project: fakeDB.projects.find(p => p.id === task.project)
            };
          }
          throw new Error('Tâche non trouvée');
        }
        return fakeDB.tasks.map(task => ({
          ...task,
          assignee: fakeDB.users.find(u => u.id === task.assignee),
          reporter: fakeDB.users.find(u => u.id === task.reporter),
          project: fakeDB.projects.find(p => p.id === task.project)
        }));
      
      case 'notifications': {
        const userId = this.getCurrentUserId();
        return fakeDB.notifications.filter(n => n.userId === userId);
      }
      
      case 'teams':
        return id ? fakeDB.teams.find(t => t.id === parseInt(id)) : fakeDB.teams;
      
      case 'activities':
        return fakeDB.activities;
      
      case 'metrics':
        return fakeDB.metrics;
      
      case 'dashboard':
        return {
          metrics: fakeDB.metrics,
          recentProjects: fakeDB.projects.slice(0, 5),
          upcomingTasks: fakeDB.tasks.filter(t => t.status !== 'completed').slice(0, 5),
          recentActivities: fakeDB.activities.slice(0, 10)
        };
      
      default:
        throw new Error(`Entité non reconnue: ${entity}`);
    }
  }

  // Gestion des opérations POST
  async handlePost(entity, data) {
    switch (entity) {
      case 'auth/login':
        return this.handleLogin(data);
      
      case 'auth/register':
        return this.handleRegister(data);
      
      case 'projects': {
        const newProject = {
          id: generateId(),
          ...data,
          createdAt: getCurrentTimestamp(),
          updatedAt: getCurrentTimestamp()
        };
        fakeDB.projects.push(newProject);
        return newProject;
      }
      
      case 'tasks': {
        const newTask = {
          id: generateId(),
          ...data,
          createdAt: getCurrentTimestamp(),
          updatedAt: getCurrentTimestamp()
        };
        fakeDB.tasks.push(newTask);
        return newTask;
      }
      
      case 'notifications': {
        const newNotification = {
          id: generateId(),
          ...data,
          createdAt: getCurrentTimestamp()
        };
        fakeDB.notifications.push(newNotification);
        return newNotification;
      }
      
      case 'comments': {
        // Ajouter un commentaire à une tâche
        const { taskId, content } = data;
        const task = fakeDB.tasks.find(t => t.id === taskId);
        if (!task) throw new Error('Tâche non trouvée');
        
        const newComment = {
          id: generateId(),
          user: this.getCurrentUserId(),
          content,
          timestamp: getCurrentTimestamp()
        };
        
        if (!task.comments) task.comments = [];
        task.comments.push(newComment);
        task.updatedAt = getCurrentTimestamp();
        
        return newComment;
      }
      
      default:
        throw new Error(`Entité non reconnue pour POST: ${entity}`);
    }
  }

  // Gestion des opérations PUT
  async handlePut(entity, id, data) {
    switch (entity) {
      case 'projects': {
        const projectIndex = fakeDB.projects.findIndex(p => p.id === parseInt(id));
        if (projectIndex === -1) throw new Error('Projet non trouvé');
        
        fakeDB.projects[projectIndex] = {
          ...fakeDB.projects[projectIndex],
          ...data,
          updatedAt: getCurrentTimestamp()
        };
        return fakeDB.projects[projectIndex];
      }
      
      case 'tasks': {
        const taskIndex = fakeDB.tasks.findIndex(t => t.id === parseInt(id));
        if (taskIndex === -1) throw new Error('Tâche non trouvée');
        
        fakeDB.tasks[taskIndex] = {
          ...fakeDB.tasks[taskIndex],
          ...data,
          updatedAt: getCurrentTimestamp()
        };
        return fakeDB.tasks[taskIndex];
      }
      
      case 'users': {
        const userIndex = fakeDB.users.findIndex(u => u.id === parseInt(id));
        if (userIndex === -1) throw new Error('Utilisateur non trouvé');
        
        fakeDB.users[userIndex] = {
          ...fakeDB.users[userIndex],
          ...data,
          updatedAt: getCurrentTimestamp()
        };
        return fakeDB.users[userIndex];
      }
      
      case 'notifications/read': {
        // Marquer une notification comme lue
        const notification = fakeDB.notifications.find(n => n.id === parseInt(id));
        if (notification) {
          notification.read = true;
          return notification;
        }
        throw new Error('Notification non trouvée');
      }
      
      default:
        throw new Error(`Entité non reconnue pour PUT: ${entity}`);
    }
  }

  // Gestion des opérations DELETE
  async handleDelete(entity, id) {
    switch (entity) {
      case 'projects': {
        const projectIndex = fakeDB.projects.findIndex(p => p.id === parseInt(id));
        if (projectIndex === -1) throw new Error('Projet non trouvé');
        
        const deletedProject = fakeDB.projects.splice(projectIndex, 1)[0];
        // Supprimer aussi les tâches associées
        fakeDB.tasks = fakeDB.tasks.filter(t => t.project !== parseInt(id));
        return deletedProject;
      }
      
      case 'tasks': {
        const taskIndex = fakeDB.tasks.findIndex(t => t.id === parseInt(id));
        if (taskIndex === -1) throw new Error('Tâche non trouvée');
        
        return fakeDB.tasks.splice(taskIndex, 1)[0];
      }
      
      case 'notifications': {
        const notificationIndex = fakeDB.notifications.findIndex(n => n.id === parseInt(id));
        if (notificationIndex === -1) throw new Error('Notification non trouvée');
        
        return fakeDB.notifications.splice(notificationIndex, 1)[0];
      }
      
      default:
        throw new Error(`Entité non reconnue pour DELETE: ${entity}`);
    }
  }

  // Gestion de l'authentification
  async handleLogin(credentials) {
    const { email, password } = credentials;
    
    // Simulation de validation
    if (!email || !password) {
      throw new Error('Email et mot de passe requis');
    }
    
    // Recherche de l'utilisateur
    const user = fakeDB.users.find(u => u.email === email);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    
    // Simulation de vérification du mot de passe
    if (password !== 'password123') {
      throw new Error('Mot de passe incorrect');
    }
    
    // Mise à jour de la dernière connexion
    user.lastLogin = getCurrentTimestamp();
    
    // Génération des tokens
    const authToken = `fake_jwt_${user.id}_${Date.now()}`;
    const refreshToken = `fake_refresh_${user.id}_${Date.now()}`;
    
    // Stockage des tokens
    this.setAuthToken(authToken, refreshToken);
    
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        permissions: user.permissions,
        preferences: user.preferences
      },
      tokens: {
        access: authToken,
        refresh: refreshToken,
        expiresIn: 3600
      }
    };
  }

  async handleRegister(userData) {
    const { username, email, password, name } = userData;
    
    // Validation des données
    if (!username || !email || !password || !name) {
      throw new Error('Tous les champs sont requis');
    }
    
    // Vérification de l'unicité
    if (fakeDB.users.find(u => u.username === username)) {
      throw new Error('Nom d\'utilisateur déjà utilisé');
    }
    
    if (fakeDB.users.find(u => u.email === email)) {
      throw new Error('Email déjà utilisé');
    }
    
    // Création du nouvel utilisateur
    const newUser = {
      id: generateId(),
      username,
      email,
      name,
      password: 'hashed_password', // En production, hasher le mot de passe
      role: 'developer',
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
      department: 'Développement',
      position: 'Développeur',
      phone: '',
      location: '',
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: getCurrentTimestamp(),
      status: 'active',
      permissions: ['task_manage', 'project_view'],
      preferences: {
        theme: 'light',
        language: 'fr',
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      },
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };
    
    fakeDB.users.push(newUser);
    
    // Connexion automatique
    return this.handleLogin({ email, password });
  }

  // Méthodes utilitaires
  getCurrentUserId() {
    if (!this.authToken) return null;
    
    // Extraction de l'ID utilisateur du token (simulation)
    const tokenParts = this.authToken.split('_');
    if (tokenParts.length >= 3) {
      return parseInt(tokenParts[2]);
    }
    return null;
  }

  // Méthodes publiques pour les composants
  async getUsers(id = null) {
    return this.apiCall('GET', 'users', null, id);
  }

  async getProjects(id = null) {
    return this.apiCall('GET', 'projects', null, id);
  }

  async getTasks(id = null) {
    return this.apiCall('GET', 'tasks', null, id);
  }

  async getNotifications() {
    return this.apiCall('GET', 'notifications');
  }

  async getTeams(id = null) {
    return this.apiCall('GET', 'teams', null, id);
  }

  async getActivities() {
    return this.apiCall('GET', 'activities');
  }

  async getMetrics() {
    return this.apiCall('GET', 'metrics');
  }

  async getDashboard() {
    return this.apiCall('GET', 'dashboard');
  }

  async createProject(projectData) {
    return this.apiCall('POST', 'projects', projectData);
  }

  async updateProject(id, projectData) {
    return this.apiCall('PUT', 'projects', projectData, id);
  }

  async deleteProject(id) {
    return this.apiCall('DELETE', 'projects', null, id);
  }

  async createTask(taskData) {
    return this.apiCall('POST', 'tasks', taskData);
  }

  async updateTask(id, taskData) {
    return this.apiCall('PUT', 'tasks', taskData, id);
  }

  async deleteTask(id) {
    return this.apiCall('DELETE', 'tasks', null, id);
  }

  async createComment(commentData) {
    return this.apiCall('POST', 'comments', commentData);
  }

  async markNotificationAsRead(id) {
    return this.apiCall('PUT', 'notifications/read', null, id);
  }

  async deleteNotification(id) {
    return this.apiCall('DELETE', 'notifications', null, id);
  }

  async login(credentials) {
    return this.apiCall('POST', 'auth/login', credentials);
  }

  async register(userData) {
    return this.apiCall('POST', 'auth/register', userData);
  }

  async logout() {
    this.clearAuthToken();
    return ApiResponse.success(null, 'Déconnexion réussie');
  }

  // Méthodes de recherche et filtrage
  async searchProjects(query, filters = {}) {
    const response = await this.getProjects();
    if (!response.success) return response;
    
    let projects = response.data;
    
    // Filtrage par texte
    if (query) {
      projects = projects.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase()) ||
        p.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    // Filtrage par statut
    if (filters.status) {
      projects = projects.filter(p => p.status === filters.status);
    }
    
    // Filtrage par priorité
    if (filters.priority) {
      projects = projects.filter(p => p.priority === filters.priority);
    }
    
    // Filtrage par catégorie
    if (filters.category) {
      projects = projects.filter(p => p.category === filters.category);
    }
    
    // Tri
    if (filters.sortBy) {
      projects.sort((a, b) => {
        switch (filters.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'deadline':
            return new Date(a.deadline) - new Date(b.deadline);
          case 'progress':
            return b.progress - a.progress;
          case 'priority': {
            const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }
          default:
            return 0;
        }
      });
    }
    
    return ApiResponse.success(projects);
  }

  async searchTasks(query, filters = {}) {
    const response = await this.getTasks();
    if (!response.success) return response;
    
    let tasks = response.data;
    
    // Filtrage par texte
    if (query) {
      tasks = tasks.filter(t => 
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    // Filtrage par statut
    if (filters.status) {
      tasks = tasks.filter(t => t.status === filters.status);
    }
    
    // Filtrage par priorité
    if (filters.priority) {
      tasks = tasks.filter(t => t.priority === filters.priority);
    }
    
    // Filtrage par assigné
    if (filters.assignee) {
      tasks = tasks.filter(t => t.assignee?.id === parseInt(filters.assignee));
    }
    
    // Filtrage par projet
    if (filters.project) {
      tasks = tasks.filter(t => t.project?.id === parseInt(filters.project));
    }
    
    // Tri
    if (filters.sortBy) {
      tasks.sort((a, b) => {
        switch (filters.sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'dueDate':
            return new Date(a.dueDate) - new Date(b.dueDate);
          case 'priority': {
            const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }
          case 'status': {
            const statusOrder = { not_started: 1, in_progress: 2, completed: 3 };
            return statusOrder[a.status] - statusOrder[b.status];
          }
          default:
            return 0;
        }
      });
    }
    
    return ApiResponse.success(tasks);
  }

  // Méthodes de statistiques avancées
  async getProjectStatistics(projectId = null) {
    if (projectId) {
      // Statistiques pour un projet spécifique
      const project = fakeDB.projects.find(p => p.id === parseInt(projectId));
      if (!project) {
        return ApiResponse.error('Projet non trouvé');
      }
      
      const projectTasks = fakeDB.tasks.filter(t => t.project === parseInt(projectId));
      const completedTasks = projectTasks.filter(t => t.status === 'completed');
      const overdueTasks = projectTasks.filter(t => 
        new Date(t.dueDate) < new Date() && t.status !== 'completed'
      );
      
      return ApiResponse.success({
        totalTasks: projectTasks.length,
        completedTasks: completedTasks.length,
        inProgressTasks: projectTasks.filter(t => t.status === 'in_progress').length,
        overdueTasks: overdueTasks.length,
        completionRate: projectTasks.length > 0 ? 
          Math.round((completedTasks.length / projectTasks.length) * 100) : 0,
        averageTaskDuration: projectTasks.length > 0 ?
          projectTasks.reduce((sum, t) => sum + (t.actualTime || 0), 0) / projectTasks.length : 0,
        budgetUtilization: project.budget > 0 ? 
          Math.round((project.spent / project.budget) * 100) : 0
      });
    } else {
      // Statistiques globales
      const totalProjects = fakeDB.projects.length;
      const activeProjects = fakeDB.projects.filter(p => p.status === 'in_progress').length;
      const completedProjects = fakeDB.projects.filter(p => p.status === 'completed').length;
      
      const totalTasks = fakeDB.tasks.length;
      const completedTasks = fakeDB.tasks.filter(t => t.status === 'completed').length;
      const overdueTasks = fakeDB.tasks.filter(t => 
        new Date(t.dueDate) < new Date() && t.status !== 'completed'
      );
      
      return ApiResponse.success({
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
          completionRate: totalProjects > 0 ? 
            Math.round((completedProjects / totalProjects) * 100) : 0
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          overdue: overdueTasks,
          completionRate: totalTasks > 0 ? 
            Math.round((completedTasks / totalTasks) * 100) : 0
        },
        performance: fakeDB.metrics.performance
      });
    }
  }

  async getUserStatistics(userId) {
    const user = fakeDB.users.find(u => u.id === parseInt(userId));
    if (!user) {
      return ApiResponse.error('Utilisateur non trouvé');
    }
    
    const assignedTasks = fakeDB.tasks.filter(t => t.assignee === parseInt(userId));
    const completedTasks = assignedTasks.filter(t => t.status === 'completed');
    const overdueTasks = assignedTasks.filter(t => 
      new Date(t.dueDate) < new Date() && t.status !== 'completed'
    );
    
    const managedProjects = fakeDB.projects.filter(p => p.manager === parseInt(userId));
    
    return ApiResponse.success({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        joinDate: user.joinDate,
        lastLogin: user.lastLogin
      },
      tasks: {
        total: assignedTasks.length,
        completed: completedTasks.length,
        inProgress: assignedTasks.filter(t => t.status === 'in_progress').length,
        overdue: overdueTasks.length,
        completionRate: assignedTasks.length > 0 ? 
          Math.round((completedTasks.length / assignedTasks.length) * 100) : 0
      },
      projects: {
        managed: managedProjects.length,
        participating: fakeDB.projects.filter(p => 
          p.team.includes(parseInt(userId))
        ).length
      },
      productivity: {
        averageTaskCompletion: assignedTasks.length > 0 ?
          assignedTasks.reduce((sum, t) => sum + (t.actualTime || 0), 0) / assignedTasks.length : 0,
        onTimeDelivery: assignedTasks.length > 0 ?
          Math.round(((assignedTasks.length - overdueTasks.length) / assignedTasks.length) * 100) : 0
      }
    });
  }
}

// Instance singleton du service API
const apiService = new ApiService();

// Export des méthodes principales
export default apiService;

// Export des classes et utilitaires pour les tests
export { ApiService, ApiResponse, API_CONFIG };
