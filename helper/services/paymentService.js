// services/paymentService.js

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
        // Handle different response structures
        let paymentsData = response.data;
        
        // If data has payments_list property, use that
        if (paymentsData.payments_list) {
          // Check if payments_list is an object with numeric keys
          if (typeof paymentsData.payments_list === 'object' && !Array.isArray(paymentsData.payments_list)) {
            // Convert object to array
            const paymentsArray = Object.values(paymentsData.payments_list);
            return { 
              success: true, 
              data: paymentsArray,
              pagination: response.meta?.pagination || {}
            };
          } else if (Array.isArray(paymentsData.payments_list)) {
            // If it's already an array
            return { 
              success: true, 
              data: paymentsData.payments_list,
              pagination: response.meta?.pagination || {}
            };
          }
        }
        
        // If data is directly an array
        if (Array.isArray(paymentsData)) {
          return { 
            success: true, 
            data: paymentsData,
            pagination: response.meta?.pagination || {}
          };
        }
        
        // If data is an object with numeric keys (like {0: {...}, 1: {...}})
        if (typeof paymentsData === 'object' && paymentsData !== null) {
          const paymentsArray = Object.values(paymentsData);
          return { 
            success: true, 
            data: paymentsArray,
            pagination: response.meta?.pagination || {}
          };
        }
        
        return { 
          success: true, 
          data: [],
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
      
      // If payments is not an array, try to convert it
      if (!Array.isArray(paymentsArray)) {
        if (typeof paymentsArray === 'object' && paymentsArray !== null) {
          paymentsArray = Object.values(paymentsArray);
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
        const amount = parseFloat(payment.amount) || 0;
        const status = payment.status?.toLowerCase() || 'unknown';
        const date = new Date(payment.created_at);
        
        // Total revenue and status counts
        if (status === 'success' || status === 'captured') {
          stats.totalRevenue += amount;
          stats.successfulPayments++;
        } else if (status === 'failed') {
          stats.failedPayments++;
        } else if (status === 'pending') {
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