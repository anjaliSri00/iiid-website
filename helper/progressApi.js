// @/helper/progressApi.js
import fetchApiResponse from "./api_data_store";

export const progressApi = {
  // Update lesson progress
  async updateProgress(lessonId, data, session) {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/lessons/${lessonId}/progress`;
      console.log('📡 Updating progress URL:', url);
      
      const response = await fetchApiResponse(
        url,
        {
          method: "PUT",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (response.meta?.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.meta?.message || "Failed to update progress" };
    } catch (error) {
      console.error("Error updating progress:", error);
      return { success: false, error: error.message };
    }
  },

  // Get progress for a specific lesson
  async getLessonProgress(lessonId, session) {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/lessons/${lessonId}/progress`;
      console.log('📡 Getting lesson progress URL:', url);
      
      const response = await fetchApiResponse(
        url,
        {
          method: "GET",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
        }
      );

      if (response.meta?.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.meta?.message || "Failed to get lesson progress" };
    } catch (error) {
      console.error("Error getting lesson progress:", error);
      return { success: false, error: error.message };
    }
  },
};