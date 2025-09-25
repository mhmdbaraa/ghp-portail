// Dashboard Service - Handles all dashboard-related API calls
import djangoApiService from './djangoApiService';

class DashboardService {
  /**
   * Get comprehensive dashboard data
   */
  async getDashboard() {
    try {
      const response = await djangoApiService.getDashboard();
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Dashboard data retrieved successfully'
        };
      } else {
        return {
          success: false,
          error: response.error,
          message: 'Failed to retrieve dashboard data'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error retrieving dashboard data'
      };
    }
  }

  /**
   * Get project statistics
   */
  async getProjectStatistics(projectId = null) {
    try {
      const response = await djangoApiService.getProjectStatistics(projectId);
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Project statistics retrieved successfully'
        };
      } else {
        return {
          success: false,
          error: response.error,
          message: 'Failed to retrieve project statistics'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error retrieving project statistics'
      };
    }
  }

  /**
   * Get task statistics
   */
  async getTaskStatistics() {
    try {
      const response = await djangoApiService.getTaskStatistics();
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Task statistics retrieved successfully'
        };
      } else {
        return {
          success: false,
          error: response.error,
          message: 'Failed to retrieve task statistics'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error retrieving task statistics'
      };
    }
  }

  /**
   * Get combined dashboard metrics
   */
  async getDashboardMetrics() {
    try {
      // Get both project and task statistics
      const [projectStatsResponse, taskStatsResponse] = await Promise.all([
        this.getProjectStatistics(),
        this.getTaskStatistics()
      ]);

      const metrics = {
        projects: projectStatsResponse.success ? projectStatsResponse.data : null,
        tasks: taskStatsResponse.success ? taskStatsResponse.data : null,
        errors: []
      };

      if (!projectStatsResponse.success) {
        metrics.errors.push('Failed to load project statistics');
      }

      if (!taskStatsResponse.success) {
        metrics.errors.push('Failed to load task statistics');
      }

      return {
        success: metrics.errors.length === 0,
        data: metrics,
        message: metrics.errors.length === 0 ? 'Dashboard metrics retrieved successfully' : 'Some metrics failed to load'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error retrieving dashboard metrics'
      };
    }
  }
}

// Create singleton instance
const dashboardService = new DashboardService();

export default dashboardService;
