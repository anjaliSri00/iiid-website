// app/certificates/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
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
  ChevronRight
} from 'lucide-react';
import CertificateCard from '../components/certificates/CertificateCard';
import { certificateApi } from '@/helper/services/certificateApi';

export default function CertificatesPage() {
  const { data: session, status } = useSession();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCertificates();
    }
  }, [status, pagination.page]);

  const fetchCertificates = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await certificateApi.getUserCertificates(session, {
        search: searchTerm || undefined,
        page: pagination.page,
        limit: pagination.limit
      });
      
      if (result.success && result.data) {
        // Assuming response.data contains { certificates: [], pagination: {} }
        const certificatesData = result.data.certificates || result.data || [];
        setCertificates(Array.isArray(certificatesData) ? certificatesData : []);
        
        // Set pagination info if available
        if (result.data.pagination) {
          setPagination(prev => ({
            ...prev,
            total: result.data.pagination.total || 0,
            totalPages: result.data.pagination.totalPages || 0
          }));
        }
      } else {
        setError(result.message || 'Failed to fetch certificates');
        setCertificates([]);
      }
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError('An error occurred while fetching certificates');
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchCertificates();
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#CC0000] mx-auto" />
          <p className="mt-4 text-gray-600">Loading certificates...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to view your certificates</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-[#B30000] transition-colors"
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
              href="/programs"
              className="flex items-center gap-2 px-4 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-[#B30000] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Continue Learning
            </Link>
          </div>
        </div>

        {/* Stats */}
        {certificates.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-[#D4A574]/20">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total || certificates.length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {certificates.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-red-200">
              <p className="text-sm text-gray-500">Expired</p>
              <p className="text-2xl font-bold text-red-600">
                {certificates.filter(c => c.status === 'expired').length}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-yellow-200">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {certificates.filter(c => c.status === 'pending').length}
              </p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-[#D4A574]/20 p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search certificates by course name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-[#B30000] transition-colors"
              >
                Search
              </button>
              
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-[#CC0000] text-white' : 'bg-white text-gray-600'}`}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-[#CC0000] text-white' : 'bg-white text-gray-600'}`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Certificates Grid/List */}
        {error ? (
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
        ) : certificates.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-[#D4A574]/20">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Certificates Yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Complete courses and pass assessments to earn certificates
            </p>
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 mt-4 px-6 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-[#B30000] transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Browse Programs
            </Link>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
            }>
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
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {certificates.length} of {pagination.total} certificates
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 bg-[#CC0000] text-white rounded-lg">
                    {pagination.page}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
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