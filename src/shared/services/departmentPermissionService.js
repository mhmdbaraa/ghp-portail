import djangoApiService from './djangoApiService';

class DepartmentPermissionService {
  /**
   * Get all users with their department permissions
   */
  async getUsersWithPermissions() {
    try {
      const response = await djangoApiService.get('/authentication/department-permissions/by-user/');
      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'Users with permissions retrieved successfully'
        };
      } else {
        return {
          success: false,
          error: `HTTP ${response.status}`,
          message: 'Failed to fetch users with permissions'
        };
      }
    } catch (error) {
      console.error('Error fetching users with permissions:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch users with permissions'
      };
    }
  }

  /**
   * Get department permissions for a specific user
   */
  async getUserPermissions(userId) {
    try {
      const response = await djangoApiService.get(`/authentication/department-permissions/?user_id=${userId}`);
      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'User permissions retrieved successfully'
        };
      } else {
        return {
          success: false,
          error: `HTTP ${response.status}`,
          message: 'Failed to fetch user permissions'
        };
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch user permissions'
      };
    }
  }

  /**
   * Update department permissions for a user
   */
  async updateUserPermissions(userId, permissions) {
    try {
      const response = await djangoApiService.post('/authentication/department-permissions/bulk-update/', {
        user_id: userId,
        permissions: permissions
      });
      return {
        success: true,
        data: response.data,
        message: 'User permissions updated successfully'
      };
    } catch (error) {
      console.error('Error updating user permissions:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to update user permissions'
      };
    }
  }

  /**
   * Clear all department permissions for a user
   */
  async clearUserPermissions(userId) {
    try {
      const response = await djangoApiService.delete('/authentication/department-permissions/clear-user/', {
        user_id: userId
      });
      return {
        success: true,
        data: response.data,
        message: 'User permissions cleared successfully'
      };
    } catch (error) {
      console.error('Error clearing user permissions:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to clear user permissions'
      };
    }
  }

  /**
   * Create a single department permission
   */
  async createPermission(permissionData) {
    try {
      const response = await djangoApiService.post('/authentication/department-permissions/', permissionData);
      return {
        success: true,
        data: response.data,
        message: 'Permission created successfully'
      };
    } catch (error) {
      console.error('Error creating permission:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to create permission'
      };
    }
  }

  /**
   * Update a single department permission
   */
  async updatePermission(permissionId, permissionData) {
    try {
      const response = await djangoApiService.put(`/authentication/department-permissions/${permissionId}/`, permissionData);
      return {
        success: true,
        data: response.data,
        message: 'Permission updated successfully'
      };
    } catch (error) {
      console.error('Error updating permission:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to update permission'
      };
    }
  }

  /**
   * Delete a department permission
   */
  async deletePermission(permissionId) {
    try {
      await djangoApiService.delete(`/authentication/department-permissions/${permissionId}/`);
      return {
        success: true,
        message: 'Permission deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting permission:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete permission'
      };
    }
  }
}

const departmentPermissionService = new DepartmentPermissionService();
export default departmentPermissionService;
