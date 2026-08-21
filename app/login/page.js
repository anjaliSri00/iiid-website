'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { 
  Mail, Lock, Eye, EyeOff, LogIn, X, Send, CheckCircle, Phone, 
  AlertCircle, Loader2, Shield, Key, Copy, Check 
} from 'lucide-react';
import { toast } from 'react-toastify';
import fetchApiResponse from '@/helper/api_data_store';
import sha256 from 'crypto-js/sha256';

function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const redirect = searchParams?.get('redirect') || '/';
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [otpDisplay, setOtpDisplay] = useState('');
  const [otpCopied, setOtpCopied] = useState(false);
  
  // Mobile OTP States
  const [mobileOtpData, setMobileOtpData] = useState({
    mobile: '',
    session_id: '',
    otp: '',
    step: 'mobile' // 'mobile' or 'otp'
  });
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpError, setOtpError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showSecurityTip, setShowSecurityTip] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      router.push(redirect);
    }
  }, [status, router, redirect]);

  // OTP Timer
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  useEffect(() => {
    if (showForgotPassword) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showForgotPassword]);

  const validateForm = () => {
    const newErrors = {};
    if (loginMethod === 'email') {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Generate Mobile OTP for Login
  const handleGenerateMobileOtp = async () => {
    if (!mobileOtpData.mobile) {
      setOtpError('Please enter your mobile number');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobileOtpData.mobile)) {
      setOtpError('Enter a valid 10-digit mobile number');
      return;
    }

    setIsOtpSending(true);
    setOtpError('');

    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/common/mobile`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mobile: parseInt(mobileOtpData.mobile, 10),
            action: 'generate',
            purpose: 'login'
          })
        }
      );

      if (response.meta?.status === 200) {
        setMobileOtpData(prev => ({
          ...prev,
          session_id: response.data.session_id,
          step: 'otp'
        }));
        setOtpTimer(120);
        toast.success('OTP sent to your mobile number');
        setOtpError('');
      } else {
        setOtpError(response.meta?.message || 'Failed to send OTP');
        toast.error(response.meta?.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending mobile OTP:', error);
      setOtpError('Something went wrong. Please try again.');
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsOtpSending(false);
    }
  };

  // Verify Mobile OTP and Login
  const handleVerifyMobileOtp = async () => {
    if (!mobileOtpData.otp || mobileOtpData.otp.length < 4) {
      setOtpError('Please enter the OTP');
      return;
    }

    setIsOtpVerifying(true);
    setOtpError('');
// console.log(mobileOtpData,"")
    try {
      // Hash OTP with SHA-256 for security
      // const hashedOtp = sha256(mobileOtpData.otp).toString();
      
      const result = await signIn('credentials', {
        mobile: mobileOtpData.mobile,
        otp: mobileOtpData.otp,
        action: 'verify',
        session_id: mobileOtpData.session_id,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error || 'Invalid OTP. Please try again.');
        setOtpError(result.error || 'Invalid OTP');
      } else if (result?.ok) {
        // toast.success('Login successful! Welcome back.');
        router.push(redirect);
      }
    } catch (error) {
      console.error('Mobile login error:', error);
      toast.error('Something went wrong. Please try again.');
      setOtpError('Something went wrong. Please try again.');
    } finally {
      setIsOtpVerifying(false);
    }
  };

  // Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loginMethod === 'mobile') {
      // Handle mobile login
      if (mobileOtpData.step === 'mobile') {
        await handleGenerateMobileOtp();
        return;
      }
      if (!mobileOtpData.otp) {
        setOtpError('Please enter the OTP');
        return;
      }
      await handleVerifyMobileOtp();
      return;
    }

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix all errors before submitting');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Hash password with SHA-256 before sending
      const passwordHash = sha256(formData.password).toString();
      
      const result = await signIn('credentials', {
        email: formData.email,
        password: passwordHash,
        redirect: false,
      });

      if (result?.error) {
        let errorMessage = result.error;
        // Customize error messages for better UX
        if (errorMessage.includes('Invalid credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (errorMessage.includes('User not found')) {
          errorMessage = 'No account found with this email. Please sign up.';
        } else if (errorMessage.includes('Email not verified')) {
          errorMessage = 'Please verify your email before logging in.';
        }
        toast.error(errorMessage);
        setErrors({ general: errorMessage });
      } else if (result?.ok) {
        toast.success('Login successful! Welcome back.');
        router.push(redirect);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Something went wrong. Please try again.');
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle mobile number change
  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setMobileOtpData(prev => ({ 
      ...prev, 
      mobile: value,
      step: 'mobile',
      otp: '',
      session_id: ''
    }));
    setOtpError('');
  };

  // Handle OTP change
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setMobileOtpData(prev => ({ ...prev, otp: value }));
    setOtpError('');
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    await handleGenerateMobileOtp();
  };

  // Forgot Password - Show OTP
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
      setForgotError('Please enter a valid email address');
      return;
    }

    setResetLoading(true);
    setForgotError('');
    setOtpCopied(false);
    
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: forgotEmail })
        }
      );

      console.log('Forgot password response:', response); // Debug log

      if (response.meta?.status === 200) {
        // Extract OTP from various possible response structures
        let otp = '';
        let sessionIdFromResponse = '';
        
        // Debug: Log the response data structure
        console.log('Response data structure:', JSON.stringify(response.data, null, 2));
        
        // Try to get session_id
        if (response.data?.session_id) {
          sessionIdFromResponse = response.data.session_id;
        }
        
        // Try to get OTP from different possible locations
        if (response.data?.otp) {
          otp = response.data.otp;
        } else if (response.data?.email_response?.otp) {
          otp = response.data.email_response.otp;
        } else if (response.data?.email_response?.message) {
          // Try to extract OTP from message
          const message = response.data.email_response.message;
          const otpMatch = message.match(/\b\d{4}\b/);
          if (otpMatch) {
            otp = otpMatch[0];
          }
        } else if (response.data?.email_response?.success && response.data?.email_response?.message) {
          // Another possible structure
          const message = response.data.email_response.message;
          const otpMatch = message.match(/\b\d{4}\b/);
          if (otpMatch) {
            otp = otpMatch[0];
          }
        }
        
        // If OTP is 4 digits, it's valid
        if (otp && /^\d{4}$/.test(otp)) {
          setSessionId(sessionIdFromResponse);
          setOtpDisplay(otp);
          setResetSent(true);
          toast.success('Password reset OTP sent to your email');
          // Don't auto-close the modal - let user close it manually
        } else {
          // If we couldn't extract OTP, still show success but without OTP
          setSessionId(sessionIdFromResponse);
          setResetSent(true);
          toast.success('Password reset OTP sent to your email');
          // Show a message that OTP is sent to email
          setOtpDisplay(''); // Clear any invalid OTP
        }
      } else {
        setForgotError(response.meta?.message || 'Failed to send reset link');
        toast.error(response.meta?.message || 'Failed to send reset link');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setForgotError('Something went wrong. Please try again.');
      toast.error('Something went wrong. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  // Copy OTP to clipboard
  const copyOtpToClipboard = () => {
    if (otpDisplay) {
      navigator.clipboard.writeText(otpDisplay);
      setOtpCopied(true);
      toast.success('OTP copied to clipboard!');
      setTimeout(() => setOtpCopied(false), 3000);
    }
  };

  const closeModal = () => {
    setShowForgotPassword(false);
    setForgotEmail('');
    setForgotError('');
    setResetSent(false);
    setOtpDisplay('');
    setSessionId('');
    setOtpCopied(false);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen max-lg:min-h-[60vh] bg-gray-50 flex flex-col montserrat-600 justify-start py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Security Badge */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-green-100">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-700 font-medium">Secure Login</span>
            </div>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            or{' '}
            <Link href="/register" className="font-medium text-red-600 hover:text-red-700">
              Create a new account
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:px-10">
          {/* Security Tip */}
          {showSecurityTip && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md relative">
              <button
                onClick={() => setShowSecurityTip(false)}
                className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-xs text-blue-700">
                <Key className="w-3 h-3 inline mr-1" />
                Your password is encrypted with SHA-256 before transmission for enhanced security.
              </p>
            </div>
          )}

          {/* Login Method Toggle */}
          <div className="flex bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('email');
                setErrors({});
                setOtpError('');
                setMobileOtpData({
                  mobile: '',
                  session_id: '',
                  otp: '',
                  step: 'mobile'
                });
              }}
              className={`flex-1 py-2 text-sm font-medium transition ${
                loginMethod === 'email'
                  ? 'bg-white text-red-600 shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Email & Password
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('mobile');
                setErrors({});
                setOtpError('');
              }}
              className={`flex-1 py-2 text-sm font-medium transition ${
                loginMethod === 'mobile'
                  ? 'bg-white text-red-600 shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Mobile & OTP
            </button>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {loginMethod === 'email' ? (
              // Email/Password Login
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-red-600 focus:ring-red-500 accent-red-600 border-gray-300 "
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="font-medium text-red-600 hover:text-red-700"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2 mt-0.5" />
                        Sign in
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              // Mobile OTP Login
              <>
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                    Mobile Number
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      maxLength="10"
                      value={mobileOtpData.mobile}
                      onChange={handleMobileChange}
                      disabled={mobileOtpData.step === 'otp'}
                      className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                        otpError ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                      placeholder="9876543210"
                    />
                  </div>
                  {otpError && mobileOtpData.step === 'mobile' && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {otpError}
                    </p>
                  )}
                </div>

                {mobileOtpData.step === 'otp' && (
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                      Enter OTP
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        maxLength="6"
                        value={mobileOtpData.otp}
                        onChange={handleOtpChange}
                        className={`appearance-none block w-full px-3 py-2 border ${
                          otpError ? 'border-red-300' : 'border-gray-300'
                        } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                        placeholder="Enter 6-digit OTP"
                        autoFocus
                      />
                    </div>
                    {otpError && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {otpError}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileOtpData(prev => ({
                            ...prev,
                            step: 'mobile',
                            otp: '',
                            session_id: ''
                          }));
                          setOtpError('');
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Change mobile number
                      </button>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isOtpSending || otpTimer > 0}
                        className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isOtpSending ? (
                          <span className="flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Sending...
                          </span>
                        ) : otpTimer > 0 ? (
                          `Resend in ${otpTimer}s`
                        ) : (
                          'Resend OTP'
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {mobileOtpData.step === 'mobile' ? (
                  <div>
                    <button
                      type="submit"
                      disabled={isOtpSending || !mobileOtpData.mobile}
                      className="w-full flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isOtpSending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2 mt-0.5" />
                          Send OTP
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div>
                    <button
                      type="submit"
                      disabled={isOtpVerifying || !mobileOtpData.otp}
                      className="w-full flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isOtpVerifying ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <LogIn className="w-4 h-4 mr-2 mt-0.5" />
                          Verify & Sign in
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </form>

          {/* Security Footer */}
          <div className="mt-6">
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setShowSecurityTip(!showSecurityTip)}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
              >
                <Shield className="w-3 h-3" />
                <span>Security Info</span>
              </button>
              <span className="text-xs text-gray-300">|</span>
              <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-600">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal with OTP Display */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
            <div 
              className="fixed inset-0 bg-black/50 bg-opacity-75 transition-opacity"
              // onClick={closeModal}
            ></div>

            <div className="relative transform overflow-hidden bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className=" bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div>
                {!resetSent ? (
                  // Step 1: Enter Email
                  <>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                      <Mail className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <h3 className="text-lg font-semibold leading-6 text-gray-900">
                        Reset your password
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Enter your email address and we&apos;ll send you an OTP to reset your password.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleForgotPassword} className="mt-6">
                      <div>
                        <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700">
                          Email address
                        </label>
                        <input
                          id="forgot-email"
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => {
                            setForgotEmail(e.target.value);
                            setForgotError('');
                          }}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                          placeholder="you@example.com"
                          autoFocus
                        />
                        {forgotError && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" /> {forgotError}
                          </p>
                        )}
                      </div>

                      <div className="mt-5 sm:mt-6">
                        <button
                          type="submit"
                          disabled={resetLoading}
                          className="inline-flex w-full justify-center bg-red-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {resetLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Send OTP
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  // Step 2: Show OTP
                  <>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center bg-green-100">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <h3 className="text-lg font-semibold leading-6 text-gray-900">
                        OTP Sent Successfully!
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          We&apos;ve sent a password reset OTP to <strong>{forgotEmail}</strong>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Please check your email inbox (and spam folder)
                        </p>
                      </div>
                      
                      {/* OTP Display Box - Only show if we have OTP */}
                      {otpDisplay && /^\d{4}$/.test(otpDisplay) ? (
                        <div className="mt-4 p-4 bg-gray-50 border-2 border-dashed border-red-200">
                          <p className="text-xs text-gray-500 mb-2">Your OTP Code:</p>
                          <div className="flex items-center justify-center gap-4">
                            <div className="flex gap-2">
                              {otpDisplay.split('').map((digit, index) => (
                                <div
                                  key={index}
                                  className="w-12 h-14 bg-white border-2 border-red-300  flex items-center justify-center text-2xl font-bold text-red-600 shadow-sm"
                                >
                                  {digit}
                                </div>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={copyOtpToClipboard}
                              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Copy OTP"
                            >
                              {otpCopied ? (
                                <Check className="w-5 h-5 text-green-500" />
                              ) : (
                                <Copy className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                          <p className="mt-2 text-xs text-gray-400">
                            This OTP will expire in 15 minutes
                          </p>
                        </div>
                      ) : (
                        // Show a message if OTP couldn't be extracted
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200">
                          <p className="text-sm text-yellow-700">
                            <AlertCircle className="w-4 h-4 inline mr-1" />
                            Please check your email for the 4-digit OTP.
                          </p>
                        </div>
                      )}
                      
                      <div className="mt-4 space-y-3">
                        {sessionId && (
                          <Link
                            href={`/reset-password?session_id=${sessionId}`}
                            className="inline-flex w-full justify-center bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
                          >
                            Reset Password Now
                          </Link>
                        )}
                        
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setResetSent(false);
                              setOtpDisplay('');
                              setForgotEmail('');
                              setSessionId('');
                              setOtpCopied(false);
                            }}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            ← Back to forgot password
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              // Resend OTP
                              handleForgotPassword(new Event('submit'));
                            }}
                            disabled={resetLoading}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Resend OTP
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default function Login(){
return (
  <>
  <Suspense>
    <LoginPage/>
  </Suspense>
  </>
);
}