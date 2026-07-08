// helper/services/paymentService.js

import fetchApiResponse from "@/helper/api_data_store";

export const paymentService = {
  // Fetch payments list - Simple GET without filters
  listPayments: async (session) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/payments/list`;

      const response = await fetchApiResponse(url, {
        method: "GET",
        headers: {
          "Access-Token": session?.accessToken,
          "Refresh-Token": session?.refreshToken,
        },
      });

      if (response.meta?.status === 200 && response.data) {
        let paymentsArray = [];
        
        // Handle the specific response structure
        if (response.data.payments_list) {
          // Check if payments_list has course_enrollment
          if (response.data.payments_list.course_enrollment) {
            paymentsArray = response.data.payments_list.course_enrollment;
          } else {
            // If payments_list is an object with other keys, try to get all values
            paymentsArray = Object.values(response.data.payments_list).flat();
          }
        } else if (Array.isArray(response.data)) {
          paymentsArray = response.data;
        } else if (typeof response.data === 'object' && response.data !== null) {
          paymentsArray = Object.values(response.data).flat();
        }
        
        // Ensure we have an array
        if (!Array.isArray(paymentsArray)) {
          paymentsArray = [];
        }
        
        return { 
          success: true, 
          data: paymentsArray,
          pagination: response.meta?.pagination || {}
        };
      }
      return { 
        success: false, 
        error: response.meta?.message || "Failed to fetch payments" 
      };
    } catch (error) {
      console.error("Error fetching payments:", error);
      return { success: false, error: "Something went wrong" };
    }
  },

  // Get payment statistics - calculate from list data
  getPaymentStats: async (payments) => {
    try {
      // Ensure payments is an array
      let paymentsArray = payments;
      if (!Array.isArray(paymentsArray)) {
        if (typeof paymentsArray === 'object' && paymentsArray !== null) {
          paymentsArray = Object.values(paymentsArray).flat();
        } else {
          paymentsArray = [];
        }
      }
      
      if (paymentsArray.length === 0) {
        return {
          success: true,
          data: {
            totalPayments: 0,
            totalRevenue: 0,
            successfulPayments: 0,
            failedPayments: 0,
            pendingPayments: 0,
            refundedPayments: 0,
            averageAmount: 0,
            todayRevenue: 0,
            weeklyRevenue: 0,
            monthlyRevenue: 0
          }
        };
      }
      
      // Calculate statistics
      const stats = {
        totalPayments: paymentsArray.length,
        totalRevenue: 0,
        successfulPayments: 0,
        failedPayments: 0,
        pendingPayments: 0,
        refundedPayments: 0,
        averageAmount: 0,
        todayRevenue: 0,
        weeklyRevenue: 0,
        monthlyRevenue: 0
      };
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      
      paymentsArray.forEach(payment => {
        // Use amount_paid as the actual amount
        const amount = parseFloat(payment.amount_paid) || parseFloat(payment.amount) || 0;
        const status = payment.status?.toLowerCase() || 'unknown';
        const date = new Date(payment.created_at);
        
        // Total revenue and status counts
        if (status === 'success' || status === 'captured' || status === 'completed') {
          stats.totalRevenue += amount;
          stats.successfulPayments++;
        } else if (status === 'failed' || status === 'failure') {
          stats.failedPayments++;
        } else if (status === 'pending' || status === 'initiated') {
          stats.pendingPayments++;
        } else if (status === 'refunded') {
          stats.refundedPayments++;
        }
        
        // Time-based revenue
        if (!isNaN(date.getTime())) {
          if (date >= today) {
            stats.todayRevenue += amount;
          }
          if (date >= weekAgo) {
            stats.weeklyRevenue += amount;
          }
          if (date >= monthAgo) {
            stats.monthlyRevenue += amount;
          }
        }
      });
      
      stats.averageAmount = stats.totalPayments > 0 
        ? stats.totalRevenue / stats.totalPayments 
        : 0;
      
      return { success: true, data: stats };
    } catch (error) {
      console.error("Error calculating payment stats:", error);
      return { 
        success: false, 
        error: "Failed to calculate payment statistics" 
      };
    }
  }
};