// components/Assessment/MCQAssessment.js

"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  Download,
  RefreshCw,
  HelpCircle,
  BarChart3,
  Trophy,
  Grid3x3,
  Check,
  X,
  BookOpen,
  TrendingUp,
  Target,
  MessageSquare,
} from 'lucide-react';
import { useAssessment } from '@/helper/hooks/useAssessment';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';

const MCQAssessment = ({ 
  assessment, 
  programId, 
  showResults = false, 
  resultsData = null,
  onRequestReattempt,
  reattemptStatus,
}) => {
  const { submitMCQ } = useAssessment();
  const router = useRouter();
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [showResultsView, setShowResultsView] = useState(false);  
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showQuestionGrid, setShowQuestionGrid] = useState(false);
  const [showTimerWarning, setShowTimerWarning] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showReattemptModal, setShowReattemptModal] = useState(false);
  const [reattemptReason, setReattemptReason] = useState('');
  
  const searchParams = useSearchParams();
  const viewParam = searchParams?.get('view');
  const scoreParam = searchParams?.get('score');
  const passedParam = searchParams?.get('passed');
  const submittedAtParam = searchParams?.get('submitted_at');

  const questionRefs = useRef({});

  // Handle results from URL params
  useEffect(() => {
    if (viewParam === 'results' && scoreParam !== null && scoreParam !== undefined) {
      const score = parseFloat(scoreParam || '0');
      const passed = passedParam === 'true';
      
      const totalQuestions = assessment?.questions?.length || 4;
      
      setResults({
        score: score,
        total: totalQuestions,
        percentage: score,
        passed: passed,
      });
      
      if (assessment?.attempt?.certificate) {
        setCertificate(assessment.attempt.certificate);
      }
      
      setSubmitted(true);
      setShowResultsView(true);
    } else if (showResults && resultsData) {
      setResults(resultsData);
      setSubmitted(true);
      setShowResultsView(true);
    }
  }, [viewParam, scoreParam, passedParam, submittedAtParam, assessment, showResults, resultsData]);

  // Initialize questions
  useEffect(() => {
    if (showResultsView || submitted) return;
    if (isRetrying) return;

    if (assessment?.questions) {
      const transformedQuestions = assessment.questions.map((q) => {
        const options = [
          { label: "A", value: q.option_a },
          { label: "B", value: q.option_b },
          { label: "C", value: q.option_c },
          { label: "D", value: q.option_d },
        ].filter(opt => opt.value && opt.value.trim() !== "");

        return {
          id: q.id,
          question: q.question_text,
          description: q.description || "",
          options: options,
          correct_answer: q.correct_answer || "A",
          marks: q.marks || 1,
        };
      });
      setQuestions(transformedQuestions);
      
      if (assessment.duration_minutes) {
        setTimeRemaining(assessment.duration_minutes * 60);
      }
    }
  }, [assessment, showResultsView, submitted, isRetrying]);

  // Timer
  useEffect(() => {
    if (!timeRemaining || submitted || showResultsView) return;

    if (timeRemaining <= 60) {
      setShowTimerWarning(true);
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, submitted, showResultsView]);

  const formatTime = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (!timeRemaining) return 'text-gray-600';
    if (timeRemaining < 60) return 'text-red-600 animate-pulse';
    if (timeRemaining < 300) return 'text-orange-500';
    return 'text-gray-600';
  };

  const handleAnswerSelect = (questionId, optionLabel) => {
    if (submitted || showResultsView) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionLabel,
    }));
  };

  const handleSubmit = async (autoSubmit = false) => {
    const unanswered = questions.filter(q => !answers[q.id]);
    
    if (!autoSubmit && unanswered.length > 0) {
      setShowConfirmModal(true);
      return;
    }

    await performSubmit();
  };

  const performSubmit = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    setSubmitted(true);

    try {
      const answerPayload = questions.map((q) => ({
        question_id: q.id,
        selected_option: answers[q.id] || "",
      }));

      const response = await submitMCQ(programId, assessment.id, answerPayload);

      if (response?.meta?.status === 200) {
        const resultData = response.data;
        setResults({
          score: resultData.percentage || resultData.score || 0,
          total: resultData.total || questions.length,
          percentage: resultData.percentage || 0,
          passed: resultData.passed || false,
          correct_answers: resultData.correct_answers,
          wrong_answers: resultData.wrong_answers,
          answers: resultData.answers || [],
        });
        
        if (resultData.certificate) {
          setCertificate(resultData.certificate);
        }
        
        setShowResultsView(true);
      } else {
        setSubmitted(false);
        alert(response?.meta?.message || 'Failed to submit assessment');
      }
    } catch (error) {
      console.error('Error submitting MCQ:', error);
      setSubmitted(false);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReattemptRequest = () => {
    setReattemptReason('');
    setShowReattemptModal(true);
  };

  const handleSubmitReattempt = useCallback(() => {
    if (!reattemptReason || !reattemptReason.trim()) {
      toast.error('Please provide a reason for requesting a reattempt.');
      return;
    }
    
    if (onRequestReattempt) {
      onRequestReattempt(reattemptReason.trim());
      setShowReattemptModal(false);
      setReattemptReason('');
    }
  }, [reattemptReason, onRequestReattempt]);

  const getProgressPercentage = () => {
    if (questions.length === 0) return 0;
    return Math.round((answeredCount / questions.length) * 100);
  };

  const getQuestionStatus = (questionId) => {
    if (answers[questionId]) return 'answered';
    if (flaggedQuestions.has(questionId)) return 'flagged';
    return 'unanswered';
  };

  const getStats = () => {
    const answered = Object.keys(answers).filter(key => answers[key]).length;
    const flagged = flaggedQuestions.size;
    const unanswered = questions.length - answered;
    return { answered, flagged, unanswered, total: questions.length };
  };

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).filter(key => answers[key]).length;
  const stats = getStats();
  
