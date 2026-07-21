// hooks/useAssessment.js

import { useState, useCallback } from 'react';
import { assessmentApi } from '@/helper/services/assessmentApi';
import { useSession } from 'next-auth/react';

export const useAssessment = () => {
  const { data: session, update } = useSession();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApiError = (error) => {
    console.error('API Error:', error);
    
    if (error?.message?.includes('401') || 
        error?.message?.includes('unauthorized') ||
        error?.meta?.status === 401) {
      setError('Your session has expired. Please login again.');
      return true;
    }
    
    setError(error?.message || 'An error occurred');
    return false;
  };

  // ============ ASSESSMENT FETCHING ============
  
  const fetchAssessment = useCallback(async (courseId, assessmentId = null) => {
    setLoading(true);
    setError(null);
    
    try {
      let currentSession = session;
      
      if (!currentSession?.accessToken) {
        try {
          currentSession = await update();
        } catch (updateError) {
          console.error('Session update error:', updateError);
          setError('Session expired. Please login again.');
          setLoading(false);
          return;
        }
      }

      if (!currentSession?.accessToken) {
        setError('Please login to access this content');
        setLoading(false);
        return;
      }

      let response;
      if (assessmentId) {
        response = await assessmentApi.getAssessmentById(courseId, assessmentId, currentSession);
      } else {
        response = await assessmentApi.getAssessment(courseId, currentSession);
      }

      if (response?.meta?.status === 200) {
        setAssessment(response.data);
        setError(null);
      } else if (response?.meta?.status === 401) {
        try {
          const newSession = await update();
          if (newSession?.accessToken) {
            const retryResponse = assessmentId 
              ? await assessmentApi.getAssessmentById(courseId, assessmentId, newSession)
              : await assessmentApi.getAssessment(courseId, newSession);
            
            if (retryResponse?.meta?.status === 200) {
              setAssessment(retryResponse.data);
              setError(null);
              setLoading(false);
              return;
            }
          }
        } catch (retryError) {
          console.error('Retry failed:', retryError);
        }
        
        setError('Session expired. Please login again.');
      } else {
        setError(response?.meta?.message || 'Failed to load assessment');
      }
    } catch (err) {
      console.error('Fetch assessment error:', err);
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  }, [session, update]);

  // ============ STUDENT SUBMISSIONS ============
  
  const submitMCQ = useCallback(async (courseId, assessmentId, answers) => {
    setLoading(true);
    setError(null);
    
    try {
      let currentSession = session;
      if (!currentSession?.accessToken) {
        currentSession = await update();
      }

      if (!currentSession?.accessToken) {
        throw new Error('Please login to submit assessment');
      }

      const response = await assessmentApi.submitAssessment(
        courseId,
        assessmentId,
        answers,
        currentSession
      );

      if (response?.meta?.status === 401) {
        const newSession = await update();
        if (newSession?.accessToken) {
          const retryResponse = await assessmentApi.submitAssessment(
            courseId,
            assessmentId,
            answers,
            newSession
          );
          return retryResponse;
        }
        throw new Error('Session expired. Please login again.');
      }

      return response;
    } catch (error) {
      console.error('Submit MCQ error:', error);
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [session, update]);

  const submitPDFTask = useCallback(async (courseId, assessmentId, fileUrl) => {
    setLoading(true);
    setError(null);
    
    try {
      let currentSession = session;
      if (!currentSession?.accessToken) {
        currentSession = await update();
      }

      if (!currentSession?.accessToken) {
        throw new Error('Please login to submit task');
      }

      const response = await assessmentApi.submitPdfTask(
        courseId,
        assessmentId,
        fileUrl,
        currentSession
      );

      if (response?.meta?.status === 401) {
        const newSession = await update();
        if (newSession?.accessToken) {
          const retryResponse = await assessmentApi.submitPdfTask(
            courseId,
            assessmentId,
            fileUrl,
            newSession
          );
          return retryResponse;
        }
        throw new Error('Session expired. Please login again.');
      }

      return response;
    } catch (error) {
      console.error('Submit PDF task error:', error);
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [session, update]);

  // ============ ADMIN OPERATIONS ============
  
  // Create assessment
  const createAssessment = useCallback(async (courseId, data) => {
    setLoading(true);
    setError(null);
    
    try {
      let currentSession = session;
      if (!currentSession?.accessToken) {
        currentSession = await update();
      }

      if (!currentSession?.accessToken) {
        throw new Error('Please login to create assessment');
      }

      const response = await assessmentApi.createAssessment(
        courseId,
        data,
        currentSession
      );

      if (response?.meta?.status === 401) {
        const newSession = await update();
        if (newSession?.accessToken) {
          const retryResponse = await assessmentApi.createAssessment(
            courseId,
            data,
            newSession
          );
          return retryResponse;
        }
        throw new Error('Session expired. Please login again.');
      }

      return response;
    } catch (error) {
      console.error('Create assessment error:', error);
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [session, update]);

  // Update assessment
  const updateAssessment = useCallback(async (courseId, assessmentId, data) => {
    setLoading(true);
    setError(null);
    
    try {
      let currentSession = session;
      if (!currentSession?.accessToken) {
        currentSession = await update();
      }

      if (!currentSession?.accessToken) {
        throw new Error('Please login to update assessment');
      }

      const response = await assessmentApi.updateAssessment(
        courseId,
        assessmentId,
        data,
        currentSession
      );

      if (response?.meta?.status === 401) {
        const newSession = await update();
        if (newSession?.accessToken) {
          const retryResponse = await assessmentApi.updateAssessment(
            courseId,
            assessmentId,
            data,
            newSession
          );
          return retryResponse;
        }
        throw new Error('Session expired. Please login again.');
      }

      return response;
    } catch (error) {
      console.error('Update assessment error:', error);
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [session, update]);

  // Delete assessment
  const deleteAssessment = useCallback(async (courseId, assessmentId) => {
    setLoading(true);
    setError(null);
    
    try {
      let currentSession = session;
      if (!currentSession?.accessToken) {
        currentSession = await update();
      }

      if (!currentSession?.accessToken) {
        throw new Error('Please login to delete assessment');
      }

      const response = await assessmentApi.deleteAssessment(
        courseId,
        assessmentId,
        currentSession
      );

      if (response?.meta?.status === 401) {
        const newSession = await update();
        if (newSession?.accessToken) {
          const retryResponse = await assessmentApi.deleteAssessment(
            courseId,
            assessmentId,
            newSession
          );
          return retryResponse;
        }
        throw new Error('Session expired. Please login again.');
      }

      return response;
    } catch (error) {
      console.error('Delete assessment error:', error);
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [session, update]);

  // Activate/deactivate assessment
  const toggleAssessmentStatus = useCallback(async (courseId, assessmentId, action) => {
    setLoading(true);
    setError(null);
    
    try {
      let currentSession = session;
      if (!currentSession?.accessToken) {
        currentSession = await update();
      }

      if (!currentSession?.accessToken) {
        throw new Error('Please login to update assessment status');
      }

      const apiCall = action === 'activate' 
        ? assessmentApi.activateAssessment 
        : assessmentApi.deactivateAssessment;

      const response = await apiCall(courseId, assessmentId, currentSession);

      if (response?.meta?.status === 401) {
        const newSession = await update();
        if (newSession?.accessToken) {
          const retryResponse = await apiCall(courseId, assessmentId, newSession);
          return retryResponse;
        }
        throw new Error('Session expired. Please login again.');
      }

      return response;
    } catch (error) {
      console.error('Toggle assessment status error:', error);
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [session, update]);

  // Review PDF task
  const reviewPDFTask = useCallback(async (courseId, attemptId, reviewData) => {
    setLoading(true);
    setError(null);
    
    try {
      let currentSession = session;
      if (!currentSession?.accessToken) {
        currentSession = await update();
      }

      if (!currentSession?.accessToken) {
        throw new Error('Please login to review task');
      }

      const response = await assessmentApi.reviewPdfTask(
        courseId,
        attemptId,
        reviewData,
        currentSession
      );

      if (response?.meta?.status === 401) {
        const newSession = await update();
        if (newSession?.accessToken) {
          const retryResponse = await assessmentApi.reviewPdfTask(
            courseId,
            attemptId,
            reviewData,
            newSession
          );
          return retryResponse;
        }
        throw new Error('Session expired. Please login again.');
      }

      return response;
    } catch (error) {
      console.error('Review PDF task error:', error);
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [session, update]);

  // List all attempts (admin)
  const listAllAttempts = useCallback(async (courseId, filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      let currentSession = session;
      if (!currentSession?.accessToken) {
        currentSession = await update();
      }

      if (!currentSession?.accessToken) {
        throw new Error('Please login to view attempts');
      }

      const response = await assessmentApi.listAllAttempts(
        courseId,
        filters,
        currentSession
      );

      if (response?.meta?.status === 401) {
        const newSession = await update();
        if (newSession?.accessToken) {
          const retryResponse = await assessmentApi.listAllAttempts(
            courseId,
            filters,
            newSession
          );
          return retryResponse;
        }
        throw new Error('Session expired. Please login again.');
      }

      return response;
    } catch (error) {
      console.error('List attempts error:', error);
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [session, update]);

  // ============ REATTEMPT OPERATIONS ============
  
  const requestReattempt = useCallback(async (courseId, data) => {
    setLoading(true);
    setError(null);
    
    try {
      let currentSession = session;
      if (!currentSession?.accessToken) {
        currentSession = await update();
      }

      if (!currentSession?.accessToken) {
        throw new Error('Please login to request reattempt');
      }

      const response = await assessmentApi.requestReattempt(
        courseId,
        data,
        currentSession
      );

      if (response?.meta?.status === 401) {
        const newSession = await update();
        if (newSession?.accessToken) {
          const retryResponse = await assessmentApi.requestReattempt(
            courseId,
            data,
            newSession
          );
          return retryResponse;
        }
        throw new Error('Session expired. Please login again.');
      }

      return response;
    } catch (error) {
      console.error('Request reattempt error:', error);
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [session, update]);

  const listReattemptRequests = useCallback(async (courseId, filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      let currentSession = session;
      if (!currentSession?.accessToken) {
        currentSession = await update();
      }

      if (!currentSession?.accessToken) {
        throw new Error('Please login to view reattempt requests');
      }

      const response = await assessmentApi.listReattemptRequests(
        courseId,
        filters,
        currentSession
      );

      if (response?.meta?.status === 401) {
        const newSession = await update();
        if (newSession?.accessToken) {
          const retryResponse = await assessmentApi.listReattemptRequests(
            courseId,
            filters,
            newSession
          );
          return retryResponse;
        }
        throw new Error('Session expired. Please login again.');
      }

      return response;
    } catch (error) {
      console.error('List reattempt requests error:', error);
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [session, update]);

  const approveReattempt = useCallback(async (courseId, requestId, data) => {
    setLoading(true);
    setError(null);
    
    try {
      let currentSession = session;
      if (!currentSession?.accessToken) {
        currentSession = await update();
      }

      if (!currentSession?.accessToken) {
        throw new Error('Please login to approve reattempt');
      }

      const response = await assessmentApi.approveReattempt(
        courseId,
        requestId,
        data,
        currentSession
      );

      if (response?.meta?.status === 401) {
        const newSession = await update();
        if (newSession?.accessToken) {
          const retryResponse = await assessmentApi.approveReattempt(
            courseId,
            requestId,
            data,
            newSession
          );
          return retryResponse;
        }
        throw new Error('Session expired. Please login again.');
      }

      return response;
    } catch (error) {
      console.error('Approve reattempt error:', error);
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [session, update]);

  const rejectReattempt = useCallback(async (courseId, requestId) => {
    setLoading(true);
    setError(null);
    
    try {
      let currentSession = session;
      if (!currentSession?.accessToken) {
        currentSession = await update();
      }

      if (!currentSession?.accessToken) {
        throw new Error('Please login to reject reattempt');
      }

      const response = await assessmentApi.rejectReattempt(
        courseId,
        requestId,
        currentSession
      );

      if (response?.meta?.status === 401) {
        const newSession = await update();
        if (newSession?.accessToken) {
          const retryResponse = await assessmentApi.rejectReattempt(
            courseId,
            requestId,
            newSession
          );
          return retryResponse;
        }
        throw new Error('Session expired. Please login again.');
      }

      return response;
    } catch (error) {
      console.error('Reject reattempt error:', error);
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [session, update]);

  // ============ DEFAULT ASSESSMENT ============
  
  const syncEnrollmentsToDefault = useCallback(async (courseId) => {
    setLoading(true);
    setError(null);
    
    try {
      let currentSession = session;
      if (!currentSession?.accessToken) {
        currentSession = await update();
      }

      if (!currentSession?.accessToken) {
        throw new Error('Please login to sync enrollments');
      }

      const response = await assessmentApi.syncEnrollmentsToDefault(
        courseId,
        currentSession
      );

      if (response?.meta?.status === 401) {
        const newSession = await update();
        if (newSession?.accessToken) {
          const retryResponse = await assessmentApi.syncEnrollmentsToDefault(
            courseId,
            newSession
          );
          return retryResponse;
        }
        throw new Error('Session expired. Please login again.');
      }

      return response;
    } catch (error) {
      console.error('Sync enrollments error:', error);
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [session, update]);

  return {
    // State
    assessment,
    loading,
    error,
    setError,
    
    // Student methods
    fetchAssessment,
    submitMCQ,
    submitPDFTask,
    requestReattempt,
    
    // Admin methods
    createAssessment,
    updateAssessment,
    deleteAssessment,
    toggleAssessmentStatus,
    reviewPDFTask,
    listAllAttempts,
    listReattemptRequests,
    approveReattempt,
    rejectReattempt,
    syncEnrollmentsToDefault,
  };
};