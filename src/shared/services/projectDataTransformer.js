// Project Data Transformer - Transforms Django API data to match React table structure
import djangoApiService from './djangoApiService';

class ProjectDataTransformer {
  /**
   * Transform Django project data to match React table structure
   */
  static transformProject(apiProject) {
    return {
      id: apiProject.id,
      name: apiProject.name,
      project_number: apiProject.project_number || '',
      description: apiProject.description || '',
      status: this.transformStatus(apiProject.status),
      progress: apiProject.progress || 0,
      priority: this.transformPriority(apiProject.priority),
      team: this.transformTeam(apiProject.team, apiProject),
      deadline: this.formatDate(apiProject.deadline),
      budget: this.formatBudget(apiProject.budget),
      category: this.transformCategory(apiProject.category),
      startDate: this.formatDate(apiProject.start_date),
      filiales: this.transformFiliales(apiProject.tags),
      projectManager: this.transformManager(apiProject.manager, apiProject),
      projectManagerFunction: this.transformManagerFunction(apiProject.manager, apiProject),
      spent: this.formatBudget(apiProject.spent),
      notes: apiProject.notes || '',
      created_at: this.formatDateTime(apiProject.created_at),
      updated_at: this.formatDateTime(apiProject.updated_at)
    };
  }

  /**
   * Transform Django status to React status
   */
  static transformStatus(djangoStatus) {
    const statusMap = {
      'planning': 'Planification',
      'in_progress': 'En cours',
      'completed': 'Terminé',
      'on_hold': 'En attente',
      'overdue': 'En retard',
      'cancelled': 'Annulé'
    };
    return statusMap[djangoStatus] || djangoStatus;
  }

  /**
   * Transform priority from Django enum to French label.
   */
  static transformPriority(djangoPriority) {
    const priorityMap = {
      'high': 'Élevé',
      'medium': 'Moyen',
      'low': 'Faible'
    };
    return priorityMap[djangoPriority] || djangoPriority;
  }

  /**
   * Transform Django category to React category
   */
  static transformCategory(djangoCategory) {
    const categoryMap = {
      'web_development': 'Web',
      'mobile_app': 'Mobile',
      'desktop_app': 'Desktop',
      'data_analysis': 'Data',
      'ai_ml': 'AI/ML',
      'devops': 'DevOps',
      'gaming': 'Gaming',
      'iot': 'IoT'
    };
    return categoryMap[djangoCategory] || djangoCategory;
  }

  /**
   * Transform team data
   */
  static transformTeam(team, apiProject) {
    // First try to get team_members from the API response
    if (apiProject && apiProject.team_members && Array.isArray(apiProject.team_members)) {
      return apiProject.team_members.map(member => member.full_name || member.username || 'Unknown');
    }
    
    // Fallback to team array
    if (!team || !Array.isArray(team)) return [];
    return team.map(member => member.full_name || member.username || member.name || 'Unknown');
  }

  /**
   * Transform manager data
   */
  static transformManager(manager, apiProject) {
    // First try to get manager_name from the API response
    if (apiProject && apiProject.manager_name) {
      return apiProject.manager_name;
    }
    
    // Try to get manager_details from the API response
    if (apiProject && apiProject.manager_details) {
      return apiProject.manager_details.full_name || apiProject.manager_details.username || 'Unknown';
    }
    
    // Fallback to manager object
    if (!manager) return 'Non assigné';
    return manager.full_name || manager.username || manager.name || 'Unknown';
  }

  /**
   * Transform manager function
   */
  static transformManagerFunction(manager, apiProject) {
    // Try to get manager_details from the API response
    if (apiProject && apiProject.manager_details) {
      return apiProject.manager_details.position || apiProject.manager_details.role || 'Chef de Projet';
    }
    
    // Fallback to manager object
    if (!manager) return 'Non assigné';
    return manager.position || manager.role || 'Chef de Projet';
  }

  /**
   * Transform tags to filiales
   */
  static transformFiliales(tags) {
    if (!tags || !Array.isArray(tags)) return [];
    console.log('TransformFiliales - Raw tags:', tags);
    // Filter out technical tags and keep only company-like tags
    const filteredTags = tags.filter(tag => 
      tag.length <= 10 && 
      !tag.includes('-') && 
      !tag.includes('_') &&
      tag.toUpperCase() === tag
    );
    console.log('TransformFiliales - Filtered tags:', filteredTags);
    return filteredTags;
  }

  /**
   * Format date for display
   */
  static formatDate(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Format date for API (Django expects YYYY-MM-DD format)
   */
  static formatDateForAPI(dateString) {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return null;
      }
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch (error) {
      console.warn('Error formatting date for API:', dateString, error);
      return null;
    }
  }

  /**
   * Format datetime for display
   */
  static formatDateTime(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('fr-FR');
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Format budget for display
   */
  static formatBudget(amount) {
    if (!amount) return '€0';
    try {
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      return `€${numAmount.toLocaleString('fr-FR')}`;
    } catch (error) {
      return `€${amount}`;
    }
  }

  /**
   * Transform API project data for creation/update
   */
  static transformProjectForAPI(reactProject) {
    return {
      name: reactProject.name,
      description: reactProject.description,
      status: this.transformStatusToAPI(reactProject.status),
      priority: this.transformPriorityToAPI(reactProject.priority),
      category: this.transformCategoryToAPI(reactProject.category),
      start_date: this.formatDateForAPI(reactProject.startDate),
      deadline: this.formatDateForAPI(reactProject.deadline),
      budget: this.parseBudget(reactProject.budget),
      spent: this.parseBudget(reactProject.spent),
      progress: reactProject.progress,
      notes: reactProject.notes,
      tags: this.transformFilialesToTags(reactProject.filiales)
    };
  }

  /**
   * Transform React status to Django status
   */
  static transformStatusToAPI(reactStatus) {
    if (!reactStatus) return 'planning'; // Default status
    
    const statusMap = {
      'Planification': 'planning',
      'En cours': 'in_progress',
      'Terminé': 'completed',
      'En attente': 'on_hold',
      'En retard': 'overdue',
      'Annulé': 'cancelled'
    };
    return statusMap[reactStatus] || reactStatus;
  }

  /**
   * Transform React category to Django category
   */
  static transformCategoryToAPI(reactCategory) {
    if (!reactCategory) return 'web_development'; // Default category
    
    const categoryMap = {
      'Web': 'web_development',
      'Mobile': 'mobile_app',
      'Desktop': 'desktop_app',
      'Data': 'data_analysis',
      'AI/ML': 'ai_ml',
      'DevOps': 'devops',
      'Gaming': 'gaming',
      'IoT': 'iot'
    };
    return categoryMap[reactCategory] || reactCategory.toLowerCase();
  }

  /**
   * Parse budget string to number
   */
  static parseBudget(budgetString) {
    console.log('💰 Parsing budget:', budgetString);
    if (!budgetString) return 0;
    try {
      const cleanString = budgetString.replace(/[€,\s]/g, '');
      const parsed = parseFloat(cleanString) || 0;
      console.log('💰 Parsed budget:', parsed);
      return parsed;
    } catch (error) {
      console.log('💰 Budget parsing error:', error);
      return 0;
    }
  }

  /**
   * Transform filiales to tags
   */
  static transformFilialesToTags(filiales) {
    console.log('🏢 Transforming filiales to tags:', filiales);
    if (!filiales || !Array.isArray(filiales)) return [];
    const filtered = filiales.filter(filiale => filiale && filiale.trim() !== '');
    console.log('🏢 Filtered tags:', filtered);
    return filtered;
  }

  /**
   * Get status color for UI
   */
  static getStatusColor(status) {
    const colorMap = {
      'Planification': 'info',
      'En cours': 'primary',
      'Terminé': 'success',
      'En attente': 'warning',
      'Annulé': 'error'
    };
    return colorMap[status] || 'default';
  }

  /**
   * Transform React priority to Django priority
   */
  static transformPriorityToAPI(reactPriority) {
    if (!reactPriority) return 'medium'; // Default priority
    
    const priorityMap = {
      'Élevé': 'high',
      'Moyen': 'medium',
      'Faible': 'low'
    };
    return priorityMap[reactPriority] || reactPriority.toLowerCase();
  }

  /**
   * Get priority color for UI
   */
  static getPriorityColor(priority) {
    const colorMap = {
      'Faible': 'success',
      'Moyen': 'warning',
      'Élevé': 'error',
      'low': 'success',
      'medium': 'warning',
      'high': 'error',
      'critical': 'error'
    };
    return colorMap[priority] || 'default';
  }
}

export default ProjectDataTransformer;
