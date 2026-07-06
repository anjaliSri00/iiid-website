// components/Assessment/AssessmentState.js

import { useState } from "react";

export const useAssessmentState = () => {
  // Assessment states
  const [assessments, setAssessments] = useState({});
  const [assessmentsLoading, setAssessmentsLoading] = useState(false);
  const [showCreateAssessment, setShowCreateAssessment] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [assessmentFormData, setAssessmentFormData] = useState({
    title: "",
    description: "",
    passing_score: 60,
    duration_minutes: 30,
    status: "draft",
  });
  const [assessmentErrors, setAssessmentErrors] = useState({});
  const [assessmentSaving, setAssessmentSaving] = useState(false);
  const [assessmentSuccess, setAssessmentSuccess] = useState(false);

  // Question states
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionFormData, setQuestionFormData] = useState({
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "",
    marks: 1,
    status: "draft",
  });
  const [questionErrors, setQuestionErrors] = useState({});
  const [questionSaving, setQuestionSaving] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);

  const resetAssessmentForm = () => {
    setAssessmentFormData({
      title: "",
      description: "",
      passing_score: 60,
      duration_minutes: 30,
      status: "draft",
    });
    setAssessmentErrors({});
    setAssessmentSuccess(false);
    // setSelectedAssessmentId(null);
  };

  const resetQuestionForm = () => {
    setQuestionFormData({
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_option: "",
      marks: 1,
      status: "draft",
    });
    setQuestionErrors({});
  };

  return {
    assessments,
    setAssessments,
    assessmentsLoading,
    setAssessmentsLoading,
    showCreateAssessment,
    setShowCreateAssessment,
    editingAssessment,
    setEditingAssessment,
    assessmentFormData,
    setAssessmentFormData,
    assessmentErrors,
    setAssessmentErrors,
    assessmentSaving,
    setAssessmentSaving,
    assessmentSuccess,
    setAssessmentSuccess,
    showAddQuestion,
    setShowAddQuestion,
    editingQuestion,
    setEditingQuestion,
    questionFormData,
    setQuestionFormData,
    questionErrors,
    setQuestionErrors,
    questionSaving,
    setQuestionSaving,
    selectedAssessmentId,
    setSelectedAssessmentId,
    resetAssessmentForm,
    resetQuestionForm,
  };
};