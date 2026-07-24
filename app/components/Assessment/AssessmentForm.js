// components/Assessment/AssessmentForm.js

import React, { useState } from "react";
import { Save, Loader2, CheckCircle, AlertCircle, Upload, X, FileText, Star, StarOff } from "lucide-react";
import { toast } from "react-toastify";
import { uploadService } from "@/helper/services/uploadService";

const AssessmentForm = ({
  editingAssessment,
  assessmentFormData,
  assessmentErrors,
  assessmentSaving,
  assessmentSuccess,
  handleAssessmentFormChange,
  handleAssessmentSubmit,
  setShowCreateAssessment,
  setEditingAssessment,
  resetAssessmentForm,
  setAssessmentSuccess,
  courseId,
  onCancel,
  session,
}) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Handle PDF file upload
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      e.target.value = '';
      return;
    }

    setUploadedFile(file);
    setUploadProgress(0);
    setIsUploading(true);

    try {
      const result = await uploadService.uploadPDF(file, session, {
        progressCallback: (progress) => {
          setUploadProgress(progress);
        },
      });

      handleAssessmentFormChange({
        target: {
          name: 'pdf_template_url',
          value: result.url,
        }
      });

      toast.success('PDF uploaded successfully!');
      e.target.value = '';
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast.error(error.message || 'Failed to upload PDF');
      e.target.value = '';
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // Remove uploaded file
  const removeFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    handleAssessmentFormChange({
      target: {
        name: 'pdf_template_url',
        value: '',
      }
    });
    const fileInput = document.getElementById('pdf-upload');
    if (fileInput) fileInput.value = '';
  };

  // Handle checkbox change
  const handleDefaultCheckboxChange = (e) => {
    const checked = e.target.checked;
    handleAssessmentFormChange({
      target: {
        name: 'is_default',
        value: checked,
      }
    });
  };

  // console.log(editingAssessment,"--------------------------editing")

  return (
    <div>
      {assessmentSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <p className="text-sm text-green-700">
            {editingAssessment ? "Assessment updated successfully!" : "Assessment created successfully!"}
          </p>
        </div>
      )}

      {assessmentErrors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <p className="text-sm text-red-700">{assessmentErrors.general}</p>
        </div>
      )}

      <form onSubmit={(e) => {
        e.preventDefault();
        if (courseId) {
          handleAssessmentSubmit();
        } else {
          toast.error("Please select a course first");
        }
      }} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assessment Title *
            </label>
            <input
              type="text"
              name="title"
              value={assessmentFormData.title || ""}
              onChange={handleAssessmentFormChange}
              className={`w-full px-3 py-2 border ${
                assessmentErrors.title ? "border-red-300" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
              placeholder="e.g., Final Exam"
            />
            {assessmentErrors.title && (
              <p className="mt-1 text-sm text-red-600">{assessmentErrors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assessment Type *
            </label>
            <select
              name="type"
              value={assessmentFormData.type || "mcq"}
              onChange={handleAssessmentFormChange}
              className={`w-full px-3 py-2 border ${
                assessmentErrors.type ? "border-red-300" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
            >
              <option value="mcq">MCQ (Multiple Choice Questions)</option>
              <option value="pdf_task">PDF Task</option>
            </select>
            {assessmentErrors.type && (
              <p className="mt-1 text-sm text-red-600">{assessmentErrors.type}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={assessmentFormData.status || "draft"}
              onChange={handleAssessmentFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passing Score (%) *
            </label>
            <input
              type="number"
              name="passing_score"
              value={assessmentFormData.passing_score || ""}
              onChange={handleAssessmentFormChange}
              className={`w-full px-3 py-2 border ${
                assessmentErrors.passing_score ? "border-red-300" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
              placeholder="60"
              min="0"
              max="100"
            />
            {assessmentErrors.passing_score && (
              <p className="mt-1 text-sm text-red-600">{assessmentErrors.passing_score}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes) *
            </label>
            <input
              type="number"
              name="duration_minutes"
              value={assessmentFormData.duration_minutes || ""}
              onChange={handleAssessmentFormChange}
              className={`w-full px-3 py-2 border ${
                assessmentErrors.duration_minutes ? "border-red-300" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
              placeholder="30"
              min="1"
            />
            {assessmentErrors.duration_minutes && (
              <p className="mt-1 text-sm text-red-600">{assessmentErrors.duration_minutes}</p>
            )}
          </div>

          {/* Set as Default Checkbox - Only show when editing existing assessment */}
          {editingAssessment.is_default && (
            <div className="md:col-span-2">
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200 hover:border-yellow-300 transition-colors">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    type="checkbox"
                    id="is_default_checkbox"
                    name="is_default"
                    checked={assessmentFormData.is_default || false}
                    onChange={handleDefaultCheckboxChange}
                    className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500 focus:ring-offset-2 cursor-pointer"
                    disabled={assessmentSaving}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <label 
                      htmlFor="is_default_checkbox"
                      className="text-sm font-medium text-gray-700 flex items-center gap-2 cursor-pointer"
                    >
                      {assessmentFormData.is_default ? (
                        <>
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          <span className="text-yellow-700">Set as default {assessmentFormData.type === 'pdf_task' ? 'PDF' : 'MCQ'} assessment for this course</span>
                        </>
                      ) : (
                        <>
                          <StarOff className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Set as default {assessmentFormData.type === 'pdf_task' ? 'PDF' : 'MCQ'} assessment for this course</span>
                        </>
                      )}
                    </label>
                    {assessmentFormData.is_default && (
                      <span className="px-2.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full border border-yellow-200">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Only one {assessmentFormData.type === 'pdf_task' ? 'PDF' : 'MCQ'} assessment can be default per course. 
                    Students will be automatically assigned to the default assessment.
                    {assessmentFormData.is_default && (
                      <span className="block text-yellow-600 mt-0.5">
                        ✓ This assessment will be the default for all new enrollments
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={assessmentFormData.description || ""}
              onChange={handleAssessmentFormChange}
              rows="2"
              className={`w-full px-3 py-2 border ${
                assessmentErrors.description ? "border-red-300" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
              placeholder="Describe the assessment..."
            />
            {assessmentErrors.description && (
              <p className="mt-1 text-sm text-red-600">{assessmentErrors.description}</p>
            )}
          </div>

          {/* Conditional fields for PDF Task */}
          {assessmentFormData.type === "pdf_task" && (
            <>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions *
                </label>
                <textarea
                  name="instructions"
                  value={assessmentFormData.instructions || ""}
                  onChange={handleAssessmentFormChange}
                  rows="3"
                  className={`w-full px-3 py-2 border ${
                    assessmentErrors.instructions ? "border-red-300" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                  placeholder="Provide detailed instructions for the PDF task..."
                />
                {assessmentErrors.instructions && (
                  <p className="mt-1 text-sm text-red-600">{assessmentErrors.instructions}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PDF Template *
                </label>
                
                {/* PDF Upload Area */}
                <div className="mt-1">
                  {!assessmentFormData.pdf_template_url ? (
                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-red-400 transition-colors">
                      <div className="space-y-1 text-center">
                        {!isUploading ? (
                          <>
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="pdf-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500"
                              >
                                <span>Upload a PDF file</span>
                                <input
                                  id="pdf-upload"
                                  name="pdf_upload"
                                  type="file"
                                  accept=".pdf"
                                  className="sr-only"
                                  onChange={handlePdfUpload}
                                  disabled={isUploading}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PDF up to 10MB
                            </p>
                          </>
                        ) : (
                          <div className="w-full">
                            <div className="flex items-center justify-center gap-3">
                              <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                              <div className="text-left">
                                <p className="text-sm font-medium text-gray-700">
                                  Uploading...
                                </p>
                                <div className="w-48 h-1.5 bg-gray-200 rounded-full mt-1">
                                  <div
                                    className="h-1.5 bg-red-600 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                  />
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {uploadProgress}%
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-red-500" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                            {uploadedFile?.name || 'PDF Template'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {uploadedFile && (uploadedFile.size / 1024 / 1024).toFixed(2) + ' MB'}
                          </p>
                          {assessmentFormData.pdf_template_url && !uploadedFile && (
                            <p className="text-xs text-green-600 truncate max-w-xs">
                              {assessmentFormData.pdf_template_url.split('/').pop()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <label className="cursor-pointer px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm border border-blue-200">
                          <Upload className="w-4 h-4 inline mr-1" />
                          Replace
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf"
                            onChange={handlePdfUpload}
                            disabled={isUploading}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm border border-red-200"
                          disabled={isUploading}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Show existing file if editing and no new file uploaded */}
                  {editingAssessment && editingAssessment.pdf_template_url && !assessmentFormData.pdf_template_url && !uploadedFile && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-blue-700">
                          Current file: {editingAssessment.pdf_template_url.split('/').pop()}
                        </span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Upload a new file to replace the existing one
                      </p>
                    </div>
                  )}

                  {assessmentErrors.pdf_template_url && (
                    <p className="mt-1 text-sm text-red-600">{assessmentErrors.pdf_template_url}</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={assessmentSaving || isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {assessmentSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {assessmentSaving ? "Saving..." : editingAssessment ? "Update Assessment" : "Create Assessment"}
          </button>
          <button
            type="button"
            onClick={onCancel || (() => {
              setShowCreateAssessment(false);
              setEditingAssessment(null);
              resetAssessmentForm();
              setAssessmentSuccess(false);
            })}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssessmentForm;