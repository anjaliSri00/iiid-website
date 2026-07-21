// components/Assessment/AssessmentOperations.js

import { toast } from "react-toastify";
import { assessmentApi } from "@/helper/services/assessmentApi";

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
  setEditingAssessment,
  setEditingProgram 
) => {
  
  // Fetch assessment
  const fetchAssessment = async (courseId) => {
    if (!courseId) return null;
    
    if (assessments[courseId]) {
      return assessments[courseId];
    }
    
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
    // Validation
    const newErrors = {};
    if (!assessmentFormData.title?.trim()) {
      newErrors.title = "Title is required";
    }
    if (!assessmentFormData.passing_score && assessmentFormData.passing_score !== 0) {
      newErrors.passing_score = "Passing score is required";
    }
    if (!assessmentFormData.duration_minutes && assessmentFormData.duration_minutes !== 0) {
      newErrors.duration_minutes = "Duration is required";
    }
    
    // Validate assessment type
    const assessmentType = assessmentFormData.type || "mcq";
    if (!["mcq", "pdf_task", "odf"].includes(assessmentType)) {
      newErrors.type = "Assessment type must be 'mcq', 'pdf_task', or 'odf'";
    }
    
    // Validate PDF task specific fields
    if (assessmentType === "pdf_task") {
      if (!assessmentFormData.instructions?.trim()) {
        newErrors.instructions = "Instructions are required for PDF tasks";
      }
      if (!assessmentFormData.pdf_template_url?.trim()) {
        newErrors.pdf_template_url = "PDF template URL is required for PDF tasks";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setAssessmentErrors(newErrors);
      return;
    }

    setAssessmentSaving(true);
    setAssessmentSuccess(false);

    try {
      let response;
      
      // Prepare payload
      const payload = {
        title: assessmentFormData.title.trim(),
        description: assessmentFormData.description?.trim() || null,
        passing_score: parseFloat(assessmentFormData.passing_score),
        duration_minutes: parseFloat(assessmentFormData.duration_minutes),
        status: assessmentFormData.status || "draft",
        type: assessmentFormData.type || "mcq",
      };

      // Add PDF task specific fields if type is pdf_task
      if (assessmentFormData.type === "pdf_task") {
        payload.instructions = assessmentFormData.instructions?.trim();
        payload.pdf_template_url = assessmentFormData.pdf_template_url?.trim();
      }

      // console.log('Sending payload:', payload);

      if (editingAssessment) {
        // For update, only send fields that have changed
        const changedFields = {};
        Object.keys(payload).forEach(key => {
          if (payload[key] !== editingAssessment[key]) {
            changedFields[key] = payload[key];
          }
        });

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
        // Create assessment with full payload
        response = await assessmentApi.createAssessment(
          courseId, 
          payload, 
          session
        );
      }

      if (response.meta?.status === 201 || response.meta?.status === 200) {
        const savedAssessment = response.data;
        toast.success(editingAssessment ? "Assessment updated successfully!" : "Assessment created successfully!");
        setAssessmentSuccess(true);
        
        // Update assessments state
        setAssessments(prev => {
          const currentAssessments = prev[courseId] || [];
          if (editingAssessment) {
            // Update existing assessment
            const updatedAssessments = currentAssessments.map(a => 
              a.id === editingAssessment.id ? savedAssessment : a
            );
            return {
              ...prev,
              [courseId]: updatedAssessments
            };
          } else {
            // Add new assessment
            return {
              ...prev,
              [courseId]: [...currentAssessments, savedAssessment]
            };
          }
        });

           if (typeof setEditingProgram === 'function') {
        setEditingProgram(prev => {
          if (!prev) return prev;
          
          const currentAssessments = prev.assessment || [];
          let updatedAssessments;
          
          if (editingAssessment) {
            // Update existing assessment
            updatedAssessments = currentAssessments.map(a => 
              a.id === editingAssessment.id ? savedAssessment : a
            );
          } else {
            // Add new assessment
            updatedAssessments = [...currentAssessments, savedAssessment];
          }
          
          return {
            ...prev,
            assessment: updatedAssessments
          };
        });
      }
        // Close modal after delay
        setTimeout(() => {
          if (closeModal) closeModal();
          resetAssessmentForm();
          if (setEditingAssessment) setEditingAssessment(null);
        }, 1000);
        
        // Refresh programs to get updated data
        if (fetchPrograms) await fetchPrograms();
      } else {
        // Handle non-200/201 responses
        const errorMessage = response.meta?.message || "Failed to save assessment";
        // console.error('API returned error:', response.meta);
        // toast.error(errorMessage);
        setAssessmentErrors({ general: errorMessage });
      }
    } catch (error) {
      console.error("Error saving assessment:", error);
      
      // Handle validation errors from server
      if (error.response?.data?.errors) {
        const serverErrors = {};
        error.response.data.errors.forEach(err => {
          serverErrors[err.field] = err.message;
        });
        setAssessmentErrors(serverErrors);
        toast.error("Please fix the validation errors");
      } else {
        toast.error(error.response?.data?.message || "Failed to save assessment");
        setAssessmentErrors({ general: error.response?.data?.message || "Failed to save assessment" });
      }
    } finally {
      setAssessmentSaving(false);
    }
  };

  // Delete assessment
  const handleDeleteAssessment = async (courseId, assessmentId) => {
    // Validate IDs
    if (!courseId) {
      toast.error("Course ID is missing. Please refresh the page.");
      return;
    }
    if (!assessmentId) {
      toast.error("Assessment ID is missing. Please refresh the page.");
      return;
    }

    if (!confirm("Are you sure you want to delete this assessment?")) return;

    try {
      const response = await assessmentApi.deleteAssessment(courseId, assessmentId, session);
      if (response.meta?.status === 200) {
        toast.success("Assessment deleted successfully!");
        setAssessments(prev => {
          const currentAssessments = prev[courseId] || [];
          return {
            ...prev,
            [courseId]: currentAssessments.filter(a => a.id !== assessmentId)
          };
        });
        if (typeof setEditingProgram === 'function') {
        setEditingProgram(prev => {
          if (!prev) return prev;
          
          const currentAssessments = prev.assessment || [];
          const updatedAssessments = currentAssessments.filter(a => a.id !== assessmentId);
          
          return {
            ...prev,
            assessment: updatedAssessments
          };
        });
      }
        if (fetchPrograms) await fetchPrograms();
      }
       else {
        toast.error(response.meta?.message || "Failed to delete assessment");
      }
    } catch (error) {
      console.error("Error deleting assessment:", error);
      toast.error(error.response?.data?.message || "Failed to delete assessment");
    }
  };  

  // Activate assessment
  const handleActivateAssessment = async (courseId, assessmentId) => {
    if (!courseId || !assessmentId) {
      toast.error("Missing required IDs");
      return;
    }

    if (!confirm("Are you sure you want to activate this assessment?")) return;

    try {
      const response = await assessmentApi.activateAssessment(courseId, assessmentId, session);
      if (response.meta?.status === 200) {
        toast.success("Assessment activated successfully!");
              const updatedAssessment = response.data;

         if (updatedAssessment) {
        setAssessments(prev => {
          const currentAssessments = prev[courseId] || [];
          const updatedAssessments = currentAssessments.map(a => 
            a.id === assessmentId ? updatedAssessment : a
          );
          return {
            ...prev,
            [courseId]: updatedAssessments
          };
        });
        if (typeof setEditingProgram === 'function') {
          setEditingProgram(prev => {
            if (!prev) return prev;
            
            const currentAssessments = prev.assessment || [];
            const updatedAssessments = currentAssessments.map(a => 
              a.id === assessmentId ? updatedAssessment : a
            );
            
            return {
              ...prev,
              assessment: updatedAssessments
            };
          });
        }
      }
        if (fetchPrograms) await fetchPrograms();
      } else {
        toast.error(response.meta?.message || "Failed to activate assessment");
      }
    } catch (error) {
      console.error("Error activating assessment:", error);
      toast.error("Failed to activate assessment");
    }
  };

  // Deactivate assessment
  const handleDeactivateAssessment = async (courseId, assessmentId) => {
    if (!courseId || !assessmentId) {
      toast.error("Missing required IDs");
      return;
    }

    if (!confirm("Are you sure you want to deactivate this assessment?")) return;

    try {
      const response = await assessmentApi.deactivateAssessment(courseId, assessmentId, session);
      if (response.meta?.status === 200) {
        toast.success("Assessment deactivated successfully!");
          const updatedAssessment = response.data;
      
      // Update assessments state
      if (updatedAssessment) {
        setAssessments(prev => {
          const currentAssessments = prev[courseId] || [];
          const updatedAssessments = currentAssessments.map(a => 
            a.id === assessmentId ? updatedAssessment : a
          );
          return {
            ...prev,
            [courseId]: updatedAssessments
          };
        });

        // 🔥 Also update editingProgram
        if (typeof setEditingProgram === 'function') {
          setEditingProgram(prev => {
            if (!prev) return prev;
            
            const currentAssessments = prev.assessment || [];
            const updatedAssessments = currentAssessments.map(a => 
              a.id === assessmentId ? updatedAssessment : a
            );
            
            return {
              ...prev,
              assessment: updatedAssessments
            };
          });
        }
      }
        if (fetchPrograms) await fetchPrograms();
      } else {
        toast.error(response.meta?.message || "Failed to deactivate assessment");
      }
    } catch (error) {
      console.error("Error deactivating assessment:", error);
      toast.error("Failed to deactivate assessment");
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
      type: assessment.type || "mcq",
      instructions: assessment.instructions || "",
      pdf_template_url: assessment.pdf_template_url || "",
    });
  };

  // Reset assessment form
  const resetAssessmentFormHandler = () => {
    setAssessmentFormData({
      title: "",
      description: "",
      passing_score: 60,
      duration_minutes: 30,
      status: "draft",
      type: "mcq",
      instructions: "",
      pdf_template_url: "",
    });
    setAssessmentErrors({});
  };

  return {
    fetchAssessment,
    handleAssessmentFormChange,
    handleAssessmentSubmit,
    handleDeleteAssessment,
    handleActivateAssessment,
    handleDeactivateAssessment,
    handleEditAssessment,
    resetAssessmentFormHandler,
  };
};