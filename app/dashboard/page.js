// app/dashboard/page.js - Complete Updated Version

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
  GraduationCap,
  Building,
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
  Play,
  Clock,
  Award,
  TrendingUp,
  Users,
  BookOpen,
  FileText,
  Settings,
  Plus,
  X,
  Edit,
  Save,
  Upload,
  Trash2Icon,
  Calendar,
  LayoutDashboard,
  LogOut,
  FileCheck,
  CreditCard,
  DollarSign,
  RefreshCw,
  IndianRupee,
  Receipt,
  HelpCircle,
  Download,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-toastify";
import fetchApiResponse from "@/helper/api_data_store";
import sha256 from "crypto-js/sha256";
import Image from "next/image";
import { useAssessmentState } from "../components/Assessment/AssessmentState";
import { useAssessmentOperations } from "../components/Assessment/AssessmentOperations";
import { useQuestionOperations } from "../components/Assessment/QuestionOperations";
import { QuestionForm } from "../components/Assessment/QuestionForm";
import AssessmentModal from "../components/Assessment/AssessmentModal";
import ProgramCard from "../components/Assessment/ProgramCard";
import AdminManagement from "../components/ui/AdminManagement";
import PaymentManagement from "../components/ui/PaymentManagement";
import { adminService } from "@/helper/services/adminService";
import { paymentService } from "@/helper/services/paymentService";
import FAQManagement from "../components/ui/FAQManagement";
import useCSVExport from "@/helper/hooks/useCSVExport";
import { uploadService } from "@/helper/services/uploadService";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedAssessment, setExpandedAssessment] = useState(null);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const {isExporting, exportCourses} = useCSVExport(session);

  // Admin Stats
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalEnrollments: 0,
    activeEnrollments: 0,
    pendingEnrollments: 0,
    completedEnrollments: 0,
    studentsCount: 0,
    instructorsCount: 0,
    adminsCount: 0,
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    totalLessons: 0,
    recentPayments: [],
    recentUsers: [],
    recentEnrollments: [],
    enrollmentGrowth: 0,
    userGrowth: 0,
    totalRevenue: 0,
    totalPayments: 0,
    successfulPayments: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);

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
  const [uploadingPdfIndex, setUploadingPdfIndex] = useState(null);
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
  const [lessonSaving, setLessonSaving] = useState(false);
  const [lessonErrors, setLessonErrors] = useState({});
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState(null);
  const [originalLessons, setOriginalLessons] = useState({});
  const [allPrograms, setAllPrograms] = useState([]);
  const [isAllProgramsFetched, setIsAllProgramsFetched] = useState(false);
  const [selectedAssessmentIndex, setSelectedAssessmentIndex] = useState(null);

  const [filters, setFilters] = useState({
    category: "",
    level: "",
    status: "",
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");

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
    if (status === "loading") return;
    if (status === "unauthenticated" && !session?.user?.id) {
      router.push("/login?redirect=/dashboard");
    }
  }, [status, router, session]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAdmin) {
        const newFilters = { ...filters, search: debouncedSearch };
        setFilters(newFilters);
        fetchPrograms(newFilters);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [debouncedSearch, isAdmin]);

  useEffect(() => {
    if (isAdmin && (filters.category || filters.level || filters.status)) {
      refreshPrograms();
    }
  }, [filters.category, filters.level, filters.status]);

  const clearFilters = () => {
    const emptyFilters = {
      category: "",
      level: "",
      status: "",
      search: "",
    };
    setFilters(emptyFilters);
    setDebouncedSearch("");
    setShowFilters(false);
    fetchPrograms(emptyFilters);
  };

  const getUniqueValues = (key) => {
    const values = allPrograms.map((p) => p[key]).filter(Boolean);

    const uniqueMap = new Map();
    values.forEach((val) => {
      const lowerKey = val.toLowerCase();
      if (!uniqueMap.has(lowerKey)) {
        uniqueMap.set(lowerKey, val);
      }
    });

    return Array.from(uniqueMap.values());
  };

  // Fetch profile data and conditional data based on role
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchProfile();
      if (isAdmin) {
        fetchAllPrograms();
        fetchPrograms(filters);
        fetchAdminStats();
      } else {
        fetchEnrolledCourses();
      }
    }
  }, [status, session, isAdmin]);

  // Refresh stats when programs change
  useEffect(() => {
    if (isAdmin && programs.length > 0) {
      fetchAdminStats();
    }
  }, [programs.length]);

  // Helper function to calculate growth
  const calculateGrowth = (data) => {
    if (!data || data.length < 2) return 0;
    const now = new Date();
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const recent = data.filter((item) => {
      const date = new Date(item.created_at || item.enrolled_at);
      return date > lastMonth;
    });
    const total = data.length;

    return total > 0 ? Math.round((recent.length / total) * 100) : 0;
  };


  // Format currency in Indian Rupees
  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  const fetchAdminStats = async () => {
    if (!isAdmin) return;

    setStatsLoading(true);
    try {
      // Fetch users
      const usersResult = await adminService.listUsers({}, session);
      // Fetch enrollments
      const enrollmentsResult = await adminService.listEnrollments({}, session);
      // Fetch payments
      const paymentsResult = await paymentService.listPayments(session);

      if (usersResult.success && enrollmentsResult.success) {
        const users = usersResult.data || [];
        const enrollments = enrollmentsResult.data || [];
        let payments = [];

        // Process payments data
        if (paymentsResult.success) {
          let paymentsData = paymentsResult.data || [];
          // Ensure we have an array
          if (!Array.isArray(paymentsData)) {
            if (typeof paymentsData === "object" && paymentsData !== null) {
              paymentsData = Object.values(paymentsData).flat();
            } else {
              paymentsData = [];
            }
          }
          payments = paymentsData;
        }

        // Calculate stats
        const activeUsers = users.filter((u) => u.is_active).length;
        const inactiveUsers = users.filter((u) => !u.is_active).length;

        const students = users.filter((u) => {
          const roles = Array.isArray(u.role_type)
            ? u.role_type
            : [u.role_type];
          return roles.some((r) => r?.toLowerCase() === "student");
        }).length;

        const instructors = users.filter((u) => {
          const roles = Array.isArray(u.role_type)
            ? u.role_type
            : [u.role_type];
          return roles.some((r) => r?.toLowerCase() === "instructor");
        }).length;

        const admins = users.filter((u) => {
          const roles = Array.isArray(u.role_type)
            ? u.role_type
            : [u.role_type];
          return roles.some(
            (r) =>
              r?.toLowerCase() === "admin" || r?.toLowerCase() === "internal",
          );
        }).length;

        const activeEnrollments = enrollments.filter(
          (e) => e.status === "active" || e.enrollment_status === "active",
        ).length;

        const pendingEnrollments = enrollments.filter(
          (e) => e.status === "pending" || e.enrollment_status === "pending",
        ).length;

        const completedEnrollments = enrollments.filter(
          (e) =>
            e.status === "completed" || e.enrollment_status === "completed",
        ).length;

        // Calculate payment statistics
        const successfulPayments = payments.filter(
          (p) =>
            p.status?.toLowerCase() === "success" ||
            p.status?.toLowerCase() === "captured" ||
            p.status?.toLowerCase() === "completed",
        ).length;

        const failedPayments = payments.filter(
          (p) =>
            p.status?.toLowerCase() === "failed" ||
            p.status?.toLowerCase() === "failure",
        ).length;

        const pendingPayments = payments.filter(
          (p) =>
            p.status?.toLowerCase() === "pending" ||
            p.status?.toLowerCase() === "initiated",
        ).length;

        const refundedPayments = payments.filter(
          (p) => p.status?.toLowerCase() === "refunded",
        ).length;

        // Calculate total revenue from payments (only successful ones)
        const totalRevenue = payments.reduce((total, p) => {
          const status = p.status?.toLowerCase();
          if (
            status === "success" ||
            status === "captured" ||
            status === "completed"
          ) {
            const amount =
              parseFloat(p.amount_paid) || parseFloat(p.amount) || 0;
            return total + amount;
          }
          return total;
        }, 0);

        // Get recent users (last 5)
        const recentUsers = [...users]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);

        // Get recent enrollments (last 5)
        const recentEnrollments = [...enrollments]
          .sort((a, b) => new Date(b.enrolled_at) - new Date(a.enrolled_at))
          .slice(0, 5);

        // Get recent payments (last 5)
        const recentPayments = [...payments]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);

        setAdminStats({
          totalUsers: users.length,
          activeUsers,
          inactiveUsers,
          totalEnrollments: enrollments.length,
          activeEnrollments,
          pendingEnrollments,
          completedEnrollments,
          studentsCount: students,
          instructorsCount: instructors,
          adminsCount: admins,
          totalCourses: programs.length,
          publishedCourses: programs.filter((p) => p.status === "published")
            .length,
          draftCourses: programs.filter((p) => p.status === "draft").length,
          totalLessons: programs.reduce(
            (total, p) => total + (p.lessons?.length || 0),
            0,
          ),
          recentUsers,
          recentEnrollments,
          recentPayments,
          enrollmentGrowth: calculateGrowth(enrollments),
          userGrowth: calculateGrowth(users),
          // Payment statistics
          totalRevenue,
          totalPayments: payments.length,
          successfulPayments,
          failedPayments,
          pendingPayments,
          refundedPayments,
          averageAmount:
            payments.length > 0 ? totalRevenue / payments.length : 0,
        });
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };
  const fetchAllPrograms = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/list`;

      const response = await fetchApiResponse(url, {
        method: "GET",
        headers: {
          "Access-Token": session?.accessToken,
          "Refresh-Token": session?.refreshToken,
        },
      });

      if (response.meta?.status === 200 && response.data) {
        const courses = Array.isArray(response.data) ? response.data : [];
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
                  category: course.category,
                  level: course.level,
                  status: course.status,
                  title: course.title,
                  ...course,
                };
              }
              return {
                ...course,
              };
            } catch (error) {
              console.error(
                `Error fetching details for course ${course.id}:`,
                error,
              );
              return {
                ...course,
              };
            }
          }),
        );

        setAllPrograms(mappedPrograms);
        setIsAllProgramsFetched(true);
        return mappedPrograms;
      }
      return [];
    } catch (error) {
      console.error("Error fetching all programs:", error);
      return [];
    }
  };

  const fetchPrograms = async (filterParams = {}) => {
    setProgramsLoading(true);
    try {
      const queryParams = new URLSearchParams();

      if (filterParams.category) {
        queryParams.append("category", filterParams.category);
      }
      if (filterParams.level) {
        queryParams.append("level", filterParams.level);
      }
      if (filterParams.status) {
        queryParams.append("status", filterParams.status);
      }
      if (filterParams.search) {
        queryParams.append("search", filterParams.search);
      }

      const queryString = queryParams.toString();
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/list${queryString ? `?${queryString}` : ""}`;

      const response = await fetchApiResponse(url, {
        method: "GET",
        headers: {
          "Access-Token": session?.accessToken,
          "Refresh-Token": session?.refreshToken,
        },
      });

      if (response.meta?.status === 200 && response.data) {
        const courses = Array.isArray(response.data) ? response.data : [];
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
                const courseData = detailsResponse.data;

                if (courseData.assessment) {
                  setAssessments((prev) => ({
                    ...prev,
                    [course.id]: [courseData.assessment],
                  }));
                }
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
                  is_active: course.is_active,
                  course_code: course.course_code,
                  created_at: course.created_at,
                  updated_at: course.updated_at,
                  lessons: detailsResponse.data.lessons || [],
                  assessment: courseData.assessment || null,
                  ...course,
                };
              }
              return {
                ...course,
                lessons: [],
                assessment: null,
                is_active: course.is_active,
              };
            } catch (error) {
              console.error(
                `Error fetching details for course ${course.id}:`,
                error,
              );
              return {
                ...course,
                lessons: [],
                assessment: null,
                is_active: course.is_active,
              };
            }
          }),
        );
        setPrograms(mappedPrograms);
        setFilteredPrograms(mappedPrograms);
      } else {
        console.error("Programs fetch failed:", response.meta?.message);
        setPrograms([]);
        setFilteredPrograms([]);
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
      setPrograms([]);
      setFilteredPrograms([]);
    } finally {
      setProgramsLoading(false);
    }
  };

  // Assessment state
  const assessmentState = useAssessmentState();

  const {
    assessments,
    setAssessments,
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
  } = assessmentState;

  // Assessment operations
  const assessmentOps = useAssessmentOperations(
    session,
    assessments,
    setAssessments,
    () => fetchPrograms(filters),
    setAssessmentFormData,
    setAssessmentErrors,
    setAssessmentSaving,
    setAssessmentSuccess,
    resetAssessmentForm,
    () => setIsAssessmentModalOpen(false),
    setEditingAssessment,
    setEditingProgram 
  );

  const {
    fetchAssessment,
    handleAssessmentFormChange,
    handleAssessmentSubmit,
    handleDeleteAssessment,
    handleEditAssessment,
  } = assessmentOps;

  const questionOps = useQuestionOperations(
    session,
    assessmentOps.fetchAssessment,
    setEditingProgram 
  );

  const {
    handleQuestionFormChange,
    handleQuestionSubmit,
    handleDeleteQuestion,
    handleEditQuestion,
  } = questionOps;

  // ==================== Existing Functions ====================
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
          status: enrollment.status || "published",
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
        if (
          response.data.assessments &&
          Array.isArray(response.data.assessments)
        ) {
          setAssessments((prev) => ({
            ...prev,
            [courseId]: response.data.assessments,
          }));
        } else if (response.data.assessment) {
          // If API returns single assessment, wrap in array
          setAssessments((prev) => ({
            ...prev,
            [courseId]: [response.data.assessment],
          }));
        }
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching course details:", error);
      return null;
    }
  };

  // In dashboard/page.js - Add this function