// Results View - Modern Redesign
if (showResultsView && results) {
  const passed = results.passed || results.score >= (assessment?.passing_score || 60);
  const score = results.percentage || results.score || 0;
  const submittedAt = results.submitted_at || assessment?.attempt?.submitted_at;
  
  // Check if we have detailed stats
  const hasCorrectData = results.correct_answers !== undefined && results.correct_answers !== null;
  const hasWrongData = results.wrong_answers !== undefined && results.wrong_answers !== null;
  const hasDetailedStats = hasCorrectData && hasWrongData;
  
  const correctCount = hasCorrectData ? results.correct_answers : 0;
  const wrongCount = hasWrongData ? results.wrong_answers : 0;
  const totalQuestions = assessment?.questions?.length || results.total || 0;
  const accuracy = hasDetailedStats && totalQuestions > 0 
    ? Math.round((correctCount / totalQuestions) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDF8F0] via-white to-[#FDF8F0] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link
          href={`/programs/${programId}`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-[#CC0000] transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Program
        </Link>

        {/* Main Results Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#D4A574]/10">
          {/* Hero Section */}
          <div className={`relative px-6 py-8 text-center ${
            passed 
              ? 'bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100/50' 
              : 'bg-gradient-to-br from-orange-50 via-red-50 to-rose-100/50'
          }`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative">
              {/* Status Badge */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
                passed 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {passed ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                {passed ? 'Passed' : 'Failed'}
              </div>

              {/* Score Circle */}
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 mx-auto">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                    <circle
                      className="text-gray-200"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="52"
                      cx="60"
                      cy="60"
                    />
                    <circle
                      className={passed ? 'text-emerald-500' : 'text-red-500'}
                      strokeWidth="8"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="52"
                      cx="60"
                      cy="60"
                      strokeDasharray={326.72}
                      strokeDashoffset={326.72 * (1 - Math.min(score / 100, 1))}
                      style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-4xl font-bold ${passed ? 'text-emerald-600' : 'text-red-600'}`}>
                      {score}%
                    </span>
                  </div>
                </div>
              </div>

              <h2 className={`text-2xl font-bold ${passed ? 'text-emerald-700' : 'text-red-700'}`}>
                {passed ? '🎉 Excellent Work!' : 'Keep Learning!'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {passed 
                  ? 'You have successfully passed the assessment!' 
                  : 'Review the material and try again to pass.'}
              </p>
              {submittedAt && (
                <p className="text-xs text-gray-400 mt-2">
                  Submitted on {new Date(submittedAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="px-6 py-4 border-b border-[#D4A574]/10">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* Score Badge */}
              <div className="flex items-center gap-2 px-4 py-2 bg-[#FDF8F0] rounded-xl border border-[#D4A574]/10">
                <BarChart3 className="w-4 h-4 text-[#CC0000]" />
                <span className="text-sm font-medium text-gray-700">{score}%</span>
                <span className="text-xs text-gray-400">Score</span>
              </div>

              {/* Correct - Show only if available */}
              {hasDetailedStats && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl border border-green-100">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">{correctCount}</span>
                  <span className="text-xs text-green-600">Correct</span>
                </div>
              )}

              {/* Incorrect - Show only if available */}
              {hasDetailedStats && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-xl border border-red-100">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-600">{wrongCount}</span>
                  <span className="text-xs text-red-500">Incorrect</span>
                </div>
              )}

              {/* Accuracy - Show only if available */}
              {hasDetailedStats && (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">{accuracy}%</span>
                  <span className="text-xs text-blue-600">Accuracy</span>
                </div>
              )}

              {/* Certificate Badge */}
              {passed && certificate && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-medium text-amber-700">Certificate</span>
                </div>
              )}
            </div>
          </div>

          {/* Reattempt Section - Show if failed */}
          {!passed && !reattemptStatus && (
            <div className="px-6 py-4 border-b border-[#D4A574]/10">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                      <RefreshCw className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-800 text-sm">Request a Reattempt</h4>
                      <p className="text-xs text-amber-700 max-w-md">
                        Didn't pass? Request a reattempt with a different assessment. 
                        An admin will review your request.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleReattemptRequest}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow-md flex-shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Request Reattempt
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reattempt Status */}
          {reattemptStatus === 'pending' && (
            <div className="px-6 py-4 border-b border-[#D4A574]/10">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 text-sm">Reattempt Request Pending</h4>
                    <p className="text-xs text-blue-700">
                      Your request has been submitted. An admin will review it and assign a new assessment.
                      You will be notified once the request is approved or rejected.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Certificate Section */}
          {passed && certificate && (
            <div className="px-6 py-4 border-b border-[#D4A574]/10 bg-gradient-to-r from-[#FDF8F0] to-white">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#CC0000]/10 rounded-xl">
                    <Award className="w-5 h-5 text-[#CC0000]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Certificate of Completion</h4>
                    <p className="text-xs text-gray-500 font-mono">{certificate.certificate_code}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (certificate.certificate_url) {
                      window.open(certificate.certificate_url, '_blank');
                    } else {
                      toast.info('Certificate download will be available soon.');
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#CC0000] hover:bg-[#B30000] text-white rounded-lg transition-all text-sm font-medium shadow-sm hover:shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Certificate
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="px-6 py-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/programs/${programId}`}
              className="inline-flex items-center px-5 py-2.5 bg-[#CC0000] hover:bg-[#B30000] text-white rounded-lg transition-all text-sm font-medium shadow-sm hover:shadow-md"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Program
            </Link>
            
            {passed && (
              <button
                onClick={() => {
                  // Share or print results
                  if (navigator.share) {
                    navigator.share({
                      title: 'Assessment Results',
                      text: `I scored ${score}% on ${assessment?.title || 'the assessment'}!`,
                      url: window.location.href,
                    }).catch(() => {});
                  }
                }}
                className="inline-flex items-center px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all text-sm font-medium"
              >
                <MessageSquare size={16} className="mr-2" />
                Share Results
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reattempt Modal */}
      {showReattemptModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#D4A574]/20 animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <RefreshCw className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Request Reattempt</h3>
              <p className="text-sm text-gray-600 mt-1">
                Please provide a reason for requesting a reattempt.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Reason for Reattempt *
              </label>
              <textarea
                value={reattemptReason}
                onChange={(e) => setReattemptReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent text-sm resize-none"
                placeholder="Explain why you need a reattempt..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReattemptModal(false);
                  setReattemptReason('');
                }}
                className="flex-1 px-4 py-2 border-2 border-[#D4A574]/20 text-gray-700 rounded-xl hover:bg-[#FDF8F0] transition-all font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReattempt}
                disabled={!reattemptReason.trim()}
                className="flex-1 px-4 py-2 bg-[#CC0000] text-white rounded-xl hover:bg-[#B30000] transition-all font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
  // Assessment taking view
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#CC0000]" />
          <p className="text-gray-500 text-sm">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDF8F0] via-white to-[#FDF8F0]">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#D4A574]/10 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href={`/programs/${programId}`}
                className="p-2 hover:bg-[#FDF8F0] rounded-xl transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </Link>
              <div>
                <h1 className="text-sm font-semibold text-gray-900 truncate">
                  {assessment?.title}
                </h1>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {totalQuestions} Questions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-[#FDF8F0] rounded-xl">
                <span className="text-xs text-gray-500">Progress:</span>
                <span className="text-sm font-semibold text-[#CC0000]">{getProgressPercentage()}%</span>
              </div>

              {timeRemaining !== null && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border ${
                  getTimeColor()
                } bg-white/80 shadow-sm ${timeRemaining < 60 ? 'border-red-300' : 'border-[#D4A574]/20'}`}>
                  <Clock className={`w-4 h-4 ${timeRemaining < 60 ? 'animate-pulse' : ''}`} />
                  <span className="font-mono">{formatTime(timeRemaining)}</span>
                </div>
              )}

              <button
                onClick={() => setShowQuestionGrid(!showQuestionGrid)}
                className="p-2 hover:bg-[#FDF8F0] rounded-xl transition-colors border border-[#D4A574]/20"
                title="Question Navigator"
              >
                <Grid3x3 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Timer Warning Banner */}
      {showTimerWarning && !submitted && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-200 animate-pulse">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-700 flex items-center gap-2">
                <Clock className="w-4 h-4 animate-pulse" />
                Less than 1 minute remaining!
              </span>
              <span className="text-sm font-bold text-red-600">{formatTime(timeRemaining)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Question Grid Sidebar */}
          {showQuestionGrid && (
            <div className="hidden md:block w-72 shrink-0">
              <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-24 border border-[#D4A574]/10 max-h-[70vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 text-sm">Questions</h4>
                  <span className="text-xs text-gray-500">{answeredCount}/{totalQuestions}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <Check className="w-4 h-4 text-green-600 mx-auto" />
                    <span className="text-xs font-medium text-green-700">{stats.answered}</span>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded-lg">
                    <Flag className="w-4 h-4 text-yellow-600 mx-auto" />
                    <span className="text-xs font-medium text-yellow-700">{stats.flagged}</span>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-gray-500 mx-auto" />
                    <span className="text-xs font-medium text-gray-700">{stats.unanswered}</span>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, index) => {
                    const status = getQuestionStatus(q.id);
                    const isCurrent = index === currentQuestionIndex;
                    
                    let bgColor = 'bg-gray-100 text-gray-600 hover:bg-gray-200';
                    if (status === 'answered') bgColor = 'bg-green-100 text-green-700 hover:bg-green-200';
                    if (status === 'flagged') bgColor = 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
                    
                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          setCurrentQuestionIndex(index);
                          setShowQuestionGrid(false);
                        }}
                        className={`w-full aspect-square rounded-xl text-sm font-medium transition-all ${
                          isCurrent ? 'ring-2 ring-[#CC0000] ring-offset-2' : ''
                        } ${bgColor}`}
                      >
                        {index + 1}
                        {status === 'answered' && <Check className="w-2 h-2 inline ml-0.5" />}
                        {status === 'flagged' && <Flag className="w-2 h-2 inline ml-0.5" />}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setShowQuestionGrid(false)}
                  className="w-full mt-4 py-2 text-sm text-gray-500 hover:text-gray-700 border-t border-[#D4A574]/10 pt-3"
                >
                  Close Navigator
                </button>
              </div>
            </div>
          )}

          {/* Question Card */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-[#D4A574]/10">
              {/* Question Header */}
              <div className="p-5 border-b border-[#D4A574]/10 bg-[#FDF8F0]/30">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">
                      Question <span className="text-[#CC0000] font-bold">{currentQuestionIndex + 1}</span>
                      <span className="text-gray-400"> / {totalQuestions}</span>
                    </span>
                    {answers[currentQuestion.id] && (
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Answered
                      </span>
                    )}
                    {flaggedQuestions.has(currentQuestion.id) && (
                      <span className="text-xs font-medium text-yellow-700 bg-yellow-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Flag className="w-3 h-3" />
                        Flagged
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const newSet = new Set(flaggedQuestions);
                      if (newSet.has(currentQuestion.id)) {
                        newSet.delete(currentQuestion.id);
                      } else {
                        newSet.add(currentQuestion.id);
                      }
                      setFlaggedQuestions(newSet);
                    }}
                    className={`p-2 rounded-xl transition-all ${
                      flaggedQuestions.has(currentQuestion.id)
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'hover:bg-[#FDF8F0] text-gray-400'
                    }`}
                    title="Flag for review"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-[#D4A574]/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#CC0000] to-[#FF4444] rounded-full transition-all duration-500"
                      style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {answeredCount}/{totalQuestions}
                  </span>
                </div>
              </div>

              {/* Question Body */}
              <div className="p-6 sm:p-8">
                <div className="mb-6">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-10 h-10 bg-[#CC0000]/10 rounded-xl flex items-center justify-center">
                      <span className="text-sm font-bold text-[#CC0000]">{currentQuestionIndex + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-900 leading-relaxed">
                        {currentQuestion.question}
                      </p>
                      {currentQuestion.description && (
                        <div className="mt-3 text-sm text-gray-500 bg-[#FDF8F0] p-4 rounded-xl border border-[#D4A574]/10">
                          {currentQuestion.description}
                        </div>
                      )}
                      {currentQuestion.marks && (
                        <span className="inline-block mt-3 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {currentQuestion.marks} mark{currentQuestion.marks > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options?.map((option) => {
                    const isSelected = answers[currentQuestion.id] === option.label;

                    return (
                      <button
                        key={option.label}
                        onClick={() => handleAnswerSelect(currentQuestion.id, option.label)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all group ${
                          isSelected
                            ? 'border-[#CC0000] bg-[#FDF8F0] shadow-md'
                            : 'border-[#D4A574]/20 hover:border-[#CC0000]/30 hover:bg-[#FDF8F0] hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                            isSelected
                              ? 'border-2 border-[#CC0000] bg-[#CC0000] text-white shadow-sm'
                              : 'border-2 border-[#D4A574]/40 text-gray-500 group-hover:border-[#CC0000]/40'
                          }`}>
                            {option.label}
                          </div>
                          <span className={`text-sm sm:text-base pt-1 ${
                            isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'
                          }`}>
                            {option.value}
                          </span>
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-[#CC0000] ml-auto shrink-0 mt-1" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="flex-1 sm:flex-none px-5 py-2.5 border-2 border-[#D4A574]/20 text-gray-700 rounded-xl hover:bg-[#FDF8F0] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>
                    {currentQuestionIndex < totalQuestions - 1 ? (
                      <button
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        className="flex-1 sm:flex-none px-5 py-2.5 bg-[#CC0000] text-white rounded-xl hover:bg-[#B30000] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSubmit()}
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Submit Assessment
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 sm:ml-auto flex items-center gap-2">
                    <span>{answeredCount} answered</span>
                    <span className="text-gray-300">•</span>
                    <span>{stats.flagged} flagged</span>
                  </div>
                </div>

                {stats.unanswered > 0 && currentQuestionIndex === totalQuestions - 1 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3 animate-pulse">
                    <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        {stats.unanswered} question{stats.unanswered > 1 ? 's' : ''} remaining
                      </p>
                      <p className="text-xs text-yellow-700 mt-0.5">
                        Review flagged questions before submitting
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Question Palette */}
            <div className="mt-4 bg-white rounded-2xl shadow-lg p-4 md:hidden border border-[#D4A574]/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Questions</span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-green-600">
                    <Check className="w-3 h-3" /> {stats.answered}
                  </span>
                  <span className="flex items-center gap-1 text-yellow-600">
                    <Flag className="w-3 h-3" /> {stats.flagged}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-8 gap-1.5">
                {questions.map((q, index) => {
                  const status = getQuestionStatus(q.id);
                  const isCurrent = index === currentQuestionIndex;
                  
                  let bgColor = 'bg-gray-100 text-gray-600';
                  if (status === 'answered') bgColor = 'bg-green-100 text-green-700';
                  if (status === 'flagged') bgColor = 'bg-yellow-100 text-yellow-700';
                  
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-full aspect-square rounded-lg text-xs font-medium transition-all ${
                        isCurrent ? 'ring-2 ring-[#CC0000] ring-offset-2' : ''
                      } ${bgColor}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-[#D4A574]/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Flagged</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-[#CC0000] rounded-full"></div>
                <span>Current</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#D4A574]/20 animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Submit Assessment?</h3>
              <div className="mb-4">
                <p className="text-gray-600">
                  You have <span className="font-semibold text-yellow-600">{stats.unanswered}</span> unanswered question{stats.unanswered > 1 ? 's' : ''}.
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  <span className="font-semibold text-yellow-600">{stats.flagged}</span> question{stats.flagged > 1 ? 's' : ''} flagged for review.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-[#D4A574]/20 text-gray-700 rounded-xl hover:bg-[#FDF8F0] transition-all font-medium"
                >
                  Continue
                </button>
                <button
                  onClick={performSubmit}
                  className="flex-1 px-4 py-2.5 bg-[#CC0000] text-white rounded-xl hover:bg-[#B30000] transition-all font-medium shadow-md"
                >
                  Submit Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCQAssessment;