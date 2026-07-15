// components/Assessment/AssessmentList.js

import React from "react";
import Image from "next/image";
import { Plus, Edit, Trash2Icon, Loader2, BookOpen, FileCheck } from "lucide-react";

export const AssessmentList = ({
  programs,
  programsLoading,
    assessmentsLoading, // Add this
  assessments,
  getStatusBadge,
  handleEditAssessment,
  handleDeleteAssessment,
  setSelectedAssessmentId,
  setShowAddQuestion,
  setEditingQuestion,
  resetQuestionForm,
  showAddQuestion,
  selectedAssessmentId,
  QuestionForm,
  handleQuestionSubmit,
  handleQuestionFormChange,
  questionFormData,
  questionErrors,
  questionSaving,
  editingQuestion,
 handleDeleteQuestion,
  handleEditQuestion,
  setShowCreateAssessment, // Add this
  setEditingAssessment, // Add this
  resetAssessmentForm, // Add this
}) => {
      const isLoading = programsLoading || assessmentsLoading;

  return (
    <div className="space-y-6">
      {programsLoading || isLoading  ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto" />
          <p className="mt-2 text-gray-500">Loading programs...</p>
        </div>
      ) : programs.length === 0 ? (
        <div className="text-center py-12">
          <FileCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No programs created yet</p>
        </div>
      ) : (
        programs.map((program) => {
          const assessment = assessments[program.id];
          return (
            <div
              key={program.id}
              className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row">
                {program.thumbnail_url && (
                  <div className="md:w-48 h-32 bg-gray-200 shrink-0">
                    <Image
                      src={program.thumbnail_url}
                      alt={program.title}
                      width={192}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold text-gray-900">
                          {program.title}
                        </h4>
                        {program.course_code && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {program.course_code}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {program.description}
                      </p>

                      {/* Assessment Status */}
                      <div className="mt-2">
                        {assessment ? (
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(assessment.status)}`}>
                              {assessment.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              {assessment.questions?.length || 0} questions
                            </span>
                            <span className="text-xs text-gray-500">
                              Passing: {assessment.passing_score}%
                            </span>
                            <span className="text-xs text-gray-500">
                              Duration: {assessment.duration_minutes} min
                            </span>
                            <button
                              onClick={() => handleEditAssessment(assessment)}
                              className="text-xs text-blue-600 hover:text-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAssessment(program?.id, assessment?.id)}
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAssessmentId(assessment.id);
                                setShowAddQuestion(true);
                                setEditingQuestion(null);
                                resetQuestionForm();
                              }}
                              className="text-xs text-green-600 hover:text-green-700"
                            >
                              Add Questions
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedAssessmentId(program.id);
                              setShowCreateAssessment(true);
                              setEditingAssessment(null);
                              resetAssessmentForm();
                            }}
                            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            Create Assessment
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Questions Section */}
              {assessment && showAddQuestion && selectedAssessmentId === assessment.id && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-semibold text-gray-700">
                      Questions ({assessment.questions?.length || 0})
                    </h5>
                    <button
                      onClick={() => {
                        setEditingQuestion(null);
                        resetQuestionForm();
                        setShowAddQuestion(true);
                      }}
                      className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Question
                    </button>
                  </div>

                  {/* Add/Edit Question Form */}
                  {showAddQuestion && QuestionForm && (
                    <QuestionForm
                      editingQuestion={editingQuestion}
                      questionFormData={questionFormData}
                      questionErrors={questionErrors}
                      questionSaving={questionSaving}
                      handleQuestionFormChange={handleQuestionFormChange}
                      handleQuestionSubmit={() => handleQuestionSubmit(program.id, assessment.id)}
                      setShowAddQuestion={setShowAddQuestion}
                      setEditingQuestion={setEditingQuestion}
                      resetQuestionForm={resetQuestionForm}
                    />
                  )}

                  {/* Questions List */}
                  {assessment.questions && assessment.questions.length > 0 ? (
                    <div className="space-y-2">
                      {assessment.questions.map((question, idx) => (
                        <div key={question.id || idx} className="bg-white p-3 rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                Q{idx + 1}: {question.question_text}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                                <span>A: {question.option_a}</span>
                                <span>B: {question.option_b}</span>
                                {question.option_c && <span>C: {question.option_c}</span>}
                                {question.option_d && <span>D: {question.option_d}</span>}
                                <span className="text-green-600">Correct: {question.correct_option}</span>
                                <span>Marks: {question.marks || 1}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(question.status)}`}>
                                  {question.status}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-1 ml-2">
                              <button
                                onClick={() => handleEditQuestion(question)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(program.id, question.id)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2Icon className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">
                      No questions added yet
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};