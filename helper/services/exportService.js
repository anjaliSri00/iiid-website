// helper/services/exportService.js

/**
 * Common CSV Export Service
 * Handles all CSV export functionality for different modules
 */

class ExportService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL;
  }

  /**
   * Build query string from filters object
   * @param {Object} filters - Filter parameters
   * @returns {string} - Query string
   */
  buildQueryString(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });
    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Generic export function
   * @param {string} endpoint - API endpoint (e.g., 'users', 'courses', 'enrollments', 'payments')
   * @param {Object} filters - Filter parameters for the export
   * @param {Object} session - User session with access token
   * @param {string} defaultFilename - Default filename if not provided by server
   * @returns {Promise<Response>} - The fetch response object
   */
  async exportCSV(endpoint, filters = {}, session, defaultFilename = 'export') {
    try {
      // Build query parameters - this will return '' if no filters
      const queryString = this.buildQueryString(filters);
      const url = `${this.baseURL}/api/v1/${endpoint}/export-csv${queryString}`;


      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Access-Token': session?.accessToken,
          'Refresh-Token':session?.refreshToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = `Failed to export ${endpoint} CSV`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return response;
    } catch (error) {
      console.error(`Export ${endpoint} CSV error:`, error);
      throw error;
    }
  }

  /**
   * Download the CSV file from response
   * @param {Response} response - Fetch response object
   * @param {string} defaultFilename - Default filename if not provided by server
   * @returns {Promise<Object>} - Download result
   */
  async downloadCSV(response, defaultFilename = 'export') {
    try {
      const blob = await response.blob();
      
      // Validate blob is not empty
      if (blob.size === 0) {
        throw new Error('CSV file is empty');
      }

      // Validate content type
      const contentType = response.headers.get('Content-Type');
      if (contentType && !contentType.includes('text/csv') && !contentType.includes('application/octet-stream')) {
        console.warn('Unexpected content type:', contentType);
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Try to get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${defaultFilename}_${new Date().toISOString().slice(0, 10)}.csv`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          // Remove quotes if present
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Clean up URL object after a short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
      return { success: true, filename, size: blob.size };
    } catch (error) {
      console.error('Download CSV error:', error);
      throw error;
    }
  }

  /**
   * Complete export flow with loading and toast notifications
   * @param {string} endpoint - API endpoint
   * @param {Object} filters - Filter parameters
   * @param {Object} session - User session
   * @param {Object} options - Additional options
   * @param {Function} options.onSuccess - Callback on success
   * @param {Function} options.onError - Callback on error
   * @param {Function} options.onStart - Callback when export starts
   * @param {Function} options.onComplete - Callback when export completes
   * @param {string} options.defaultFilename - Default filename
   * @param {Object} options.toast - Toast functions (success, error, info)
   * @param {Function} options.setLoading - Loading state setter
   * @returns {Promise<Object>} - Export result
   */
  async exportWithUI(endpoint, filters = {}, session, options = {}) {
    const {
      onSuccess,
      onError,
      onStart,
      onComplete,
      defaultFilename = endpoint,
      toast,
      setLoading,
    } = options;

    try {
      // Set loading state
      if (setLoading) setLoading(true);
      
      // Callback on start
      if (onStart) onStart();
      
      // Show info toast
      if (toast?.info) {
        toast.info(`Preparing ${endpoint} CSV export...`);
      }    
      // Get the CSV response
      const response = await this.exportCSV(endpoint, filters, session, defaultFilename);
      
      // Download the file
      const result = await this.downloadCSV(response, defaultFilename);
      
      // Success callback
      if (onSuccess) onSuccess(result);
      
      // Show success toast
      if (toast?.success) {
        const entityName = endpoint.charAt(0).toUpperCase() + endpoint.slice(1);
        toast.success(`${entityName} CSV exported successfully! (${(result.size / 1024).toFixed(1)} KB)`);
      }
      
      return result;
    } catch (error) {
      // Error callback
      if (onError) onError(error);
      
      // Show error toast
      if (toast?.error) {
        toast.error(error.message || `Failed to export ${endpoint} CSV`);
      }
      
      throw error;
    } finally {
      // Complete callback
      if (onComplete) onComplete();
      
      // Clear loading state
      if (setLoading) setLoading(false);
    }
  }

  // ============ Specific Export Methods ============

  /**
   * Export Users CSV
   * @param {Object} filters - User filters (search, role, is_active)
   * @param {Object} session - User session
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Export result
   */
  async exportUsers(filters = {}, session, options = {}) {
    return this.exportWithUI('users', filters, session, {
      defaultFilename: 'users',
      ...options,
    });
  }

  /**
   * Export Courses CSV
   * @param {Object} filters - Course filters (category, level, status, search)
   * @param {Object} session - User session
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Export result
   */
  async exportCourses(filters = {}, session, options = {}) {
    return this.exportWithUI('courses', filters, session, {
      defaultFilename: 'courses',
      ...options,
    });
  }

  /**
   * Export Enrollments CSV
   * @param {Object} filters - Enrollment filters (user_id, course_id, status, is_active)
   * @param {Object} session - User session
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Export result
   */
  async exportEnrollments(filters = {}, session, options = {}) {
    return this.exportWithUI('enrollments', filters, session, {
      defaultFilename: 'enrollments',
      ...options,
    });
  }

  /**
   * Export Payments CSV
   * @param {Object} filters - Payment filters (user_id, course_id, status)
   * @param {Object} session - User session
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Export result
   */
  async exportPayments(filters = {}, session, options = {}) {
    return this.exportWithUI('payments', filters, session, {
      defaultFilename: 'payments',
      ...options,
    });
  }

  /**
   * Export Custom CSV with specific endpoint
   * @param {string} endpoint - Custom endpoint
   * @param {Object} filters - Filter parameters
   * @param {Object} session - User session
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Export result
   */
  async exportCustom(endpoint, filters = {}, session, options = {}) {
    return this.exportWithUI(endpoint, filters, session, options);
  }

  /**
   * Check if export is available for an entity
   * @param {string} endpoint - Entity endpoint
   * @param {Object} session - User session
   * @returns {Promise<boolean>} - True if export is available
   */
  async checkExportAvailability(endpoint, session) {    
    try {
      const response = await fetch(`${this.baseURL}/api/v1/${endpoint}/export-csv`, {
        method: 'GET',
        headers: {
          'Access-Token': session?.accessToken,
          'Refresh-Token':session?.refreshToken
        },
      });
      return response.ok;
    } catch (error) {
      console.error(`Check export availability for ${endpoint} error:`, error);
      return false;
    }
  }
}

// Create and export a singleton instance
const exportService = new ExportService();
export default exportService;