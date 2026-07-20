// src/components/certificates/CertificateGenerator.jsx
'use client';

import { useState, useEffect } from 'react';
import {
  Award,
  Sparkles,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  Share2,
  Gift,
  PartyPopper,
  Star,
  Heart,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CertificateGenerator({
  program,
  user,
  onGenerate,
  onDownload,
  onView,
  onShare,
  isEligible,
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [error, setError] = useState(null);
  const [certificateData, setCertificateData] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (isGenerated && certificateData) {
      // Trigger celebration animation
      triggerCelebration();
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isGenerated, certificateData]);

  const triggerCelebration = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const handleGenerate = async () => {
    if (!isEligible) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await onGenerate(program.id);
      if (result.success) {
        setCertificateData(result.data);
        setIsGenerated(true);
      } else {
        setError(result.message || 'Failed to generate certificate');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while generating the certificate');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerated && certificateData) {
    return (
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 rounded-2xl p-6 md:p-8 border-2 border-green-200 shadow-xl relative overflow-hidden">
        {/* Success Banner */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-green-400"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-200/30 rounded-full blur-3xl"></div>

        <div className="relative">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-3">
              <PartyPopper className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              🎉 Certificate Generated Successfully!
            </h3>
            <p className="text-gray-600 mt-1">
              Your certificate for {program?.title} is ready
            </p>
          </div>

          {/* Certificate Preview */}
          <div className="bg-white rounded-xl shadow-lg border border-green-200 p-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900">
                  {certificateData.certificate_id || 'Certificate'}
                </h4>
                <p className="text-sm text-gray-600">
                  Issued to: <span className="font-medium">{certificateData.user_name || user?.name}</span>
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    Verified
                  </span>
                  <span>
                    {new Date(certificateData.issued_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => onView(certificateData.id)}
              className="flex items-center gap-2 px-4 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-[#B30000] transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Certificate
            </button>
            <button
              onClick={() => onDownload(certificateData.id)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={() => onShare(certificateData.id)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>

          {/* Achievement Badges */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
              <Trophy className="w-3 h-3" />
              Achievement Unlocked
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              <Star className="w-3 h-3" />
              Course Completed
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
              <Heart className="w-3 h-3" />
              Certificate Earned
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl p-6 border border-red-200">
        <div className="flex items-start gap-3">
          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-800">Generation Failed</h4>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-3 text-sm text-red-700 hover:text-red-800 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 rounded-2xl p-6 md:p-8 border-2 border-amber-200 shadow-lg">
      <div className="text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center p-4 bg-amber-100 rounded-full mb-4">
          <Gift className="w-8 h-8 text-amber-600" />
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Generate Your Certificate
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          You've completed all requirements! Generate your official certificate of completion.
        </p>

        {/* Eligibility Check */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${isEligible ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {isEligible ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {isEligible ? 'Eligible' : 'Not Eligible'}
          </div>
        </div>

        {/* Requirements Check */}
        <div className="mt-4 bg-white/60 rounded-xl p-4 max-w-md mx-auto">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">✓ All lessons completed</span>
              <CheckCircle className={`w-4 h-4 ${isEligible ? 'text-green-600' : 'text-gray-300'}`} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">✓ All assessments passed</span>
              <CheckCircle className={`w-4 h-4 ${isEligible ? 'text-green-600' : 'text-gray-300'}`} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">✓ Course purchased</span>
              <CheckCircle className={`w-4 h-4 ${isEligible ? 'text-green-600' : 'text-gray-300'}`} />
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!isEligible || isGenerating}
          className={`mt-6 px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto ${
            isEligible
              ? 'bg-gradient-to-r from-[#CC0000] to-[#E60000] text-white hover:shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Certificate
            </>
          )}
        </button>

        {!isEligible && (
          <p className="mt-3 text-xs text-gray-500">
            Complete all requirements to generate your certificate
          </p>
        )}
      </div>
    </div>
  );
}