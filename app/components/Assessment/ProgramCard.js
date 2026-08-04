// components/Assessment/ProgramCard.js

import React, { useState, useRef, useEffect } from "react";
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
  assessment = [], // Now accepts array of assessments
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
  const [selectedAssessmentIdForAction, setSelectedAssessmentIdForAction] = useState(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const router = useRouter();

  // Ensure assessment is always an array
  const assessments = Array.isArray(assessment) ? assessment : [];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Handle window resize to reposition dropdown
  useEffect(() => {
    if (showMenu) {
      const handleResize = () => {
        setShowMenu(prev => {
          setShowMenu(false);
          setTimeout(() => setShowMenu(true), 10);
          return prev;
        });
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [showMenu]);

  const handleActivate = async (assessmentId) => {
    setIsActivating(true);
    try {
      await onActivateAssessment(program.id, assessmentId);
    } finally {
      setIsActivating(false);
    }
  };

  const handleDeactivate = async (assessmentId) => {
    setIsDeactivating(true);
    try {
      await onDeactivateAssessment(program.id, assessmentId);
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

  const getTypeBadge = (type) => {
    if (type === 'pdf_task') {
      return {
        label: 'PDF Task',
        className: 'bg-orange-50 text-orange-600 border-orange-200'
      };
    }
    return {
      label: 'MCQ',
      className: 'bg-purple-50 text-purple-600 border-purple-200'
    };
  };

  const toggleAssessment = (assessmentId) => {
    setExpandedAssessment(prev => {
      const newState = prev === assessmentId ? null : assessmentId;
      return newState;
    });
  };

  const isExpanded = (assessmentId) => {
    return expandedAssessment === assessmentId;
  };

  // Get dropdown position based on viewport
  const getDropdownPosition = () => {
    if (typeof window === 'undefined') return 'right-0';
    
    const width = window.innerWidth;
    
    if (width < 380) {
      return 'left-0';
    }
    if (width < 640) {
      return 'right-0';
    }
    return 'right-0';
  };

  const getDropdownWidth = () => {
    if (typeof window === 'undefined') return 'w-48';
    
    const width = window.innerWidth;
    
    if (width < 380) {
      return 'w-[calc(100vw-2rem)] min-w-[200px] max-w-[280px]';
    }
    if (width < 640) {
      return 'w-56';
    }
    return 'w-48 sm:w-56 md:w-60';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`bg-linear-to-br ${getGradient(program.id?.length || 0)} border-2 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden`}
      >
        {/* Top Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            {program.is_active && (
              <motion.div 
                className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-emerald-50 border border-emerald-200 shrink-0"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.div 
                  className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-[9px] sm:text-xs uppercase tracking-[1.36px] font-medium text-emerald-700">Active</span>
              </motion.div>
            )}
            <span className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 uppercase tracking-[1.36px] text-[9px] sm:text-xs font-medium border ${getStatusColor(program.status)} flex-shrink-0`}>
              {program.status}
            </span>
            {program.course_code && (
              <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-white/80 border border-gray-200 text-[9px] sm:text-xs font-medium text-gray-600 truncate max-w-[80px] sm:max-w-none flex-shrink-0">
                {program.course_code}
              </span>
            )}
            {/* Assessment count badge */}
            {assessments.length > 0 && (
              <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-red-50 border border-red-200 text-[9px] sm:text-xs font-medium text-red-600 flex-shrink-0">
                {assessments.length} Assessment{assessments.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {/* Quick Actions Dropdown */}
          <div className="relative flex-shrink-0">
            <motion.button
              ref={buttonRef}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 sm:p-2 hover:bg-white/80 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400/50"
              aria-label="More options"
              aria-expanded={showMenu}
            >
              <MoreVertical className="w-4 h-4 sm:w-4 sm:h-4 text-gray-400" />
            </motion.button>
            
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  ref={menuRef}
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute max-sm:-left-26.5 ${getDropdownPosition()} mt-2 ${getDropdownWidth()} bg-white shadow-2xl border border-gray-100/80 py-1.5 z-50 overflow-hidden max-h-[80vh] overflow-y-auto`}
                  style={{
                    boxShadow: '0 20px 60px -12px rgba(0,0,0,0.25), 0 8px 24px -6px rgba(0,0,0,0.1)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="block sm:hidden px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-600">Course Actions</p>
                  </div>

                  <button
                    onClick={() => { 
                      onEditProgram(program); 
                      setShowMenu(false); 
                    }}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-left text-xs sm:text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-2.5 sm:gap-2 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span className="truncate">Edit Program</span>
                  </button>
                  
                  <button
                    onClick={() => { 
                      router.push(`/programs/${program.id}`); 
                      setShowMenu(false); 
                    }}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-left text-xs sm:text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 sm:gap-2 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span className="truncate">View Details</span>
                  </button>

                  <div className="border-t border-gray-100 my-1.5"></div>
                  
                  {program.is_active ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        handleDeactivateCourse();
                        setShowMenu(false);
                      }}
                      disabled={isCourseDeactivating}
                      className="flex items-center gap-2.5 sm:gap-2 px-3 sm:px-4 w-full py-2.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50"
                    >
                      {isCourseDeactivating ? (
                        <Loader2 className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 animate-spin shrink-0" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 shrink-0" />
                      )}
                      <span className="truncate">Deactivate Course</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        handleActivateCourse();
                        setShowMenu(false);
                      }}
                      disabled={isCourseActivating}
                      className="flex items-center gap-2.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-2 w-full text-xs sm:text-sm text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                    >
                      {isCourseActivating ? (
                        <Loader2 className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 animate-spin shrink-0" />
                      ) : (
                        <Rocket className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 shrink-0" />
                      )}
                      <span className="truncate">Activate Course</span>
                    </motion.button>
                  )}
                  
                  <div className="border-t border-gray-100 my-1.5"></div>
                  
                  <button
                    onClick={() => { 
                      if (confirm('Are you sure you want to delete this program?')) {
                        onDeleteProgram(program.id);
                      }
                      setShowMenu(false); 
                    }}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-left text-xs sm:text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 sm:gap-2 transition-colors"
                  >
                    <Trash2Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span className="truncate">Delete Program</span>
                  </button>

                  <div className="block sm:hidden border-t border-gray-100 mt-1 pt-1.5">
                    <button
                      onClick={() => setShowMenu(false)}
                      className="w-full px-3 py-2 text-center text-xs text-gray-400 hover:text-gray-600"
                    >
                      Close Menu
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 md:gap-5 mt-2">
            {/* Thumbnail */}
            <div className="relative group/image shrink-0 w-full sm:w-20 md:w-24">
              <div className="w-20 h-20 sm:w-20 sm:h-20 md:w-24 md:h-24 overflow-hidden shadow-md ring-2 ring-white/50 mx-auto sm:mx-0">
                {program.thumbnail_url ? (
                  <Image
                    src={program.thumbnail_url}
                    alt={program.title}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-red-400 to-rose-500 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white/90" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 sm:right-0">
                <button
                  onClick={() => router.push(`/programs/${program.id}`)}
                  className="p-1 sm:p-1.5 bg-red-500 text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
                >
                  <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </div>
            </div>

            {/* Program Info */}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-3">
                <div className="flex-1 w-full">
                  <h3 
                    className="text-base sm:text-lg md:text-xl font-bold text-gray-800 capitalize hover:text-red-600 cursor-pointer transition-colors line-clamp-1"
                    onClick={() => router.push(`/programs/${program.id}`)}
                  >
                    {program.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 capitalize line-clamp-2 mt-0.5">
                    {program.description}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                    <div className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-xs text-gray-500 bg-white/70 px-1.5 sm:px-2.5 py-0.5 sm:py-1 border border-gray-200/50">
                      <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400 shrink-0" />
                      <span className="truncate max-w-[60px] sm:max-w-none">{program.category || "General"}</span>
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-xs text-gray-500 bg-white/70 px-1.5 sm:px-2.5 py-0.5 sm:py-1 border border-gray-200/50">
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 shrink-0" />
                      {program.duration || "N/A"}
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1 uppercase tracking-[1.36px] text-[9px] sm:text-xs text-gray-500 bg-white/70 px-1.5 sm:px-2.5 py-0.5 sm:py-1 border border-gray-200/50">
                      <GraduationCap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400 shrink-0" />
                      <span className="truncate max-w-[50px] sm:max-w-none">{program.level || "Beginner"}</span>
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-xs uppercase tracking-[1.36px] text-gray-500 bg-white/70 px-1.5 sm:px-2.5 py-0.5 sm:py-1 border border-gray-200/50">
                      <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400 shrink-0" />
                      {program.mode || "Online"}
                    </div>
                    {program.final_price && (
                      <div className="flex items-center gap-0.5 sm:gap-1 bg-linear-to-r from-red-50 to-rose-50 px-1.5 sm:px-2.5 py-0.5 sm:py-1 border border-red-200/50">
                        <span className="text-[9px] sm:text-xs font-bold text-red-600">₹{program.final_price}</span>
                        {program.original_price && program.discount > 0 && (
                          <>
                            <span className="text-[8px] sm:text-xs text-gray-400 line-through">₹{program.original_price}</span>
                            {/* <span className="text-[8px] sm:text-xs font-bold text-red-500 bg-white/60 px-0.5 sm:px-1 rounded-full">-{program.discount}%</span> */}
                          </>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-xs text-gray-400">
                      <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-gray-300" />
                      <span>{program.lessons?.length || 0} lessons</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Section - Multiple Assessments */}
        <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
          <div className="bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm overflow-hidden">
            {/* Assessment Header */}
            <div className="px-3 sm:px-4 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 flex-1 min-w-0">
                <div className="p-1 sm:p-1.5 bg-gradient-to-br from-red-500 to-rose-500 text-white flex-shrink-0">
                  <FileCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Assessments ({assessments.length})
                </span>
              </div>
              <button
                onClick={() => onCreateAssessment(program.id)}
                className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 transition-colors shadow-sm whitespace-nowrap"
              >
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">Add Assessment</span>
                <span className="xs:hidden">Add</span>
              </button>
            </div>

            {/* Assessments List */}
            {assessments.length > 0 ? (
              <div className="space-y-2 px-3 sm:px-4 pb-3">
                {assessments.map((assessment, index) => {
                  const isPdfTask = assessment.type === 'pdf_task';
                  const isMcq = assessment.type === 'mcq' || !assessment.type;
                  const typeInfo = getTypeBadge(assessment.type);
                  const expanded = isExpanded(assessment.id);
                  
                  return (
                    <div
                      key={assessment.id || index}
                      className="bg-white/80 border border-gray-200/60 hover:border-red-200 transition-colors overflow-hidden"
                    >
                      {/* Assessment Item Header */}
                      <div 
                        className="px-3 sm:px-4 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 cursor-pointer hover:bg-white/50 transition-colors"
                        onClick={() => toggleAssessment(assessment.id)}
                      >
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 flex-1 min-w-0">
                          <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-red-50 text-red-600 text-[9px] sm:text-xs font-bold shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                            {assessment.title || `Assessment ${index + 1}`}
                          </span>
                          <span className={`px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-medium border ${getStatusColor(assessment.status)} whitespace-nowrap`}>
                            {assessment.status || "draft"}
                          </span>
                          <span className={`px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-medium border ${typeInfo.className} whitespace-nowrap`}>
                            {typeInfo.label}
                          </span>
                          {/* {assessment.is_active && (
                            <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                              <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-emerald-500" />
                              Live
                            </span>
                          )} */}
                        </div>

                        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                          {/* Activate/Deactivate buttons */}
                          {/* {assessment.is_active ? (
                            <button
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleDeactivate(assessment.id); 
                              }}
                              disabled={isDeactivating}
                              className="p-1 sm:p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Deactivate Assessment"
                            >
                              {isDeactivating && selectedAssessmentIdForAction === assessment.id ? (
                                <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
                              ) : (
                                <EyeOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setSelectedAssessmentIdForAction(assessment.id);
                                handleActivate(assessment.id); 
                              }}
                              disabled={isActivating}
                              className="p-1 sm:p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Activate Assessment"
                            >
                              {isActivating && selectedAssessmentIdForAction === assessment.id ? (
                                <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
                              ) : (
                                <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              )}
                            </button>
                          )} */}
                          
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              onEditAssessment(program.id, assessment, index); 
                            }}
                            className="p-1 sm:p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Edit Assessment"
                          >
                            <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                          
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if (confirm(`Are you sure you want to delete "${assessment.title}"?`)) {
                                onDeleteAssessment(program.id, assessment.id);
                              }
                            }}
                            className="p-1 sm:p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Assessment"
                          >
                            <Trash2Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                          
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              toggleAssessment(assessment.id); 
                            }}
                            className="p-1 sm:p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            <motion.div
                              animate={{ rotate: expanded ? 180 : 0 }} 
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </motion.div>
                          </button>
                        </div>
                      </div>

                      {/* Expanded Assessment Details */}
                      <AnimatePresence>
                        {expanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-200/50 bg-white/30 overflow-hidden"
                          >
                            {/* Assessment Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2.5 mb-2 sm:mb-3">
                              <div className="bg-white/60 p-1.5 sm:p-2.5 text-center">
                                <p className="text-[7px] sm:text-[9px] text-gray-400 font-medium uppercase tracking-wider">Type</p>
                                <p className="text-[10px] sm:text-xs font-semibold text-gray-800 capitalize">
                                  {isPdfTask ? 'PDF Task' : 'MCQ'}
                                </p>
                              </div>
                              <div className="bg-white/60 p-1.5 sm:p-2.5 text-center">
                                <p className="text-[7px] sm:text-[9px] text-gray-400 font-medium uppercase tracking-wider">Passing</p>
                                <p className="text-[10px] sm:text-xs font-bold text-emerald-600">{assessment.passing_score || 60}%</p>
                              </div>
                              <div className="bg-white/60 p-1.5 sm:p-2.5 text-center">
                                <p className="text-[7px] sm:text-[9px] text-gray-400 font-medium uppercase tracking-wider">Duration</p>
                                <p className="text-[10px] sm:text-xs font-bold text-blue-600">{assessment.duration_minutes || 30}m</p>
                              </div>
                              <div className="bg-white/60 p-1.5 sm:p-2.5 text-center">
                                <p className="text-[7px] sm:text-[9px] text-gray-400 font-medium uppercase tracking-wider">Created</p>
                                <p className="text-[10px] sm:text-xs font-medium text-gray-700">
                                  {assessment.created_at 
                                    ? new Date(assessment.created_at).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                      })
                                    : 'N/A'}
                                </p>
                              </div>
                            </div>

                            {/* PDF Task Specific Details */}
                            {isPdfTask && (
                              <div className="mb-3 p-2 sm:p-3 bg-orange-50 border border-orange-200">
                                <div className="space-y-1.5 sm:space-y-2">
                                  {assessment.instructions && (
                                    <div>
                                      <p className="text-[8px] sm:text-[10px] text-gray-400 font-medium uppercase tracking-wider">Instructions</p>
                                      <p className="text-[10px] sm:text-xs text-gray-700 mt-0.5">{assessment.instructions}</p>
                                    </div>
                                  )}
                                  {assessment.pdf_template_url && (
                                    <div>
                                      <p className="text-[8px] sm:text-[10px] text-gray-400 font-medium uppercase tracking-wider">PDF Template</p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 shrink-0" />
                                        <a
                                          href={assessment.pdf_template_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-800 hover:underline truncate"
                                        >
                                          {assessment.pdf_template_url.split('/').pop() || 'View PDF'}
                                        </a>
                                        <a
                                          href={assessment.pdf_template_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                        >
                                          Download
                                        </a>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* MCQ Questions Section */}
                            {isMcq && (
                              <>
                                <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                  <div className="flex items-center gap-1 sm:gap-1.5">
                                    <ListChecks className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-500 shrink-0" />
                                    <span className="text-[10px] sm:text-xs font-semibold text-gray-700 whitespace-nowrap">
                                      Questions ({assessment.questions?.length || 0})
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setSelectedAssessmentId(program.id);
                                      setShowAddQuestion(true);
                                      setEditingQuestion(null);
                                      resetQuestionForm();
                                    }}
                                    className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-medium bg-red-500 text-white hover:bg-red-600 transition-colors whitespace-nowrap"
                                  >
                                    <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    <span className="hidden xs:inline">Add Question</span>
                                  </button>
                                </div>

                                {/* Questions List */}
                                {assessment.questions && assessment.questions.length > 0 ? (
                                  <div className="space-y-1 sm:space-y-1.5 max-h-32 sm:max-h-48 overflow-y-auto pr-0.5 sm:pr-1 custom-scrollbar">
                                    {assessment.questions.map((question, idx) => (
                                      <div
                                        key={question.id || idx}
                                        className="group/question bg-white p-1.5 sm:p-2.5 border border-gray-200/60 hover:border-red-200 transition-colors"
                                      >
                                        <div className="flex flex-col xs:flex-row items-start gap-1.5 sm:gap-2.5">
                                          <span className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-red-500 to-rose-500 text-white text-[8px] sm:text-[10px] font-bold flex-shrink-0">
                                            {idx + 1}
                                          </span>
                                          <div className="flex-1 min-w-0 w-full">
                                            <p className="text-[10px] sm:text-xs font-medium text-gray-800 line-clamp-1">
                                              {question.question_text}
                                            </p>
                                            <div className="flex flex-wrap gap-0.5 sm:gap-1 mt-0.5 sm:mt-1">
                                              {['A', 'B', 'C', 'D'].map(letter => {
                                                const option = question[`option_${letter.toLowerCase()}`];
                                                if (!option) return null;
                                                const isCorrect = question.correct_option === letter;
                                                return (
                                                  <span
                                                    key={letter}
                                                    className={`inline-flex items-center gap-0.5 px-1 sm:px-1.5 py-0.5 text-[7px] sm:text-[9px] font-medium ${
                                                      isCorrect
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : 'bg-gray-50 text-gray-600 border border-gray-200'
                                                    }`}
                                                  >
                                                    {letter}: <span className="truncate max-w-[30px] sm:max-w-[60px]">{option}</span>
                                                    {isCorrect && <CheckCircle className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-emerald-500 shrink-0" />}
                                                  </span>
                                                );
                                              })}
                                              <span className="px-1 sm:px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[7px] sm:text-[9px] font-medium border border-blue-200 whitespace-nowrap">
                                                {question.marks || 1}m
                                              </span>
                                            </div>
                                          </div>
                                          <div className="flex gap-0.5 opacity-100 xs:opacity-0 group-hover/question:opacity-100 transition-opacity ml-auto xs:ml-0">
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
                                              className="p-0.5 sm:p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                              <Edit className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteQuestion(program.id, question.id)}
                                              className="p-0.5 sm:p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                              <Trash2Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-2 sm:py-3 bg-gray-50 border border-dashed border-gray-200">
                                    <p className="text-[9px] sm:text-xs text-gray-400">No questions added yet</p>
                                    <p className="text-[8px] sm:text-[10px] text-gray-300 mt-0.5">Click "Add Question" to get started</p>
                                  </div>
                                )}
                              </>
                            )}

                            {/* PDF Task Message */}
                            {isPdfTask && (
                              <div className="mt-2 pt-2 border-t border-gray-200/50">
                                <div className="bg-gray-50 p-2 sm:p-3 border border-gray-200 text-center">
                                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-1 sm:mb-2" />
                                  <p className="text-[10px] sm:text-sm text-gray-600">
                                    This is a PDF task assessment
                                  </p>
                                  {assessment.pdf_template_url && (
                                    <a
                                      href={assessment.pdf_template_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 sm:gap-2 mt-1.5 sm:mt-2 px-3 sm:px-4 py-1 sm:py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-[10px] sm:text-sm"
                                    >
                                      <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                                      View PDF Template
                                    </a>
                                  )}
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
                                  className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200/50"
                                >
                                  {QuestionForm && (
                                    <div className="scale-90 sm:scale-100 origin-top">
                                      <QuestionForm
                                        editingQuestion={editingQuestion}
                                        questionFormData={questionFormData}
                                        questionErrors={questionErrors}
                                        questionSaving={questionSaving}
                                        handleQuestionFormChange={handleQuestionFormChange}
                                        handleQuestionSubmit={() =>
                                          handleQuestionSubmit(program?.id, assessment?.id)
                                        }
                                        setShowAddQuestion={setShowAddQuestion}
                                        setEditingQuestion={setEditingQuestion}
                                        resetQuestionForm={resetQuestionForm}
                                        courseId={program.id}
                                        assessmentId={assessment.id}
                                      />
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 sm:py-6 px-3">
                <FileCheck className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 mx-auto mb-1 sm:mb-2" />
                <p className="text-xs sm:text-sm text-gray-400">No assessments created yet</p>
                <p className="text-[10px] sm:text-xs text-gray-300 mt-0.5">Click "Add Assessment" to create one</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
          height: 2px;
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
        
        @media (min-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 3px;
            height: 3px;
          }
        }
        
        @media (max-width: 480px) {
          .xs\\:inline {
            display: inline !important;
          }
          .xs\\:hidden {
            display: none !important;
          }
          .xs\\:grid-cols-4 {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          }
          .xs\\:opacity-0 {
            opacity: 0 !important;
          }
          .group:hover .xs\\:opacity-100,
          .group\\/question:hover .xs\\:opacity-100 {
            opacity: 100 !important;
          }
        }
        
        @media (min-width: 481px) {
          .xs\\:inline {
            display: none !important;
          }
          .xs\\:hidden {
            display: none !important;
          }
        }
        
        @media (max-width: 640px) {
          .p-1\\.5 {
            padding: 0.5rem !important;
          }
          .p-1 {
            padding: 0.375rem !important;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default ProgramCard;