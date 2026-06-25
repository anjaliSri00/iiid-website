// app/dashboard/page.js
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  Trash2,
  Edit,
  Play,
  Download,
  Save,
} from "lucide-react";
import { toast } from "react-toastify";
import fetchApiResponse from "@/helper/api_data_store";
import sha256 from "crypto-js/sha256";
import { signOut } from "next-auth/react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'programs', 'password'

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
    thumbnail: "",
    video_url: "",
    status: "draft",
  });
  const [programErrors, setProgramErrors] = useState({});
  const [programSaving, setProgramSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [programSuccess, setProgramSuccess] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/dashboard");
    }
  }, [status, router]);

  // Fetch profile data
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchProfile();
      fetchPrograms();
    }
  }, [status, session]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const userId = session?.user?.id;
      if (!userId) {
        toast.error("User ID not found");
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

      if (response.meta?.status === 200 && response.data?.data) {
        setProfile(response.data.data);
      } else {
        toast.error(response.meta?.message || "Failed to fetch profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    setProgramsLoading(true);
    try {
      // Mock data - replace with actual API call
      // const response = await fetchApiResponse(
      //   `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses`,
      //   {
      //     method: 'GET',
      //     headers: {
      //       'Access-Token': session?.accessToken,
      //       'Refresh-Token': session?.refreshToken
      //     },
      //   }
      // );

      // Mock data for demonstration
      setTimeout(() => {
        setPrograms([
          {
            id: 1,
            title: "Full Stack Web Development",
            description:
              "Learn HTML, CSS, JavaScript, React, Node.js, and MongoDB",
            category: "Web Development",
            duration: "6 months",
            level: "Intermediate",
            price: 499,
            thumbnail: "https://via.placeholder.com/300x200",
            video_url: "https://www.youtube.com/watch?v=example",
            status: "published",
            created_at: "2024-01-15",
            enrolled_count: 45,
            rating: 4.8,
          },
          {
            id: 2,
            title: "Data Science & Machine Learning",
            description: "Python, Pandas, NumPy, Scikit-learn, TensorFlow",
            category: "Data Science",
            duration: "4 months",
            level: "Advanced",
            price: 599,
            thumbnail: "https://via.placeholder.com/300x200",
            video_url: "https://www.youtube.com/watch?v=example2",
            status: "published",
            created_at: "2024-02-01",
            enrolled_count: 32,
            rating: 4.7,
          },
          {
            id: 3,
            title: "UI/UX Design Masterclass",
            description: "Design thinking, Figma, Adobe XD, User Research",
            category: "Design",
            duration: "3 months",
            level: "Beginner",
            price: 349,
            thumbnail: "https://via.placeholder.com/300x200",
            video_url: "https://www.youtube.com/watch?v=example3",
            status: "draft",
            created_at: "2024-03-10",
            enrolled_count: 0,
            rating: 0,
          },
        ]);
        setProgramsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching programs:", error);
      toast.error("Failed to fetch programs");
      setProgramsLoading(false);
    }
  };

  // Check password strength
  const checkPasswordStrength = (password) => {
    let score = 0;
    let feedback = [];

    if (password.length === 0) {
      return { score: 0, feedback: "", strengthText: "" };
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
      toast.error("Please fix all errors before submitting");
      return;
    }

    setPasswordLoading(true);
    setPasswordErrors({});
    setPasswordSuccess(false);

    try {
      // Hash passwords with SHA-256
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

        // Reset form data
        setPasswordData({
          old_password: "",
          new_password: "",
          confirm_password: "",
        });
        setPasswordStrength({ score: 0, feedback: "" });

        // Show success message and logout after 3 seconds
        setTimeout(() => {
          // Sign out the user
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

  // Program/Course handlers
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
      toast.error("Please fill all required fields");
      return;
    }

    setProgramSaving(true);
    setProgramSuccess(false);

    try {
      // Mock API call - replace with actual API
      // const response = await fetchApiResponse(
      //   `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses${editingProgram ? '/' + editingProgram.id : ''}`,
      //   {
      //     method: editingProgram ? 'PUT' : 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //       'Access-Token': session?.accessToken,
      //       'Refresh-Token': session?.refreshToken
      //     },
      //     body: JSON.stringify(programFormData),
      //   }
      // );

      // Mock success
      const newProgram = {
        id: editingProgram ? editingProgram.id : Date.now(),
        ...programFormData,
        created_at: new Date().toISOString().split("T")[0],
        enrolled_count: 0,
        rating: 0,
      };

      if (editingProgram) {
        setPrograms((prev) =>
          prev.map((p) => (p.id === editingProgram.id ? newProgram : p)),
        );
        toast.success("Program updated successfully!");
      } else {
        setPrograms((prev) => [newProgram, ...prev]);
        toast.success("Program created successfully!");
      }

      setProgramSuccess(true);
      setShowCreateProgram(false);
      setEditingProgram(null);
      resetProgramForm();

      setTimeout(() => setProgramSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving program:", error);
      toast.error("Failed to save program");
    } finally {
      setProgramSaving(false);
    }
  };

  const addLesson = () => {
    setProgramFormData((prev) => ({
      ...prev,
      lessons: [
        ...(prev.lessons || []),
        {
          title: "",
          description: "",
          duration: "",
          lesson_type: "video",
          online_offline: "online",
          published: "draft",
          video_url: "",
        },
      ],
    }));
  };

  const removeLesson = (index) => {
    setProgramFormData((prev) => ({
      ...prev,
      lessons: prev.lessons.filter((_, i) => i !== index),
    }));
  };

  const updateLesson = (index, field, value) => {
    setProgramFormData((prev) => ({
      ...prev,
      lessons: prev.lessons.map((lesson, i) =>
        i === index ? { ...lesson, [field]: value } : lesson,
      ),
    }));
  };

  // Session handlers
  const addSession = () => {
    setProgramFormData((prev) => ({
      ...prev,
      sessions: [
        ...(prev.sessions || []),
        {
          title: "",
          session_type: "live",
          session_status: "scheduled",
          amount_paid: 0,
        },
      ],
    }));
  };

  const removeSession = (index) => {
    setProgramFormData((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((_, i) => i !== index),
    }));
  };

  const updateSession = (index, field, value) => {
    setProgramFormData((prev) => ({
      ...prev,
      sessions: prev.sessions.map((session, i) =>
        i === index ? { ...session, [field]: value } : session,
      ),
    }));
  };

  // Update the resetProgramForm function
  const resetProgramForm = () => {
    setProgramFormData({
      title: "",
      description: "",
      category: "",
      duration: "",
      level: "",
      price: "",
      thumbnail: "",
      video_url: "",
      status: "draft",
      course_code: "",
      payment_type: "one_time",
      payment_method: "online",
      payment_status: "pending",
      payment_date: "",
      payment_location: "",
      lessons: [],
      sessions: [],
    });
    setProgramErrors({});
  };

  const handleEditProgram = (program) => {
    setEditingProgram(program);
    setProgramFormData(program);
    setShowCreateProgram(true);
  };

  const handleDeleteProgram = async (programId) => {
    if (!confirm("Are you sure you want to delete this program?")) return;

    try {
      // Mock delete - replace with actual API
      // await fetchApiResponse(
      //   `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${programId}`,
      //   {
      //     method: 'DELETE',
      //     headers: {
      //       'Access-Token': session?.accessToken,
      //       'Refresh-Token': session?.refreshToken
      //     },
      //   }
      // );

      setPrograms((prev) => prev.filter((p) => p.id !== programId));
      toast.success("Program deleted successfully!");
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
    };
    return styles[status] || styles.draft;
  };

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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">
            Profile not found
          </h3>
          <p className="text-gray-500 mt-2">Unable to load your profile data</p>
          <button
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, {profile.full_name}!
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-8">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden mb-4">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="w-full h-full object-cover"
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
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "overview"
                        ? "border-red-600 text-red-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Activity className="w-4 h-4 inline mr-2" />
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("programs")}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "programs"
                        ? "border-red-600 text-red-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Programs
                  </button>
                  <button
                    onClick={() => setActiveTab("password")}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Welcome to Your Dashboard
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Manage your profile, create and manage programs, and update
                    your security settings.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        Manage your courses and programs
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-full">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">Published</h4>
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
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Quick Actions
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setActiveTab("programs");
                          setShowCreateProgram(true);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Plus className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-700">
                          Create Program
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
                    </div>
                  </div>
                </div>
              ) : activeTab === "programs" ? (
                // Programs Tab
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
                                Course Code
                              </label>
                              <input
                                type="text"
                                name="course_code"
                                value={programFormData.course_code || ""}
                                onChange={handleProgramFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                placeholder="e.g., CS101"
                              />
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
                                <option value="Design">Design</option>
                                <option value="Business">Business</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Photography">Photography</option>
                                <option value="Music">Music</option>
                                <option value="Other">Other</option>
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
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">
                                  Intermediate
                                </option>
                                <option value="Advanced">Advanced</option>
                                <option value="Expert">Expert</option>
                              </select>
                              {programErrors.level && (
                                <p className="mt-1 text-sm text-red-600">
                                  {programErrors.level}
                                </p>
                              )}
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
                                Price ($) *
                              </label>
                              <input
                                type="number"
                                name="price"
                                value={programFormData.price}
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
                              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
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
                                    <button
                                      type="button"
                                      onClick={() => removeLesson(index)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
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
                                          updateLesson(
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
                                        Duration
                                      </label>
                                      <input
                                        type="text"
                                        value={lesson.duration || ""}
                                        onChange={(e) =>
                                          updateLesson(
                                            index,
                                            "duration",
                                            e.target.value,
                                          )
                                        }
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                        placeholder="e.g., 30 min"
                                      />
                                    </div>
                                    <div className="md:col-span-2">
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Description
                                      </label>
                                      <textarea
                                        value={lesson.description || ""}
                                        onChange={(e) =>
                                          updateLesson(
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
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Lesson Type
                                      </label>
                                      <select
                                        value={lesson.lesson_type || "video"}
                                        onChange={(e) =>
                                          updateLesson(
                                            index,
                                            "lesson_type",
                                            e.target.value,
                                          )
                                        }
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                      >
                                        <option value="video">Video</option>
                                        {/* <option value="audio">Audio</option> */}
                                        <option value="text">Text</option>
                                        {/* <option value="interactive">
                                          Interactive
                                        </option> */}
                                      </select>
                                    </div>
                                  
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Published
                                      </label>
                                      <select
                                        value={lesson.published || "draft"}
                                        onChange={(e) =>
                                          updateLesson(
                                            index,
                                            "published",
                                            e.target.value,
                                          )
                                        }
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                      >
                                        <option value="draft">Draft</option>
                                        <option value="published">
                                          Published
                                        </option>
                                      </select>
                                    </div>
                                    <div className="md:col-span-2">
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Video URL
                                      </label>
                                      <input
                                        type="url"
                                        value={lesson.video_url || ""}
                                        onChange={(e) =>
                                          updateLesson(
                                            index,
                                            "video_url",
                                            e.target.value,
                                          )
                                        }
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                      />
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
                        {/* Payment & Enrollment Information */}
                        <div className="border-b border-gray-200 pb-4">
                          <h5 className="text-sm font-semibold text-gray-700 mb-3">
                            Payment & Enrollment
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Type
                              </label>
                              <select
                                name="payment_type"
                                value={
                                  programFormData.payment_type || "one_time"
                                }
                                onChange={handleProgramFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                              >
                                <option value="one_time">One Time</option>
                                <option value="subscription">
                                  Subscription
                                </option>
                                <option value="installment">Installment</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Method
                              </label>
                              <select
                                name="payment_method"
                                value={
                                  programFormData.payment_method || "online"
                                }
                                onChange={handleProgramFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                              >
                                <option value="online">Online</option>
                                <option value="offline">Offline</option>
                                <option value="both">Both</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Status
                              </label>
                              <select
                                name="payment_status"
                                value={
                                  programFormData.payment_status || "pending"
                                }
                                onChange={handleProgramFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                              >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Date
                              </label>
                              <input
                                type="date"
                                name="payment_date"
                                value={programFormData.payment_date || ""}
                                onChange={handleProgramFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Course Media */}
                        <div className="border-b border-gray-200 pb-4">
                          <h5 className="text-sm font-semibold text-gray-700 mb-3">
                            Course Media
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Thumbnail Image
                              </label>
                              <input
                                type="url"
                                name="thumbnail"
                                value={programFormData.thumbnail || ""}
                                onChange={handleProgramFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                placeholder="https://example.com/thumbnail.jpg"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Promo Video URL
                              </label>
                              <input
                                type="url"
                                name="video_url"
                                value={programFormData.video_url || ""}
                                onChange={handleProgramFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                placeholder="https://www.youtube.com/watch?v=..."
                              />
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
                      <p className="text-gray-500">No programs created yet</p>
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
                  ) : (
                    <div className="space-y-4">
                      {programs.map((program) => (
                        <div
                          key={program.id}
                          className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col md:flex-row">
                            {program.thumbnail && (
                              <div className="md:w-48 h-32 bg-gray-200 flex-shrink-0">
                                <img
                                  src={program.thumbnail}
                                  alt={program.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-900">
                                      {program.title}
                                    </h4>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(program.status)}`}
                                    >
                                      {program.status}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {program.description}
                                  </p>
                                </div>
                                <div className="flex gap-2 flex-shrink-0 ml-4">
                                  <button
                                    onClick={() => handleEditProgram(program)}
                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                    title="Edit"
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
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
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
                                  ${program.price}
                                </span>
                                {program.enrolled_count > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {program.enrolled_count} enrolled
                                  </span>
                                )}
                                {program.rating > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    {program.rating}
                                  </span>
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
                // Change Password Tab
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
                        Password changed successfully!
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