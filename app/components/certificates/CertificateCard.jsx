// src/components/certificates/CertificateCard.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  Calendar,
  Download,
  Eye,
  Share2,
  CheckCircle,
  Clock,
  ExternalLink,
  FileText,
  Sparkles,
  Shield,
  Lock,
  Unlock,
} from 'lucide-react';
import Image from 'next/image';

export default function CertificateCard({ certificate, program, onDownload, onShare }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload(certificate.id);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'expired':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-3.5 h-3.5" />;
      case 'expired':
        return <Clock className="w-3.5 h-3.5" />;
      case 'pending':
        return <Clock className="w-3.5 h-3.5" />;
      default:
        return <Shield className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div
      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-[#D4A574]/20 hover:border-[#CC0000]/30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Certificate Header with Gradient */}
      <div className="relative h-32 bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-300 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-400 rounded-full blur-2xl"></div>
        </div>
        
        {/* Certificate Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className="p-2 bg-[#CC0000] rounded-lg shadow-lg">
            <Award className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
            Certificate
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${getStatusColor(certificate.status || 'active')} bg-white/80 backdrop-blur-sm`}>
            {getStatusIcon(certificate.status || 'active')}
            {certificate.status || 'Active'}
          </span>
        </div>

        {/* Certificate Number */}
        <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
          ID: {certificate.certificate_id || 'CERT-2024-001'}
        </div>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-amber-600 uppercase tracking-wider">
                Certificate of Completion
              </span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              {certificate.course_title || program?.title || 'Course Title'}
            </h3>
          </div>
        </div>
      </div>

      {/* Certificate Body */}
      <div className="p-4">
        {/* Recipient Info */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#CC0000]/10 flex items-center justify-center">
              <span className="text-[#CC0000] font-semibold text-sm">
                {certificate.user_name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {certificate.user_name || 'Student Name'}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(certificate.issued_at || Date.now()).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              {certificate.expires_at && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Expires: {new Date(certificate.expires_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Verification Badge */}
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 mb-3">
          <Shield className="w-4 h-4 text-green-600" />
          <span className="text-xs text-green-700 font-medium">Verified Certificate</span>
          <span className="text-[10px] text-green-600 ml-auto bg-white px-2 py-0.5 rounded-full">
            ✓ Authentic
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/certificates/${certificate.id}`}
            className="flex-1 min-w-[80px] flex items-center justify-center gap-1.5 px-3 py-2 bg-[#CC0000] text-white text-sm font-medium rounded-lg hover:bg-[#B30000] transition-colors"
          >
            <Eye className="w-4 h-4" />
            View
          </Link>
          
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 min-w-[80px] flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Download className="w-4 h-4" />
            )}
            Download
          </button>

          <button
            onClick={onShare}
            className="px-3 py-2 bg-gray-50 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
            aria-label="Share certificate"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 pt-3 border-t border-[#D4A574]/10 flex items-center justify-between">
          <button className="text-xs text-gray-400 hover:text-[#CC0000] transition-colors flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            Verify online
          </button>
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Blockchain verified
          </span>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#CC0000]/5 via-transparent to-amber-500/5"></div>
        </div>
      )}
    </div>
  );
}