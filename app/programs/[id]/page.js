"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  BookOpen,
  Loader2,
  Award,
  GraduationCap,
  TrendingDown,
  CheckCircle,
  Video,
  FileText,
  Play,
  Download,
  Star,
  Users,
  PlayCircle,
  Lock,
  X,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  List,
  Grid,
  File,
  Eye,
} from "lucide-react";
import fetchApiResponse from "@/helper/api_data_store";
import { useRouter } from "next/navigation";

const ProgramDetailPage = () => {
  const params = useParams();
  const { data: session } = useSession();
  const programId = params.id;
  const router = useRouter();

  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Video player states
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [contentViewMode, setContentViewMode] = useState("video"); // "video" or "pdf"
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (programId) {
      fetchProgramDetails();
    }
  }, [programId]);

  // Auto-select first lesson when course is purchased
  useEffect(() => {
    if (program && program.lessons && program.lessons.length > 0 && program.is_purchased) {
      // Select first lesson that has video content
      const firstVideoLesson = program.lessons.find(lesson => lesson.video_url || lesson.external_video_url);
      if (firstVideoLesson) {
        setSelectedLesson(firstVideoLesson);
        setIsPlayerVisible(true);
        // Check if lesson has PDF and set view mode
        if (firstVideoLesson.pdf_url) {
          setContentViewMode("video"); // Default to video if both available
        }
      } else if (program.lessons[0]) {
        setSelectedLesson(program.lessons[0]);
        setIsPlayerVisible(true);
        if (program.lessons[0].pdf_url) {
          setContentViewMode("pdf");
        }
      }
    }
  }, [program]);

  const fetchProgramDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/details/${programId}`,
        {
          method: "GET",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
        }
      );

      if (response.meta?.status === 200 && response.data) {
        const course = response.data;

        const formattedProgram = {
          id: course.id,
          title: course.title,
          description: course.description,
          category: course.category,
          duration: course.duration,
          mode: course.mode || "Online",
          level: course.level,
          original_price: course.original_price,
          discount: course.discount,
          final_price: course.final_price,
          fee: `₹${course.final_price || course.original_price}`,
          thumbnail_url: course.thumbnail_url,
          status: course.status,
          course_code: course.course_code,
          lessons: course.lessons || [],
          created_at: course.created_at,
          updated_at: course.updated_at,
          instructor_id: course.instructor_id,
          is_purchased: Boolean(course.is_purchased),
          is_active: course.is_active,
          assessment: getAssessmentForCategory(course.category),
        };
        setProgram(formattedProgram);
      } else {
        setError(response.meta?.message || "Failed to fetch program details");
      }
    } catch (error) {
      console.error("Error fetching program details:", error);
      setError("Failed to load program details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getAssessmentForCategory = (category) => {
    const assessments = {
      "Web Development": [
        "Project-Based Assessment",
        "Technical Interview",
        "Code Review",
      ],
      "Data Science": [
        "Case Study",
        "Technical Assessment",
        "Data Analysis Project",
      ],
      "Interior Design": [
        "Portfolio Review",
        "Design Challenge",
        "Presentation",
      ],
    };
    return (
      assessments[category] || [
        "Project Work",
        "Final Assessment",
        "Practical Exam",
      ]
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      published: "bg-green-100 text-green-700",
      draft: "bg-yellow-100 text-yellow-700",
      archived: "bg-gray-100 text-gray-700",
    };
    return styles[status] || styles.draft;
  };

  // Video Player Controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (playerRef.current) {
      if (!document.fullscreenElement) {
        playerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const selectLesson = (lesson) => {
    setSelectedLesson(lesson);
    setIsPlaying(false);
    setCurrentTime(0);
    setShowPdf(false);
    setSelectedPdfUrl(null);
    setIsPlayerVisible(true);
    
    // Check if lesson has PDF and video
    const hasVideo = lesson.video_url || lesson.external_video_url;
    const hasPdf = lesson.pdf_url;
    
    if (hasVideo && hasPdf) {
      // If both available, default to video
      setContentViewMode("video");
      setIsPlayerVisible(true);
    } else if (hasPdf) {
      // If only PDF available, show PDF
      setSelectedPdfUrl(lesson.pdf_url);
      setShowPdf(true);
      setContentViewMode("pdf");
      setIsPlayerVisible(false);
    } else if (hasVideo) {
      // If only video available, show video
      setContentViewMode("video");
      setIsPlayerVisible(true);
    }
    
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const openPdfViewer = (pdfUrl) => {
    setSelectedPdfUrl(pdfUrl);
    setShowPdf(true);
    setContentViewMode("pdf");
    setIsPlaying(false);
    setIsPlayerVisible(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const closePdfViewer = () => {
    setShowPdf(false);
    setSelectedPdfUrl(null);
    setContentViewMode("video");
    if (selectedLesson && (selectedLesson.video_url || selectedLesson.external_video_url)) {
      setIsPlayerVisible(true);
    }
  };

  const switchContentView = (mode) => {
    if (mode === "pdf" && selectedLesson?.pdf_url) {
      setContentViewMode("pdf");
      setShowPdf(true);
      setSelectedPdfUrl(selectedLesson.pdf_url);
      setIsPlayerVisible(false);
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else if (mode === "video" && (selectedLesson?.video_url || selectedLesson?.external_video_url)) {
      setContentViewMode("video");
      setShowPdf(false);
      setSelectedPdfUrl(null);
      setIsPlayerVisible(true);
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "pdf":
        return <FileText className="w-4 h-4" />;
      case "text":
        return <BookOpen className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-red-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-red-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">
          Loading program details...
        </p>
      </div>
    );
  }

  // Error State
  if (error || !program) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Program not found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The program you're looking for doesn't exist."}
          </p>
          <Link
            href="/#programs"
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="inline mr-2" size={20} />
            Back to Programs
          </Link>
        </div>
      </div>
    );
  }

  const hasDiscount = program.discount > 0;
  const savedAmount = hasDiscount
    ? program.original_price - program.final_price
    : 0;
  const isLessonPurchased = program.is_purchased;

  // Check if current lesson has both video and PDF
  const hasBothVideoAndPdf = selectedLesson && 
    (selectedLesson.video_url || selectedLesson.external_video_url) && 
    selectedLesson.pdf_url;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/#programs"
                className="text-gray-600 hover:text-red-600 transition-colors"
              >
                <ArrowLeft size={24} />
              </Link>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                  {program.title}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              >
                <List className="w-5 h-5" />
              </button>
              {isLessonPurchased && (
                <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Enrolled
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-6">
          {/* Left Sidebar - Lessons List */}
          <div
            className={`${
              isSidebarOpen ? 'block' : 'hidden'
            } lg:block w-full lg:w-96 flex-shrink-0`}
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-24 max-h-[calc(100vh-120px)]">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">
                    Course Content
                  </h2>
                  <span className="text-sm text-gray-500">
                    {program.lessons?.length || 0} lessons
                  </span>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="lg:hidden absolute top-4 right-4 p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lessons List */}
              <div className="overflow-y-auto max-h-[calc(100vh-220px)] p-2">
                {program.lessons && program.lessons.length > 0 ? (
                  <div className="space-y-1">
                    {program.lessons.map((lesson, index) => {
                      const isSelected = selectedLesson?.id === lesson.id;
                      const isLocked = !isLessonPurchased && !lesson.is_free_preview;
                      const isCompleted = completedLessons.includes(lesson.id);
                      const hasVideo = lesson.video_url || lesson.external_video_url;
                      const hasPdf = lesson.pdf_url;
                      
                      return (
                        <div
                          key={lesson.id || index}
                          onClick={() => {
                            if (!isLocked) {
                              selectLesson(lesson);
                            }
                          }}
                          className={`flex items-start gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                            !isLocked 
                              ? 'hover:bg-red-50' 
                              : 'cursor-not-allowed opacity-60'
                          } ${
                            isSelected 
                              ? 'bg-red-50 border-2 border-red-200 shadow-sm' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {/* Lesson Number / Status */}
                          <div className="shrink-0">
                            {isCompleted ? (
                              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-4 h-4" />
                              </div>
                            ) : isLocked ? (
                              <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center">
                                <Lock className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                isSelected 
                                  ? 'bg-red-600 text-white' 
                                  : 'bg-gray-200 text-gray-600'
                              }`}>
                                {index + 1}
                              </div>
                            )}
                          </div>

                          {/* Lesson Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className={`text-sm font-medium ${
                                isSelected ? 'text-red-600' : 'text-gray-900'
                              }`}>
                                {lesson.title}
                              </h4>
                            </div>
                            
                            {/* Lesson Metadata */}
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                              {hasVideo && (
                                <span className="flex items-center gap-1">
                                  <Video className="w-3 h-3" />
                                  Video
                                </span>
                              )}
                              {hasPdf && (
                                <span className="flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  PDF
                                </span>
                              )}
                              {lesson.duration_seconds && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {Math.floor(lesson.duration_seconds / 60)}m
                                </span>
                              )}
                              {lesson.is_free_preview && (
                                <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-[10px] font-medium">
                                  Preview
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Play/Content Icon */}
                          {!isLocked && (
                            <div className="shrink-0 mt-1">
                              {isSelected ? (
                                <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center">
                                  <Play className="w-4 h-4" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 text-gray-400">
                                  {hasVideo ? (
                                    <Play className="w-4 h-4" />
                                  ) : hasPdf ? (
                                    <FileText className="w-4 h-4" />
                                  ) : (
                                    <BookOpen className="w-4 h-4" />
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No lessons available</p>
                  </div>
                )}
              </div>

              {/* Sidebar Footer - Progress */}
              {isLessonPurchased && program.lessons?.length > 0 && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Progress: {completedLessons.length}/{program.lessons.length}
                    </span>
                    <span className="text-gray-600">
                      {Math.round((completedLessons.length / program.lessons.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-300"
                      style={{
                        width: `${(completedLessons.length / program.lessons.length) * 100}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Content Area - Video Player & Details */}
          <div className="flex-1 min-w-0">
            {/* Video Player Section */}
            {isLessonPurchased ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Content View Switcher - Show when lesson has both video and PDF */}
                {selectedLesson && hasBothVideoAndPdf && (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 border-b border-gray-200">
                    <button
                      onClick={() => switchContentView("video")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        contentViewMode === "video"
                          ? "bg-red-600 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Play className="w-4 h-4" />
                      Video
                    </button>
                    <button
                      onClick={() => switchContentView("pdf")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        contentViewMode === "pdf"
                          ? "bg-red-600 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      PDF
                    </button>
                    <span className="ml-auto text-xs text-gray-400">
                      Switch content type
                    </span>
                  </div>
                )}

                <div ref={playerRef} className="relative bg-black">
                  {/* PDF Viewer */}
                  {(contentViewMode === "pdf" || (!selectedLesson?.video_url && !selectedLesson?.external_video_url && selectedLesson?.pdf_url)) && (
                    <div className="relative w-full aspect-video bg-gray-100">
                      {selectedLesson?.pdf_url ? (
                        <iframe
                          src={`${selectedLesson.pdf_url}#toolbar=0&navpanes=0`}
                          className="w-full h-full"
                          title={selectedLesson.title}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                          <p>No PDF available for this lesson</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Video Player */}
                  {contentViewMode === "video" && selectedLesson && (selectedLesson.video_url || selectedLesson.external_video_url) && (
                    <div className="relative w-full aspect-video bg-black">
                      <video
                        ref={videoRef}
                        className="w-full h-full"
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleTimeUpdate}
                        onEnded={() => {
                          setIsPlaying(false);
                          if (selectedLesson && !completedLessons.includes(selectedLesson.id)) {
                            setCompletedLessons([...completedLessons, selectedLesson.id]);
                          }
                        }}
                        controls={false}
                        src={selectedLesson.video_url || selectedLesson.external_video_url}
                        poster={program.thumbnail_url}
                      >
                        Your browser does not support the video tag.
                      </video>

                      {/* Video Controls Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        {/* Progress Bar */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-white text-xs font-mono">
                            {formatTime(currentTime)}
                          </span>
                          <input
                            type="range"
                            min="0"
                            max={duration || 100}
                            value={currentTime}
                            onChange={handleSeek}
                            className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer hover:h-1.5 transition-all
                              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600"
                          />
                          <span className="text-white text-xs font-mono">
                            {formatTime(duration)}
                          </span>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={togglePlay}
                              className="text-white hover:text-red-500 transition-colors p-1"
                            >
                              {isPlaying ? (
                                <Pause className="w-6 h-6" />
                              ) : (
                                <Play className="w-6 h-6" />
                              )}
                            </button>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={toggleMute}
                                className="text-white hover:text-red-500 transition-colors p-1"
                              >
                                {isMuted ? (
                                  <VolumeX className="w-5 h-5" />
                                ) : (
                                  <Volume2 className="w-5 h-5" />
                                )}
                              </button>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer
                                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 
                                  [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full 
                                  [&::-webkit-slider-thumb]:bg-red-600"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={toggleFullscreen}
                              className="text-white hover:text-red-500 transition-colors p-1"
                            >
                              {isFullscreen ? (
                                <Minimize className="w-5 h-5" />
                              ) : (
                                <Maximize className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* No content available */}
                  {(!selectedLesson || (!selectedLesson.video_url && !selectedLesson.external_video_url && !selectedLesson.pdf_url)) && (
                    <div className="relative w-full aspect-video bg-gray-900 flex items-center justify-center">
                      <div className="text-center text-white">
                        {program.lessons && program.lessons.length > 0 ? (
                          <>
                            <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">Select a lesson to start learning</p>
                            <p className="text-sm text-gray-400 mt-1">
                              Choose a lesson from the curriculum on the left
                            </p>
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No lessons available</p>
                            <p className="text-sm text-gray-400 mt-1">
                              This course does not have any lessons yet
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Lesson Info */}
                {selectedLesson && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold text-gray-900">
                            {selectedLesson.title}
                          </h3>
                          {/* Content type badges */}
                          {selectedLesson.video_url && (
                            <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                              <Video className="w-3 h-3" />
                              Video
                            </span>
                          )}
                          {selectedLesson.pdf_url && (
                            <span className="flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                              <FileText className="w-3 h-3" />
                              PDF
                            </span>
                          )}
                        </div>
                        {selectedLesson.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {selectedLesson.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                          {selectedLesson.duration_seconds && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Duration: {Math.floor(selectedLesson.duration_seconds / 60)} min
                            </span>
                          )}
                          {selectedLesson.is_free_preview && (
                            <span className="text-green-600">✓ Free Preview</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {/* Quick PDF view button */}
                        {selectedLesson.pdf_url && contentViewMode === "video" && (
                          <button
                            onClick={() => switchContentView("pdf")}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                          >
                            <FileText className="w-4 h-4" />
                            View PDF
                          </button>
                        )}
                        {/* Quick video view button */}
                        {(selectedLesson.video_url || selectedLesson.external_video_url) && contentViewMode === "pdf" && (
                          <button
                            onClick={() => switchContentView("video")}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                          >
                            <Play className="w-4 h-4" />
                            View Video
                          </button>
                        )}
                        {isLessonPurchased && (
                          <button
                            onClick={() => {
                              const currentIndex = program.lessons.findIndex(l => l.id === selectedLesson.id);
                              if (currentIndex < program.lessons.length - 1) {
                                selectLesson(program.lessons[currentIndex + 1]);
                              }
                            }}
                            disabled={program.lessons.findIndex(l => l.id === selectedLesson.id) === program.lessons.length - 1}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next Lesson →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Not Enrolled - Show Program Details
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header with Thumbnail */}
                <div className="relative">
                  {program.thumbnail_url ? (
                    <div className="relative h-64 md:h-80 w-full overflow-hidden">
                      <img
                        src={program.thumbnail_url}
                        alt={program.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent"></div>

                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${getStatusBadge(program.status)}`}
                        >
                          {program.status}
                        </span>
                      </div>

                      {/* Discount Badge */}
                      {hasDiscount && (
                        <div className="absolute top-4 left-4">
                          <span className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-full shadow-lg flex items-center gap-2">
                            <TrendingDown className="w-4 h-4" />
                            {program.discount}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-64 bg-linear-to-r from-red-600 to-red-700 flex items-center justify-center">
                      <div className="text-center text-white">
                        <BookOpen className="w-20 h-20 mx-auto mb-4 opacity-50" />
                        <h1 className="text-3xl font-bold">{program.title}</h1>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    {program.title}
                  </h1>

                  {/* Quick Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="text-red-600" size={20} />
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {program.duration}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Clock className="text-red-600" size={20} />
                      <div>
                        <p className="text-xs text-gray-500">Mode</p>
                        <p className="font-semibold text-gray-900 text-sm capitalize">
                          {program.mode}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <GraduationCap className="text-red-600" size={20} />
                      <div>
                        <p className="text-xs text-gray-500">Level</p>
                        <p className="font-semibold text-gray-900 text-sm capitalize">
                          {program.level || "Beginner"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Award className="text-red-600" size={20} />
                      <div>
                        <p className="text-xs text-gray-500">Fee</p>
                        <div className="flex items-baseline gap-2">
                          <p className="font-bold text-gray-900">{program.fee}</p>
                          {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{program.original_price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      About this Program
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {program.description ||
                        `The ${program.title} program offers a comprehensive curriculum designed to develop expertise in ${program.category}.`}
                    </p>
                  </div>

                  {/* Enroll Button */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Ready to enroll?</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {program.fee}
                        </p>
                        {hasDiscount && (
                          <p className="text-sm text-green-600">
                            Save ₹{savedAmount} with current discount!
                          </p>
                        )}
                      </div>

                      {session ? (
                        <Link href={`/programs/${program.id}/checkout`}>
                          <button className="w-full sm:w-auto bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md hover:shadow-lg">
                            Enroll Now
                          </button>
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            sessionStorage.setItem(
                              "redirectAfterLogin",
                              `/programs/${program.id}/checkout`,
                            );
                            router.push("/login");
                          }}
                          className="w-full sm:w-auto bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                        >
                          Login to Enroll
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal - Keep for backward compatibility or full-screen view */}
      {showPdf && selectedPdfUrl && contentViewMode === "pdf" && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                {selectedLesson?.title || "PDF Viewer"}
              </h3>
              <button
                onClick={closePdfViewer}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-[70vh] bg-gray-100">
              <iframe
                src={`${selectedPdfUrl}#toolbar=0`}
                className="w-full h-full"
                title="PDF Viewer"
              />
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => {
                  window.open(selectedPdfUrl, '_blank');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <div className="flex gap-2">
                {selectedLesson?.video_url && (
                  <button
                    onClick={() => switchContentView("video")}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Watch Video
                  </button>
                )}
                <button
                  onClick={closePdfViewer}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramDetailPage;