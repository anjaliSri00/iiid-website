// helper/assessmentApi.js

import fetchApiResponse from "./api_data_store";

export const assessmentApi = {
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

  // Get assessment details
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
      console.log(response, "-----------------------------------getAsssesssment")
      return response;
    } catch (error) {
      console.error("Error fetching assessment:", error);
      throw error;
    }
  },

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

  // Submit assessment (student)
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
};