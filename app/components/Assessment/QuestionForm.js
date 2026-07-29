// components/Assessment/QuestionForm.js

import React from "react";
import { X, Save, Loader2 } from "lucide-react";

export const QuestionForm = ({
  editingQuestion,
  questionFormData,
  questionErrors,
  questionSaving,
  handleQuestionFormChange,
  handleQuestionSubmit,
  setShowAddQuestion,
  setEditingQuestion,
  resetQuestionForm,
  courseId,
  assessmentId,
    onSuccess,

}) => {

  const handleSubmit = (e) => {
    e.preventDefault();
    if (courseId && assessmentId) {
      handleQuestionSubmit(courseId, assessmentId);
    } else {
      toast.error("Course or Assessment ID is missing");
    }
  };

  return (
    <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h6 className="text-sm font-medium text-gray-900">
          {editingQuestion ? "Edit Question" : "Add New Question"}
        </h6>
        <button
          onClick={() => {
            setShowAddQuestion(false);
            setEditingQuestion(null);
            resetQuestionForm();
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        {/* Question Text */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Question Text *
          </label>
          <textarea
            name="question_text"
            value={questionFormData.question_text}
            onChange={handleQuestionFormChange}
            rows="2"
            className={`w-full px-3 py-1.5 border ${
              questionErrors.question_text ? "border-red-300" : "border-gray-300"
            } rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
            placeholder="Enter question"
          />
          {questionErrors.question_text && (
            <p className="mt-1 text-xs text-red-600">{questionErrors.question_text}</p>
          )}
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Option A *
            </label>
            <input
              type="text"
              name="option_a"
              value={questionFormData.option_a}
              onChange={handleQuestionFormChange}
              className={`w-full px-3 py-1.5 border ${
                questionErrors.option_a ? "border-red-300" : "border-gray-300"
              } rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
              placeholder="Option A"
            />
            {questionErrors.option_a && (
              <p className="mt-1 text-xs text-red-600">{questionErrors.option_a}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Option B *
            </label>
            <input
              type="text"
              name="option_b"
              value={questionFormData.option_b}
              onChange={handleQuestionFormChange}
              className={`w-full px-3 py-1.5 border ${
                questionErrors.option_b ? "border-red-300" : "border-gray-300"
              } rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
              placeholder="Option B"
            />
            {questionErrors.option_b && (
              <p className="mt-1 text-xs text-red-600">{questionErrors.option_b}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Option C
            </label>
            <input
              type="text"
              name="option_c"
              value={questionFormData.option_c}
              onChange={handleQuestionFormChange}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              placeholder="Option C"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Option D
            </label>
            <input
              type="text"
              name="option_d"
              value={questionFormData.option_d}
              onChange={handleQuestionFormChange}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              placeholder="Option D"
            />
          </div>
        </div>

        {/* Correct Option and Marks */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Correct Option *
            </label>
            <select
              name="correct_option"
              value={questionFormData.correct_option}
              onChange={handleQuestionFormChange}
              className={`w-full px-3 py-1.5 border ${
                questionErrors.correct_option ? "border-red-300" : "border-gray-300"
              } rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
            >
              <option value="">Select</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
            {questionErrors.correct_option && (
              <p className="mt-1 text-xs text-red-600">{questionErrors.correct_option}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Marks
            </label>
            <input
              type="number"
              name="marks"
              value={questionFormData.marks}
              onChange={handleQuestionFormChange}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              placeholder="1"
              min="1"
            />
          </div>
        </div>

        {/* Order Number */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Order Number
          </label>
          <input
            type="number"
            name="order_number"
            value={questionFormData.order_number || 1}
            onChange={handleQuestionFormChange}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            placeholder="1"
            min="1"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={questionFormData.status}
            onChange={handleQuestionFormChange}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={questionSaving}
            onClick={handleSubmit}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {questionSaving ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Save className="w-3 h-3" />
            )}
            {questionSaving ? "Saving..." : editingQuestion ? "Update" : "Add"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAddQuestion(false);
              setEditingQuestion(null);
              resetQuestionForm();
            }}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};