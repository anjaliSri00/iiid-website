// app/certificates/page.js
"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Award,
  Search,
  Grid,
  List,
  Loader2,
  Plus,
  Sparkles,
  AlertCircle,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  GraduationCap,
  ArrowRight,
  School,
  Target,
  Star,
} from "lucide-react";
import CertificateCard from "../components/certificates/CertificateCard";
import { certificateApi } from "@/helper/services/certificateApi";

export default function CertificatesPage() {
  const { data: session, status } = useSession();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Debounce timer reference
  const debounceTimerRef = useRef(null);

  // Debounce search term
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  // Reset page when search changes
  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  }, [debouncedSearchTerm]);

  // Fetch certificates when session, page, or debounced search changes
  useEffect(() => {
    if (status === "authenticated") {
      fetchCertificates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, pagination.page, debouncedSearchTerm]);

  const fetchCertificates = async () => {
    if (!session) return;

    setLoading(true);
    setError(null);

    try {
      const result = await certificateApi.getUserCertificates(session, {
        search: debouncedSearchTerm || undefined,
        page: pagination.page,
        limit: pagination.limit,
      });

      if (result.success && result.data) {
        const certificatesData = result.data.certificates || result.data || [];
        setCertificates(
          Array.isArray(certificatesData) ? certificatesData : [],
        );

        if (result.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: result.data.pagination?.total || 0,
            totalPages: result.data.pagination?.totalPages || 0,
          }));
        }
      } else {
        setError(result.message || "Failed to fetch certificates");
        setCertificates([]);
      }
    } catch (err) {
      console.error("Error fetching certificates:", err);
      setError("An error occurred while fetching certificates");
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  // Manual search handler (for form submit)
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  // Check if no certificates
  const hasNoCertificates = !loading && certificates.length === 0 && !error && !searchTerm;

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#CC0000] mx-auto" />
          <p className="mt-4 text-gray-600">Loading certificates...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center p-4">
        <div className="bg-white shadow-lg p-8 max-w-md w-full text-center">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Login Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please login to view your certificates
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#CC0000] text-white hover:bg-[#B30000] transition-colors"
          >
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Award className="w-8 h-8 text-[#CC0000]" />
              My Certificates
            </h1>
            <p className="text-gray-600 mt-1">
              Track and manage all your earned certificates
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/apply-online"
              className="flex items-center gap-2 px-4 py-2 bg-[#CC0000] text-white hover:bg-[#B30000] transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Courses
            </Link>
          </div>
        </div>

        {/* Search Section - Only show if there are certificates or search is active */}
        {(!hasNoCertificates || searchTerm) && (
          <div className="bg-white shadow-sm border border-[#D4A574]/20 p-4 mb-6">
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search certificates by course name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#CC0000] text-white hover:bg-[#B30000] transition-colors"
                >
                  Search
                </button>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Empty State - No Certificates */}
        {hasNoCertificates && (
          <div className="bg-white shadow-sm border border-[#D4A574]/20 p-12 text-center">
            <div className="max-w-2xl mx-auto">
              {/* Icon with animation */}
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-[#CC0000]/10 rounded-full flex items-center justify-center mx-auto">
                  <Award className="w-12 h-12 text-[#CC0000]" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#CC0000] rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No Certificates Yet
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                You haven't earned any certificates yet. Start your learning journey and earn your first professional certification.
              </p>

              {/* Quick Stats or Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#FDF8F0] p-4 border border-[#D4A574]/20">
                  <div className="flex items-center justify-center gap-2 text-[#CC0000] mb-1">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-gray-600">Quality Courses</p>
                </div>
                <div className="bg-[#FDF8F0] p-4 border border-[#D4A574]/20">
                  <div className="flex items-center justify-center gap-2 text-[#CC0000] mb-1">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-gray-600">Expert Instructors</p>
                </div>
                <div className="bg-[#FDF8F0] p-4  border border-[#D4A574]/20">
                  <div className="flex items-center justify-center gap-2 text-[#CC0000] mb-1">
                    <Target className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-gray-600">Industry Recognition</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/apply-online">
                  <button className="px-6 py-3 bg-[#CC0000] text-white hover:bg-[#B30000] transition-colors font-medium flex items-center gap-2 mx-auto sm:mx-0">
                    <Plus className="w-4 h-4" />
                    Browse Courses
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                {/* <Link href="/#programs">
                  <button className="px-6 py-3 border-2 border-[#CC0000] text-[#CC0000] hover:bg-[#CC0000] hover:text-white transition-colors font-medium flex items-center gap-2 mx-auto sm:mx-0">
                    <School className="w-4 h-4" />
                    View Programs
                  </button>
                </Link> */}
              </div>

              {/* Help text */}
              <p className="text-xs text-gray-400 mt-6">
                Need help? Contact our support team at support@iiid.institute
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <p className="text-red-800 font-medium">{error}</p>
            <button
              onClick={fetchCertificates}
              className="mt-3 text-red-600 hover:text-red-800 font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Certificates Grid/List - Only show if there are certificates */}
        {!hasNoCertificates && !error && (
          <>
            {/* View toggle and results count */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <p className="text-sm text-gray-600">
                Showing {certificates.length} of {pagination.total} certificates
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 border transition-colors ${
                    viewMode === "grid"
                      ? "border-[#CC0000] bg-[#CC0000] text-white"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                {/* <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 border transition-colors ${
                    viewMode === "list"
                      ? "border-[#CC0000] bg-[#CC0000] text-white"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button> */}
              </div>
            </div>

            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {certificates.map((certificate) => (
                <CertificateCard
                  key={certificate.id || certificate.certificate_code}
                  certificate={certificate}
                  program={{ title: certificate.course_title }}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600">
                  Showing {certificates.length} of {pagination.total} certificates
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <span className="px-4 py-2 bg-[#CC0000] text-white min-w-[40px] text-center">
                    {pagination.page}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}