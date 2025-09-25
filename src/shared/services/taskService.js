// Task Service - Handles all task-related API calls with data transformation
import djangoApiService from './djangoApiService';

class TaskService {
  /**
   * Get all tasks with optional filtering
   */
  async getTasks(filters = {}) {
    try {
      const response = await djangoApiService.searchTasks('', filters);
      
      if (response.success) {
        const tasks = response.data.results || response.data;
        
        return {
          success: true,
          data: tasks,
          message: 'Tasks retrieved successfully'
        };
      } else {
        return {
          success: false,
          error: response.error,
          message: 'Failed to retrieve tasks'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error retrieving tasks'
      };
    }
  }

  /**
   * Get a single task by ID
   */
  async getTask(id) {
    try {
      const response = await djangoApiService.getTasks(id);
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Task retrieved successfully'
        };
      } else {
        return {
          success: false,
          error: response.error,
          message: 'Failed to retrieve task'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error retrieving task'
      };
    }
  }

  /**
   * Create a new task
   */
  async createTask(taskData) {
    try {
      console.log('=== TASK SERVICE CREATE ===');
      console.log('Input taskData:', taskData);
      
      const response = await djangoApiService.createTask(taskData);
      console.log('Django API response:', response);
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Task created successfully'
        };
      } else {
        console.error('API creation failed:', response.error);
        return {
          success: false,
          error: response.error,
          message: 'Failed to create task'
        };
      }
    } catch (error) {
      console.error('Exception in createTask:', error);
      return {
        success: false,
        error: error.message,
        message: 'Error creating task'
      };
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(id, taskData) {
    try {
      // For partial updates, use PATCH
      // For full updates, use PUT
      let response;
      
      if (Object.keys(taskData).length === 1) {
        // Partial update - use PATCH
        console.log('Using PATCH for partial update:', taskData);
        response = await djangoApiService.patchTask(id, taskData);
      } else {
        // Full task data - use PUT
        console.log('Using PUT for full update:', taskData);
        response = await djangoApiService.updateTask(id, taskData);
      }
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Task updated successfully'
        };
      } else {
        return {
          success: false,
          error: response.error,
          message: 'Failed to update task'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error updating task'
      };
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(id) {
    try {
      const response = await djangoApiService.deleteTask(id);
      
      if (response.success) {
        return {
          success: true,
          message: 'Task deleted successfully'
        };
      } else {
        return {
          success: false,
          error: response.error,
          message: 'Failed to delete task'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error deleting task'
      };
    }
  }

  /**
   * Assign a task to a user
   */
  async assignTask(id, userId) {
    try {
      const response = await djangoApiService.assignTask(id, userId);
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Task assigned successfully'
        };
      } else {
        return {
          success: false,
          error: response.error,
          message: 'Failed to assign task'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error assigning task'
      };
    }
  }

  /**
   * Change task status
   */
  async changeTaskStatus(id, status) {
    try {
      const response = await djangoApiService.changeTaskStatus(id, status);
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Task status updated successfully'
        };
      } else {
        return {
          success: false,
          error: response.error,
          message: 'Failed to update task status'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error updating task status'
      };
    }
  }

  /**
   * Search tasks with filters
   */
  async searchTasks(query, filters = {}) {
    try {
      const response = await djangoApiService.searchTasks(query, filters);
      
      if (response.success) {
        const tasks = response.data.results || response.data;
        
        return {
          success: true,
          data: tasks,
          message: 'Tasks search completed'
        };
      } else {
        return {
          success: false,
          error: response.error,
          message: 'Failed to search tasks'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error searching tasks'
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
          message: 'Task statistics retrieved'
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
   * Get task comments
   */
  async getTaskComments(taskId) {
    try {
      const response = await djangoApiService.getTaskComments(taskId);
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Task comments retrieved'
        };
      } else {
        return {
          success: false,
          error: response.error,
          message: 'Failed to retrieve task comments'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error retrieving task comments'
      };
    }
  }

  /**
   * Create a task comment
   */
  async createTaskComment(taskId, commentData) {
    try {
      const response = await djangoApiService.createTaskComment(taskId, commentData);
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Comment created successfully'
        };
      } else {
        return {
          success: false,
          error: response.error,
          message: 'Failed to create comment'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error creating comment'
      };
    }
  }

  /**
   * Get task attachments
   */
  async getTaskAttachments(taskId) {
    try {
      const response = await djangoApiService.getTaskAttachments(taskId);
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Task attachments retrieved'
        };
      } else {
        return {
          success: false,
          error: response.error,
          message: 'Failed to retrieve task attachments'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error retrieving task attachments'
      };
    }
  }

  /**
   * Create a task attachment
   */
  async createTaskAttachment(taskId, attachmentData) {
    try {
      const response = await djangoApiService.createTaskAttachment(taskId, attachmentData);
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Attachment uploaded successfully'
        };
      } else {
        return {
          success: false,
          error: response.error,
          message: 'Failed to upload attachment'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error uploading attachment'
      };
    }
  }

  /**
   * Get task time entries
   */
  async getTaskTimeEntries(taskId) {
    try {
      const response = await djangoApiService.getTaskTimeEntries(taskId);
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Time entries retrieved'
        };
      } else {
        return {
          success: false,
          error: response.error,
          message: 'Failed to retrieve time entries'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error retrieving time entries'
      };
    }
  }

  /**
   * Create a task time entry
   */
  async createTaskTimeEntry(taskId, timeEntryData) {
    try {
      const response = await djangoApiService.createTaskTimeEntry(taskId, timeEntryData);
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Time entry created successfully'
        };
      } else {
        return {
          success: false,
          error: response.error,
          message: 'Failed to create time entry'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error creating time entry'
      };
    }
  }

  /**
   * Get available task statuses
   */
  getAvailableStatuses() {
    return [
      { value: 'not_started', label: 'Not Started' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'on_hold', label: 'On Hold' },
      { value: 'cancelled', label: 'Cancelled' }
    ];
  }

  /**
   * Get available task priorities
   */
  getAvailablePriorities() {
    return [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'critical', label: 'Critical' }
    ];
  }

  /**
   * Get available task types
   */
  getAvailableTaskTypes() {
    return [
      { value: 'bug', label: 'Bug' },
      { value: 'feature', label: 'Feature' },
      { value: 'improvement', label: 'Improvement' },
      { value: 'task', label: 'Task' },
      { value: 'epic', label: 'Epic' },
      { value: 'story', label: 'Story' }
    ];
  }
}

// Create singleton instance
const taskService = new TaskService();

export default taskService;
