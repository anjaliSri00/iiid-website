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
    
    // Check if it's an authentication error
    if (error?.message?.includes('401') || 
        error?.message?.includes('unauthorized') ||
        error?.meta?.status === 401) {
      setError('Your session has expired. Please login again.');
      return true; // Return true if it's an auth error
    }
    
    setError(error?.message || 'An error occurred');
    return false;
  };

  const fetchAssessment = useCallback(async (programId, assessmentId) => {
    setLoading(true);
    setError(null);
    // console.log(programId, assessmentId)
    try {
      let currentSession = session;
      
      // Try to get valid session
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
        response = await assessmentApi.getAssessmentById(programId,assessmentId, currentSession);
      } else {
        response = await assessmentApi.getAssessment(programId, currentSession);
      }

      if (response?.meta?.status === 200) {
        setAssessment(response.data);
        setError(null);
      } else if (response?.meta?.status === 401) {
        // Try to refresh token once
        try {
          const newSession = await update();
          if (newSession?.accessToken) {
            // Retry with new session
            const retryResponse = assessmentId 
              ? await assessmentApi.getAssessmentById(assessmentId, newSession)
              : await assessmentApi.getAssessment(programId, newSession);
            
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

  const submitMCQ = useCallback(async (programId, assessmentId, answers) => {
    try {
      let currentSession = session;
      if (!currentSession?.accessToken) {
        currentSession = await update();
      }

      if (!currentSession?.accessToken) {
        throw new Error('Please login to submit assessment');
      }

      const response = await assessmentApi.submitAssessment(
        programId,
        assessmentId,
        answers,
        currentSession
      );

      if (response?.meta?.status === 401) {
        // Try to refresh token
        const newSession = await update();
        if (newSession?.accessToken) {
          const retryResponse = await assessmentApi.submitAssessment(
            programId,
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
      throw error;
    }
  }, [session, update]);

  const submitPDFTask = useCallback(async (programId, assessmentId, fileUrl) => {
    try {
      let currentSession = session;
      if (!currentSession?.accessToken) {
        currentSession = await update();
      }

      if (!currentSession?.accessToken) {
        throw new Error('Please login to submit task');
      }

      const response = await assessmentApi.submitPdfTask(
        programId,
        assessmentId,
        fileUrl,
        currentSession
      );

      if (response?.meta?.status === 401) {
        // Try to refresh token
        const newSession = await update();
        if (newSession?.accessToken) {
          const retryResponse = await assessmentApi.submitPdfTask(
            programId,
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
      throw error;
    }
  }, [session, update]);

  return {
    assessment,
    loading,
    error,
    setError,
    fetchAssessment,
    submitMCQ,
    submitPDFTask,
  };
};