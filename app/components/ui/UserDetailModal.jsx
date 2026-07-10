// components/Admin/UserDetailModal.js

import { useState } from "react";
import { 
  X, 
  Mail, 
  Phone, 
  Calendar, 
  Award, 
  BookOpen, 
  Clock,
  User,
  Code,
  CheckCircle,
  XCircle,
  GraduationCap,
  Users,
  TrendingUp
} from "lucide-react";

const UserDetailModal = ({ user, onClose, session }) => {
  if (!user) return null;

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

  const getRoleBadge = (role) => {
    const styles = {
      admin: "bg-red-100 text-red-700",
      internal: "bg-blue-100 text-blue-700",
      student: "bg-green-100 text-green-700",
      instructor: "bg-purple-100 text-purple-700",
    };
    return styles[role?.toLowerCase()] || styles.student;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center text-red-700 font-bold text-lg">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {user.full_name || "N/A"}
              </h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* User Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">User Code</p>
              <p className="text-sm font-mono text-gray-900">{user.user_code || "N/A"}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Mobile</p>
              <p className="text-sm text-gray-900">{user.mobile || "N/A"}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Roles</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {Array.isArray(user.role_type) ? (
                  user.role_type.map((role) => (
                    <span
                      key={role}
                      className={`px-2 py-0.5 text-xs tracking-[1.36px] uppercase rounded-full ${getRoleBadge(role)}`}
                    >
                      {role}
                    </span>
                  ))
                ) : (
                  <span className={`px-2 py-0.5 text-xs tracking-[1.36px] uppercase rounded-full ${getRoleBadge(user.role_type)}`}>
                    {user.role_type}
                  </span>
                )}
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Status</p>
              <span className={`mt-1 inline-block px-2 py-1 text-xs tracking-[1.36px] uppercase rounded-full ${getStatusBadge(user.is_active ? 'active' : 'inactive')}`}>
                {user.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Joined</p>
              <p className="text-sm text-gray-900">{user.created_at ? formatDate(user.created_at) : "N/A"}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Enrollments</p>
              <p className="text-sm font-semibold text-gray-900">
                {user.enrollment_count || 0}
                {user.is_enrolled && (
                  <span className="ml-2 text-xs text-emerald-600 font-normal">
                    ● Currently enrolled
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Enrolled Courses */}
          {user.enrolled_courses && user.enrolled_courses.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Enrolled Courses ({user.enrolled_courses.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {user.enrolled_courses.map((course, idx) => (
                  <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm font-medium text-gray-900 capitalize">{course.title}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs text-gray-500">Code: {course.course_code}</span>
                      <span className={`px-1.5 py-0.5 text-xs tracking-[1.36px] uppercase rounded-full ${getStatusBadge(course.course_status)}`}>
                        {course.course_status}
                      </span>
                      <span className={`px-1.5 tracking-[1.36px] uppercase py-0.5 text-xs rounded-full ${getStatusBadge(course.enrollment_status)}`}>
                        {course.enrollment_status}
                      </span>
                      {/* {course.is_active && (
                        <span className="px-1.5 tracking-[1.36px] uppercase py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                          Active
                        </span>
                      )} */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-600 font-medium">Total Enrollments</p>
              <p className="text-xl font-bold text-blue-700">{user.enrollment_count || 0}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
              <p className="text-xs text-emerald-600 font-medium">Active Enrollments</p>
              <p className="text-xl font-bold text-emerald-700">
                {user.enrolled_courses?.filter(c => c.enrollment_status === 'active').length || 0}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-600 font-medium">Completed</p>
              <p className="text-xl font-bold text-purple-700">
                {user.enrolled_courses?.filter(c => c.enrollment_status === 'completed').length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;