class AttachmentService {
  /**
   * Get attachments for a project
   */
  async getProjectAttachments(projectId) {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/projects/${projectId}/attachments/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch attachments: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.results || data,
        total: data.count || data.length
      };
    } catch (error) {
      console.error('Error fetching attachments:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Upload a file attachment
   */
  async uploadAttachment(projectId, file, description = '') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/projects/${projectId}/attachments/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error uploading attachment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete an attachment
   */
  async deleteAttachment(projectId, attachmentId) {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/projects/${projectId}/attachments/${attachmentId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting attachment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Download an attachment
   */
  async downloadAttachment(projectId, attachmentId, fileName) {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/projects/${projectId}/attachments/${attachmentId}/download/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return {
        success: true
      };
    } catch (error) {
      console.error('Error downloading attachment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get attachment statistics
   */
  async getAttachmentStats(projectId) {
    try {
      const result = await this.getProjectAttachments(projectId);
      if (!result.success) {
        return result;
      }

      const attachments = result.data;
      const totalSize = attachments.reduce((sum, att) => sum + att.file_size, 0);
      const fileTypes = {};
      
      attachments.forEach(att => {
        const type = att.file_type.split('/')[0];
        fileTypes[type] = (fileTypes[type] || 0) + 1;
      });

      return {
        success: true,
        data: {
          totalFiles: attachments.length,
          totalSize,
          fileTypes,
          recentUploads: attachments
            .sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at))
            .slice(0, 5)
        }
      };
    } catch (error) {
      console.error('Error getting attachment stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB
      allowedTypes = ['*/*'],
      maxFiles = 10
    } = options;

    const errors = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
    }

    // Check file type
    if (allowedTypes.length > 0 && allowedTypes[0] !== '*/*') {
      const isAllowed = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isAllowed) {
        errors.push(`File type ${file.type} is not allowed`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file icon based on type
   */
  getFileIcon(fileType) {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📈';
    if (fileType.includes('zip') || fileType.includes('rar')) return '🗜️';
    return '📎';
  }

  /**
   * Get file color based on type
   */
  getFileColor(fileType) {
    if (fileType.startsWith('image/')) return '#4caf50';
    if (fileType.startsWith('video/')) return '#ff9800';
    if (fileType.startsWith('audio/')) return '#9c27b0';
    if (fileType.includes('pdf')) return '#f44336';
    if (fileType.includes('word')) return '#2196f3';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '#4caf50';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '#ff5722';
    if (fileType.includes('zip') || fileType.includes('rar')) return '#795548';
    return '#757575';
  }
}

export default new AttachmentService();
