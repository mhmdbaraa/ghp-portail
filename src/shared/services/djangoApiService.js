// Django API Service - Real API calls to Django backend
import axiosInstance from './axiosInstance';

class DjangoApiService {
  constructor() {
    this.baseURL = '/api';
  }

  // Generic HTTP methods
  async get(url) {
    try {
      const response = await axiosInstance.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async post(url, data) {
    try {
      const response = await axiosInstance.post(url, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async put(url, data) {
    try {
      const response = await axiosInstance.put(url, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async patch(url, data) {
    try {
      const response = await axiosInstance.patch(url, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async delete(url) {
    try {
      const response = await axiosInstance.delete(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Authentication methods
  async login(credentials) {
    try {
      const response = await axiosInstance.post('/auth/login/', credentials);
      return {
        success: true,
        data: response.data,
        message: 'Login successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Login failed'
      };
    }
  }

  async register(userData) {
    try {
      const response = await axiosInstance.post('/auth/register/', userData);
      return {
        success: true,
        data: response.data,
        message: 'Registration successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Registration failed'
      };
    }
  }

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await axiosInstance.post('/auth/refresh/', {
        refresh: refreshToken
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Token refreshed'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Token refresh failed'
      };
    }
  }

  async logout() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await axiosInstance.post('/auth/logout/', {
          refresh_token: refreshToken
        });
      }
      
      // Clear tokens from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      // Even if logout fails, clear local tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      return {
        success: true,
        message: 'Logout completed'
      };
    }
  }

  // Dashboard methods
  async getDashboard() {
    try {
      const response = await axiosInstance.get('/projects/dashboard/');
      return {
        success: true,
        data: response.data.data,
        message: 'Dashboard data retrieved'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        message: 'Failed to load dashboard data'
      };
    }
  }

  // Projects methods
  async getProjects(id = null, page = 1, pageSize = 20) {
    try {
      const url = id ? `/projects/${id}/` : '/projects/';
      const params = new URLSearchParams();
      if (!id) {
        params.append('page', page);
        params.append('page_size', pageSize);
      }
      const fullUrl = params.toString() ? `${url}?${params.toString()}` : url;
      
      // Removed console.log to eliminate perceived "reload" feeling
      
      const response = await axiosInstance.get(fullUrl);
      
      return {
        success: true,
        data: response.data,
        message: 'Projects retrieved'
      };
    } catch (error) {
      console.error('API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to load projects'
      };
    }
  }

  async createProject(projectData) {
    try {
      // Removed console.log to eliminate perceived "reload" feeling
      
      const response = await axiosInstance.post('/projects/', projectData);
      return {
        success: true,
        data: response.data,
        message: 'Project created successfully'
      };
    } catch (error) {
      // Removed console.log to eliminate perceived "reload" feeling
      
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to create project'
      };
    }
  }

  async updateProject(id, projectData) {
    try {
      const response = await axiosInstance.put(`/projects/${id}/`, projectData);
      return {
        success: true,
        data: response.data,
        message: 'Project updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to update project'
      };
    }
  }

  async patchProject(id, projectData) {
    try {
      const response = await axiosInstance.patch(`/projects/${id}/`, projectData);
      return {
        success: true,
        data: response.data,
        message: 'Project updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to update project'
      };
    }
  }

  async deleteProject(id) {
    try {
      await axiosInstance.delete(`/projects/${id}/`);
      return {
        success: true,
        message: 'Project deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to delete project'
      };
    }
  }

  // Tasks methods (now under projects endpoint)
  async getTasks(id = null) {
    try {
      const url = id ? `/projects/tasks/${id}/` : '/projects/tasks/';
      const response = await axiosInstance.get(url);
      return {
        success: true,
        data: response.data,
        message: 'Tasks retrieved'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to load tasks'
      };
    }
  }

  async createTask(taskData) {
    try {
      const response = await axiosInstance.post('/projects/tasks/', taskData);
      return {
        success: true,
        data: response.data,
        message: 'Task created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to create task'
      };
    }
  }

  async updateTask(id, taskData) {
    try {
      const response = await axiosInstance.put(`/projects/tasks/${id}/`, taskData);
      return {
        success: true,
        data: response.data,
        message: 'Task updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to update task'
      };
    }
  }

  async patchTask(id, taskData) {
    try {
      const response = await axiosInstance.patch(`/projects/tasks/${id}/`, taskData);
      return {
        success: true,
        data: response.data,
        message: 'Task updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to update task'
      };
    }
  }

  async deleteTask(id) {
    try {
      await axiosInstance.delete(`/projects/tasks/${id}/`);
      return {
        success: true,
        message: 'Task deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to delete task'
      };
    }
  }

  // Task-specific actions
  async assignTask(id, userId) {
    try {
      const response = await axiosInstance.post(`/projects/tasks/${id}/assign/`, {
        user_id: userId
      });
      return {
        success: true,
        data: response.data,
        message: 'Task assigned successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to assign task'
      };
    }
  }

  async changeTaskStatus(id, status) {
    try {
      const response = await axiosInstance.post(`/projects/tasks/${id}/change_status/`, {
        status: status
      });
      return {
        success: true,
        data: response.data,
        message: 'Task status updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to update task status'
      };
    }
  }

  // Task comments
  async getTaskComments(taskId) {
    try {
      const response = await axiosInstance.get(`/projects/tasks/${taskId}/comments/`);
      return {
        success: true,
        data: response.data,
        message: 'Task comments retrieved'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to load task comments'
      };
    }
  }

  async createTaskComment(taskId, commentData) {
    try {
      const response = await axiosInstance.post(`/projects/tasks/${taskId}/comments/`, commentData);
      return {
        success: true,
        data: response.data,
        message: 'Comment created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to create comment'
      };
    }
  }

  // Task attachments
  async getTaskAttachments(taskId) {
    try {
      const response = await axiosInstance.get(`/projects/tasks/${taskId}/attachments/`);
      return {
        success: true,
        data: response.data,
        message: 'Task attachments retrieved'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to load task attachments'
      };
    }
  }

  async createTaskAttachment(taskId, attachmentData) {
    try {
      const response = await axiosInstance.post(`/projects/tasks/${taskId}/attachments/`, attachmentData);
      return {
        success: true,
        data: response.data,
        message: 'Attachment uploaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to upload attachment'
      };
    }
  }

  // Time entries
  async getTaskTimeEntries(taskId) {
    try {
      const response = await axiosInstance.get(`/projects/tasks/${taskId}/time-entries/`);
      return {
        success: true,
        data: response.data,
        message: 'Time entries retrieved'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to load time entries'
      };
    }
  }

  async createTaskTimeEntry(taskId, timeEntryData) {
    try {
      const response = await axiosInstance.post(`/projects/tasks/${taskId}/time-entries/`, timeEntryData);
      return {
        success: true,
        data: response.data,
        message: 'Time entry created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to create time entry'
      };
    }
  }

  // User methods
  async getUserProfile() {
    try {
      const response = await axiosInstance.get('/auth/user-info/');
      return {
        success: true,
        data: response.data,
        message: 'User profile retrieved'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to load user profile'
      };
    }
  }

  async updateUserProfile(userData) {
    try {
      const response = await axiosInstance.put('/auth/profile/', userData);
      return {
        success: true,
        data: response.data,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to update profile'
      };
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await axiosInstance.post('/auth/change-password/', passwordData);
      return {
        success: true,
        data: response.data,
        message: 'Password changed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to change password'
      };
    }
  }

  // Search and filter methods
  async searchProjects(query, filters = {}) {
    try {
      const params = new URLSearchParams();
      if (query) params.append('search', query);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.category) params.append('category', filters.category);
      if (filters.manager) params.append('manager', filters.manager);
      if (filters.sort) params.append('ordering', filters.sort);
      
      // Add pagination parameters to get all projects
      params.append('page_size', '1000'); // Large page size to get all projects
      params.append('page', '1');

      const response = await axiosInstance.get(`/projects/?${params.toString()}`);
      return {
        success: true,
        data: response.data,
        message: 'Projects search completed'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to search projects'
      };
    }
  }

  // Get all projects by fetching multiple pages
  async getAllProjects(filters = {}) {
    try {
      // Removed console.log to eliminate perceived "reload" feeling
      
      const allProjects = [];
      let currentPage = 1;
      let hasMorePages = true;
      const pageSize = 20; // Use the backend's default page size
      
      while (hasMorePages) {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.priority) params.append('priority', filters.priority);
        if (filters.category) params.append('category', filters.category);
        if (filters.manager) params.append('manager', filters.manager);
        if (filters.sort) params.append('ordering', filters.sort);
        
        params.append('page', currentPage);
        params.append('page_size', pageSize);

        const url = `/projects/?${params.toString()}`;
        
        const response = await axiosInstance.get(url);
        
        if (response.data.results && response.data.results.length > 0) {
          allProjects.push(...response.data.results);
          
          // Check if there are more pages
          if (response.data.next && response.data.results.length === pageSize) {
            currentPage++;
          } else {
            hasMorePages = false;
          }
        } else {
          hasMorePages = false;
        }
        
        // Safety check to prevent infinite loops
        if (currentPage > 100) {
          break;
        }
      }
      
      return {
        success: true,
        data: {
          results: allProjects,
          count: allProjects.length,
          next: null,
          previous: null
        },
        message: `All ${allProjects.length} projects retrieved successfully`
      };
    } catch (error) {
      // Removed console.log to eliminate perceived "reload" feeling
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to retrieve all projects'
      };
    }
  }

  async searchTasks(query, filters = {}) {
    try {
      const params = new URLSearchParams();
      if (query) params.append('search', query);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.task_type) params.append('task_type', filters.task_type);
      if (filters.project) params.append('project', filters.project);
      if (filters.assignee) params.append('assignee', filters.assignee);
      if (filters.sort) params.append('ordering', filters.sort);

      const response = await axiosInstance.get(`/projects/tasks/?${params.toString()}`);
      return {
        success: true,
        data: response.data,
        message: 'Tasks search completed'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to search tasks'
      };
    }
  }

  // Statistics methods
  async getProjectStatistics(projectId = null) {
    try {
      const url = projectId ? `/projects/${projectId}/statistics/` : '/projects/statistics/';
      const response = await axiosInstance.get(url);
      return {
        success: true,
        data: response.data,
        message: 'Project statistics retrieved'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to load project statistics'
      };
    }
  }

  async getTaskStatistics() {
    try {
      const response = await axiosInstance.get('/projects/task-statistics/');
      return {
        success: true,
        data: response.data,
        message: 'Task statistics retrieved'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to load task statistics'
      };
    }
  }

  // Utility methods
  async isAuthenticated() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return false;
      
      // Try to get user info to verify token
      const response = await this.getUserProfile();
      return response.success;
    } catch (error) {
      return false;
    }
  }

  getAuthToken() {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  setAuthTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearAuthTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

// Create singleton instance
const djangoApiService = new DjangoApiService();

export default djangoApiService;