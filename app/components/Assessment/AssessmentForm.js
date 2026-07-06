// components/Assessment/AssessmentForm.js

import React from "react";
import { X, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

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
}) => {
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
          handleAssessmentSubmit(courseId);
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
              value={assessmentFormData.title}
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
              Status
            </label>
            <select
              name="status"
              value={assessmentFormData.status}
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
              value={assessmentFormData.passing_score}
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
              value={assessmentFormData.duration_minutes}
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

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={assessmentFormData.description}
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
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={assessmentSaving}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
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