"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
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
  Lock,
  X,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  List,
  Settings,
  FastForward,
  Rewind,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import fetchApiResponse from "@/helper/api_data_store";
import { useRouter } from "next/navigation";
import { progressApi } from "@/helper/progressApi";
import { useApi } from "@/helper/hooks/useApi";

const ProgramDetailPage = () => {
  const params = useParams();
  const { data: session, status, update } = useSession();
  const { apiCall } = useApi();
  const programId = params.id;
  const router = useRouter();
  const [isRouterReady, setIsRouterReady] = useState(false);

  const [program, setProgram] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  const [contentViewMode, setContentViewMode] = useState("video");
  const [lessonProgress, setLessonProgress] = useState({});
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [progressSaveStatus, setProgressSaveStatus] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState(null);

  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const lastSavedTime = useRef(0);
  const progressInterval = useRef(null);

  // Speed options
  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    const timeout = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
    setControlsTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout]);

  useEffect(() => {
    const checkSession = async () => {
      if (status === "loading") {
        return;
      }

      if (status === "unauthenticated") {
        return;
      }

      if (session && !session.accessToken) {
        await update();
      }
    };

    checkSession();
  }, [status, session, update]);

  useEffect(() => {
    setIsRouterReady(true);
  }, []);

  const safeNavigate = useCallback(
    (path) => {
      if (isRouterReady && router) {
        router.push(path);
      } else {
        window.location.href = path;
      }
    },
    [isRouterReady, router],
  );

  useEffect(() => {
    if (programId) {
      fetchProgramDetails();
    }
  }, [programId]);

  useEffect(() => {
    if (
      program &&
      program.lessons &&
      program.lessons.length > 0 &&
      program.is_purchased
    ) {
      loadAllLessonProgress();

      const firstVideoLesson = program.lessons.find(
        (lesson) => lesson.video_url,
      );
      if (firstVideoLesson) {
        setSelectedLesson(firstVideoLesson);
        setIsPlayerVisible(true);
        loadLessonProgress(firstVideoLesson.id);

        const firstLessonProgress = lessonProgress[firstVideoLesson.id];
        if (firstLessonProgress && firstLessonProgress.watched_seconds > 0) {
          setCurrentTime(firstLessonProgress.watched_seconds);
          // After video loads, seek to this position
          if (videoRef.current) {
            const handleLoad = () => {
              videoRef.current.currentTime =
                firstLessonProgress.watched_seconds;
              videoRef.current.removeEventListener(
                "loadedmetadata",
                handleLoad,
              );
            };
            videoRef.current.addEventListener("loadedmetadata", handleLoad);
          }
        }
        if (firstVideoLesson.pdf_url) {
          setContentViewMode("video");
        }
      } else if (program.lessons[0]) {
        setSelectedLesson(program.lessons[0]);
        setIsPlayerVisible(true);
        loadLessonProgress(program.lessons[0].id);

        const firstLessonProgress = lessonProgress[program.lessons[0].id];

        if (firstLessonProgress && firstLessonProgress.watched_seconds > 0) {
          setCurrentTime(firstLessonProgress.watched_seconds);
          if (videoRef.current) {
            const handleLoad = () => {
              videoRef.current.currentTime =
                firstLessonProgress.watched_seconds;
              videoRef.current.removeEventListener(
                "loadedmetadata",
                handleLoad,
              );
            };
            videoRef.current.addEventListener("loadedmetadata", handleLoad);
          }
        }
        if (program.lessons[0].pdf_url) {
          setContentViewMode("pdf");
        }
      }
    }
  }, [program]);

  useEffect(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    if (
      isPlaying &&
      selectedLesson &&
      program?.is_purchased &&
      videoRef.current
    ) {
      progressInterval.current = setInterval(() => {
        if (videoRef.current && currentTime > 0) {
          saveProgress(currentTime, false);
        }
      }, 5000);
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, [isPlaying, selectedLesson, currentTime]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (
        selectedLesson &&
        currentTime > 0 &&
        !completedLessons.includes(selectedLesson.id)
      ) {
        saveProgress(currentTime, false);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [selectedLesson, currentTime, completedLessons]);

  const fetchProgramDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      if (status === "loading") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      let currentSession = session;
      if (!currentSession?.accessToken) {
        currentSession = await update();
      }

      if (!currentSession?.accessToken) {
        throw new Error("No access token available");
      }

      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/details/${programId}`,
        {
          method: "GET",
          headers: {
            "Access-Token": currentSession.accessToken,
            "Refresh-Token": currentSession.refreshToken,
          },
        },
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
        };
        setProgram(formattedProgram);
      } else if (response.meta?.status === 401) {
        const newSession = await update();
        if (newSession?.accessToken) {
          return fetchProgramDetails();
        } else {
          setError("Session expired. Please login again.");
          router.push("/login");
        }
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

  const loadLessonProgress = async (lessonId) => {
    if (!session?.accessToken || !program?.is_purchased) return;

    try {
      const result = await progressApi.getLessonProgress(lessonId, session);
      if (result.success && result.data) {
        setLessonProgress((prev) => ({
          ...prev,
          [lessonId]: result.data,
        }));

        if (selectedLesson?.id === lessonId && result.data.completed) {
          setCompletedLessons((prev) => {
            if (!prev.includes(lessonId)) {
              return [...prev, lessonId];
            }
            return prev;
          });
        }
      }
    } catch (error) {
      console.error(`Error loading progress for lesson ${lessonId}:`, error);
    }
  };

  const loadAllLessonProgress = async () => {
    if (!session?.accessToken || !program?.is_purchased || !program?.lessons) {
      console.log("⚠️ Cannot load progress: missing required data");
      return;
    }

    setLoadingProgress(true);
    console.log(`📚 Loading progress for ${program.lessons.length} lessons...`);

    const completed = [];
    const progressMap = {};

    for (const lesson of program.lessons) {
      try {
        console.log(
          `📡 Fetching progress for lesson ${lesson.id}: ${lesson.title}`,
        );
        const result = await progressApi.getLessonProgress(lesson.id, session);

        if (result.success && result.data) {
          progressMap[lesson.id] = result.data;
          if (result.data.completed) {
            completed.push(lesson.id);
            console.log(`✅ Lesson ${lesson.id} completed`);
          }
        } else {
          progressMap[lesson.id] = {
            watched_seconds: 0,
            completed: false,
            lesson_id: lesson.id,
          };
        }
      } catch (error) {
        console.error(
          `❌ Error loading progress for lesson ${lesson.id}:`,
          error,
        );
        progressMap[lesson.id] = {
          watched_seconds: 0,
          completed: false,
          lesson_id: lesson.id,
        };
      }
    }

    setLessonProgress(progressMap);
    setCompletedLessons(completed);
    setLoadingProgress(false);
    console.log(
      `✅ Loaded progress for ${Object.keys(progressMap).length} lessons`,
    );
    console.log(
      `📊 Completed lessons: ${completed.length}/${program.lessons.length}`,
    );
  };

  const saveProgress = useCallback(
    async (watchedSeconds, completed = false) => {
      if (!selectedLesson || !program?.is_purchased || !session?.accessToken) {
        console.log("⚠️ Cannot save progress: missing required data");
        return;
      }

      if (completedLessons.includes(selectedLesson.id)) {
        setProgressSaveStatus("saved");
        return;
      }

      if (!completed && Math.abs(watchedSeconds - lastSavedTime.current) < 2) {
        return;
      }

      setIsUpdatingProgress(true);
      setProgressSaveStatus("saving");

      try {
        const data = {
          watched_seconds: Math.floor(watchedSeconds),
        };

        if (completed) {
          data.completed = true;
        }

        console.log(
          `💾 Saving progress for lesson ${selectedLesson.id}:`,
          data,
        );

        const result = await progressApi.updateProgress(
          selectedLesson.id,
          data,
          session,
        );

        if (result.success) {
          lastSavedTime.current = watchedSeconds;
          setProgressSaveStatus("saved");
          console.log(`✅ Progress saved for lesson ${selectedLesson.id}`);

          setLessonProgress((prev) => ({
            ...prev,
            [selectedLesson.id]: result.data,
          }));

          if (
            result.data.completed &&
            !completedLessons.includes(selectedLesson.id)
          ) {
            setCompletedLessons((prev) => [...prev, selectedLesson.id]);
            console.log(`🎉 Lesson ${selectedLesson.id} marked as completed!`);
          }

          setTimeout(() => {
            setProgressSaveStatus("");
          }, 2000);
        } else {
          setProgressSaveStatus("error");
          console.error("❌ Failed to save progress:", result.error);
        }
      } catch (error) {
        setProgressSaveStatus("error");
        console.error("❌ Error saving progress:", error);
      } finally {
        setIsUpdatingProgress(false);
      }
    },
    [selectedLesson, program?.is_purchased, session, completedLessons],
  );

  const handleVideoEnded = useCallback(async () => {
    setIsPlaying(false);
    if (selectedLesson && !completedLessons.includes(selectedLesson.id)) {
      console.log(
        `🏁 Video ended for lesson ${selectedLesson.id}, marking as completed`,
      );
      await saveProgress(duration, true);
    }
  }, [selectedLesson, completedLessons, duration, saveProgress]);

  const handleVideoPause = useCallback(() => {
    if (videoRef.current && currentTime > 0) {
      saveProgress(currentTime, false);
    }
  }, [currentTime, saveProgress]);

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
        handleVideoPause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const newTime = videoRef.current.currentTime;
      setCurrentTime(newTime);
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

  // Skip forward/backward
  const skipForward = () => {
    if (videoRef.current) {
      const newTime = Math.min(videoRef.current.currentTime + 10, duration);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      const newTime = Math.max(videoRef.current.currentTime - 10, 0);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Change playback speed
  const changePlaybackSpeed = (speed) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Space bar - toggle play/pause
      if (e.key === " " && !e.target.matches("input, textarea, button")) {
        e.preventDefault();
        togglePlay();
      }
      // Arrow right - skip forward 10s
      if (e.key === "ArrowRight" && !e.target.matches("input, textarea")) {
        e.preventDefault();
        skipForward();
      }
      // Arrow left - skip backward 10s
      if (e.key === "ArrowLeft" && !e.target.matches("input, textarea")) {
        e.preventDefault();
        skipBackward();
      }
      // F - fullscreen
      if (e.key === "f" && !e.target.matches("input, textarea")) {
        e.preventDefault();
        toggleFullscreen();
      }
      // M - mute
      if (e.key === "m" && !e.target.matches("input, textarea")) {
        e.preventDefault();
        toggleMute();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying]);

  const selectLesson = (lesson) => {
    // Save progress of current lesson if needed
    if (
      selectedLesson &&
      currentTime > 0 &&
      !completedLessons.includes(selectedLesson.id)
    ) {
      saveProgress(currentTime, false);
    }

    // Set new lesson
    setSelectedLesson(lesson);
    setIsPlaying(false);
    setCurrentTime(0);
    setShowPdf(false);
    setSelectedPdfUrl(null);
    setIsPlayerVisible(true);
    lastSavedTime.current = 0;

    // Load progress for the new lesson
    loadLessonProgress(lesson.id);

    // Determine content type
    const hasVideo = lesson.video_url || lesson.external_video_url;
    const hasPdf = lesson.pdf_url;

    if (hasVideo && hasPdf) {
      setContentViewMode("video");
      setIsPlayerVisible(true);
    } else if (hasPdf) {
      setSelectedPdfUrl(lesson.pdf_url);
      setShowPdf(true);
      setContentViewMode("pdf");
      setIsPlayerVisible(false);
    } else if (hasVideo) {
      setContentViewMode("video");
      setIsPlayerVisible(true);
    }

    // Handle video loading and seeking
    if (videoRef.current) {
      videoRef.current.load();

      // After video loads, seek to saved progress
      const handleLoadedMetadata = () => {
        const savedProgress = lessonProgress[lesson.id];
        if (savedProgress && savedProgress.watched_seconds > 0) {
          videoRef.current.currentTime = savedProgress.watched_seconds;
          setCurrentTime(savedProgress.watched_seconds);
        }
        // Remove listener after first load
        videoRef.current.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata,
        );
      };

      videoRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
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
      handleVideoPause();
    }
  };

  const closePdfViewer = () => {
    setShowPdf(false);
    setSelectedPdfUrl(null);
    setContentViewMode("video");
    if (
      selectedLesson &&
      (selectedLesson.video_url || selectedLesson.external_video_url)
    ) {
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
        handleVideoPause();
      }
    } else if (
      mode === "video" &&
      (selectedLesson?.video_url || selectedLesson?.external_video_url)
    ) {
      setContentViewMode("video");
      setShowPdf(false);
      setSelectedPdfUrl(null);
      setIsPlayerVisible(true);
      if (videoRef.current) {
        videoRef.current.load();
        const progress = lessonProgress[selectedLesson.id];
        if (progress && progress.watched_seconds > 0) {
          videoRef.current.currentTime = progress.watched_seconds;
          setCurrentTime(progress.watched_seconds);
        }
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getLessonProgressPercentage = (lessonId) => {
    const progress = lessonProgress[lessonId];
    if (!progress) return 0;
    const lesson = program?.lessons?.find((l) => l.id === lessonId);
    if (!lesson || !lesson.duration_seconds) return 0;
    return Math.min(
      (progress.watched_seconds / lesson.duration_seconds) * 100,
      100,
    );
  };

  const handleEnrollClick = () => {
    if (session) {
      safeNavigate(`/programs/${program.id}/checkout`);
    } else {
      sessionStorage.setItem(
        "redirectAfterLogin",
        `/programs/${program.id}/checkout`,
      );
      safeNavigate("/login");
    }
  };

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

  const hasBothVideoAndPdf =
    selectedLesson &&
    (selectedLesson.video_url || selectedLesson.external_video_url) &&
    selectedLesson.pdf_url;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
              onClick={()=> router.back()}
                className="text-gray-600 hover:text-red-600 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
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
              isSidebarOpen ? "block" : "hidden"
            } lg:block w-full lg:w-96 flex-shrink-0`}
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-24 max-h-[calc(100vh-120px)]">
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
                {loadingProgress && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading progress...
                  </div>
                )}
              </div>

              <div className="overflow-y-auto max-h-[calc(100vh-220px)] p-2">
                {program.lessons && program.lessons.length > 0 ? (
                  <div className="space-y-1">
                    {program.lessons.map((lesson, index) => {
                      const isSelected = selectedLesson?.id === lesson.id;
                      const isLocked =
                        !isLessonPurchased && !lesson.is_free_preview;
                      const isCompleted = completedLessons.includes(lesson.id);
                      const hasVideo =
                        lesson.video_url || lesson.external_video_url;
                      const hasPdf = lesson.pdf_url;
                      const progressPercent = getLessonProgressPercentage(
                        lesson.id,
                      );

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
                              ? "hover:bg-red-50"
                              : "cursor-not-allowed opacity-60"
                          } ${
                            isSelected
                              ? "bg-red-50 border-2 border-red-200 shadow-sm"
                              : "hover:bg-gray-50"
                          }`}
                        >
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
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                  isSelected
                                    ? "bg-red-600 text-white"
                                    : "bg-gray-200 text-gray-600"
                                }`}
                              >
                                {index + 1}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4
                                className={`text-sm font-medium ${
                                  isSelected ? "text-red-600" : "text-gray-900"
                                }`}
                              >
                                {lesson.title}
                              </h4>
                            </div>

                            {isLessonPurchased &&
                              !isLocked &&
                              progressPercent > 0 &&
                              !isCompleted && (
                                <div className="mt-1">
                                  <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-red-500 rounded-full transition-all duration-300"
                                      style={{
                                        width: `${Math.min(progressPercent, 100)}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              )}

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
                              {isCompleted && (
                                <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-[10px] font-medium">
                                  Completed
                                </span>
                              )}
                            </div>
                          </div>

                          {!isLocked && (
                            <div className="shrink-0 mt-1">
                              {isSelected ? (
                                <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center">
                                  <Play className="w-4 h-4" />
                                </div>
                              ) : isCompleted ? (
                                <div className="w-8 h-8 text-green-600">
                                  <CheckCircle className="w-5 h-5" />
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

              {isLessonPurchased && program.lessons?.length > 0 && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Progress: {completedLessons.length}/
                      {program.lessons.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">
                        {(() => {
                          // Calculate total watched progress across all lessons
                          let totalWatched = 0;
                          let totalDuration = 0;

                          program.lessons.forEach((lesson) => {
                            const progress = lessonProgress[lesson.id];
                            if (progress) {
                              totalWatched += progress.watched_seconds || 0;
                            }
                            if (lesson.duration_seconds) {
                              totalDuration += lesson.duration_seconds;
                            }
                          });

                          // If no duration data, fall back to completed lessons count
                          if (totalDuration === 0) {
                            return Math.round(
                              (completedLessons.length /
                                program.lessons.length) *
                                100,
                            );
                          }

                          return Math.min(
                            Math.round((totalWatched / totalDuration) * 100),
                            100,
                          );
                        })()}
                        %
                      </span>
                      {progressSaveStatus === "saving" && (
                        <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                      )}
                      {progressSaveStatus === "saved" && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      {progressSaveStatus === "error" && (
                        <X className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-red-500 to-red-600 rounded-full transition-all duration-300"
                      style={{
                        width: `${(() => {
                          let totalWatched = 0;
                          let totalDuration = 0;

                          program.lessons.forEach((lesson) => {
                            const progress = lessonProgress[lesson.id];
                            if (progress) {
                              totalWatched += progress.watched_seconds || 0;
                            }
                            if (lesson.duration_seconds) {
                              totalDuration += lesson.duration_seconds;
                            }
                          });

                          if (totalDuration === 0) {
                            return (
                              (completedLessons.length /
                                program.lessons.length) *
                              100
                            );
                          }

                          return Math.min(
                            (totalWatched / totalDuration) * 100,
                            100,
                          );
                        })()}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Content Area - Video Player & Details */}
          <div className="flex-1 min-w-0">
            {isLessonPurchased ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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

                <div
                  ref={playerRef}
                  className="relative bg-black"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* PDF Viewer */}
                  {(contentViewMode === "pdf" ||
                    (!selectedLesson?.video_url &&
                      !selectedLesson?.external_video_url &&
                      selectedLesson?.pdf_url)) && (
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
                  {contentViewMode === "video" &&
                    selectedLesson &&
                    (selectedLesson.video_url ||
                      selectedLesson.external_video_url) && (
                      <div className="relative w-full aspect-video bg-black">
                        <video
                          ref={videoRef}
                          className="w-full h-full"
                          onTimeUpdate={handleTimeUpdate}
                          onLoadedMetadata={handleTimeUpdate}
                          onEnded={handleVideoEnded}
                          onPause={handleVideoPause}
                          controls={false}
                          src={
                            selectedLesson.video_url ||
                            selectedLesson.external_video_url
                          }
                          poster={program.thumbnail_url}
                          onClick={togglePlay}
                        >
                          Your browser does not support the video tag.
                        </video>

                        {/* Progress overlay - show current progress */}
                        {lessonProgress[selectedLesson?.id] && (
                          <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {Math.min(
                              (lessonProgress[selectedLesson.id]
                                .watched_seconds /
                                (duration || 1)) *
                                100,
                              100,
                            ).toFixed(0)}
                            %
                          </div>
                        )}

                        {/* Speed indicator */}
                        {playbackRate !== 1 && (
                          <div className="absolute top-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {playbackRate}x
                          </div>
                        )}

                        {/* Center Play/Pause Button - Shows when controls are visible or video is paused */}
                        {(showControls || !isPlaying) && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <button
                              onClick={togglePlay}
                              className="pointer-events-auto bg-black/50 hover:bg-black/70 rounded-full p-4 transition-all duration-200 transform hover:scale-110"
                            >
                              {isPlaying ? (
                                <Pause className="w-12 h-12 text-white" />
                              ) : (
                                <Play className="w-12 h-12 text-white ml-1" />
                              )}
                            </button>
                          </div>
                        )}

                        {/* Skip buttons - visible with controls */}
                        {showControls && (
                          <>
                            <button
                              onClick={skipBackward}
                              className="absolute left-8 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-3 transition-all duration-200"
                            >
                              <Rewind className="w-6 h-6 text-white" />
                              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white text-[10px]">
                                10s
                              </span>
                            </button>
                            <button
                              onClick={skipForward}
                              className="absolute right-8 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-3 transition-all duration-200"
                            >
                              <FastForward className="w-6 h-6 text-white" />
                              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white text-[10px]">
                                10s
                              </span>
                            </button>
                          </>
                        )}

                        {/* Video Controls Overlay */}
                        <div
                          className={`absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
                            showControls ? "opacity-100" : "opacity-0"
                          }`}
                        >
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
                              {/* Play/Pause */}
                              <button
                                onClick={togglePlay}
                                className="text-white hover:text-red-500 transition-colors p-1"
                              >
                                {isPlaying ? (
                                  <Pause className="w-5 h-5" />
                                ) : (
                                  <Play className="w-5 h-5" />
                                )}
                              </button>

                              {/* Skip Backward */}
                              <button
                                onClick={skipBackward}
                                className="text-white hover:text-red-500 transition-colors p-1"
                              >
                                <Rewind className="w-5 h-5" />
                              </button>

                              {/* Skip Forward */}
                              <button
                                onClick={skipForward}
                                className="text-white hover:text-red-500 transition-colors p-1"
                              >
                                <FastForward className="w-5 h-5" />
                              </button>

                              {/* Volume */}
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
                              {/* Playback Speed */}
                              <div className="relative">
                                <button
                                  onClick={() =>
                                    setShowSpeedMenu(!showSpeedMenu)
                                  }
                                  className="text-white hover:text-red-500 transition-colors p-1 flex items-center gap-1 text-sm"
                                >
                                  <Settings className="w-5 h-5" />
                                  <span className="hidden sm:inline">
                                    {playbackRate}x
                                  </span>
                                </button>

                                {showSpeedMenu && (
                                  <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg shadow-lg p-1 min-w-[120px] z-50">
                                    {speedOptions.map((speed) => (
                                      <button
                                        key={speed}
                                        onClick={() =>
                                          changePlaybackSpeed(speed)
                                        }
                                        className={`w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${
                                          playbackRate === speed
                                            ? "bg-red-600 text-white"
                                            : "text-white hover:bg-gray-700"
                                        }`}
                                      >
                                        {speed}x
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Fullscreen */}
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

                        {/* Keyboard shortcuts hint */}
                        {showControls && (
                          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/50 text-xs hidden md:block">
                            Space: Play/Pause • ← →: Skip 10s • F: Fullscreen •
                            M: Mute
                          </div>
                        )}
                      </div>
                    )}

                  {/* No content available */}
                  {(!selectedLesson ||
                    (!selectedLesson.video_url &&
                      !selectedLesson.external_video_url &&
                      !selectedLesson.pdf_url)) && (
                    <div className="relative w-full aspect-video bg-gray-900 flex items-center justify-center">
                      <div className="text-center text-white">
                        {program.lessons && program.lessons.length > 0 ? (
                          <>
                            <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">
                              Select a lesson to start learning
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              Choose a lesson from the curriculum on the left
                            </p>
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">
                              No lessons available
                            </p>
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
                          {completedLessons.includes(selectedLesson.id) && (
                            <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              Completed
                            </span>
                          )}
                        </div>

                        {selectedLesson.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {selectedLesson.description}
                          </p>
                        )}

                        {/* Progress Display */}
                        <div className="mt-2 flex items-center gap-4 text-xs">
                          <span className="text-gray-500">Progress:</span>
                          <span className="font-medium text-blue-600">
                            {(() => {
                              const progress =
                                lessonProgress[selectedLesson.id];
                              if (!progress || !selectedLesson.duration_seconds)
                                return "0%";
                              const percentage = Math.min(
                                (progress.watched_seconds /
                                  selectedLesson.duration_seconds) *
                                  100,
                                100,
                              );
                              return `${Math.round(percentage)}%`;
                            })()}
                          </span>
                          {isUpdatingProgress && (
                            <Loader2 className="w-3 h-3 text-red-600 animate-spin" />
                          )}
                          {progressSaveStatus === "saved" && (
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          )}
                          {progressSaveStatus === "error" && (
                            <X className="w-3 h-3 text-red-600" />
                          )}
                          <span className="text-gray-400">
                            (
                            {formatTime(
                              lessonProgress[selectedLesson.id]
                                ?.watched_seconds || 0,
                            )}{" "}
                            / {formatTime(selectedLesson.duration_seconds || 0)}
                            )
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                          {selectedLesson.duration_seconds && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Duration:{" "}
                              {Math.floor(
                                selectedLesson.duration_seconds / 60,
                              )}{" "}
                              min
                            </span>
                          )}
                          {selectedLesson.is_free_preview && (
                            <span className="text-green-600">
                              ✓ Free Preview
                            </span>
                          )}
                          {playbackRate !== 1 && (
                            <span className="text-purple-600">
                              Speed: {playbackRate}x
                            </span>
                          )}
                          {currentTime > 0 && (
                            <span className="text-gray-400">
                              Current: {formatTime(currentTime)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        {selectedLesson.pdf_url &&
                          contentViewMode === "video" && (
                            <button
                              onClick={() => switchContentView("pdf")}
                              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                            >
                              <FileText className="w-4 h-4" />
                              View PDF
                            </button>
                          )}
                        {(selectedLesson.video_url ||
                          selectedLesson.external_video_url) &&
                          contentViewMode === "pdf" && (
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
                              const currentIndex = program.lessons.findIndex(
                                (l) => l.id === selectedLesson.id,
                              );
                              if (currentIndex < program.lessons.length - 1) {
                                if (
                                  currentTime > 0 &&
                                  !completedLessons.includes(selectedLesson.id)
                                ) {
                                  saveProgress(currentTime, false);
                                }
                                selectLesson(program.lessons[currentIndex + 1]);
                              }
                            }}
                            disabled={
                              program.lessons.findIndex(
                                (l) => l.id === selectedLesson.id,
                              ) ===
                              program.lessons.length - 1
                            }
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

                      <div className="absolute top-4 right-4">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${getStatusBadge(program.status)}`}
                        >
                          {program.status}
                        </span>
                      </div>

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

                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    {program.title}
                  </h1>

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
                          <p className="font-bold text-gray-900">
                            {program.fee}
                          </p>
                          {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{program.original_price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      About this Program
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {program.description ||
                        `The ${program.title} program offers a comprehensive curriculum designed to develop expertise in ${program.category}.`}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Ready to enroll?
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {program.fee}
                        </p>
                        {hasDiscount && (
                          <p className="text-sm text-green-600">
                            Save ₹{savedAmount} with current discount!
                          </p>
                        )}
                      </div>

                      <button
                        onClick={handleEnrollClick}
                        className="w-full sm:w-auto bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                      >
                        {session ? "Enroll Now" : "Login to Enroll"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
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
                  window.open(selectedPdfUrl, "_blank");
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
