// components/Assessment/ProgramCard.js

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Edit,
  Trash2Icon,
  Plus,
  FileCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Loader2,
  Clock,
  Award,
  BookOpen,
  Users,
  Star,
  TrendingUp,
  BarChart3,
  MoreVertical,
  PlayCircle,
  Calendar,
  Tag,
  Layers,
  GraduationCap,
  Target,
  Timer,
  ListChecks,
  Sparkles,
  Rocket,
  Zap,
  Crown,
  Flame,
  Gift,
  ArrowRight,
  Share2,
  Copy,
  Download,
  Menu,
  ExternalLink,
  Globe,
  Lock,
  Unlock,
  Video,
  FileText,
  HelpCircle,
  ThumbsUp,
  MessageCircle,
  Bookmark,
  Heart,
  Settings,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const ProgramCard = ({
  program,
  assessment,
  setSelectedAssessmentId,
  onEditProgram,
  onDeleteProgram,
  onEditAssessment,
  onDeleteAssessment,
  onCreateAssessment,
  onManageQuestions,
  onActivateCourse,
  onDeactivateCourse,
  onActivateAssessment,
  onDeactivateAssessment,
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
  setQuestionFormData,
  QuestionForm,
  isEditingMode = false,
}) => {
  const [isActivating, setIsActivating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isCourseActivating, setIsCourseActivating] = useState(false);
  const [isCourseDeactivating, setIsCourseDeactivating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      await onActivateAssessment(program.id, assessment.id);
    } finally {
      setIsActivating(false);
    }
  };

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    try {
      await onDeactivateAssessment(program.id, assessment.id);
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleActivateCourse = async () => {
    if (!confirm("Are you sure you want to activate this course?")) return;
    setIsCourseActivating(true);
    try {
      await onActivateCourse(program.id);
    } finally {
      setIsCourseActivating(false);
    }
  };

  const handleDeactivateCourse = async () => {
    if (!confirm("Are you sure you want to deactivate this course?")) return;
    setIsCourseDeactivating(true);
    try {
      await onDeactivateCourse(program.id);
    } finally {
      setIsCourseDeactivating(false);
    }
  };

  const getGradient = (id) => {
    const gradients = [
      "from-slate-50 via-red-50 to-rose-50 border-red-200/30",
      "from-slate-50 via-orange-50 to-amber-50 border-orange-200/30",
      "from-slate-50 via-purple-50 to-violet-50 border-purple-200/30",
      "from-slate-50 via-emerald-50 to-teal-50 border-emerald-200/30",
      "from-slate-50 via-blue-50 to-sky-50 border-blue-200/30",
      "from-slate-50 via-fuchsia-50 to-pink-50 border-fuchsia-200/30",
    ];
    return gradients[id % gradients.length];
  };

  const getStatusColor = (status) => {
    const colors = {
      published: "bg-emerald-50 text-emerald-700 border-emerald-200",
      draft: "bg-gray-50 text-gray-700 border-gray-200",
      archived: "bg-amber-50 text-amber-700 border-amber-200",
      pending: "bg-blue-50 text-blue-700 border-blue-200",
      active: "bg-emerald-50 text-emerald-700 border-emerald-200",
      completed: "bg-blue-50 text-blue-700 border-blue-200",
      inactive: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return colors[status] || colors.draft;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`bg-linear-to-br ${getGradient(program.id?.length || 0)} rounded-2xl border-2 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden`}
      >
        {/* Top Status Bar */}
        <div className="flex items-center justify-between px-6 pt-4">
          <div className="flex items-center gap-2">
            {program.is_active && (
              <motion.div 
                className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.div 
                  className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-xs font-medium text-emerald-700">Active</span>
              </motion.div>
            )}
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(program.status)}`}>
              {program.status}
            </span>
            {program.course_code && (
              <span className="px-2.5 py-1 bg-white/80 border border-gray-200 rounded-full text-xs font-medium text-gray-600">
                {program.course_code}
              </span>
            )}
          </div>
          
          {/* Quick Actions Dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 hover:bg-white/80 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </motion.button>
            
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50"
                >
                  <button
                    onClick={() => { onEditProgram(program); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Program
                  </button>
                  <button
                    onClick={() => { router.push(`/programs/${program.id}`); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Details
                  </button>
                   {program.is_active ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDeactivateCourse}
                      disabled={isCourseDeactivating}
                      className="flex items-center gap-2 px-4 w-full py-2 text-sm text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      {isCourseDeactivating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                      Deactivate
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleActivateCourse}
                      disabled={isCourseActivating}
                      className="flex items-center gap-2 px-4 py-2 w-full text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      {isCourseActivating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Rocket className="w-3.5 h-3.5" />
                      )}
                      Activate
                    </motion.button>
                  )}
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={() => { onDeleteProgram(program.id); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2Icon className="w-4 h-4" />
                    Delete Program
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 pb-6">
          <div className="flex items-start gap-5 mt-2">
            {/* Thumbnail */}
            <div className="relative group/image flex-shrink-0">
              <div className="w-24 h-24 rounded-xl overflow-hidden shadow-md ring-2 ring-white/50">
                {program.thumbnail_url ? (
                  <Image
                    src={program.thumbnail_url}
                    alt={program.title}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-white/90" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1">
                <button
                  onClick={() => router.push(`/programs/${program.id}`)}
                  className="p-1.5 bg-red-500 text-white rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105"
                >
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Program Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 
                    className="text-lg font-bold text-gray-800 hover:text-red-600 cursor-pointer transition-colors line-clamp-1"
                    onClick={() => router.push(`/programs/${program.id}`)}
                  >
                    {program.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-0.5">
                    {program.description}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500 bg-white/70 px-2.5 py-1 rounded-full border border-gray-200/50">
                      <Tag className="w-3 h-3 text-red-400" />
                      {program.category || "General"}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 bg-white/70 px-2.5 py-1 rounded-full border border-gray-200/50">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {program.duration || "N/A"}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 bg-white/70 px-2.5 py-1 rounded-full border border-gray-200/50">
                      <GraduationCap className="w-3 h-3 text-purple-400" />
                      {program.level || "Beginner"}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 bg-white/70 px-2.5 py-1 rounded-full border border-gray-200/50">
                      <Users className="w-3 h-3 text-blue-400" />
                      {program.mode || "Online"}
                    </div>
                    {program.final_price && (
                      <div className="flex items-center gap-1 bg-gradient-to-r from-red-50 to-rose-50 px-2.5 py-1 rounded-full border border-red-200/50">
                        <span className="text-xs font-bold text-red-600">₹{program.final_price}</span>
                        {program.original_price && program.discount > 0 && (
                          <>
                            <span className="text-xs text-gray-400 line-through">₹{program.original_price}</span>
                            <span className="text-xs font-bold text-red-500 bg-white/60 px-1 rounded-full">-{program.discount}%</span>
                          </>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span>{program.lessons?.length || 0} lessons</span>
                    </div>
                  </div>
                </div>

            
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Section */}
        <div className="px-6 pb-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm overflow-hidden">
            {/* Assessment Header */}
            <div 
              className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-white/30 transition-colors"
              onClick={() => assessment && setExpandedAssessment(expandedAssessment === program.id ? null : program.id)}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg text-white">
                  <FileCheck className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Assessment</span>
                  {assessment && (
                    <>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(assessment.status)}`}>
                        {assessment.status}
                      </span>
                      {assessment.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <div className="w-1 h-1 rounded-full bg-emerald-500" />
                          Live
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-50 text-gray-600 border border-gray-200">
                          Draft
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400">
                        {assessment.questions?.length || 0} questions
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {assessment ? (
                  <>
                    <div className="flex items-center gap-0.5">
                      {assessment.is_active ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeactivate(); }}
                          disabled={isDeactivating}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Deactivate Assessment"
                        >
                          {isDeactivating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleActivate(); }}
                          disabled={isActivating}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Activate Assessment"
                        >
                          {isActivating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); onEditAssessment(program.id, assessment); }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Edit Assessment"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteAssessment(program.id, assessment.id); }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Assessment"
                      >
                        <Trash2Icon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpandedAssessment(expandedAssessment === program.id ? null : program.id); }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <motion.div
                        animate={{ rotate: expandedAssessment === program.id ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); onCreateAssessment(program.id); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 rounded-lg transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create Assessment
                  </button>
                )}
              </div>
            </div>

            {/* Expanded Assessment Details */}
            <AnimatePresence>
              {expandedAssessment === program.id && assessment && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 py-3 border-t border-gray-200/50 bg-white/30 overflow-hidden"
                >
                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-2.5 mb-3">
                    <div className="bg-white/60 rounded-lg p-2.5 text-center">
                      <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Title</p>
                      <p className="text-xs font-semibold text-gray-800 truncate">{assessment.title}</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-2.5 text-center">
                      <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Passing Score</p>
                      <p className="text-xs font-bold text-emerald-600">{assessment.passing_score}%</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-2.5 text-center">
                      <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Duration</p>
                      <p className="text-xs font-bold text-blue-600">{assessment.duration_minutes}m</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-2.5 text-center">
                      <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Questions</p>
                      <p className="text-xs font-bold text-purple-600">{assessment.questions?.length || 0}</p>
                    </div>
                  </div>

                  {/* Questions */}
                  {assessment.questions && assessment.questions.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <ListChecks className="w-3.5 h-3.5 text-purple-500" />
                          <span className="text-xs font-semibold text-gray-700">
                            Questions ({assessment.questions.length})
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedAssessmentId(program.id);
                            setShowAddQuestion(true);
                            setEditingQuestion(null);
                            resetQuestionForm();
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Add
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                        {assessment.questions.map((question, idx) => (
                          <div
                            key={question.id || idx}
                            className="group/question bg-white rounded-lg p-2.5 border border-gray-200/60 hover:border-red-200 transition-colors"
                          >
                            <div className="flex items-start gap-2.5">
                              <span className="flex items-center justify-center w-5 h-5 bg-gradient-to-br from-red-500 to-rose-500 rounded-full text-white text-[10px] font-bold flex-shrink-0">
                                {idx + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-800 line-clamp-1">
                                  {question.question_text}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {['A', 'B', 'C', 'D'].map(letter => {
                                    const option = question[`option_${letter.toLowerCase()}`];
                                    if (!option) return null;
                                    const isCorrect = question.correct_option === letter;
                                    return (
                                      <span
                                        key={letter}
                                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium ${
                                          isCorrect
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                                        }`}
                                      >
                                        {letter}: {option}
                                        {isCorrect && <CheckCircle className="w-2.5 h-2.5 text-emerald-500" />}
                                      </span>
                                    );
                                  })}
                                  <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-medium border border-blue-200">
                                    {question.marks || 1}m
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-0.5 opacity-0 group-hover/question:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    setEditingQuestion(question);
                                    setQuestionFormData({
                                      question_text: question.question_text || "",
                                      option_a: question.option_a || "",
                                      option_b: question.option_b || "",
                                      option_c: question.option_c || "",
                                      option_d: question.option_d || "",
                                      correct_option: question.correct_option || "A",
                                      marks: question.marks || 1,
                                      order_number: question.order_number || idx + 1,
                                      status: question.status || "draft",
                                    });
                                    setSelectedAssessmentId(program.id);
                                    setShowAddQuestion(true);
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteQuestion(program.id, question.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2Icon className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Question Form */}
                  <AnimatePresence>
                    {showAddQuestion && selectedAssessmentId === program.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-3 pt-3 border-t border-gray-200/50"
                      >
                        {QuestionForm && (
                          <QuestionForm
                            editingQuestion={editingQuestion}
                            questionFormData={questionFormData}
                            questionErrors={questionErrors}
                            questionSaving={questionSaving}
                            handleQuestionFormChange={handleQuestionFormChange}
                            handleQuestionSubmit={() =>
                              handleQuestionSubmit(program.id, assessment.id)
                            }
                            setShowAddQuestion={setShowAddQuestion}
                            setEditingQuestion={setEditingQuestion}
                            resetQuestionForm={resetQuestionForm}
                            courseId={program.id}
                            assessmentId={assessment.id}
                          />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #fca5a5;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #f87171;
        }
      `}</style>
    </motion.div>
  );
};

export default ProgramCard;