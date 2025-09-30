import axiosInstance from './axiosInstance';

const roleService = {
  // Get all roles
  getRoles: async () => {
    try {
      const response = await axiosInstance.get('/authentication/roles/');
      return {
        success: true,
        data: response.data.results || response.data,
        message: 'Roles retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching roles:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to retrieve roles'
      };
    }
  },

  // Get role by ID
  getRole: async (id) => {
    try {
      const response = await axiosInstance.get(`/authentication/roles/${id}/`);
      return {
        success: true,
        data: response.data,
        message: 'Role retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching role:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to retrieve role'
      };
    }
  },

  // Create new role
  createRole: async (roleData) => {
    try {
      const response = await axiosInstance.post('/authentication/roles/', roleData);
      return {
        success: true,
        data: response.data,
        message: 'Role created successfully'
      };
    } catch (error) {
      console.error('Error creating role:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to create role'
      };
    }
  },

  // Update role
  updateRole: async (id, roleData) => {
    try {
      const response = await axiosInstance.put(`/authentication/roles/${id}/`, roleData);
      return {
        success: true,
        data: response.data,
        message: 'Role updated successfully'
      };
    } catch (error) {
      console.error('Error updating role:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to update role'
      };
    }
  },

  // Delete role
  deleteRole: async (id) => {
    try {
      const response = await axiosInstance.delete(`/authentication/roles/${id}/`);
      return {
        success: true,
        data: response.data,
        message: 'Role deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting role:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        message: 'Failed to delete role'
      };
    }
  },

  // Get role permissions
  getRolePermissions: async (id) => {
    try {
      const response = await axiosInstance.get(`/authentication/roles/${id}/permissions/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      throw error;
    }
  },

  // Update role permissions
  updateRolePermissions: async (id, permissions) => {
    try {
      const response = await axiosInstance.put(`/authentication/roles/${id}/permissions/update/`, {
        permissions
      });
      return response.data;
    } catch (error) {
      console.error('Error updating role permissions:', error);
      throw error;
    }
  },

  // Get users with specific role
  getRoleUsers: async (id) => {
    try {
      const response = await axiosInstance.get(`/authentication/roles/${id}/users/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role users:', error);
      throw error;
    }
  },

  // Assign role to user
  assignRoleToUser: async (roleId, userId) => {
    try {
      const response = await axiosInstance.post(`/authentication/roles/${roleId}/assign/`, {
        user_id: userId
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning role to user:', error);
      throw error;
    }
  },

  // Remove role from user
  removeRoleFromUser: async (roleId, userId) => {
    try {
      const response = await axiosInstance.post(`/authentication/roles/${roleId}/remove/`, {
        user_id: userId
      });
      return response.data;
    } catch (error) {
      console.error('Error removing role from user:', error);
      throw error;
    }
  },

  // Get role statistics
  getRoleStatistics: async () => {
    try {
      const response = await axiosInstance.get('/authentication/roles/statistics/');
      return response.data;
    } catch (error) {
      console.error('Error fetching role statistics:', error);
      throw error;
    }
  },

  // Clone role
  cloneRole: async (id, newRoleData) => {
    try {
      const response = await axiosInstance.post(`/authentication/roles/${id}/clone/`, newRoleData);
      return response.data;
    } catch (error) {
      console.error('Error cloning role:', error);
      throw error;
    }
  }
};

export default roleService;