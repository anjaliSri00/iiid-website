// src/helper/services/certificateApi.js
import fetchApiResponse from "../api_data_store";

export const certificateApi = {
  /**
   * Get user's certificate for a specific course
   * GET /api/v1/certificates/me?course_id={courseId}
   */
  getMyCertificate: async (courseId, session) => {
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/certificates/me?course_id=${courseId}`,
        {
          method: 'GET',
          headers: {
            'Access-Token': session?.accessToken,
            'Refresh-Token': session?.refreshToken,
          },
        }
      );
      
      // Handle 403 specifically - user hasn't passed assessment yet
      if (response.meta?.status === 403) {
        return {
          success: false,
          eligible: false,
          needsAssessment: true,
          message: response.meta?.message || 'Complete the assessment to earn your certificate',
          data: null
        };
      }
      
      // Handle 404 - no certificate found but user might be eligible
      if (response.meta?.status === 404) {
        return {
          success: false,
          eligible: true,
          needsAssessment: false,
          message: 'No certificate found, but you may be eligible',
          data: null
        };
      }
      
      if (response.meta?.status === 200 && response.data) {
        return {
          success: true,
          eligible: true,
          needsAssessment: false,
          message: 'Certificate found',
          data: response.data
        };
      }
      
      return {
        success: false,
        eligible: false,
        needsAssessment: false,
        message: response.meta?.message || 'Failed to fetch certificate',
        data: null
      };
    } catch (error) {
      console.error('Error fetching certificate:', error);
      return {
        success: false,
        eligible: false,
        needsAssessment: false,
        message: 'Error fetching certificate',
        data: null,
        error: error
      };
    }
  },

  /**
   * Get all certificates for the current user with pagination and filters
   * GET /api/v1/certificates/my-certificates
   */
  getUserCertificates: async (session, filters = {}) => {
    try {
      const {
        course_id,
        certificate_code,
        search,
        from_date,
        to_date,
        page = 1,
        limit = 10
      } = filters;

      // Build query string
      const queryParams = new URLSearchParams();
      if (course_id) queryParams.append('course_id', course_id);
      if (certificate_code) queryParams.append('certificate_code', certificate_code);
      if (search) queryParams.append('search', search);
      if (from_date) queryParams.append('from_date', from_date);
      if (to_date) queryParams.append('to_date', to_date);
      queryParams.append('page', page);
      queryParams.append('limit', limit);

      // const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/certificates/my-certificates`;
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/certificates/my-certificates${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetchApiResponse(
        url,
        {
          method: 'GET',
          headers: {
            'Access-Token': session?.accessToken,
            'Refresh-Token': session?.refreshToken,
          },
        }
      );
      
      if (response.meta?.status === 200 && response.data) {
        return {
          success: true,
          data: response.data,
          meta: response.meta,
          message: response.meta?.message || 'Certificates fetched successfully'
        };
      }
      
      return {
        success: false,
        data: null,
        message: response.meta?.message || 'Failed to fetch certificates'
      };
    } catch (error) {
      console.error('Error fetching user certificates:', error);
      return {
        success: false,
        data: null,
        message: 'Error fetching certificates'
      };
    }
  },

  /**
   * Get all certificates (Admin only)
   * GET /api/v1/certificates/admin/all
   */
  getAllCertificates: async (session, filters = {}) => {
    try {
      const {
        user_id,
        course_id,
        certificate_code,
        search,
        from_date,
        to_date,
        page = 1,
        limit = 10
      } = filters;

      // Build query string
      const queryParams = new URLSearchParams();
      if (user_id) queryParams.append('user_id', user_id);
      if (course_id) queryParams.append('course_id', course_id);
      if (certificate_code) queryParams.append('certificate_code', certificate_code);
      if (search) queryParams.append('search', search);
      if (from_date) queryParams.append('from_date', from_date);
      if (to_date) queryParams.append('to_date', to_date);
      queryParams.append('page', page);
      queryParams.append('limit', limit);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/certificates/admin/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetchApiResponse(
        url,
        {
          method: 'GET',
          headers: {
            'Access-Token': session?.accessToken,
            'Refresh-Token': session?.refreshToken,
          },
        }
      );
      
      if (response.meta?.status === 200 && response.data) {
        return {
          success: true,
          data: response.data,
          meta: response.meta,
          message: response.meta?.message || 'Certificates fetched successfully'
        };
      }
      
      return {
        success: false,
        data: null,
        message: response.meta?.message || 'Failed to fetch certificates'
      };
    } catch (error) {
      console.error('Error fetching all certificates:', error);
      return {
        success: false,
        data: null,
        message: 'Error fetching certificates'
      };
    }
  },

  /**
   * Check if user is eligible for certificate
   * This handles both 403 (not passed) and 404 (no certificate yet) responses
   */
  checkCertificateEligibility: async (courseId, session) => {
    try {
      const result = await certificateApi.getMyCertificate(courseId, session);
      
      // If certificate exists, user is eligible
      if (result.success && result.data) {
        return {
          success: true,
          eligible: true,
          certificateExists: true,
          data: result.data,
          message: 'Certificate already exists'
        };
      }
      
      // If 403 - user hasn't passed assessment
      if (result.needsAssessment) {
        return {
          success: false,
          eligible: false,
          certificateExists: false,
          needsAssessment: true,
          data: null,
          message: 'Complete the assessment to earn your certificate'
        };
      }
      
      // If 404 - no certificate but potentially eligible
      if (result.eligible) {
        return {
          success: false,
          eligible: true,
          certificateExists: false,
          needsAssessment: false,
          data: null,
          message: 'Eligible but certificate not generated yet'
        };
      }
      
      return {
        success: false,
        eligible: false,
        certificateExists: false,
        needsAssessment: false,
        data: null,
        message: result.message || 'Not eligible for certificate'
      };
    } catch (error) {
      console.error('Error checking certificate eligibility:', error);
      return {
        success: false,
        eligible: false,
        certificateExists: false,
        needsAssessment: false,
        data: null,
        message: 'Error checking eligibility'
      };
    }
  },

  /**
   * Get certificate by shareable code (public)
   * GET /api/v1/certificates/{code}
   */
  getCertificateByCode: async (code) => {
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/certificates/${code}`,
        {
          method: 'GET',
        }
      );
      
      if (response.meta?.status === 200 && response.data) {
        return {
          success: true,
          data: response.data,
          message: 'Certificate found'
        };
      }
      
      return {
        success: false,
        data: null,
        message: response.meta?.message || 'Certificate not found'
      };
    } catch (error) {
      console.error('Error fetching certificate by code:', error);
      return {
        success: false,
        data: null,
        message: 'Error fetching certificate'
      };
    }
  },


 downloadCertificate: async (courseId, session) => {
    try {
      if (!courseId) {
        return {
          success: false,
          message: 'Course ID is required'
        };
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/certificates/download?course_id=${courseId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Access-Token': session?.accessToken,
          'Refresh-Token': session?.refreshToken,
          'Content-Type': 'application/json',
        },
      });

      // Check if response is ok
      if (!response.ok) {
        // Try to parse error message from response
        let errorMessage = `Download failed: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.meta?.message) {
            errorMessage = errorData.meta.message;
          }
        } catch (e) {
          // If response is not JSON, use default error
        }
        
        // Handle specific status codes
        if (response.status === 403) {
          return {
            success: false,
            message: 'You have not passed the assessment for this course',
            needsAssessment: true
          };
        } else if (response.status === 404) {
          return {
            success: false,
            message: 'Certificate not found. Please generate the certificate first.'
          };
        }
        
        return {
          success: false,
          message: errorMessage
        };
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Check if blob is empty
      if (blob.size === 0) {
        return {
          success: false,
          message: 'Downloaded file is empty'
        };
      }
      
      // Get filename from Content-Disposition header if available
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `certificate-${courseId}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      return {
        success: true,
        blob: blob,
        filename: filename
      };
    } catch (error) {
      console.error('Error downloading certificate:', error);
      return {
        success: false,
        message: error.message || 'Failed to download certificate',
        error: error
      };
    }
  },

  /**
   * Generate/Regenerate certificate for an enrollment
   * POST /api/v1/certificates/regenerate/{enrollmentId}
   * (Admin only)
   */
  regenerateCertificate: async (enrollmentId, session) => {
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/certificates/regenerate/${enrollmentId}`,
        {
          method: 'POST',
          headers: {
            'Access-Token': session?.accessToken,
            'Refresh-Token': session?.refreshToken,
          },
        }
      );
      return response;
    } catch (error) {
      console.error('Error regenerating certificate:', error);
      throw error;
    }
  },

  /**
   * Generate a shareable link for certificate
   */
  getShareableLink: (code) => {
    return `${process.env.NEXT_PUBLIC_APP_URL}/certificates/${code}`;
  },
};