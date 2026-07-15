// components/Assessment/QuestionOperations.js

import { toast } from "react-toastify";
import { assessmentApi } from "@/helper/services/assessmentApi";
import fetchApiResponse from "@/helper/api_data_store";

export const useQuestionOperations = (session, fetchAssessment, setAssessments, setEditingProgram) => {
  
  // Handle question form change
  const handleQuestionFormChange = (e, setQuestionFormData, setQuestionErrors) => {
    const { name, value } = e.target;
    setQuestionFormData(prev => ({ ...prev, [name]: value }));
    setQuestionErrors(prev => ({ ...prev, [name]: "" }));
  };

  // Create/Update question
  const handleQuestionSubmit = async (
    courseId,
    assessmentId,
    questionFormData,
    editingQuestion,
    setQuestionSaving,
    resetQuestionForm,
    onSuccess,
    setEditingQuestion,
    setQuestionErrors
  ) => {
    // console.log("handleQuestionSubmit called with:", { courseId, assessmentId, editingQuestion });

    // Validate required fields
    const newErrors = {};
    if (!questionFormData.question_text) newErrors.question_text = "Question text is required";
    if (!questionFormData.option_a) newErrors.option_a = "Option A is required";
    if (!questionFormData.option_b) newErrors.option_b = "Option B is required";
    if (!questionFormData.correct_option) newErrors.correct_option = "Correct option is required";

    if (Object.keys(newErrors).length > 0) {
      setQuestionErrors(newErrors);
      return;
    }

    setQuestionSaving(true);

    try {
      let response;
      
      if (editingQuestion) {
        // UPDATE: Only send changed fields
        const changedFields = {};
        if (questionFormData.question_text !== editingQuestion.question_text) {
          changedFields.question_text = questionFormData.question_text;
        }
        if (questionFormData.option_a !== editingQuestion.option_a) {
          changedFields.option_a = questionFormData.option_a;
        }
        if (questionFormData.option_b !== editingQuestion.option_b) {
          changedFields.option_b = questionFormData.option_b;
        }
        if (questionFormData.option_c !== (editingQuestion.option_c || "")) {
          changedFields.option_c = questionFormData.option_c || "";
        }
        if (questionFormData.option_d !== (editingQuestion.option_d || "")) {
          changedFields.option_d = questionFormData.option_d || "";
        }
        if (questionFormData.correct_option !== editingQuestion.correct_option) {
          changedFields.correct_option = questionFormData.correct_option;
        }
        if (parseFloat(questionFormData.marks) !== parseFloat(editingQuestion.marks || 1)) {
          changedFields.marks = parseFloat(questionFormData.marks) || 1;
        }
        if (questionFormData.status !== editingQuestion.status) {
          changedFields.status = questionFormData.status;
        }
        if (questionFormData.order_number !== editingQuestion.order_number) {
          changedFields.order_number = parseInt(questionFormData.order_number) || 0;
        }

        if (Object.keys(changedFields).length === 0) {
          toast.info("No changes to update");
          setQuestionSaving(false);
          return;
        }
        
        response = await assessmentApi.updateQuestion(
          courseId,
          editingQuestion.id,
          changedFields,
          session
        );
      } else {
        // CREATE: Send all fields for new question
        const payload = {
          question_text: questionFormData.question_text,
          option_a: questionFormData.option_a,
          option_b: questionFormData.option_b,
          option_c: questionFormData.option_c || "",
          option_d: questionFormData.option_d || "",
          correct_option: questionFormData.correct_option,
          marks: parseFloat(questionFormData.marks) || 1,
          order_number: parseInt(questionFormData.order_number) || 0,
          status: questionFormData.status || "draft",
        };
        
        response = await assessmentApi.addQuestion(courseId, assessmentId, payload, session);
      }

      if (response.meta?.status === 201 || response.meta?.status === 200) {
        toast.success(editingQuestion ? "Question updated successfully!" : "Question added successfully!");
        
        // Reset form
        resetQuestionForm();
        setEditingQuestion(null);
        
        // Call onSuccess callback (to close form and refresh data)
        if (onSuccess) onSuccess();
        
        // 🔥 FIX: Update assessments state
        if (setAssessments && courseId) {
          setAssessments(prev => {
            const currentAssessments = prev[courseId] || [];
            const assessmentIndex = currentAssessments.findIndex(a => a.id === assessmentId);
            
            if (assessmentIndex === -1) return prev;
            
            const updatedAssessment = { ...currentAssessments[assessmentIndex] };
            const currentQuestions = updatedAssessment.questions || [];
            
            if (editingQuestion) {
              updatedAssessment.questions = currentQuestions.map(q => 
                q.id === editingQuestion.id ? response.data : q
              );
            } else {
              updatedAssessment.questions = [...currentQuestions, response.data];
            }
            
            const updatedAssessments = [...currentAssessments];
            updatedAssessments[assessmentIndex] = updatedAssessment;
            
            return {
              ...prev,
              [courseId]: updatedAssessments
            };
          });
        }

        // 🔥 FIX: Also update editingProgram if available
        if (typeof setEditingProgram === 'function') {
          setEditingProgram(prev => {
            if (!prev) return prev;
            
            const currentAssessments = prev.assessment || [];
            const assessmentIndex = currentAssessments.findIndex(a => a.id === assessmentId);
            
            if (assessmentIndex === -1) return prev;
            
            const updatedAssessment = { ...currentAssessments[assessmentIndex] };
            const currentQuestions = updatedAssessment.questions || [];
            
            if (editingQuestion) {
              updatedAssessment.questions = currentQuestions.map(q => 
                q.id === editingQuestion.id ? response.data : q
              );
            } else {
              updatedAssessment.questions = [...currentQuestions, response.data];
            }
            
            const updatedAssessments = [...currentAssessments];
            updatedAssessments[assessmentIndex] = updatedAssessment;
            
            return {
              ...prev,
              assessment: updatedAssessments
            };
          });
        }
        
        // Refresh assessment data
        if (fetchAssessment) {
          await fetchAssessment(courseId);
        }
      } else {
        toast.error(response.meta?.message || "Failed to save question");
      }
    } catch (error) {
      console.error("❌ Error saving question:", error);
      toast.error("Failed to save question: " + error.message);
    } finally {
      setQuestionSaving(false);
    }
  };

  // Delete question
 const handleDeleteQuestion = async (courseId, questionId, assessmentId) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const response = await assessmentApi.deleteQuestion(courseId, questionId, session);
      
      if (response.meta?.status === 200) {
        toast.success("Question deleted successfully!");
        
        // 🔥 FIX: Fetch fresh course data from API
        if (courseId) {
          try {
            const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/details/${courseId}`;
            const freshResponse = await fetchApiResponse(url, {
              method: "GET",
              headers: {
                "Access-Token": session?.accessToken,
                "Refresh-Token": session?.refreshToken,
              },
            });
            
            if (freshResponse.meta?.status === 200 && freshResponse.data) {
              const courseData = freshResponse.data;
                freshAssessmentData = freshResponse.data.assessment || [];
              
              // Update assessments state with fresh data
              if (setAssessments) {
                setAssessments(prev => ({
                  ...prev,
                  [courseId]: courseData.assessment || []
                }));
              }
              
              // 🔥 Update editingProgram with fresh data
              if (typeof setEditingProgram === 'function') {
                setEditingProgram(prev => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    assessment: courseData.assessment || []
                  };
                });
              }
            }
          } catch (error) {
            console.error("Error fetching fresh course data:", error);
          }
        }
        
        // Call fetchAssessment to refresh
        if (fetchAssessment) {
          await fetchAssessment(courseId);
        }
        
      } else {
        toast.error(response.meta?.message || "Failed to delete question");
      }
    } catch (error) {
      console.error("❌ Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };


  // Handle edit question
  const handleEditQuestion = (question, setEditingQuestion, setQuestionFormData, setShowAddQuestion, setSelectedAssessmentId, courseId) => {
    console.log("✏️ Editing question:", question);
    
    if (typeof setEditingQuestion !== 'function') {
      console.error("setEditingQuestion is not a function!", setEditingQuestion);
      return;
    }
    
    if (setSelectedAssessmentId && typeof setSelectedAssessmentId === 'function' && courseId) {
      setSelectedAssessmentId(courseId);
    }
    
    setEditingQuestion(question);
    setQuestionFormData({
      question_text: question.question_text || "",
      option_a: question.option_a || "",
      option_b: question.option_b || "",
      option_c: question.option_c || "",
      option_d: question.option_d || "",
      correct_option: question.correct_option || "",
      marks: question.marks || 1,
      status: question.status || "draft",
      order_number: question.order_number || 0,
    });
    setShowAddQuestion(true);
  };

  return {
    handleQuestionFormChange,
    handleQuestionSubmit,
    handleDeleteQuestion,
    handleEditQuestion,
  };
};