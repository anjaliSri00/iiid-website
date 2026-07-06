// components/Assessment/ProgramCard.js

import React, { useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  Clock,
  Award,
  FileText,
  Edit,
  Trash2Icon,
  FileCheck,
  Plus,
  ChevronDown,
  ChevronRight,
  Users,
  Star,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const ProgramCard = ({
  program,
  assessment,
  getStatusBadge,
  onEditProgram,
  onDeleteProgram,
  onEditAssessment,
  onDeleteAssessment,
  onCreateAssessment,
  onManageQuestions,
  onSelectCourse,
  expandedAssessment,
  setExpandedAssessment,
  showAddQuestion,
  selectedAssessmentId,
  editingQuestion,
  questionFormData,
  questionErrors,
  questionSaving,
  handleQuestionFormChange,
  handleQuestionSubmit,
  handleDeleteQuestion,
  handleEditQuestion,
  resetQuestionForm,
  setShowAddQuestion,
  setEditingQuestion,
  QuestionForm,
  setQuestionFormData,
}) => {
  const isExpanded = expandedAssessment === program.id;
  const [isHovered, setIsHovered] = useState(false);

  const toggleAssessment = () => {
    setExpandedAssessment(isExpanded ? null : program.id);
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      published: "bg-emerald-50 text-emerald-700 border-emerald-200",
      draft: "bg-amber-50 text-amber-700 border-amber-200",
      archived: "bg-gray-50 text-gray-700 border-gray-200",
      active: "bg-emerald-50 text-emerald-700 border-emerald-200",
      completed: "bg-blue-50 text-blue-700 border-blue-200",
      inactive: "bg-gray-50 text-gray-700 border-gray-200",
      pending: "bg-amber-50 text-amber-700 border-amber-200",
    };
    return colors[status] || colors.draft;
  };

  return (
    <div 
      className="group bg-white rounded-2xl border border-gray-200/60 overflow-hidden hover:shadow-xl hover:border-red-200/60 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col md:flex-row">
        {/* Thumbnail */}
        <div className="relative md:w-56 h-48 bg-gradient-to-br from-gray-100 to-gray-200 shrink-0 overflow-hidden">
          {program.thumbnail_url ? (
            <Image
              src={program.thumbnail_url}
              alt={program.title}
              loading="lazy"
              fill
              className={`object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          
          {/* Status Badge on Image */}
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm border ${getStatusColor(program.status)}`}>
              {program.status}
            </span>
          </div>
          
          {/* Course Code */}
          {program.course_code && (
            <div className="absolute bottom-3 left-3">
              <span className="px-2.5 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                {program.course_code}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Title and Actions */}
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-lg font-semibold text-gray-900 truncate">
                  {program.title}
                </h4>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {program.description}
              </p>

              {/* Program Details */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
                  <BookOpen className="w-3.5 h-3.5" />
                  {program.category}
                </span>
                <span className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  {program.duration}
                </span>
                <span className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
                  <Award className="w-3.5 h-3.5" />
                  {program.level}
                </span>
                {program.lessons && program.lessons.length > 0 && (
                  <span className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
                    <FileText className="w-3.5 h-3.5" />
                    {program.lessons.length} lessons
                  </span>
                )}
                {program.discount > 0 ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
                    <Star className="w-3.5 h-3.5 fill-emerald-500" />
                    ₹{program.final_price}
                    <span className="text-gray-400 line-through ml-0.5">₹{program.original_price}</span>
                    <span className="text-emerald-600">{program.discount}% off</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 font-semibold text-gray-700 bg-gray-50 px-2.5 py-1 rounded-full">
                    ₹{program.final_price || program.original_price}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => onEditProgram(program)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                title="Edit Program"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteProgram(program.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title="Delete Program"
              >
                <Trash2Icon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Assessment Section */}
          <div className="mt-4 pt-4 border-t border-gray-200/60">
            <div 
              className="flex items-center justify-between cursor-pointer group/assessment hover:bg-gray-50/80 px-3 py-2 rounded-xl transition-all -mx-3"
              onClick={toggleAssessment}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${assessment ? 'bg-emerald-50' : 'bg-gray-100'} transition-colors`}>
                  <FileCheck className={`w-4 h-4 ${assessment ? 'text-emerald-600' : 'text-gray-400'}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">Assessment</span>
                {assessment && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(assessment.status)}`}>
                    {assessment.status}
                  </span>
                )}
                {assessment && assessment.questions && (
                  <span className="text-xs text-gray-400">
                    • {assessment.questions.length} questions
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {assessment && isExpanded && (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        onSelectCourse(program.id);
                        onEditAssessment(program.id, assessment);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteAssessment(program.id, assessment.id)}
                      className="text-xs text-red-600 hover:text-red-700 px-2.5 py-1 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="mt-3 animate-slideDown">
                {assessment ? (
                  <div className="p-4 bg-gradient-to-br from-gray-50/80 to-white rounded-xl border border-gray-200/60">
                    {/* Assessment Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <p className="text-xs text-gray-400">Passing Score</p>
                        <p className="text-lg font-bold text-emerald-600">{assessment.passing_score}%</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <p className="text-xs text-gray-400">Duration</p>
                        <p className="text-lg font-bold text-blue-600">{assessment.duration_minutes} min</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <p className="text-xs text-gray-400">Questions</p>
                        <p className="text-lg font-bold text-purple-600">{assessment.questions?.length || 0}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <p className="text-xs text-gray-400">Status</p>
                        <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(assessment.status)}`}>
                          {assessment.status}
                        </span>
                      </div>
                    </div>

                    {/* Questions Section */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h6 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          Questions ({assessment.questions?.length || 0})
                        </h6>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCourse(program.id);
                            onManageQuestions(program.id, assessment.id);
                          }}
                          className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Question
                        </button>
                      </div>

                      {/* Questions List */}
                      {assessment.questions && assessment.questions.length > 0 ? (
                        <div className="space-y-2">
                          {assessment.questions.map((question, idx) => (
                            <div 
                              key={question.id || idx} 
                              className="bg-white p-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-5 h-5 bg-red-50 text-red-600 text-xs font-bold rounded-full">
                                      {idx + 1}
                                    </span>
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {question.question_text}
                                    </p>
                                  </div>
                                  <div className="mt-1.5 flex flex-wrap gap-2 text-xs">
                                    <span className="px-2 py-0.5 bg-gray-50 rounded text-gray-600">
                                      A: {question.option_a}
                                    </span>
                                    <span className="px-2 py-0.5 bg-gray-50 rounded text-gray-600">
                                      B: {question.option_b}
                                    </span>
                                    {question.option_c && (
                                      <span className="px-2 py-0.5 bg-gray-50 rounded text-gray-600">
                                        C: {question.option_c}
                                      </span>
                                    )}
                                    {question.option_d && (
                                      <span className="px-2 py-0.5 bg-gray-50 rounded text-gray-600">
                                        D: {question.option_d}
                                      </span>
                                    )}
                                    <span className="px-2 py-0.5 bg-emerald-50 rounded text-emerald-600 font-medium">
                                      ✓ {question.correct_option}
                                    </span>
                                    <span className="px-2 py-0.5 bg-blue-50 rounded text-blue-600">
                                      {question.marks || 1} mark{question.marks > 1 ? 's' : ''}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <button
                                    onClick={() => {
                                      handleEditQuestion(question, setEditingQuestion, setQuestionFormData, setShowAddQuestion);
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit Question"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteQuestion(program.id, question.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Question"
                                  >
                                    <Trash2Icon className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-white rounded-xl border border-dashed border-gray-200">
                          <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">No questions added yet</p>
                          <p className="text-xs text-gray-300 mt-0.5">Click "Add Question" to get started</p>
                        </div>
                      )}

                      {/* Question Form */}
                      {showAddQuestion && selectedAssessmentId === program.id && assessment && (
                        <div className="mt-4">
                          {QuestionForm && (
                            <QuestionForm
                              editingQuestion={editingQuestion}
                              questionFormData={questionFormData}
                              questionErrors={questionErrors}
                              questionSaving={questionSaving}
                              handleQuestionFormChange={handleQuestionFormChange}
                              handleQuestionSubmit={() => {
                                handleQuestionSubmit(program.id, assessment.id);
                              }}
                              setShowAddQuestion={setShowAddQuestion}
                              setEditingQuestion={setEditingQuestion}
                              resetQuestionForm={resetQuestionForm}
                              courseId={program.id}
                              assessmentId={assessment.id}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onSelectCourse(program.id);
                      onCreateAssessment(program.id);
                    }}
                    className="w-full py-4 text-sm text-red-600 hover:text-red-700 font-medium border-2 border-dashed border-red-200 hover:border-red-300 bg-red-50/30 hover:bg-red-50 rounded-xl transition-all flex items-center justify-center gap-2 group/create"
                  >
                    <Plus className="w-4 h-4 transition-transform group-hover/create:rotate-90" />
                    Create Assessment for this course
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProgramCard;