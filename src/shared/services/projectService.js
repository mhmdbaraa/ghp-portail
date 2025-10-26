// Project Service - Handles all project-related API calls with data transformation
import djangoApiService from './djangoApiService';
import ProjectDataTransformer from './projectDataTransformer';

class ProjectService {
  /**
   * Get all projects with data transformation
   */
  async getProjects(filters = {}, page = 1, pageSize = 20) {
    try {
      // Removed console.log to eliminate perceived "reload" feeling
      
      // Transform filters to backend format
      const transformedFilters = this.transformFiltersToAPI(filters);
      
      // Use the existing getProjects method with pagination and filters
      const response = await djangoApiService.getProjects(transformedFilters, page, pageSize);
      
      if (response.success) {
        // Handle paginated response
        let projects = [];
        let totalCount = 0;
        
        if (response.data.results) {
          // Paginated response
          projects = response.data.results;
          totalCount = response.data.count || 0;
        } else if (Array.isArray(response.data)) {
          // Direct array response
          projects = response.data;
          totalCount = projects.length;
        }
        
        const transformedProjects = projects.map(project => 
          ProjectDataTransformer.transformProject(project)
        );
        
        return {
          success: true,
          data: transformedProjects,
          totalCount: totalCount,
          currentPage: page,
          pageSize: pageSize,
          message: `Page ${page} projects retrieved successfully`
        };
      } else {
        console.log('❌ API Error:', response.error);
        return {
          success: false,
          error: response.error,
          message: 'Failed to retrieve projects'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error retrieving projects'
      };
    }
  }

  /**
   * Get all projects for kanban view (fetches all pages)
   */
  async getAllProjects(filters = {}) {
    try {
      // Use djangoApiService.getAllProjects to fetch all projects
      const response = await djangoApiService.getAllProjects(filters);
      
      if (response.success) {
        // Transform all projects
        const transformedProjects = response.data.results.map(project => 
          ProjectDataTransformer.transformProject(project)
        );
        
        return {
          success: true,
          data: transformedProjects,
          totalCount: response.data.count,
          message: `All ${transformedProjects.length} projects retrieved successfully`
        };
      } else {
        return {
          success: false,
          error: response.error,
          message: 'Failed to retrieve all projects'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error retrieving all projects'
      };
    }
  }

  /**
   * Get a single project by ID
   */
  async getProject(id) {
    try {
      const response = await djangoApiService.getProjectById(id);
      
      if (response.success) {
        const transformedProject = ProjectDataTransformer.transformProject(response.data);
        
        return {
          success: true,
          data: transformedProject,
          message: 'Project retrieved successfully'
        };
      } else {
        return {
          success: false,
          error: response.error,
          message: 'Failed to retrieve project'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error retrieving project'
      };
    }
  }

  /**
   * Create a new project
   */
  async createProject(projectData) {
    try {
      console.log('=== PROJECT SERVICE CREATE ===');
      console.log('Input projectData:', projectData);
      
      // Check if data is already in API format (has start_date instead of startDate)
      const apiData = projectData.start_date ? projectData : ProjectDataTransformer.transformProjectForAPI(projectData);
      console.log('API data to send:', apiData);
      
      const response = await djangoApiService.createProject(apiData);
      console.log('Django API response:', response);
      
      if (response.success) {
        const transformedProject = ProjectDataTransformer.transformProject(response.data);
        console.log('Transformed project for frontend:', transformedProject);
        
        return {
          success: true,
          data: transformedProject,
          message: 'Project created successfully'
        };
      } else {
        console.error('API creation failed:', response.error);
        return {
          success: false,
          error: response.error,
          message: 'Failed to create project'
        };
      }
    } catch (error) {
      console.error('Exception in createProject:', error);
      return {
        success: false,
        error: error.message,
        message: 'Error creating project'
      };
    }
  }

  /**
   * Update an existing project
   */
  async updateProject(id, projectData) {
    try {
      // For partial updates (like status only), use PATCH
      // For full updates, use PUT with transformation
      let apiData;
      let response;
      
      if (projectData.start_date || Object.keys(projectData).length === 1) {
        // Already in API format or partial update - use PATCH
        // But still transform status/priority if present
        apiData = { ...projectData };
        if (apiData.status) {
          apiData.status = ProjectDataTransformer.transformStatusToAPI(apiData.status);
        }
        if (apiData.priority) {
          apiData.priority = ProjectDataTransformer.transformPriorityToAPI(apiData.priority);
        }
        console.log('Using PATCH for partial update:', apiData);
        response = await djangoApiService.patchProject(id, apiData);
      } else {
        // Full project data, needs transformation - use PUT
        apiData = ProjectDataTransformer.transformProjectForAPI(projectData);
        console.log('Using PUT for full update:', apiData);
        response = await djangoApiService.updateProject(id, apiData);
      }
      
      if (response.success) {
        const transformedProject = ProjectDataTransformer.transformProject(response.data);
        
        return {
          success: true,
          data: transformedProject,
          message: 'Project updated successfully'
        };
      } else {
        return {
          success: false,
          error: response.error,
          message: 'Failed to update project'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error updating project'
      };
    }
  }

  /**
   * Update project progress
   */
  async updateProjectProgress(id, progress) {
    try {
      const response = await djangoApiService.updateProjectProgress(id, progress);
      
      if (response.success) {
        const transformedProject = ProjectDataTransformer.transformProject(response.data);
        
        return {
          success: true,
          data: transformedProject,
          message: response.message || 'Progress updated successfully'
        };
      } else {
        return {
          success: false,
          error: response.error,
          message: response.message || 'Failed to update progress'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error updating progress'
      };
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(id) {
    try {
      const response = await djangoApiService.deleteProject(id);
      
      if (response.success) {
        return {
          success: true,
          message: 'Project deleted successfully'
        };
      } else {
        return {
          success: false,
          error: response.error,
          message: 'Failed to delete project'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error deleting project'
      };
    }
  }

  /**
   * Search projects with filters
   */
  async searchProjects(query, filters = {}) {
    try {
      const response = await djangoApiService.searchProjects(query, filters);
      
      if (response.success) {
        const projects = response.data.results || response.data;
        const transformedProjects = projects.map(project => 
          ProjectDataTransformer.transformProject(project)
        );
        
        return {
          success: true,
          data: transformedProjects,
          message: 'Projects search completed'
        };
      } else {
        return {
          success: false,
          error: response.error,
          message: 'Failed to search projects'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error searching projects'
      };
    }
  }

  /**
   * Get project statistics
   */
  async getProjectStatistics() {
    try {
      const response = await djangoApiService.getProjectStatistics();
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Project statistics retrieved'
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
   * Get available statuses
   */
  getAvailableStatuses() {
    return [
      { value: 'Planification', label: 'Planification' },
      { value: 'En cours', label: 'En cours' },
      { value: 'Terminé', label: 'Terminé' },
      { value: 'En attente', label: 'En attente' },
      { value: 'Annulé', label: 'Annulé' }
    ];
  }

  /**
   * Get available priorities
   */
  getAvailablePriorities() {
    return [
      { value: 'low', label: 'Faible' },
      { value: 'medium', label: 'Moyen' },
      { value: 'high', label: 'Élevé' },
      { value: 'critical', label: 'Critique' }
    ];
  }

  /**
   * Get available categories
   */
  getAvailableCategories() {
    return [
      { value: 'App Web', label: 'App Web' },
      { value: 'App Mobile', label: 'App Mobile' },
      { value: 'Reporting', label: 'Reporting' },
      { value: 'Digitalisation', label: 'Digitalisation' },
      { value: 'ERP', label: 'ERP' },
      { value: 'AI', label: 'AI' },
      { value: 'Web & Mobile', label: 'Web & Mobile' },
      { value: 'Autre', label: 'Autre' }
    ];
  }

  /**
   * Get available departments
   */
  getAvailableDepartments() {
    return [
      { value: 'Comptabilité', label: 'Comptabilité' },
      { value: 'Finance', label: 'Finance' },
      { value: 'Service clients', label: 'Service clients' },
      { value: 'Risque clients', label: 'Risque clients' },
      { value: 'Service généraux', label: 'Service généraux' },
      { value: 'Contrôle de gestion', label: 'Contrôle de gestion' },
      { value: 'Juridique', label: 'Juridique' },
      { value: 'Événementiel', label: 'Événementiel' }
    ];
  }

  /**
   * Get available filiales
   */
  getAvailableFiliales() {
    return [
      'GHMED', 'DEFMED', 'ABCMED', 'MEDIJK', 'TOUT', 'MEDTECH', 'HEALTHCARE', 'BIOTECH'
    ];
  }

  /**
   * Transform frontend filters to backend format
   */
  transformFiltersToAPI(filters) {
    const transformedFilters = { ...filters };
    
    // Transform status from French to backend format
    if (transformedFilters.status) {
      const statusMap = {
        'Planification': 'planification',
        'En cours': 'en_cours',
        'En attente': 'en_attente',
        'En retard': 'en_retard',
        'Terminé': 'termine',
        'Annulé': 'annule'
      };
      
      transformedFilters.status = statusMap[transformedFilters.status] || transformedFilters.status;
    }
    
    // Transform priority from French to backend format
    if (transformedFilters.priority) {
      const priorityMap = {
        'Faible': 'faible',
        'Moyen': 'moyen',
        'Élevé': 'eleve',
        'Critique': 'critique'
      };
      
      transformedFilters.priority = priorityMap[transformedFilters.priority] || transformedFilters.priority;
    }
    
    return transformedFilters;
  }
}

// Create singleton instance
const projectService = new ProjectService();

export default projectService;
export { ProjectDataTransformer };
