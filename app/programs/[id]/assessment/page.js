// app/programs/[id]/assessment/page.jsx

"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Flag,
  Send,
  RefreshCw,
  Timer,
  HelpCircle,
} from "lucide-react";
import { assessmentApi } from "@/helper/services/assessmentApi";

const AssessmentPage = () => {
  const params = useParams();
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const programId = params.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [assessmentId, setAssessmentId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [startTime, setStartTime] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch assessment data
  useEffect(() => {
    if (programId && isClient && status !== "loading") {
      fetchAssessmentData();
    }
  }, [programId, isClient, status]);

  // Timer
  useEffect(() => {
    if (!timeRemaining || submitted || showResults) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, submitted, showResults]);

  const fetchAssessmentData = async () => {
    setLoading(true);
    setError(null);

    try {
      let currentSession = session;
      if (!currentSession?.accessToken) {
        currentSession = await update();
      }

      if (!currentSession?.accessToken) {
        throw new Error("No access token available");
      }

      // Fetch assessment using the API
      const response = await assessmentApi.getAssessment(programId, currentSession);
      
      console.log("Assessment API Response:", response);

      if (response?.meta?.status === 200 && response?.data) {
        const data = response.data;
        setAssessment(data);
        setAssessmentId(data.id);
        
        // Transform questions to a consistent format
        const transformedQuestions = (data.questions || []).map((q) => ({
          id: q.id,
          question: q.question_text,
          description: q.description || "",
          options: [
            q.option_a,
            q.option_b,
            q.option_c,
            q.option_d,
          ].filter(opt => opt && opt.trim() !== ""),
          correct_answer: q.correct_answer || 0,
          marks: q.marks || 1,
          order_number: q.order_number || 0,
        }));
        
        setQuestions(transformedQuestions);
        
        // Set time limit from duration_minutes
        if (data.duration_minutes) {
          setTimeRemaining(data.duration_minutes * 60); // Convert to seconds
        }

        setStartTime(new Date());
      } else if (response?.meta?.status === 404) {
        setError("Assessment not found for this program");
      } else {
        setError(response?.meta?.message || "Failed to load assessment");
      }
    } catch (error) {
      console.error("Error fetching assessment:", error);
      setError("Failed to load assessment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSubmit = async () => {
    if (submitted || showResults) return;
    await handleSubmitAssessment(true);
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    if (submitted || showResults) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleQuestionNavigate = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const toggleFlagQuestion = (questionId) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSubmitAssessment = async (autoSubmit = false) => {
    if (submitted || isSubmitting || showResults) return;

    // Check if all questions are answered
    const unanswered = questions.filter(
      (q) => answers[q.id] === undefined || answers[q.id] === null
    );

    if (!autoSubmit && unanswered.length > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unanswered.length} unanswered question(s). Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    setSubmitted(true);

    try {
      let currentSession = session;
      if (!currentSession?.accessToken) {
        currentSession = await update();
      }

      // Prepare answers payload
      const answerPayload = questions.map((q) => ({
        question_id: q.id,
        selected_option: answers[q.id] !== undefined && answers[q.id] !== null 
          ? answers[q.id] 
          : -1,
      }));

      console.log("Submitting assessment:", { 
        courseId: programId, 
        assessmentId: assessmentId,
        answers: answerPayload 
      });

      // Submit assessment using the API
      const response = await assessmentApi.submitAssessment(
        programId,
        assessmentId,
        answerPayload,
        currentSession
      );

      console.log("Submit response:", response);

      if (response?.meta?.status === 200 && response?.data) {
        setResults(response.data);
        setShowResults(true);
      } else {
        setError(response?.meta?.message || "Failed to submit assessment");
        setSubmitted(false);
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      setError("Failed to submit assessment. Please try again.");
      setSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setResults(null);
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setFlaggedQuestions(new Set());
    setStartTime(new Date());
    if (assessment?.duration_minutes) {
      setTimeRemaining(assessment.duration_minutes * 60);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).filter(
      (key) => answers[key] !== undefined && answers[key] !== null
    ).length;
  };

  const getProgressPercentage = () => {
    if (questions.length === 0) return 0;
    return Math.round((getAnsweredCount() / questions.length) * 100);
  };

  // Loading state
  if (!isClient || status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-red-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading assessment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Assessment Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href={`/programs/${programId}`}
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="inline mr-2" size={20} />
            Back to Program
          </Link>
        </div>
      </div>
    );
  }

  if (!assessment || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-50 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Assessment Available</h2>
          <p className="text-gray-600 mb-6">This program doesn't have an assessment yet.</p>
          <Link
            href={`/programs/${programId}`}
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="inline mr-2" size={20} />
            Back to Program
          </Link>
        </div>
      </div>
    );
  }

  // Results view
  if (showResults && results) {
    const passed = results.score >= (assessment.passing_score || 60);
    const answeredCount = getAnsweredCount();

    return (
      <>
        <Head>
          <title>Assessment Results | {assessment.title}</title>
          <meta name="description" content={`Assessment results for ${assessment.title}`} />
        </Head>

        <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <Link
              href={`/programs/${programId}`}
              className="inline-flex items-center text-gray-600 hover:text-red-600 transition-colors mb-6"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Program
            </Link>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className={`p-6 text-center ${passed ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 bg-white shadow-lg">
                  {passed ? (
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  ) : (
                    <XCircle className="w-12 h-12 text-red-600" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {passed ? 'Congratulations!' : 'Keep Learning!'}
                </h2>
                <p className="text-gray-600 mt-2">
                  {passed 
                    ? 'You have successfully passed the assessment!' 
                    : 'You didn\'t pass this time. Review the material and try again.'}
                </p>
              </div>

              <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{results.score || 0}%</p>
                    <p className="text-xs text-gray-500">Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{results.correct_answers || 0}</p>
                    <p className="text-xs text-gray-500">Correct</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{results.wrong_answers || 0}</p>
                    <p className="text-xs text-gray-500">Wrong</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{answeredCount}</p>
                    <p className="text-xs text-gray-500">Answered</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Question Review</h3>
                  <span className="text-sm text-gray-500">
                    {results.correct_answers || 0}/{questions.length} correct
                  </span>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {questions.map((q, index) => {
                    const userAnswer = answers[q.id];
                    const isCorrect = results.answers?.find(a => a.question_id === q.id)?.is_correct;

                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-lg border ${
                          isCorrect
                            ? 'border-green-200 bg-green-50'
                            : userAnswer !== undefined && userAnswer !== null && userAnswer !== -1
                            ? 'border-red-200 bg-red-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 mt-0.5">
                            {isCorrect ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : userAnswer !== undefined && userAnswer !== null && userAnswer !== -1 ? (
                              <XCircle className="w-5 h-5 text-red-600" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              Q{index + 1}. {q.question}
                            </p>
                            <div className="mt-2 space-y-1">
                              {q.options?.map((option, optIndex) => {
                                const isSelected = userAnswer === optIndex;
                                const isCorrectAnswer = q.correct_answer === optIndex;

                                return (
                                  <div
                                    key={optIndex}
                                    className={`text-xs sm:text-sm p-2 rounded ${
                                      isSelected && isCorrectAnswer
                                        ? 'bg-green-200 text-green-900'
                                        : isSelected && !isCorrectAnswer
                                        ? 'bg-red-200 text-red-900'
                                        : isCorrectAnswer
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                                  >
                                    {String.fromCharCode(65 + optIndex)}. {option}
                                    {isCorrectAnswer && (
                                      <span className="ml-2 text-green-600 font-medium">✓ Correct</span>
                                    )}
                                    {isSelected && !isCorrectAnswer && (
                                      <span className="ml-2 text-red-600 font-medium">✗ Your answer</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  {!passed && (
                    <button
                      onClick={handleRetry}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Retry Assessment
                    </button>
                  )}
                  <Link
                    href={`/programs/${programId}`}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-center"
                  >
                    Back to Program
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Assessment view
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = getAnsweredCount();

  return (
    <>
      <Head>
        <title>{assessment.title} | Assessment</title>
        <meta name="description" content={`Take the assessment for ${assessment.title}`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center gap-3">
                <Link
                  href={`/programs/${programId}`}
                  className="text-gray-600 hover:text-red-600 transition-colors p-1"
                >
                  <ArrowLeft size={22} />
                </Link>
                <h1 className="text-sm sm:text-lg font-semibold text-gray-900 truncate max-w-[120px] sm:max-w-md">
                  {assessment.title}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                {timeRemaining !== null && (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                    timeRemaining < 60 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    <Timer className="w-4 h-4" />
                    <span>{formatTime(timeRemaining)}</span>
                  </div>
                )}
                <span className="text-sm text-gray-500 hidden sm:inline">
                  {answeredCount}/{totalQuestions}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </div>
              <span className="text-xs sm:text-sm text-gray-600 font-medium whitespace-nowrap">
                {getProgressPercentage()}%
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Question Navigation */}
            <div className="p-4 border-b border-gray-200 bg-gray-50/50 overflow-x-auto">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFlagQuestion(currentQuestion.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      flaggedQuestions.has(currentQuestion.id)
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'hover:bg-gray-200 text-gray-400'
                    }`}
                    aria-label="Flag question"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question indicator dots */}
              <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1">
                {questions.map((q, index) => {
                  const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== -1;
                  const isFlagged = flaggedQuestions.has(q.id);
                  const isCurrent = index === currentQuestionIndex;

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleQuestionNavigate(index)}
                      className={`w-8 h-8 rounded-full text-xs font-medium transition-all flex-shrink-0 ${
                        isCurrent
                          ? 'ring-2 ring-red-600 ring-offset-2'
                          : ''
                      } ${
                        isAnswered
                          ? isFlagged
                            ? 'bg-yellow-500 text-white'
                            : 'bg-green-500 text-white'
                          : isFlagged
                          ? 'bg-yellow-200 text-yellow-800'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question */}
            <div className="p-4 sm:p-6">
              <div className="mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-lg font-semibold text-red-600 shrink-0">
                    Q{currentQuestionIndex + 1}.
                  </span>
                  <div>
                    <p className="text-base sm:text-lg font-medium text-gray-900">
                      {currentQuestion.question}
                    </p>
                    {currentQuestion.marks && (
                      <span className="text-xs text-gray-500 mt-1 block">
                        Marks: {currentQuestion.marks}
                      </span>
                    )}
                  </div>
                </div>
                {currentQuestion.description && (
                  <p className="mt-2 text-sm text-gray-500 ml-8">
                    {currentQuestion.description}
                  </p>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => {
                  const isSelected = answers[currentQuestion.id] === index;
                  const optionLabel = String.fromCharCode(65 + index);

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                      disabled={submitted || showResults}
                      className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
                      } ${(submitted || showResults) ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                    >
                      <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? 'border-red-600 bg-red-600 text-white'
                          : 'border-gray-300 text-gray-400'
                      }`}>
                        {isSelected ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <span className="text-xs font-medium">{optionLabel}</span>
                        )}
                      </div>
                      <span className={`text-sm sm:text-base ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation buttons */}
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleQuestionNavigate(currentQuestionIndex - 1)}
                    disabled={currentQuestionIndex === 0}
                    className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <button
                      onClick={() => handleQuestionNavigate(currentQuestionIndex + 1)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubmitAssessment()}
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-none px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Submit Assessment
                    </button>
                  )}
                </div>

                {/* Question counter */}
                <div className="text-xs text-gray-400 sm:ml-auto">
                  {answeredCount} of {totalQuestions} answered
                </div>
              </div>

              {/* Unanswered warning */}
              {answeredCount < totalQuestions && currentQuestionIndex === totalQuestions - 1 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    You have {totalQuestions - answeredCount} unanswered question(s). 
                    Make sure to review all questions before submitting.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Question palette - Mobile friendly */}
          <div className="mt-4 bg-white rounded-lg shadow-lg p-4 sm:hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Question Palette</span>
              <span className="text-xs text-gray-500">
                {answeredCount}/{totalQuestions} answered
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {questions.map((q, index) => {
                const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== -1;
                const isFlagged = flaggedQuestions.has(q.id);
                const isCurrent = index === currentQuestionIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => handleQuestionNavigate(index)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      isCurrent
                        ? 'ring-2 ring-red-600 ring-offset-2'
                        : ''
                    } ${
                      isAnswered
                        ? isFlagged
                          ? 'bg-yellow-500 text-white'
                          : 'bg-green-500 text-white'
                        : isFlagged
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
              <span>Unanswered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Flagged</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span>Current</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssessmentPage;