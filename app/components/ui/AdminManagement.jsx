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
} from "lucide-react";
import { toast } from "react-toastify";
import UserDetailModal from "./UserDetailModal";
import { adminService } from "@/helper/services/adminService";
import fetchApiResponse from "@/helper/api_data_store";
import useCSVExport from "@/helper/hooks/useCSVExport";
import { useSession } from "next-auth/react";

const AdminManagement = () => {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedUser, setExpandedUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactDetail, setShowContactDetail] = useState(false);

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

  const [showUserFilters, setShowUserFilters] = useState(false);
  const [showEnrollmentFilters, setShowEnrollmentFilters] = useState(false);
  const [showContactFilters, setShowContactFilters] = useState(false);

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
      // Build params for API - only send what backend expects
      const params = {
        page,
        limit: contactPagination.limit,
      };

      // Add filter only if it has a value (backend 'filter' parameter)
      if (contactFilters.filter && contactFilters.filter.trim() !== "") {
        params.filter = contactFilters.filter.trim();
      }
      if (contactFilters.is_read !== "") {
        params.is_read = contactFilters.is_read;
      }

      const result = await adminService.listContacts(params, session);

      if (result.success) {
        let data = result.data || [];
        console.log("Data from API:", data.length, "items");

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

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers(1);
    } else if (activeTab === "enrollments") {
      fetchEnrollments(1);
    } else if (activeTab === "contacts") {
      fetchContacts(1);
    }
  }, [activeTab]);

  // Debounced search for users
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "users") {
        fetchUsers(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [userFilters.search, userFilters.role, userFilters.is_active]);

  // Debounced search for enrollments
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "enrollments") {
        fetchEnrollments(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [
    enrollmentFilters.user_id,
    enrollmentFilters.course_id,
    enrollmentFilters.status,
    enrollmentFilters.is_active,
  ]);

  // Debounced search for contacts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "contacts") {
        fetchContacts(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [contactFilters.filter, contactFilters.is_read]);

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

  // Handle contact status toggle (mark as read/unread)
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

  // User filter handlers
  const handleUserFilterChange = (e) => {
    const { name, value } = e.target;
    setUserFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearUserFilters = () => {
    setUserFilters({
      search: "",
      role: "",
      is_active: "",
    });
    setShowUserFilters(false);
  };

  // Enrollment filter handlers
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

  // Contact filter handlers
  const handleContactFilterChange = (e) => {
    const { name, value } = e.target;
    setContactFilters((prev) => {
      const newState = { ...prev, [name]: value };
      return newState;
    });
  };

  const clearContactFilters = () => {
    setContactFilters({
      filter: "",
      is_read: "",
    });
    setShowContactFilters(false);
    // Fetch contacts with cleared filters
    setTimeout(() => fetchContacts(1), 100);
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
      read: "bg-emerald-100 text-emerald-700",
      unread: "bg-red-100 text-red-700",
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
      let entityName = "";

      switch (activeTab) {
        case "users":
          exportFunction = exportUsers;
          filters = userFilters;
          entityName = "users";
          break;
        case "enrollments":
          exportFunction = exportEnrollments;
          filters = enrollmentFilters;
          entityName = "enrollments";
          break;
        case "contacts":
          exportFunction = exportContacts;
          filters = contactFilters;
          entityName = "contacts";
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
          onClick={() => setActiveTab("users")}
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
          onClick={() => setActiveTab("enrollments")}
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
          onClick={() => setActiveTab("contacts")}
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
              <span className="ml-1 text-xs opacity-75">Please wait</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Export Data</span>
              <span className="hidden sm:inline text-xs opacity-80">CSV</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </>
          )}
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
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
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserDetail(true);
                      }}
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
                        <div className="flex items-center gap-1">
                          {user.is_enrolled && (
                            <span className="px-1.5 py-0.5 uppercase tracking-[1.36px] text-xs bg-emerald-100 text-emerald-700 rounded-full">
                              Enrolled
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {user.created_at ? formatDate(user.created_at) : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleUserStatus(user.id, user.is_active);
                            }}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedUser(
                                expandedUser === user.id ? null : user.id,
                              );
                            }}
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

          {/* User Pagination */}
          {!loading && users.length > 0 && (
            <Pagination pagination={userPagination} onPageChange={fetchUsers} />
          )}

          {/* Expanded User Details */}
          {expandedUser && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              {users.find((u) => u.id === expandedUser)?.enrolled_courses
                ?.length > 0 ? (
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">
                    Enrolled Courses
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {users
                      .find((u) => u.id === expandedUser)
                      .enrolled_courses.map((course, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-3 rounded-lg border border-gray-200"
                        >
                          <p className="text-sm font-medium text-gray-900">
                            {course.title}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              Code: {course.course_code}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 uppercase tracking-[1.36px] text-xs rounded-full ${getStatusBadge(course.course_status)}`}
                            >
                              {course.course_status}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 uppercase tracking-[1.36px] text-xs rounded-full ${getStatusBadge(course.enrollment_status)}`}
                            >
                              {course.enrollment_status}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">
                  No enrolled courses
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Enrollments Tab */}
      {activeTab === "enrollments" && (
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
                  {enrollments.map((enrollment) => {
                    return (
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
                          <div className="flex items-center gap-2">
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
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Enrollment Pagination */}
          {!loading && enrollments.length > 0 && (
            <Pagination
              pagination={enrollmentPagination}
              onPageChange={fetchEnrollments}
            />
          )}
        </div>
      )}

      {/* Contacts Tab */}
      {activeTab === "contacts" && (
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

          {/* Contact Pagination */}
          {!loading && contacts.length > 0 && (
            <Pagination
              pagination={contactPagination}
              onPageChange={fetchContacts}
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
            {/* Header */}
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

            {/* Body */}
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

            {/* Footer */}
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
    </div>
  );
};

export default AdminManagement;
