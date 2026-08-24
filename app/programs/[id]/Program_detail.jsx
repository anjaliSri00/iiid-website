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
  CheckSquare,
  ClipboardCheck,
  LogIn,
  ShoppingCart,
  Eye,
  Sparkles,
  Share2,
  Download,
  Shield,
} from "lucide-react";
import fetchApiResponse from "@/helper/api_data_store";
import { useRouter } from "next/navigation";
import { progressApi } from "@/helper/services/progressApi";
import { useApi } from "@/helper/hooks/useApi";
import { certificateApi } from "@/helper/services/certificateApi";

const Program_detail = () => {
  const params = useParams();
  const { data: session, status, update } = useSession();
  const { apiCall } = useApi();
  const programId = params.id;
  const router = useRouter();
  const [isRouterReady, setIsRouterReady] = useState(false);

  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
  const [activeTab, setActiveTab] = useState("content");
  const [assessmentData, setAssessmentData] = useState(null);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const lastSavedTime = useRef(0);
  const progressInterval = useRef(null);
  const hasMarkedCompleteRef = useRef(false);

  // Add these state variables
  const [certificateData, setCertificateData] = useState(null);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [isEligibleForCertificate, setIsEligibleForCertificate] =
    useState(false);
  const [certificateCheckDone, setCertificateCheckDone] = useState(false);

  const certificateCheckDoneRef = useRef(false);
  const isCheckingCertificateRef = useRef(false);

  // Add state for tracking initial check
  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);

  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check authentication status
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [status, session]);

  // Auto-hide controls
  const handleMouseMove = () => {
    if (!isClient) return;
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

  // Session handling - only redirect if trying to access protected content
  useEffect(() => {
    if (!isClient || status === "loading") return;

    const handleSession = async () => {
      try {
        if (status === "unauthenticated") {
          return;
        }

        if (session && !session.accessToken) {
          await update();
        }
      } catch (error) {
        console.error("Session handling error:", error);
      }
    };

    handleSession();
  }, [status, session, update, router, isClient]);

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
    if (programId && isClient) {
      fetchProgramDetails();
    }
  }, [programId, isClient, fetchProgramDetails]);

  useEffect(() => {
    if (selectedLesson) {
      hasMarkedCompleteRef.current = completedLessons.includes(
        selectedLesson.id,
      );
    }
  }, [selectedLesson, completedLessons]);

  useEffect(() => {
    if (
      program &&
      program.lessons &&
      program.lessons.length > 0 &&
      program.is_purchased &&
      isClient &&
      isAuthenticated
    ) {
      loadAllLessonProgress();

      const firstVideoLesson = program.lessons.find(
        (lesson) => lesson.video_url || lesson.external_video_url,
      );
      if (firstVideoLesson) {
        setSelectedLesson(firstVideoLesson);
        setIsPlayerVisible(true);
        loadLessonProgress(firstVideoLesson.id);
        setActiveTab("content");
      } else if (program.lessons[0]) {
        setSelectedLesson(program.lessons[0]);
        setIsPlayerVisible(true);
        loadLessonProgress(program.lessons[0].id);
        setActiveTab("content");
      }
    }
  }, [program, isClient, isAuthenticated]);

  useEffect(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    if (
      isPlaying &&
      selectedLesson &&
      program?.is_purchased &&
      videoRef.current &&
      isAuthenticated
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
  }, [isPlaying, selectedLesson, currentTime, isAuthenticated]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (
        selectedLesson &&
        currentTime > 0 &&
        !completedLessons.includes(selectedLesson.id) &&
        isAuthenticated
      ) {
        saveProgress(currentTime, false);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [selectedLesson, currentTime, completedLessons, isAuthenticated]);

  const allLessonsCompleted =
    program?.lessons?.length > 0 &&
    program.lessons.every((lesson) => completedLessons.includes(lesson.id));

  const fetchProgramDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      if (status === "loading") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      let currentSession = session;
      if (!currentSession?.accessToken && isAuthenticated) {
        currentSession = await update();
      }

      const headers = {};
      if (currentSession?.accessToken) {
        headers["Access-Token"] = currentSession.accessToken;
        headers["Refresh-Token"] = currentSession.refreshToken;
      }

      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/details/${programId}`,
        {
          method: "GET",
          headers: headers,
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
          assessment: course.assessment || null,
        };
        setProgram(formattedProgram);

        if (course.assessment) {
          setAssessmentData(course.assessment);
        }
      } else if (response.meta?.status === 401) {
        if (isAuthenticated) {
          const newSession = await update();
          if (newSession?.accessToken) {
            return fetchProgramDetails();
          }
        }
        setError("Please login to access course content");
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
    if (
      !session?.accessToken ||
      !program?.is_purchased ||
      !isClient ||
      !isAuthenticated
    )
      return;

    try {
      const result = await progressApi.getLessonProgress(lessonId, session);
      if (result.success && result.data) {
        setLessonProgress((prev) => ({
          ...prev,
          [lessonId]: result.data,
        }));

        if (result.data.completed && !completedLessons.includes(lessonId)) {
          setCompletedLessons((prev) => [...prev, lessonId]);
        }
      }
    } catch (error) {
      console.error(`Error loading progress for lesson ${lessonId}:`, error);
    }
  };

  const loadAllLessonProgress = async () => {
    if (
      !session?.accessToken ||
      !program?.is_purchased ||
      !program?.lessons ||
      !isClient ||
      !isAuthenticated
    ) {
      return;
    }

    setLoadingProgress(true);
    const completed = [];
    const progressMap = {};

    for (const lesson of program.lessons) {
      try {
        const result = await progressApi.getLessonProgress(lesson.id, session);

        if (result.success && result.data) {
          progressMap[lesson.id] = result.data;
          if (result.data.completed) {
            completed.push(lesson.id);
          }
        } else {
          progressMap[lesson.id] = {
            watched_seconds: 0,
            completed: false,
            lesson_id: lesson.id,
          };
        }
      } catch (error) {
        console.error(`Error loading progress for lesson ${lesson.id}:`, error);
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
  };

  const saveProgress = useCallback(
    async (watchedSeconds, completed = false) => {
      if (
        !selectedLesson ||
        !program?.is_purchased ||
        !session?.accessToken ||
        !isClient ||
        !isAuthenticated
      ) {
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

        const result = await progressApi.updateProgress(
          selectedLesson.id,
          data,
          session,
        );

        if (result.success) {
          lastSavedTime.current = watchedSeconds;
          setProgressSaveStatus("saved");

          setLessonProgress((prev) => ({
            ...prev,
            [selectedLesson.id]: result.data,
          }));

          if (
            result.data.completed &&
            !completedLessons.includes(selectedLesson.id)
          ) {
            setCompletedLessons((prev) => [...prev, selectedLesson.id]);
            hasMarkedCompleteRef.current = true;
          }

          setTimeout(() => {
            setProgressSaveStatus("");
          }, 2000);
        } else {
          setProgressSaveStatus("error");
        }
      } catch (error) {
        setProgressSaveStatus("error");
        console.error("Error saving progress:", error);
      } finally {
        setIsUpdatingProgress(false);
      }
    },
    [
      selectedLesson,
      program?.is_purchased,
      session,
      completedLessons,
      isClient,
      isAuthenticated,
    ],
  );

  const handleMarkComplete = async () => {
    if (
      !selectedLesson ||
      !program?.is_purchased ||
      !isClient ||
      !isAuthenticated
    )
      return;
    if (completedLessons.includes(selectedLesson.id)) return;
    if (isMarkingComplete) return;

    setIsMarkingComplete(true);
    try {
      await saveProgress(duration || 0, true);

      if (isPlaying && videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error marking lesson as complete:", error);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const handleVideoEnded = useCallback(async () => {
    setIsPlaying(false);
    if (
      selectedLesson &&
      !completedLessons.includes(selectedLesson.id) &&
      !hasMarkedCompleteRef.current &&
      isClient &&
      isAuthenticated
    ) {
      await saveProgress(duration, true);
    }
  }, [
    selectedLesson,
    completedLessons,
    duration,
    saveProgress,
    isClient,
    isAuthenticated,
  ]);

  const handleVideoPause = useCallback(() => {
    if (videoRef.current && currentTime > 0 && isClient && isAuthenticated) {
      saveProgress(currentTime, false);
    }
  }, [currentTime, saveProgress, isClient, isAuthenticated]);

  const getStatusBadge = (status) => {
    const styles = {
      published: "bg-[#CC0000]/10 text-[#CC0000]",
      draft: "bg-yellow-100 text-yellow-700",
      archived: "bg-gray-100 text-gray-700",
    };
    return styles[status] || styles.draft;
  };

  const togglePlay = () => {
    if (
      videoRef.current &&
      isClient &&
      isAuthenticated &&
      program?.is_purchased
    ) {
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

  const changePlaybackSpeed = (speed) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  useEffect(() => {
    if (!isClient) return;

    const handleKeyDown = (e) => {
      if (e.key === " " && !e.target.matches("input, textarea, button")) {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === "ArrowRight" && !e.target.matches("input, textarea")) {
        e.preventDefault();
        skipForward();
      }
      if (e.key === "ArrowLeft" && !e.target.matches("input, textarea")) {
        e.preventDefault();
        skipBackward();
      }
      if (e.key === "f" && !e.target.matches("input, textarea")) {
        e.preventDefault();
        toggleFullscreen();
      }
      if (e.key === "m" && !e.target.matches("input, textarea")) {
        e.preventDefault();
        toggleMute();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying, isClient]);

  const selectLesson = (lesson) => {
    if (!isClient) return;

    if (
      selectedLesson &&
      currentTime > 0 &&
      !completedLessons.includes(selectedLesson.id) &&
      isAuthenticated
    ) {
      saveProgress(currentTime, false);
    }

    setSelectedLesson(lesson);
    setIsPlaying(false);
    setCurrentTime(0);
    setShowPdf(false);
    setSelectedPdfUrl(null);
    setIsPlayerVisible(true);
    lastSavedTime.current = 0;
    hasMarkedCompleteRef.current = completedLessons.includes(lesson.id);

    if (isAuthenticated && program?.is_purchased) {
      loadLessonProgress(lesson.id);
    }

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

    if (videoRef.current && isAuthenticated && program?.is_purchased) {
      videoRef.current.load();
      const handleLoadedMetadata = () => {
        const savedProgress = lessonProgress[lesson.id];
        if (savedProgress && savedProgress.watched_seconds > 0) {
          videoRef.current.currentTime = savedProgress.watched_seconds;
          setCurrentTime(savedProgress.watched_seconds);
        }
        videoRef.current.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata,
        );
      };
      videoRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
    }

    setActiveTab("content");
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
      if (videoRef.current && isAuthenticated && program?.is_purchased) {
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
    if (isAuthenticated) {
      safeNavigate(`/programs/${program.id}/checkout`);
    } else {
      sessionStorage.setItem("redirectAfterLogin", `/programs/${program.id}`);
      safeNavigate("/login");
    }
  };

  const handleLoginClick = () => {
    sessionStorage.setItem("redirectAfterLogin", `/programs/${program.id}`);
    safeNavigate("/login");
  };

  const getOverallProgress = () => {
    let totalWatched = 0;
    let totalDuration = 0;

    program?.lessons?.forEach((lesson) => {
      const progress = lessonProgress[lesson.id];
      if (progress) {
        totalWatched += progress.watched_seconds || 0;
      }
      if (lesson.duration_seconds) {
        totalDuration += lesson.duration_seconds;
      }
    });

    if (totalDuration === 0) {
      return program?.lessons?.length > 0
        ? Math.round((completedLessons.length / program.lessons.length) * 100)
        : 0;
    }

    return Math.min(Math.round((totalWatched / totalDuration) * 100), 100);
  };

  useEffect(() => {
    if (program?.id) {
      const checkDone = sessionStorage.getItem(`cert_check_${program.id}`);
      const certData = sessionStorage.getItem(`cert_data_${program.id}`);

      if (checkDone === "true" && certData) {
        try {
          const data = JSON.parse(certData);
          setCertificateData(data);
          // console.log(
          //   data,
          //   "-----------------certificate data-----------------------",
          // );
          setIsEligibleForCertificate(true);
          setCertificateCheckDone(true);
          certificateCheckDoneRef.current = true;
          setIsInitialCheckDone(true);
        } catch (e) {
          console.error("Error restoring certificate data:", e);
        }
      }
    }
  }, [program?.id]);

  const checkCertificateEligibility = useCallback(async () => {
    // Prevent multiple simultaneous checks
    if (isCheckingCertificateRef.current) {
      console.log("Certificate check already in progress, skipping...");
      return false;
    }

    // Don't check if already done for this session
    if (certificateCheckDoneRef.current && certificateData) {
      console.log("Certificate check already done, skipping...");
      return true;
    }

    if (!program?.is_purchased || !isAuthenticated || !allLessonsCompleted) {
      setIsEligibleForCertificate(false);
      setCertificateCheckDone(true);
      certificateCheckDoneRef.current = true;
      if (program?.id) {
        sessionStorage.setItem(`cert_check_${program.id}`, "false");
      }
      return false;
    }

    try {
      isCheckingCertificateRef.current = true;
      console.log("Checking certificate eligibility...");

      const result = await certificateApi.checkCertificateEligibility(
        program.id,
        session,
      );

      console.log("Certificate eligibility result:", result);

      if (result.success && result.data) {
        setCertificateData(result.data);
        setIsEligibleForCertificate(true);
        setCertificateCheckDone(true);
        certificateCheckDoneRef.current = true;
        if (program?.id) {
          sessionStorage.setItem(`cert_check_${program.id}`, "true");
          sessionStorage.setItem(
            `cert_data_${program.id}`,
            JSON.stringify(result.data),
          );
        }
        return true;
      }

      if (result.needsAssessment) {
        setIsEligibleForCertificate(false);
        setCertificateCheckDone(true);
        certificateCheckDoneRef.current = true;
        if (program?.id) {
          sessionStorage.setItem(`cert_check_${program.id}`, "false");
        }
        setProgressSaveStatus("assessment_needed");
        setTimeout(() => setProgressSaveStatus(""), 5000);
        return false;
      }

      if (result.eligible) {
        setIsEligibleForCertificate(true);
        setCertificateCheckDone(true);
        certificateCheckDoneRef.current = true;
        if (program?.id) {
          sessionStorage.setItem(`cert_check_${program.id}`, "true");
        }
        await generateCertificate();
        return true;
      }

      setIsEligibleForCertificate(false);
      setCertificateCheckDone(true);
      certificateCheckDoneRef.current = true;
      if (program?.id) {
        sessionStorage.setItem(`cert_check_${program.id}`, "false");
      }
      return false;
    } catch (error) {
      console.error("Error checking certificate eligibility:", error);
      setIsEligibleForCertificate(false);
      setCertificateCheckDone(true);
      certificateCheckDoneRef.current = true;
      return false;
    } finally {
      isCheckingCertificateRef.current = false;
    }
  }, [program, isAuthenticated, allLessonsCompleted, session]);

  useEffect(() => {
    // Skip if already checked in this session
    if (certificateCheckDoneRef.current || isInitialCheckDone) {
      return;
    }

    if (
      allLessonsCompleted &&
      program?.is_purchased &&
      isAuthenticated &&
      !isCheckingCertificateRef.current
    ) {
      console.log("Triggering certificate eligibility check from useEffect");
      checkCertificateEligibility();
    } else if (
      !allLessonsCompleted ||
      !program?.is_purchased ||
      !isAuthenticated
    ) {
      // Clear session storage when conditions are not met
      if (program?.id) {
        sessionStorage.removeItem(`cert_check_${program.id}`);
        sessionStorage.removeItem(`cert_data_${program.id}`);
      }
      setCertificateCheckDone(false);
      setIsEligibleForCertificate(false);
      setCertificateData(null);
      certificateCheckDoneRef.current = false;
      setIsInitialCheckDone(false);
    }
  }, [
    allLessonsCompleted,
    program?.is_purchased,
    isAuthenticated,
    program?.id,
  ]);

  // Manual refresh function
  const refreshCertificateStatus = useCallback(async () => {
    certificateCheckDoneRef.current = false;
    setIsInitialCheckDone(false);
    setCertificateCheckDone(false);
    if (program?.id) {
      sessionStorage.removeItem(`cert_check_${program.id}`);
      sessionStorage.removeItem(`cert_data_${program.id}`);
    }
    await checkCertificateEligibility();
  }, [checkCertificateEligibility, program?.id]);

  // Generate certificate
const generateCertificate = async () => {
  if (isGeneratingCertificate) return;

  setIsGeneratingCertificate(true);
  try {
    // First try to get existing certificate
    const existingResult = await certificateApi.getMyCertificate(
      program.id,
      session
    );

    if (existingResult.success && existingResult.data) {
      setCertificateData(existingResult.data);
      setProgressSaveStatus("certificate_exists");
      setTimeout(() => setProgressSaveStatus(""), 3000);
      // Navigate to certificate page
      if (existingResult.data.certificate_code) {
        router.push(`/certificates/${existingResult.data.certificate_code}`);
      }
      setIsGeneratingCertificate(false);
      return;
    }

    // If no existing certificate, check eligibility
    const eligibilityResult = await certificateApi.checkCertificateEligibility(
      program.id,
      session
    );

    // console.log("Generate certificate - eligibility:", eligibilityResult);

    if (eligibilityResult.needsAssessment) {
      setProgressSaveStatus("assessment_needed");
      setTimeout(() => setProgressSaveStatus(""), 3000);
      alert(
        "You need to complete and pass the assessment first before you can generate a certificate."
      );
      setIsGeneratingCertificate(false);
      return;
    }

    if (!eligibilityResult.eligible) {
      setProgressSaveStatus("certificate_not_eligible");
      setTimeout(() => setProgressSaveStatus(""), 3000);
      setIsGeneratingCertificate(false);
      return;
    }

    // Try to get certificate again after eligibility check
    const retryResult = await certificateApi.getMyCertificate(
      program.id,
      session
    );

    if (retryResult.success && retryResult.data) {
      setCertificateData(retryResult.data);
      setProgressSaveStatus("certificate_generated");
      setTimeout(() => setProgressSaveStatus(""), 3000);
      // Store in session
      if (program?.id) {
        sessionStorage.setItem(`cert_check_${program.id}`, "true");
        sessionStorage.setItem(
          `cert_data_${program.id}`,
          JSON.stringify(retryResult.data)
        );
      }
      // Navigate to certificate page
      if (retryResult.data.certificate_code) {
        router.push(`/certificates/${retryResult.data.certificate_code}`);
      }
    } else {
      setProgressSaveStatus("certificate_generation_failed");
      setTimeout(() => setProgressSaveStatus(""), 3000);
      alert("Certificate generation failed. Please contact support.");
    }
  } catch (error) {
    console.error("Error generating certificate:", error);
    setProgressSaveStatus("certificate_error");
    setTimeout(() => setProgressSaveStatus(""), 3000);
  } finally {
    setIsGeneratingCertificate(false);
  }
};


// Share certificate
const handleShareCertificate = async () => {
  if (!certificateData?.certificate_code) return;

  const shareUrl = `${window.location.origin}/certificates/${certificateData.certificate_code}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Certificate of Completion",
        text: `I earned a certificate for ${program?.title}!`,
        url: shareUrl,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  } else {
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setProgressSaveStatus("link_copied");
      setTimeout(() => setProgressSaveStatus(""), 2000);
    } catch (error) {
      console.error("Copy error:", error);
    }
  }
};

  // Loading state
  if (!isClient || status === "loading") {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#D4A574]/30 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-[#CC0000] rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#D4A574]/30 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-[#CC0000] rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">
          Loading program details...
        </p>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto p-6 bg-white shadow-lg border border-[#D4A574]/30">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#CC0000]/10 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-[#CC0000]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Program not found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The program you're looking for doesn't exist."}
          </p>
          <Link
            href="/programs"
            className="inline-flex items-center px-6 py-3 bg-[#CC0000] text-white hover:bg-[#B30000] transition-colors"
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
  const isLessonCompleted =
    selectedLesson && completedLessons.includes(selectedLesson.id);

  return (
    <>
      <div className="min-h-screen bg-[#FDF8F0]">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-[#D4A574]/20 sticky top-0 z-40 shadow-sm">
          <div className="max-w-screen-2xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/")}
                  className="text-gray-600 hover:text-[#CC0000] transition-colors p-1"
                  aria-label="Go back"
                >
                  <ArrowLeft size={22} />
                </button>
                <h1 className="text-sm sm:text-lg font-semibold text-gray-900 truncate max-w-30 sm:max-w-md">
                  {program.title}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                {!isAuthenticated ? (
                  <button
                    onClick={handleLoginClick}
                    className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#CC0000] text-white text-xs sm:text-sm hover:bg-[#B30000] transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Login</span>
                  </button>
                ) : isLessonPurchased ? (
                  <span className="text-xs sm:text-sm bg-green-100 text-green-700 px-2 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Enrolled</span>
                  </span>
                ) : (
                  <button
                    onClick={handleEnrollClick}
                    className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#CC0000] text-white text-xs sm:text-sm hover:bg-[#B30000] transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Enroll Now</span>
                  </button>
                )}
                <button
                  onClick={toggleSidebar}
                  className="p-2 hover:bg-[#FDF8F0] transition-colors lg:hidden"
                  aria-label="Toggle sidebar"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-screen-2xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Left Sidebar */}
            <div
              className={`${
                isSidebarOpen ? "fixed inset-0 z-50 bg-black/50" : "hidden"
              } lg:relative lg:block lg:bg-transparent lg:z-auto`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <div
                className={`${
                  isSidebarOpen
                    ? "fixed left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-xl animate-slide-in"
                    : "hidden"
                } lg:relative lg:block lg:w-80 xl:w-96 lg:shadow-none lg:animate-none`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-[#D4A574]/20 lg:hidden">
                  <h2 className="font-semibold text-gray-900">
                    Course Content
                  </h2>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 hover:bg-[#FDF8F0]"
                    aria-label="Close sidebar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-white shadow-lg overflow-hidden sticky top-20 max-h-[calc(100vh-120px)] flex flex-col">
                  <div className="p-3 sm:p-4 border-b border-[#D4A574]/20 bg-gradient-to-r from-[#FDF8F0] to-white shrink-0">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold text-gray-900 text-sm sm:text-base">
                        Course Content
                      </h2>
                      <span className="text-xs sm:text-sm text-gray-500">
                        {program.lessons?.length || 0} lessons
                      </span>
                    </div>
                    {loadingProgress && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <Loader2 className="w-3 h-3 animate-spin text-[#CC0000]" />
                        Loading progress...
                      </div>
                    )}
                    {!isAuthenticated && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 ">
                        <Lock className="w-3 h-3" />
                        Login to access course content
                      </div>
                    )}
                  </div>

                  <div className="overflow-y-auto flex-1 p-2">
                    {program.lessons && program.lessons.length > 0 ? (
                      <div className="space-y-1">
                        {program.lessons.map((lesson, index) => {
                          const isSelected = selectedLesson?.id === lesson.id;
                          const isLocked =
                            !isLessonPurchased &&
                            !lesson.is_free_preview &&
                            isAuthenticated;
                          const isFreePreview = lesson.is_free_preview;
                          const isCompleted = completedLessons.includes(
                            lesson.id,
                          );
                          const hasVideo =
                            lesson.video_url || lesson.external_video_url;
                          const hasPdf = lesson.pdf_url;
                          const progressPercent = getLessonProgressPercentage(
                            lesson.id,
                          );
                          const showLock = !isAuthenticated || isLocked;

                          return (
                            <div
                              key={lesson.id || index}
                              onClick={() => {
                                if (!showLock || isFreePreview) {
                                  selectLesson(lesson);
                                  setIsSidebarOpen(false);
                                }
                              }}
                              className={`flex items-start gap-2 sm:gap-3 p-2 sm:p-3 transition-all cursor-pointer ${
                                !showLock || isFreePreview
                                  ? "hover:bg-[#FDF8F0]"
                                  : "cursor-not-allowed opacity-60"
                              } ${
                                isSelected
                                  ? "bg-[#FDF8F0] border-2 border-[#CC0000] shadow-sm"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <div className="shrink-0">
                                {isCompleted ? (
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                  </div>
                                ) : showLock && !isFreePreview ? (
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center">
                                    <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                                  </div>
                                ) : (
                                  <div
                                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                                      isSelected
                                        ? "bg-[#CC0000] text-white"
                                        : "bg-gray-200 text-gray-600"
                                    }`}
                                  >
                                    {index + 1}
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                  <h4
                                    className={`text-xs sm:text-sm font-medium ${
                                      isSelected
                                        ? "text-[#CC0000]"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {lesson.title}
                                  </h4>
                                  {isFreePreview && (
                                    <span className="text-[8px] sm:text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5">
                                      Preview
                                    </span>
                                  )}
                                </div>

                                {isLessonPurchased &&
                                  !showLock &&
                                  progressPercent > 0 &&
                                  !isCompleted && (
                                    <div className="mt-1">
                                      <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-[#CC0000] rounded-full transition-all duration-300"
                                          style={{
                                            width: `${Math.min(progressPercent, 100)}%`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}

                                <div className="flex items-center gap-2 sm:gap-3 mt-1 text-[10px] sm:text-xs text-gray-500 flex-wrap">
                                  {hasVideo && (
                                    <span className="flex items-center gap-0.5 sm:gap-1">
                                      <Video className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                      <span className="hidden xs:inline">
                                        Video
                                      </span>
                                    </span>
                                  )}
                                  {hasPdf && (
                                    <span className="flex items-center gap-0.5 sm:gap-1">
                                      <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                      <span className="hidden xs:inline">
                                        PDF
                                      </span>
                                    </span>
                                  )}
                                  {lesson.duration_seconds && (
                                    <span className="flex items-center gap-0.5 sm:gap-1">
                                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                      {Math.floor(lesson.duration_seconds / 60)}
                                      m
                                    </span>
                                  )}
                                  {!isAuthenticated && (
                                    <span className="text-amber-600 flex items-center gap-0.5">
                                      <Lock className="w-2.5 h-2.5" />
                                      Locked
                                    </span>
                                  )}
                                  {isCompleted && (
                                    <span className="text-green-600 bg-green-50 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-medium">
                                      Completed
                                    </span>
                                  )}
                                </div>
                              </div>

                              {!showLock || isFreePreview ? (
                                <div className="shrink-0 mt-0.5">
                                  {isSelected ? (
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#CC0000] text-white rounded-full flex items-center justify-center">
                                      <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </div>
                                  ) : isCompleted ? (
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 text-green-600">
                                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                  ) : (
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400">
                                      {hasVideo ? (
                                        <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                                      ) : hasPdf ? (
                                        <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                                      ) : (
                                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="shrink-0 mt-0.5">
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 flex items-center justify-center">
                                    <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                                  </div>
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

                  {isLessonPurchased &&
                    program.lessons?.length > 0 &&
                    isAuthenticated && (
                      <div className="p-3 sm:p-4 border-t border-[#D4A574]/20 bg-[#FDF8F0] flex-shrink-0">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">
                            Progress: {completedLessons.length}/
                            {program.lessons.length}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">
                              {getOverallProgress()}%
                            </span>
                            {progressSaveStatus === "saving" && (
                              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-[#CC0000] animate-spin" />
                            )}
                            {progressSaveStatus === "saved" && (
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                            )}
                            {progressSaveStatus === "error" && (
                              <X className="w-3 h-3 sm:w-4 sm:h-4 text-[#CC0000]" />
                            )}
                          </div>
                        </div>
                        <div className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-full mt-1.5 sm:mt-2 overflow-hidden">
                          <div
                            className="h-full bg-[#CC0000] rounded-full transition-all duration-300"
                            style={{ width: `${getOverallProgress()}%` }}
                          />
                        </div>
                      </div>
                    )}

                  {!isAuthenticated && (
                    <div className="p-3 sm:p-4 border-t border-[#D4A574]/20 bg-gradient-to-r from-amber-50 to-amber-100 flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-200 rounded-full">
                          <Lock className="w-4 h-4 text-amber-700" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm font-medium text-amber-800">
                            Login to access course content
                          </p>
                          <p className="text-[10px] sm:text-xs text-amber-600">
                            Sign in to track your progress and access all
                            lessons
                          </p>
                        </div>
                        <button
                          onClick={handleLoginClick}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#CC0000] text-white text-xs sm:text-sm hover:bg-[#B30000] transition-colors whitespace-nowrap"
                        >
                          Login Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 min-w-0">
              {isLessonPurchased && isAuthenticated ? (
                <div className="bg-white shadow-lg overflow-hidden border border-[#D4A574]/20">
                  {/* Tab Navigation */}
                  <div className="flex border-b border-[#D4A574]/20 bg-[#FDF8F0]/50">
                    <button
                      onClick={() => setActiveTab("content")}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                        activeTab === "content"
                          ? "text-[#CC0000] border-b-2 border-[#CC0000]"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      Content
                    </button>

                    <button
                      onClick={() => setActiveTab("assessment")}
                      disabled={!allLessonsCompleted}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                        activeTab === "assessment"
                          ? "text-[#CC0000] border-b-2 border-[#CC0000]"
                          : allLessonsCompleted
                            ? "text-gray-500 hover:text-gray-700"
                            : "text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      Assessment
                      {!allLessonsCompleted && (
                        <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 ml-1">
                          Locked
                        </span>
                      )}
                      {allLessonsCompleted &&
                        assessmentData &&
                        assessmentData.length > 0 && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 ml-1">
                            {
                              assessmentData.filter(
                                (a) => a.attempt?.passed === true,
                              ).length
                            }
                            /{assessmentData.length}
                          </span>
                        )}
                    </button>

                    {/* Certificate Tab - Show only if user is enrolled and all lessons completed */}
                    {isLessonPurchased &&
                      isAuthenticated &&
                      allLessonsCompleted && (
                        <button
                          onClick={() => setActiveTab("certificate")}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                            activeTab === "certificate"
                              ? "text-[#CC0000] border-b-2 border-[#CC0000]"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          <Award className="w-4 h-4" />
                          Certificate
                          {certificateData ? (
                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 ml-1">
                              ✓ Ready
                            </span>
                          ) : isEligibleForCertificate ? (
                            <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 ml-1">
                              Available
                            </span>
                          ) : (
                            <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 ml-1">
                              Locked
                            </span>
                          )}
                        </button>
                      )}
                  </div>
                  {/* Content Tab */}
                  {activeTab === "content" && (
                    <>
                      {selectedLesson && hasBothVideoAndPdf && (
                        <div className="flex items-center gap-2 p-2 bg-[#FDF8F0] border-b border-[#D4A574]/20 overflow-x-auto">
                          <button
                            onClick={() => switchContentView("video")}
                            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                              contentViewMode === "video"
                                ? "bg-[#CC0000] text-white"
                                : "bg-white text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Video
                          </button>
                          <button
                            onClick={() => switchContentView("pdf")}
                            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                              contentViewMode === "pdf"
                                ? "bg-[#CC0000] text-white"
                                : "bg-white text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            PDF
                          </button>
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
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                                <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
                                <p className="text-sm sm:text-base">
                                  No PDF available for this lesson
                                </p>
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
                                src={selectedLesson.video_url}
                                poster={program.thumbnail_url}
                                onClick={togglePlay}
                                playsInline
                              >
                                Your browser does not support the video tag.
                              </video>

                              {/* Progress overlay */}
                              {lessonProgress[selectedLesson?.id] && (
                                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black/70 text-white text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1">
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
                                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-black/70 text-white text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 ">
                                  {playbackRate}x
                                </div>
                              )}

                              {/* Center Play/Pause Button */}
                              {(showControls || !isPlaying) && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <button
                                    onClick={togglePlay}
                                    className="pointer-events-auto bg-black/50 hover:bg-black/70 rounded-full p-3 sm:p-4 transition-all duration-200 transform hover:scale-110"
                                    aria-label={isPlaying ? "Pause" : "Play"}
                                  >
                                    {isPlaying ? (
                                      <Pause className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                                    ) : (
                                      <Play className="w-8 h-8 sm:w-12 sm:h-12 text-white ml-0.5 sm:ml-1" />
                                    )}
                                  </button>
                                </div>
                              )}

                              {/* Skip buttons */}
                              {showControls && (
                                <>
                                  <button
                                    onClick={skipBackward}
                                    className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-2 sm:p-3 transition-all duration-200"
                                    aria-label="Skip backward 10 seconds"
                                  >
                                    <Rewind className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                                    <span className="absolute -bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2 text-white text-[8px] sm:text-[10px]">
                                      10s
                                    </span>
                                  </button>
                                  <button
                                    onClick={skipForward}
                                    className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-2 sm:p-3 transition-all duration-200"
                                    aria-label="Skip forward 10 seconds"
                                  >
                                    <FastForward className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                                    <span className="absolute -bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2 text-white text-[8px] sm:text-[10px]">
                                      10s
                                    </span>
                                  </button>
                                </>
                              )}

                              {/* Video Controls Overlay */}
                              <div
                                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-4 transition-opacity duration-300 ${
                                  showControls ? "opacity-100" : "opacity-0"
                                }`}
                              >
                                {/* Progress Bar */}
                                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                  <span className="text-white text-[10px] sm:text-xs font-mono">
                                    {formatTime(currentTime)}
                                  </span>
                                  <input
                                    type="range"
                                    min="0"
                                    max={duration || 100}
                                    value={currentTime}
                                    onChange={handleSeek}
                                    className="flex-1 h-1 bg-white/30 appearance-none cursor-pointer hover:h-1.5 transition-all
                                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 sm:[&::-webkit-slider-thumb]:w-3 sm:[&::-webkit-slider-thumb]:h-3 
                                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#CC0000]"
                                    aria-label="Video progress"
                                  />
                                  <span className="text-white text-[10px] sm:text-xs font-mono">
                                    {formatTime(duration)}
                                  </span>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1 sm:gap-2">
                                    <button
                                      onClick={togglePlay}
                                      className="text-white hover:text-[#CC0000] transition-colors p-1"
                                      aria-label={isPlaying ? "Pause" : "Play"}
                                    >
                                      {isPlaying ? (
                                        <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                                      ) : (
                                        <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                                      )}
                                    </button>
                                    <button
                                      onClick={skipBackward}
                                      className="text-white hover:text-[#CC0000] transition-colors p-1 hidden sm:block"
                                      aria-label="Skip backward 10 seconds"
                                    >
                                      <Rewind className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                    <button
                                      onClick={skipForward}
                                      className="text-white hover:text-[#CC0000] transition-colors p-1 hidden sm:block"
                                      aria-label="Skip forward 10 seconds"
                                    >
                                      <FastForward className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                    <div className="flex items-center gap-1 sm:gap-2">
                                      <button
                                        onClick={toggleMute}
                                        className="text-white hover:text-[#CC0000] transition-colors p-1"
                                        aria-label={isMuted ? "Unmute" : "Mute"}
                                      >
                                        {isMuted ? (
                                          <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                                        ) : (
                                          <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                        )}
                                      </button>
                                      <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={volume}
                                        onChange={handleVolumeChange}
                                        className="w-12 sm:w-20 h-1 bg-white/30 appearance-none cursor-pointer
                                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 
                                        [&::-webkit-slider-thumb]:h-2.5 sm:[&::-webkit-slider-thumb]:w-3 sm:[&::-webkit-slider-thumb]:h-3 
                                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#CC0000]"
                                        aria-label="Volume"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 sm:gap-2">
                                    {/* Playback Speed */}
                                    <div className="relative">
                                      <button
                                        onClick={() =>
                                          setShowSpeedMenu(!showSpeedMenu)
                                        }
                                        className="text-white hover:text-[#CC0000] transition-colors p-1 flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-sm"
                                        aria-label="Playback speed"
                                      >
                                        <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="hidden xs:inline">
                                          {playbackRate}x
                                        </span>
                                      </button>

                                      {showSpeedMenu && (
                                        <div className="absolute bottom-full right-0 mb-2 bg-gray-800 shadow-lg p-1 min-w-[100px] sm:min-w-[120px] z-50">
                                          {speedOptions.map((speed) => (
                                            <button
                                              key={speed}
                                              onClick={() =>
                                                changePlaybackSpeed(speed)
                                              }
                                              className={`w-full text-left px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm transition-colors ${
                                                playbackRate === speed
                                                  ? "bg-[#CC0000] text-white"
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
                                      className="text-white hover:text-[#CC0000] transition-colors p-1"
                                      aria-label={
                                        isFullscreen
                                          ? "Exit fullscreen"
                                          : "Enter fullscreen"
                                      }
                                    >
                                      {isFullscreen ? (
                                        <Minimize className="w-4 h-4 sm:w-5 sm:h-5" />
                                      ) : (
                                        <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Keyboard shortcuts hint */}
                              {showControls && (
                                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/50 text-[8px] sm:text-xs hidden md:block whitespace-nowrap">
                                  Space: Play/Pause • ← →: Skip 10s • F:
                                  Fullscreen • M: Mute
                                </div>
                              )}
                            </div>
                          )}

                        {/* No content available */}
                        {(!selectedLesson ||
                          (!selectedLesson.video_url &&
                            !selectedLesson.external_video_url &&
                            !selectedLesson.pdf_url)) && (
                          <div className="relative w-full aspect-video bg-gray-900 flex items-center justify-center p-4">
                            <div className="text-center text-white">
                              {program.lessons && program.lessons.length > 0 ? (
                                <>
                                  <Video className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50" />
                                  <p className="text-base sm:text-lg font-medium">
                                    Select a lesson to start learning
                                  </p>
                                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                                    Choose a lesson from the curriculum
                                  </p>
                                </>
                              ) : (
                                <>
                                  <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50" />
                                  <p className="text-base sm:text-lg font-medium">
                                    No lessons available
                                  </p>
                                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
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
                        <div className="p-3 sm:p-4 border-t border-[#D4A574]/20">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                                  {selectedLesson.title}
                                </h3>
                                {selectedLesson.video_url && (
                                  <span className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 sm:px-2 sm:py-0.5">
                                    <Video className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    Video
                                  </span>
                                )}
                                {selectedLesson.pdf_url && (
                                  <span className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs bg-green-50 text-green-600 px-1.5 py-0.5 sm:px-2 sm:py-0.5">
                                    <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    PDF
                                  </span>
                                )}
                                {isLessonCompleted && (
                                  <span className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs bg-green-100 text-green-700 px-1.5 py-0.5 sm:px-2 sm:py-0.5">
                                    <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    Completed
                                  </span>
                                )}
                              </div>

                              {selectedLesson.description && (
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                  {selectedLesson.description}
                                </p>
                              )}

                              {/* Progress Display */}
                              {isAuthenticated && isLessonPurchased && (
                                <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs">
                                  <span className="text-gray-500">
                                    Progress:
                                  </span>
                                  <span className="font-medium text-[#CC0000]">
                                    {(() => {
                                      const progress =
                                        lessonProgress[selectedLesson.id];
                                      if (
                                        !progress ||
                                        !selectedLesson.duration_seconds
                                      )
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
                                    <Loader2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#CC0000] animate-spin" />
                                  )}
                                  {progressSaveStatus === "saved" && (
                                    <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" />
                                  )}
                                  {progressSaveStatus === "error" && (
                                    <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#CC0000]" />
                                  )}
                                  <span className="text-gray-400">
                                    (
                                    {formatTime(
                                      lessonProgress[selectedLesson.id]
                                        ?.watched_seconds || 0,
                                    )}{" "}
                                    /{" "}
                                    {formatTime(
                                      selectedLesson.duration_seconds || 0,
                                    )}
                                    )
                                  </span>
                                </div>
                              )}

                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-[10px] sm:text-xs text-gray-500">
                                {selectedLesson.duration_seconds && (
                                  <span className="flex items-center gap-0.5 sm:gap-1">
                                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
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

                            <div className="flex flex-wrap gap-2 sm:gap-2">
                              {selectedLesson.pdf_url &&
                                contentViewMode === "video" && (
                                  <button
                                    onClick={() => switchContentView("pdf")}
                                    className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[#fdf2e6] text-[#CC0000] text-xs sm:text-sm hover:bg-[#f7e4cd] transition-colors flex items-center gap-1"
                                  >
                                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span className="hidden xs:inline">
                                      PDF
                                    </span>
                                  </button>
                                )}
                              {(selectedLesson.video_url ||
                                selectedLesson.external_video_url) &&
                                contentViewMode === "pdf" && (
                                  <button
                                    onClick={() => switchContentView("video")}
                                    className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[#CC0000] text-white text-xs sm:text-sm hover:bg-[#B30000] transition-colors flex items-center gap-1"
                                  >
                                    <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span className="hidden xs:inline">
                                      Video
                                    </span>
                                  </button>
                                )}
                              {isAuthenticated &&
                                isLessonPurchased &&
                                selectedLesson &&
                                (!isLessonCompleted ? (
                                  <button
                                    onClick={handleMarkComplete}
                                    disabled={
                                      isMarkingComplete || isUpdatingProgress
                                    }
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white text-xs sm:text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                  >
                                    {isMarkingComplete ? (
                                      <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                                    ) : (
                                      <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    )}
                                    <span>Mark Completed</span>
                                  </button>
                                ) : (
                                  <button
                                    disabled
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-400 text-white text-xs sm:text-sm cursor-not-allowed flex items-center gap-1.5"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span>Completed</span>
                                  </button>
                                ))}
                              {isLessonPurchased && isAuthenticated && (
                                <button
                                  onClick={() => {
                                    const currentIndex =
                                      program.lessons.findIndex(
                                        (l) => l.id === selectedLesson.id,
                                      );
                                    if (
                                      currentIndex <
                                      program.lessons.length - 1
                                    ) {
                                      if (
                                        currentTime > 0 &&
                                        !isLessonCompleted
                                      ) {
                                        saveProgress(currentTime, false);
                                      }
                                      selectLesson(
                                        program.lessons[currentIndex + 1],
                                      );
                                    }
                                  }}
                                  disabled={
                                    program.lessons.findIndex(
                                      (l) => l.id === selectedLesson.id,
                                    ) ===
                                    program.lessons.length - 1
                                  }
                                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#CC0000] text-white text-xs sm:text-sm hover:bg-[#B30000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                  Next →
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {activeTab === "assessment" && (
                    <div className="p-4 sm:p-6">
                      {allLessonsCompleted ? (
                        assessmentData && assessmentData.length > 0 ? (
                          <div className="space-y-4 sm:space-y-6">
                            <div className="flex items-center gap-3">
                              <ClipboardCheck className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                              <div>
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                                  Course Assessments
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Complete all assessments to earn your
                                  certificate
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {assessmentData.map((assessment) => {
                                const hasAttempt =
                                  assessment.attempt !== null &&
                                  assessment.attempt !== undefined;
                                const attempt = assessment.attempt || {};
                                const isCompleted =
                                  hasAttempt &&
                                  attempt.submitted_at !== null &&
                                  attempt.submitted_at !== undefined;
                                const isPending =
                                  isCompleted &&
                                  attempt.review_status === "pending";
                                const isGraded =
                                  isCompleted &&
                                  (attempt.review_status === "graded" ||
                                    (attempt.score !== null &&
                                      attempt.score !== undefined));
                                const score =
                                  attempt.score !== null &&
                                  attempt.score !== undefined
                                    ? attempt.score
                                    : null;
                                const passed =
                                  attempt.passed !== null &&
                                  attempt.passed !== undefined
                                    ? attempt.passed
                                    : null;

                                return (
                                  <div
                                    key={assessment.id}
                                    className="bg-[#FDF8F0] p-4 sm:p-6 border border-[#D4A574]/30 hover:shadow-md transition-shadow"
                                  >
                                    <div className="flex items-start gap-3">
                                      {assessment.type === "mcq" ? (
                                        <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 text-[#CC0000] flex-shrink-0 mt-1" />
                                      ) : (
                                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#CC0000] flex-shrink-0 mt-1" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                                            {assessment.title}
                                          </h4>
                                          <span
                                            className={`text-[10px] px-2 py-0.5 font-medium ${
                                              assessment.type === "mcq"
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-purple-100 text-purple-700"
                                            }`}
                                          >
                                            {assessment.type === "mcq"
                                              ? "MCQ"
                                              : "PDF Task"}
                                          </span>

                                          {isCompleted &&
                                            (isGraded ? (
                                              <span
                                                className={`text-[10px] px-2 py-0.5 font-medium ${
                                                  passed
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                }`}
                                              >
                                                {passed
                                                  ? "✓ Passed"
                                                  : "✗ Failed"}
                                              </span>
                                            ) : isPending ? (
                                              <span className="text-[10px] px-2 py-0.5 font-medium bg-yellow-100 text-yellow-700">
                                                ⏳ Pending Review
                                              </span>
                                            ) : (
                                              <span className="text-[10px] px-2 py-0.5 font-medium bg-blue-100 text-blue-700">
                                                Submitted
                                              </span>
                                            ))}
                                        </div>

                                        <div className="mt-2 space-y-1 text-xs sm:text-sm text-gray-600">
                                          {assessment.type === "mcq" && (
                                            <>
                                              <p>
                                                📝{" "}
                                                {assessment.question_count || 0}{" "}
                                                questions
                                              </p>
                                              <p>
                                                ⏱️ {assessment.duration_minutes}{" "}
                                                minutes
                                              </p>
                                              <p>
                                                🎯 Passing score:{" "}
                                                {assessment.passing_score}%
                                              </p>
                                            </>
                                          )}
                                          {assessment.type === "pdf_task" && (
                                            <>
                                              <p>📄 PDF template available</p>
                                              <p>
                                                ⏱️ {assessment.duration_minutes}{" "}
                                                minutes
                                              </p>
                                              <p>
                                                🎯 Passing score:{" "}
                                                {assessment.passing_score}%
                                              </p>
                                            </>
                                          )}
                                          {assessment.instructions && (
                                            <p className="text-gray-500 text-xs mt-1">
                                              📋 {assessment.instructions}
                                            </p>
                                          )}
                                        </div>

                                        {isCompleted && (
                                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                                            {score !== null &&
                                              score !== undefined && (
                                                <span
                                                  className={`font-medium ${
                                                    score >=
                                                    assessment.passing_score
                                                      ? "text-green-600"
                                                      : "text-[#CC0000]"
                                                  }`}
                                                >
                                                  Score: {score}%
                                                </span>
                                              )}
                                            {attempt.submitted_at && (
                                              <span className="text-gray-400">
                                                Submitted:{" "}
                                                {new Date(
                                                  attempt.submitted_at,
                                                ).toLocaleDateString("en-US", {
                                                  month: "short",
                                                  day: "numeric",
                                                  year: "numeric",
                                                })}
                                                <span className="text-gray-300 ml-1">
                                                  at{" "}
                                                  {new Date(
                                                    attempt.submitted_at,
                                                  ).toLocaleTimeString(
                                                    "en-US",
                                                    {
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                    },
                                                  )}
                                                </span>
                                              </span>
                                            )}
                                            {isPending && (
                                              <span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 text-[10px]">
                                                Awaiting instructor review
                                              </span>
                                            )}
                                          </div>
                                        )}

                                        <div className="mt-3 flex flex-wrap gap-2">
                                          {assessment.type === "pdf_task" &&
                                            assessment.pdf_template_url && (
                                              <a
                                                href={
                                                  assessment.pdf_template_url
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1.5 bg-[#FDF8F0] border border-[#D4A574]/30 text-gray-700 text-xs sm:text-sm hover:bg-[#F5E6D3] transition-colors flex items-center gap-1.5"
                                              >
                                                <FileText className="w-3.5 h-3.5" />
                                                Download Template
                                              </a>
                                            )}

                                          <button
                                            onClick={() => {
                                              // Pass the attempt data as query params
                                              const attemptData =
                                                assessment.attempt || {};
                                              const isCompleted =
                                                attemptData.submitted_at !==
                                                  null &&
                                                attemptData.submitted_at !==
                                                  undefined;
                                              const isGraded =
                                                isCompleted &&
                                                (attemptData.review_status ===
                                                  "graded" ||
                                                  attemptData.score !== null);

                                              // Build URL with attempt data
                                              let url = `/programs/${programId}/assessment?type=${assessment.type}&id=${assessment.id}`;

                                              // If completed, pass attempt data to show results directly
                                              if (isCompleted && isGraded) {
                                                url += `&view=results&score=${attemptData.score || 0}&passed=${attemptData.passed || false}&submitted_at=${attemptData.submitted_at || ""}`;
                                              } else if (
                                                isCompleted &&
                                                isPending
                                              ) {
                                                // For pending, pass status so PDF component shows pending state
                                                url += `&status=pending&submitted_at=${attemptData.submitted_at || ""}`;
                                              }

                                              router.push(url);
                                            }}
                                            className={`px-4 py-1.5 text-sm font-medium transition-colors inline-flex items-center gap-2 ${
                                              isCompleted && isGraded
                                                ? "bg-green-600 text-white hover:bg-green-700"
                                                : isCompleted && isPending
                                                  ? "bg-yellow-500 text-white hover:bg-yellow-600"
                                                  : "bg-[#CC0000] text-white hover:bg-[#B30000]"
                                            }`}
                                          >
                                            {isCompleted && isGraded ? (
                                              <>
                                                <Eye className="w-4 h-4" />
                                                Review Results
                                              </>
                                            ) : isCompleted && isPending ? (
                                              <>
                                                <Clock className="w-4 h-4" />
                                                Check Status
                                              </>
                                            ) : (
                                              <>
                                                <Play className="w-4 h-4" />
                                                Start{" "}
                                                {assessment.type === "mcq"
                                                  ? "Quiz"
                                                  : "Task"}
                                              </>
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 sm:py-12">
                            <ClipboardCheck className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-base sm:text-lg text-gray-600">
                              No assessments available for this program
                            </p>
                            <p className="text-xs sm:text-sm text-gray-400 mt-1">
                              Check back later for assessment content
                            </p>
                          </div>
                        )
                      ) : (
                        <div className="text-center py-8 sm:py-12">
                          <Lock className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3" />
                          <p className="text-base sm:text-lg text-gray-600">
                            Complete all lessons first
                          </p>
                          <p className="text-xs sm:text-sm text-gray-400 mt-1">
                            You need to complete all{" "}
                            {program.lessons?.length || 0} lessons to access the
                            assessments
                          </p>
                          <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                            <span className="text-gray-500">Progress:</span>
                            <span className="font-semibold text-[#CC0000]">
                              {completedLessons.length}/
                              {program.lessons?.length || 0}
                            </span>
                            <span className="text-gray-400">
                              ({getOverallProgress()}%)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

{/* Certificate Tab */}
{activeTab === "certificate" &&
  isLessonPurchased &&
  isAuthenticated &&
  allLessonsCompleted && (
    <div className="p-4 sm:p-6">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              Your Certificate
            </h3>
            <p className="text-sm text-gray-500">
              {certificateData
                ? "Your certificate of completion is ready!"
                : isEligibleForCertificate
                  ? "Generate your certificate of completion"
                  : "Complete all requirements to earn your certificate"}
            </p>
          </div>
        </div>

        {/* Certificate Status */}
        {!certificateCheckDone ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#CC0000]" />
            <span className="ml-3 text-gray-600">
              Checking certificate status...
            </span>
          </div>
        ) : certificateData ? (
          // Certificate Already Exists
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-2 border-green-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500 rounded-full">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 text-lg">
                    Certificate Ready!
                  </h4>
                  <p className="text-sm text-green-600">
                    Issued on{" "}
                    {new Date(
                      certificateData.issued_at || Date.now(),
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  {certificateData.certificate_code && (
                    <p className="text-xs text-gray-500 mt-1">
                      Code: {certificateData.certificate_code}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/certificates/${certificateData.certificate_code}`}
                  // target="_blank"
                  className="flex items-center gap-2 px-4 py-2 bg-[#CC0000] text-white hover:bg-[#B30000] transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Certificate
                </Link>
                <button
                  onClick={handleShareCertificate}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-black hover:bg-red-200 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Shareable Link */}
            {certificateData.certificate_code && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-sm text-gray-600 mb-2">
                  Shareable Link:
                </p>
                <div className="flex items-center gap-2 bg-white p-2 border border-green-200">
                  <code className="flex-1 text-xs text-gray-700 truncate">
                    {`${window.location.origin}/certificates/${certificateData.certificate_code}`}
                  </code>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/certificates/${certificateData.certificate_code}`;
                      navigator.clipboard.writeText(url);
                      setProgressSaveStatus("link_copied");
                      setTimeout(() => setProgressSaveStatus(""), 2000);
                    }}
                    className="px-3 py-1 text-sm text-[#CC0000] hover:bg-[#FDF8F0] transition-colors whitespace-nowrap"
                  >
                    Copy Link
                  </button>
                </div>
                {progressSaveStatus === "link_copied" && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Link copied to clipboard!
                  </p>
                )}
              </div>
            )}
          </div>
        ) : isEligibleForCertificate ? (
          // Eligible but no certificate yet
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 border-2 border-yellow-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500 rounded-full">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-800 text-lg">
                    You&apos;re Eligible!
                  </h4>
                  <p className="text-sm text-yellow-700">
                    You&apos;ve completed all requirements.
                    Generate your certificate now.
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-yellow-600">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      All lessons completed
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      All assessments passed
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={generateCertificate}
                disabled={isGeneratingCertificate}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#CC0000] to-[#E60000] text-white hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isGeneratingCertificate ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Certificate
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          // Not eligible
          <div className="bg-gray-50 p-6 border-2 border-gray-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-300 rounded-full">
                <Lock className="w-8 h-8 text-gray-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-700 text-lg">
                  Certificate Not Available
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Complete all requirements to earn your certificate.
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      All lessons completed
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span
                      className={`flex items-center gap-1 ${assessmentData?.some((a) => a.attempt?.passed === true) ? "text-green-600" : "text-yellow-600"}`}
                    >
                      {assessmentData?.some(
                        (a) => a.attempt?.passed === true,
                      ) ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                      {assessmentData?.some(
                        (a) => a.attempt?.passed === true,
                      )
                        ? "All assessments passed"
                        : "Complete all assessments with passing score"}
                    </span>
                  </div>
                  {assessmentData?.some(
                    (a) =>
                      a.attempt?.review_status === "pending",
                  ) && (
                    <div className="flex items-center gap-2 text-sm text-yellow-600">
                      <Clock className="w-4 h-4" />
                      Waiting for assessment review
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )}
                </div>
              ) : (
                // Not Enrolled or Not Authenticated - Show Program Details
                <div className="bg-white shadow-lg overflow-hidden border border-[#D4A574]/20">
                  <div className="relative">
                    {program.thumbnail_url ? (
                      <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden">
                        <img
                          src={program.thumbnail_url}
                          alt={program.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        {/* <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                          <span
                            className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full text-[10px] sm:text-sm font-semibold shadow-lg ${getStatusBadge(program.status)}`}
                          >
                            {program.status}
                          </span>
                        </div> */}
                        {hasDiscount && (
                          <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
                            <span className="px-2 sm:px-4 py-1 sm:py-2 bg-[#CC0000] text-white text-[10px] sm:text-sm font-semibold shadow-lg flex items-center gap-1 sm:gap-2">
                              <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                              {program.discount} Rs. OFF
                            </span>
                          </div>
                        )}
                        {!isAuthenticated && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="bg-white/95 backdrop-blur-sm p-4 sm:p-6 text-center max-w-sm mx-4">
                              <Lock className="w-8 h-8 sm:w-12 sm:h-12 text-amber-600 mx-auto mb-2" />
                              <p className="text-sm sm:text-base font-semibold text-gray-900">
                                Login to access this course
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                Sign in to view lessons, track progress, and
                                enroll
                              </p>
                              <button
                                onClick={handleLoginClick}
                                className="mt-3 px-4 sm:px-6 py-2 bg-[#CC0000] text-white text-sm sm:text-base hover:bg-[#B30000] transition-colors font-medium inline-flex items-center gap-2"
                              >
                                <LogIn className="w-4 h-4" />
                                Login Now
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-48 sm:h-64 bg-gradient-to-r from-[#CC0000] to-[#DC2626] flex items-center justify-center p-4">
                        <div className="text-center text-white">
                          <BookOpen className="w-12 h-12 sm:w-20 sm:h-20 mx-auto mb-2 sm:mb-4 opacity-50" />
                          <h2 className="text-xl sm:text-3xl font-bold">
                            {program.title}
                          </h2>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                      {program.title}
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                      <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-[#FDF8F0] border border-[#D4A574]/20">
                        <Calendar className="text-[#CC0000] w-4 h-4 sm:w-5 sm:h-5" />
                        <div>
                          <p className="text-[10px] sm:text-xs text-gray-500">
                            Duration
                          </p>
                          <p className="font-semibold text-gray-900 text-xs sm:text-sm">
                            {program.duration}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-[#FDF8F0] border border-[#D4A574]/20">
                        <Clock className="text-[#CC0000] w-4 h-4 sm:w-5 sm:h-5" />
                        <div>
                          <p className="text-[10px] sm:text-xs text-gray-500">
                            Mode
                          </p>
                          <p className="font-semibold text-gray-900 text-xs sm:text-sm capitalize">
                            {program.mode}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-[#FDF8F0] border border-[#D4A574]/20">
                        <GraduationCap className="text-[#CC0000] w-4 h-4 sm:w-5 sm:h-5" />
                        <div>
                          <p className="text-[10px] sm:text-xs text-gray-500">
                            Level
                          </p>
                          <p className="font-semibold text-gray-900 text-xs sm:text-sm capitalize">
                            {program.level || "Beginner"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-[#FDF8F0] border border-[#D4A574]/20">
                        <Award className="text-[#CC0000] w-4 h-4 sm:w-5 sm:h-5" />
                        <div>
                          <p className="text-[10px] sm:text-xs text-gray-500">
                            Fee
                          </p>
                          <div className="flex items-baseline gap-1 sm:gap-2">
                            <p className="font-bold text-gray-900 text-xs sm:text-sm">
                              {program.fee}
                            </p>
                            {hasDiscount && (
                              <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                                ₹{program.original_price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 sm:mb-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                        About this Program
                      </h3>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        {program.description ||
                          `The ${program.title} program offers a comprehensive curriculum designed to develop expertise in ${program.category}.`}
                      </p>
                    </div>

                    <div className="pt-4 sm:pt-6 border-t border-[#D4A574]/20">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                        <div className="text-center sm:text-left">
                          <p className="text-xs sm:text-sm text-gray-500">
                            {isAuthenticated
                              ? "Ready to enroll?"
                              : "Get started today"}
                          </p>
                          <p className="text-xl sm:text-2xl font-bold text-gray-900">
                            {program.fee}
                          </p>
                          {hasDiscount && (
                            <p className="text-xs sm:text-sm text-green-600">
                              Save ₹{savedAmount} with current discount!
                            </p>
                          )}
                        </div>

                        <button
                          onClick={
                            isAuthenticated
                              ? handleEnrollClick
                              : handleLoginClick
                          }
                          className="w-full sm:w-auto bg-[#CC0000] text-white px-6 sm:px-8 py-2.5 sm:py-3 hover:bg-[#B30000] transition-colors font-semibold shadow-md hover:shadow-lg text-sm sm:text-base flex items-center justify-center gap-2"
                        >
                          {isAuthenticated ? (
                            <>
                              <ShoppingCart className="w-4 h-4" />
                              Enroll Now
                            </>
                          ) : (
                            <>
                              <LogIn className="w-4 h-4" />
                              Login to Enroll
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Program_detail;