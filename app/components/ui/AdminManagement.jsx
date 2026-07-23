// components/Admin/AdminManagement.js

import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Search,
  Filter,
  X,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  ChevronDown,
  ChevronRight,
  User,
  Mail,
  Clock,
  Award,
  AlertCircle,
  RefreshCw,
  UserPlus,
  Download,
  GraduationCap,
  TrendingUp,
  MessageSquare,
  Inbox,
  CheckCheck,
  Trash,
  Reply,
  ChevronLeft,
  ChevronsLeft,
  ChevronRight as ChevronRightIcon,
  ChevronsRight,
  FileText,
  Edit,
  Trash2Icon,
  Plus,
  Star,
  StarOff,
  ThumbsUp,
  ThumbsDown,
  Send,
  History,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";
import UserDetailModal from "./UserDetailModal";
import { adminService } from "@/helper/services/adminService";
import { assessmentApi } from "@/helper/services/assessmentApi";
import fetchApiResponse from "@/helper/api_data_store";
import useCSVExport from "@/helper/hooks/useCSVExport";
import { useSession } from "next-auth/react";

const AdminManagement = () => {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [reattemptRequests, setReattemptRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedUser, setExpandedUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactDetail, setShowContactDetail] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [showAttemptDetail, setShowAttemptDetail] = useState(false);

  const { isExporting, exportUsers, exportEnrollments, exportContacts } =
    useCSVExport(session);

  // User filters
  const [userFilters, setUserFilters] = useState({
    search: "",
    role: "",
    is_active: "",
  });

  // Enrollment filters
  const [enrollmentFilters, setEnrollmentFilters] = useState({
    user_id: "",
    course_id: "",
    status: "",
    is_active: "",
  });

  // Contact filters
  const [contactFilters, setContactFilters] = useState({
    filter: "",
    is_read: "",
  });

  // Assessment filters
  const [assessmentFilters, setAssessmentFilters] = useState({
    search: "",
    type: "",
    status: "",
    course_id: "",
  });

  // Attempt filters
  const [attemptFilters, setAttemptFilters] = useState({
    user_id: "",
    assessment_id: "",
    course_id: "",
    passed: "",
    review_status: "",
    search: "",
  });

  // Reattempt filters
  const [reattemptFilters, setReattemptFilters] = useState({
    status: "",
    user_id: "",
    course_id: "",
  });

  const [showUserFilters, setShowUserFilters] = useState(false);
  const [showEnrollmentFilters, setShowEnrollmentFilters] = useState(false);
  const [showContactFilters, setShowContactFilters] = useState(false);
  const [showAssessmentFilters, setShowAssessmentFilters] = useState(false);
  const [showAttemptFilters, setShowAttemptFilters] = useState(false);
  const [showReattemptFilters, setShowReattemptFilters] = useState(false);

  // Pagination
  const [userPagination, setUserPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [enrollmentPagination, setEnrollmentPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [contactPagination, setContactPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [assessmentPagination, setAssessmentPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [attemptPagination, setAttemptPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [reattemptPagination, setReattemptPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  let coursesCache = null;
  let assessmentsCache = {};
  let lastFetchTime = {};

  // Fetch users
  const fetchUsers = async (page = userPagination.page) => {
    setLoading(true);
    try {
      const params = {
        ...userFilters,
        page,
        limit: userPagination.limit,
      };
      const result = await adminService.listUsers(params, session);
      if (result.success) {
        setUsers(result.data || []);
        if (result.pagination) {
          setUserPagination(result.pagination);
        }
      } else {
        toast.error(result.error);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch enrollments
  const fetchEnrollments = async (page = enrollmentPagination.page) => {
    setLoading(true);
    try {
      const params = {
        ...enrollmentFilters,
        page,
        limit: enrollmentPagination.limit,
      };
      const result = await adminService.listEnrollments(params, session);
      if (result.success) {
        setEnrollments(result.data || []);
        if (result.pagination) {
          setEnrollmentPagination(result.pagination);
        }
      } else {
        toast.error(result.error);
        setEnrollments([]);
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      toast.error("Failed to fetch enrollments");
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch contacts
  const fetchContacts = async (page = contactPagination.page) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: contactPagination.limit,
      };

      if (contactFilters.filter && contactFilters.filter.trim() !== "") {
        params.filter = contactFilters.filter.trim();
      }
      if (contactFilters.is_read !== "") {
        params.is_read = contactFilters.is_read;
      }

      const result = await adminService.listContacts(params, session);

      if (result.success) {
        let data = result.data || [];
        setContacts(data);
        if (result.pagination) {
          setContactPagination(result.pagination);
        }
      } else {
        toast.error(result.error);
        setContacts([]);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Failed to fetch contacts");
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const getCachedCourses = async (session) => {
    if (coursesCache) return coursesCache;

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
        coursesCache = Array.isArray(response.data) ? response.data : [];
        return coursesCache;
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
    return [];
  };

  const getCachedAssessments = async (courseId, session) => {
    if (assessmentsCache[courseId]) return assessmentsCache[courseId];

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
        let assessmentData = response.data.assessment || [];
        if (!Array.isArray(assessmentData)) {
          assessmentData = assessmentData ? [assessmentData] : [];
        }
        assessmentsCache[courseId] = assessmentData;
        return assessmentData;
      }
    } catch (error) {
      console.error(
        `Error fetching assessments for course ${courseId}:`,
        error,
      );
    }
    return [];
  };

  // Clear caches when needed (you can call this on logout or when data changes)
  const clearCaches = () => {
    coursesCache = null;
    assessmentsCache = {};
    lastFetchTime = {};
  };

  // Fetch assessments - Updated to handle cases where assessments might not exist

  const fetchAssessments = async (page = assessmentPagination.page) => {
    setLoading(true);
    try {
      const courses = await getCachedCourses(session);
      let allAssessments = [];

      // Filter courses if course_id is provided
      const filteredCourses = assessmentFilters.course_id
        ? courses.filter((c) => c.id === parseInt(assessmentFilters.course_id))
        : courses;

      for (const course of filteredCourses) {
        const assessmentData = await getCachedAssessments(course.id, session);

        if (assessmentData.length > 0) {
          assessmentData.forEach((assessment) => {
            if (assessment && assessment.id) {
              allAssessments.push({
                ...assessment,
                course_id: course.id,
                course_title: course.title,
                course_code: course.course_code,
                is_default:
                  assessment.is_default ||
                  course.default_assessment_id === assessment.id ||
                  course.default_mcq_id === assessment.id ||
                  course.default_pdf_id === assessment.id,
              });
            }
          });
        }
      }

      // Apply filters
      let filtered = allAssessments;

      if (assessmentFilters.search) {
        const search = assessmentFilters.search.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.title?.toLowerCase().includes(search) ||
            a.course_title?.toLowerCase().includes(search) ||
            a.description?.toLowerCase().includes(search),
        );
      }

      if (assessmentFilters.type) {
        filtered = filtered.filter((a) => a.type === assessmentFilters.type);
      }

      if (assessmentFilters.status) {
        filtered = filtered.filter(
          (a) => a.status === assessmentFilters.status,
        );
      }

      // Calculate pagination
      const total = filtered.length;
      const totalPages = Math.ceil(total / assessmentPagination.limit);
      const start = (page - 1) * assessmentPagination.limit;
      const end = start + assessmentPagination.limit;
      const paginatedData = filtered.slice(start, end);

      setAssessments(paginatedData);
      setAssessmentPagination({
        ...assessmentPagination,
        page,
        total,
        totalPages,
      });

      if (
        total === 0 &&
        !assessmentFilters.search &&
        !assessmentFilters.type &&
        !assessmentFilters.status &&
        !assessmentFilters.course_id
      ) {
        toast.info(
          "No assessments found. Create an assessment for a course to see it here.",
          {
            autoClose: 5000,
          },
        );
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
      toast.error("Failed to fetch assessments");
      setAssessments([]);
      setAssessmentPagination({
        ...assessmentPagination,
        total: 0,
        totalPages: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // Optimized fetchAttempts - Single API call with caching
  const fetchAttempts = async (page = attemptPagination.page) => {
    setLoading(true);
    try {
      // If assessment_id is provided, find the course and make a single API call
      if (attemptFilters.assessment_id) {
        // Get courses from cache
        const courses = await getCachedCourses(session);
        let targetCourseId = null;

        // Find which course has this assessment
        for (const course of courses) {
          const assessments = await getCachedAssessments(course.id, session);
          const found = assessments.some(
            (a) => a.id === parseInt(attemptFilters.assessment_id),
          );
          if (found) {
            targetCourseId = course.id;
            break;
          }
        }

        if (targetCourseId) {
          // Build params without assessment_id and course_id
          const params = {
            page: page,
            limit: attemptPagination.limit,
          };

          // Add other filters (except assessment_id and course_id)
          if (
            attemptFilters.passed !== "" &&
            attemptFilters.passed !== undefined
          ) {
            params.passed = attemptFilters.passed;
          }
          if (attemptFilters.review_status) {
            params.review_status = attemptFilters.review_status;
          }
          if (attemptFilters.search) {
            params.search = attemptFilters.search;
          }

          // Make single API call with assessment_id in query
          const response = await assessmentApi.listAllAttempts(
            targetCourseId,
            { ...params, assessment_id: attemptFilters.assessment_id },
            session,
          );

          if (response?.meta?.status === 200) {
            let data =
              response.data?.attempts ||
              response.data?.data ||
              response.data ||
              [];
            if (!Array.isArray(data)) {
              data = [];
            }

            // Data already has course and assessment info from API
            setAttempts(data);
            const pagination = response.data?.pagination || {
              page: page,
              limit: attemptPagination.limit,
              total: data.length,
              totalPages: Math.ceil(data.length / attemptPagination.limit),
            };
            setAttemptPagination({
              ...attemptPagination,
              page: pagination.page || page,
              total: pagination.total || data.length,
              totalPages:
                pagination.totalPages ||
                Math.ceil(
                  (pagination.total || data.length) / attemptPagination.limit,
                ),
            });
            setLoading(false);
            return;
          }
        }
      }

      // If no assessment_id or course not found, use the optimized multi-course approach
      // This is the fallback when no assessment_id is provided
      const courses = await getCachedCourses(session);
      let allAttempts = [];
      let errorCount = 0;
      let skippedNoAssessments = 0;

      // Filter courses if course_id is provided
      const filteredCourses = attemptFilters.course_id
        ? courses.filter((c) => c.id === parseInt(attemptFilters.course_id))
        : courses;

      // Process each course
      for (const course of filteredCourses) {
        const assessments = await getCachedAssessments(course.id, session);

        if (assessments.length === 0) {
          skippedNoAssessments++;
          continue;
        }

        // Prepare params (without filters that will be applied client-side)
        const params = {
          page: 1,
          limit: 100, // Get all attempts per course
        };

        // Fetch attempts for each assessment
        for (const assessment of assessments) {
          try {
            const response = await assessmentApi.listAllAttempts(
              course.id,
              { ...params, assessment_id: assessment.id },
              session,
            );

            if (response?.meta?.status === 200) {
              let data =
                response.data?.attempts ||
                response.data?.data ||
                response.data ||
                [];
              if (!Array.isArray(data)) {
                data = [];
              }

              data.forEach((attempt) => {
                allAttempts.push({
                  ...attempt,
                  // API already returns these, but just in case
                  course_id: course.id,
                  course_title: course.title,
                  course_code: course.course_code,
                });
              });
            } else if (response?.meta?.status !== 404) {
              errorCount++;
            }
          } catch (error) {
            console.error(
              `Error fetching attempts for assessment ${assessment.id}:`,
              error,
            );
            errorCount++;
          }
        }
      }

      // Apply filters client-side
      if (attemptFilters.search) {
        const search = attemptFilters.search.toLowerCase();
        allAttempts = allAttempts.filter(
          (a) =>
            a.user_name?.toLowerCase().includes(search) ||
            a.assessment_title?.toLowerCase().includes(search) ||
            a.course_title?.toLowerCase().includes(search) ||
            a.user_email?.toLowerCase().includes(search),
        );
      }

      if (attemptFilters.passed !== "" && attemptFilters.passed !== undefined) {
        const passed = attemptFilters.passed === "true";
        allAttempts = allAttempts.filter((a) => a.passed === passed);
      }

      if (attemptFilters.review_status) {
        allAttempts = allAttempts.filter(
          (a) => a.review_status === attemptFilters.review_status,
        );
      }

      // Sort by submitted_at (most recent first)
      allAttempts.sort((a, b) => {
        const dateA = new Date(a.submitted_at || a.created_at || 0);
        const dateB = new Date(b.submitted_at || b.created_at || 0);
        return dateB - dateA;
      });

      // Paginate
      const total = allAttempts.length;
      const totalPages = Math.ceil(total / attemptPagination.limit);
      const start = (page - 1) * attemptPagination.limit;
      const end = start + attemptPagination.limit;
      const paginatedData = allAttempts.slice(start, end);

      setAttempts(paginatedData);
      setAttemptPagination({
        ...attemptPagination,
        page,
        total,
        totalPages,
      });

      // Show relevant messages
      if (skippedNoAssessments > 0 && !attemptFilters.assessment_id) {
        toast.info(
          `${skippedNoAssessments} course(s) have no assessments yet.`,
          {
            autoClose: 3000,
          },
        );
      }

      if (errorCount > 0) {
        toast.warning(
          `Some data (${errorCount} assessments) could not be loaded.`,
          {
            autoClose: 5000,
          },
        );
      }

      if (
        total === 0 &&
        !attemptFilters.search &&
        !attemptFilters.passed &&
        !attemptFilters.review_status &&
        !attemptFilters.assessment_id
      ) {
        toast.info(
          "No attempts found. Students need to submit assessments to see data here.",
          {
            autoClose: 4000,
          },
        );
      }
    } catch (error) {
      console.error("Error fetching attempts:", error);
      toast.error("Failed to fetch attempts");
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  };

  // Update fetchReattemptRequests with debounce protection
  const fetchReattemptRequests = async (page = reattemptPagination.page) => {
    setLoading(true);

    try {
      // Get cached courses
      await fetchAssessments(1);

      const courses = await getCachedCourses(session);
      const allReattemptsMap = new Map(); // Use Map to deduplicate by ID
      let errorCount = 0;

      // Filter courses if course_id is provided
      const filteredCourses = reattemptFilters.course_id
        ? courses.filter((c) => c.id === parseInt(reattemptFilters.course_id))
        : courses;

      //  const courseAssessmentsMap = new Map();

      for (const course of filteredCourses) {
        try {
          const params = {
            page: 1,
            limit: 100,
          };

          if (reattemptFilters.status) {
            params.status = reattemptFilters.status;
          }
          if (reattemptFilters.user_id) {
            params.user_id = reattemptFilters.user_id;
          }

          const response = await assessmentApi.listReattemptRequests(
            course.id,
            params,
            session,
          );

          if (response?.meta?.status === 200) {
            let data = response.data?.data || response.data || [];
            if (!Array.isArray(data)) {
              data = [];
            }

            data.forEach((request) => {
              if (!allReattemptsMap.has(request.id)) {
                allReattemptsMap.set(request.id, {
                  ...request,
                  course_id: course.id,
                  course_title: course.title,
                  course_code: course.course_code,
                });
              }
            });
          } else if (response?.meta?.status !== 404) {
            errorCount++;
          }
        } catch (error) {
          console.error(
            `Error fetching reattempts for course ${course.id}:`,
            error,
          );
          errorCount++;
        }
      }

      // Convert Map to array
      let allReattempts = Array.from(allReattemptsMap.values());

      // Apply additional filters client-side (if needed)
      if (reattemptFilters.status) {
        allReattempts = allReattempts.filter(
          (r) => r.status === reattemptFilters.status,
        );
      }

      if (reattemptFilters.user_id) {
        allReattempts = allReattempts.filter(
          (r) =>
            r.user_id === parseInt(reattemptFilters.user_id) ||
            r.user_id?.toString() === reattemptFilters.user_id,
        );
      }

      // Sort by requested_at (most recent first)
      allReattempts.sort((a, b) => {
        const dateA = new Date(a.requested_at || a.created_at || 0);
        const dateB = new Date(b.requested_at || b.created_at || 0);
        return dateB - dateA;
      });

      // Paginate
      const total = allReattempts.length;
      const totalPages = Math.ceil(total / reattemptPagination.limit);
      const start = (page - 1) * reattemptPagination.limit;
      const end = start + reattemptPagination.limit;
      const paginatedData = allReattempts.slice(start, end);

      setReattemptRequests(paginatedData);
      setReattemptPagination({
        ...reattemptPagination,
        page,
        total,
        totalPages,
      });

      // window.__courseAssessments = courseAssessmentsMap;

      // if (errorCount > 0) {
      //   toast.warning(`Some courses (${errorCount}) could not be loaded.`, {
      //     autoClose: 5000
      //   });
      // }

      // if (total === 0 && !reattemptFilters.status && !reattemptFilters.user_id) {
      //   toast.info("No reattempt requests found.", {
      //     autoClose: 3000
      //   });
      // }
    } catch (error) {
      console.error("Error fetching reattempt requests:", error);
      toast.error("Failed to fetch reattempt requests");
      setReattemptRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // In AdminManagement.js - Update this function
  const handleApproveReattempt = async (requestId, newAssessmentId) => {
    if (!newAssessmentId) {
      toast.error("Please select an assessment to assign");
      return;
    }

    if (!confirm("Are you sure you want to approve this reattempt request?"))
      return;

    setLoading(true);
    try {
      const request = reattemptRequests.find((r) => r.id === requestId);
      if (!request) {
        toast.error("Request not found");
        setLoading(false);
        return;
      }
      const response = await assessmentApi.approveReattempt(
        request.course_id,
        requestId,
        { new_assessment_id: parseInt(newAssessmentId) },
        session,
      );

      if (response?.meta?.status === 200) {
        toast.success(
          "Reattempt approved successfully! New assessment assigned.",
        );
        clearCaches();
        fetchReattemptRequests(reattemptPagination.page);
        fetchAttempts(attemptPagination.page);
      }
    } catch (error) {
      console.error("Error approving reattempt:", error);
      toast.error("Failed to approve reattempt");
    } finally {
      setLoading(false);
    }
  };

  // Handle reject reattempt
  const handleRejectReattempt = async (requestId) => {
    if (!confirm("Are you sure you want to reject this reattempt request?"))
      return;

    setLoading(true);
    try {
      const response = await assessmentApi.rejectReattempt(
        null,
        requestId,
        session,
      );

      if (response?.meta?.status === 200) {
        toast.success("Reattempt rejected successfully!");
        fetchReattemptRequests(reattemptPagination.page);
      } else {
        toast.error(response?.meta?.message || "Failed to reject reattempt");
      }
    } catch (error) {
      console.error("Error rejecting reattempt:", error);
      toast.error("Failed to reject reattempt");
    } finally {
      setLoading(false);
    }
  };

  // Handle review for both PDF tasks and MCQ
  const handleReviewAttempt = async (attemptId, reviewData) => {
    setLoading(true);
    try {
      // Find the attempt to get its course_id and type
      const attempt = attempts.find(
        (a) => (a.id || a.attempt_id) === attemptId,
      );
      if (!attempt) {
        toast.error("Attempt not found");
        setLoading(false);
        return;
      }

      const response = await assessmentApi.reviewPdfTask(
        attempt.course_id,
        attemptId,
        reviewData,
        session,
      );

      if (response?.meta?.status === 200) {
        toast.success(
          `${attempt.assessment_type === "pdf_task" ? "PDF task" : "MCQ"} reviewed successfully!`,
        );
        fetchAttempts(attemptPagination.page);
        setShowAttemptDetail(false);
      } else {
        toast.error(response?.meta?.message || "Failed to review attempt");
      }
    } catch (error) {
      console.error("Error reviewing attempt:", error);
      toast.error("Failed to review attempt");
    } finally {
      setLoading(false);
    }
  };
  // Handle set default assessment
  const handleSetDefaultAssessment = async (courseId, assessmentId) => {
    if (
      !confirm(
        "Are you sure you want to set this as the default assessment for this course?",
      )
    )
      return;

    setLoading(true);
    try {
      const response = await assessmentApi.setDefaultAssessment(
        courseId,
        assessmentId,
        session,
      );

      if (response?.meta?.status === 200) {
        toast.success("Default assessment updated successfully!");
        fetchAssessments(assessmentPagination.page);
      } else {
        toast.error(
          response?.meta?.message || "Failed to set default assessment",
        );
      }
    } catch (error) {
      console.error("Error setting default assessment:", error);
      toast.error("Failed to set default assessment");
    } finally {
      setLoading(false);
    }
  };

  // Handle sync enrollments to default
  const handleSyncEnrollmentsToDefault = async (courseId) => {
    if (
      !confirm(
        "This will update all enrollments to the default assessment. Continue?",
      )
    )
      return;

    setLoading(true);
    try {
      const response = await assessmentApi.syncEnrollmentsToDefault(
        courseId,
        session,
      );

      if (response?.meta?.status === 200) {
        toast.success("Enrollments synced to default assessment successfully!");
        fetchAssessments(assessmentPagination.page);
      } else {
        toast.error(response?.meta?.message || "Failed to sync enrollments");
      }
    } catch (error) {
      console.error("Error syncing enrollments:", error);
      toast.error("Failed to sync enrollments");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete assessment
  const handleDeleteAssessment = async (courseId, assessmentId) => {
    if (!confirm("Are you sure you want to delete this assessment?")) return;

    setLoading(true);
    try {
      const response = await assessmentApi.deleteAssessment(
        courseId,
        assessmentId,
        session,
      );

      if (response?.meta?.status === 200) {
        toast.success("Assessment deleted successfully!");
        fetchAssessments(assessmentPagination.page);
      } else {
        toast.error(response?.meta?.message || "Failed to delete assessment");
      }
    } catch (error) {
      console.error("Error deleting assessment:", error);
      toast.error("Failed to delete assessment");
    } finally {
      setLoading(false);
    }
  };

  // Handle activate/deactivate assessment
  const handleActivateAssessment = async (courseId, assessmentId) => {
    setLoading(true);
    try {
      const response = await assessmentApi.activateAssessment(
        courseId,
        assessmentId,
        session,
      );

      if (response?.meta?.status === 200) {
        toast.success("Assessment published successfully!");
        assessmentsCache = {};
        fetchAssessments(assessmentPagination.page);
      } else {
        toast.error(response?.meta?.message || "Failed to publish assessment");
      }
    } catch (error) {
      console.error("Error activating assessment:", error);
      toast.error("Failed to publish assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateAssessment = async (courseId, assessmentId) => {
    setLoading(true);
    try {
      const response = await assessmentApi.deactivateAssessment(
        courseId,
        assessmentId,
        session,
      );

      if (response?.meta?.status === 200) {
        toast.success("Assessment deactivated successfully!");
        fetchAssessments(assessmentPagination.page);
      } else {
        toast.error(
          response?.meta?.message || "Failed to deactivate assessment",
        );
      }
    } catch (error) {
      console.error("Error deactivating assessment:", error);
      toast.error("Failed to deactivate assessment");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers(1);
    } else if (activeTab === "enrollments") {
      fetchEnrollments(1);
    } else if (activeTab === "contacts") {
      fetchContacts(1);
    } else if (activeTab === "assessments") {
      fetchAssessments(1);
    } else if (activeTab === "attempts") {
      fetchAttempts(1);
    } else if (activeTab === "reattempts") {
      fetchAssessments(1);
      setTimeout(() => {
        fetchReattemptRequests(1);
      }, 300);
    }
  }, [activeTab]);

  // Debounced searches
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "users") fetchUsers(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [userFilters.search, userFilters.role, userFilters.is_active]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "enrollments") fetchEnrollments(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [
    enrollmentFilters.user_id,
    enrollmentFilters.course_id,
    enrollmentFilters.status,
    enrollmentFilters.is_active,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "contacts") fetchContacts(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [contactFilters.filter, contactFilters.is_read]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "assessments") fetchAssessments(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [
    assessmentFilters.search,
    assessmentFilters.type,
    assessmentFilters.status,
    assessmentFilters.course_id,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "attempts") fetchAttempts(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [
    attemptFilters.user_id,
    attemptFilters.assessment_id,
    attemptFilters.course_id,
    attemptFilters.passed,
    attemptFilters.review_status,
    attemptFilters.search,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "reattempts") fetchReattemptRequests(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [
    reattemptFilters.status,
    reattemptFilters.user_id,
    reattemptFilters.course_id,
  ]);

  // Handle user status toggle
  const handleToggleUserStatus = async (userId, currentStatus) => {
    if (
      !confirm(
        `Are you sure you want to ${currentStatus ? "deactivate" : "activate"} this user?`,
      )
    )
      return;

    try {
      const result = await adminService.updateUserStatus(
        userId,
        !currentStatus,
        session,
      );
      if (result.success) {
        toast.success(
          `User ${currentStatus ? "deactivated" : "activated"} successfully`,
        );
        fetchUsers(userPagination.page);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    }
  };

  // Handle enrollment status update
  const handleUpdateEnrollmentStatus = async (enrollmentId, status) => {
    if (
      !confirm(`Are you sure you want to update this enrollment to ${status}?`)
    )
      return;

    try {
      const result = await adminService.updateEnrollmentStatus(
        enrollmentId,
        status,
        session,
      );
      if (result.success) {
        toast.success(`Enrollment updated to ${status}`);
        fetchEnrollments(enrollmentPagination.page);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error updating enrollment:", error);
      toast.error("Failed to update enrollment");
    }
  };

  // Handle contact status toggle
  const handleToggleContactRead = async (contactId, currentStatus) => {
    try {
      const result = await adminService.markContactRead(
        contactId,
        !currentStatus,
        session,
      );
      if (result.success) {
        toast.success(`Message marked as ${currentStatus ? "unread" : "read"}`);
        fetchContacts(contactPagination.page);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error updating contact status:", error);
      toast.error("Failed to update contact status");
    }
  };

  // Handle contact delete
  const handleDeleteContact = async (contactId) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      const result = await adminService.deleteContact(contactId, session);
      if (result.success) {
        toast.success("Message deleted successfully");
        fetchContacts(contactPagination.page);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Failed to delete message");
    }
  };

  // Filter handlers
  const handleUserFilterChange = (e) => {
    const { name, value } = e.target;
    setUserFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearUserFilters = () => {
    setUserFilters({ search: "", role: "", is_active: "" });
    setShowUserFilters(false);
  };

  const handleEnrollmentFilterChange = (e) => {
    const { name, value } = e.target;
    setEnrollmentFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearEnrollmentFilters = () => {
    setEnrollmentFilters({
      user_id: "",
      course_id: "",
      status: "",
      is_active: "",
    });
    setShowEnrollmentFilters(false);
  };

  const handleContactFilterChange = (e) => {
    const { name, value } = e.target;
    setContactFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearContactFilters = () => {
    setContactFilters({ filter: "", is_read: "" });
    setShowContactFilters(false);
    setTimeout(() => fetchContacts(1), 100);
  };

  const handleAssessmentFilterChange = (e) => {
    const { name, value } = e.target;
    setAssessmentFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearAssessmentFilters = () => {
    setAssessmentFilters({ search: "", type: "", status: "", course_id: "" });
    setShowAssessmentFilters(false);
    setTimeout(() => fetchAssessments(1), 100);
  };

  const handleAttemptFilterChange = (e) => {
    const { name, value } = e.target;
    setAttemptFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearAttemptFilters = () => {
    setAttemptFilters({
      user_id: "",
      assessment_id: "",
      course_id: "",
      passed: "",
      review_status: "",
      search: "",
    });
    setShowAttemptFilters(false);
    setTimeout(() => fetchAttempts(1), 100);
  };

  const handleReattemptFilterChange = (e) => {
    const { name, value } = e.target;
    setReattemptFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearReattemptFilters = () => {
    setReattemptFilters({ status: "", user_id: "", course_id: "" });
    setShowReattemptFilters(false);
    setTimeout(() => fetchReattemptRequests(1), 100);
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-emerald-100 text-emerald-700",
      inactive: "bg-gray-100 text-gray-700",
      pending: "bg-amber-100 text-amber-700",
      completed: "bg-blue-100 text-blue-700",
      cancelled: "bg-red-100 text-red-700",
      published: "bg-emerald-100 text-emerald-700",
      draft: "bg-amber-100 text-amber-700",
      deactivated: "bg-gray-100 text-gray-700",
      read: "bg-emerald-100 text-emerald-700",
      unread: "bg-red-100 text-red-700",
      approved: "bg-emerald-100 text-emerald-700",
      rejected: "bg-red-100 text-red-700",
      passed: "bg-emerald-100 text-emerald-700",
      failed: "bg-red-100 text-red-700",
      reviewed: "bg-blue-100 text-blue-700",
      pending_review: "bg-amber-100 text-amber-700",
    };
    return styles[status?.toLowerCase()] || styles.draft;
  };

  // Get role badge
  const getRoleBadge = (role) => {
    const styles = {
      admin: "bg-red-100 text-red-700",
      internal: "bg-blue-100 text-blue-700",
      student: "bg-green-100 text-green-700",
      instructor: "bg-purple-100 text-purple-700",
    };
    return styles[role?.toLowerCase()] || styles.student;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleExportCSV = async () => {
    try {
      let exportFunction;
      let filters = {};

      switch (activeTab) {
        case "users":
          exportFunction = exportUsers;
          filters = userFilters;
          break;
        case "enrollments":
          exportFunction = exportEnrollments;
          filters = enrollmentFilters;
          break;
        case "contacts":
          exportFunction = exportContacts;
          filters = contactFilters;
          break;
        default:
          toast.warning("No export available for this tab");
          return;
      }

      await exportFunction(filters);
    } catch (error) {
      console.error(`Export ${activeTab} failed:`, error);
    }
  };

  // Get unread contacts count
  const getUnreadCount = () => {
    if (!contacts || !Array.isArray(contacts)) return 0;
    return contacts.filter((c) => !c.is_read).length;
  };

  // Pagination component
  const Pagination = ({ pagination, onPageChange }) => {
    const { page, limit, total, totalPages } = pagination;

    if (total === 0) return null;

    const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        onPageChange(newPage);
      }
    };

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Showing</span>
          <span className="font-medium">{(page - 1) * limit + 1}</span>
          <span>to</span>
          <span className="font-medium">{Math.min(page * limit, total)}</span>
          <span>of</span>
          <span className="font-medium">{total}</span>
          <span>entries</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(1)}
            disabled={page === 1}
            className="p-2 text-gray-500 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="p-2 text-gray-500 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    page === pageNum
                      ? "bg-red-600 text-white"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="p-2 text-gray-500 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={page === totalPages}
            className="p-2 text-gray-500 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("users");
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
            activeTab === "users"
              ? "bg-red-50 text-red-700 border-2 border-red-200 shadow-sm"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent hover:border-gray-200"
          }`}
        >
          <Users
            className={`w-4 h-4 ${activeTab === "users" ? "text-red-600" : "text-gray-500"}`}
          />
          <span className="font-medium">Users</span>
          {userPagination.total > 0 && (
            <span
              className={`ml-1 px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                activeTab === "users"
                  ? "bg-red-200 text-red-800"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {userPagination.total}
            </span>
          )}
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("enrollments");
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
            activeTab === "enrollments"
              ? "bg-red-50 text-red-700 border-2 border-red-200 shadow-sm"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent hover:border-gray-200"
          }`}
        >
          <BookOpen
            className={`w-4 h-4 ${activeTab === "enrollments" ? "text-red-600" : "text-gray-500"}`}
          />
          <span className="font-medium">Enrollments</span>
          {enrollmentPagination.total > 0 && (
            <span
              className={`ml-1 px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                activeTab === "enrollments"
                  ? "bg-red-200 text-red-800"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {enrollmentPagination.total}
            </span>
          )}
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("contacts");
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
            activeTab === "contacts"
              ? "bg-red-50 text-red-700 border-2 border-red-200 shadow-sm"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent hover:border-gray-200"
          }`}
        >
          <Inbox
            className={`w-4 h-4 ${activeTab === "contacts" ? "text-red-600" : "text-gray-500"}`}
          />
          <span className="font-medium">Contacts</span>
          {getUnreadCount() > 0 && (
            <span className="ml-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white animate-pulse">
              {getUnreadCount()}
            </span>
          )}
          {contactPagination.total > 0 && getUnreadCount() === 0 && (
            <span
              className={`ml-1 px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                activeTab === "contacts"
                  ? "bg-red-200 text-red-800"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {contactPagination.total}
            </span>
          )}
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("assessments");
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
            activeTab === "assessments"
              ? "bg-red-50 text-red-700 border-2 border-red-200 shadow-sm"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent hover:border-gray-200"
          }`}
        >
          <FileText
            className={`w-4 h-4 ${activeTab === "assessments" ? "text-red-600" : "text-gray-500"}`}
          />
          <span className="font-medium">Assessments</span>
          {assessmentPagination.total > 0 && (
            <span
              className={`ml-1 px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                activeTab === "assessments"
                  ? "bg-red-200 text-red-800"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {assessmentPagination.total}
            </span>
          )}
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("attempts");
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
            activeTab === "attempts"
              ? "bg-red-50 text-red-700 border-2 border-red-200 shadow-sm"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent hover:border-gray-200"
          }`}
        >
          <History
            className={`w-4 h-4 ${activeTab === "attempts" ? "text-red-600" : "text-gray-500"}`}
          />
          <span className="font-medium">Attempts</span>
          {attemptPagination.total > 0 && (
            <span
              className={`ml-1 px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                activeTab === "attempts"
                  ? "bg-red-200 text-red-800"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {attemptPagination.total}
            </span>
          )}
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("reattempts");
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
            activeTab === "reattempts"
              ? "bg-red-50 text-red-700 border-2 border-red-200 shadow-sm"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent hover:border-gray-200"
          }`}
        >
          <RefreshCw
            className={`w-4 h-4 ${activeTab === "reattempts" ? "text-red-600" : "text-gray-500"}`}
          />
          <span className="font-medium">Reattempts</span>
          {reattemptPagination.total > 0 && (
            <span
              className={`ml-1 px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                activeTab === "reattempts"
                  ? "bg-red-200 text-red-800"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {reattemptPagination.total}
            </span>
          )}
        </button>

        <div className="flex-1"></div>

        <button
          onClick={handleExportCSV}
          disabled={isExporting}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg font-medium
            transition-all duration-200 ease-in-out
            ${
              isExporting
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
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </>
          )}
        </button>
      </div>

      {/* Users Tab - Keep existing */}
      {activeTab === "users" && (
        // ... existing users tab code ...
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* User Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-50 relative">
                <input
                  type="text"
                  name="search"
                  placeholder="Search users by name, email, or code..."
                  value={userFilters.search}
                  onChange={handleUserFilterChange}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>

              <button
                onClick={() => setShowUserFilters(!showUserFilters)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
                  showUserFilters || userFilters.role || userFilters.is_active
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filters</span>
                {(userFilters.role || userFilters.is_active) && (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              <button
                onClick={() => fetchUsers(1)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">Refresh</span>
              </button>
            </div>

            {showUserFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Filter Users
                  </h4>
                  <button
                    onClick={clearUserFilters}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      name="role"
                      value={userFilters.role}
                      onChange={handleUserFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    >
                      <option value="">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="internal">Internal</option>
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="is_active"
                      value={userFilters.is_active}
                      onChange={handleUserFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No users found</p>
                {(userFilters.search ||
                  userFilters.role ||
                  userFilters.is_active) && (
                  <button
                    onClick={clearUserFilters}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollments
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center text-red-700 font-semibold text-sm flex-shrink-0">
                            {user.full_name
                              ? user.full_name.charAt(0).toUpperCase()
                              : "U"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.full_name || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user.email}
                            </p>
                            {user.user_code && (
                              <p className="text-xs text-gray-400 font-mono">
                                {user.user_code}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(user.role_type) ? (
                            user.role_type.map((role) => (
                              <span
                                key={role}
                                className={`px-2 py-0.5 text-xs uppercase tracking-[1.36px] rounded-full ${getRoleBadge(role)}`}
                              >
                                {role}
                              </span>
                            ))
                          ) : (
                            <span
                              className={`px-2 py-0.5 text-xs uppercase tracking-[1.36px] rounded-full ${getRoleBadge(user.role_type)}`}
                            >
                              {user.role_type}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs uppercase tracking-[1.36px] rounded-full ${getStatusBadge(user.is_active ? "active" : "inactive")}`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.is_enrolled && (
                          <span className="px-1.5 py-0.5 uppercase tracking-[1.36px] text-xs bg-emerald-100 text-emerald-700 rounded-full">
                            Enrolled
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {user.created_at ? formatDate(user.created_at) : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleToggleUserStatus(user.id, user.is_active)
                            }
                            className={`p-1.5 rounded-lg transition-colors ${
                              user.is_active
                                ? "text-gray-400 hover:text-red-600 hover:bg-red-50"
                                : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                            }`}
                            title={user.is_active ? "Deactivate" : "Activate"}
                          >
                            {user.is_active ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              setExpandedUser(
                                expandedUser === user.id ? null : user.id,
                              )
                            }
                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            {expandedUser === user.id ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!loading && users.length > 0 && (
            <Pagination pagination={userPagination} onPageChange={fetchUsers} />
          )}
        </div>
      )}

      {/* Enrollments Tab - Keep existing */}
      {activeTab === "enrollments" && (
        // ... existing enrollments tab code ...
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Enrollment Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-50 relative">
                <input
                  type="text"
                  name="user_id"
                  placeholder="Search by user name or email..."
                  value={enrollmentFilters.user_id}
                  onChange={handleEnrollmentFilterChange}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>

              <button
                onClick={() => setShowEnrollmentFilters(!showEnrollmentFilters)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
                  showEnrollmentFilters ||
                  enrollmentFilters.course_id ||
                  enrollmentFilters.status ||
                  enrollmentFilters.is_active
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filters</span>
                {(enrollmentFilters.course_id ||
                  enrollmentFilters.status ||
                  enrollmentFilters.is_active) && (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              <button
                onClick={() => fetchEnrollments(1)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">Refresh</span>
              </button>
            </div>

            {showEnrollmentFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Filter Enrollments
                  </h4>
                  <button
                    onClick={clearEnrollmentFilters}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Course ID
                    </label>
                    <input
                      type="text"
                      name="course_id"
                      value={enrollmentFilters.course_id}
                      onChange={handleEnrollmentFilterChange}
                      placeholder="Enter course ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={enrollmentFilters.status}
                      onChange={handleEnrollmentFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Active Status
                    </label>
                    <select
                      name="is_active"
                      value={enrollmentFilters.is_active}
                      onChange={handleEnrollmentFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    >
                      <option value="">All</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enrollments Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
              </div>
            ) : enrollments.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No enrollments found</p>
                {(enrollmentFilters.user_id ||
                  enrollmentFilters.course_id ||
                  enrollmentFilters.status ||
                  enrollmentFilters.is_active) && (
                  <button
                    onClick={clearEnrollmentFilters}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrolled
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {enrollments.map((enrollment) => (
                    <tr
                      key={enrollment.enrollment_id || enrollment.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 text-xs font-semibold flex-shrink-0">
                            {enrollment.user_name
                              ? enrollment.user_name.charAt(0).toUpperCase()
                              : "U"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {enrollment.user_name || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {enrollment.user_email || "N/A"}
                            </p>
                            {enrollment.user_mobile && (
                              <p className="text-xs text-gray-400">
                                {enrollment.user_mobile}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm capitalize text-gray-900">
                            {enrollment.course_title || "N/A"}
                          </p>
                          {enrollment.course_code && (
                            <p className="text-xs text-gray-500 font-mono">
                              {enrollment.course_code}
                            </p>
                          )}
                          {enrollment.course_status && (
                            <span
                              className={`px-1.5 py-0.5 text-xs uppercase tracking-[1.36px] rounded-full ${getStatusBadge(enrollment.course_status)}`}
                            >
                              {enrollment.course_status}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs uppercase tracking-[1.36px] rounded-full ${getStatusBadge(enrollment.enrollment_status)}`}
                        >
                          {enrollment.enrollment_status || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {enrollment.enrolled_at
                          ? formatDateTime(enrollment.enrolled_at)
                          : "N/A"}
                        {enrollment.expiry_at && (
                          <div className="text-xs text-gray-400">
                            Expires: {formatDate(enrollment.expiry_at)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={enrollment.enrollment_status || ""}
                          onChange={(e) => {
                            const status = e.target.value;
                            if (status) {
                              handleUpdateEnrollmentStatus(
                                enrollment.enrollment_id || enrollment.id,
                                status,
                              );
                            }
                          }}
                          className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                        >
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!loading && enrollments.length > 0 && (
            <Pagination
              pagination={enrollmentPagination}
              onPageChange={fetchEnrollments}
            />
          )}
        </div>
      )}

      {/* Contacts Tab - Keep existing */}
      {activeTab === "contacts" && (
        // ... existing contacts tab code ...
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Contact Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-50 relative">
                <input
                  type="text"
                  name="filter"
                  placeholder="Search by name, email, or message..."
                  value={contactFilters.filter}
                  onChange={handleContactFilterChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      fetchContacts(1);
                    }
                  }}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                {contactFilters.filter && (
                  <button
                    onClick={() =>
                      setContactFilters((prev) => ({ ...prev, filter: "" }))
                    }
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowContactFilters(!showContactFilters)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
                  showContactFilters || contactFilters.is_read
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filters</span>
                {contactFilters.is_read && (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              <button
                onClick={() => fetchContacts(1)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">Refresh</span>
              </button>
            </div>

            {showContactFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Filter Contacts
                  </h4>
                  <button
                    onClick={clearContactFilters}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="is_read"
                      value={contactFilters.is_read}
                      onChange={handleContactFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    >
                      <option value="">All</option>
                      <option value="true">Read</option>
                      <option value="false">Unread</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contacts Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-12">
                <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No messages found</p>
                {(contactFilters.search || contactFilters.is_read) && (
                  <button
                    onClick={clearContactFilters}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      From
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Received
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {contacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className={`hover:bg-gray-50 transition-colors ${!contact.is_read ? "bg-red-50/30" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${!contact.is_read ? "bg-red-500" : "bg-gray-400"}`}
                          >
                            {contact.full_name
                              ? contact.full_name.charAt(0).toUpperCase()
                              : "?"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {contact.full_name || "Anonymous"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {contact.email}
                            </p>
                            {contact.mobile && (
                              <p className="text-xs text-gray-400">
                                {contact.mobile}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          <p
                            className={`text-sm ${!contact.is_read ? "font-semibold text-gray-900" : "text-gray-600"}`}
                          >
                            {contact.message && contact.message.length > 100
                              ? contact.message.substring(0, 100) + "..."
                              : contact.message}
                          </p>
                          {contact.message && contact.message.length > 100 && (
                            <button
                              onClick={() => {
                                setSelectedContact(contact);
                                setShowContactDetail(true);
                              }}
                              className="text-xs text-red-600 hover:text-red-700 mt-1"
                            >
                              Read more
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs uppercase tracking-[1.36px] rounded-full ${getStatusBadge(contact.is_read ? "read" : "unread")}`}
                        >
                          {contact.is_read ? "Read" : "Unread"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {contact.created_at
                          ? formatDateTime(contact.created_at)
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedContact(contact);
                              setShowContactDetail(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleToggleContactRead(
                                contact.id,
                                contact.is_read,
                              )
                            }
                            className={`p-1.5 rounded-lg transition-colors ${
                              contact.is_read
                                ? "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                                : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                            }`}
                            title={
                              contact.is_read
                                ? "Mark as unread"
                                : "Mark as read"
                            }
                          >
                            {contact.is_read ? (
                              <CheckCheck className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete message"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!loading && contacts.length > 0 && (
            <Pagination
              pagination={contactPagination}
              onPageChange={fetchContacts}
            />
          )}
        </div>
      )}

      {/* Assessments Tab */}
      {activeTab === "assessments" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Assessment Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-50 relative">
                <input
                  type="text"
                  name="search"
                  placeholder="Search assessments..."
                  value={assessmentFilters.search}
                  onChange={handleAssessmentFilterChange}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>

              <button
                onClick={() => setShowAssessmentFilters(!showAssessmentFilters)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
                  showAssessmentFilters ||
                  assessmentFilters.type ||
                  assessmentFilters.status ||
                  assessmentFilters.course_id
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filters</span>
                {(assessmentFilters.type ||
                  assessmentFilters.status ||
                  assessmentFilters.course_id) && (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              <button
                onClick={() => fetchAssessments(1)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">Refresh</span>
              </button>
            </div>

            {showAssessmentFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Filter Assessments
                  </h4>
                  <button
                    onClick={clearAssessmentFilters}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      name="type"
                      value={assessmentFilters.type}
                      onChange={handleAssessmentFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    >
                      <option value="">All Types</option>
                      <option value="mcq">MCQ</option>
                      <option value="pdf_task">PDF Task</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={assessmentFilters.status}
                      onChange={handleAssessmentFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="deactivated">Deactivated</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Course ID
                    </label>
                    <input
                      type="text"
                      name="course_id"
                      value={assessmentFilters.course_id}
                      onChange={handleAssessmentFilterChange}
                      placeholder="Enter course ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Assessments Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
              </div>
            ) : assessments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No assessments found</p>
                {(assessmentFilters.search ||
                  assessmentFilters.type ||
                  assessmentFilters.status ||
                  assessmentFilters.course_id) && (
                  <button
                    onClick={clearAssessmentFilters}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assessment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Default
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assessments.map((assessment) => (
                    <tr
                      key={assessment.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {assessment.title || "Untitled Assessment"}
                          </p>
                          {assessment.description && (
                            <p className="text-xs text-gray-500 truncate max-w-xs">
                              {assessment.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">
                              ID: {assessment.id}
                            </span>
                            {assessment.duration_minutes && (
                              <span className="text-xs text-gray-400">
                                • {assessment.duration_minutes} min
                              </span>
                            )}
                            {assessment.passing_score && (
                              <span className="text-xs text-gray-400">
                                • Pass: {assessment.passing_score}%
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-gray-900">
                            {assessment.course_title || "N/A"}
                          </p>
                          {assessment.course_code && (
                            <p className="text-xs text-gray-500 font-mono">
                              {assessment.course_code}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs uppercase tracking-[1.36px] rounded-full ${
                            assessment.type === "pdf_task"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {assessment.type === "pdf_task" ? "PDF Task" : "MCQ"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs uppercase tracking-[1.36px] rounded-full ${getStatusBadge(assessment.status)}`}
                        >
                          {assessment.status || "draft"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            handleSetDefaultAssessment(
                              assessment.course_id,
                              assessment.id,
                            )
                          }
                          className={`p-1.5 rounded-lg transition-colors ${
                            assessment.is_default
                              ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50"
                              : "text-gray-300 hover:text-yellow-500 hover:bg-yellow-50"
                          }`}
                          title={
                            assessment.is_default
                              ? "Default Assessment"
                              : "Set as Default"
                          }
                        >
                          {assessment.is_default ? (
                            <Star className="w-5 h-5 fill-yellow-500" />
                          ) : (
                            <StarOff className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {assessment.status === "draft" && (
                            <button
                              onClick={() =>
                                handleActivateAssessment(
                                  assessment.course_id,
                                  assessment.id,
                                )
                              }
                              className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Publish"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {assessment.status === "published" && (
                            <button
                              onClick={() =>
                                handleDeactivateAssessment(
                                  assessment.course_id,
                                  assessment.id,
                                )
                              }
                              className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Deactivate"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleSyncEnrollmentsToDefault(
                                assessment.course_id,
                              )
                            }
                            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Sync Enrollments to Default"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteAssessment(
                                assessment.course_id,
                                assessment.id,
                              )
                            }
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Assessment"
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!loading && assessments.length > 0 && (
            <Pagination
              pagination={assessmentPagination}
              onPageChange={fetchAssessments}
            />
          )}
        </div>
      )}

      {/* Attempts Tab */}
      {activeTab === "attempts" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Attempt Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-50 relative">
                <input
                  type="text"
                  name="search"
                  placeholder="Search by user, assessment, or course..."
                  value={attemptFilters.search}
                  onChange={handleAttemptFilterChange}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>

              <button
                onClick={() => setShowAttemptFilters(!showAttemptFilters)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
                  showAttemptFilters ||
                  attemptFilters.passed ||
                  attemptFilters.review_status ||
                  attemptFilters.course_id
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filters</span>
                {(attemptFilters.passed ||
                  attemptFilters.review_status ||
                  attemptFilters.course_id) && (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              <button
                onClick={() => fetchAttempts(1)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">Refresh</span>
              </button>
            </div>

            {showAttemptFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Filter Attempts
                  </h4>
                  <button
                    onClick={clearAttemptFilters}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Passed
                    </label>
                    <select
                      name="passed"
                      value={attemptFilters.passed}
                      onChange={handleAttemptFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    >
                      <option value="">All</option>
                      <option value="true">Passed</option>
                      <option value="false">Failed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Review Status
                    </label>
                    <select
                      name="review_status"
                      value={attemptFilters.review_status}
                      onChange={handleAttemptFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    >
                      <option value="">All</option>
                      <option value="pending">Pending Review</option>
                      <option value="reviewed">Reviewed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Course ID
                    </label>
                    <input
                      type="text"
                      name="course_id"
                      value={attemptFilters.course_id}
                      onChange={handleAttemptFilterChange}
                      placeholder="Enter course ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Attempts Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
              </div>
            ) : attempts.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No attempts found</p>
                {(attemptFilters.search ||
                  attemptFilters.passed ||
                  attemptFilters.review_status ||
                  attemptFilters.course_id) && (
                  <button
                    onClick={clearAttemptFilters}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assessment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attempts.map((attempt) => (
                    <tr
                      key={attempt.id || attempt.attempt_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {attempt.user_name || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {attempt.user_email || "N/A"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-gray-900">
                            {attempt.assessment_title || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {attempt.assessment_id}
                          </p>
                          {attempt.course_title && (
                            <p className="text-xs text-gray-400">
                              {attempt.course_title}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-center">
                          <p className="text-sm font-semibold">
                            {attempt.score !== null &&
                            attempt.score !== undefined
                              ? `${attempt.score}%`
                              : "N/A"}
                          </p>
                          {attempt.passed !== null &&
                            attempt.passed !== undefined && (
                              <span
                                className={`px-1.5 py-0.5 text-xs uppercase tracking-[1.36px] rounded-full ${getStatusBadge(attempt.passed ? "passed" : "failed")}`}
                              >
                                {attempt.passed ? "Passed" : "Failed"}
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs uppercase tracking-[1.36px] rounded-full ${getStatusBadge(attempt.review_status || "pending")}`}
                        >
                          {attempt.review_status || "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs uppercase tracking-[1.36px] rounded-full ${
                            attempt.assessment_type === "pdf_task"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {attempt.assessment_type === "pdf_task"
                            ? "PDF Task"
                            : "MCQ"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {attempt.submitted_at
                          ? formatDateTime(attempt.submitted_at)
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          <button
                            onClick={() => {
                              setSelectedAttempt(attempt);
                              setShowAttemptDetail(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Review button for both PDF and MCQ when pending */}
                          {attempt.review_status === "pending" && (
                            <button
                              onClick={() => {
                                setSelectedAttempt(attempt);
                                setShowAttemptDetail(true);
                              }}
                              className={`p-1.5 rounded-lg transition-colors ${
                                attempt.assessment_type === "pdf_task"
                                  ? "text-amber-600 hover:bg-amber-50"
                                  : "text-emerald-600 hover:bg-emerald-50"
                              }`}
                              title={
                                attempt.assessment_type === "pdf_task"
                                  ? "Review PDF"
                                  : "Review MCQ"
                              }
                            >
                              {attempt.assessment_type === "pdf_task" ? (
                                <FileText className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!loading && attempts.length > 0 && (
            <Pagination
              pagination={attemptPagination}
              onPageChange={fetchAttempts}
            />
          )}
        </div>
      )}
      {/* Reattempts Tab */}
      {activeTab === "reattempts" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Reattempt Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setShowReattemptFilters(!showReattemptFilters)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
                  showReattemptFilters ||
                  reattemptFilters.status ||
                  reattemptFilters.user_id ||
                  reattemptFilters.course_id
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filters</span>
                {(reattemptFilters.status ||
                  reattemptFilters.user_id ||
                  reattemptFilters.course_id) && (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              <button
                onClick={() => fetchReattemptRequests(1)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">Refresh</span>
              </button>
            </div>

            {showReattemptFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Filter Reattempts
                  </h4>
                  <button
                    onClick={clearReattemptFilters}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={reattemptFilters.status}
                      onChange={handleReattemptFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    >
                      <option value="">All</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      User ID
                    </label>
                    <input
                      type="text"
                      name="user_id"
                      value={reattemptFilters.user_id}
                      onChange={handleReattemptFilterChange}
                      placeholder="Enter user ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Course ID
                    </label>
                    <input
                      type="text"
                      name="course_id"
                      value={reattemptFilters.course_id}
                      onChange={handleReattemptFilterChange}
                      placeholder="Enter course ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reattempt Requests Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
              </div>
            ) : reattemptRequests.length === 0 ? (
              <div className="text-center py-12">
                <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No reattempt requests found</p>
                {(reattemptFilters.status ||
                  reattemptFilters.user_id ||
                  reattemptFilters.course_id) && (
                  <button
                    onClick={clearReattemptFilters}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Old Assessment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reattemptRequests.map((request, index) => (
                    <tr
                      key={`${request.id}-${request.course_id}-${index}`}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {request.user_name || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {request.user_email || "N/A"}
                          </p>
                          <p className="text-xs text-gray-400">
                            ID: {request.user_id}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-gray-900">
                            {request.course_title || "N/A"}
                          </p>
                          <p className="text-xs text-gray-400">
                            ID: {request.course_id}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-gray-900">
                            {request.assessment_title || "Assessment"}
                          </p>
                          <p className="text-xs text-gray-400">
                            ID: {request.old_assessment_id}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-600 max-w-xs truncate">
                          {request.reason || "Not specified"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs uppercase tracking-[1.36px] rounded-full ${getStatusBadge(request.status)}`}
                        >
                          {request.status || "pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {request.created_at
                          ? formatDateTime(request.created_at)
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        {request.status === "pending" ? (
                          <div className="flex flex-col gap-2">
                            {/* Assessment Selection for Approval */}
                            <div className="flex items-center gap-1">
                              <select
                                id={`assessment-select-${request.id}`}
                                className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white w-full max-w-[150px]"
                                defaultValue=""
                              >
                                <option value="">Select Assessment</option>
                                {assessments
                                  .filter((a) => {
                                    if (a.course_id !== request.course_id)
                                      return false;
                                    if (a.status !== "published") return false;
                                    if (a.id === request.old_assessment_id)
                                      return false;
                                    if (a.is_default) return false;
                                    return true;
                                  })
                                  .map((assessment) => (
                                    <option
                                      key={assessment.id}
                                      value={assessment.id}
                                    >
                                      {assessment.title} (ID: {assessment.id})
                                    </option>
                                  ))}
                              </select>
                              <button
                                onClick={() => {
                                  const select = document.getElementById(
                                    `assessment-select-${request.id}`,
                                  );
                                  const assessmentId = select?.value;
                                  if (assessmentId) {
                                    handleApproveReattempt(
                                      request.id,
                                      assessmentId,
                                    );
                                  } else {
                                    toast.error(
                                      "Please select an assessment to assign",
                                    );
                                  }
                                }}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                const reason = prompt("Reason for rejection:");
                                if (reason !== null) {
                                  handleRejectReattempt(request.id);
                                }
                              }}
                              className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <ThumbsDown className="w-3 h-3" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">
                            {request.status === "approved" ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="w-3 h-3" />
                                Approved
                              </span>
                            ) : request.status === "rejected" ? (
                              <span className="flex items-center gap-1 text-red-600">
                                <XCircle className="w-3 h-3" />
                                Rejected
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-gray-500">
                                <Clock className="w-3 h-3" />
                                {request.status || "Pending"}
                              </span>
                            )}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!loading && reattemptRequests.length > 0 && (
            <Pagination
              pagination={reattemptPagination}
              onPageChange={fetchReattemptRequests}
            />
          )}
        </div>
      )}

      {/* User Detail Modal */}
      {showUserDetail && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => {
            setShowUserDetail(false);
            setSelectedUser(null);
          }}
          session={session}
        />
      )}

      {/* Contact Detail Modal */}
      {showContactDetail && selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${!selectedContact.is_read ? "bg-red-500" : "bg-gray-400"}`}
                >
                  {selectedContact.full_name
                    ? selectedContact.full_name.charAt(0).toUpperCase()
                    : "?"}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedContact.full_name || "Anonymous"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedContact.email}
                  </p>
                  {selectedContact.mobile && (
                    <p className="text-xs text-gray-400">
                      {selectedContact.mobile}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowContactDetail(false);
                  setSelectedContact(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    Received: {formatDateTime(selectedContact.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs uppercase tracking-[1.36px] rounded-full ${getStatusBadge(selectedContact.is_read ? "read" : "unread")}`}
                  >
                    {selectedContact.is_read ? "Read" : "Unread"}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {selectedContact.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <a
                  href={`mailto:${selectedContact.email}`}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Reply via Email
                </a>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleToggleContactRead(
                      selectedContact.id,
                      selectedContact.is_read,
                    );
                    setShowContactDetail(false);
                    setSelectedContact(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  {selectedContact.is_read ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Mark as Unread
                    </>
                  ) : (
                    <>
                      <CheckCheck className="w-4 h-4" />
                      Mark as Read
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    handleDeleteContact(selectedContact.id);
                    setShowContactDetail(false);
                    setSelectedContact(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAttemptDetail && selectedAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    selectedAttempt.assessment_type === "pdf_task"
                      ? "bg-amber-100"
                      : "bg-emerald-100"
                  }`}
                >
                  {selectedAttempt.assessment_type === "pdf_task" ? (
                    <FileText
                      className={`w-5 h-5 ${
                        selectedAttempt.assessment_type === "pdf_task"
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedAttempt.assessment_type === "pdf_task"
                      ? "PDF Task Review"
                      : "MCQ Review"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedAttempt.user_name} -{" "}
                    {selectedAttempt.assessment_title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAttemptDetail(false);
                  setSelectedAttempt(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-gray-400">Score</p>
                  <p className="text-lg font-semibold">
                    {selectedAttempt.score !== null &&
                    selectedAttempt.score !== undefined
                      ? `${selectedAttempt.score}%`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  {selectedAttempt.passed !== null &&
                  selectedAttempt.passed !== undefined ? (
                    <span
                      className={`px-2 py-1 text-xs uppercase tracking-[1.36px] rounded-full ${getStatusBadge(selectedAttempt.passed ? "passed" : "failed")}`}
                    >
                      {selectedAttempt.passed ? "Passed" : "Failed"}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">Not graded</span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400">Review Status</p>
                  <span
                    className={`px-2 py-1 text-xs uppercase tracking-[1.36px] rounded-full ${getStatusBadge(selectedAttempt.review_status || "pending")}`}
                  >
                    {selectedAttempt.review_status || "Pending"}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Submitted</p>
                  <p className="text-sm">
                    {selectedAttempt.submitted_at
                      ? formatDateTime(selectedAttempt.submitted_at)
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Assessment Type</p>
                  <span
                    className={`px-2 py-1 text-xs uppercase tracking-[1.36px] rounded-full ${
                      selectedAttempt.assessment_type === "pdf_task"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {selectedAttempt.assessment_type === "pdf_task"
                      ? "PDF Task"
                      : "MCQ"}
                  </span>
                </div>
              </div>

              {/* PDF Submission URL - Only for PDF tasks */}
              {selectedAttempt.assessment_type === "pdf_task" &&
                selectedAttempt.submitted_file_url && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Submitted PDF
                    </p>
                    <a
                      href={selectedAttempt.submitted_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      View PDF Submission
                    </a>
                  </div>
                )}

              {/* Review Section - Show for both PDF and MCQ when pending */}
              {selectedAttempt.review_status === "pending" && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Review{" "}
                    {selectedAttempt.assessment_type === "pdf_task"
                      ? "PDF Task"
                      : "MCQ"}
                  </h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Score (%)
                      </label>
                      <input
                        type="number"
                        id="review-score"
                        min="0"
                        max="100"
                        defaultValue={selectedAttempt.score || 0}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Passed
                      </label>
                      <select
                        id="review-passed"
                        defaultValue={
                          selectedAttempt.passed !== null &&
                          selectedAttempt.passed !== undefined
                            ? selectedAttempt.passed
                              ? "true"
                              : "false"
                            : "true"
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          const score = parseInt(
                            document.getElementById("review-score").value,
                          );
                          const passed =
                            document.getElementById("review-passed").value ===
                            "true";
                          if (isNaN(score) || score < 0 || score > 100) {
                            toast.error("Please enter a valid score (0-100)");
                            return;
                          }
                          handleReviewAttempt(
                            selectedAttempt.id || selectedAttempt.attempt_id,
                            {
                              score,
                              passed,
                            },
                          );
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Submit Review
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowAttemptDetail(false);
                  setSelectedAttempt(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;