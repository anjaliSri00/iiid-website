'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, 
  ArrowLeft, Key, Shield 
} from 'lucide-react';
import { toast } from 'react-toastify';
import fetchApiResponse from '@/helper/api_data_store';
import sha256 from 'crypto-js/sha256';

function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id') || '';
  
  const [step, setStep] = useState('otp'); // 'otp' or 'password'
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: ''
  });
  const [resendTimer, setResendTimer] = useState(0);

  // Redirect if no session_id
  useEffect(() => {
    if (!sessionId) {
      toast.error('Invalid reset link. Please try again.');
      router.push('/forgot-password');
    }
  }, [sessionId, router]);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Check password strength
  const checkPasswordStrength = (password) => {
    let score = 0;
    let feedback = [];

    if (password.length === 0) {
      return { score: 0, feedback: '' };
    }

    if (password.length < 8) {
      feedback.push('Minimum 8 characters');
    } else {
      score += 1;
    }

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include uppercase and lowercase letters');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include numbers');
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include special characters');
    }

    let strengthText = '';
    if (score <= 1) strengthText = 'Weak';
    else if (score === 2) strengthText = 'Fair';
    else if (score === 3) strengthText = 'Good';
    else if (score >= 4) strengthText = 'Strong';

    return { 
      score, 
      feedback: feedback.length > 0 ? feedback.join(', ') : 'Strong password!',
      strengthText 
    };
  };

  const handlePasswordChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, new_password: value }));
    const strength = checkPasswordStrength(value);
    setPasswordStrength(strength);
    if (errors.new_password) {
      setErrors(prev => ({ ...prev, new_password: '' }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length < 4) {
      setOtpError('Please enter the 4-digit OTP');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/forgot-password?session_id=${sessionId}&otp=${otp}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}), // Empty body as we're using query params
        }
      );

      if (response.meta?.status === 200) {
        setOtpVerified(true);
        setStep('password');
        toast.success('OTP verified successfully! Please set your new password.');
      } else {
        setOtpError(response.meta?.message || 'Invalid OTP. Please try again.');
        // toast.error(response.meta?.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setOtpError('Something went wrong. Please try again.');
      toast.error('Something went wrong. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend OTP
  // const handleResendOtp = async () => {
  //   if (resendTimer > 0) return;
    
  //   setOtpLoading(true);
  //   setOtpError('');
    
  //   try {
  //     // Get email from session or use a separate API call
  //     // For now, we'll just use the session_id
  //     const response = await fetchApiResponse(
  //       `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/forgot-password`,
  //       {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({ session_id: sessionId }),
  //       }
  //     );

  //     if (response.meta?.status === 200) {
  //       toast.success('OTP resent successfully!');
  //       setResendTimer(60);
  //       setOtp('');
  //     } else {
  //       setOtpError(response.meta?.message || 'Failed to resend OTP');
  //       toast.error(response.meta?.message || 'Failed to resend OTP');
  //     }
  //   } catch (error) {
  //     console.error('Resend OTP error:', error);
  //     setOtpError('Something went wrong. Please try again.');
  //     toast.error('Something went wrong. Please try again.');
  //   } finally {
  //     setOtpLoading(false);
  //   }
  // };

  // Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters';
    } else if (passwordStrength.score < 2) {
      newErrors.new_password = 'Password is too weak. ' + passwordStrength.feedback;
    }
    
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix all errors before submitting');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Hash password before sending
      const hashedPassword = sha256(formData.new_password).toString();
      
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/reset-password?session_id=${sessionId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            new_password: hashedPassword,
            confirm_password: hashedPassword,
            email: '', // Email is not needed as session_id identifies the user
          }),
        }
      );

      if (response.meta?.status === 200) {
        setSuccess(true);
        toast.success('Password reset successfully! Please login with your new password.');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        // toast.error(response.meta?.message || 'Failed to reset password');
        setErrors({ general: response.meta?.message || 'Failed to reset password' });
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Something went wrong. Please try again.');
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Get password strength color
  const getStrengthColor = (score) => {
    if (score <= 1) return 'bg-red-500';
    if (score === 2) return 'bg-yellow-500';
    if (score === 3) return 'bg-blue-500';
    if (score >= 4) return 'bg-green-500';
    return 'bg-gray-200';
  };

  if (!sessionId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-start py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-100">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-700 font-medium">Secure Reset</span>
            </div>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            {step === 'otp' ? 'Verify OTP' : 'Reset Password'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 'otp' 
              ? 'Enter the 4-digit OTP sent to your email' 
              : 'Create a new password for your account'}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:px-10">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {success ? (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Password Reset Successful!</h3>
              <p className="mt-2 text-sm text-gray-500">
                Your password has been reset successfully. You can now login with your new password.
              </p>
              <div className="mt-6 space-y-3">
                <Link
                  href="/login"
                  className="inline-flex w-full justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              {step === 'otp' ? (
                // OTP Verification Form
                <form className="space-y-6" onSubmit={handleVerifyOtp}>
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                      Enter OTP
                    </label>
                    <div className="mt-1">
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        maxLength="4"
                        value={otp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setOtp(value);
                          setOtpError('');
                        }}
                        className={`appearance-none block w-full px-3 py-2 border ${
                          otpError ? 'border-red-300' : 'border-gray-300'
                        } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm text-center text-2xl tracking-widest`}
                        placeholder="• • • •"
                        autoFocus
                      />
                    </div>
                    {otpError && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {otpError}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      {/* <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={otpLoading || resendTimer > 0}
                        className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {otpLoading ? (
                          <span className="flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Sending...
                          </span>
                        ) : resendTimer > 0 ? (
                          `Resend in ${resendTimer}s`
                        ) : (
                          'Resend OTP'
                        )}
                      </button> */}
                      <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">
                        Back to Login
                      </Link>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={otpLoading}
                      className="w-full flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {otpLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Key className="w-4 h-4 mr-2 mt-0.5" />
                          Verify OTP
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                // Reset Password Form
                <form className="space-y-6" onSubmit={handleResetPassword}>
                  <div>
                    <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="new_password"
                        name="new_password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.new_password}
                        onChange={handlePasswordChange}
                        className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                          errors.new_password ? 'border-red-300' : 'border-gray-300'
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
                    {formData.new_password && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-200 overflow-hidden">
                            <div 
                              className={`h-1.5 transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                              style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">
                            {passwordStrength.strengthText}
                          </span>
                        </div>
                        {passwordStrength.feedback && (
                          <p className="mt-1 text-xs text-gray-500">
                            {passwordStrength.feedback}
                          </p>
                        )}
                      </div>
                    )}
                    {errors.new_password && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.new_password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirm_password"
                        name="confirm_password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirm_password}
                        onChange={handleChange}
                        className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                          errors.confirm_password ? 'border-red-300' : 'border-gray-300'
                        }  shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.confirm_password && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.confirm_password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2 mt-0.5" />
                          Reset Password
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setStep('otp');
                        setOtp('');
                        setOtpError('');
                      }}
                      className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
                    >
                      ← Back to OTP Verification
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


export default function ResetPasswordWrapper (){
  return(
    <>
    <Suspense>
      <ResetPasswordPage/>
    </Suspense>
    </>
  )
}