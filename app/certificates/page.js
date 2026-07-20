// src/app/certificates/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Award,
  Search,
  Filter,
  Grid,
  List,
  Download,
  Share2,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Plus,
  Sparkles,
  TrendingUp,
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
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCertificates();
    }
  }, [status]);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const response = await certificateApi.getUserCertificates(session.user.id, session);
      if (response.meta?.status === 200) {
        setCertificates(response.data || []);
      } else {
        setError('Failed to fetch certificates');
      }
    } catch (err) {
      setError('An error occurred while fetching certificates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificateId) => {
    try {
      const response = await certificateApi.downloadCertificate(certificateId, session);
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      const certificate = certificates.find(c => c.id === certificateId);
      link.setAttribute('download', `Certificate_${certificate?.course_title || 'course'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleShare = async (certificateId) => {
    const certificate = certificates.find(c => c.id === certificateId);
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Certificate of Completion',
          text: `I earned a certificate for ${certificate?.course_title || 'a course'}!`,
          url: `${window.location.origin}/certificates/${certificateId}`,
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const url = `${window.location.origin}/certificates/${certificateId}`;
      await navigator.clipboard.writeText(url);
      alert('Certificate link copied to clipboard!');
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cert.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cert.certificate_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || cert.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedCertificates = [...filteredCertificates].sort((a, b) => {
    const dateA = new Date(a.issued_at || 0);
    const dateB = new Date(b.issued_at || 0);
    if (sortBy === 'recent') {
      return dateB - dateA;
    } else if (sortBy === 'oldest') {
      return dateA - dateB;
    }
    return 0;
  });

  const stats = {
    total: certificates.length,
    active: certificates.filter(c => c.status === 'active').length,
    expired: certificates.filter(c => c.status === 'expired').length,
    pending: certificates.filter(c => c.status === 'pending').length,
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#D4A574]/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-[#CC0000] rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading certificates...</p>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-[#D4A574]/20">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-red-200">
            <p className="text-sm text-gray-500">Expired</p>
            <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-yellow-200">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-[#D4A574]/20 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="pending">Pending</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
              </select>
              
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-[#CC0000] text-white' : 'bg-white text-gray-600'}`}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-[#CC0000] text-white' : 'bg-white text-gray-600'}`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
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
        ) : sortedCertificates.length === 0 ? (
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
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {sortedCertificates.map((certificate) => (
              <CertificateCard
                key={certificate.id}
                certificate={certificate}
                program={{ title: certificate.course_title }}
                onDownload={handleDownload}
                onShare={() => handleShare(certificate.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination (if needed) */}
        {sortedCertificates.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {sortedCertificates.length} certificates
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Previous
              </button>
              <button className="px-4 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-[#B30000] transition-colors">
                1
              </button>
              <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}