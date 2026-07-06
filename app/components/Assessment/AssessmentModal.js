// components/Assessment/AssessmentModal.js

import React from "react";
import { X, FileCheck } from "lucide-react";
import AssessmentForm  from "./AssessmentForm";

const AssessmentModal = ({
  isOpen,
  onClose,
  editingAssessment,
  assessmentFormData,
  assessmentErrors,
  assessmentSaving,
  assessmentSuccess,
  handleAssessmentFormChange,
  handleAssessmentSubmit,
  setAssessmentSuccess,
  resetAssessmentForm,
  setEditingAssessment,
  courseId,
  programs,
}) => {
  if (!isOpen) return null;
  // Find the course name
  const program = programs.find(p => p.id === courseId);

  const courseName = program?.title || 'Unknown Course';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <FileCheck className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {editingAssessment ? "Edit Assessment" : "Create Assessment"}
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Course:</span>
                <span className="font-medium text-red-600">
                  {courseName}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-6">
          {!courseId ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Please select a course first</p>
            </div>
          ) : (
            <AssessmentForm
              editingAssessment={editingAssessment}
              assessmentFormData={assessmentFormData}
              assessmentErrors={assessmentErrors}
              assessmentSaving={assessmentSaving}
              assessmentSuccess={assessmentSuccess}
              handleAssessmentFormChange={handleAssessmentFormChange}
              handleAssessmentSubmit={() => {
                if (courseId) {
                  handleAssessmentSubmit(courseId);
                } else {
                  toast.error("Please select a course first");
                }
              }}
              setShowCreateAssessment={onClose}
              setEditingAssessment={setEditingAssessment}
              resetAssessmentForm={resetAssessmentForm}
              setAssessmentSuccess={setAssessmentSuccess}
              courseId={courseId}
              onCancel={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentModal;