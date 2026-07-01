// app/payment-success/page.js
"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Download,
  Share2,
  Home,
  FileText,
  Award,
  GraduationCap,
  AlertCircle,
  CreditCard,
  Shield,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'react-toastify';
import fetchApiResponse from '@/helper/api_data_store';

const PaymentSuccessPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const programId = searchParams.get('id');
  const paymentId = searchParams.get('payment_id');
  const orderId = searchParams.get('order_id');
  const statusParam = searchParams.get('status');
  
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const isPartial = statusParam === 'partial';
  const isSuccess = !isPartial && paymentId;

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push(`/login?redirect=${encodeURIComponent(`/payment-success?type=course_enrollment&id=${programId}&payment_id=${paymentId}`)}`);
      return;
    }

    if (programId) {
      fetchPaymentDetails();
      fetchCourseDetails();
    } else {
      setError("No program information found");
      setLoading(false);
    }
  }, [session, status, programId, paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      // Fetch payment details from success endpoint with type and id
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/payments/success?type=course_enrollment&id=${programId}`,
        {
          method: "GET",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
        }
      );

      if (response.meta?.status === 200 && response.data) {
        setPaymentDetails(response.data);
      } else {
        // console.error("Failed to fetch payment details:", response.meta?.message);
        // Use fallback data
        setPaymentDetails({
          payment_id: paymentId,
          order_id: orderId,
          amount: "₹990.00",
          status: isSuccess ? "success" : "partial",
          payment_method: "Razorpay",
          payment_date: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error fetching payment details:", error);
      // Use fallback data
      setPaymentDetails({
        payment_id: paymentId,
        order_id: orderId,
        amount: "₹990.00",
        status: isSuccess ? "success" : "partial",
        payment_method: "Razorpay",
        payment_date: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetails = async () => {
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/details/${programId}`,
        {
          method: "GET",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
        }
      );

      if (response.meta?.status === 200 && response.data) {
        setCourseDetails(response.data);
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
    }
  };

  const handleCopyPaymentId = () => {
    if (paymentId) {
      navigator.clipboard.writeText(paymentId);
      setCopied(true);
      toast.success("Payment ID copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    }
  };

 

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Payment Successful - IIID Courses',
        text: `I have successfully enrolled in ${courseDetails?.title || 'a course'} on IIID Courses!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Show loading state
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-green-50 to-white flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-green-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-green-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading payment details...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/#programs" className="text-red-600 hover:text-red-700 inline-flex items-center">
            <Home className="inline mr-2" size={20} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isPaymentSuccess = isSuccess && paymentDetails?.status !== 'failed';

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success/Partial Status Card */}
        <div className={`bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 ${
          isPaymentSuccess ? 'border-green-500' : 'border-yellow-500'
        }`}>
          {/* Header */}
          <div className="p-6 md:p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4">
              {isPaymentSuccess ? (
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-12 h-12 text-yellow-600" />
                </div>
              )}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {isPaymentSuccess ? 'Payment Successful! 🎉' : 'Payment Processing ⏳'}
            </h1>
            
            <p className="text-gray-600">
              {isPaymentSuccess 
                ? 'Your payment has been confirmed and you are now enrolled in the course.'
                : 'Your payment is being processed. You will receive a confirmation email shortly.'}
            </p>
          </div>

          {/* Payment Details */}
          <div className="border-t border-gray-200 px-6 md:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Payment Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Payment ID</span>
                    <span className="font-mono text-gray-900 flex items-center gap-2">
                      {paymentId || 'N/A'}
                      {paymentId && (
                        <button
                          onClick={handleCopyPaymentId}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy Payment ID"
                        >
                          {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Order ID</span>
                    <span className="font-mono text-gray-900">{orderId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Amount Paid</span>
                    <span className="font-semibold text-gray-900">
                      {paymentDetails?.amount || courseDetails?.final_price ? 
                        `₹${parseFloat(paymentDetails?.amount || courseDetails?.final_price).toFixed(2)}` : 
                        'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Payment Method</span>
                    <span className="text-gray-900">{paymentDetails?.payment_method || 'Razorpay'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Payment Date</span>
                    <span className="text-gray-900">{formatDate(paymentDetails?.payment_date)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-medium ${
                      isPaymentSuccess ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {isPaymentSuccess ? 'Completed' : 'Processing'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Course Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Course</span>
                    <span className="font-medium text-gray-900 text-right max-w-[200px]">
                      {courseDetails?.title || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Category</span>
                    <span className="text-gray-900">{courseDetails?.category || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duration</span>
                    <span className="text-gray-900">{courseDetails?.duration || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Level</span>
                    <span className="text-gray-900 capitalize">{courseDetails?.level || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Mode</span>
                    <span className="text-gray-900 capitalize">{courseDetails?.mode || 'Online'}</span>
                  </div>
                  {courseDetails?.course_code && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Course Code</span>
                      <span className="font-mono text-gray-900">{courseDetails.course_code}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="border-t border-gray-200 px-6 md:px-8 py-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Next Steps</h3>
            <div className="space-y-3">
              {isPaymentSuccess ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Access Your Course</p>
                      <p className="text-xs text-gray-500">You can now access the course from your dashboard</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Check Your Email</p>
                      <p className="text-xs text-gray-500">A confirmation email has been sent to your registered email</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Award className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Start Learning</p>
                      <p className="text-xs text-gray-500">Begin your learning journey and track your progress</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Payment Processing</p>
                      <p className="text-xs text-gray-500">Your payment is being confirmed. This may take a few minutes.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Shield className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Don't Worry</p>
                      <p className="text-xs text-gray-500">You will receive a confirmation email once the payment is confirmed</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 px-6 md:px-8 py-6 bg-gray-50 rounded-b-2xl">
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {isPaymentSuccess && (
                <Link
                  href="/dashboard?tab=my-courses"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <BookOpen className="w-4 h-4" />
                  Go to My Courses
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              
              <Link
                href={`/programs/${programId}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                <GraduationCap className="w-4 h-4" />
                View Course Details
              </Link>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>

              

              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@iiid.com" className="text-red-600 hover:underline">
              support@iiid.com
            </a>
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <CreditCard className="w-4 h-4" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Shield className="w-4 h-4" />
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <CheckCircle className="w-4 h-4" />
              <span>Instant Enrollment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;