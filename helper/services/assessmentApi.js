// helper/assessmentApi.js

import fetchApiResponse from "../api_data_store";

export const assessmentApi = {
  // ============ ASSESSMENT CRUD ============
  
  // Create a new assessment
  createAssessment: async (courseId, data, session) => {
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/assessment/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
          body: JSON.stringify(data),
        }
      );
      return response;
    } catch (error) {
      console.error("Error creating assessment:", error);
      throw error;
    }
  },

  // Update assessment
  updateAssessment: async (courseId, assessmentId, data, session) => {
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/assessment/${assessmentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
          body: JSON.stringify(data),
        }
      );
      return response;
    } catch (error) {
      console.error("Error updating assessment:", error);
      throw error;
    }
  },

  // Delete assessment
  deleteAssessment: async (courseId, assessmentId, session) => {
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/assessment/${assessmentId}`,
        {
          method: "DELETE",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error deleting assessment:", error);
      throw error;
    }
  },

  // Activate assessment
  activateAssessment: async (courseId, assessmentId, session) => {
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/assessment/${assessmentId}/activate`,
        {
          method: "PATCH",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error activating assessment:", error);
      throw error;
    }
  },

  // Deactivate assessment
  deactivateAssessment: async (courseId, assessmentId, session) => {
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/assessment/${assessmentId}/deactivate`,
        {
          method: "PATCH",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error deactivating assessment:", error);
      throw error;
    }
  },

  // Get assessment by ID (Admin view - includes correct answers)
  getAssessmentById: async (courseId, assessmentId, session) => {
    try {
      let url;
      if (assessmentId) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/assessment/${assessmentId}`;
      } else {
        // If no assessmentId, get the course details which includes assessments
        url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/details/${courseId}`;
      }
      
      const response = await fetchApiResponse(url, {
        method: "GET",
        headers: {
          "Access-Token": session?.accessToken,
          "Refresh-Token": session?.refreshToken,
        },
      });
      return response;
    } catch (error) {
      console.error("Error fetching assessment details:", error);
      throw error;
    }
  },

  // Get assessment for student (enrolled & 100% progress)
  getAssessment: async (courseId, session) => {
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/assessment`,
        {
          method: "GET",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error fetching assessment:", error);
      throw error;
    }
  },

  // ============ DEFAULT ASSESSMENT MANAGEMENT ============
  
  // ✅ UPDATED: Set default assessment for a course - now requires type
  setDefaultAssessment: async (courseId, assessmentId, session) => {
    try {
      // First, get the assessment to determine its type
      const assessmentResponse = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/assessment/${assessmentId}`,
        {
          method: "GET",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
        }
      );
      
      let assessmentType = 'mcq'; // default
      if (assessmentResponse?.meta?.status === 200 && assessmentResponse.data) {
        assessmentType = assessmentResponse.data.type || 'mcq';
      }
      
      // Map assessment type to backend expected type
      const typeMap = {
        'mcq': 'mcq',
        'pdf_task': 'pdf'
      };
      const backendType = typeMap[assessmentType] || 'mcq';
      
      // ✅ FIX: Send type and assessment_id in the request body
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/default-assessment`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
          body: JSON.stringify({ 
            type: backendType,
            assessment_id: assessmentId 
          }),
        }
      );
        if (response?.meta?.status !== 200) {
        // Return the error response without showing toast here
        // The calling component will handle the error
        return response;
      }
      
      return response;
    } catch (error) {
      console.error("Error setting default assessment:", error);
      throw error;
    }
  },

  // ✅ NEW: Remove default assessment
  removeDefaultAssessment: async (courseId, type, session) => {
    try {
      const typeMap = {
        'mcq': 'mcq',
        'pdf_task': 'pdf'
      };
      const backendType = typeMap[type] || 'mcq';
      
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/default-assessment`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
          body: JSON.stringify({ type: backendType }),
        }
      );
      return response;
    } catch (error) {
      console.error("Error removing default assessment:", error);
      throw error;
    }
  },

  // Sync enrollments to default assessment
  syncEnrollmentsToDefault: async (courseId, session) => {
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/assessment/${courseId}/enrollments/sync-default`,
        {
          method: "PUT",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error syncing enrollments to default:", error);
      throw error;
    }
  },

  // ============ QUESTION MANAGEMENT ============
  
  // Add question to assessment
  addQuestion: async (courseId, assessmentId, data, session) => {
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/assessment/${assessmentId}/questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
          body: JSON.stringify(data),
        }
      );
      return response;
    } catch (error) {
      console.error("Error adding question:", error);
      throw error;
    }
  },

  // Update question
  updateQuestion: async (courseId, questionId, data, session) => {
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/assessment/questions/${questionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
          body: JSON.stringify(data),
        }
      );
      return response;
    } catch (error) {
      console.error("Error updating question:", error);
      throw error;
    }
  },

  // Delete question
  deleteQuestion: async (courseId, questionId, session) => {
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/assessment/questions/${questionId}`,
        {
          method: "DELETE",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error deleting question:", error);
      throw error;
    }
  },

  // ============ STUDENT SUBMISSIONS ============
  
  // Submit MCQ assessment (student)
  submitAssessment: async (courseId, assessmentId, answers, session) => {
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/assessment/${assessmentId}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
          body: JSON.stringify({ answers }),
        }
      );
      return response;
    } catch (error) {
      console.error("Error submitting assessment:", error);
      throw error;
    }
  },

  // Submit PDF task (student)
  submitPdfTask: async (courseId, assessmentId, fileUrl, session) => {
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/assessment/${assessmentId}/submit-pdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
          body: JSON.stringify({ file_url: fileUrl }),
        }
      );
      return response;
    } catch (error) {
      console.error("Error submitting PDF task:", error);
      throw error;
    }
  },

  // ============ ADMIN REVIEW & MANAGEMENT ============
  
  // Review PDF task (admin)
  reviewPdfTask: async (courseId, attemptId, reviewData, session) => {
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/assessment/attempts/${attemptId}/review`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
          body: JSON.stringify(reviewData),
        }
      );
      return response;
    } catch (error) {
      console.error("Error reviewing PDF task:", error);
      throw error;
    }
  },

  // List all attempts (admin)
  listAllAttempts: async (courseId, filters, session) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
            queryParams.append(key, filters[key]);
          }
        });
      }
      
      let url;
      if (courseId) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/assessment/admin/attempts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        // url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/assessment/admin/attempts`;
      } else {
        // If no courseId, fetch from all courses
        url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/attempts/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      }
      
      const response = await fetchApiResponse(url, {
        method: "GET",
        headers: {
          "Access-Token": session?.accessToken,
          "Refresh-Token": session?.refreshToken,
        },
      });
      return response;
    } catch (error) {
      console.error("Error listing attempts:", error);
      throw error;
    }
  },

  // ============ REATTEMPT MANAGEMENT ============
  
  // Request reattempt (student)
  requestReattempt: async (courseId, data, session) => {
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/assessment/request-reattempt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
          body: JSON.stringify(data),
        }
      );
      return response;
    } catch (error) {
      console.error("Error requesting reattempt:", error);
      throw error;
    }
  },

  // List reattempt requests (admin)
  listReattemptRequests: async (courseId, filters, session) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
            queryParams.append(key, filters[key]);
          }
        });
      }
      
      let url;
      if (courseId) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/assessment/admin/reattempt-requests`;
      } else {
        url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/reattempt-requests/all`;
      }
      
      const response = await fetchApiResponse(url, {
        method: "GET",
        headers: {
          "Access-Token": session?.accessToken,
          "Refresh-Token": session?.refreshToken,
        },
      });
      return response;
    } catch (error) {
      console.error("Error listing reattempt requests:", error);
      throw error;
    }
  },

  // Approve reattempt request (admin)
  approveReattempt: async (courseId, requestId, data, session) => {
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/assessment/admin/reattempt-requests/${requestId}/approve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
          body: JSON.stringify(data),
        }
      );
      return response;
    } catch (error) {
      console.error("Error approving reattempt:", error);
      throw error;
    }
  },

  // Reject reattempt request (admin)
  rejectReattempt: async (courseId, requestId, session) => {
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/assessment/admin/reattempt-requests/${requestId}/reject`,
        {
          method: "PUT",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error rejecting reattempt:", error);
      throw error;
    }
  },
};

export default assessmentApi;