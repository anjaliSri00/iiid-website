// components/Assessment/PDFTaskAssessment.js

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Award,
  FileText,
  Download,
  Upload,
  FileUp,
  Trash2,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  Info,
  AlertCircle,
  Eye,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';
import { useAssessment } from '@/helper/hooks/useAssessment';
import { useFileUpload } from '@/helper/hooks/useFileUpload';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

const PDFTaskAssessment = ({ 
  assessment, 
  programId,
  onRequestReattempt,
  reattemptStatus,
}) => {
  const { submitPDFTask } = useAssessment();
  const { data: session } = useSession();
  const { uploadPDF, isUploading, uploadProgress, error: uploadError } = useFileUpload(session);

  const searchParams = useSearchParams();
  const statusParam = searchParams?.get('status');
  const submittedAtParam = searchParams?.get('submitted_at');
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [taskSubmitted, setTaskSubmitted] = useState(false);
  const [taskStatus, setTaskStatus] = useState(null);
  const [taskFeedback, setTaskFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [attemptData, setAttemptData] = useState(null);
  const [showReattemptModal, setShowReattemptModal] = useState(false);
  const [reattemptReason, setReattemptReason] = useState('');

  // Check for existing attempt from assessment prop
  useEffect(() => {
    if (!assessment?.id || !programId) {
      return;
    }
    
    try {
      // First check if URL has status param
      if (statusParam === 'pending' && submittedAtParam) {
        const attempt = {
          submitted_at: submittedAtParam,
          review_status: 'pending',
          score: null,
          passed: null,
        };
        setAttemptData(attempt);
        setTaskSubmitted(true);
        setTaskStatus('pending');
        setIsSuccess(true);
        return;
      }
      
      const attempt = assessment?.attempt || null;
      
      if (attempt && Object.keys(attempt).length > 0) {
        setAttemptData(attempt);
        
        if (attempt.submitted_at) {
          setTaskSubmitted(true);
          
          if (attempt.review_status === 'graded' || (attempt.score !== null && attempt.score !== undefined)) {
            setTaskStatus('graded');
            setTaskFeedback({
              score: attempt.score || 0,
              passed: attempt.passed || false,
              feedback: attempt.feedback || "",
              reviewed_at: attempt.reviewed_at,
              reviewed_by: attempt.reviewed_by,
            });
          } else if (attempt.review_status === 'pending') {
            setTaskStatus('pending');
          } else {
            setTaskStatus('submitted');
          }
          
          setIsSuccess(true);
        } else {
          setTaskStatus(null);
        }
      } else {
        setTaskStatus(null);
      }
    } catch (error) {
      console.error('Error checking existing attempt:', error);
      setTaskStatus(null);
    }
  }, [assessment, statusParam, submittedAtParam]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    setSubmitError(null);
    setIsSuccess(false);
    
    if (file) {
      if (file.type !== 'application/pdf') {
        setSubmitError('Please select a PDF file');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setSubmitError('File size should be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setSubmitError(null);
    setIsSuccess(false);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setSubmitError('Please select a file to submit');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setIsSuccess(false);

    try {
      const uploadResult = await uploadPDF(selectedFile, {
        onSuccess: (result) => {
          console.log('Upload successful:', result);
        },
        onError: (error) => {
          console.error('Upload error:', error);
          setSubmitError(error.message || 'Failed to upload file');
        },
        onProgress: (progress) => {
          console.log('Upload progress:', progress);
        },
      });

      if (!uploadResult?.success || !uploadResult?.url) {
        throw new Error('File upload failed');
      }

      const fileUrl = uploadResult.url;

      const response = await submitPDFTask(programId, assessment.id, fileUrl);

      if (response?.meta?.status === 200 || response?.meta?.status === 201) {
        const attempt = response.data?.attempt;
        setAttemptData(attempt);
        setTaskSubmitted(true);
        setSelectedFile(null);
        setIsSuccess(true);
        setSubmitError(null);
        
        if (attempt?.score !== null && attempt?.score !== undefined) {
          setTaskStatus('graded');
          setTaskFeedback({
            score: attempt.score,
            passed: attempt.passed || false,
            feedback: attempt.feedback || "",
            reviewed_at: attempt.reviewed_at,
            reviewed_by: attempt.reviewed_by,
          });
        } else if (attempt?.review_status === 'pending') {
          setTaskStatus('pending');
        } else {
          setTaskStatus('submitted');
        }
        
        const statusMessage = attempt?.review_status === 'pending' 
          ? 'Your PDF task has been submitted successfully and is pending review!'
          : 'Your PDF task has been submitted successfully!';
        alert(statusMessage);
      } else {
        const errorMsg = response?.meta?.message || 'Failed to submit task';
        setSubmitError(errorMsg);
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Error submitting PDF task:', error);
      setSubmitError(error.message || 'Failed to submit task. Please try again.');
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReattemptRequest = () => {
    setShowReattemptModal(true);
  };

  const handleSubmitReattempt = () => {
    if (!reattemptReason.trim()) {
      alert('Please provide a reason for requesting a reattempt.');
      return;
    }
    if (onRequestReattempt) {
      onRequestReattempt();
    }
    setShowReattemptModal(false);
  };

  const isGraded = taskStatus === 'graded';
  const isPending = taskStatus === 'pending';
  const isSubmitted = taskStatus === 'submitted' || isGraded || isPending;
  const isUploadingOrSubmitting = isUploading || isSubmitting;

  // Render status badge
  const renderStatusBadge = () => {
    if (isGraded) {
      return (
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          taskFeedback?.passed 
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {taskFeedback?.passed ? '✓ Passed' : '✗ Failed'}
        </span>
      );
    }
    if (isPending) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
          ⏳ Pending Review
        </span>
      );
    }
    if (isSubmitted) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          <CheckCircle className="w-3 h-3" />
          Submitted
        </span>
      );
    }
    return null;
  };

  // Render status message
  const renderStatusMessage = () => {
    if (isPending) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800">Submission Under Review</h4>
              <p className="text-sm text-yellow-700">
                Your PDF has been submitted successfully and is currently being reviewed by the instructor.
                You will be notified once the review is complete.
              </p>
              {attemptData?.submitted_at && (
                <p className="text-xs text-yellow-600 mt-2">
                  Submitted on: {new Date(attemptData.submitted_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (isGraded && taskFeedback) {
      return (
        <div className={`rounded-lg p-4 mb-6 border ${
          taskFeedback.passed 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start gap-3">
            {taskFeedback.passed ? (
              <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className={`font-semibold ${
                taskFeedback.passed ? 'text-green-800' : 'text-red-800'
              }`}>
                {taskFeedback.passed ? '✅ Task Passed!' : '❌ Task Needs Improvement'}
              </h4>
              <div className="flex flex-wrap items-center gap-4 mt-1">
                <p className="text-sm">
                  Score: <span className="font-bold">{taskFeedback.score}%</span>
                </p>
                <p className="text-sm">
                  Passing Score: <span className="font-bold">{assessment?.passing_score || 60}%</span>
                </p>
                {taskFeedback.reviewed_at && (
                  <p className="text-xs text-gray-500">
                    Reviewed: {new Date(taskFeedback.reviewed_at).toLocaleString()}
                  </p>
                )}
              </div>
              {taskFeedback.feedback && (
                <div className="mt-2 p-3 bg-white/60 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Feedback:</span> {taskFeedback.feedback}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Reattempt Section - Show if failed */}
          {!taskFeedback.passed && !reattemptStatus && (
            <div className="mt-4 pt-4 border-t border-red-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <RefreshCw className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-800">Request Reattempt</h4>
                    <p className="text-sm text-amber-700">
                      You didn't pass this task. Request a reattempt with a different task.
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      An admin will review your request and assign a new task.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReattemptRequest}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <RefreshCw className="w-4 h-4" />
                  Request Reattempt
                </button>
              </div>
            </div>
          )}

          {/* Reattempt Status */}
          {reattemptStatus === 'pending' && (
            <div className="mt-4 pt-4 border-t border-red-200">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800">Reattempt Request Pending</h4>
                    <p className="text-sm text-blue-700">
                      Your reattempt request has been submitted. An admin will review it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (isSuccess && !isSubmitted) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-800">Success!</h4>
              <p className="text-sm text-green-700">
                Your PDF task has been submitted successfully.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#FDF8F0] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href={`/programs/${programId}`}
          className="inline-flex items-center px-4 py-2 mb-6 text-sm text-gray-600 hover:text-[#CC0000] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Program
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#D4A574]/20">
          {/* Header */}
          <div className="p-6 border-b border-[#D4A574]/20 bg-gradient-to-r from-[#FDF8F0] to-white">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#CC0000]/10 rounded-lg">
                <FileText className="w-8 h-8 text-[#CC0000]" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {assessment?.title}
                </h1>
                <p className="text-sm text-gray-500 mt-1">PDF Task Assessment</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                  <span className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    {assessment?.duration_minutes} minutes
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <Award className="w-4 h-4" />
                    Passing Score: {assessment?.passing_score || 60}%
                  </span>
                  {renderStatusBadge()}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Instructions
              </h3>
              <p className="text-sm text-blue-700 whitespace-pre-wrap">
                {assessment?.instructions || "Complete the task using the provided PDF template. Download the template, fill it out, and upload your completed PDF."}
              </p>
            </div>

            {/* PDF Template Download */}
            {assessment?.pdf_template_url && (
              <div className="bg-[#FDF8F0] rounded-lg p-4 border border-[#D4A574]/20 mb-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-[#D4A574]/20">
                      <FileText className="w-6 h-6 text-[#CC0000]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">PDF Template</p>
                      <p className="text-sm text-gray-500">
                        Download and fill out the template
                      </p>
                    </div>
                  </div>
                  <a
                    href={assessment.pdf_template_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#CC0000] text-white text-sm rounded-lg hover:bg-[#B30000] transition-colors inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Template
                  </a>
                </div>
              </div>
            )}

            {/* Status Messages */}
            {renderStatusMessage()}

            {/* Error Display */}
            {submitError && !isSuccess && !isSubmitted && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800">Error</h4>
                    <p className="text-sm text-red-700">{submitError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* File Upload - Only show if not submitted */}
            {!isSubmitted && !isSuccess && (
              <div className="space-y-6">
                <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  submitError ? 'border-red-400 bg-red-50' : 'bg-[#FDF8F0]'
                }`}>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    id="pdf-upload"
                    onChange={handleFileSelect}
                    disabled={isUploadingOrSubmitting}
                  />
                  <label
                    htmlFor="pdf-upload"
                    className={`cursor-pointer block ${isUploadingOrSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {selectedFile ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center">
                          <div className="p-4 bg-green-100 rounded-full">
                            <FileUp className="w-12 h-12 text-green-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-800 font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        {isUploading && (
                          <div className="w-full max-w-xs mx-auto">
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#CC0000] rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{uploadProgress}% uploaded</p>
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleRemoveFile();
                            }}
                            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                            disabled={isUploadingOrSubmitting}
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                          <span className="text-sm text-gray-400">|</span>
                          <span className="text-sm text-gray-500">Choose different file</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center">
                          <div className="p-4 bg-[#CC0000]/10 rounded-full">
                            <Upload className="w-12 h-12 text-[#CC0000]" />
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium">
                            Upload your completed PDF
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            Click to browse or drag and drop
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            PDF files only • Max size 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-500">
                    {selectedFile ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        File ready for submission
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Info className="w-4 h-4" />
                        Please upload your completed PDF
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedFile || isUploadingOrSubmitting}
                    className="px-6 py-3 bg-[#CC0000] text-white rounded-lg hover:bg-[#B30000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                  >
                    {isUploadingOrSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isUploading ? `Uploading... ${uploadProgress}%` : 'Submitting...'}
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Task
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* View Submitted File */}
            {(isSubmitted || isSuccess) && attemptData?.submitted_file_url && (
              <div className="mt-6 p-4 bg-[#FDF8F0] border border-[#D4A574]/20">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[#CC0000]" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Submitted File</p>
                      <p className="text-xs text-gray-500">
                        {isPending ? 'Awaiting review' : isGraded ? 'Reviewed' : 'Submitted'}
                      </p>
                    </div>
                  </div>
                  <a
                    href={attemptData.submitted_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white border border-[#D4A574]/20 text-gray-700 text-sm hover:bg-[#FDF8F0] transition-colors inline-flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Submission
                  </a>
                </div>
              </div>
            )}

            {/* Back button when submitted or success */}
            {(isSubmitted || isSuccess) && (
              <div className="text-center py-4 mt-4">
                <Link
                  href={`/programs/${programId}`}
                  className="inline-flex items-center px-6 py-3 bg-[#CC0000] text-white hover:bg-[#B30000] transition-colors"
                >
                  <ArrowLeft size={20} className="mr-2" />
                  Back to Program
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reattempt Modal */}
      {showReattemptModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 shadow-2xl border border-[#D4A574]/20 animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Request Reattempt</h3>
              <p className="text-sm text-gray-600 mt-1">
                Provide a reason for requesting a reattempt. An admin will review your request.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Reattempt *
              </label>
              <textarea
                value={reattemptReason}
                onChange={(e) => setReattemptReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent text-sm"
                placeholder="Explain why you need a reattempt..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReattemptModal(false)}
                className="flex-1 px-4 py-2.5 border-2 border-[#D4A574]/20 text-gray-700 hover:bg-[#FDF8F0] transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReattempt}
                disabled={!reattemptReason.trim()}
                className="flex-1 px-4 py-2.5 bg-[#CC0000] text-white hover:bg-[#B30000] transition-all font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFTaskAssessment;