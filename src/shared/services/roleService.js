import djangoApiService from './djangoApiService';

class RoleService {
  constructor() {
    this.baseURL = '/authentication/roles/';
  }

  // Get all roles
  async getRoles(params = {}) {
    try {
      const response = await djangoApiService.get(this.baseURL, { params });
      return {
        success: true,
        data: response.data,
        message: 'Roles retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to retrieve roles'
      };
    }
  }

  // Get role by ID
  async getRole(id) {
    try {
      const response = await djangoApiService.get(`${this.baseURL}${id}/`);
      return {
        success: true,
        data: response.data,
        message: 'Role retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to retrieve role'
      };
    }
  }

  // Create new role
  async createRole(roleData) {
    try {
      const response = await djangoApiService.post(this.baseURL, roleData);
      return {
        success: true,
        data: response.data,
        message: 'Role created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to create role'
      };
    }
  }

  // Update role
  async updateRole(id, roleData) {
    try {
      const response = await djangoApiService.put(`${this.baseURL}${id}/`, roleData);
      return {
        success: true,
        data: response.data,
        message: 'Role updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to update role'
      };
    }
  }

  // Delete role
  async deleteRole(id) {
    try {
      await djangoApiService.delete(`${this.baseURL}${id}/`);
      return {
        success: true,
        message: 'Role deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to delete role'
      };
    }
  }

  // Get role permissions
  async getRolePermissions(roleId) {
    try {
      const response = await djangoApiService.get(`${this.baseURL}${roleId}/permissions/`);
      return {
        success: true,
        data: response.data,
        message: 'Role permissions retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to retrieve role permissions'
      };
    }
  }

  // Assign permissions to role
  async assignPermissionsToRole(roleId, permissionIds) {
    try {
      const response = await djangoApiService.post(`${this.baseURL}${roleId}/permissions/assign/`, {
        permissions: permissionIds
      });
      return {
        success: true,
        data: response.data,
        message: 'Permissions assigned to role successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to assign permissions to role'
      };
    }
  }

  // Add permission to role
  async addPermissionToRole(roleId, permissionId) {
    try {
      const response = await djangoApiService.post(`${this.baseURL}${roleId}/permissions/${permissionId}/add/`);
      return {
        success: true,
        data: response.data,
        message: 'Permission added to role successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to add permission to role'
      };
    }
  }

  // Remove permission from role
  async removePermissionFromRole(roleId, permissionId) {
    try {
      const response = await djangoApiService.delete(`${this.baseURL}${roleId}/permissions/${permissionId}/remove/`);
      return {
        success: true,
        data: response.data,
        message: 'Permission removed from role successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to remove permission from role'
      };
    }
  }

  // Get role users
  async getRoleUsers(roleId) {
    try {
      const response = await djangoApiService.get(`${this.baseURL}${roleId}/users/`);
      return {
        success: true,
        data: response.data,
        message: 'Role users retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to retrieve role users'
      };
    }
  }

  // Assign role to user
  async assignRoleToUser(roleId, userId) {
    try {
      const response = await djangoApiService.post(`${this.baseURL}${roleId}/assign/`, {
        user_id: userId
      });
      return {
        success: true,
        data: response.data,
        message: 'Role assigned to user successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to assign role to user'
      };
    }
  }

  // Remove role from user
  async removeRoleFromUser(roleId, userId) {
    try {
      const response = await djangoApiService.post(`${this.baseURL}${roleId}/remove/`, {
        user_id: userId
      });
      return {
        success: true,
        data: response.data,
        message: 'Role removed from user successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to remove role from user'
      };
    }
  }

  // Get role statistics
  async getRoleStats() {
    try {
      const response = await djangoApiService.get(`${this.baseURL}statistics/`);
      return {
        success: true,
        data: response.data,
        message: 'Role statistics retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to retrieve role statistics'
      };
    }
  }

  // Clone role
  async cloneRole(roleId, newName, newDescription) {
    try {
      const response = await djangoApiService.post(`${this.baseURL}${roleId}/clone/`, {
        name: newName,
        description: newDescription
      });
      return {
        success: true,
        data: response.data,
        message: 'Role cloned successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to clone role'
      };
    }
  }
}

export default new RoleService();