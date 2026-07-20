// src/components/certificates/CertificateViewer.jsx
'use client';

import { useRef, useState, useEffect } from 'react';
import {
  Award,
  User,
  Calendar,
  CheckCircle,
  Sparkles,
  Download,
  Share2,
  X,
  ExternalLink,
  Shield,
  Lock,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Star,
  Heart,
} from 'lucide-react';
import Image from 'next/image';

export default function CertificateViewer({ certificate, program, onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const certificateRef = useRef(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      certificateRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-amber-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-[#CC0000] rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading certificate...</p>
          <p className="text-sm text-gray-400 mt-1">Please wait while we prepare your certificate</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={certificateRef}
      className="relative bg-gradient-to-br from-amber-50 via-white to-amber-50 rounded-2xl shadow-2xl border border-amber-200 overflow-hidden"
    >
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors text-gray-600 hover:text-gray-900"
          aria-label="Close certificate"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-1.5">
        <button
          onClick={handleZoomOut}
          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4 text-gray-600" />
        </button>
        <span className="text-xs text-gray-600 min-w-[40px] text-center">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4 text-gray-600" />
        </button>
        <div className="w-px h-6 bg-gray-200"></div>
        <button
          onClick={handleRotate}
          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          aria-label="Rotate"
        >
          <RotateCw className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={handleFullscreen}
          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          aria-label="Fullscreen"
        >
          <div className="w-4 h-4 border border-gray-600 rounded-sm flex items-center justify-center">
            <div className="w-2 h-2 border border-gray-600"></div>
          </div>
        </button>
      </div>

      {/* Certificate Content */}
      <div 
        className="relative p-8 md:p-12 transition-all duration-300"
        style={{
          transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
          transformOrigin: 'center center',
        }}
      >
        {/* Decorative Border */}
        <div className="absolute inset-4 border-4 border-amber-200/50 rounded-xl pointer-events-none"></div>
        <div className="absolute inset-6 border-2 border-amber-200/30 rounded-xl pointer-events-none"></div>
        
        {/* Decorative Corners */}
        <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-amber-300 rounded-tl-lg"></div>
        <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-amber-300 rounded-tr-lg"></div>
        <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-amber-300 rounded-bl-lg"></div>
        <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-amber-300 rounded-br-lg"></div>

        <div className="relative space-y-6">
          {/* Header */}
          <div className="text-center border-b-2 border-amber-200/50 pb-6">
            <div className="flex justify-center mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400/20 blur-2xl"></div>
                <Award className="w-20 h-20 text-amber-600 relative" />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 tracking-wide">
              Certificate of Completion
            </h2>
            <p className="text-sm text-gray-500 mt-2 uppercase tracking-wider">
              This certificate is proudly presented to
            </p>
          </div>

          {/* Recipient Name */}
          <div className="text-center py-6">
            <div className="relative inline-block">
              <div className="text-5xl md:text-6xl font-serif font-bold text-[#CC0000] mb-2">
                {certificate.user_name || 'Student Name'}
              </div>
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#CC0000]/30 to-transparent"></div>
            </div>
            <p className="text-gray-600 text-sm mt-4">for successfully completing</p>
          </div>

          {/* Course Info */}
          <div className="text-center py-4">
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-gray-800">
              {program?.title || certificate.course_title || 'Course Title'}
            </h3>
            <div className="flex flex-wrap justify-center gap-4 mt-3 text-sm text-gray-600">
              <span className="flex items-center gap-1.5 bg-white/60 px-3 py-1 rounded-full border border-amber-200/50">
                <Calendar className="w-4 h-4 text-amber-600" />
                Issued: {new Date(certificate.issued_at || Date.now()).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1.5 bg-white/60 px-3 py-1 rounded-full border border-amber-200/50">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Verified
              </span>
              {certificate.grade && (
                <span className="flex items-center gap-1.5 bg-white/60 px-3 py-1 rounded-full border border-amber-200/50">
                  <Star className="w-4 h-4 text-amber-500" />
                  Grade: {certificate.grade}
                </span>
              )}
            </div>
          </div>

          {/* Achievement Details */}
          {certificate.achievements && (
            <div className="bg-amber-50/50 border border-amber-200/50 rounded-lg p-4 max-w-lg mx-auto">
              <div className="flex items-center gap-2 justify-center text-sm text-gray-700">
                <Heart className="w-4 h-4 text-amber-500" />
                <span>Achievements: {certificate.achievements}</span>
              </div>
            </div>
          )}

          {/* Footer with Signature and QR */}
          <div className="border-t-2 border-amber-200/50 pt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="text-center">
              <div className="h-12 border-b-2 border-gray-300 w-48 mx-auto mb-1"></div>
              <p className="text-xs text-gray-500">Authorized Signature</p>
            </div>

            <div className="text-center">
              <div className="flex items-center gap-2 justify-center mb-1">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-gray-700">
                  Verified Certificate
                </span>
              </div>
              <p className="text-[10px] text-gray-400">
                Certificate ID: {certificate.certificate_id || 'CERT-2024-001'}
              </p>
            </div>

            <div className="flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 bg-white border-2 border-amber-200 rounded-lg flex items-center justify-center shadow-sm">
                  <svg width="50" height="50" viewBox="0 0 100 100" className="text-gray-400">
                    <rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="2" />
                    <rect x="25" y="25" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="50" y1="35" x2="50" y2="65" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="35" y1="50" x2="65" y2="50" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <p className="text-[8px] text-gray-400 text-center mt-1">Scan to Verify</p>
              </div>
            </div>
          </div>

          {/* Watermark */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5">
            <Award className="w-64 h-64 text-amber-900" />
          </div>
        </div>
      </div>

      {/* Action Buttons at Bottom */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2">
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          Print
        </button>
        <button
          onClick={() => {
            // Share functionality
            if (navigator.share) {
              navigator.share({
                title: 'Certificate of Completion',
                text: `I earned a certificate for ${program?.title || 'Course Title'}!`,
                url: window.location.href,
              });
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share
        </button>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#CC0000] text-white text-xs font-medium rounded-lg hover:bg-[#B30000] transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Download PDF
        </button>
      </div>
    </div>
  );
}