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
  Phone,
  Calendar,
  Clock,
  Award,
  AlertCircle,
  RefreshCw,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  Download,
  GraduationCap,
  TrendingUp
} from "lucide-react";
import { toast } from "react-toastify";
import UserDetailModal from "./UserDetailModal";
import { adminService } from "@/helper/services/adminService";
import fetchApiResponse from "@/helper/api_data_store";
import useCSVExport from "@/helper/hooks/useCSVExport";
import { useSession } from "next-auth/react";

const AdminManagement = ( ) => {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedUser, setExpandedUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  //  const { isExporting, exportUsers } = useCSVExport(session);

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
  
  const [showUserFilters, setShowUserFilters] = useState(false);
  const [showEnrollmentFilters, setShowEnrollmentFilters] = useState(false);
  
  // Pagination
  const [userPagination, setUserPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  
  const [enrollmentPagination, setEnrollmentPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await adminService.listUsers(userFilters, session);
      if (result.success) {
        setUsers(result.data);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Fetch enrollments
  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const result = await adminService.listEnrollments(enrollmentFilters, session);
      if (result.success) {
        setEnrollments(result.data);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      toast.error("Failed to fetch enrollments");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else {
      fetchEnrollments();
    }
  }, [activeTab]);

  // Debounced search for users
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "users") {
        fetchUsers();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [userFilters.search]);

  // Debounced search for enrollments
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "enrollments") {
        fetchEnrollments();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [enrollmentFilters.user_id, enrollmentFilters.course_id]);

  // Handle user status toggle
  const handleToggleUserStatus = async (userId, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) return;
    
    try {
      const result = await adminService.updateUserStatus(
        userId, 
        !currentStatus, 
        session
      );
      
      if (result.success) {
        toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
        fetchUsers();
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
    if (!confirm(`Are you sure you want to update this enrollment to ${status}?`)) return;
    
    try {
      const result = await adminService.updateEnrollmentStatus(
        enrollmentId, 
        status, 
        session
      );
      
      if (result.success) {
        toast.success(`Enrollment updated to ${status}`);
        fetchEnrollments();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error updating enrollment:", error);
      toast.error("Failed to update enrollment");
    }
  };

  // User filter handlers
  const handleUserFilterChange = (e) => {
    const { name, value } = e.target;
    setUserFilters(prev => ({ ...prev, [name]: value }));
    if (name === 'role' || name === 'is_active') {
      setTimeout(fetchUsers, 100);
    }
  };

  const clearUserFilters = () => {
    setUserFilters({
      search: "",
      role: "",
      is_active: "",
    });
    setShowUserFilters(false);
    setTimeout(fetchUsers, 100);
  };

  // Enrollment filter handlers
  const handleEnrollmentFilterChange = (e) => {
    const { name, value } = e.target;
    setEnrollmentFilters(prev => ({ ...prev, [name]: value }));
    if (name === 'status' || name === 'is_active') {
      setTimeout(fetchEnrollments, 100);
    }
  };

  const clearEnrollmentFilters = () => {
    setEnrollmentFilters({
      user_id: "",
      course_id: "",
      status: "",
      is_active: "",
    });
    setShowEnrollmentFilters(false);
    setTimeout(fetchEnrollments, 100);
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
      minute: "2-digit"
    });
  };

  // Get progress percentage from enrollment
  const getProgress = (enrollment) => {
    if (enrollment.progress) {
      if (typeof enrollment.progress === 'object') {
        return enrollment.progress.progress_percentage || 0;
      }
      return enrollment.progress;
    }
    return 0;
  };

  // Get completed lessons from enrollment
  const getCompletedLessons = (enrollment) => {
    if (enrollment.progress && typeof enrollment.progress === 'object') {
      return enrollment.progress.completed_lessons || 0;
    }
    return 0;
  };

  // Get total lessons from enrollment
  const getTotalLessons = (enrollment) => {
    if (enrollment.progress && typeof enrollment.progress === 'object') {
      return enrollment.progress.total_lessons || 0;
    }
    return 0;
  };

  //  const exportdata = async () => {
  //   try {
  //     await exportUsers();
  //   } catch (error) {
  //     // Error handled by hook
  //     console.error('Export failed:', error);
  //   }
  // };

 const exportdata = async () => {
  if (isExporting) return;
  
  setIsExporting(true);
  try {
    toast.info("Preparing CSV export...");
    
    const queryParams = new URLSearchParams();
    if (userFilters.search) queryParams.append('search', userFilters.search);
    if (userFilters.role) queryParams.append('role', userFilters.role);
    if (userFilters.is_active) queryParams.append('is_active', userFilters.is_active);
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/export-csv?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          "Access-Token": session?.accessToken,
          "Refresh-Token":session?.refreshToken       
         },
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to export CSV');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `users_${new Date().toISOString().slice(0,10)}.csv`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    toast.success(`CSV exported successfully!`);
  } catch (error) {
    console.error('Export error:', error);
    toast.error(error.message || 'Failed to export CSV');
  } finally {
    setIsExporting(false);
  }
};

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === "users"
                ? "bg-red-50 text-red-600 border border-red-200"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Users className="w-4 h-4" />
            Users
            {users.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-gray-200 rounded-full">
                {users.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("enrollments")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === "enrollments"
                ? "bg-red-50 text-red-600 border border-red-200"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Enrollments
            {enrollments.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-gray-200 rounded-full">
                {enrollments.length}
              </span>
            )}
          </button>

          <button 
  onClick={exportdata} 
  disabled={isExporting}
  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
    isExporting 
      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
  }`}
>
  {isExporting ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>Exporting...</span>
    </>
  ) : (
    <>
      <Download className="w-4 h-4" />
      <span>Export Users Data</span>
    </>
  )}
</button>
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* User Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px] relative">
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
                  showUserFilters || (userFilters.role || userFilters.is_active)
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
                onClick={fetchUsers}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">Refresh</span>
              </button>
            </div>

            {showUserFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Filter Users</h4>
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
                {(userFilters.search || userFilters.role || userFilters.is_active) && (
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
                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.full_name || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                            {user.user_code && (
                              <p className="text-xs text-gray-400 font-mono">{user.user_code}</p>
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
                                className={`px-2 py-0.5 text-xs rounded-full ${getRoleBadge(role)}`}
                              >
                                {role}
                              </span>
                            ))
                          ) : (
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getRoleBadge(user.role_type)}`}>
                              {user.role_type}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(user.is_active ? 'active' : 'inactive')}`}>
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-gray-900">
                            {user.enrollment_count || 0}
                          </span>
                          {user.is_enrolled && (
                            <span className="px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">
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
                              setExpandedUser(expandedUser === user.id ? null : user.id);
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

          {/* Expanded User Details */}
          {expandedUser && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              {users.find(u => u.id === expandedUser)?.enrolled_courses?.length > 0 ? (
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">
                    Enrolled Courses
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {users.find(u => u.id === expandedUser).enrolled_courses.map((course, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{course.title}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs text-gray-500">Code: {course.course_code}</span>
                          <span className={`px-1.5 py-0.5 text-xs rounded-full ${getStatusBadge(course.course_status)}`}>
                            {course.course_status}
                          </span>
                          <span className={`px-1.5 py-0.5 text-xs rounded-full ${getStatusBadge(course.enrollment_status)}`}>
                            {course.enrollment_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">No enrolled courses</p>
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
              <div className="flex-1 min-w-[200px] relative">
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
                  showEnrollmentFilters || (enrollmentFilters.course_id || enrollmentFilters.status || enrollmentFilters.is_active)
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filters</span>
                {(enrollmentFilters.course_id || enrollmentFilters.status || enrollmentFilters.is_active) && (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              <button
                onClick={fetchEnrollments}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">Refresh</span>
              </button>
            </div>

            {showEnrollmentFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Filter Enrollments</h4>
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
                    //   onChange={handleEnrollmentFilterChange}
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
                {(enrollmentFilters.user_id || enrollmentFilters.course_id || 
                  enrollmentFilters.status || enrollmentFilters.is_active) && (
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
                      Progress
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {enrollments.map((enrollment) => {
                    const progress = getProgress(enrollment);
                    const completedLessons = getCompletedLessons(enrollment);
                    const totalLessons = getTotalLessons(enrollment);
                    
                    return (
                      <tr key={enrollment.enrollment_id || enrollment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 text-xs font-semibold flex-shrink-0">
                              {enrollment.user_name ? enrollment.user_name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {enrollment.user_name || "N/A"}
                              </p>
                              <p className="text-xs text-gray-500">{enrollment.user_email || "N/A"}</p>
                              {enrollment.user_mobile && (
                                <p className="text-xs text-gray-400">{enrollment.user_mobile}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm text-gray-900">
                              {enrollment.course_title || "N/A"}
                            </p>
                            {enrollment.course_code && (
                              <p className="text-xs text-gray-500 font-mono">{enrollment.course_code}</p>
                            )}
                            {enrollment.course_status && (
                              <span className={`px-1.5 py-0.5 text-xs rounded-full ${getStatusBadge(enrollment.course_status)}`}>
                                {enrollment.course_status}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(enrollment.status)}`}>
                            {enrollment.status || "N/A"}
                          </span>
                          {enrollment.is_active !== undefined && (
                            <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${enrollment.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                              {enrollment.is_active ? 'Active' : 'Inactive'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {enrollment.enrolled_at ? formatDateTime(enrollment.enrolled_at) : "N/A"}
                          {enrollment.expiry_at && (
                            <div className="text-xs text-gray-400">
                              Expires: {formatDate(enrollment.expiry_at)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {progress > 0 ? (
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-emerald-500 rounded-full transition-all"
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-gray-600">
                                  {Math.round(progress)}%
                                </span>
                              </div>
                              {totalLessons > 0 && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {completedLessons}/{totalLessons} lessons
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Not started</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <select
                              value={enrollment.status || ""}
                              onChange={(e) => {
                                const status = e.target.value;
                                if (status) {
                                  handleUpdateEnrollmentStatus(
                                    enrollment.enrollment_id || enrollment.id,
                                    status
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
    </div>
  );
};

export default AdminManagement;