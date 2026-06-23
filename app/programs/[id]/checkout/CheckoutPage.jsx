"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { programs } from '@/data/programsData';
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
  GraduationCap
} from 'lucide-react';
import { toast } from 'react-toastify';

const CheckoutPage = () => {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const programId = Number(params.id);
  const program = programs.find(p => p.id === programId);
  
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
      // Redirect to login page with return URL
      router.push(`/login?redirect=${encodeURIComponent(`/programs/${programId}/checkout`)}`);
      return;
    }

    // User is logged in, fetch user details
    if (session?.user) {
      setUserDetails({
        name: session.user.name || session.user.first_name || 'User',
        email: session.user.email,
        phone: session.user.mobile || session.user.phone || '',
        // Add any other user details from session
      });
      setIsLoading(false);
    }
  }, [session, status, router, programId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('Payment successful!');
      router.push('/payment-success');
    }, 2000);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  // Show loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not loading, redirect (handled in useEffect)
  if (!session) {
    return null;
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Program not found</h2>
          <Link href="/#programs" className="text-red-600 hover:text-red-700 inline-flex items-center">
            <ArrowLeft className="inline mr-2" size={20} />
            Back to Programs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href={`/programs/${program.id}`}
            className="inline-flex items-center text-gray-600 hover:text-red-600 transition-colors mb-4 text-sm"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Program Details
          </Link>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Checkout
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Complete your enrollment in {program.fullTitle || program.title}
              </p>
            </div>
            <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-200">
              <p className="text-xs text-gray-600">Total Amount</p>
              <p className="text-xl font-bold text-red-600">{program.fee}</p>
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
              <span className="text-xs text-green-600 ml-auto">
                ✓ Verified Account
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
                          {program.fullTitle || program.title}
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
                        <span className="text-sm font-semibold text-gray-900">
                          {program.mode}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Assessment</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {program.assessment.join(', ')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Amount</span>
                        <span className="text-lg font-bold text-red-600">
                          {program.fee}
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
                      <div className="border border-gray-300 rounded-lg p-4 hover:border-red-500 transition cursor-pointer">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="razorpay"
                            checked={formData.paymentMethod === 'razorpay'}
                            onChange={handleChange}
                            className="mt-1"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">Razorpay</span>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Secure</span>
                            </div>
                            <p className="text-xs text-gray-500">Pay with credit/debit card, UPI, or Net Banking</p>
                          </div>
                        </label>
                      </div>

                      <div className="border border-gray-300 rounded-lg p-4 hover:border-red-500 transition cursor-pointer">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="paypal"
                            checked={formData.paymentMethod === 'paypal'}
                            onChange={handleChange}
                            className="mt-1"
                          />
                          <div>
                            <span className="font-medium text-gray-900">PayPal</span>
                            <p className="text-xs text-gray-500">Pay with your PayPal account</p>
                          </div>
                        </label>
                      </div>

                      <div className="border border-gray-300 rounded-lg p-4 hover:border-red-500 transition cursor-pointer">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="bank_transfer"
                            checked={formData.paymentMethod === 'bank_transfer'}
                            onChange={handleChange}
                            className="mt-1"
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
                      className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm flex items-center gap-2"
                    >
                      Continue
                      <ChevronRight size={18} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isProcessing || !formData.agreeTerms}
                      className={`px-8 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm flex items-center gap-2 ${
                        (isProcessing || !formData.agreeTerms) && 'opacity-70 cursor-not-allowed'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock size={16} />
                          Pay {program.fee}
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
                        className="mt-0.5"
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
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {program.fullTitle || program.title}
                    </p>
                    <p className="text-xs text-gray-500">{program.category}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium text-gray-900">{program.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mode</span>
                    <span className="font-medium text-gray-900">{program.mode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assessment</span>
                    <span className="font-medium text-gray-900">
                      {program.assessment.join(', ')}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">{program.fee}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST (18%)</span>
                    <span className="font-medium text-gray-900">
                      ₹{parseInt(program.fee.replace(/[^0-9]/g, '')) * 0.18}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-gray-200">
                    <span className="text-gray-900">Total</span>
                    <span className="text-red-600">{program.fee}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-xs text-green-700">
                    <Shield size={14} className="text-green-600" />
                    <span>100% Secure Payment</span>
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