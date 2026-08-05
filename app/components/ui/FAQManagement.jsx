// components/ui/FAQManagement.js
"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  X,
  Edit,
  Trash2Icon,
  Search,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  MessageSquare,
  FileText,
  Clock,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-toastify";
import fetchApiResponse from "@/helper/api_data_store";

const FAQManagement = ({ session, onStatsUpdate }) => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    page_id: null,
    page_name: "",
    is_collapsed: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPage, setSelectedPage] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [pages, setPages] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    collapsed: 0,
    expanded: 0,
    pages: 0,
  });

  // Add this constant after the imports
  const PAGE_NAMES = [
    { id: 1, label: "Home" },
    { id: 2, label: "About Us" },
    { id: 3, label: "Apply Online" },
    { id: 4, label: "Contact Us" },
  ];

  // Fetch FAQs
  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/faqs/list`,
        {
          method: "GET",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
        },
      );

      if (response.meta?.status === 200 && response.data) {
        const faqData = Array.isArray(response.data) ? response.data : [];
        setFaqs(faqData);

        // Extract unique page names (filter out null values)
        const uniquePages = [
          ...new Set(
            faqData
              .map((faq) => faq.page_name)
              .filter(
                (name) => name !== null && name !== undefined && name !== "",
              ),
          ),
        ];
        setPages(uniquePages);

        // Update stats
        const collapsedCount = faqData.filter(
          (f) => f.is_collapsed === true,
        ).length;
        const expandedCount = faqData.filter(
          (f) => f.is_collapsed === false,
        ).length;
        setStats({
          total: faqData.length,
          collapsed: collapsedCount,
          expanded: expandedCount,
          pages: uniquePages.length,
        });

        if (onStatsUpdate) {
          onStatsUpdate({
            totalFAQs: faqData.length,
            collapsedFAQs: collapsedCount,
            expandedFAQs: expandedCount,
            faqPages: uniquePages.length,
          });
        }
      } else {
        toast.error(response.meta?.message || "Failed to fetch FAQs");
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Create FAQ
  const handleCreateFAQ = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        is_collapsed: formData.is_collapsed || false,
      };

      // Only include page_id if provided and valid
      if (
        formData.page_id !== null &&
        formData.page_id !== "" &&
        !isNaN(formData.page_id)
      ) {
        payload.page_id = parseInt(formData.page_id);
      }

      // Only include page_name if provided
      if (formData.page_name && formData.page_name.trim()) {
        payload.page_name = formData.page_name.trim();
      }

      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/faqs/create`,
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

      if (response.meta?.status === 201 || response.meta?.status === 200) {
        toast.success("FAQ created successfully!");
        resetForm();
        fetchFAQs();
      } else {
        toast.error(response.meta?.message || "Failed to create FAQ");
      }
    } catch (error) {
      console.error("Error creating FAQ:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Update FAQ
  const handleUpdateFAQ = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const payload = {};

      // Only include fields that have changed
      if (formData.question.trim() !== editingFaq.question) {
        payload.question = formData.question.trim();
      }
      if (formData.answer.trim() !== editingFaq.answer) {
        payload.answer = formData.answer.trim();
      }
      if (formData.is_collapsed !== editingFaq.is_collapsed) {
        payload.is_collapsed = formData.is_collapsed;
      }

      // Handle page_id changes
      const newPageId =
        formData.page_id !== null &&
        formData.page_id !== "" &&
        !isNaN(formData.page_id)
          ? parseInt(formData.page_id)
          : null;
      if (newPageId !== editingFaq.page_id) {
        payload.page_id = newPageId;
      }

      // Handle page_name changes
      const newPageName =
        formData.page_name && formData.page_name.trim()
          ? formData.page_name.trim()
          : null;
      if (newPageName !== editingFaq.page_name) {
        payload.page_name = newPageName;
      }

      // Check if there are any changes
      if (Object.keys(payload).length === 0) {
        toast.info("No changes to update");
        setSaving(false);
        return;
      }

      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/faqs/update/${editingFaq.id}`,
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
        toast.success("FAQ updated successfully!");
        resetForm();
        setEditingFaq(null);
        fetchFAQs();
      } else {
        toast.error(response.meta?.message || "Failed to update FAQ");
      }
    } catch (error) {
      console.error("Error updating FAQ:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Delete FAQ
  const handleDeleteFAQ = async (faqId, question) => {
    if (!confirm(`Are you sure you want to delete "${question}"?`)) return;

    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/faqs/delete/${faqId}`,
        {
          method: "DELETE",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
        },
      );

      if (response.meta?.status === 200) {
        toast.success("FAQ deleted successfully!");
        fetchFAQs();
      } else {
        toast.error(response.meta?.message || "Failed to delete FAQ");
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  // Toggle FAQ Collapsed Status
  const handleToggleCollapsed = async (faqId, currentStatus) => {
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/faqs/update/${faqId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
          body: JSON.stringify({
            is_collapsed: !currentStatus,
          }),
        },
      );

      if (response.meta?.status === 200) {
        // toast.success(`FAQ ${!currentStatus ? 'collapsed' : 'expanded'} successfully!`);
        fetchFAQs();
      } else {
        toast.error(response.meta?.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  // Validate Form
  const validateForm = () => {
    const errors = {};
    if (!formData.question?.trim()) errors.question = "Question is required";
    if (!formData.answer?.trim()) errors.answer = "Answer is required";

    // Validate page_id if provided
    if (formData.page_id !== null && formData.page_id !== "") {
      const pageIdNum = parseInt(formData.page_id);
      if (isNaN(pageIdNum) || pageIdNum < 0) {
        errors.page_id = "Page ID must be a valid positive number";
      }
    }

    return errors;
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      question: "",
      answer: "",
      page_id: null,
      page_name: "",
      is_collapsed: false,
    });
    setFormErrors({});
    setShowCreateForm(false);
    setEditingFaq(null);
  };

  // Edit FAQ
  const handleEditFaq = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question || "",
      answer: faq.answer || "",
      page_id: faq.page_id || null,
      page_name: faq.page_name || "",
      is_collapsed: faq.is_collapsed || false,
    });
    setShowCreateForm(true);
    setFormErrors({});
  };

  // Filter FAQs
  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPage =
      selectedPage === "all" || faq.page_name === selectedPage;
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "collapsed" && faq.is_collapsed === true) ||
      (selectedStatus === "expanded" && faq.is_collapsed === false);
    return matchesSearch && matchesPage && matchesStatus;
  });

  // Toggle Expand (for viewing answer)
  const toggleExpand = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  // Initial fetch
  useEffect(() => {
    if (session) {
      fetchFAQs();
    }
  }, [session]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-red-600" />
            FAQ Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage frequently asked questions
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            if (!showCreateForm) {
              setEditingFaq(null);
              setFormData({
                question: "",
                answer: "",
                page_id: null,
                page_name: "",
                is_collapsed: false,
              });
              setFormErrors({});
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-200 w-full sm:w-auto justify-center"
        >
          {showCreateForm ? (
            <X className="w-5 h-5" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
          {showCreateForm ? "Cancel" : "Add FAQ"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total FAQs</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <ChevronDown className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">
                Collapsed (Default Closed)
              </p>
              <p className="text-xl font-bold text-amber-600">
                {stats.collapsed}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ChevronUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Expanded (Default Open)</p>
              <p className="text-xl font-bold text-green-600">
                {stats.expanded}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pages</p>
              <p className="text-xl font-bold text-purple-600">{stats.pages}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="mb-6 bg-white  shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingFaq ? "Edit FAQ" : "Create New FAQ"}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={editingFaq ? handleUpdateFAQ : handleCreateFAQ}>
              <div className="space-y-4">
                {/* Question */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question *
                  </label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) => {
                      setFormData({ ...formData, question: e.target.value });
                      if (formErrors.question) {
                        setFormErrors({ ...formErrors, question: "" });
                      }
                    }}
                    className={`w-full px-4 py-2.5 border ${
                      formErrors.question ? "border-red-300" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition`}
                    placeholder="Enter the question"
                  />
                  {formErrors.question && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.question}
                    </p>
                  )}
                </div>

                {/* Answer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Answer *
                  </label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => {
                      setFormData({ ...formData, answer: e.target.value });
                      if (formErrors.answer) {
                        setFormErrors({ ...formErrors, answer: "" });
                      }
                    }}
                    rows="4"
                    className={`w-full px-4 py-2.5 border ${
                      formErrors.answer ? "border-red-300" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition`}
                    placeholder="Enter the answer"
                  />
                  {formErrors.answer && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.answer}
                    </p>
                  )}
                </div>

                {/* Page ID and Page Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Page ID
                    </label>
                    <input
                      type="number"
                      value={formData.page_id !== null ? formData.page_id : ""}
                      // onChange={(e) => {
                      //   const value = e.target.value;
                      //   setFormData({
                      //     ...formData,
                      //     page_id: value ? parseInt(value) : null,
                      //   });
                      //   if (formErrors.page_id) {
                      //     setFormErrors({ ...formErrors, page_id: "" });
                      //   }
                      // }}
                      readOnly
                      className={`w-full px-4 py-2.5 border ${
                        formErrors.page_id
                          ? "border-red-300"
                          : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition`}
                      placeholder="Auto-filled based on page selection"

                      // min="0"
                    />
                    {formErrors.page_id && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {formErrors.page_id}
                      </p>
                    )}
                  </div>
                  {/* Page Name Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Page Name *
                    </label>
                    <select
                      value={formData.page_name || ""}
                      onChange={(e) => {
                        const selectedLabel = e.target.value;
                        // Find the selected page object
                        const selectedPage = PAGE_NAMES.find(
                          (page) => page.label === selectedLabel,
                        );

                        // Update both page_name and page_id automatically
                        setFormData({
                          ...formData,
                          page_name: selectedLabel,
                          page_id: selectedPage ? selectedPage.id : null,
                        });

                        if (formErrors.page_name) {
                          setFormErrors({ ...formErrors, page_name: "" });
                        }
                      }}
                      className={`w-full px-4 py-2.5 border ${
                        formErrors.page_name
                          ? "border-red-300"
                          : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white`}
                    >
                      <option value="">Select a page</option>
                      {PAGE_NAMES.map((page) => (
                        <option key={page.id} value={page.label}>
                          {page.label}
                        </option>
                      ))}
                    </select>
                    {formErrors.page_name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {formErrors.page_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Collapsed Status Toggle - This sets the default state */}
                <div className="flex items-center gap-3 p-3 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_collapsed"
                      checked={formData.is_collapsed}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_collapsed: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <label
                      htmlFor="is_collapsed"
                      className="text-sm font-medium text-gray-700"
                    >
                      Collapsed by Default
                    </label>
                  </div>
                  <span className="text-xs text-gray-500">
                    (When checked, FAQ will be closed/ collapsed when page
                    loads)
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-50 shadow-lg shadow-red-200"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {saving
                      ? "Saving..."
                      : editingFaq
                        ? "Update FAQ"
                        : "Create FAQ"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2.5 border border-gray-300 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
          >
            <option value="all">All Pages</option>
            {PAGE_NAMES.map((page) => (
              <option key={page.id} value={page.label}>
                {page.label}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
          >
            <option value="all">All Status</option>
            <option value="collapsed">Collapsed (Default Closed)</option>
            <option value="expanded">Expanded (Default Open)</option>
          </select>
          <button
            onClick={fetchFAQs}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* FAQs List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="text-center py-12 bg-white  border border-gray-200">
          <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No FAQs found</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchTerm || selectedPage !== "all" || selectedStatus !== "all"
              ? "Try adjusting your filters"
              : "Create your first FAQ to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            // Determine if FAQ should be expanded (open) based on is_collapsed
            // If is_collapsed is true, the FAQ is collapsed by default (closed)
            // So we check if user has manually expanded it
            const isOpen =
              expandedFaq === faq.id ||
              (!faq.is_collapsed && expandedFaq !== faq.id);
            // Only override if user hasn't clicked on it
            const shouldShowAnswer =
              expandedFaq === faq.id ? true : !faq.is_collapsed;

            return (
              <div
                key={faq.id}
                className="bg-white  border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div
                  className="p-4 sm:p-6 cursor-pointer"
                  onClick={() => toggleExpand(faq.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {faq.page_name && (
                          <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-medium">
                            {faq.page_name}
                          </span>
                        )}
                        {faq.page_id !== null && faq.page_id !== undefined && (
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium">
                            Page ID: {faq.page_id}
                          </span>
                        )}
                        <span
                          className={`px-2.5 py-1 text-xs font-medium ${
                            faq.is_collapsed === true
                              ? "bg-amber-50 text-amber-600"
                              : "bg-green-50 text-green-600"
                          }`}
                        >
                          {faq.is_collapsed === true
                            ? "Collapsed (Default Closed)"
                            : "Expanded (Default Open)"}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {faq.question}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Created:{" "}
                          {new Date(faq.created_at).toLocaleDateString()}
                        </span>
                        {faq.updated_at &&
                          faq.updated_at !== faq.created_at && (
                            <span className="flex items-center gap-1">
                              <RefreshCw className="w-3 h-3" />
                              Updated:{" "}
                              {new Date(faq.updated_at).toLocaleDateString()}
                            </span>
                          )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Toggle button - Changes the is_collapsed state */}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditFaq(faq);
                        }}
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFAQ(faq.id, faq.question);
                        }}
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Delete"
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleCollapsed(faq.id, faq.is_collapsed);
                        }}
                        className={`p-2 rounded-xl transition-colors ${
                          faq.is_collapsed === true
                            ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        }`}
                        title={
                          faq.is_collapsed === true
                            ? "Make Expanded (Open by default)"
                            : "Make Collapsed (Closed by default)"
                        }
                      >
                        {faq.is_collapsed === true ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Answer Section - Controlled by is_collapsed and user interaction */}
                {shouldShowAnswer && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 border-t border-gray-100">
                    <div className="pt-4 text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FAQManagement;
