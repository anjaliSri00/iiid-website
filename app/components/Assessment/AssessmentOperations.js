// components/Assessment/AssessmentOperations.js

import { toast } from "react-toastify";
import { assessmentApi } from "@/helper/assessmentApi";

export const useAssessmentOperations = (
  session,
  assessments,
  setAssessments,
  fetchPrograms,
  setAssessmentFormData,
  setAssessmentErrors,
  setAssessmentSaving,
  setAssessmentSuccess,
  resetAssessmentForm,
  closeModal,
  setEditingAssessment
) => {
  
  // Fetch assessment - Now just returns the assessment from state if available
  const fetchAssessment = async (courseId) => {
    if (!courseId) return null;
    
    // Check if we already have the assessment in state
    if (assessments[courseId]) {
      return assessments[courseId];
    }
    
    // If not in state, fetch from API (but this should rarely be needed)
    try {
      const response = await assessmentApi.getAssessment(courseId, session);
      if (response.meta?.status === 200 && response.data) {
        setAssessments(prev => ({
          ...prev,
          [courseId]: response.data
        }));
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching assessment:", error);
      return null;
    }
  };

  // Handle assessment form change
  const handleAssessmentFormChange = (e) => {
    const { name, value } = e.target;
    setAssessmentFormData(prev => ({ ...prev, [name]: value }));
    setAssessmentErrors(prev => ({ ...prev, [name]: "" }));
  };

  // Create/Update assessment
  const handleAssessmentSubmit = async (
    courseId,
    assessmentFormData,
    editingAssessment
  ) => {
    const newErrors = {};
    if (!assessmentFormData.title) newErrors.title = "Title is required";
    if (!assessmentFormData.description) newErrors.description = "Description is required";
    if (!assessmentFormData.passing_score) newErrors.passing_score = "Passing score is required";
    if (!assessmentFormData.duration_minutes) newErrors.duration_minutes = "Duration is required";

    if (Object.keys(newErrors).length > 0) {
      setAssessmentErrors(newErrors);
      return;
    }

    setAssessmentSaving(true);
    setAssessmentSuccess(false);

    try {
      let response;
      if (editingAssessment) {
        // Update assessment
        const changedFields = {};
        if (assessmentFormData.title !== editingAssessment.title) changedFields.title = assessmentFormData.title;
        if (assessmentFormData.description !== editingAssessment.description) changedFields.description = assessmentFormData.description;
        if (parseFloat(assessmentFormData.passing_score) !== parseFloat(editingAssessment.passing_score)) {
          changedFields.passing_score = parseFloat(assessmentFormData.passing_score);
        }
        if (parseFloat(assessmentFormData.duration_minutes) !== parseFloat(editingAssessment.duration_minutes)) {
          changedFields.duration_minutes = parseFloat(assessmentFormData.duration_minutes);
        }
        if (assessmentFormData.status !== editingAssessment.status) changedFields.status = assessmentFormData.status;

        if (Object.keys(changedFields).length === 0) {
          toast.info("No changes to update");
          setAssessmentSaving(false);
          return;
        }

        response = await assessmentApi.updateAssessment(
          courseId,
          editingAssessment.id,
          changedFields,
          session
        );
      } else {
        // Create assessment
        const payload = {
          title: assessmentFormData.title,
          description: assessmentFormData.description,
          passing_score: parseFloat(assessmentFormData.passing_score),
          duration_minutes: parseFloat(assessmentFormData.duration_minutes),
          status: assessmentFormData.status || "draft",
        };
        response = await assessmentApi.createAssessment(courseId, payload, session);
      }

      if (response.meta?.status === 201 || response.meta?.status === 200) {
        const savedAssessment = response.data;
        toast.success(editingAssessment ? "Assessment updated successfully!" : "Assessment created successfully!");
        setAssessmentSuccess(true);
        
        // Update assessments state
        setAssessments(prev => ({
          ...prev,
          [courseId]: savedAssessment
        }));

        // Close modal after delay
        setTimeout(() => {
          if (closeModal) closeModal();
          resetAssessmentForm();
          if (setEditingAssessment) setEditingAssessment(null);
        }, 1000);
        
        // Refresh programs to get updated data
        if (fetchPrograms) await fetchPrograms();
      } else {
        toast.error(response.meta?.message || "Failed to save assessment");
      }
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast.error("Failed to save assessment");
    } finally {
      setAssessmentSaving(false);
    }
  };

  // Delete assessment
  const handleDeleteAssessment = async (courseId, assessmentId) => {
    if (!confirm("Are you sure you want to delete this assessment?")) return;

    try {
      const response = await assessmentApi.deleteAssessment(courseId, assessmentId, session);
      if (response.meta?.status === 200) {
        toast.success("Assessment deleted successfully!");
        setAssessments(prev => ({
          ...prev,
          [courseId]: null
        }));
        if (fetchPrograms) await fetchPrograms();
      } else {
        toast.error(response.meta?.message || "Failed to delete assessment");
      }
    } catch (error) {
      console.error("Error deleting assessment:", error);
      toast.error("Failed to delete assessment");
    }
  };

  // Handle edit assessment
  const handleEditAssessment = (assessment) => {
    setEditingAssessment(assessment);
    setAssessmentFormData({
      title: assessment.title || "",
      description: assessment.description || "",
      passing_score: assessment.passing_score || 60,
      duration_minutes: assessment.duration_minutes || 30,
      status: assessment.status || "draft",
    });
  };

  return {
    fetchAssessment,
    handleAssessmentFormChange,
    handleAssessmentSubmit,
    handleDeleteAssessment,
    handleEditAssessment,
  };
};