// Services index - Export all API services
export { default as apiService } from './apiService';
export { default as djangoApiService } from './djangoApiService';
export { default as projectService } from './projectService';
export { default as taskService } from './taskService';
export { default as dashboardService } from './dashboardService';
export { default as axiosInstance } from './axiosInstance';
export { default as ProjectDataTransformer } from './projectDataTransformer';

// Re-export for backward compatibility
export { default } from './apiService';
