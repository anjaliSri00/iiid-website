// app/dashboard/page.js
"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Building,
  Calendar,
  Hash,
  Home,
  UserCheck,
  FileText,
  Settings,
  Lock,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle,
  Shield,
  ArrowRight,
  Activity,
  Clock,
  Award,
  Star,
  TrendingUp,
  Users,
  FileCheck,
  Plus,
  BookOpen,
  Video,
  File,
  Image as ImageIcon,
  X,
  Edit,
  Play,
  Download,
  Save,
  Upload,
  Trash2Icon,
} from "lucide-react";
import { toast } from "react-toastify";
import fetchApiResponse from "@/helper/api_data_store";
import sha256 from "crypto-js/sha256";
import Image from "next/image";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Password change states
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
  });

  // Course/Program states
  const [programs, setPrograms] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [showCreateProgram, setShowCreateProgram] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [programFormData, setProgramFormData] = useState({
    title: "",
    description: "",
    category: "",
    duration: "",
    level: "",
    price: "",
    discount: "",
    thumbnail: "",
    status: "draft",
    lessons: [],
    mode: "online",
  });
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [programErrors, setProgramErrors] = useState({});
  const [programSaving, setProgramSaving] = useState(false);
  const [programSuccess, setProgramSuccess] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailUploadProgress, setThumbnailUploadProgress] = useState(0);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  // Enrolled Courses States
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [enrolledCoursesLoading, setEnrolledCoursesLoading] = useState(false);

  // Lesson states
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonSaving, setLessonSaving] = useState(false);
  const [lessonErrors, setLessonErrors] = useState({});
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState(null);
  const [originalLessons, setOriginalLessons] = useState({});

  const hasAdminOrInternalRoleFromSession = () => {
    if (!session || !session.user) return false;

    const role = session.user.role;
    if (typeof role === "string") {
      return (
        role.toLowerCase() === "admin" || role.toLowerCase() === "internal"
      );
    }
    if (Array.isArray(role)) {
      return role.some(
        (r) => r.toLowerCase() === "admin" || r.toLowerCase() === "internal",
      );
    }
    return false;
  };

  const isAdmin = hasAdminOrInternalRoleFromSession();

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/dashboard");
    }
  }, [status, router]);

  // Fetch profile data and conditional data based on role
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchProfile();

      if (isAdmin) {
        // Only fetch programs for admin/internal users
        fetchPrograms();
      } else {
        // Only fetch enrolled courses for students
        fetchEnrolledCourses();
      }
    }
  }, [status, session, isAdmin]);

  const fetchProfile = async () => {
    setLoading(true);
    setProfileError(false);
    try {
      const userId = session?.user?.id;
      if (!userId) {
        toast.error("User ID not found");
        setProfileError(true);
        setLoading(false);
        return;
      }

      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/details/${userId}`,
        {
          method: "GET",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
        },
      );

      if (response.meta?.status === 200 && response.data) {
        setProfile(response.data);
        setProfileError(false);
      } else {
        console.error("Profile fetch failed:", response.meta?.message);
        toast.error(response.meta?.message || "Failed to fetch profile");
        setProfileError(true);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Something went wrong. Please try again.");
      setProfileError(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch enrolled courses from /api/v1/enrollments/my-courses
  const fetchEnrolledCourses = async () => {
    setEnrolledCoursesLoading(true);
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/enrollments/my-courses`,
        {
          method: "GET",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
        },
      );

      if (response.meta?.status === 200 && response.data) {
        const courses = Array.isArray(response.data) ? response.data : [];
        const formattedCourses = courses.map((enrollment) => ({
          enrollment_id: enrollment.enrollment_id,
          enrollment_status: enrollment.status,
          enrolled_at: enrollment.enrolled_at,
          course_id: enrollment.id,
          course_code: enrollment.course_code,
          title: enrollment.title,
          description: enrollment.description,
          original_price: enrollment.original_price,
          discount: enrollment.discount,
          final_price: enrollment.final_price,
          thumbnail_url: enrollment.thumbnail_url,
          instructor_id: enrollment.instructor_id,
          category: enrollment.category,
          level: enrollment.level,
          is_active: enrollment.is_active,
          mode: enrollment.mode,
          duration: enrollment.duration,
          created_by: enrollment.created_by,
          created_at: enrollment.created_at,
          updated_at: enrollment.updated_at,
          deleted_at: enrollment.deleted_at,
          progress: enrollment.progress || 0,
          enrollment_status: enrollment.enrollment_status || "active",
          status:enrollment.status || "published",
          certificate_issued: enrollment.certificate_issued || false,
        }));
        setEnrolledCourses(formattedCourses);
      } else {
        console.error("Enrolled courses fetch failed:", response.meta?.message);
        setEnrolledCourses([]);
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      setEnrolledCourses([]);
    } finally {
      setEnrolledCoursesLoading(false);
    }
  };

  // Fetch programs from API with lessons (Admin only)
  const fetchPrograms = async () => {
    setProgramsLoading(true);
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/list`,
        {
          method: "GET",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
        },
      );

      if (response.meta?.status === 200 && response.data) {
        const courses = Array.isArray(response.data) ? response.data : [];

        // Fetch details for each course to get lessons
        const mappedPrograms = await Promise.all(
          courses.map(async (course) => {
            try {
              const detailsResponse = await fetchApiResponse(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/details/${course.id}`,
                {
                  method: "GET",
                  headers: {
                    "Access-Token": session?.accessToken,
                    "Refresh-Token": session?.refreshToken,
                  },
                },
              );

              if (
                detailsResponse.meta?.status === 200 &&
                detailsResponse.data
              ) {
                return {
                  id: course.id,
                  title: course.title,
                  description: course.description,
                  category: course.category,
                  duration: course.duration,
                  level: course.level,
                  original_price: course.original_price,
                  discount: course.discount,
                  final_price: course.final_price,
                  thumbnail_url: course.thumbnail_url,
                  status: course.status,
                  mode: course.mode,
                  course_code: course.course_code,
                  created_at: course.created_at,
                  updated_at: course.updated_at,
                  lessons: detailsResponse.data.lessons || [],
                  ...course,
                };
              }
              return {
                ...course,
                lessons: [],
              };
            } catch (error) {
              console.error(
                `Error fetching details for course ${course.id}:`,
                error,
              );
              return {
                ...course,
                lessons: [],
              };
            }
          }),
        );

        setPrograms(mappedPrograms);
      } else {
        console.error("Programs fetch failed:", response.meta?.message);
        setPrograms([]);
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
      setPrograms([]);
    } finally {
      setProgramsLoading(false);
    }
  };

  const fetchCourseDetails = async (courseId) => {
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/details/${courseId}`,
        {
          method: "GET",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
        },
      );

      if (response.meta?.status === 200 && response.data) {
        return response.data;
      } else {
        console.error(
          "Failed to fetch course details:",
          response.meta?.message,
        );
        return null;
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
      return null;
    }
  };

  // Check password strength
  const checkPasswordStrength = (password) => {
    let score = 0;
    let feedback = [];

    if (password.length === 0) {
      return { score: 0, feedback: "", strengthText: "", strengthColor: "" };
    }

    if (password.length < 8) {
      feedback.push("Minimum 8 characters");
    } else {
      score += 1;
    }

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Include uppercase and lowercase letters");
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push("Include numbers");
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Include special characters");
    }

    let strengthText = "";
    let strengthColor = "";
    if (score <= 1) {
      strengthText = "Weak";
      strengthColor = "bg-red-500";
    } else if (score === 2) {
      strengthText = "Fair";
      strengthColor = "bg-yellow-500";
    } else if (score === 3) {
      strengthText = "Good";
      strengthColor = "bg-blue-500";
    } else if (score >= 4) {
      strengthText = "Strong";
      strengthColor = "bg-green-500";
    }

    return {
      score,
      feedback: feedback.length > 0 ? feedback.join(", ") : "Strong password!",
      strengthText,
      strengthColor,
    };
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));

    if (name === "new_password") {
      const strength = checkPasswordStrength(value);
      setPasswordStrength(strength);
    }

    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.old_password) {
      newErrors.old_password = "Current password is required";
    }

    if (!passwordData.new_password) {
      newErrors.new_password = "New password is required";
    } else if (passwordData.new_password.length < 8) {
      newErrors.new_password = "Password must be at least 8 characters";
    } else if (passwordStrength.score < 2) {
      newErrors.new_password =
        "Password is too weak. " + passwordStrength.feedback;
    }

    if (!passwordData.confirm_password) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (passwordData.new_password !== passwordData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    if (
      passwordData.old_password &&
      passwordData.new_password &&
      passwordData.old_password === passwordData.new_password
    ) {
      newErrors.new_password =
        "New password cannot be same as current password";
    }

    return newErrors;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const newErrors = validatePasswordForm();
    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    if (
      !confirm(
        "Changing your password will log you out. Do you want to continue?",
      )
    ) {
      return;
    }

    setPasswordLoading(true);
    setPasswordErrors({});
    setPasswordSuccess(false);

    try {
      const hashedOldPassword = sha256(passwordData.old_password).toString();
      const hashedNewPassword = sha256(passwordData.new_password).toString();

      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
          body: JSON.stringify({
            old_password: hashedOldPassword,
            new_password: hashedNewPassword,
            confirm_password: hashedNewPassword,
          }),
        },
      );

      if (response.meta?.status === 200) {
        setPasswordSuccess(true);
        toast.success("Password changed successfully! You will be logged out.");

        setPasswordData({
          old_password: "",
          new_password: "",
          confirm_password: "",
        });
        setPasswordStrength({
          score: 0,
          feedback: "",
          strengthText: "",
          strengthColor: "",
        });

        setTimeout(() => {
          signOut({
            redirect: true,
            callbackUrl: "/login?message=password-changed",
          });
        }, 3000);
      } else {
        let errorMessage =
          response.meta?.message || "Failed to change password";

        if (errorMessage.includes("INCORRECT_OLD_PASSWORD")) {
          errorMessage = "Current password is incorrect. Please try again.";
        } else if (errorMessage.includes("PASSWORD_IS_NOT_SET_YET")) {
          errorMessage =
            'You haven\'t set a password yet. Please use "Forgot Password" to set one.';
        }

        toast.error(errorMessage);
        setPasswordErrors({ general: errorMessage });
      }
    } catch (error) {
      console.error("Change password error:", error);
      toast.error("Something went wrong. Please try again.");
      setPasswordErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Thumbnail upload handler
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a JPEG or PNG image");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size should be less than 2MB");
      e.target.value = "";
      return;
    }

    setUploadingThumbnail(true);
    setThumbnailUploadProgress(0);
    setThumbnailFile(file);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", "course_thumbnail");

    try {
      setThumbnailUploadProgress(30);

      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/common/upload-image`,
        {
          method: "POST",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
          body: formData,
        },
      );

      setThumbnailUploadProgress(80);

      if (response.meta?.status === 200) {
        const imageUrl =
          response.data?.image_url?.url ||
          response.data?.url ||
          response.data?.imageUrl ||
          response.data?.fileUrl;

        if (imageUrl) {
          const encodedUrl = encodeURI(imageUrl);
          setProgramFormData((prev) => ({ ...prev, thumbnail: encodedUrl }));
          setThumbnailUploadProgress(100);
          toast.success("Thumbnail uploaded successfully!");
        } else {
          throw new Error("No URL returned from server");
        }
      } else {
        throw new Error(response.meta?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      toast.error("Failed to upload thumbnail");
      setProgramFormData((prev) => ({ ...prev, thumbnail: "" }));
      setThumbnailFile(null);
    } finally {
      setTimeout(() => {
        setUploadingThumbnail(false);
        setThumbnailUploadProgress(0);
      }, 1000);
    }
  };

  // Video upload handler
  const handleVideoUpload = async (e, lessonIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid video file (MP4, WebM, OGG, MOV)");
      e.target.value = "";
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size should be less than 50MB");
      e.target.value = "";
      return;
    }

    setUploadingVideo(true);
    setVideoUploadProgress(0);

    const formData = new FormData();
    formData.append("video", file);
    formData.append("type", "course_video");

    try {
      setVideoUploadProgress(30);

      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/common/upload-video`,
        {
          method: "POST",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
          body: formData,
        },
      );

      setVideoUploadProgress(80);

      if (response.meta?.status === 200) {
        const videoUrl =
          response.data?.video_url ||
          response.data?.url ||
          response.data?.fileUrl;

        if (videoUrl) {
          const encodedUrl = encodeURI(videoUrl);
          handleLessonInputChange(lessonIndex, "video_url", encodedUrl);
          setVideoUploadProgress(100);
          toast.success("Video uploaded successfully!");
          e.target.value = "";
        } else {
          throw new Error("No URL returned from server");
        }
      } else {
        throw new Error(response.meta?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("Failed to upload video");
    } finally {
      setTimeout(() => {
        setUploadingVideo(false);
        setVideoUploadProgress(0);
      }, 1000);
    }
  };

  // PDF upload handler
  const handlePdfUpload = async (e, lessonIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a valid PDF file");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size should be less than 10MB");
      e.target.value = "";
      return;
    }

    setUploadingPdf(true);
    const formData = new FormData();
    formData.append("document", file);
    formData.append("type", "lesson_pdf");

    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/common/upload-document`,
        {
          method: "POST",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
          body: formData,
        },
      );

      if (response.meta?.status === 200) {
        const pdfUrl = response.data?.url || response.data?.fileUrl;
        if (pdfUrl) {
          const encodedUrl = encodeURI(pdfUrl);
          handleLessonInputChange(lessonIndex, "pdf_url", encodedUrl);
          toast.success("PDF uploaded successfully!");
          e.target.value = "";
        } else {
          throw new Error("No URL returned from server");
        }
      } else {
        throw new Error(response.meta?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast.error("Failed to upload PDF");
    } finally {
      setUploadingPdf(false);
    }
  };

  // Lesson handlers
  const addLesson = () => {
    setProgramFormData((prev) => ({
      ...prev,
      lessons: [
        ...(prev.lessons || []),
        {
          title: "",
          description: "",
          content_type: "video",
          video_url: "",
          external_video_url: "",
          duration_seconds: "",
          lesson_order: (prev.lessons?.length || 0) + 1,
          is_free_preview: false,
          pdf_url: null,
          is_new: true,
        },
      ],
    }));
  };

  const removeLesson = async (index) => {
    const lesson = programFormData.lessons[index];

    if (lesson.id && !lesson.is_new) {
      if (!confirm("Are you sure you want to delete this lesson?")) return;

      try {
        const response = await fetchApiResponse(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/lessons/${lesson.id}`,
          {
            method: "DELETE",
            headers: {
              "Access-Token": session?.accessToken,
              "Refresh-Token": session?.refreshToken,
            },
          },
        );

        if (response.meta?.status === 200) {
          toast.success("Lesson deleted successfully!");
          setProgramFormData((prev) => ({
            ...prev,
            lessons: prev.lessons.filter((_, i) => i !== index),
          }));
        } else {
          toast.error(response.meta?.message || "Failed to delete lesson");
        }
      } catch (error) {
        console.error("Error deleting lesson:", error);
        toast.error("Failed to delete lesson");
      }
    } else {
      setProgramFormData((prev) => ({
        ...prev,
        lessons: prev.lessons.filter((_, i) => i !== index),
      }));
    }
  };

  const saveLesson = async (index) => {
    const lesson = programFormData.lessons[index];

    if (!lesson.title) {
      toast.error("Lesson title is required");
      return;
    }

    setLessonSaving(true);
    setLessonErrors({});

    try {
      let response;
      const courseId = editingProgram?.id || programFormData.courseId;
      console.log("Current lesson:", lesson);
      console.log("Editing Program:", editingProgram);
      console.log("Editing Program Lessons:", editingProgram?.lessons);

      if (lesson.id && !lesson.is_new) {
        const originalLesson = editingProgram?.lessons?.find(
          (l) => l.id === lesson.id,
        );
        console.log("Original Lesson found:", originalLesson);

        if (!originalLesson) {
          toast.error("Original lesson data not found");
          setLessonSaving(false);
          return;
        }

        const payload = {};

        if (lesson.title !== originalLesson.title) {
          payload.title = lesson.title;
        }
        if (lesson.description !== originalLesson.description) {
          payload.description = lesson.description || "";
        }
        if (lesson.content_type !== originalLesson.content_type) {
          payload.content_type = lesson.content_type || "video";
        }
        if (lesson.video_url !== originalLesson.video_url) {
          payload.video_url = lesson.video_url || "";
        }
        if (lesson.external_video_url !== originalLesson.external_video_url) {
          payload.external_video_url = lesson.external_video_url || "";
        }
        if (
          parseInt(lesson.duration_seconds || 0) !==
          parseInt(originalLesson.duration_seconds || 0)
        ) {
          payload.duration_seconds = parseInt(lesson.duration_seconds) || 0;
        }
        if (
          parseInt(lesson.lesson_order || 0) !==
          parseInt(originalLesson.lesson_order || 0)
        ) {
          payload.lesson_order = parseInt(lesson.lesson_order) || 0;
        }
        if (lesson.is_free_preview !== originalLesson.is_free_preview) {
          payload.is_free_preview = lesson.is_free_preview || false;
        }
        if (lesson.pdf_url !== originalLesson.pdf_url) {
          payload.pdf_url = lesson.pdf_url || null;
        }

        if (Object.keys(payload).length === 0) {
          toast.info("No changes to update");
          setLessonSaving(false);
          return;
        }

        response = await fetchApiResponse(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/lessons/update/${lesson.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Access-Token": session?.accessToken,
              "Refresh-Token": session?.refreshToken,
            },
            body: JSON.stringify(payload),
          },
        );
      } else {
        if (!courseId) {
          toast.error("Please save the course first before adding lessons");
          setLessonSaving(false);
          return;
        }

        const payload = {
          title: lesson.title,
          content_type: lesson.content_type || "video",
        };

        if (lesson.description) {
          payload.description = lesson.description;
        }
        if (lesson.video_url) {
          payload.video_url = lesson.video_url;
        }
        if (lesson.external_video_url) {
          payload.external_video_url = lesson.external_video_url;
        }
        if (lesson.duration_seconds && parseInt(lesson.duration_seconds) > 0) {
          payload.duration_seconds = parseInt(lesson.duration_seconds);
        }
        if (lesson.lesson_order) {
          payload.lesson_order = lesson.lesson_order;
        }
        if (
          lesson.is_free_preview !== undefined &&
          lesson.is_free_preview !== null
        ) {
          payload.is_free_preview = lesson.is_free_preview;
        }
        if (lesson.content_type === "pdf" && lesson.pdf_url) {
          payload.pdf_url = lesson.pdf_url;
        }

        response = await fetchApiResponse(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/lessons`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Access-Token": session?.accessToken,
              "Refresh-Token": session?.refreshToken,
            },
            body: JSON.stringify(payload),
          },
        );
      }

      if (response.meta?.status === 201 || response.meta?.status === 200) {
        toast.success(
          lesson.id && !lesson.is_new
            ? "Lesson updated successfully!"
            : "Lesson created successfully!",
        );

        const savedLesson = response.data;
        setProgramFormData((prev) => ({
          ...prev,
          lessons: prev.lessons.map((l, i) =>
            i === index ? { ...savedLesson, is_new: false } : l,
          ),
        }));

        if (editingProgram) {
          setEditingProgram((prev) => ({
            ...prev,
            lessons: prev.lessons.map((l) =>
              l.id === savedLesson.id ? { ...savedLesson } : l,
            ),
          }));
        }
      } else {
        let errorMessage = response.meta?.message || "Failed to save lesson";
        if (response.errors) {
          const errorMessages = Object.values(response.errors).join(", ");
          errorMessage = errorMessages || errorMessage;
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error saving lesson:", error);
      toast.error("Failed to save lesson");
    } finally {
      setLessonSaving(false);
    }
  };

  // Program handlers (Admin only)
  const handleProgramFormChange = (e) => {
    const { name, value } = e.target;
    setProgramFormData((prev) => ({ ...prev, [name]: value }));
    if (programErrors[name]) {
      setProgramErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleProgramSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!programFormData.title) newErrors.title = "Title is required";
    if (!programFormData.description)
      newErrors.description = "Description is required";
    if (!programFormData.category) newErrors.category = "Category is required";
    if (!programFormData.duration) newErrors.duration = "Duration is required";
    if (!programFormData.level) newErrors.level = "Level is required";
    if (!programFormData.price) newErrors.price = "Price is required";

    if (Object.keys(newErrors).length > 0) {
      setProgramErrors(newErrors);
      return;
    }

    setProgramSaving(true);
    setProgramSuccess(false);

    try {
      let response;
      let savedCourseId = editingProgram?.id;

      if (editingProgram) {
        const unsavedLessons = programFormData.lessons.filter(
          (lesson) => lesson.is_new,
        );

        if (unsavedLessons.length > 0) {
          const hasCourseChanges = checkForCourseChanges();

          if (hasCourseChanges) {
            await updateCourse();
          }

          savedCourseId = editingProgram.id;
          await saveUnsavedLessons(savedCourseId);

          toast.success("Program updated with new lessons!");
          setProgramSuccess(true);
          setShowCreateProgram(false);
          setEditingProgram(null);
          resetProgramForm();
          await fetchPrograms();
          setProgramSaving(false);
          return;
        }

        const changedFields = getChangedFields();

        if (Object.keys(changedFields).length > 0) {
          await updateCourse(changedFields);
          toast.success("Program updated successfully!");
          setProgramSuccess(true);
          setShowCreateProgram(false);
          setEditingProgram(null);
          resetProgramForm();
          await fetchPrograms();
        } else {
          toast.info("No changes to update");
          setShowCreateProgram(false);
          setEditingProgram(null);
          resetProgramForm();
        }
        setProgramSaving(false);
        return;
      } else {
        const payload = {
          title: programFormData.title,
          description: programFormData.description,
          category: programFormData.category,
          duration: programFormData.duration,
          level: programFormData.level,
          original_price: parseFloat(programFormData.price),
          mode: programFormData.mode || "online",
          status: programFormData.status || "draft",
        };

        if (
          programFormData.discount &&
          parseFloat(programFormData.discount) > 0
        ) {
          payload.discount = parseFloat(programFormData.discount);
        }

        if (programFormData.thumbnail) {
          payload.thumbnail_url = programFormData.thumbnail;
        }

        response = await fetchApiResponse(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/add`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Access-Token": session?.accessToken,
              "Refresh-Token": session?.refreshToken,
            },
            body: JSON.stringify(payload),
          },
        );

        if (response.meta?.status === 201) {
          savedCourseId = response.data?.id;
          setProgramFormData((prev) => ({ ...prev, courseId: savedCourseId }));

          const unsavedLessons = programFormData.lessons.filter(
            (lesson) => lesson.is_new,
          );
          if (unsavedLessons.length > 0) {
            await saveUnsavedLessons(savedCourseId);
          }

          toast.success("Program created successfully!");
          setProgramSuccess(true);
          setShowCreateProgram(false);
          setEditingProgram(null);
          resetProgramForm();
          await fetchPrograms();
        } else {
          toast.error(response.meta?.message || "Failed to create program");
        }
        setProgramSaving(false);
        return;
      }
    } catch (error) {
      console.error("Error saving program:", error);
      toast.error("Failed to save program");
      setProgramErrors({ general: "Failed to save program" });
      setProgramSaving(false);
    }
  };

  const checkForCourseChanges = () => {
    if (!editingProgram) return false;

    return (
      programFormData.title !== editingProgram.title ||
      programFormData.description !== editingProgram.description ||
      programFormData.category !== editingProgram.category ||
      programFormData.duration !== editingProgram.duration ||
      programFormData.level !== editingProgram.level ||
      parseFloat(programFormData.price) !==
        parseFloat(editingProgram.original_price) ||
      parseFloat(programFormData.discount) !==
        parseFloat(editingProgram.discount || 0) ||
      programFormData.thumbnail !== editingProgram.thumbnail_url ||
      programFormData.status !== editingProgram.status ||
      programFormData.mode !== editingProgram.mode
    );
  };

  const getChangedFields = () => {
    if (!editingProgram) return {};

    const changedFields = {};

    if (programFormData.title !== editingProgram.title) {
      changedFields.title = programFormData.title;
    }
    if (programFormData.description !== editingProgram.description) {
      changedFields.description = programFormData.description;
    }
    if (programFormData.category !== editingProgram.category) {
      changedFields.category = programFormData.category;
    }
    if (programFormData.duration !== editingProgram.duration) {
      changedFields.duration = programFormData.duration;
    }
    if (programFormData.level !== editingProgram.level) {
      changedFields.level = programFormData.level;
    }
    if (
      parseFloat(programFormData.price) !==
      parseFloat(editingProgram.original_price)
    ) {
      changedFields.original_price = parseFloat(programFormData.price);
    }
    if (
      parseFloat(programFormData.discount) !==
      parseFloat(editingProgram.discount || 0)
    ) {
      changedFields.discount = parseFloat(programFormData.discount) || 0;
    }
    if (programFormData.thumbnail !== editingProgram.thumbnail_url) {
      changedFields.thumbnail_url = programFormData.thumbnail || "";
    }
    if (programFormData.status !== editingProgram.status) {
      changedFields.status = programFormData.status;
    }
    if (programFormData.mode !== editingProgram.mode) {
      changedFields.mode = programFormData.mode || "online";
    }

    return changedFields;
  };

  const updateCourse = async (changedFields) => {
    if (!editingProgram || Object.keys(changedFields).length === 0) return;

    const response = await fetchApiResponse(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/update/${editingProgram.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Access-Token": session?.accessToken,
          "Refresh-Token": session?.refreshToken,
        },
        body: JSON.stringify(changedFields),
      },
    );

    if (response.meta?.status !== 200) {
      throw new Error(response.meta?.message || "Failed to update program");
    }
  };

  const handleLessonInputChange = (index, field, value) => {
    setProgramFormData((prev) => ({
      ...prev,
      lessons: prev.lessons.map((lesson, i) =>
        i === index ? { ...lesson, [field]: value } : lesson,
      ),
    }));
  };

  const updateLesson = async (index) => {
    const lesson = programFormData.lessons[index];

    if (!lesson.title) {
      toast.error("Lesson title is required");
      return;
    }

    if (!lesson.id || lesson.is_new) {
      toast.error("Please save the lesson first");
      return;
    }

    setLessonSaving(true);
    setLessonErrors({});

    try {
      const originalLesson = originalLessons[lesson.id];

      if (!originalLesson) {
        toast.error("Original lesson data not found");
        setLessonSaving(false);
        return;
      }

      const payload = {};

      if (lesson.title !== originalLesson.title) {
        payload.title = lesson.title;
      }
      if (lesson.description !== originalLesson.description) {
        payload.description = lesson.description || "";
      }
      if (lesson.content_type !== originalLesson.content_type) {
        payload.content_type = lesson.content_type || "video";
      }
      if (lesson.video_url !== originalLesson.video_url) {
        payload.video_url = lesson.video_url || "";
      }
      if (lesson.external_video_url !== originalLesson.external_video_url) {
        payload.external_video_url = lesson.external_video_url || "";
      }
      if (
        parseInt(lesson.duration_seconds || 0) !==
        parseInt(originalLesson.duration_seconds || 0)
      ) {
        payload.duration_seconds = parseInt(lesson.duration_seconds) || 0;
      }
      if (
        parseInt(lesson.lesson_order || 0) !==
        parseInt(originalLesson.lesson_order || 0)
      ) {
        payload.lesson_order = parseInt(lesson.lesson_order) || 0;
      }
      if (lesson.is_free_preview !== originalLesson.is_free_preview) {
        payload.is_free_preview = lesson.is_free_preview || false;
      }
      if (lesson.pdf_url !== originalLesson.pdf_url) {
        payload.pdf_url = lesson.pdf_url || null;
      }

      if (Object.keys(payload).length === 0) {
        toast.info("No changes to update");
        setLessonSaving(false);
        return;
      }

      console.log("Updating lesson with changed fields:", payload);

      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/lessons/update/${lesson.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
          body: JSON.stringify(payload),
        },
      );

      if (response.meta?.status === 200) {
        toast.success("Lesson updated successfully!");

        const updatedLesson = response.data;
        setProgramFormData((prev) => ({
          ...prev,
          lessons: prev.lessons.map((l, i) =>
            i === index ? { ...updatedLesson, is_new: false } : l,
          ),
        }));

        setOriginalLessons((prev) => ({
          ...prev,
          [updatedLesson.id]: { ...updatedLesson },
        }));

        if (editingProgram) {
          setEditingProgram((prev) => ({
            ...prev,
            lessons: prev.lessons.map((l) =>
              l.id === updatedLesson.id ? { ...updatedLesson } : l,
            ),
          }));
        }
      } else {
        let errorMessage = response.meta?.message || "Failed to update lesson";
        if (response.errors) {
          const errorMessages = Object.values(response.errors).join(", ");
          errorMessage = errorMessages || errorMessage;
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error updating lesson:", error);
      toast.error("Failed to update lesson");
    } finally {
      setLessonSaving(false);
    }
  };

  const saveUnsavedLessons = async (courseId) => {
    const unsavedLessons = programFormData.lessons.filter(
      (lesson) => lesson.is_new,
    );

    if (unsavedLessons.length === 0) return;

    toast.info(`Saving ${unsavedLessons.length} lesson(s)...`);

    for (const lesson of unsavedLessons) {
      if (!lesson.title) continue;

      try {
        const payload = {
          title: lesson.title,
          content_type: lesson.content_type || "video",
        };

        if (lesson.description) {
          payload.description = lesson.description;
        }
        if (lesson.video_url) {
          payload.video_url = lesson.video_url;
        }
        if (lesson.external_video_url) {
          payload.external_video_url = lesson.external_video_url;
        }
        if (lesson.duration_seconds && parseInt(lesson.duration_seconds) > 0) {
          payload.duration_seconds = parseInt(lesson.duration_seconds);
        }
        if (lesson.lesson_order) {
          payload.lesson_order = lesson.lesson_order;
        }
        if (
          lesson.is_free_preview !== undefined &&
          lesson.is_free_preview !== null
        ) {
          payload.is_free_preview = lesson.is_free_preview;
        }
        if (lesson.content_type === "pdf" && lesson.pdf_url) {
          payload.pdf_url = lesson.pdf_url;
        }

        const lessonResponse = await fetchApiResponse(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/lessons`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Access-Token": session?.accessToken,
              "Refresh-Token": session?.refreshToken,
            },
            body: JSON.stringify(payload),
          },
        );

        if (lessonResponse.meta?.status === 201) {
          const savedLesson = lessonResponse.data;
          setProgramFormData((prev) => ({
            ...prev,
            lessons: prev.lessons.map((l) =>
              l === lesson ? { ...savedLesson, is_new: false } : l,
            ),
          }));
        }
      } catch (error) {
        console.error("Error saving lesson:", error);
        toast.error(`Failed to save lesson: ${lesson.title}`);
      }
    }

    toast.success("All lessons saved successfully!");
  };

  const resetProgramForm = () => {
    setProgramFormData({
      title: "",
      description: "",
      category: "",
      duration: "",
      level: "",
      price: "",
      discount: "",
      thumbnail: "",
      status: "draft",
      lessons: [],
      mode: "online",
    });
    setProgramErrors({});
    setProgramSuccess(false);
    setUploadingVideo(false);
    setVideoUploadProgress(0);
    setVideoFile(null);
    setOriginalLessons({});
  };

  const handleEditProgram = async (program) => {
    try {
      setProgramsLoading(true);

      const courseDetails = await fetchCourseDetails(program.id);

      if (!courseDetails) {
        toast.error("Failed to load course details");
        setProgramsLoading(false);
        return;
      }

      setEditingProgram({
        ...courseDetails,
        id: courseDetails.id,
        lessons: courseDetails.lessons || [],
      });

      const existingLessons = (courseDetails.lessons || []).map((lesson) => ({
        ...lesson,
        is_new: false,
      }));

      const originalLessonsMap = {};
      (courseDetails.lessons || []).forEach((lesson) => {
        if (lesson.id) {
          originalLessonsMap[lesson.id] = { ...lesson };
        }
      });
      setOriginalLessons(originalLessonsMap);

      setProgramFormData({
        title: courseDetails.title || "",
        description: courseDetails.description || "",
        category: courseDetails.category || "",
        duration: courseDetails.duration || "",
        level: courseDetails.level || "",
        price: courseDetails.original_price || "",
        discount: courseDetails.discount || "",
        thumbnail: courseDetails.thumbnail_url || "",
        status: courseDetails.status || "draft",
        mode: courseDetails.mode || "online",
        course_code: courseDetails.course_code || "",
        lessons: existingLessons,
        courseId: program.id,
      });

      setShowCreateProgram(true);
      setProgramsLoading(false);
    } catch (error) {
      console.error("Error editing program:", error);
      toast.error("Failed to load program details");
      setProgramsLoading(false);
    }
  };

  const handleDeleteProgram = async (programId) => {
    if (!confirm("Are you sure you want to delete this program?")) return;

    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${programId}`,
        {
          method: "DELETE",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
        },
      );

      if (response.meta?.status === 200) {
        toast.success("Program deleted successfully!");
        await fetchPrograms();
      } else {
        toast.error(response.meta?.message || "Failed to delete program");
      }
    } catch (error) {
      console.error("Error deleting program:", error);
      toast.error("Failed to delete program");
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status) => {
    const styles = {
      published: "bg-green-100 text-green-700",
      draft: "bg-yellow-100 text-yellow-700",
      archived: "bg-gray-100 text-gray-700",
      active: "bg-green-100 text-green-700",
      completed: "bg-blue-100 text-blue-700",
      inactive: "bg-gray-100 text-gray-700",
      pending: "bg-yellow-100 text-yellow-700",
    };
    return styles[status] || styles.draft;
  };

  // Show loading state
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state if profile fetch failed
  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">
            Unable to load profile
          </h3>
          <p className="text-gray-500 mt-2">
            {profileError
              ? "Failed to fetch your profile data. Please try again."
              : "Profile data not available."}
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <button
              onClick={fetchProfile}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Profile Header */}
              <div className="bg-linear-to-r from-red-600 to-red-700 px-6 py-8">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden mb-4">
                    {profile.avatar_url ? (
                      <Image
                      width={96}
    height={96}
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                      priority={false}
                      quality={85}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-red-100 text-red-600 text-3xl font-bold">
                        {getInitials(profile.full_name)}
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-white text-center">
                    {profile.full_name}
                  </h2>
                  <p className="text-sm text-red-100 text-center">
                    {profile.user_code}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                      {profile.role_type?.join(", ") || "User"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        profile.is_active
                          ? "bg-green-500/30 text-green-100"
                          : "bg-red-500/30 text-red-100"
                      }`}
                    >
                      {profile.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Mobile</p>
                    <p className="text-sm text-gray-900">{profile.mobile}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <GraduationCap className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Qualification</p>
                    <p className="text-sm text-gray-900">
                      {profile.highest_qualification || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Organization</p>
                    <p className="text-sm text-gray-900">
                      {profile.current_organization || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm text-gray-900">
                      {profile.city
                        ? `${profile.city}, ${profile.state || ""}`
                        : "Not specified"}
                    </p>
                  </div>
                </div>

                <Link
                  href="/profile"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors mt-4"
                >
                  <User className="w-4 h-4" />
                  View Full Profile
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px overflow-x-auto">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === "overview"
                        ? "border-red-600 text-red-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Activity className="w-4 h-4 inline mr-2" />
                    Overview
                  </button>
                  {!isAdmin && (
                    <button
                      onClick={() => setActiveTab("my-courses")}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === "my-courses"
                          ? "border-red-600 text-red-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <BookOpen className="w-4 h-4 inline mr-2" />
                      My Courses
                      {enrolledCourses.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                          {enrolledCourses.length}
                        </span>
                      )}
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => setActiveTab("programs")}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === "programs"
                          ? "border-red-600 text-red-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <BookOpen className="w-4 h-4 inline mr-2" />
                      Programs
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab("password")}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === "password"
                        ? "border-red-600 text-red-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Lock className="w-4 h-4 inline mr-2" />
                    Change Password
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow p-6">
              {activeTab === "overview" ? (
                // Overview Tab
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Welcome
                        {profile?.full_name ? `, ${profile.full_name}` : ""}!
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {isAdmin
                          ? "Manage your courses, track performance, and oversee program operations."
                          : "Track your learning progress, view enrolled programs, and manage your account."}
                      </p>
                    </div>
                    {/* Role Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isAdmin
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {isAdmin ? "Admin" : "Student"}
                      </span>
                    </div>
                  </div>

                  {/* Stats Grid - Different for Admin and Student */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {isAdmin ? (
                      // Admin Stats - Only show if programs data is loaded
                      <>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <h4 className="font-medium text-gray-900">
                              Total Programs
                            </h4>
                          </div>
                          <p className="text-2xl font-bold text-blue-600">
                            {programs.length}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            All courses and programs
                          </p>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 rounded-full">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <h4 className="font-medium text-gray-900">
                              Published
                            </h4>
                          </div>
                          <p className="text-2xl font-bold text-green-600">
                            {
                              programs.filter((p) => p.status === "published")
                                .length
                            }
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Publicly available programs
                          </p>
                        </div>

                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-yellow-100 rounded-full">
                              <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                            <h4 className="font-medium text-gray-900">
                              Drafts
                            </h4>
                          </div>
                          <p className="text-2xl font-bold text-yellow-600">
                            {
                              programs.filter((p) => p.status === "draft")
                                .length
                            }
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Programs in progress
                          </p>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 rounded-full">
                              <Users className="w-5 h-5 text-purple-600" />
                            </div>
                            <h4 className="font-medium text-gray-900">
                              Total Lessons
                            </h4>
                          </div>
                          <p className="text-2xl font-bold text-purple-600">
                            {programs.reduce(
                              (total, p) => total + (p.lessons?.length || 0),
                              0,
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Across all programs
                          </p>
                        </div>
                      </>
                    ) : (
                      // Student Stats - Only show enrolled courses data
                      <>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <h4 className="font-medium text-gray-900">
                              Enrolled Programs
                            </h4>
                          </div>
                          <p className="text-2xl font-bold text-blue-600">
                            {
                              enrolledCourses.filter(
                                (c) =>
                                  c.enrollment_status === "active"
                              ).length
                            }
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Active enrollments
                          </p>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 rounded-full">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <h4 className="font-medium text-gray-900">
                              Completed
                            </h4>
                          </div>
                          <p className="text-2xl font-bold text-green-600">
                            {
                              enrolledCourses.filter(
                                (c) => c.enrollment_status === "completed").length
                            }
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Completed programs
                          </p>
                        </div>

                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-yellow-100 rounded-full">
                              <TrendingUp className="w-5 h-5 text-yellow-600" />
                            </div>
                            <h4 className="font-medium text-gray-900">
                              In Progress
                            </h4>
                          </div>
                          <p className="text-2xl font-bold text-yellow-600">
                            {
                              enrolledCourses.filter(
                                (c) =>
                                  (c.enrollment_status === "active") &&
                                  c.progress > 0 &&
                                  c.progress < 100,
                              ).length
                            }
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Programs in progress
                          </p>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 rounded-full">
                              <Award className="w-5 h-5 text-purple-600" />
                            </div>
                            <h4 className="font-medium text-gray-900">
                              Certificates
                            </h4>
                          </div>
                          <p className="text-2xl font-bold text-purple-600">
                            {
                              enrolledCourses.filter(
                                (c) => c.certificate_issued,
                              ).length
                            }
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Earned certificates
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Quick Actions
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {isAdmin ? (
                        // Admin Quick Actions
                        <>
                          <button
                            onClick={() => {
                              setActiveTab("programs");
                              setShowCreateProgram(true);
                              setEditingProgram(null);
                              resetProgramForm();
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Plus className="w-4 h-4 text-red-600" />
                            <span className="text-sm text-red-700">
                              Create Program
                            </span>
                          </button>
                          <button
                            onClick={() => setActiveTab("programs")}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <BookOpen className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-blue-700">
                              Manage Programs
                            </span>
                          </button>
                          <Link
                            href="/profile"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <User className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700">
                              Edit Profile
                            </span>
                          </Link>
                          <Link
                            href="/dashboard"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            <Settings className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-700">
                              Settings
                            </span>
                          </Link>
                        </>
                      ) : (
                        // Student Quick Actions
                        <>
                          <Link
                            href="/#programs"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <BookOpen className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-blue-700">
                              Browse Programs
                            </span>
                          </Link>
                          <Link
                            href="/profile"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <User className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700">
                              My Profile
                            </span>
                          </Link>
                          <button
                            onClick={() => setActiveTab("my-courses")}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-700">
                              My Courses
                            </span>
                          </button>
                          <button
                            onClick={() => setActiveTab("password")}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Lock className="w-4 h-4 text-red-600" />
                            <span className="text-sm text-red-700">
                              Security
                            </span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Recent Activity Section */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      {isAdmin ? "Recent Activity" : "Your Recent Activity"}
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-center py-6">
                        <div className="text-center">
                          <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">
                            {isAdmin
                              ? "No recent activity to show"
                              : "Start exploring programs to see your activity here"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === "my-courses" ? (
                // My Courses Tab - Enrolled Courses
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        My Courses
                      </h3>
                      <p className="text-sm text-gray-500">
                        {enrolledCourses.length > 0
                          ? `You are enrolled in ${enrolledCourses.length} course${enrolledCourses.length > 1 ? "s" : ""}`
                          : "You haven't enrolled in any courses yet"}
                      </p>
                    </div>
                    <Link
                      href="/#programs"
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Browse Courses
                    </Link>
                  </div>

                  {enrolledCoursesLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto" />
                      <p className="mt-2 text-gray-500">
                        Loading your courses...
                      </p>
                    </div>
                  ) : enrolledCourses.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">
                        You haven't enrolled in any courses yet
                      </p>
                      <Link
                        href="/#programs"
                        className="text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                      >
                        Browse available programs
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {enrolledCourses.map((course) => (
                        <div
                          key={course.enrollment_id || course.course_id}
                          className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col md:flex-row">
                            {course.thumbnail_url && (
                              <div className="md:w-48 h-32 bg-gray-200 shrink-0">
                                <Image
                                  src={course.thumbnail_url}
                                  alt={course.title}
                                   width={192}
                                   height={128}
                                   quality={85}
                                   priority={false}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h4 className="font-semibold text-gray-900">
                                      {course.title}
                                    </h4>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(course.enrollment_status || course.status)}`}
                                    >
                                      {course.enrollment_status ||
                                        course.status ||
                                        "Active"}
                                    </span>
                                    {course.course_code && (
                                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                        {course.course_code}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {course.description}
                                  </p>

                                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <BookOpen className="w-3 h-3" />
                                      {course.category || "General"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {course.duration || "N/A"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Award className="w-3 h-3" />
                                      {course.level || "Beginner"}
                                    </span>
                                    {course.enrolled_at && (
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Enrolled:{" "}
                                        {new Date(
                                          course.enrolled_at,
                                        ).toLocaleDateString()}
                                      </span>
                                    )}
                                    {course.final_price && (
                                      <span className="flex items-center gap-1 font-semibold text-gray-700">
                                        ₹{course.final_price}
                                        {course.original_price &&
                                          course.discount > 0 && (
                                            <span className="text-gray-400 line-through ml-1">
                                              ₹{course.original_price}
                                            </span>
                                          )}
                                      </span>
                                    )}
                                    {course.progress !== undefined &&
                                      course.progress > 0 && (
                                        <span className="flex items-center gap-1">
                                          <TrendingUp className="w-3 h-3" />
                                          Progress: {course.progress}%
                                        </span>
                                      )}
                                  </div>
                                </div>
                                <Link
                                  href={`/programs/${course.course_id}`}
                                  className="shrink-0 ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                >
                                  {course.progress && course.progress > 0
                                    ? "Continue Learning"
                                    : "Start Learning"}
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : activeTab === "programs" ? (
                // Programs Tab (Admin only)
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Your Programs
                      </h3>
                      <p className="text-sm text-gray-500">
                        Create and manage your courses and programs
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowCreateProgram(true);
                        setEditingProgram(null);
                        resetProgramForm();
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Create Program
                    </button>
                  </div>

                  {/* Create/Edit Program Form */}
                  {showCreateProgram && (
                    <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-semibold text-gray-900">
                          {editingProgram
                            ? "Edit Program"
                            : "Create New Program"}
                        </h4>
                        <button
                          onClick={() => {
                            setShowCreateProgram(false);
                            setEditingProgram(null);
                            resetProgramForm();
                            setProgramSuccess(false);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {programSuccess && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <p className="text-sm text-green-700">
                            {editingProgram
                              ? "Program updated successfully!"
                              : "Program created successfully!"}
                          </p>
                        </div>
                      )}

                      {programErrors.general && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <p className="text-sm text-red-700">
                            {programErrors.general}
                          </p>
                        </div>
                      )}

                      <form
                        onSubmit={handleProgramSubmit}
                        className="space-y-6"
                      >
                        {/* Basic Course Information */}
                        <div className="border-b border-gray-200 pb-4">
                          <h5 className="text-sm font-semibold text-gray-700 mb-3">
                            Course Information
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Course Title *
                              </label>
                              <input
                                type="text"
                                name="title"
                                value={programFormData.title}
                                onChange={handleProgramFormChange}
                                className={`w-full px-3 py-2 border ${
                                  programErrors.title
                                    ? "border-red-300"
                                    : "border-gray-300"
                                } rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                                placeholder="Enter course title"
                              />
                              {programErrors.title && (
                                <p className="mt-1 text-sm text-red-600">
                                  {programErrors.title}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category *
                              </label>
                              <select
                                name="category"
                                value={programFormData.category}
                                onChange={handleProgramFormChange}
                                className={`w-full px-3 py-2 border ${
                                  programErrors.category
                                    ? "border-red-300"
                                    : "border-gray-300"
                                } rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                              >
                                <option value="">Select category</option>
                                <option value="Web Development">
                                  Web Development
                                </option>
                                <option value="Data Science">
                                  Data Science
                                </option>
                                <option value="Interior Design">
                                  Interior Design
                                </option>
                              </select>
                              {programErrors.category && (
                                <p className="mt-1 text-sm text-red-600">
                                  {programErrors.category}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Level *
                              </label>
                              <select
                                name="level"
                                value={programFormData.level}
                                onChange={handleProgramFormChange}
                                className={`w-full px-3 py-2 border ${
                                  programErrors.level
                                    ? "border-red-300"
                                    : "border-gray-300"
                                } rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                              >
                                <option value="">Select level</option>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">
                                  Intermediate
                                </option>
                                <option value="advanced">Advanced</option>
                                <option value="expert">Expert</option>
                              </select>
                              {programErrors.level && (
                                <p className="mt-1 text-sm text-red-600">
                                  {programErrors.level}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mode
                              </label>
                              <select
                                name="mode"
                                value={programFormData.mode || "online"}
                                onChange={handleProgramFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                              >
                                <option value="online">Online</option>
                                <option value="offline">Offline</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration *
                              </label>
                              <select
                                name="duration"
                                value={programFormData.duration}
                                onChange={handleProgramFormChange}
                                className={`w-full px-3 py-2 border ${
                                  programErrors.duration
                                    ? "border-red-300"
                                    : "border-gray-300"
                                } rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                              >
                                <option value="">Select duration</option>
                                <option value="1 month">1 month</option>
                                <option value="2 months">2 months</option>
                                <option value="3 months">3 months</option>
                                <option value="4 months">4 months</option>
                                <option value="6 months">6 months</option>
                                <option value="1 year">1 year</option>
                                <option value="2 years">2 years</option>
                              </select>
                              {programErrors.duration && (
                                <p className="mt-1 text-sm text-red-600">
                                  {programErrors.duration}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price (₹) *
                              </label>
                              <input
                                type="number"
                                name="price"
                                value={programFormData.price || ""}
                                onChange={handleProgramFormChange}
                                className={`w-full px-3 py-2 border ${
                                  programErrors.price
                                    ? "border-red-300"
                                    : "border-gray-300"
                                } rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                              />
                              {programErrors.price && (
                                <p className="mt-1 text-sm text-red-600">
                                  {programErrors.price}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Discount (%)
                              </label>
                              <input
                                type="number"
                                name="discount"
                                value={programFormData.discount || ""}
                                onChange={handleProgramFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                placeholder="0"
                                min="0"
                                max="100"
                                step="1"
                              />
                              <p className="mt-1 text-xs text-gray-500">
                                Enter discount percentage (0-100)
                              </p>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                              </label>
                              <select
                                name="status"
                                value={programFormData.status}
                                onChange={handleProgramFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                              >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                              </select>
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Course Description *
                              </label>
                              <textarea
                                name="description"
                                value={programFormData.description}
                                onChange={handleProgramFormChange}
                                rows="3"
                                className={`w-full px-3 py-2 border ${
                                  programErrors.description
                                    ? "border-red-300"
                                    : "border-gray-300"
                                } rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                                placeholder="Describe your course..."
                              />
                              {programErrors.description && (
                                <p className="mt-1 text-sm text-red-600">
                                  {programErrors.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Lessons Section */}
                        <div className="border-b border-gray-200 pb-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-semibold text-gray-700">
                              Course Lessons
                            </h5>
                            <button
                              type="button"
                              onClick={addLesson}
                              className="flex items-center gap-1 text-sm bg-red-100 p-2 rounded-lg text-red-600 hover:text-red-700"
                            >
                              <Plus className="w-4 h-4" />
                              Add Lesson
                            </button>
                          </div>

                          {programFormData.lessons &&
                          programFormData.lessons.length > 0 ? (
                            <div className="space-y-3">
                              {programFormData.lessons.map((lesson, index) => (
                                <div
                                  key={index}
                                  className="p-4 bg-white rounded-lg border border-gray-200"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <h6 className="text-sm font-medium text-gray-900">
                                      Lesson {index + 1}
                                    </h6>
                                    <div className="flex gap-2">
                                      {lesson.id && !lesson.is_new ? (
                                        // For existing lessons, call updateLesson
                                        <button
                                          type="button"
                                          onClick={() => updateLesson(index)}
                                          disabled={lessonSaving}
                                          className="text-xs bg-blue-100 p-2 rounded-lg text-blue-600 hover:text-blue-700 disabled:opacity-50"
                                        >
                                          {lessonSaving ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                          ) : (
                                            "Update"
                                          )}
                                        </button>
                                      ) : (
                                        // For new lessons, call saveLesson
                                        <button
                                          type="button"
                                          onClick={() => saveLesson(index)}
                                          disabled={lessonSaving}
                                          className="text-xs bg-green-100 p-2 rounded-lg text-green-600 hover:text-green-700 disabled:opacity-50"
                                        >
                                          {lessonSaving ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                          ) : (
                                            "Save"
                                          )}
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => removeLesson(index)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <Trash2Icon size={20} />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Lesson Title *
                                      </label>
                                      <input
                                        type="text"
                                        value={lesson.title || ""}
                                        onChange={(e) =>
                                          handleLessonInputChange(
                                            index,
                                            "title",
                                            e.target.value,
                                          )
                                        }
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                        placeholder="Lesson title"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Content Type
                                      </label>
                                      <select
                                        value={lesson.content_type || "video"}
                                        onChange={(e) =>
                                          handleLessonInputChange(
                                            index,
                                            "content_type",
                                            e.target.value,
                                          )
                                        }
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                      >
                                        <option value="video">Video</option>
                                        <option value="pdf">PDF</option>
                                        <option value="text">Text</option>
                                      </select>
                                    </div>
                                    <div className="md:col-span-2">
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Description
                                      </label>
                                      <textarea
                                        value={lesson.description || ""}
                                        onChange={(e) =>
                                          handleLessonInputChange(
                                            index,
                                            "description",
                                            e.target.value,
                                          )
                                        }
                                        rows="2"
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                        placeholder="Lesson description"
                                      />
                                    </div>

                                    {/* Video Upload Section - Only show when content_type is video */}
                                    {(lesson.content_type === "video" ||
                                      lesson.content_type ===
                                        "interactive") && (
                                      <>
                                        <div className="md:col-span-2">
                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Video URL
                                          </label>
                                          <div className="flex gap-2">
                                            <input
                                              type="url"
                                              value={lesson.video_url || ""}
                                              onChange={(e) =>
                                                handleLessonInputChange(
                                                  index,
                                                  "video_url",
                                                  e.target.value,
                                                )
                                              }
                                              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                              placeholder="https://example.com/video.mp4"
                                            />
                                            <div className="relative">
                                              <label className="cursor-pointer px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm border border-blue-200 whitespace-nowrap">
                                                <Upload className="w-4 h-4 inline mr-1" />
                                                Upload Video
                                                <input
                                                  type="file"
                                                  className="hidden"
                                                  accept=".mp4,.webm,.ogg,.mov"
                                                  onChange={(e) =>
                                                    handleVideoUpload(e, index)
                                                  }
                                                  disabled={uploadingVideo}
                                                />
                                              </label>
                                              {uploadingVideo && (
                                                <div className="absolute top-full right-0 mt-1 w-48 bg-white border rounded-md shadow-lg p-2 z-10">
                                                  <div className="flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                                    <span className="text-xs text-gray-600">
                                                      {videoUploadProgress}%
                                                    </span>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          {lesson.video_url && (
                                            <p className="mt-1 text-xs text-green-600 truncate">
                                              ✓ Video uploaded
                                            </p>
                                          )}
                                        </div>

                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                            External Video URL
                                          </label>
                                          <input
                                            type="url"
                                            value={
                                              lesson.external_video_url || ""
                                            }
                                            onChange={(e) =>
                                              handleLessonInputChange(
                                                index,
                                                "external_video_url",
                                                e.target.value,
                                              )
                                            }
                                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                            placeholder="https://video.com/watch?v=..."
                                          />
                                        </div>
                                      </>
                                    )}

                                    {/* PDF Upload Section - Only show when content_type is PDF */}
                                    {lesson.content_type === "pdf" && (
                                      <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          PDF File
                                        </label>
                                        <div className="flex gap-2">
                                          <input
                                            type="text"
                                            value={lesson.pdf_url || ""}
                                            onChange={(e) =>
                                              handleLessonInputChange(
                                                index,
                                                "pdf_url",
                                                e.target.value,
                                              )
                                            }
                                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                            placeholder="PDF URL"
                                          />
                                          <label className="cursor-pointer px-3 py-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm border border-red-200 whitespace-nowrap">
                                            <Upload className="w-4 h-4 inline mr-1" />
                                            Upload PDF
                                            <input
                                              type="file"
                                              className="hidden"
                                              accept=".pdf"
                                              onChange={(e) =>
                                                handlePdfUpload(e, index)
                                              }
                                              disabled={uploadingPdf}
                                            />
                                          </label>
                                        </div>
                                        {lesson.pdf_url && (
                                          <p className="mt-1 text-xs text-green-600 truncate">
                                            ✓ PDF uploaded
                                          </p>
                                        )}
                                      </div>
                                    )}

                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Duration (seconds)
                                      </label>
                                      <input
                                        type="number"
                                        value={lesson.duration_seconds || ""}
                                        onChange={(e) =>
                                          handleLessonInputChange(
                                            index,
                                            "duration_seconds",
                                            e.target.value,
                                          )
                                        }
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                        placeholder="600"
                                        min="0"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Lesson Order
                                      </label>
                                      <input
                                        type="number"
                                        value={lesson.lesson_order || index + 1}
                                        onChange={(e) =>
                                          handleLessonInputChange(
                                            index,
                                            "lesson_order",
                                            e.target.value,
                                          )
                                        }
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                        placeholder="1"
                                        min="1"
                                      />
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                                        <input
                                          type="checkbox"
                                          checked={
                                            lesson.is_free_preview || false
                                          }
                                          onChange={(e) =>
                                            handleLessonInputChange(
                                              index,
                                              "is_free_preview",
                                              e.target.checked,
                                            )
                                          }
                                          className="rounded border-gray-300 text-red-600 focus:ring-red-500 h-4 w-4"
                                        />
                                        Free Preview
                                      </label>
                                      {lesson.id && !lesson.is_new && (
                                        <span className="text-xs text-green-600">
                                          ✓ Saved
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 text-center py-4">
                              No lessons added yet. Click "Add Lesson" to get
                              started.
                            </p>
                          )}
                        </div>

                        {/* Course Media */}
                        <div className="border-b border-gray-200 pb-4">
                          <h5 className="text-sm font-semibold text-gray-700 mb-3">
                            Course Media
                          </h5>
                          <div className="">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Thumbnail Image
                              </label>

                              <div className="mt-1">
                                {!programFormData.thumbnail ? (
                                  <div className="flex items-center justify-center w-full">
                                    <label
                                      htmlFor="thumbnail-upload"
                                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {uploadingThumbnail ? (
                                          <>
                                            <Loader2 className="w-8 h-8 mb-2 text-red-600 animate-spin" />
                                            <p className="text-sm text-gray-500">
                                              Uploading...
                                            </p>
                                            <div className="w-48 h-1.5 bg-gray-200 rounded-full mt-2">
                                              <div
                                                className="h-1.5 bg-red-600 rounded-full transition-all duration-300"
                                                style={{
                                                  width: `${thumbnailUploadProgress}%`,
                                                }}
                                              />
                                            </div>
                                          </>
                                        ) : (
                                          <>
                                            <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                            <p className="mb-2 text-sm text-gray-500">
                                              <span className="font-semibold">
                                                Click to upload
                                              </span>{" "}
                                              or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              PNG, JPG, or JPEG (MAX. 2MB)
                                            </p>
                                          </>
                                        )}
                                      </div>
                                      <input
                                        id="thumbnail-upload"
                                        type="file"
                                        className="hidden"
                                        accept=".jpg,.jpeg,.png"
                                        onChange={handleThumbnailUpload}
                                        disabled={uploadingThumbnail}
                                      />
                                    </label>
                                  </div>
                                ) : (
                                  <div className="relative group">
                                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                      <Image
                                        src={programFormData.thumbnail}
                                        alt="Thumbnail"
                                        loading="lazy"
                                        width={800}
                                        height={192}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setProgramFormData((prev) => ({
                                              ...prev,
                                              thumbnail: "",
                                            }));
                                            setThumbnailFile(null);
                                          }}
                                          className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                                          title="Remove image"
                                        >
                                          <Trash2Icon className="w-5 h-5 text-white" />
                                        </button>
                                        <label className="cursor-pointer p-2 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors">
                                          <Upload className="w-5 h-5 text-white" />
                                          <input
                                            type="file"
                                            className="hidden"
                                            accept=".jpg,.jpeg,.png"
                                            onChange={handleThumbnailUpload}
                                            disabled={uploadingThumbnail}
                                          />
                                        </label>
                                      </div>
                                    </div>
                                    {uploadingThumbnail && (
                                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                        <div className="text-center">
                                          <Loader2 className="w-8 h-8 mb-2 text-white animate-spin mx-auto" />
                                          <p className="text-sm text-white">
                                            Uploading...{" "}
                                            {thumbnailUploadProgress}%
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={programSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            {programSaving ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            {programSaving
                              ? "Saving..."
                              : editingProgram
                                ? "Update Program"
                                : "Create Program"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowCreateProgram(false);
                              setEditingProgram(null);
                              resetProgramForm();
                              setProgramSuccess(false);
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Programs List */}
                  {programsLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto" />
                      <p className="mt-2 text-gray-500">Loading programs...</p>
                    </div>
                  ) : programs.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {hasAdminOrInternalRoleFromSession()
                          ? "No programs created yet"
                          : "No programs available at the moment"}
                      </p>
                      {hasAdminOrInternalRoleFromSession() && (
                        <button
                          onClick={() => {
                            setShowCreateProgram(true);
                            setEditingProgram(null);
                            resetProgramForm();
                          }}
                          className="mt-4 text-red-600 hover:text-red-700"
                        >
                          Create your first program
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {programs.map((program) => (
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
                                  loading="lazy"
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
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(program.status)}`}
                                    >
                                      {program.status}
                                    </span>
                                    {program.course_code && (
                                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                        {program.course_code}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {program.description}
                                  </p>

                                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <BookOpen className="w-3 h-3" />
                                      {program.category}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {program.duration}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Award className="w-3 h-3" />
                                      {program.level}
                                    </span>
                                    <span className="flex items-center gap-1 font-semibold text-gray-700">
                                      Rs.
                                      {program.final_price ||
                                        program.original_price}
                                    </span>
                                    {program.discount > 0 && (
                                      <span className="flex items-center gap-1 text-green-600">
                                        <span className="line-through text-gray-400">
                                          Rs.{program.original_price}
                                        </span>
                                        {program.discount}% off
                                      </span>
                                    )}
                                    {program.lessons &&
                                      program.lessons.length > 0 && (
                                        <span className="flex items-center gap-1">
                                          <FileText className="w-3 h-3" />
                                          {program.lessons.length} lessons
                                        </span>
                                      )}
                                  </div>
                                </div>
                                {hasAdminOrInternalRoleFromSession() && (
                                  <div className="flex gap-2 shrink-0 ml-4">
                                    <button
                                      onClick={() => handleEditProgram(program)}
                                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                      title="Edit"
                                      disabled={programsLoading}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteProgram(program.id)
                                      }
                                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2Icon className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-red-100 rounded-full">
                      <Shield className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Change Password
                      </h3>
                      <p className="text-sm text-gray-500">
                        Update your password to keep your account secure
                      </p>
                    </div>
                  </div>

                  {passwordSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-sm text-green-700">
                        Password changed successfully! You will be logged out
                        shortly.
                      </p>
                    </div>
                  )}

                  {passwordErrors.general && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <p className="text-sm text-red-700">
                        {passwordErrors.general}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-6">
                    {/* Current Password */}
                    <div>
                      <label
                        htmlFor="old_password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Current Password
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="old_password"
                          name="old_password"
                          type={showOldPassword ? "text" : "password"}
                          value={passwordData.old_password}
                          onChange={handlePasswordChange}
                          className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                            passwordErrors.old_password
                              ? "border-red-300"
                              : "border-gray-300"
                          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showOldPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.old_password && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />{" "}
                          {passwordErrors.old_password}
                        </p>
                      )}
                    </div>

                    {/* New Password */}
                    <div>
                      <label
                        htmlFor="new_password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        New Password
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="new_password"
                          name="new_password"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.new_password}
                          onChange={handlePasswordChange}
                          className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                            passwordErrors.new_password
                              ? "border-red-300"
                              : "border-gray-300"
                          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordData.new_password && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-1.5 transition-all duration-300 ${passwordStrength.strengthColor || "bg-gray-200"}`}
                                style={{
                                  width: `${(passwordStrength.score / 4) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs font-medium">
                              {passwordStrength.strengthText}
                            </span>
                          </div>
                          {passwordStrength.feedback && (
                            <p className="mt-1 text-xs text-gray-500">
                              {passwordStrength.feedback}
                            </p>
                          )}
                        </div>
                      )}
                      {passwordErrors.new_password && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />{" "}
                          {passwordErrors.new_password}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label
                        htmlFor="confirm_password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Confirm New Password
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="confirm_password"
                          name="confirm_password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirm_password}
                          onChange={handlePasswordChange}
                          className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                            passwordErrors.confirm_password
                              ? "border-red-300"
                              : "border-gray-300"
                          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.confirm_password && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />{" "}
                          {passwordErrors.confirm_password}
                        </p>
                      )}
                    </div>

                    {/* Password Requirements */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Password Requirements:
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${passwordData.new_password.length >= 8 ? "bg-green-500" : "bg-gray-300"}`}
                          ></span>
                          Minimum 8 characters
                        </li>
                        <li className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(passwordData.new_password) && /[A-Z]/.test(passwordData.new_password) ? "bg-green-500" : "bg-gray-300"}`}
                          ></span>
                          Uppercase and lowercase letters
                        </li>
                        <li className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${/\d/.test(passwordData.new_password) ? "bg-green-500" : "bg-gray-300"}`}
                          ></span>
                          At least one number
                        </li>
                        <li className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.new_password) ? "bg-green-500" : "bg-gray-300"}`}
                          ></span>
                          At least one special character
                        </li>
                      </ul>
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {passwordLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Key className="w-4 h-4 mr-2 mt-0.5" />
                            Change Password
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
