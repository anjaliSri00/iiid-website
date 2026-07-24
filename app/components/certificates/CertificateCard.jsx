// src/components/certificates/CertificateCard.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  Share2,
  Eye,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

const CertificateCard = ({ certificate, program }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'expired':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Award className="w-4 h-4" />;
    }
  };

  const handleShare = () => {
    if (certificate.certificate_code) {
      const shareUrl = `${window.location.origin}/certificates/${certificate.certificate_code}`;
      if (navigator.share) {
        navigator.share({
          title: 'Certificate of Completion',
          text: `I earned a certificate for ${certificate.course_title}!`,
          url: shareUrl,
        });
      } else {
        navigator.clipboard.writeText(shareUrl);
        alert('Certificate link copied to clipboard!');
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-[#D4A574]/20 overflow-hidden group">
      {/* Card Header - Clickable to navigate to certificate page */}
      <Link
        href={`/certificates/${certificate.certificate_code}`}
        className="block relative h-40 bg-gradient-to-r from-[#8B1A1A] to-[#CC0000] overflow-hidden cursor-pointer"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <Award className="w-12 h-12 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-medium opacity-90">Certificate of Completion</p>
            <p className="text-xs opacity-75">{certificate.course_title || 'Course'}</p>
          </div>
        </div>
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="px-4 py-2 bg-white text-[#CC0000] rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2">
            <Eye className="w-4 h-4" />
            View Certificate
          </div>
        </div>

        {/* Status Badge */}
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg border text-xs font-medium flex items-center gap-1 ${getStatusColor(certificate.status || 'active')}`}>
          {getStatusIcon(certificate.status || 'active')}
          <span className="capitalize">{certificate.status || 'Active'}</span>
        </div>

        {/* Certificate Code */}
        {certificate.certificate_code && (
          <div className="absolute bottom-3 left-3 bg-black/30 backdrop-blur-sm text-white/80 text-[10px] px-2 py-1 rounded font-mono">
            #{certificate.certificate_code}
          </div>
        )}
      </Link>

      {/* Card Body */}
      <div className="p-4">
        <div className="mb-3">
          <Link href={`/certificates/${certificate.certificate_code}`} className="block hover:text-[#CC0000] transition-colors">
            <h3 className="font-semibold text-gray-900 text-base truncate">
              {certificate.course_title || 'Course Certificate'}
            </h3>
          </Link>
          <p className="text-sm text-gray-500 truncate">
            {certificate.full_name || 'Recipient'}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Issued: {formatDate(certificate.issued_at)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-3 border-t border-[#D4A574]/20">
          <Link
            href={`/certificates/${certificate.certificate_code}`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#FDF8F0] text-[#CC0000] text-sm rounded-lg hover:bg-[#F5E6D3] transition-colors"
          >
            <Eye className="w-4 h-4" />
            View
          </Link>
          <button
            onClick={handleShare}
            className="p-1.5 text-gray-400 hover:text-[#CC0000] rounded-lg hover:bg-[#FDF8F0] transition-colors"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <Link
            href={`/certificates/${certificate.certificate_code}`}
            className="p-1.5 text-gray-400 hover:text-[#CC0000] rounded-lg hover:bg-[#FDF8F0] transition-colors"
            aria-label="View details"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CertificateCard;