// services/adminService.js

import fetchApiResponse from "@/helper/api_data_store";

export const adminService = {
  // Fetch users list with filters
  listUsers: async (params, session) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.role) queryParams.append('role', params.role);
      if (params.is_active !== undefined && params.is_active !== '') {
        queryParams.append('is_active', params.is_active);
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/admin/list${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await fetchApiResponse(url, {
        method: "GET",
        headers: {
          "Access-Token": session?.accessToken,
          "Refresh-Token": session?.refreshToken,
        },
      });

      if (response.meta?.status === 200 && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.meta?.message || "Failed to fetch users" };
    } catch (error) {
      console.error("Error fetching users:", error);
      return { success: false, error: "Something went wrong" };
    }
  },

  // Fetch enrollments list with filters
  listEnrollments: async (params, session) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.user_id) queryParams.append('user_id', params.user_id);
      if (params.course_id) queryParams.append('course_id', params.course_id);
      if (params.status) queryParams.append('status', params.status);
      if (params.is_active !== undefined && params.is_active !== '') {
        queryParams.append('is_active', params.is_active);
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/enrollments/admin/list${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await fetchApiResponse(url, {
        method: "GET",
        headers: {
          "Access-Token": session?.accessToken,
          "Refresh-Token": session?.refreshToken,
        },
      });

      if (response.meta?.status === 200 && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.meta?.message || "Failed to fetch enrollments" };
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      return { success: false, error: "Something went wrong" };
    }
  },

  // Update user status
  updateUserStatus: async (userId, isActive, session) => {
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/update-status/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
          body: JSON.stringify({ is_active: isActive }),
        }
      );

      if (response.meta?.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.meta?.message || "Failed to update user status" };
    } catch (error) {
      console.error("Error updating user status:", error);
      return { success: false, error: "Something went wrong" };
    }
  },

};