// app/programs/[id]/assessment/page.js (AssessmentWrapper)

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
  RefreshCw,
  Clock,
  CheckCircle,
} from "lucide-react";

import { useAssessment } from "@/helper/hooks/useAssessment";
import PDFTaskAssessment from "@/app/components/Assessment/PDFTaskAssessment";
import MCQAssessment from "@/app/components/Assessment/MCQAssessment";
import { assessmentApi } from "@/helper/services/assessmentApi";
import { toast } from "react-toastify";

const AssessmentWrapper = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status, update } = useSession();
  
  const programId = params?.id;
  const assessmentType = searchParams?.get('type') || null;
  const assessmentId = searchParams?.get('id') || null;
  
  // Check for results view
  const viewParam = searchParams?.get('view');
  const scoreParam = searchParams?.get('score');
  const passedParam = searchParams?.get('passed');
  const submittedAtParam = searchParams?.get('submitted_at');

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
  const [showResultsDirectly, setShowResultsDirectly] = useState(false);
  const [resultsData, setResultsData] = useState(null);
  const [isRequestingReattempt, setIsRequestingReattempt] = useState(false);
  const [reattemptStatus, setReattemptStatus] = useState(null);
  const [showReattemptModal, setShowReattemptModal] = useState(false);
  const [reattemptReason, setReattemptReason] = useState('');

  useEffect(() => {
    setIsClient(true);
    
    // Check if we should show results directly
    if (viewParam === 'results' && scoreParam !== null) {
      setShowResultsDirectly(true);
      setResultsData({
        score: parseFloat(scoreParam || '0'),
        passed: passedParam === 'true',
        submitted_at: submittedAtParam || '',
        percentage: parseFloat(scoreParam || '0'),
        total: 4,
        correct_answers: 0,
        wrong_answers: 0,
      });
    }
  }, [viewParam, scoreParam, passedParam, submittedAtParam]);

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

  // Fetch assessment data (only if not showing results directly)
  useEffect(() => {
    if (!isClient || !sessionChecked || showResultsDirectly) return;
    
    if (programId && session?.accessToken) {
      const validAssessmentId = assessmentId && 
        assessmentId !== 'null' && 
        assessmentId !== 'undefined' ? 
        assessmentId : null;
      
      fetchAssessment(programId, validAssessmentId);
    }
  }, [programId, assessmentId, session, fetchAssessment, isClient, sessionChecked, showResultsDirectly]);

  // Handle reattempt request
  const handleRequestReattempt = async () => {
    if (!reattemptReason.trim()) {
      alert('Please provide a reason for requesting a reattempt.');
      return;
    }

    setIsRequestingReattempt(true);
    try {
      const response = await assessmentApi.requestReattempt(
        programId,
        {
          course_id: parseInt(programId),
          old_assessment_id: parseInt(assessmentId || assessment?.id || 0),
          reason: reattemptReason.trim(),
        },
        session
      );

      if (response?.meta?.status === 200) {
        setReattemptStatus('pending');
        setShowReattemptModal(false);
      toast.success('Reattempt request submitted successfully! An admin will review your request.');
      setReattemptReason(''); // Clear after submission
      }
    } catch (error) {
      console.error('Error requesting reattempt:', error);
      toast.error('Failed to request reattempt. Please try again.');
    } finally {
      setIsRequestingReattempt(false);
    }
  };

  // If showing results directly, render MCQ component with results data
  if (showResultsDirectly && resultsData) {
    const mockAssessment = {
      ...assessment,
      id: parseInt(assessmentId || '0'),
      title: assessment?.title || 'Assessment',
      type: assessmentType || 'mcq',
      attempt: {
        score: resultsData.score,
        passed: resultsData.passed,
        submitted_at: resultsData.submitted_at,
        review_status: 'graded'
      }
    };
    
    return (
      // <MCQAssessment 
      //   assessment={mockAssessment} 
      //   programId={programId} 
      //   showResults={true}
      //   resultsData={resultsData}
      //   onRequestReattempt={handleRequestReattempt}
      //   reattemptStatus={reattemptStatus}
      // />
       <MCQAssessment 
    assessment={mockAssessment} 
    programId={programId} 
    showResults={true}
    resultsData={resultsData}
    onRequestReattempt={handleRequestReattempt}
    reattemptStatus={reattemptStatus}
    reattemptReason={reattemptReason}
    setReattemptReason={setReattemptReason}
  />
    );
  }

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

  // Error state
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
            className="inline-flex items-center px-6 py-3 bg-[#CC0000] text-white hover:bg-[#B30000] transition-colors"
          >
            Try Again
          </button>
          <Link
            href={`/programs/${programId}`}
            className="inline-flex items-center ml-3 px-6 py-3 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
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
            className="inline-flex items-center px-6 py-3 bg-[#CC0000] text-white hover:bg-[#B30000] transition-colors"
          >
            <ArrowLeft className="inline mr-2" size={20} />
            Back to Program
          </Link>
        </div>
      </div>
    );
  }

  // Determine assessment type
  const type = assessmentType || assessment?.type || 'mcq';

  // Render based on assessment type
  if (type === 'pdf_task') {
    return (
      <PDFTaskAssessment 
        assessment={assessment} 
        programId={programId}
        onRequestReattempt={handleRequestReattempt}
        reattemptStatus={reattemptStatus}
      />
    );
  }

  return (
    <MCQAssessment 
      assessment={assessment} 
      programId={programId}
      onRequestReattempt={handleRequestReattempt}
      reattemptReason={reattemptReason}
    setReattemptReason={setReattemptReason}
      reattemptStatus={reattemptStatus}
    />
  );
};

export default AssessmentWrapper;