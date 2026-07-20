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
      return response;
    } catch (error) {
      console.error('Error fetching certificate by code:', error);
      throw error;
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
    return `${process.env.NEXT_PUBLIC_APP_URL}/certificates/verify/${code}`;
  },
};