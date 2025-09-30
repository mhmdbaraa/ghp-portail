// User Service - API calls for user management
import djangoApiService from './djangoApiService';

class UserService {
  constructor() {
    this.baseURL = '/authentication/users';
  }

  // Get all users with pagination and filters
  async getUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.pageSize) queryParams.append('page_size', params.pageSize);
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.role) queryParams.append('role', params.role);
      if (params.department) queryParams.append('department', params.department);
      if (params.sort) queryParams.append('ordering', params.sort);

      const url = `${this.baseURL}/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await djangoApiService.get(url);
      
      return {
        success: true,
        data: response.data,
        message: 'Users retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to retrieve users'
      };
    }
  }

  // Get user by ID
  async getUser(id) {
    try {
      const response = await djangoApiService.get(`${this.baseURL}/${id}/`);
      return {
        success: true,
        data: response.data,
        message: 'User retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to retrieve user'
      };
    }
  }

  // Get user by ID (alias)
  async getUserById(id) {
    return this.getUser(id);
  }

  // Create new user
  async createUser(userData) {
    try {
      const response = await djangoApiService.post(`${this.baseURL}/`, userData);
      return {
        success: true,
        data: response.data,
        message: 'User created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to create user'
      };
    }
  }

  // Update user
  async updateUser(id, userData) {
    try {
      console.log('Updating user with ID:', id, 'Data:', userData);
      const response = await djangoApiService.put(`${this.baseURL}/${id}/`, userData);
      return {
        success: true,
        data: response.data,
        message: 'User updated successfully'
      };
    } catch (error) {
      console.error('User update error:', error);
      console.error('Error response:', error.response?.data);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to update user'
      };
    }
  }

  // Partial update user
  async patchUser(id, userData) {
    try {
      const response = await djangoApiService.patch(`${this.baseURL}/${id}/`, userData);
      return {
        success: true,
        data: response.data,
        message: 'User updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to update user'
      };
    }
  }

  // Delete user
  async deleteUser(id) {
    try {
      await djangoApiService.delete(`${this.baseURL}/${id}/`);
      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to delete user'
      };
    }
  }

  // Toggle user status (active/inactive)
  async toggleUserStatus(id) {
    try {
      const response = await djangoApiService.post(`${this.baseURL}/${id}/toggle-status/`);
      return {
        success: true,
        data: response.data,
        message: 'User status updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to update user status'
      };
    }
  }

  // Get user statistics
  async getUserStats() {
    try {
      const response = await djangoApiService.get(`${this.baseURL}/stats/`);
      return {
        success: true,
        data: response.data,
        message: 'User statistics retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to retrieve user statistics'
      };
    }
  }

  // Get recent users
  async getRecentUsers(limit = 5) {
    try {
      const response = await djangoApiService.get(`${this.baseURL}/recent/?limit=${limit}`);
      return {
        success: true,
        data: response.data,
        message: 'Recent users retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to retrieve recent users'
      };
    }
  }

  // Get user permissions
  async getUserPermissions(id) {
    try {
      const response = await djangoApiService.get(`${this.baseURL}/${id}/permissions/`);
      return {
        success: true,
        data: response.data,
        message: 'User permissions retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to retrieve user permissions'
      };
    }
  }

  // Update user permissions
  async updateUserPermissions(id, permissions) {
    try {
      const response = await djangoApiService.put(`${this.baseURL}/${id}/permissions/`, { permissions });
      return {
        success: true,
        data: response.data,
        message: 'User permissions updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to update user permissions'
      };
    }
  }

  // Get user roles
  async getUserRoles(id) {
    try {
      const response = await djangoApiService.get(`${this.baseURL}/${id}/roles/`);
      return {
        success: true,
        data: response.data,
        message: 'User roles retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to retrieve user roles'
      };
    }
  }

  // Update user roles
  async updateUserRoles(id, roles) {
    try {
      const response = await djangoApiService.put(`${this.baseURL}/${id}/roles/`, { roles });
      return {
        success: true,
        data: response.data,
        message: 'User roles updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to update user roles'
      };
    }
  }

  // Search users
  async searchUsers(query, filters = {}) {
    try {
      const params = new URLSearchParams();
      params.append('search', query);
      
      if (filters.status) params.append('status', filters.status);
      if (filters.role) params.append('role', filters.role);
      if (filters.department) params.append('department', filters.department);
      if (filters.sort) params.append('ordering', filters.sort);

      const response = await djangoApiService.get(`${this.baseURL}/search/?${params.toString()}`);
      return {
        success: true,
        data: response.data,
        message: 'User search completed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to search users'
      };
    }
  }

  // Bulk operations
  async bulkUpdateUsers(userIds, updateData) {
    try {
      const response = await djangoApiService.post(`${this.baseURL}/bulk-update/`, {
        user_ids: userIds,
        update_data: updateData
      });
      return {
        success: true,
        data: response.data,
        message: 'Users updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to update users'
      };
    }
  }

  async bulkDeleteUsers(userIds) {
    try {
      const response = await djangoApiService.post(`${this.baseURL}/bulk-delete/`, {
        user_ids: userIds
      });
      return {
        success: true,
        data: response.data,
        message: 'Users deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to delete users'
      };
    }
  }

  // Export users
  async exportUsers(format = 'csv', filters = {}) {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (filters.status) params.append('status', filters.status);
      if (filters.role) params.append('role', filters.role);
      if (filters.department) params.append('department', filters.department);

      const response = await djangoApiService.get(`${this.baseURL}/export/?${params.toString()}`, {
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Users exported successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to export users'
      };
    }
  }

  // Get user statistics for dashboard
  async getUserStats() {
    try {
      const response = await djangoApiService.get('/authentication/users/statistics/');
      return {
        success: true,
        data: response.data.data,
        message: 'User statistics retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to retrieve user statistics'
      };
    }
  }

  // Get recent users for dashboard
  async getRecentUsers() {
    try {
      const response = await djangoApiService.get('/authentication/users/recent/');
      return {
        success: true,
        data: response.data.data,
        message: 'Recent users retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to retrieve recent users'
      };
    }
  }
}

// Create singleton instance
const userService = new UserService();

export default userService;