const refreshEditingProgram = async () => {
  if (editingProgram && editingProgram.id) {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/details/${editingProgram.id}`;
      const response = await fetchApiResponse(url, {
        method: "GET",
        headers: {
          "Access-Token": session?.accessToken,
          "Refresh-Token": session?.refreshToken,
        },
      });
      
      if (response.meta?.status === 200 && response.data) {
        const courseData = response.data;
        setEditingProgram({
          ...courseData,
          id: courseData.id,
          lessons: courseData.lessons || [],
          assessment: courseData.assessment || [],
        });
        
        // Also update assessments state
        if (courseData.assessment) {
          setAssessments(prev => ({
            ...prev,
            [editingProgram.id]: courseData.assessment
          }));
        }
      }
    } catch (error) {
      console.error("Error refreshing editing program:", error);
    }
  }
};

  const refreshAssessmentData = async (courseId) => {
    try {
      const courseDetails = await fetchCourseDetails(courseId);
      if (courseDetails) {
        // The fetchCourseDetails already updates the assessments state
        return courseDetails;
      }
      return null;
    } catch (error) {
      console.error("Error refreshing assessment data:", error);
      return null;
    }
  };

  // Password functions
  const checkPasswordStrength = (password) => {
    let score = 0;
    let feedback = [];
    if (password.length === 0) {
      return { score: 0, feedback: "", strengthText: "", strengthColor: "" };
    }
    if (password.length < 8) feedback.push("Minimum 8 characters");
    else score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    else feedback.push("Include uppercase and lowercase letters");
    if (/\d/.test(password)) score += 1;
    else feedback.push("Include numbers");
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push("Include special characters");

    let strengthText = "",
      strengthColor = "";
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
    if (!passwordData.old_password)
      newErrors.old_password = "Current password is required";
    if (!passwordData.new_password)
      newErrors.new_password = "New password is required";
    else if (passwordData.new_password.length < 8)
      newErrors.new_password = "Password must be at least 8 characters";
    else if (passwordStrength.score < 2)
      newErrors.new_password =
        "Password is too weak. " + passwordStrength.feedback;
    if (!passwordData.confirm_password)
      newErrors.confirm_password = "Please confirm your password";
    else if (passwordData.new_password !== passwordData.confirm_password)
      newErrors.confirm_password = "Passwords do not match";
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
    )
      return;

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

const handleThumbnailUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setUploadingThumbnail(true);
  setThumbnailUploadProgress(0);
  setThumbnailFile(file);

  try {
    const result = await uploadService.uploadImage(file, session, {
      progressCallback: (progress) => {
        setThumbnailUploadProgress(progress);
      },
    });

    setProgramFormData((prev) => ({ ...prev, thumbnail: result.url }));
    toast.success("Thumbnail uploaded successfully!");
  } catch (error) {
    console.error("Error uploading thumbnail:", error);
    toast.error(error.message || "Failed to upload thumbnail");
    setProgramFormData((prev) => ({ ...prev, thumbnail: "" }));
    setThumbnailFile(null);
  } finally {
    setTimeout(() => {
      setUploadingThumbnail(false);
      setThumbnailUploadProgress(0);
    }, 1000);
  }
};

// Video upload handler - Using uploadService
const handleVideoUpload = async (e, lessonIndex) => {
  const file = e.target.files[0];
  if (!file) return;

  setUploadingVideo(true);
  setVideoUploadProgress(0);

  try {
    const result = await uploadService.uploadVideo(file, session, {
      progressCallback: (progress) => {
        setVideoUploadProgress(progress);
      },
    });

    handleLessonInputChange(lessonIndex, "video_url", result.url);
    toast.success("Video uploaded successfully!");
    e.target.value = "";
  } catch (error) {
    console.error("Error uploading video:", error);
    toast.error(error.message || "Failed to upload video");
    e.target.value = "";
  } finally {
    setTimeout(() => {
      setUploadingVideo(false);
      setVideoUploadProgress(0);
    }, 1000);
  }
};

// PDF upload handler - Using uploadService
const handlePdfUpload = async (e, lessonIndex) => {
  const file = e.target.files[0];
  if (!file) return;

  setUploadingPdf(true);
  setUploadingPdfIndex(lessonIndex);

  try {
    const result = await uploadService.uploadPDF(file, session);

    handleLessonInputChange(lessonIndex, "pdf_url", result.url);
    handleLessonInputChange(lessonIndex, "content_type", "pdf");
    toast.success("PDF uploaded successfully!");
    e.target.value = "";
  } catch (error) {
    console.error("Error uploading PDF:", error);
    toast.error(error.message || "Failed to upload PDF");
    e.target.value = "";
  } finally {
    setUploadingPdf(false);
    setUploadingPdfIndex(null);
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

      if (lesson.id && !lesson.is_new) {
        const originalLesson = editingProgram?.lessons?.find(
          (l) => l.id === lesson.id,
        );
        if (!originalLesson) {
          toast.error("Original lesson data not found");
          setLessonSaving(false);
          return;
        }

        const payload = {};
        if (lesson.title !== originalLesson.title) payload.title = lesson.title;
        if (lesson.description !== originalLesson.description)
          payload.description = lesson.description || "";
        if (lesson.content_type !== originalLesson.content_type)
          payload.content_type = lesson.content_type || "video";
        if (lesson.video_url !== originalLesson.video_url)
          payload.video_url = lesson.video_url || "";
        if (lesson.external_video_url !== originalLesson.external_video_url)
          payload.external_video_url = lesson.external_video_url || "";
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
        if (lesson.is_free_preview !== originalLesson.is_free_preview)
          payload.is_free_preview = lesson.is_free_preview || false;
        if (lesson.pdf_url !== originalLesson.pdf_url)
          payload.pdf_url = lesson.pdf_url || null;

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
        if (lesson.description) payload.description = lesson.description;
        if (lesson.video_url) payload.video_url = lesson.video_url;
        if (lesson.external_video_url)
          payload.external_video_url = lesson.external_video_url;
        if (lesson.duration_seconds && parseInt(lesson.duration_seconds) > 0)
          payload.duration_seconds = parseInt(lesson.duration_seconds);
        if (lesson.lesson_order) payload.lesson_order = lesson.lesson_order;
        if (
          lesson.is_free_preview !== undefined &&
          lesson.is_free_preview !== null
        )
          payload.is_free_preview = lesson.is_free_preview;
        if (lesson.content_type === "pdf" && lesson.pdf_url)
          payload.pdf_url = lesson.pdf_url;

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

  // Program handlers
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
            try {
              await updateCourse();
            } catch (error) {
              setProgramSaving(false);
              return;
            }
          }
          savedCourseId = editingProgram.id;
          await saveUnsavedLessons(savedCourseId);
          toast.success("Program updated with new lessons!");
          setProgramSuccess(true);
          setShowCreateProgram(false);
          setEditingProgram(null);
          resetProgramForm();
          await fetchPrograms(filters);
          setProgramSaving(false);
          return;
        }

        const changedFields = getChangedFields();
         
      
        if (Object.keys(changedFields).length > 0) {
          try {
            await updateCourse(changedFields);
            setProgramSuccess(true);
            setShowCreateProgram(false);
            setEditingProgram(null);
            resetProgramForm();
            await fetchPrograms(filters);
          } catch (error) {
            setProgramSaving(false);
            return;
          }
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
          if (unsavedLessons.length > 0)
            await saveUnsavedLessons(savedCourseId);
          toast.success("Program created successfully!");
          setProgramSuccess(true);
          setShowCreateProgram(false);
          setEditingProgram(null);
          resetProgramForm();
          await fetchPrograms(filters);
        } else {
          toast.error(response.meta?.message || "Failed to create program");
        }
        setProgramSaving(false);
        return;
      }
    } catch (error) {
      console.error("Error saving program:", error);
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
    if (programFormData.title !== editingProgram.title)
      changedFields.title = programFormData.title;
    if (programFormData.description !== editingProgram.description)
      changedFields.description = programFormData.description;
    if (programFormData.category !== editingProgram.category)
      changedFields.category = programFormData.category;
    if (programFormData.duration !== editingProgram.duration)
      changedFields.duration = programFormData.duration;
    if (programFormData.level !== editingProgram.level)
      changedFields.level = programFormData.level;
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
    if (programFormData.status !== editingProgram.status)
      changedFields.status = programFormData.status;
    if (programFormData.mode !== editingProgram.mode)
      changedFields.mode = programFormData.mode || "online";
    return changedFields;
  };

  const updateCourse = async (changedFields) => {
    if (!editingProgram || Object.keys(changedFields).length === 0) return;

    try {
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

      if (!response || !response.meta) {
        toast.error("Invalid response from server");
        throw new Error("Invalid response from server");
      }

      if (response.meta.status === 200) {
        return response;
      }
    } catch (error) {
      console.error("Update course error:", error);
      if (error.message) {
        throw error;
      }
      toast.error("Failed to update program. Please try again.");
      throw error;
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
      if (lesson.title !== originalLesson.title) payload.title = lesson.title;
      if (lesson.description !== originalLesson.description)
        payload.description = lesson.description || "";
      if (lesson.content_type !== originalLesson.content_type)
        payload.content_type = lesson.content_type || "video";
      if (lesson.video_url !== originalLesson.video_url)
        payload.video_url = lesson.video_url || "";
      if (lesson.external_video_url !== originalLesson.external_video_url)
        payload.external_video_url = lesson.external_video_url || "";
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
      if (lesson.is_free_preview !== originalLesson.is_free_preview)
        payload.is_free_preview = lesson.is_free_preview || false;
      if (lesson.pdf_url !== originalLesson.pdf_url)
        payload.pdf_url = lesson.pdf_url || null;

      if (Object.keys(payload).length === 0) {
        toast.info("No changes to update");
        setLessonSaving(false);
        return;
      }

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
        if (lesson.description) payload.description = lesson.description;
        if (lesson.video_url) payload.video_url = lesson.video_url;
        if (lesson.external_video_url)
          payload.external_video_url = lesson.external_video_url;
        if (lesson.duration_seconds && parseInt(lesson.duration_seconds) > 0)
          payload.duration_seconds = parseInt(lesson.duration_seconds);
        if (lesson.lesson_order) payload.lesson_order = lesson.lesson_order;
        if (
          lesson.is_free_preview !== undefined &&
          lesson.is_free_preview !== null
        )
          payload.is_free_preview = lesson.is_free_preview;
        if (lesson.content_type === "pdf" && lesson.pdf_url)
          payload.pdf_url = lesson.pdf_url;

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
        if (lesson.id) originalLessonsMap[lesson.id] = { ...lesson };
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

  const refreshPrograms = async () => {
    await fetchAllPrograms();
    await fetchPrograms(filters);
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
        await refreshPrograms();
      } else {
        toast.error(response.meta?.message || "Failed to delete program");
      }
    } catch (error) {
      console.error("Error deleting program:", error);
      toast.error("Failed to delete program");
    }
  };

  // Activate course
  const handleActivateCourse = async (courseId) => {
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/activate`,
        {
          method: "PATCH",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
        },
      );

      if (response.meta?.status === 200) {
        toast.success("Course activated successfully!");
        await refreshPrograms();
      }
    } catch (error) {
      console.error("Error activating course:", error);
      toast.error("Failed to activate course");
    }
  };

  // Deactivate course
  const handleDeactivateCourse = async (courseId) => {
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/deactivate`,
        {
          method: "PATCH",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
        },
      );

      if (response.meta?.status === 200) {
        toast.success("Course deactivated successfully!");
        await refreshPrograms();
      }
    } catch (error) {
      console.error("Error deactivating course:", error);
      toast.error("Failed to deactivate course");
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
      published: "bg-emerald-100 text-emerald-700",
      draft: "bg-amber-100 text-amber-700",
      archived: "bg-gray-100 text-gray-700",
      active: "bg-emerald-100 text-emerald-700",
      completed: "bg-blue-100 text-blue-700",
      inactive: "bg-gray-100 text-gray-700",
      pending: "bg-amber-100 text-amber-700",
    };
    return styles[status] || styles.draft;
  };

  // Assessment handlers
  const handleOpenCreateAssessment = (courseId) => {
    setSelectedAssessmentId(courseId);
    setSelectedAssessmentIndex(null);
    setEditingAssessment(null);
    resetAssessmentForm();
    setAssessmentSuccess(false);
    setIsAssessmentModalOpen(true);
  };

  const handleOpenEditAssessment = (courseId, assessment, index) => {
    setSelectedAssessmentId(courseId);
    setSelectedAssessmentIndex(index);

    setEditingAssessment({
      ...assessment,
      id: assessment.id,
    });
    setAssessmentFormData({
      title: assessment.title || "",
      description: assessment.description || "",
       type: assessment.type || "mcq", 
      passing_score: assessment.passing_score || 60,
      duration_minutes: assessment.duration_minutes || 30,
      status: assessment.status || "draft",
          pdf_template_url: assessment.pdf_template_url || "",
instructions: assessment.instructions || "",
    });
    setAssessmentSuccess(false);
    setIsAssessmentModalOpen(true);
  };

  const handleSelectCourse = (courseId) => {
    setSelectedAssessmentId(courseId);
  };

  const handleOpenManageQuestions = (courseId, assessmentId) => {
    setSelectedAssessmentId(courseId);
    setShowAddQuestion(true);
    setEditingQuestion(null);
    resetQuestionForm();
  };


    const handleExportCSV = async () => {
    try {
      await exportCourses();
    } catch (error) {
      // Error handled by hook
      console.error("Export failed:", error);
    }
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
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
      {/* Top Navigation */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-screen-2xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  {isAdmin
                    ? "Manage your courses and programs"
                    : "Track your learning progress"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700">
                  {isAdmin ? "Admin" : "Student"}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <LogOut className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-screen-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 overflow-hidden sticky top-24">
              <div className="bg-[#FDF8F0] border-red-200/30 px-6 py-8">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-white/30 bg-white/10 overflow-hidden shadow-lg">
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
                        <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                          {getInitials(profile.full_name)}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <h2 className="mt-4 text-lg font-bold text-red-700 text-center">
                    {profile.full_name}
                  </h2>
                  <p className="text-sm text-red-800 text-center">
                    {profile.user_code}
                  </p>
                  <div className="mt-3 flex gap-2 flex-wrap justify-center">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#EEDBDD] text-red-800 uppercase">
                      {profile.role_type?.join(", ") || "User"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs uppercase font-medium ${
                        profile.is_active
                          ? "bg-emerald-700 text-emerald-100"
                          : "bg-red-500/30 text-red-100"
                      }`}
                    >
                      {profile.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm text-gray-700 truncate">
                      {profile.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">Mobile</p>
                    <p className="text-sm text-gray-700">{profile.mobile}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">Qualification</p>
                    <p className="text-sm text-gray-700 truncate">
                      {profile.highest_qualification || "Not specified"}
                    </p>
                  </div>
                </div>
                <Link
                  href="/profile"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FDF8F0] text-[#CC0000] rounded-xl hover:bg-[#fff5e4] transition-all mt-2"
                >
                  <User className="w-4 h-4" />
                  View Full Profile
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-3">
            {/* Tab Navigation - Updated with Admin Management and Payment tabs */}
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
                    <>
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
                      <button
                        onClick={() => setActiveTab("admin")}
                        className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === "admin"
                            ? "border-red-600 text-red-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <Users className="w-4 h-4 inline mr-2" />
                        Management
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setActiveTab("payments")}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === "payments"
                        ? "border-red-600 text-red-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 inline mr-2" />
                    Payments
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => setActiveTab("faqs")}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === "faqs"
                          ? "border-red-600 text-red-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <HelpCircle className="w-4 h-4 inline mr-2" />
                      FAQs
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
                // Overview Tab - Updated with all stats
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Welcome{" "}
                        {profile?.full_name ? `, ${profile.full_name}` : ""}!
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {isAdmin
                          ? "Manage your users, courses, and monitor platform performance."
                          : "Track your learning progress, view enrolled programs, and manage your account."}
                      </p>
                    </div>
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
                      {isAdmin && (
                        <button
                          onClick={fetchAdminStats}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Refresh Dashboard"
                        >
                          <RefreshCw className="w-4 h-4 text-gray-500" />
                        </button>
                      )}
                    </div>
                  </div>

                  {isAdmin ? (
                    <div>
                      {statsLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <Loader2 className="w-10 h-10 animate-spin text-red-600" />
                          <p className="mt-3 text-gray-500 font-medium">
                            Loading dashboard data...
                          </p>
                          <p className="text-sm text-gray-400">
                            Please wait while we fetch the latest stats
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Main Stats Grid - Consolidated */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-5 mb-6 md:mb-8">
                            {/* Total Users */}
                            <div className="group bg-white rounded-xl md:rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-1 overflow-hidden">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 truncate">
                                    Total Users
                                  </p>
                                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                                    {adminStats.totalUsers}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                                      <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-500 rounded-full"></span>
                                      {adminStats.activeUsers} Active
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 bg-gray-50 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                                      {adminStats.inactiveUsers} Inactive
                                    </span>
                                  </div>
                                </div>
                                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform flex-shrink-0">
                                  <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
                                </div>
                              </div>
                              <div className="mt-2 sm:mt-3 flex items-center gap-2">
                                <div className="flex-1 h-1 sm:h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000"
                                    style={{
                                      width: `${adminStats.totalUsers > 0 ? Math.min((adminStats.activeUsers / adminStats.totalUsers) * 100, 100) : 0}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-[10px] sm:text-xs font-medium text-blue-600 flex-shrink-0">
                                  {adminStats.totalUsers > 0
                                    ? Math.round(
                                        (adminStats.activeUsers /
                                          adminStats.totalUsers) *
                                          100,
                                      )
                                    : 0}
                                  %
                                </span>
                              </div>
                            </div>

                            {/* Total Courses */}
                            <div className="group bg-white rounded-xl md:rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200 hover:-translate-y-1 overflow-hidden">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 truncate">
                                    Total Courses
                                  </p>
                                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                                    {adminStats.totalCourses}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                                      {adminStats.publishedCourses} Published
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-amber-600 bg-amber-50 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                                      {adminStats.draftCourses} Draft
                                    </span>
                                  </div>
                                </div>
                                <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform flex-shrink-0">
                                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-emerald-600" />
                                </div>
                              </div>
                              <div className="mt-2 sm:mt-3 flex items-center gap-2">
                                <div className="flex-1 h-1 sm:h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000"
                                    style={{
                                      width: `${adminStats.totalCourses > 0 ? Math.min((adminStats.publishedCourses / adminStats.totalCourses) * 100, 100) : 0}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-[10px] sm:text-xs font-medium text-emerald-600 flex-shrink-0">
                                  {adminStats.totalCourses > 0
                                    ? Math.round(
                                        (adminStats.publishedCourses /
                                          adminStats.totalCourses) *
                                          100,
                                      )
                                    : 0}
                                  %
                                </span>
                              </div>
                              <p className="text-[10px] sm:text-xs text-gray-400 mt-1.5 sm:mt-2 truncate">
                                {adminStats.totalLessons} total lessons
                              </p>
                            </div>

                            {/* Enrollments Card */}
                            <div className="group bg-white rounded-xl md:rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200 hover:-translate-y-1 overflow-hidden">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 truncate">
                                    Enrollments
                                  </p>
                                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                                    {adminStats.totalEnrollments}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                                      {adminStats.activeEnrollments} Active
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-amber-600 bg-amber-50 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                                      {adminStats.pendingEnrollments} Pending
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-blue-600 bg-blue-50 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                                      {adminStats.completedEnrollments}{" "}
                                      Completed
                                    </span>
                                  </div>
                                </div>
                                <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform flex-shrink-0">
                                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-600" />
                                </div>
                              </div>
                              <div className="mt-2 sm:mt-3 flex items-center gap-2">
                                <div className="flex-1 h-1 sm:h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-1000"
                                    style={{
                                      width: `${adminStats.totalEnrollments > 0 ? Math.min((adminStats.activeEnrollments / adminStats.totalEnrollments) * 100, 100) : 0}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-[10px] sm:text-xs font-medium text-purple-600 flex-shrink-0">
                                  {adminStats.totalEnrollments > 0
                                    ? Math.round(
                                        (adminStats.activeEnrollments /
                                          adminStats.totalEnrollments) *
                                          100,
                                      )
                                    : 0}
                                  %
                                </span>
                              </div>
                            </div>

                            {/* Revenue Card */}
                            <div className="group bg-white rounded-xl md:rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-amber-200 hover:-translate-y-1 overflow-hidden">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 truncate">
                                    Revenue
                                  </p>
                                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-600 truncate">
                                    {formatCurrency(adminStats.totalRevenue)}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                                      {adminStats.successfulPayments} Success
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-red-600 bg-red-50 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                                      {adminStats.failedPayments} Failed
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 bg-gray-50 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                                      {adminStats.totalPayments} Total
                                    </span>
                                  </div>
                                </div>
                                <div className="p-2 sm:p-3 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform flex-shrink-0">
                                  <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-amber-600" />
                                </div>
                              </div>
                              <div className="mt-2 sm:mt-3 flex items-center gap-2">
                                <div className="flex-1 h-1 sm:h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-1000"
                                    style={{
                                      width: `${adminStats.totalPayments > 0 ? Math.min((adminStats.successfulPayments / adminStats.totalPayments) * 100, 100) : 0}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-[10px] sm:text-xs font-medium text-amber-600 flex-shrink-0">
                                  {adminStats.totalPayments > 0
                                    ? Math.round(
                                        (adminStats.successfulPayments /
                                          adminStats.totalPayments) *
                                          100,
                                      )
                                    : 0}
                                  %
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Recent Activity - Consolidated */}
                          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                  <Activity className="w-4 h-4 text-red-500" />
                                  Recent Activity
                                </h4>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setActiveTab("admin")}
                                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                                  >
                                    View All Users
                                  </button>
                                  <span className="w-px h-4 bg-gray-200"></span>
                                  <button
                                    onClick={() => setActiveTab("payments")}
                                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                                  >
                                    View All Payments
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="divide-y divide-gray-100">
                              {/* Recent Users */}
                              {adminStats.recentUsers?.length > 0 && (
                                <div className="p-4">
                                  <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5" />
                                    Recent Users
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {adminStats.recentUsers
                                      .slice(0, 3)
                                      .map((user) => (
                                        <div
                                          key={user.id}
                                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                                        >
                                          <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center text-red-700 text-sm font-semibold flex-shrink-0 group-hover:scale-110 transition-transform">
                                            {user.full_name
                                              ?.charAt(0)
                                              .toUpperCase() || "U"}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                              {user.full_name || "N/A"}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                              {user.email}
                                            </p>
                                          </div>
                                          <span
                                            className={`px-2 py-0.5 text-xs rounded-full ${
                                              user.is_active
                                                ? "bg-emerald-100 text-emerald-700"
                                                : "bg-gray-100 text-gray-500"
                                            }`}
                                          >
                                            {user.is_active
                                              ? "Active"
                                              : "Inactive"}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}

                              {/* Recent Enrollments */}
                              {adminStats.recentEnrollments?.length > 0 && (
                                <div className="p-4">
                                  <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    Recent Enrollments
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {adminStats.recentEnrollments
                                      .slice(0, 3)
                                      .map((enrollment, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                        >
                                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-700 text-sm font-semibold flex-shrink-0">
                                            {enrollment.user_name
                                              ?.charAt(0)
                                              .toUpperCase() || "U"}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                              {enrollment.user_name || "N/A"}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                              {enrollment.course_title ||
                                                enrollment.course_name ||
                                                "Course"}
                                            </p>
                                          </div>
                                          <span
                                            className={`px-2 py-0.5 text-xs capitalize rounded-full ${
                                              enrollment.status === "active" ||
                                              enrollment.enrollment_status ===
                                                "active"
                                                ? "bg-emerald-100 text-emerald-700"
                                                : enrollment.status ===
                                                      "completed" ||
                                                    enrollment.enrollment_status ===
                                                      "completed"
                                                  ? "bg-blue-100 text-blue-700"
                                                  : "bg-amber-100 text-amber-700"
                                            }`}
                                          >
                                            {enrollment.status ||
                                              enrollment.enrollment_status ||
                                              "Pending"}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}

                              {/* Recent Payments */}
                              {adminStats.recentPayments?.length > 0 && (
                                <div className="p-4">
                                  <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Receipt className="w-3.5 h-3.5" />
                                    Recent Payments
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {adminStats.recentPayments
                                      .slice(0, 3)
                                      .map((payment, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                        >
                                          <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center text-amber-700 text-sm font-semibold flex-shrink-0">
                                            <IndianRupee className="w-5 h-5" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                              {payment.payment_code ||
                                                `PAY-${payment.id}`}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                              {formatCurrency(
                                                payment.amount_paid ||
                                                  payment.price,
                                              )}
                                              {payment.user_id &&
                                                ` • User #${payment.user_id}`}
                                            </p>
                                          </div>
                                          <span
                                            className={`px-2 py-0.5 text-xs rounded-full ${
                                              payment.status === "success" ||
                                              payment.status === "captured" ||
                                              payment.status === "completed"
                                                ? "bg-emerald-100 text-emerald-700"
                                                : payment.status === "failed"
                                                  ? "bg-red-100 text-red-700"
                                                  : "bg-amber-100 text-amber-700"
                                            }`}
                                          >
                                            {payment.status || "Pending"}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}

                              {!adminStats.recentUsers?.length &&
                                !adminStats.recentEnrollments?.length &&
                                !adminStats.recentPayments?.length && (
                                  <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                      <Activity className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="text-sm text-gray-500">
                                      No recent activity
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      Activity will appear here as users
                                      interact with the platform
                                    </p>
                                  </div>
                                )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    // Student Overview (existing code)
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-red-200 hover:-translate-y-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-1">
                                Enrolled
                              </p>
                              <p className="text-3xl font-bold text-gray-900">
                                {
                                  enrolledCourses.filter(
                                    (c) => c.enrollment_status === "active",
                                  ).length
                                }
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Active programs
                              </p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl group-hover:scale-110 transition-transform">
                              <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="mt-3 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000"
                              style={{
                                width: `${Math.min((enrolledCourses.filter((c) => c.enrollment_status === "active").length / 10) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 hover:-translate-y-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-1">
                                Completed
                              </p>
                              <p className="text-3xl font-bold text-gray-900">
                                {
                                  enrolledCourses.filter(
                                    (c) => c.enrollment_status === "completed",
                                  ).length
                                }
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Finished programs
                              </p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl group-hover:scale-110 transition-transform">
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                          </div>
                          <div className="mt-3 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000"
                              style={{
                                width: `${Math.min((enrolledCourses.filter((c) => c.enrollment_status === "completed").length / 10) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-amber-200 hover:-translate-y-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-1">
                                In Progress
                              </p>
                              <p className="text-3xl font-bold text-gray-900">
                                {
                                  enrolledCourses.filter(
                                    (c) =>
                                      c.enrollment_status === "active" &&
                                      c.progress > 0 &&
                                      c.progress < 100,
                                  ).length
                                }
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Active learning
                              </p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl group-hover:scale-110 transition-transform">
                              <TrendingUp className="w-6 h-6 text-amber-600" />
                            </div>
                          </div>
                          <div className="mt-3 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-1000"
                              style={{
                                width: `${Math.min(
                                  (enrolledCourses.filter(
                                    (c) =>
                                      c.enrollment_status === "active" &&
                                      c.progress > 0 &&
                                      c.progress < 100,
                                  ).length /
                                    10) *
                                    100,
                                  100,
                                )}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200 hover:-translate-y-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-1">
                                Certificates
                              </p>
                              <p className="text-3xl font-bold text-gray-900">
                                {
                                  enrolledCourses.filter(
                                    (c) => c.certificate_issued,
                                  ).length
                                }
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Earned certificates
                              </p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl group-hover:scale-110 transition-transform">
                              <Award className="w-6 h-6 text-purple-600" />
                            </div>
                          </div>
                          <div className="mt-3 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-1000"
                              style={{
                                width: `${Math.min((enrolledCourses.filter((c) => c.certificate_issued).length / 10) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Recent Activity Section */}
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-red-500" />
                            Recent Activity
                          </h4>
                          {enrolledCourses.length > 0 && (
                            <span className="text-xs text-gray-400">
                              Last {Math.min(enrolledCourses.length, 5)}{" "}
                              activities
                            </span>
                          )}
                        </div>

                        {enrolledCourses.length > 0 ? (
                          <div className="space-y-3">
                            {enrolledCourses
                              .sort(
                                (a, b) =>
                                  new Date(b.enrolled_at || b.created_at) -
                                  new Date(a.enrolled_at || a.created_at),
                              )
                              .slice(0, 5)
                              .map((course, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                                >
                                  <div className="relative">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                      {course.progress === 100 ? (
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                      ) : course.progress > 0 ? (
                                        <TrendingUp className="w-5 h-5 text-amber-600" />
                                      ) : (
                                        <BookOpen className="w-5 h-5 text-blue-600" />
                                      )}
                                    </div>
                                    <div
                                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                                        course.enrollment_status === "active"
                                          ? "bg-green-500"
                                          : course.enrollment_status ===
                                              "completed"
                                            ? "bg-blue-500"
                                            : "bg-gray-400"
                                      }`}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {course.title}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3 mt-0.5">
                                      <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(
                                          course.enrolled_at ||
                                            course.created_at,
                                        ).toLocaleDateString()}
                                      </span>
                                      {course.progress !== undefined && (
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                          {course.progress}% complete
                                        </span>
                                      )}
                                      {course.enrollment_status && (
                                        <span
                                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                            course.enrollment_status ===
                                            "active"
                                              ? "bg-green-100 text-green-700"
                                              : course.enrollment_status ===
                                                  "completed"
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-gray-100 text-gray-700"
                                          }`}
                                        >
                                          {course.enrollment_status
                                            .charAt(0)
                                            .toUpperCase() +
                                            course.enrollment_status.slice(1)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <Link
                                    href={`/programs/${course.course_id}`}
                                    className="shrink-0 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                                  >
                                    {course.progress > 0
                                      ? "Continue →"
                                      : "View →"}
                                  </Link>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Activity className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-sm text-gray-500">
                              No recent activity yet
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Start exploring programs to see your activity here
                            </p>
                            <Link
                              href="/#programs"
                              className="inline-block mt-4 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                            >
                              Browse Programs →
                            </Link>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ) : activeTab === "my-courses" ? (
                <div>
                  <div className="mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                          <BookOpen className="w-7 h-7 text-red-600" />
                          My Learning
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {enrolledCourses.length > 0
                            ? `You are enrolled in ${enrolledCourses.length} course${enrolledCourses.length > 1 ? "s" : ""}`
                            : "Start your learning journey today"}
                        </p>
                      </div>
                      <Link
                        href="/#programs"
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Browse Courses
                      </Link>
                    </div>
                  </div>

                  {/* Loading State */}
                  {enrolledCoursesLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-200">
                      <Loader2 className="w-10 h-10 animate-spin text-red-600" />
                      <p className="mt-3 text-gray-500 font-medium">
                        Loading your courses...
                      </p>
                      <p className="text-sm text-gray-400">
                        Please wait while we fetch your enrolled programs
                      </p>
                    </div>
                  ) : enrolledCourses.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-10 h-10 text-red-400" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        No Courses Enrolled Yet
                      </h4>
                      <p className="text-gray-500 max-w-md mx-auto mb-6">
                        Start your learning journey by enrolling in your first
                        course. Explore our wide range of programs designed just
                        for you.
                      </p>
                      <Link
                        href="/#programs"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 font-medium"
                      >
                        Explore Programs
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : (
                    /* Course Cards */
                    <div className="grid grid-cols-1 gap-5">
                      {enrolledCourses.map((course) => {
                        const progress = course.progress || 0;
                        const isCompleted =
                          course.enrollment_status === "completed";
                        const isActive = course.enrollment_status === "active";

                        return (
                          <div
                            key={course.enrollment_id || course.course_id}
                            className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                          >
                            <div className="flex flex-col md:flex-row">
                              {/* Thumbnail */}
                              <div className="relative md:w-64 h-48 md:h-auto bg-gradient-to-br from-gray-100 to-gray-200 shrink-0 overflow-hidden">
                                {course.thumbnail_url ? (
                                  <Image
                                    src={course.thumbnail_url}
                                    alt={course.title}
                                    width={256}
                                    height={192}
                                    quality={90}
                                    priority={false}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <BookOpen className="w-16 h-16 text-gray-300" />
                                  </div>
                                )}

                                {/* Progress Badge on Thumbnail */}
                                {progress > 0 && progress < 100 && (
                                  <div className="absolute bottom-3 left-3 right-3">
                                    <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5">
                                      <div className="flex items-center justify-between text-white text-xs mb-1">
                                        <span className="font-medium">
                                          Progress
                                        </span>
                                        <span className="font-bold">
                                          {Math.round(progress)}%
                                        </span>
                                      </div>
                                      <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-1000"
                                          style={{ width: `${progress}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Status Badge on Thumbnail */}
                                <div className="absolute top-3 right-3">
                                  <span
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm shadow-lg ${
                                      isCompleted
                                        ? "bg-green-500/90 text-white"
                                        : isActive
                                          ? "bg-blue-500/90 text-white"
                                          : "bg-gray-500/90 text-white"
                                    }`}
                                  >
                                    {isCompleted
                                      ? "Completed"
                                      : isActive
                                        ? "In Progress"
                                        : "Pending"}
                                  </span>
                                </div>
                              </div>

                              {/* Content */}
                              <div className="flex-1 p-5 sm:p-6">
                                <div className="flex flex-col h-full">
                                  {/* Course Info */}
                                  <div className="flex-1">
                                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                      <h4 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-1">
                                        {course.title}
                                      </h4>
                                      {course.course_code && (
                                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg whitespace-nowrap">
                                          {course.course_code}
                                        </span>
                                      )}
                                    </div>

                                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                      {course.description ||
                                        "No description available"}
                                    </p>

                                    {/* Course Meta */}
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg">
                                        <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                                        {course.category || "General"}
                                      </span>
                                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg">
                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                        {course.duration || "Self-paced"}
                                      </span>
                                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg">
                                        <Award className="w-3.5 h-3.5 text-gray-400" />
                                        {course.level || "Beginner"}
                                      </span>
                                      {course.enrolled_at && (
                                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg">
                                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                          {new Date(
                                            course.enrolled_at,
                                          ).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>

                                    {/* Price & Certificate */}
                                    <div className="flex flex-wrap items-center gap-4 mt-3">
                                      {course.final_price && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-lg font-bold text-gray-900">
                                            ₹{course.final_price}
                                          </span>
                                          {course.original_price &&
                                            course.discount > 0 && (
                                              <>
                                                <span className="text-sm text-gray-400 line-through">
                                                  ₹{course.original_price}
                                                </span>
                                                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-lg">
                                                  {Math.round(course.discount)}%
                                                  OFF
                                                </span>
                                              </>
                                            )}
                                        </div>
                                      )}
                                      {course.certificate_issued && (
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-600 text-xs font-semibold rounded-lg">
                                          <Award className="w-3.5 h-3.5" />
                                          Certificate Issued
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                                    <Link
                                      href={`/programs/${course.course_id}`}
                                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg font-medium text-sm"
                                    >
                                      {progress > 0 && progress < 100 ? (
                                        <>
                                          <RefreshCw className="w-4 h-4" />
                                          Continue Learning
                                        </>
                                      ) : progress === 100 ? (
                                        <>
                                          <CheckCircle className="w-4 h-4" />
                                          View Course
                                        </>
                                      ) : (
                                        <>
                                          <Play className="w-4 h-4" />
                                          Start Learning
                                        </>
                                      )}
                                    </Link>

                                    {course.certificate_issued && (
                                      <button
                                        onClick={() =>
                                          window.open(
                                            `/certificate/${course.enrollment_id}`,
                                            "_blank",
                                          )
                                        }
                                        className="px-4 py-2.5 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-all text-sm font-medium flex items-center gap-2"
                                      >
                                        <FileCheck className="w-4 h-4" />
                                        Certificate
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : activeTab === "programs" ? (
                // Programs Tab (existing code - kept as is)
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6">
                    <div className="w-full sm:w-auto">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Your Programs
                      </h3>
                      <p className="text-sm text-gray-500 hidden xs:block">
                        Create and manage your courses and programs
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:flex-none sm:w-48 md:w-64">
                        <input
                          type="text"
                          placeholder="Search programs..."
                          value={debouncedSearch}
                          onChange={(e) => setDebouncedSearch(e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 pr-8 sm:pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                        />
                        {debouncedSearch && (
                          <button
                            onClick={() => {
                              setDebouncedSearch("");
                              const newFilters = { ...filters, search: "" };
                              setFilters(newFilters);
                              fetchPrograms(newFilters);
                            }}
                            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3 py-2 border rounded-lg transition-colors flex-shrink-0 ${
                          showFilters || Object.values(filters).some((f) => f)
                            ? "bg-red-50 border-red-200 text-red-600"
                            : "border-gray-300 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                          />
                        </svg>
                        <span className="text-sm hidden xs:inline">
                          Filters
                        </span>
                        <span className="text-sm xs:hidden">Filter</span>
                        {Object.values(filters).some((f) => f) && (
                          <span className="w-2 h-2 bg-red-500 rounded-full shrink-0"></span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setShowCreateProgram(true);
                          setEditingProgram(null);
                          resetProgramForm();
                        }}
                        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex-shrink-0 text-sm sm:text-base"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="hidden xs:inline">Create Program</span>
                        <span className="xs:hidden">Create</span>
                      </button>

                       <button
                            onClick={handleExportCSV}
                            disabled={isExporting}
                            className={`
                              flex items-center gap-2 px-3 py-2 rounded-lg font-medium
                              transition-all duration-200 ease-in-out
                              ${isExporting 
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                : "bg-linear-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg hover:shadow-emerald-200 active:scale-95"
                              }
                              border-0 shadow-sm
                            `}
                          >
                            {isExporting ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Exporting...</span>
                                <span className="ml-1 text-xs opacity-75">Please wait</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                <span>Export Data</span>
                                <span className="hidden sm:inline text-xs opacity-80">
                                  CSV
                                </span>
                                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                              </>
                            )}
                          </button>
                    </div>
                  </div>

                  {showFilters && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">
                          Filters
                        </h4>
                        <button
                          onClick={clearFilters}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          <select
                            value={filters.category}
                            onChange={(e) => {
                              const value = e.target.value;
                              const newFilters = {
                                ...filters,
                                category: value,
                              };
                              setFilters(newFilters);
                              fetchPrograms(newFilters);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                          >
                            <option value="">All Categories</option>
                            {getUniqueValues("category").map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Level
                          </label>
                          <select
                            value={filters.level}
                            onChange={(e) => {
                              const value = e.target.value;
                              const newFilters = {
                                ...filters,
                                level: value,
                              };
                              setFilters(newFilters);
                              fetchPrograms(newFilters);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                          >
                            <option value="">All Levels</option>
                            {getUniqueValues("level").map((level) => (
                              <option key={level} value={level}>
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Status
                          </label>
                          <select
                            value={filters.status}
                            onChange={(e) => {
                              const value = e.target.value;
                              const newFilters = {
                                ...filters,
                                status: value,
                              };
                              setFilters(newFilters);
                              fetchPrograms(newFilters);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                          >
                            <option value="">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="deactivated">Deactivated</option>
                          </select>
                        </div>

                        <div className="flex items-end">
                          <div className="w-full p-2 bg-white rounded-md border border-gray-200">
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">
                                {filteredPrograms.length}
                              </span>{" "}
                              program{filteredPrograms.length !== 1 ? "s" : ""}{" "}
                              found
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                                className={`w-full px-3 py-2 border ${programErrors.title ? "border-red-300" : "border-gray-300"} rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
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
                                className={`w-full px-3 py-2 border ${programErrors.category ? "border-red-300" : "border-gray-300"} rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
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
                                className={`w-full px-3 py-2 border ${programErrors.level ? "border-red-300" : "border-gray-300"} rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
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
                                className={`w-full px-3 py-2 border ${programErrors.duration ? "border-red-300" : "border-gray-300"} rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
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
                                className={`w-full px-3 py-2 border ${programErrors.price ? "border-red-300" : "border-gray-300"} rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
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
                                Discount
                              </label>
                              <input
                                type="number"
                                name="discount"
                                value={programFormData.discount || ""}
                                onChange={handleProgramFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                placeholder="0"
                                min="0"
                                // max="100"
                                step="1"
                              />
                              <p className="mt-1 text-xs text-gray-500">
                                Enter discount percentage
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
                                className={`w-full px-3 py-2 border ${programErrors.description ? "border-red-300" : "border-gray-300"} rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
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

                       
{editingProgram && (
  <div className="border-b border-gray-200 pb-4">
    <div className="flex items-center justify-between mb-3">
      <h5 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <FileCheck className="w-4 h-4 text-red-500" />
        Assessments (
        {editingProgram.assessment && Array.isArray(editingProgram.assessment)
          ? editingProgram.assessment.length
          : 0}
        )
      </h5>
      {editingProgram && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              const courseId = editingProgram?.id || editingProgram?.courseId;
              if (!courseId) {
                toast.error("Course ID is missing. Please refresh the page.");
                return;
              }
              handleOpenCreateAssessment(courseId);
            }}
            className="flex items-center gap-1.5 text-sm bg-red-50 px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Assessment
          </button>
        </div>
      )}
    </div>

    {editingProgram.assessment && 
    Array.isArray(editingProgram.assessment) &&
    editingProgram.assessment.length > 0 ? (
      <div className="space-y-4">
        {editingProgram.assessment.map((assessment, index) => {
          const courseId = editingProgram?.id || editingProgram?.courseId || editingProgram?.course_id;
          const isPdfTask = assessment.type === 'pdf_task';
          const isMcq = assessment.type === 'mcq' || !assessment.type;
          
          return (
            <div
              key={assessment.id || `assessment-${index}`}
              className="p-4 bg-white rounded-lg border border-gray-200"
            >
              {/* Assessment Header with Actions */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-red-50 text-red-600 text-xs font-bold rounded-full">
                    {index + 1}
                  </span>
                  <h6 className="text-sm font-semibold text-gray-700">
                    {assessment.title || `Assessment ${index + 1}`}
                  </h6>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(assessment.status)}`}
                  >
                    {assessment.status || "draft"}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    isPdfTask ? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'
                  }`}>
                    {isPdfTask ? 'PDF Task' : 'MCQ'}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (!courseId) {
                        toast.error("Course ID is missing.");
                        return;
                      }
                      handleOpenEditAssessment(
                        courseId,
                        assessment,
                        index,
                      );
                    }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Assessment"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const deleteCourseId = editingProgram?.id || editingProgram?.courseId || editingProgram?.course_id;
                      
                      if (!deleteCourseId) {
                        toast.error("Course ID is missing. Please refresh the page.");
                        console.error("Course ID missing:", editingProgram);
                        return;
                      }
                      
                      if (!assessment.id) {
                        toast.error("Assessment ID is missing. Please refresh the page.");
                        console.error("Assessment ID missing:", assessment);
                        return;
                      }
                      
                      if (
                        confirm(
                          `Are you sure you want to delete "${assessment.title || 'this assessment'}"?`,
                        )
                      ) {
                        handleDeleteAssessment(deleteCourseId, assessment.id);
                      }
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Assessment"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Assessment Details - Shows different fields based on type */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-400">Type</p>
                  <p className="text-sm font-medium text-gray-700 capitalize">
                    {isPdfTask ? 'PDF Task' : 'MCQ'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Passing Score</p>
                  <p className="text-sm font-medium text-emerald-600">
                    {assessment.passing_score || 60}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Duration</p>
                  <p className="text-sm font-medium text-blue-600">
                    {assessment.duration_minutes || 30} min
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Status </p>
                  <p className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(assessment.status)}`}>
                    {assessment.status || 'draft'}
                  </p>
                </div>
              </div>

              {/* PDF Task Specific Details */}
              {isPdfTask && (
                <div className="mb-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="grid grid-cols-1 gap-2">
                    {assessment.instructions && (
                      <div>
                        <p className="text-xs text-gray-400">Instructions</p>
                        <p className="text-sm text-gray-700 mt-0.5">{assessment.instructions}</p>
                      </div>
                    )}
                    {assessment.pdf_template_url && (
                      <div>
                        <p className="text-xs text-gray-400">PDF Template</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <FileText className="w-4 h-4 text-red-500" />
                          <a
                            href={assessment.pdf_template_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                          >
                            {assessment.pdf_template_url.split('/').pop() || 'View PDF'}
                          </a>
                          <a
                            href={assessment.pdf_template_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* MCQ Specific Details */}
              {isMcq && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">
                      Questions ({assessment.questions?.length || 0})
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (!courseId) {
                          toast.error("Course ID is missing.");
                          return;
                        }
                        setSelectedAssessmentId(courseId);
                        setSelectedAssessmentIndex(index);
                        setShowAddQuestion(true);
                        setEditingQuestion(null);
                        resetQuestionForm();
                      }}
                      className="text-xs text-emerald-600 hover:text-emerald-700 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Question
                    </button>
                  </div>

                  {/* Questions List - Only for MCQ */}
                  {assessment.questions && assessment.questions.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {assessment.questions.map((question, qIdx) => (
                        <div key={question.id || qIdx} className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-5 h-5 bg-red-50 text-red-600 text-xs font-bold rounded-full flex-shrink-0">
                                  {qIdx + 1}
                                </span>
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {question.question_text}
                                </p>
                              </div>
                              <div className="mt-1 flex flex-wrap gap-1 text-xs">
                                <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                                  A: {question.option_a}
                                </span>
                                <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                                  B: {question.option_b}
                                </span>
                                {question.option_c && (
                                  <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                                    C: {question.option_c}
                                  </span>
                                )}
                                {question.option_d && (
                                  <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                                    D: {question.option_d}
                                  </span>
                                )}
                                <span className="px-1.5 py-0.5 bg-emerald-50 rounded text-emerald-600 font-medium">
                                  ✓ {question.correct_option}
                                </span>
                                <span className="px-1.5 py-0.5 bg-blue-50 rounded text-blue-600">
                                  {question.marks || 1} mark{question.marks > 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button
                                type="button"
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
                                    order_number: question.order_number || qIdx + 1,
                                    status: question.status || "draft",
                                  });
                                  setSelectedAssessmentId(courseId);
                                  setSelectedAssessmentIndex(index);
                                  setShowAddQuestion(true);
                                }}
                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Edit Question"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!question?.id) {
                                    toast.error("Question ID is missing.");
                                    return;
                                  }
                                  if (!courseId) {
                                    toast.error("Course ID is missing.");
                                    return;
                                  }
                                  if (confirm("Delete this question?")) {
                                    await handleDeleteQuestion(
                                      courseId,
                                      question?.id,
                                      assessment?.id,
                                    );
                                     await refreshEditingProgram();
                                    await refreshAssessmentData(courseId);
                                  }
                                }}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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
                    <div className="text-center py-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      <p className="text-sm text-gray-400">No questions added yet</p>
                      <p className="text-xs text-gray-300">Click "Add Question" to get started</p>
                    </div>
                  )}

                  {/* Question Form - Only for MCQ */}
                  {showAddQuestion &&
                    selectedAssessmentId === courseId &&
                    selectedAssessmentIndex === index &&
                    editingProgram.assessment &&
                    editingProgram.assessment[index] && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <QuestionForm
                          editingQuestion={editingQuestion}
                          questionFormData={questionFormData}
                          questionErrors={questionErrors}
                          questionSaving={questionSaving}
                          handleQuestionFormChange={(e) =>
                            handleQuestionFormChange(
                              e,
                              setQuestionFormData,
                              setQuestionErrors,
                            )
                          }
                          handleQuestionSubmit={async () => {
                            const assessment = editingProgram.assessment?.[index];
                            if (assessment && courseId) {
                              await handleQuestionSubmit(
                                courseId,
                                assessment.id,
                                questionFormData,
                                editingQuestion,
                                setQuestionSaving,
                                resetQuestionForm,
                                async () => {
                                  setShowAddQuestion(false);
                                   await refreshEditingProgram();
                                  await refreshAssessmentData(courseId);
                                  await refreshPrograms();
                                },
                                setEditingQuestion,
                                setQuestionErrors,
                              );
                            }
                          }}
                          setShowAddQuestion={setShowAddQuestion}
                          setEditingQuestion={setEditingQuestion}
                          resetQuestionForm={resetQuestionForm}
                          courseId={courseId}
                          assessmentId={editingProgram.assessment?.[index]?.id}
                        />
                      </div>
                    )}
                </div>
              )}

              {/* For PDF Task - Show a message instead of questions */}
              {isPdfTask && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">
                      Task Details
                    </p>
                    <span className="text-xs text-gray-400">
                      PDF-based assessment
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      This is a PDF task assessment
                    </p>
                    {assessment.pdf_template_url && (
                      <a
                        href={assessment.pdf_template_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        View PDF Template
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    ) : (
      <div className="text-center py-6 bg-white rounded-lg border border-dashed border-gray-200">
        <FileCheck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-400">No assessments created yet</p>
        <p className="text-xs text-gray-300 mt-0.5">Click "Add Assessment" to create one</p>
      </div>
    )}
  </div>
)}
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
                                    {(lesson.content_type === "video" ||
                                      lesson.content_type ===
                                        "interactive") && (
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
                                    )}
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
                                          Uploading... {thumbnailUploadProgress}
                                          %
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
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

                  {/* Programs List - kept as is */}
                  {programsLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto" />
                      <p className="mt-2 text-gray-500">Loading programs...</p>
                    </div>
                  ) : filteredPrograms.length === 0 ? (
                    <div className="text-center py-12">
                      {filters.search ||
                      filters.category ||
                      filters.level ||
                      filters.status ? (
                        <div>
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                              className="w-8 h-8 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                              />
                            </svg>
                          </div>
                          <p className="text-gray-500 mb-2">
                            No programs match your filters
                          </p>
                          <button
                            onClick={clearFilters}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Clear all filters
                          </button>
                        </div>
                      ) : (
                        <div>
                          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">
                            No programs created yet
                          </p>
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
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredPrograms.map((program) => {
                          const assessmentsList = program?.assessment || [];

                        return (
                          <ProgramCard
                            key={program.id}
                            program={program}
                            onSelectCourse={handleSelectCourse}
                            assessment={assessmentsList}
                            getStatusBadge={getStatusBadge}
                            onEditProgram={handleEditProgram}
                            onDeleteProgram={handleDeleteProgram}
                            onEditAssessment={handleOpenEditAssessment}
                            onDeleteAssessment={handleDeleteAssessment}
                            onCreateAssessment={handleOpenCreateAssessment}
                            onManageQuestions={handleOpenManageQuestions}
                            onActivateAssessment={
                              assessmentOps.handleActivateAssessment
                            }
                            onDeactivateAssessment={
                              assessmentOps.handleDeactivateAssessment
                            }
                            onActivateCourse={handleActivateCourse}
                            onDeactivateCourse={handleDeactivateCourse}
                            expandedAssessment={expandedAssessment}
                            setExpandedAssessment={setExpandedAssessment}
                            showAddQuestion={showAddQuestion}
                            selectedAssessmentId={selectedAssessmentId}
                            editingQuestion={editingQuestion}
                            questionFormData={questionFormData}
                            questionErrors={questionErrors}
                            questionSaving={questionSaving}
                            handleQuestionFormChange={(e) =>
                              handleQuestionFormChange(
                                e,
                                setQuestionFormData,
                                setQuestionErrors,
                              )
                            }
                            handleQuestionSubmit={(courseId, assessmentId) =>
                              handleQuestionSubmit(
                                courseId,
                                assessmentId,
                                questionFormData,
                                editingQuestion,
                                setQuestionSaving,
                                resetQuestionForm,
                                () => {
                                  setShowAddQuestion(false);
                                  refreshPrograms();
                                },
                                setEditingQuestion,
                                setQuestionErrors,
                              )
                            }
                            handleDeleteQuestion={async (
                              courseId,
                              questionId,
                            ) => {
                              await handleDeleteQuestion(courseId, questionId);
                              await refreshPrograms();
                              const courseDetails =
                                await fetchCourseDetails(courseId);
                              if (courseDetails && courseDetails.assessment) {
                                setAssessments((prev) => ({
                                  ...prev,
                                  [courseId]: courseDetails.assessment,
                                }));
                              }
                            }}
                            handleEditQuestion={handleEditQuestion}
                            resetQuestionForm={resetQuestionForm}
                            setShowAddQuestion={setShowAddQuestion}
                            setEditingQuestion={setEditingQuestion}
                            setQuestionFormData={setQuestionFormData}
                            QuestionForm={QuestionForm}
                            isEditingMode={false}
                            setSelectedAssessmentId={setSelectedAssessmentId}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : activeTab === "admin" ? (
                // Admin Management Tab
                <div>
                  <AdminManagement
                    session={session}
                    onStatsUpdate={(stats) => {
                      setAdminStats((prev) => ({
                        ...prev,
                        ...stats,
                      }));
                    }}
                  />
                </div>
              ) : activeTab === "payments" ? (
                // Payments Tab
                <div>
                
                  <PaymentManagement
                    onStatsUpdate={(stats) => {
                      setAdminStats((prev) => ({
                        ...prev,
                        ...stats,
                      }));
                    }}
                  />
                </div>
              ) : activeTab === "faqs" ? (
                <div>
                  <FAQManagement
                    session={session}
                    onStatsUpdate={(stats) => {
                      setAdminStats((prev) => ({
                        ...prev,
                        ...stats,
                      }));
                    }}
                  />
                </div>
              ) : (
                // Change Password Tab (existing code)
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
                    {/* ... existing password form fields */}
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
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium bg-[#CC0000] text-white hover:bg-[#B30000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Assessment Modal */}
      <AssessmentModal
        isOpen={isAssessmentModalOpen}
        onClose={() => {
          setIsAssessmentModalOpen(false);
          resetAssessmentForm();
          setEditingAssessment(null);
          setAssessmentSuccess(false);
        }}
        editingAssessment={editingAssessment}
        editingIndex={selectedAssessmentIndex}
        assessmentFormData={assessmentFormData}
        assessmentErrors={assessmentErrors}
        assessmentSaving={assessmentSaving}
        assessmentSuccess={assessmentSuccess}
        handleAssessmentFormChange={handleAssessmentFormChange}
        handleAssessmentSubmit={(courseId) =>
          handleAssessmentSubmit(
            courseId,
            assessmentFormData,
            editingAssessment,
            selectedAssessmentIndex,
          )
        }
        
        setAssessmentSuccess={setAssessmentSuccess}
        resetAssessmentForm={resetAssessmentForm}
        setEditingAssessment={setEditingAssessment}
        courseId={selectedAssessmentId}
        programs={programs}
      />
    </div>
  );
}
