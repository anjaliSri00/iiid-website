'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Mail, Lock, Eye, EyeOff, LogIn, X, Send, CheckCircle, Phone } from 'lucide-react';
import { toast } from 'react-toastify';
import fetchApiResponse from '@/helper/api_data_store';
import md5 from "blueimp-md5";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const redirect = searchParams?.get('redirect') || '/';
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'mobile'
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  
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
      const response = await fetchApiResponse(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/common/mobile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: parseInt(mobileOtpData.mobile, 10),
          action: 'generate',
          purpose: 'login'
        })
      });

      if (response.meta.status === 200) {
        setMobileOtpData(prev => ({
          ...prev,
          session_id: response.data.session_id,
          step: 'otp'
        }));
        setOtpTimer(120);
        toast.success('OTP sent to your mobile');
        setOtpError('');
      } else {
        setOtpError(response.meta.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending mobile OTP:', error);
      setOtpError('Something went wrong. Please try again.');
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

    try {
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
        toast.success('Login successful!');
        router.push(redirect);
      }
    } catch (error) {
      console.error('Mobile login error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsOtpVerifying(false);
    }
  };

  // Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loginMethod === 'mobile') {
      // Handle mobile login
      if (!mobileOtpData.mobile) {
        setOtpError('Please enter your mobile number');
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
      return;
    }

    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error || 'Login failed. Please check your credentials.');
        setErrors({ general: result.error || 'Invalid email or password' });
      } else if (result?.ok) {
        toast.success('Login successful!');
        router.push(redirect);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Something went wrong. Please try again.');
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
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });

      if (response.ok) {
        setResetSent(true);
        toast.success('Password reset link sent to your email');
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotEmail('');
          setResetSent(false);
        }, 3000);
      } else {
        const data = await response.json();
        setForgotError(data.message || 'Failed to send reset link');
      }
    } catch (error) {
      setForgotError('Something went wrong. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const closeModal = () => {
    setShowForgotPassword(false);
    setForgotEmail('');
    setForgotError('');
    setResetSent(false);
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
    <div className="min-h-screen bg-gray-50 flex flex-col montserrat-600 justify-start py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
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
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Login Method Toggle */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
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
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
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
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                loginMethod === 'mobile'
                  ? 'bg-white text-red-600 shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Mobile & OTP
            </button>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
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
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
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
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
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
                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
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
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                      placeholder="9876543210"
                    />
                  </div>
                  {otpError && mobileOtpData.step === 'mobile' && (
                    <p className="mt-2 text-sm text-red-600">{otpError}</p>
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
                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                        placeholder="Enter 6-digit OTP"
                      />
                    </div>
                    {otpError && (
                      <p className="mt-2 text-sm text-red-600">{otpError}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <button                        type="button"
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
                        onClick={handleGenerateMobileOtp}
                        disabled={isOtpSending || otpTimer > 0}
                        className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        {isOtpSending ? 'Sending...' : otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP'}
                      </button>
                    </div>
                  </div>
                )}

                {mobileOtpData.step === 'mobile' && (
                  <div>
                    <button
                      type="button"
                      onClick={handleGenerateMobileOtp}
                      disabled={isOtpSending || !mobileOtpData.mobile}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isOtpSending ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2 mt-0.5" />
                          Send OTP
                        </>
                      )}
                    </button>
                  </div>
                )}

                {mobileOtpData.step === 'otp' && (
                  <div>
                    <button
                      type="submit"
                      disabled={isOtpVerifying || !mobileOtpData.otp}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isOtpVerifying ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
        </div>
      </div>

      {/* Forgot Password Modal - Same as before */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
            <div 
              className="fixed inset-0 bg-white/90 bg-opacity-75 transition-opacity"
              onClick={closeModal}
            ></div>

            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div>
                {!resetSent ? (
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
                          Enter your email address and we'll send you a link to reset your password.
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
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                          placeholder="you@example.com"
                          autoFocus
                        />
                        {forgotError && (
                          <p className="mt-2 text-sm text-red-600">{forgotError}</p>
                        )}
                      </div>

                      <div className="mt-5 sm:mt-6">
                        <button
                          type="submit"
                          disabled={resetLoading}
                          className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {resetLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Send Reset Link
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <h3 className="text-lg font-semibold leading-6 text-gray-900">
                        Check your email
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          We've sent a password reset link to <strong>{forgotEmail}</strong>
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Didn't receive the email? Check your spam folder or try again.
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-6">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}