"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
  BookOpen,
  Loader2,
} from "lucide-react";

import { useAssessment } from "@/helper/hooks/useAssessment";
import PDFTaskAssessment from "@/app/components/Assessment/PDFTaskAssessment";
import MCQAssessment from "@/app/components/Assessment/MCQAssessment";

const AssessmentWrapper = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status, update } = useSession();
  
  // Get program ID from params
  const programId = params?.id;
  
  // Get assessment details from URL params - safely
  const assessmentType = searchParams?.get('type') || null;
  const assessmentId = searchParams?.get('id') || null;

  const { 
    assessment, 
    loading, 
    error, 
    fetchAssessment,
    setError 
  } = useAssessment();

  const [isClient, setIsClient] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check session and redirect if not authenticated
  useEffect(() => {
    if (!isClient) return;

    const checkSession = async () => {
      try {
        if (status === "loading") {
          return;
        }

        if (status === "unauthenticated") {
          const returnUrl = `/programs/${programId}/assessment?type=${assessmentType || ''}&id=${assessmentId || ''}`;
          router.push(`/login?callbackUrl=${encodeURIComponent(returnUrl)}`);
          return;
        }

        // If authenticated but no access token, try to update
        if (session && !session.accessToken) {
          const updatedSession = await update();
          if (!updatedSession?.accessToken) {
            const returnUrl = `/programs/${programId}/assessment?type=${assessmentType || ''}&id=${assessmentId || ''}`;
            router.push(`/login?callbackUrl=${encodeURIComponent(returnUrl)}`);
            return;
          }
        }

        setSessionChecked(true);
      } catch (error) {
        console.error("Session check error:", error);
        const returnUrl = `/programs/${programId}/assessment?type=${assessmentType || ''}&id=${assessmentId || ''}`;
        router.push(`/login?callbackUrl=${encodeURIComponent(returnUrl)}`);
      }
    };

    checkSession();
  }, [status, session, update, router, programId, assessmentType, assessmentId, isClient]);

  // Fetch assessment data
  useEffect(() => {
    if (!isClient || !sessionChecked) return;
    
    // Only fetch if we have a program ID and session
    if (programId && session?.accessToken) {
    //   console.log('Fetching assessment with:', { 
    //     programId, 
    //     assessmentId: assessmentId || 'null',
    //     assessmentType: assessmentType || 'null'
    //   });
      
      // Pass assessmentId only if it's a valid string (not 'null' or 'undefined')
      const validAssessmentId = assessmentId && 
        assessmentId !== 'null' && 
        assessmentId !== 'undefined' ? 
        assessmentId : null;
      
      fetchAssessment(programId, validAssessmentId);
    }
  }, [programId, assessmentId, session, fetchAssessment, isClient, sessionChecked]);

  // Handle session expiry - redirect to login
  useEffect(() => {
    if (error) {
      console.error('Error in assessment:', error);
      
      // Check if it's an authentication error
      if (typeof error === 'string' && 
          (error.toLowerCase().includes('401') || 
           error.toLowerCase().includes('unauthorized') ||
           error.toLowerCase().includes('session'))) {
        
        // If we haven't retried too many times, try to refresh session
        if (retryCount < 2) {
          setRetryCount(prev => prev + 1);
          update().then(newSession => {
            if (newSession?.accessToken) {
              // Retry fetch with new session
              const validAssessmentId = assessmentId && 
                assessmentId !== 'null' && 
                assessmentId !== 'undefined' ? 
                assessmentId : null;
              fetchAssessment(programId, validAssessmentId);
            } else {
              // Redirect to login
              const returnUrl = `/programs/${programId}/assessment?type=${assessmentType || ''}&id=${assessmentId || ''}`;
              router.push(`/login?callbackUrl=${encodeURIComponent(returnUrl)}`);
            }
          });
        } else {
          // Redirect to login after max retries
          const returnUrl = `/programs/${programId}/assessment?type=${assessmentType || ''}&id=${assessmentId || ''}`;
          router.push(`/login?callbackUrl=${encodeURIComponent(returnUrl)}`);
        }
      }
    }
  }, [error, router, programId, assessmentType, assessmentId, update, fetchAssessment, retryCount]);

  // Loading state
  if (!isClient || status === "loading" || !sessionChecked || loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#D4A574]/30 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-[#CC0000] rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">
          {loading ? 'Loading assessment...' : 'Checking session...'}
        </p>
      </div>
    );
  }

  // Error state (non-auth errors)
  if (error && !error.toLowerCase().includes('401') && !error.toLowerCase().includes('unauthorized')) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-[#D4A574]/30">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#CC0000]/10 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-[#CC0000]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Assessment</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null);
              const validAssessmentId = assessmentId && 
                assessmentId !== 'null' && 
                assessmentId !== 'undefined' ? 
                assessmentId : null;
              fetchAssessment(programId, validAssessmentId);
            }}
            className="inline-flex items-center px-6 py-3 bg-[#CC0000] text-white rounded-lg hover:bg-[#B30000] transition-colors"
          >
            Try Again
          </button>
          <Link
            href={`/programs/${programId}`}
            className="inline-flex items-center ml-3 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft className="inline mr-2" size={20} />
            Back to Program
          </Link>
        </div>
      </div>
    );
  }

  // No assessment available
  if (!assessment) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-[#D4A574]/30">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-50 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Assessment Available</h2>
          <p className="text-gray-600 mb-6">This program doesn't have an assessment yet.</p>
          <Link
            href={`/programs/${programId}`}
            className="inline-flex items-center px-6 py-3 bg-[#CC0000] text-white rounded-lg hover:bg-[#B30000] transition-colors"
          >
            <ArrowLeft className="inline mr-2" size={20} />
            Back to Program
          </Link>
        </div>
      </div>
    );
  }

  // Determine assessment type from URL or from assessment data
  const type = assessmentType || assessment?.type || 'mcq';

//   console.log('Rendering assessment type:', type);

  // Render based on assessment type
  if (type === 'pdf_task') {
    return <PDFTaskAssessment assessment={assessment} programId={programId} />;
  }

  return <MCQAssessment assessment={assessment} programId={programId} />;
};

export default AssessmentWrapper;