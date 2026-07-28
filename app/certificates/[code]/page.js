// app/certificates/[code]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Award, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ArrowLeft, 
  Share2,
  Download,
  FileText
} from 'lucide-react';
import CertificateTemplate from '../../components/certificates/CertificateTemplate';
import { certificateApi } from '@/helper/services/certificateApi';
import { useSession } from 'next-auth/react';

export default function CertificatePage() {
  const {data:session} = useSession();
  const params = useParams();
  const router = useRouter();
  const code = params?.code;
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    if (code) {
      fetchCertificate();
    } else {
      console.error('No certificate code found');
      setError('Certificate code is missing');
      setLoading(false);
    }
  }, [code]);

  const fetchCertificate = async () => {
    setLoading(true);
    setError(null);
    try {
      // console.log('Fetching certificate with code:', code);
      const result = await certificateApi.getCertificateByCode(code);
      console.log('API Result:', result);
      
      if (result.success && result.data) {
        setCertificate(result.data);
      } else {
        setError(result.message || 'Certificate not found');
      }
    } catch (err) {
      console.error('Error fetching certificate:', err);
      setError('Failed to fetch certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (!certificate?.certificate_code) return;
    
    const shareUrl = `${window.location.origin}/certificates/${certificate.certificate_code}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Certificate of Completion',
        text: `View certificate for ${certificate?.course_title || 'course'}`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

   const handleDownload = async () => {
    if (!certificate?.course_id) {
      alert('Course ID not found. Cannot download certificate.');
      return;
    }
    
    if (!session?.accessToken) {
      alert('Please login to download your certificate.');
      router.push('/login');
      return;
    }
    
    setDownloading(true);
    try {
      // Use the course_id to download
      const result = await certificateApi.downloadCertificate(
        certificate.course_id,
        session
      );
      
      if (result.success && result.blob) {
        // Create a download link
        const url = window.URL.createObjectURL(result.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename || `certificate-${certificate.certificate_code}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        if (result.needsAssessment) {
          alert('You have not passed the assessment for this course. Please complete the assessment first.');
        } else {
          alert(result.message || 'Failed to download certificate');
        }
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('An error occurred while downloading the certificate');
    } finally {
      setDownloading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#CC0000] mx-auto" />
          <p className="mt-4 text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The certificate you are looking for does not exist.'}</p>
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-[#B30000] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Home
            </Link>
            <Link
              href="/programs"
              className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Award className="w-4 h-4" />
              Browse Programs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0] py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Verification Badge */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800">Certificate Verified</p>
              <p className="text-sm text-green-700">
                This certificate is valid and issued by the institute
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
             <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#CC0000] text-white text-sm rounded-lg hover:bg-[#B30000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Certificate Display */}
        <CertificateTemplate 
          certificateData={certificate}
          program={{ title: certificate.course_title }}
        />

        {/* Back Button */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-[#B30000] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}