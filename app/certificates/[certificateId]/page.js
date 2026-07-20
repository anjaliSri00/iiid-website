// src/app/certificates/[certificateId]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  ArrowLeft,
  Award,
  Download,
  Share2,
  Printer,
  CheckCircle,
  Calendar,
  User,
  Shield,
  ExternalLink,
  Loader2,
  AlertCircle,
  Heart,
  Star,
  Trophy,
} from 'lucide-react';
import CertificateViewer from '../../components/certificates/CertificateViewer';
import { certificateApi } from '@/helper/services/certificateApi';

export default function CertificateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const certificateId = params.certificateId;

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCertificateDetails();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, certificateId]);

  const fetchCertificateDetails = async () => {
    setLoading(true);
    try {
      // Since we don't have a specific API endpoint for single certificate,
      // we'll fetch all and find the one we need
      const response = await certificateApi.getUserCertificates(session.user.id, session);
      if (response.meta?.status === 200) {
        const found = response.data.find(c => c.id === certificateId);
        if (found) {
          setCertificate(found);
        } else {
          setError('Certificate not found');
        }
      } else {
        setError('Failed to fetch certificate details');
      }
    } catch (err) {
      setError('An error occurred while fetching certificate details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await certificateApi.downloadCertificate(certificateId, session);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate_${certificate?.course_title || 'course'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Certificate of Completion',
          text: `I earned a certificate for ${certificate?.course_title || 'a course'}!`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Certificate link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#D4A574]/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-[#CC0000] rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || 'The certificate you\'re looking for doesn\'t exist or you don\'t have access.'}
          </p>
          <Link
            href="/certificates"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#CC0000] text-white rounded-lg hover:bg-[#B30000] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Certificates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/certificates"
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Certificate Details</h1>
              <p className="text-sm text-gray-600">
                {certificate.certificate_id}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download PDF
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        {/* Certificate Details */}
        <div className="bg-white rounded-xl shadow-lg border border-[#D4A574]/20 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-lg">
                <User className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Recipient</p>
                <p className="font-semibold text-gray-900">{certificate.user_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Issued</p>
                <p className="font-semibold text-gray-900">
                  {new Date(certificate.issued_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Viewer */}
        <div className="bg-white rounded-xl shadow-lg border border-[#D4A574]/20 p-2 sm:p-4">
          <CertificateViewer
            certificate={certificate}
            program={{ title: certificate.course_title }}
          />
        </div>

        {/* Verification Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-[#D4A574]/20">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              Verification
            </h4>
            <p className="text-sm text-gray-600">
              This certificate can be verified at:
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="text-xs bg-gray-100 px-3 py-1 rounded text-gray-700 flex-1 truncate">
                {`${window.location.origin}/verify/${certificateId}`}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/verify/${certificateId}`);
                  alert('Verification link copied!');
                }}
                className="px-3 py-1 text-sm text-[#CC0000] hover:bg-[#FDF8F0] rounded transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-[#D4A574]/20">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-[#CC0000]" />
              Quick Actions
            </h4>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/programs/${certificate.course_id}`}
                className="px-3 py-1.5 bg-[#FDF8F0] text-gray-700 text-sm rounded-lg hover:bg-[#F5E6D3] transition-colors"
              >
                View Course
              </Link>
              <Link
                href="/certificates"
                className="px-3 py-1.5 bg-[#FDF8F0] text-gray-700 text-sm rounded-lg hover:bg-[#F5E6D3] transition-colors"
              >
                All Certificates
              </Link>
              <Link
                href="/programs"
                className="px-3 py-1.5 bg-[#CC0000] text-white text-sm rounded-lg hover:bg-[#B30000] transition-colors"
              >
                Continue Learning
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}