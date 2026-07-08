// components/Assessment/StudentAssessmentModal.js

import React, { useState, useEffect } from "react";
import { X, Clock, Award, CheckCircle, XCircle, Loader2 } from "lucide-react";
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

  useEffect(() => {
    if (isOpen && assessment) {
      // Reset state when modal opens
      setCurrentQuestion(0);
      setAnswers({});
      setSubmitted(false);
      setResult(null);
      setStartedAt(new Date());
      
      // Set timer if duration exists
      if (assessment.duration_minutes) {
        setTimeLeft(assessment.duration_minutes * 60);
      }
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

  const handleAnswerSelect = (questionId, selectedOption) => {
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
    // Check if all questions are answered
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < totalQuestions) {
      const confirmSubmit = confirm(
        `You have answered ${answeredCount} out of ${totalQuestions} questions. Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    }

    setLoading(true);
    try {
      // Format answers for API
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
        toast.success("Assessment submitted successfully!");
        
        if (response.data.passed) {
          toast.success("🎉 Congratulations! You passed the assessment!");
        } else {
          toast.error("You did not pass the assessment. Please try again.");
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

  const formatTime = (seconds) => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {submitted ? "Assessment Results" : "Assessment"}
              </h3>
              <p className="text-sm text-gray-500">{courseTitle}</p>
            </div>
          </div>
          {submitted ? (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              {timeLeft !== null && (
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Clock className="w-4 h-4 text-red-500" />
                  <span className={timeLeft < 60 ? "text-red-600" : ""}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-500">
                {Object.keys(answers).length}/{totalQuestions}
              </span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="px-6 py-6">
          {submitted ? (
            // Results View
            <div className="text-center py-8">
              <div className="mb-6">
                {result?.passed ? (
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <XCircle className="w-12 h-12 text-red-600" />
                  </div>
                )}
              </div>
              
              <h4 className="text-2xl font-bold text-gray-900 mb-2">
                {result?.passed ? "🎉 Congratulations!" : "Better Luck Next Time!"}
              </h4>
              
              <p className="text-gray-600 mb-4">
                {result?.passed
                  ? "You have successfully passed the assessment!"
                  : "You did not pass the assessment. Please review the material and try again."}
              </p>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Your Score</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {result?.percentage || 0}%
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Passing Score</p>
                  <p className="text-2xl font-bold text-green-600">
                    {assessment?.passing_score || 0}%
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                {result?.passed && result?.certificate && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 w-full max-w-md">
                    <div className="flex items-center gap-3">
                      <Award className="w-6 h-6 text-green-600" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-green-800">
                          Certificate Earned!
                        </p>
                        <p className="text-xs text-green-600">
                          Certificate ID: {result.certificate.certificate_code}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            // Assessment View
            <div>
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Question {currentQuestion + 1} of {totalQuestions}</span>
                  <span>{Math.round(((currentQuestion + 1) / totalQuestions) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              {questions.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
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
                          className={`w-full text-left p-3 rounded-lg border transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          }`}
                        >
                          <span className="font-medium mr-2">{optionKey}.</span>
                          {optionText}
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
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex gap-3">
                  {currentQuestion === totalQuestions - 1 ? (
                    <button
                      onClick={handleSubmitAssessment}
                      disabled={loading}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Submit Assessment"
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
    </div>
  );
};

export default StudentAssessmentModal;