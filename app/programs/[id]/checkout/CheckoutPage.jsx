"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  BookOpen,
  CreditCard,
  Shield,
  Lock,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Loader2,
  TrendingDown,
  Award,
  Users,
  FileText
} from 'lucide-react';
import { toast } from 'react-toastify';
import fetchApiResponse from '@/helper/api_data_store';

const CheckoutPage = () => {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const programId = params.id;
  
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    paymentMethod: 'razorpay',
    agreeTerms: false
  });

  // Check if user is logged in
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push(`/login?redirect=${encodeURIComponent(`/programs/${programId}/checkout`)}`);
      return;
    }

    // User is logged in, fetch user details and program details
    if (session?.user) {
      fetchUserDetails();
      fetchProgramDetails();
    }
  }, [session, status, router, programId]);

  const fetchUserDetails = async () => {
    try {
      const userId = session?.user?.id;
      if (!userId) return;

      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/details/${userId}`,
        {
          method: "GET",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
        }
      );

      if (response.meta?.status === 200 && response.data) {
        const user = response.data;
        setUserDetails({
          name: user.full_name || user.name || 'User',
          email: user.email,
          phone: user.mobile || user.phone || '',
          address: user.address || '',
          city: user.city || '',
          state: user.state || '',
          pincode: user.pincode || '',
        });
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProgramDetails = async () => {
    setLoading(true);
    setError(null);
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
        const course = response.data;
        const formattedProgram = {
          id: course.id,
          title: course.title,
          description: course.description,
          category: course.category,
          duration: course.duration,
          mode: course.mode || 'Online',
          level: course.level,
          original_price: parseFloat(course.original_price),
          discount: parseFloat(course.discount) || 0,
          final_price: parseFloat(course.final_price || course.original_price),
          fee: `₹${parseFloat(course.final_price || course.original_price).toFixed(2)}`,
          thumbnail_url: course.thumbnail_url,
          status: course.status,
          course_code: course.course_code,
          lessons: course.lessons || [],
          created_at: course.created_at,
          updated_at: course.updated_at,
          assessment: getAssessmentForCategory(course.category),
        };
        setProgram(formattedProgram);
      } else {
        setError(response.meta?.message || "Failed to fetch program details");
      }
    } catch (error) {
      console.error("Error fetching program details:", error);
      setError("Failed to load program details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getAssessmentForCategory = (category) => {
    const assessments = {
      'Web Development': ['Project-Based Assessment', 'Technical Interview', 'Code Review'],
      'Data Science': ['Case Study', 'Technical Assessment', 'Data Analysis Project'],
      'Interior Design': ['Portfolio Review', 'Design Challenge', 'Presentation'],
      'UI/UX Design': ['Design Project', 'Portfolio Review', 'User Testing'],
      'Digital Marketing': ['Campaign Analysis', 'Strategy Presentation', 'SEO Project'],
      'Graphic Design': ['Portfolio Review', 'Design Challenge', 'Creative Project'],
      'Business Management': ['Case Study', 'Business Plan', 'Strategic Analysis'],
    };
    return assessments[category] || ['Project Work', 'Final Assessment', 'Practical Exam'];
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agreeTerms) {
      toast.error("Please agree to the Terms & Conditions");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Prepare enrollment data
      const enrollmentData = {
        course_id: program.id,
        user_id: session?.user?.id,
        payment_method: formData.paymentMethod,
        amount: program.final_price || program.original_price,
        status: 'pending',
        user_details: {
          name: userDetails?.name,
          email: userDetails?.email,
          phone: userDetails?.phone,
        }
      };

      // In a real implementation, you would call your payment API here
      // For now, we'll simulate the payment process
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Payment successful! You are now enrolled.');
      router.push(`/payment-success?program=${program.id}`);
      
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  // Show loading state
  if (status === 'loading' || isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-red-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-red-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading checkout...</p>
      </div>
    );
  }

  // If not authenticated and not loading, redirect (handled in useEffect)
  if (!session) {
    return null;
  }

  if (error || !program) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Program not found</h2>
          <p className="text-gray-600 mb-6">{error || "The program you're looking for doesn't exist."}</p>
          <Link href="/#programs" className="text-red-600 hover:text-red-700 inline-flex items-center">
            <ArrowLeft className="inline mr-2" size={20} />
            Back to Programs
          </Link>
        </div>
      </div>
    );
  }

  const hasDiscount = program.discount > 0;
  const gstAmount = (program.final_price || program.original_price) * 0.18;
  const totalAmount = (program.final_price || program.original_price) + gstAmount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href={`/programs/${program.id}`}
            className="inline-flex items-center text-gray-600 hover:text-red-600 transition-colors mb-4 text-sm group"
          >
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Program Details
          </Link>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Checkout
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Complete your enrollment in <span className="font-semibold">{program.title}</span>
              </p>
            </div>
            <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-200">
              <p className="text-xs text-gray-600">Total Amount</p>
              <p className="text-xl font-bold text-red-600">₹{totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* User Info Banner */}
        {userDetails && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {userDetails?.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">
                  {userDetails?.email}
                </span>
              </div>
              {userDetails?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">
                    {userDetails.phone}
                  </span>
                </div>
              )}
              <span className="text-xs text-green-600 ml-auto flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Verified Account
              </span>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 gap-2 md:gap-4">
          {[1, 2].map((num) => (
            <React.Fragment key={num}>
              <div className={`flex items-center gap-2`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  step >= num ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {num}
                </div>
                <span className={`text-xs hidden sm:inline ${
                  step >= num ? 'text-gray-900 font-medium' : 'text-gray-400'
                }`}>
                  {num === 1 ? 'Review' : 'Payment'}
                </span>
              </div>
              {num < 2 && (
                <div className={`w-8 md:w-12 h-0.5 ${
                  step > num ? 'bg-red-600' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                {/* Step 1: Review Order */}
                {step === 1 && (
                  <div className="space-y-5">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle size={20} className="text-red-600" />
                      Review Your Order
                    </h2>

                    {/* Program Details */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Program</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {program.title}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Category</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {program.category}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Duration</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {program.duration}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Mode</span>
                        <span className="text-sm font-semibold text-gray-900 capitalize">
                          {program.mode}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Level</span>
                        <span className="text-sm font-semibold text-gray-900 capitalize">
                          {program.level || 'Beginner'}
                        </span>
                      </div>
                      {program.assessment && (
                        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">Assessment</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {program.assessment.slice(0, 2).join(', ')}
                            {program.assessment.length > 2 && ' + more'}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Amount</span>
                        <span className="text-lg font-bold text-red-600">
                          ₹{totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* User Info Summary */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2">Enrolled As</h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-blue-700">
                          <span className="font-medium">Name:</span> {userDetails?.name}
                        </p>
                        <p className="text-blue-700">
                          <span className="font-medium">Email:</span> {userDetails?.email}
                        </p>
                        {userDetails?.phone && (
                          <p className="text-blue-700">
                            <span className="font-medium">Phone:</span> {userDetails.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-800">Secure Enrollment</p>
                          <p className="text-xs text-green-600 mt-0.5">
                            Your information is safe and secure. We never share your data with third parties.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Payment */}
                {step === 2 && (
                  <div className="space-y-5">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CreditCard size={20} className="text-red-600" />
                      Payment Method
                    </h2>

                    <div className="space-y-3">
                      <div className={`border-2 rounded-lg p-4 transition cursor-pointer ${
                        formData.paymentMethod === 'razorpay' ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-300'
                      }`}>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="razorpay"
                            checked={formData.paymentMethod === 'razorpay'}
                            onChange={handleChange}
                            className="mt-1 accent-red-600"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">Razorpay</span>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Secure</span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Recommended</span>
                            </div>
                            <p className="text-xs text-gray-500">Pay with credit/debit card, UPI, or Net Banking</p>
                          </div>
                        </label>
                      </div>

                      <div className={`border-2 rounded-lg p-4 transition cursor-pointer ${
                        formData.paymentMethod === 'paypal' ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-300'
                      }`}>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="paypal"
                            checked={formData.paymentMethod === 'paypal'}
                            onChange={handleChange}
                            className="mt-1 accent-red-600"
                          />
                          <div>
                            <span className="font-medium text-gray-900">PayPal</span>
                            <p className="text-xs text-gray-500">Pay with your PayPal account</p>
                          </div>
                        </label>
                      </div>

                      <div className={`border-2 rounded-lg p-4 transition cursor-pointer ${
                        formData.paymentMethod === 'bank_transfer' ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-300'
                      }`}>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="bank_transfer"
                            checked={formData.paymentMethod === 'bank_transfer'}
                            onChange={handleChange}
                            className="mt-1 accent-red-600"
                          />
                          <div>
                            <span className="font-medium text-gray-900">Bank Transfer</span>
                            <p className="text-xs text-gray-500">Direct bank transfer (NEFT/RTGS)</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">Payment Confirmation</p>
                          <p className="text-xs text-amber-700 mt-0.5">
                            You will receive a confirmation email after successful payment.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrevious}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
                    >
                      Previous
                    </button>
                  ) : (
                    <div />
                  )}
                  
                  {step < 2 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                      Continue
                      <ChevronRight size={18} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isProcessing || !formData.agreeTerms}
                      className={`px-8 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm flex items-center gap-2 shadow-md hover:shadow-lg ${
                        (isProcessing || !formData.agreeTerms) && 'opacity-70 cursor-not-allowed'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock size={16} />
                          Pay ₹{totalAmount.toFixed(2)}
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Terms Checkbox */}
                {step === 2 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        className="mt-0.5 accent-red-600"
                        required
                      />
                      <span className="text-xs text-gray-600">
                        I agree to the <a href="#" className="text-red-600 hover:underline">Terms & Conditions</a> and 
                        <a href="#" className="text-red-600 hover:underline ml-1">Privacy Policy</a>. 
                        I understand that this is a binding agreement.
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
                  {program.thumbnail_url ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={program.thumbnail_url} 
                        alt={program.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-8 h-8 text-red-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {program.title}
                    </p>
                    <p className="text-xs text-gray-500">{program.category}</p>
                    {program.course_code && (
                      <p className="text-xs text-gray-400">#{program.course_code}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium text-gray-900">{program.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mode</span>
                    <span className="font-medium text-gray-900 capitalize">{program.mode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Level</span>
                    <span className="font-medium text-gray-900 capitalize">{program.level || 'Beginner'}</span>
                  </div>
                  {program.lessons && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lessons</span>
                      <span className="font-medium text-gray-900">{program.lessons.length}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Course Fee</span>
                    <span className="font-medium text-gray-900">
                      ₹{(program.final_price || program.original_price).toFixed(2)}
                    </span>
                  </div>
                  {hasDiscount && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({program.discount}%)</span>
                      <span>- ₹{((program.original_price * program.discount) / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST (18%)</span>
                    <span className="font-medium text-gray-900">
                      ₹{gstAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-gray-200">
                    <span className="text-gray-900">Total</span>
                    <span className="text-red-600">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-xs text-green-700">
                      <Shield size={14} className="text-green-600" />
                      <span>100% Secure Payment</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-xs text-blue-700">
                      <CheckCircle size={14} className="text-blue-600" />
                      <span>Instant enrollment confirmation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;