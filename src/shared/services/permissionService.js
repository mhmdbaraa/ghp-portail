import djangoApiService from './djangoApiService';

class PermissionService {
  constructor() {
    this.baseURL = '/auth/permissions/';
  }

  // Get all permissions
  async getPermissions(params = {}) {
    try {
      const response = await djangoApiService.get(this.baseURL, { params });
      return {
        success: true,
        data: response.data,
        message: 'Permissions retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to retrieve permissions'
      };
    }
  }

  // Get permission by ID
  async getPermission(id) {
    try {
      const response = await djangoApiService.get(`${this.baseURL}${id}/`);
      return {
        success: true,
        data: response.data,
        message: 'Permission retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to retrieve permission'
      };
    }
  }

  // Create new permission
  async createPermission(permissionData) {
    try {
      const response = await djangoApiService.post(this.baseURL, permissionData);
      return {
        success: true,
        data: response.data,
        message: 'Permission created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to create permission'
      };
    }
  }

  // Update permission
  async updatePermission(id, permissionData) {
    try {
      const response = await djangoApiService.put(`${this.baseURL}${id}/`, permissionData);
      return {
        success: true,
        data: response.data,
        message: 'Permission updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to update permission'
      };
    }
  }

  // Delete permission
  async deletePermission(id) {
    try {
      await djangoApiService.delete(`${this.baseURL}${id}/`);
      return {
        success: true,
        message: 'Permission deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to delete permission'
      };
    }
  }

  // Toggle permission status
  async togglePermissionStatus(id) {
    try {
      const response = await djangoApiService.patch(`${this.baseURL}${id}/toggle/`);
      return {
        success: true,
        data: response.data,
        message: 'Permission status updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to update permission status'
      };
    }
  }

  // Get permissions by category
  async getPermissionsByCategory(category) {
    try {
      const response = await djangoApiService.get(`${this.baseURL}category/${category}/`);
      return {
        success: true,
        data: response.data,
        message: 'Category permissions retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to retrieve category permissions'
      };
    }
  }

  // Get permission statistics
  async getPermissionStats() {
    try {
      const response = await djangoApiService.get(`${this.baseURL}/statistics/`);
      return {
        success: true,
        data: response.data,
        message: 'Permission statistics retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to retrieve permission statistics'
      };
    }
  }
}

export default new PermissionService();
