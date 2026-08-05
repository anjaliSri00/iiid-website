// components/Assessment/AssessmentModal.js

import React, { useState, useEffect } from "react";
import { X, FileCheck, Star, StarOff, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import AssessmentForm from "./AssessmentForm";
import { assessmentApi } from "@/helper/services/assessmentApi";
import { useSession } from "next-auth/react";
import fetchApiResponse from "@/helper/api_data_store";

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
  onAssessmentUpdate,
}) => {
  const { data: session } = useSession();
  const [isDefaultAssessment, setIsDefaultAssessment] = useState(false);
  const [loadingDefault, setLoadingDefault] = useState(false);
  const [currentDefaultId, setCurrentDefaultId] = useState(null);

  // Check if this assessment is the default
  useEffect(() => {
    if (editingAssessment) {
      setIsDefaultAssessment(editingAssessment.is_default || false);
    } else {
      setIsDefaultAssessment(false);
    }
  }, [editingAssessment]);

useEffect(() => {
  if (isOpen || editingAssessment) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }

  return () => {
    document.body.style.overflow = 'unset';
  };
}, [isOpen, editingAssessment]);

  // Fetch current default assessment for the course
  useEffect(() => {
    if (isOpen && courseId) {
      fetchCurrentDefault();
    }
  }, [isOpen, courseId]);

  const fetchCurrentDefault = async () => {
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/details/${courseId}`,
        {
          method: "GET",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
        }
      );
      
      if (response?.meta?.status === 200 && response.data) {
        const course = response.data;
        if (course.assessment) {
          const assessments = Array.isArray(course.assessment) 
            ? course.assessment 
            : [course.assessment];
          
          const defaultAssessment = assessments.find(a => a.is_default === true);
          if (defaultAssessment) {
            setCurrentDefaultId(defaultAssessment.id);
          } else {
            setCurrentDefaultId(null);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching current default:", error);
      setCurrentDefaultId(null);
    }
  };

  const handleSetDefault = async () => {
    if (!courseId || !editingAssessment?.id) {
      toast.error("Course or Assessment ID is missing");
      return;
    }

    if (!confirm("Are you sure you want to set this as the default assessment?")) {
      return;
    }

    setLoadingDefault(true);
    try {
      // Use the assessmentApi.setDefaultAssessment which now handles type
      const response = await assessmentApi.setDefaultAssessment(
        courseId,
        editingAssessment.id,
        session
      );

      if (response?.meta?.status === 200) {
        toast.success("Default assessment updated successfully!");
        setIsDefaultAssessment(true);
        setCurrentDefaultId(editingAssessment.id);
        
        // Update the editingAssessment object
        setEditingAssessment({
          ...editingAssessment,
          is_default: true,
        });
        
        // Update form data
        handleAssessmentFormChange({
          target: {
            name: 'is_default',
            value: true,
          }
        });

        // Refresh parent data
        if (onAssessmentUpdate) {
          onAssessmentUpdate();
        }
      } 
      // else {
      //   toast.error(response?.meta?.message || "Failed to set default assessment");
      // }
    } catch (error) {
      console.error("Error setting default:", error);
      toast.error(error.message || "Failed to set default assessment");
    } finally {
      setLoadingDefault(false);
    }
  };

  const handleRemoveDefault = async () => {
    if (!courseId || !editingAssessment?.id) {
      toast.error("Course or Assessment ID is missing");
      return;
    }

    if (!confirm("Are you sure you want to remove this as the default assessment?")) {
      return;
    }

    setLoadingDefault(true);
    try {
      // Use assessmentApi.removeDefaultAssessment
      const type = editingAssessment.type || 'mcq';
      const response = await assessmentApi.removeDefaultAssessment(
        courseId,
        type,
        session
      );

      if (response?.meta?.status === 200) {
        toast.success("Default assessment removed!");
        setIsDefaultAssessment(false);
        setCurrentDefaultId(null);
        
        // Update the editingAssessment object
        setEditingAssessment({
          ...editingAssessment,
          is_default: false,
        });
        
        // Update form data
        handleAssessmentFormChange({
          target: {
            name: 'is_default',
            value: false,
          }
        });

        // Refresh parent data
        if (onAssessmentUpdate) {
          onAssessmentUpdate();
        }
      } else {
        toast.error(response?.meta?.message || "Failed to remove default assessment");
      }
    } catch (error) {
      console.error("Error removing default:", error);
      toast.error(error.message || "Failed to remove default assessment");
    } finally {
      setLoadingDefault(false);
    }
  };

  // Handle form submission with default status
  const handleFormSubmit = async (courseId, submitData) => {
    try {
      // First, submit the assessment (create or update)
      await handleAssessmentSubmit(courseId, submitData);
      
      // If the assessment is being set as default, also call setDefaultAssessment
      if (submitData.is_default && editingAssessment?.id) {
        await handleSetDefault();
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("Failed to save assessment");
    }
  };

  if (!isOpen) return null;

  // Find the course name
  const program = programs?.find(p => p.id === courseId);
  const courseName = program?.title || 'Unknown Course';

  // Get assessment type for display
  const assessmentType = assessmentFormData.type || 'mcq';
  const typeLabel = assessmentType === 'pdf_task' ? 'PDF' : 'MCQ';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between rounded-t-2xl">
          <div className="flex flex-wrap items-center gap-3">
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
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">{typeLabel}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Default Assessment Toggle - Only show when editing existing assessment */}
            {editingAssessment && editingAssessment.id && (
              <div className="flex flex-wrap items-center gap-2 mr-2">
                <button
                  onClick={isDefaultAssessment ? handleRemoveDefault : handleSetDefault}
                  disabled={loadingDefault || assessmentSaving}
                  className={`flex flex-wrap items-center gap-1.5 px-3 py-1.5  text-sm font-medium transition-all ${
                    isDefaultAssessment
                      ? "bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100"
                      : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isDefaultAssessment ? "Remove as default" : "Set as default"}
                >
                  {loadingDefault ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isDefaultAssessment ? (
                    <>
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span>Default {typeLabel}</span>
                    </>
                  ) : (
                    <>
                      <StarOff className="w-4 h-4" />
                      <span>Set Default</span>
                    </>
                  )}
                </button>
              </div>
            )}
            
            <button
              onClick={onClose}
              className="p-2 hidden hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Default Assessment Info Banner */}
        {editingAssessment && isDefaultAssessment && (
          <div className="px-6 py-2 bg-yellow-50 border-b border-yellow-200 flex items-center gap-2">
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            <p className="text-sm text-yellow-700">
              This assessment is currently set as the <strong>default {typeLabel}</strong> for this course.
              Students will be automatically assigned to this assessment.
            </p>
          </div>
        )}

        {currentDefaultId && currentDefaultId !== editingAssessment?.id && (
          <div className="px-6 py-2 bg-blue-50 border-b border-blue-200 flex items-center gap-2">
            <StarOff className="w-4 h-4 text-blue-500" />
            <p className="text-sm text-blue-700">
              Another {typeLabel} assessment is currently the default for this course.
              You can set this as the default by clicking the star button above.
            </p>
          </div>
        )}

        {/* Modal Body */}
        <div className="px-6 py-6">
          {!courseId ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Please select a course first</p>
            </div>
          ) : (
            <AssessmentForm
              editingAssessment={{
                ...editingAssessment,
                is_default: isDefaultAssessment,
              }}
              assessmentFormData={{
                ...assessmentFormData,
                is_default: isDefaultAssessment,
              }}
              assessmentErrors={assessmentErrors}
              assessmentSaving={assessmentSaving}
              assessmentSuccess={assessmentSuccess}
              handleAssessmentFormChange={handleAssessmentFormChange}
              handleAssessmentSubmit={() => {
                if (courseId) {
                  const submitData = {
                    ...assessmentFormData,
                    is_default: isDefaultAssessment,
                  };
                  // Use the wrapper function to handle both save and default
                  handleFormSubmit(courseId, submitData);
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
              session={session}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentModal;