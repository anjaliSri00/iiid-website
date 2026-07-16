"use client";

import { useState } from 'react';
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
} from 'lucide-react';
import { useAssessment } from '@/helper/hooks/useAssessment';
import { useFileUpload } from '@/helper/hooks/useFileUpload';
import { useSession } from 'next-auth/react';

const PDFTaskAssessment = ({ assessment, programId }) => {
  const { submitPDFTask } = useAssessment();
  const { data: session } = useSession();
  const { uploadPDF, isUploading, uploadProgress, error: uploadError } = useFileUpload(session);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [taskSubmitted, setTaskSubmitted] = useState(false);
  const [taskStatus, setTaskStatus] = useState(null);
  const [taskFeedback, setTaskFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    setSubmitError(null);
    setIsSuccess(false);
    
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        setSubmitError('Please select a PDF file');
        return;
      }
      
      // Validate file size (max 10MB)
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
      // Step 1: Upload the PDF file
      console.log('Uploading PDF...');
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
      console.log('File uploaded successfully:', fileUrl);

      // Step 2: Submit the PDF task with the file URL
      console.log('Submitting PDF task...');
      const response = await submitPDFTask(programId, assessment.id, fileUrl);

      console.log('Submit PDF task response:', response);

      // Check for successful submission (200 or 201)
      if (response?.meta?.status === 200 || response?.meta?.status === 201) {
        setTaskSubmitted(true);
        setTaskStatus('submitted');
        setSelectedFile(null);
        setIsSuccess(true);
        setSubmitError(null);
        
        // Check if task was graded immediately
        if (response.data?.score !== undefined) {
          setTaskFeedback({
            score: response.data.score,
            passed: response.data.passed || false,
            feedback: response.data.feedback || "",
          });
          setTaskStatus('graded');
        }
        
        // Show success message
        alert('Your PDF task has been submitted successfully!');
      } else {
        // Handle other status codes
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

  const isGraded = taskStatus === 'graded';
  const isSubmitted = taskStatus === 'submitted' || isGraded;
  const isUploadingOrSubmitting = isUploading || isSubmitting;

  return (
    <div className="min-h-screen bg-[#FDF8F0] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/programs/${programId}`}
          className="inline-flex items-center text-gray-600 hover:text-[#CC0000] transition-colors mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Program
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#D4A574]/20">
          {/* Header */}
          <div className="p-6 border-b border-[#D4A574]/20 bg-gradient-to-r from-[#FDF8F0] to-white">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#CC0000]/10 rounded-lg">
                <FileText className="w-8 h-8 text-[#CC0000]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {assessment.title}
                </h1>
                <p className="text-sm text-gray-500 mt-1">PDF Task Assessment</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                  <span className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    {assessment.duration_minutes} minutes
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <Award className="w-4 h-4" />
                    Passing Score: {assessment.passing_score}%
                  </span>
                  {isSubmitted && (
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      isGraded 
                        ? taskFeedback?.passed 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {isGraded 
                        ? taskFeedback?.passed 
                          ? '✓ Passed' 
                          : '✗ Failed'
                        : '⏳ Pending Review'}
                    </span>
                  )}
                  {isSuccess && !isSubmitted && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3" />
                      Submitted Successfully
                    </span>
                  )}
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
                {assessment.instructions || "Complete the task using the provided PDF template. Download the template, fill it out, and upload your completed PDF."}
              </p>
            </div>

            {/* PDF Template Download */}
            {assessment.pdf_template_url && (
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

            {/* Success Message */}
            {isSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800">Success!</h4>
                    <p className="text-sm text-green-700">
                      Your PDF task has been submitted successfully. You will be notified once it's reviewed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Results/Feedback */}
            {isGraded && taskFeedback && (
              <div className={`rounded-lg p-4 mb-6 border ${
                taskFeedback.passed 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-3">
                  {taskFeedback.passed ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600" />
                  )}
                  <div>
                    <h4 className={`font-semibold ${
                      taskFeedback.passed ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {taskFeedback.passed ? 'Task Passed!' : 'Task Needs Improvement'}
                    </h4>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm">
                        Score: <span className="font-bold">{taskFeedback.score}%</span>
                      </p>
                      <p className="text-sm">
                        Passing Score: <span className="font-bold">{assessment.passing_score}%</span>
                      </p>
                    </div>
                    {taskFeedback.feedback && (
                      <p className="text-sm mt-2 text-gray-700">
                        <span className="font-medium">Feedback:</span> {taskFeedback.feedback}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isSubmitted && !isGraded && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 text-yellow-600 animate-spin" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Submission Under Review</h4>
                    <p className="text-sm text-yellow-700">
                      Your PDF task has been submitted and is pending review.
                    </p>
                  </div>
                </div>
              </div>
            )}

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

            {/* Back button when submitted or success */}
            {(isSubmitted || isSuccess) && (
              <div className="text-center py-4">
                <Link
                  href={`/programs/${programId}`}
                  className="inline-flex items-center px-6 py-3 bg-[#CC0000] text-white rounded-lg hover:bg-[#B30000] transition-colors"
                >
                  <ArrowLeft size={20} className="mr-2" />
                  Back to Program
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFTaskAssessment;