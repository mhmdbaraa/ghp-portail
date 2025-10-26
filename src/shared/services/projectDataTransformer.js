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
      projectNumber: apiProject.project_number || '',
      project_number: apiProject.project_number || '',
      description: apiProject.description || '',
      status: this.transformStatus(apiProject.status),
      progress: apiProject.progress || 0,
      priority: this.transformPriority(apiProject.priority),
      team: this.transformTeam(apiProject.team, apiProject),
      deadline: this.formatDate(apiProject.deadline),
      budget: this.formatBudget(apiProject.budget),
      category: this.transformCategory(apiProject.category),
      department: this.transformDepartment(apiProject.department),
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
      'planification': 'Planification',
      'en_cours': 'En cours',
      'en_attente': 'En attente',
      'en_retard': 'En retard',
      'termine': 'Terminé',
      'annule': 'Annulé',
      // Legacy mappings for backward compatibility
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
      'app_web': 'App Web',
      'app_mobile': 'App Mobile',
      'reporting': 'Reporting',
      'digitalisation': 'Digitalisation',
      'erp': 'ERP',
      'ai': 'AI',
      'web_mobile': 'Web & Mobile',
      'other': 'Autre'
    };
    return categoryMap[djangoCategory] || djangoCategory;
  }

  /**
   * Transform Django department to React department
   */
  static transformDepartment(djangoDepartment) {
    const departmentMap = {
      'comptabilite': 'Comptabilité',
      'finance': 'Finance',
      'service_clients': 'Service clients',
      'risque_clients': 'Risque clients',
      'service_generaux': 'Service généraux',
      'controle_gestion': 'Contrôle de gestion',
      'juridique': 'Juridique',
      'evenementiel': 'Événementiel'
    };
    return departmentMap[djangoDepartment] || djangoDepartment;
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
    if (!amount) return '0 DZD';
    try {
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      return `${numAmount.toLocaleString('fr-FR')} DZD`;
    } catch (error) {
      return `${amount} DZD`;
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
      department: this.transformDepartmentToAPI(reactProject.department),
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
    if (!reactStatus) return 'planification'; // Default status
    
    const statusMap = {
      'Planification': 'planification',
      'En cours': 'en_cours',
      'En attente': 'en_attente',
      'En retard': 'en_retard',
      'Terminé': 'termine',
      'Annulé': 'annule'
    };
    return statusMap[reactStatus] || reactStatus.toLowerCase().replace(/ /g, '_');
  }

  /**
   * Transform React category to Django category
   */
  static transformCategoryToAPI(reactCategory) {
    if (!reactCategory) return 'app_web'; // Default category
    
    const categoryMap = {
      'App Web': 'app_web',
      'App Mobile': 'app_mobile',
      'Reporting': 'reporting',
      'Digitalisation': 'digitalisation',
      'ERP': 'erp',
      'AI': 'ai',
      'Web & Mobile': 'web_mobile',
      'Autre': 'other'
    };
    return categoryMap[reactCategory] || reactCategory.toLowerCase();
  }

  /**
   * Transform React department to Django department
   */
  static transformDepartmentToAPI(reactDepartment) {
    if (!reactDepartment) return 'comptabilite'; // Default department
    
    const departmentMap = {
      'Comptabilité': 'comptabilite',
      'Finance': 'finance',
      'Service clients': 'service_clients',
      'Risque clients': 'risque_clients',
      'Service généraux': 'service_generaux',
      'Contrôle de gestion': 'controle_gestion',
      'Juridique': 'juridique',
      'Événementiel': 'evenementiel'
    };
    return departmentMap[reactDepartment] || reactDepartment.toLowerCase();
  }

  /**
   * Parse budget string to number
   */
  static parseBudget(budgetString) {
    console.log('💰 Parsing budget:', budgetString);
    if (!budgetString) return 0;
    try {
      const cleanString = budgetString.replace(/[DZD,\s]/g, '');
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
    if (!reactPriority) return 'moyen'; // Default priority
    
    const priorityMap = {
      'Élevé': 'eleve',
      'Moyen': 'moyen',
      'Faible': 'faible',
      'Critique': 'critique'
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
