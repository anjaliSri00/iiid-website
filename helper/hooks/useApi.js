// hooks/useApi.js
import { useSession } from "next-auth/react";
import { useCallback } from "react";

export const useApi = () => {
  const { data: session, status, update } = useSession();

  const apiCall = useCallback(async (url, options = {}) => {
    // Wait for session to be ready
    if (status === 'loading') {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Get fresh session if needed
    let currentSession = session;
    if (!currentSession?.accessToken) {
      // Try to update session
      currentSession = await update();
    }

    if (!currentSession?.accessToken) {
      console.error('No access token available');
      throw new Error('Authentication required');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': currentSession.accessToken,
        'Refresh-Token': currentSession.refreshToken,
        ...options.headers,
      },
    });

    // Handle token expiry
    if (response.status === 401) {
      // Try to refresh session
      const newSession = await update();
      if (newSession?.accessToken) {
        // Retry with new token
        return apiCall(url, options);
      }
    }

    return response;
  }, [session, status, update]);

  return { apiCall, session, status };
};