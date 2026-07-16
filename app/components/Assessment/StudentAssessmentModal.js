// components/Assessment/StudentAssessmentModal.js

import React, { useState, useEffect, useRef } from "react";
import { X, Clock, Award, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { assessmentApi } from "@/helper/services/assessmentApi";

const StudentAssessmentModal = ({
  isOpen,
  onClose,
  assessment,
  courseId,
  courseTitle,
  session,
  onSuccess,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const isSubmittedRef = useRef(false);
  const hasInitialized = useRef(false);

  // Initialize assessment - only once when modal opens
  useEffect(() => {
    if (isOpen && assessment && !isSubmittedRef.current && !hasInitialized.current) {
      setCurrentQuestion(0);
      setAnswers({});
      setSubmitted(false);
      setResult(null);
      setStartedAt(new Date());
      hasInitialized.current = true;
      
      if (assessment.duration_minutes) {
        setTimeLeft(assessment.duration_minutes * 60);
      }
    }
    
    // Reset initialization flag when modal closes
    if (!isOpen) {
      hasInitialized.current = false;
    }
  }, [isOpen, assessment]);

  // Timer effect
  useEffect(() => {
    if (!timeLeft || submitted || !isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted, isOpen]);

  if (!isOpen) return null;

  const questions = assessment?.questions || [];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  const handleAnswerSelect = (questionId, selectedOption) => {
    if (submitted) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitAssessment = async () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < totalQuestions) {
      setShowConfirmModal(true);
      return;
    }
    await performSubmit();
  };

  const performSubmit = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
        question_id: parseInt(questionId),
        selected_option: selectedOption,
      }));

      const response = await assessmentApi.submitAssessment(
        courseId,
        assessment.id,
        formattedAnswers,
        session
      );

      if (response.meta?.status === 200) {
        setResult(response.data);
        setSubmitted(true);
        isSubmittedRef.current = true;
        toast.success("Assessment submitted successfully!");
        
        if (response.data.passed) {
          toast.success("🎉 Congratulations! You passed the assessment!");
        }
        
        if (onSuccess) onSuccess();
      } else {
        toast.error(response.meta?.message || "Failed to submit assessment");
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast.error("Failed to submit assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    isSubmittedRef.current = false;
    hasInitialized.current = false;
    onClose();
  };

  const formatTime = (seconds) => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Render Results View (without correct/incorrect answers)
  const renderResults = () => {
    if (!result) return null;
    
    const passed = result.passed || false;
    const percentage = result.percentage || 0;
    const score = result.score || 0;
    const total = result.total || totalQuestions || 0;
    const correctAnswers = result.correct_answers || 0;
    const wrongAnswers = result.wrong_answers || 0;
    const passingScore = assessment?.passing_score || 60;

    return (
      <div className="text-center py-4">
        {/* Result Icon */}
        <div className="mb-6">
          {passed ? (
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          ) : (
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          )}
        </div>
        
        {/* Result Message */}
        <h4 className="text-2xl font-bold text-gray-900 mb-2">
          {passed ? "🎉 Congratulations!" : "Better Luck Next Time!"}
        </h4>
        
        <p className="text-gray-600 mb-6">
          {passed
            ? "You have successfully passed the assessment!"
            : "You did not pass the assessment. Please review the material and try again."}
        </p>

        {/* Score Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">Your Score</p>
            <p className="text-2xl font-bold text-blue-600">{percentage}%</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">Passing Score</p>
            <p className="text-2xl font-bold text-green-600">{passingScore}%</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">Correct</p>
            <p className="text-2xl font-bold text-green-600">{correctAnswers}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">Incorrect</p>
            <p className="text-2xl font-bold text-red-500">{wrongAnswers}</p>
          </div>
        </div>

        {/* Certificate Section */}
        {passed && result?.certificate && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 max-w-md mx-auto mb-6">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-green-600" />
              <div className="text-left">
                <p className="text-sm font-medium text-green-800">
                  Certificate of Completion
                </p>
                <p className="text-xs text-green-600 font-mono">
                  ID: {result.certificate.certificate_code}
                </p>
                <p className="text-xs text-green-500">
                  Issued: {new Date(result.certificate.issued_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="px-8 py-3 bg-[#CC0000] text-white rounded-xl hover:bg-[#B30000] transition-all font-medium shadow-md hover:shadow-lg"
        >
          Close
        </button>
      </div>
    );
  };

  // Render Confirmation Modal
  const renderConfirmModal = () => (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Submit Assessment?</h3>
          <p className="text-gray-600 mb-4">
            You have answered <span className="font-semibold text-yellow-600">{answeredCount}</span> out of{" "}
            <span className="font-semibold">{totalQuestions}</span> questions.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            {totalQuestions - answeredCount} question{totalQuestions - answeredCount > 1 ? 's' : ''} remaining.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
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
  );

  // Main render
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#CC0000]/10 rounded-lg">
              <Award className="w-5 h-5 text-[#CC0000]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {submitted ? "Assessment Results" : assessment?.title || "Assessment"}
              </h3>
              <p className="text-sm text-gray-500">{courseTitle}</p>
            </div>
          </div>
          {submitted ? (
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              {timeLeft !== null && (
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Clock className="w-4 h-4 text-red-500" />
                  <span className={timeLeft < 60 ? "text-red-600 font-bold" : ""}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {answeredCount}/{totalQuestions}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {submitted ? (
            renderResults()
          ) : (
            // Assessment View
            <div>
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Question {currentQuestion + 1} of {totalQuestions}</span>
                  <span>{totalQuestions > 0 ? Math.round(((currentQuestion + 1) / totalQuestions) * 100) : 0}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#CC0000] rounded-full transition-all duration-300"
                    style={{ width: totalQuestions > 0 ? `${((currentQuestion + 1) / totalQuestions) * 100}%` : '0%' }}
                  />
                </div>
              </div>

              {/* Question */}
              {questions.length > 0 && currentQuestion < questions.length && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    {questions[currentQuestion]?.question_text}
                  </h4>
                  
                  <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map((optionKey) => {
                      const optionText = questions[currentQuestion]?.[`option_${optionKey.toLowerCase()}`];
                      if (!optionText) return null;
                      
                      const isSelected = answers[questions[currentQuestion].id] === optionKey;
                      
                      return (
                        <button
                          key={optionKey}
                          onClick={() => handleAnswerSelect(questions[currentQuestion].id, optionKey)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-[#CC0000] bg-[#FDF8F0] shadow-md'
                              : 'border-gray-200 hover:border-[#CC0000]/30 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                              isSelected
                                ? 'border-2 border-[#CC0000] bg-[#CC0000] text-white'
                                : 'border-2 border-gray-300 text-gray-500'
                            }`}>
                              {optionKey}
                            </div>
                            <span className={`text-sm sm:text-base pt-0.5 ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                              {optionText}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Previous
                </button>
                
                <div className="flex gap-3">
                  {currentQuestion === totalQuestions - 1 ? (
                    <button
                      onClick={handleSubmitAssessment}
                      disabled={loading}
                      className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 font-medium shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Assessment"
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="px-5 py-2.5 bg-[#CC0000] text-white rounded-xl hover:bg-[#B30000] transition-colors font-medium shadow-md hover:shadow-lg"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && renderConfirmModal()}
    </div>
  );
};

export default StudentAssessmentModal;