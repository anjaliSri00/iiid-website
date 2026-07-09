// hooks/useCSVExport.js

import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import exportService from '@/helper/services/exportService';

export const useCSVExport = (session) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [lastExport, setLastExport] = useState(null);

  /**
   * Generic export function with loading state
   */
  const exportData = useCallback(async (endpoint, filters = {}, options = {}) => {
    const { onSuccess, onError, defaultFilename } = options;

    try {
      setIsExporting(true);
      setExportError(null);

      const result = await exportService.exportWithUI(
        endpoint,
        filters,
        session,
        {
          toast,
          setLoading: setIsExporting,
          defaultFilename,
          onSuccess: (data) => {
            setLastExport(data);
            if (onSuccess) onSuccess(data);
          },
          onError: (error) => {
            setExportError(error);
            if (onError) onError(error);
          },
        }
      );

      return result;
    } catch (error) {
      setExportError(error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, [session]);

  /**
   * Export Users
   */
  const exportUsers = useCallback((filters = {}, options = {}) => {
    return exportData('users', filters, {
      defaultFilename: 'users',
      ...options,
    });
  }, [exportData]);

  /**
   * Export Courses
   */
  const exportCourses = useCallback((filters = {}, options = {}) => {
    return exportData('courses', filters, {
      defaultFilename: 'courses',
      ...options,
    });
  }, [exportData]);

  /**
   * Export Enrollments
   */
  const exportEnrollments = useCallback((filters = {}, options = {}) => {
    return exportData('enrollments', filters, {
      defaultFilename: 'enrollments',
      ...options,
    });
  }, [exportData]);

  /**
   * Export Payments
   */
  const exportPayments = useCallback((filters = {}, options = {}) => {
    return exportData('payments', filters, {
      defaultFilename: 'payments',
      ...options,
    });
  }, [exportData]);

  /**
   * Export Custom endpoint
   */
  const exportCustom = useCallback((endpoint, filters = {}, options = {}) => {
    return exportData(endpoint, filters, options);
  }, [exportData]);

  return {
    isExporting,
    exportError,
    lastExport,
    exportUsers,
    exportCourses,
    exportEnrollments,
    exportPayments,
    exportCustom,
    exportData,
    clearError: () => setExportError(null),
  };
};

export default useCSVExport;