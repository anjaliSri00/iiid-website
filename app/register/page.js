'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  User, Mail, Lock, Eye, EyeOff, UserPlus, 
  Phone, AlertCircle, MapPin, Briefcase,
  Upload, FileText, Building, GraduationCap,
  Map, Home, Hash, CheckCircle, X, Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import fetchApiResponse from '@/helper/api_data_store';
import md5 from 'blueimp-md5';
import sha256 from 'crypto-js/sha256';

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // OTP States
  const [emailOtpData, setEmailOtpData] = useState({
    email: '',
    session_id: '',
    otp: '',
    isVerified: false,
    verificationToken: '',
    isOtpSent: false,
    isVerifying: false,
    isSending: false
  });
  const [mobileOtpData, setMobileOtpData] = useState({
    mobile: '',
    session_id: '',
    otp: '',
    isVerified: false,
    verificationToken: '',
    isOtpSent: false,
    isVerifying: false,
    isSending: false
  });
  const [otpTimer, setOtpTimer] = useState({ email: 0, mobile: 0 });
  const [otpError, setOtpError] = useState({ email: '', mobile: '' });

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    city: '',
    state: '',
    pincode: '',
    full_address: '',
    highest_qualification: '',
    current_organization: '',
    years_of_experience: '',
  });
  
  // File upload states
  const [files, setFiles] = useState({
    aadhaar: null,
    experience: null,
    avatar: null
  });
  
  const [fileUrls, setFileUrls] = useState({
    aadhaar: '',
    experience: '',
    avatar: ''
  });
  
  const [filePreviews, setFilePreviews] = useState({
    aadhaar: null,
    experience: null,
    avatar: null
  });
  
  const [uploadProgress, setUploadProgress] = useState({
    aadhaar: 0,
    experience: 0,
    avatar: 0
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  // OTP Timer
  useEffect(() => {
    if (otpTimer.email > 0) {
      const timer = setTimeout(() => setOtpTimer(prev => ({ ...prev, email: prev.email - 1 })), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer.email]);

  useEffect(() => {
    if (otpTimer.mobile > 0) {
      const timer = setTimeout(() => setOtpTimer(prev => ({ ...prev, mobile: prev.mobile - 1 })), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer.mobile]);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (filePreviews.aadhaar) URL.revokeObjectURL(filePreviews.aadhaar);
      if (filePreviews.experience) URL.revokeObjectURL(filePreviews.experience);
      if (filePreviews.avatar) URL.revokeObjectURL(filePreviews.avatar);
    };
  }, []);

  // Generate Email OTP
  const handleGenerateEmailOtp = async () => {
    if (!emailOtpData.email) {
      setOtpError(prev => ({ ...prev, email: 'Please enter your email address' }));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(emailOtpData.email)) {
      setOtpError(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }

    setEmailOtpData(prev => ({ ...prev, isSending: true }));
    setOtpError(prev => ({ ...prev, email: '' }));
    
    try {
      const response = await fetchApiResponse(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/common/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailOtpData.email,
          action: 'generate',
          purpose: 'signup'
        })
      });

      if (response.meta.status === 200) {
        setEmailOtpData(prev => ({
          ...prev,
          session_id: response.data.session_id,
          isOtpSent: true,
          otp: ''
        }));
        setOtpTimer(prev => ({ ...prev, email: 120 }));
        toast.success('OTP sent to your email');
        setOtpError(prev => ({ ...prev, email: '' }));
      } else {
        setOtpError(prev => ({ ...prev, email: response.meta.message || 'Failed to send OTP' }));
      }
    } catch (error) {
      console.error('Error sending email OTP:', error);
      setOtpError(prev => ({ ...prev, email: 'Something went wrong. Please try again.' }));
    } finally {
      setEmailOtpData(prev => ({ ...prev, isSending: false }));
    }
  };

  // Verify Email OTP
  const handleVerifyEmailOtp = async () => {
    if (!emailOtpData.otp || emailOtpData.otp.length < 4) {
      setOtpError(prev => ({ ...prev, email: 'Please enter the OTP' }));
      return;
    }

    setEmailOtpData(prev => ({ ...prev, isVerifying: true }));
    setOtpError(prev => ({ ...prev, email: '' }));

    try {
      const response = await fetchApiResponse(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/common/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailOtpData.email,
          action: 'verify',
          session_id: emailOtpData.session_id,
          otp: emailOtpData.otp
        })
      });

      if (response.meta.status === 200) {
        setEmailOtpData(prev => ({
          ...prev,
          isVerified: true,
          verificationToken: response.data.email_verification_token
        }));
        setFormData(prev => ({ ...prev, email: emailOtpData.email }));
        toast.success('Email verified successfully!');
        setOtpError(prev => ({ ...prev, email: '' }));
      } else {
        setOtpError(prev => ({ ...prev, email: response.meta.message || 'Invalid OTP. Please try again.' }));
      }
    } catch (error) {
      console.error('Error verifying email OTP:', error);
      setOtpError(prev => ({ ...prev, email: 'Something went wrong. Please try again.' }));
    } finally {
      setEmailOtpData(prev => ({ ...prev, isVerifying: false }));
    }
  };

  // Generate Mobile OTP
  const handleGenerateMobileOtp = async () => {
    if (!mobileOtpData.mobile) {
      setOtpError(prev => ({ ...prev, mobile: 'Please enter your mobile number' }));
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobileOtpData.mobile)) {
      setOtpError(prev => ({ ...prev, mobile: 'Enter a valid 10-digit mobile number' }));
      return;
    }

    setMobileOtpData(prev => ({ ...prev, isSending: true }));
    setOtpError(prev => ({ ...prev, mobile: '' }));

    try {
      const response = await fetchApiResponse(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/common/mobile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: parseInt(mobileOtpData.mobile, 10),
          action: 'generate',
          purpose: 'signup'
        })
      });

      if (response.meta.status === 200) {
        setMobileOtpData(prev => ({
          ...prev,
          session_id: response.data.session_id,
          isOtpSent: true,
          otp: ''
        }));
        setOtpTimer(prev => ({ ...prev, mobile: 120 }));
        toast.success('OTP sent to your mobile');
        setOtpError(prev => ({ ...prev, mobile: '' }));
      } else {
        setOtpError(prev => ({ ...prev, mobile: response.meta.message || 'Failed to send OTP' }));
      }
    } catch (error) {
      console.error('Error sending mobile OTP:', error);
      setOtpError(prev => ({ ...prev, mobile: 'Something went wrong. Please try again.' }));
    } finally {
      setMobileOtpData(prev => ({ ...prev, isSending: false }));
    }
  };

  // Verify Mobile OTP
  const handleVerifyMobileOtp = async () => {
    if (!mobileOtpData.otp || mobileOtpData.otp.length < 4) {
      setOtpError(prev => ({ ...prev, mobile: 'Please enter the OTP' }));
      return;
    }

    setMobileOtpData(prev => ({ ...prev, isVerifying: true }));
    setOtpError(prev => ({ ...prev, mobile: '' }));

    try {
      const response = await fetchApiResponse(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/common/mobile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: parseInt(mobileOtpData.mobile, 10),
          action: 'verify',
          session_id: mobileOtpData.session_id,
          otp: mobileOtpData.otp
        })
      });

      if (response.meta.status === 200) {
        setMobileOtpData(prev => ({
          ...prev,
          isVerified: true,
          verificationToken: response.data.mobile_verification_token
        }));
        setFormData(prev => ({ ...prev, mobile: mobileOtpData.mobile }));
        toast.success('Mobile verified successfully!');
        setOtpError(prev => ({ ...prev, mobile: '' }));
      } else {
        setOtpError(prev => ({ ...prev, mobile: response.meta.message || 'Invalid OTP. Please try again.' }));
      }
    } catch (error) {
      console.error('Error verifying mobile OTP:', error);
      setOtpError(prev => ({ ...prev, mobile: 'Something went wrong. Please try again.' }));
    } finally {
      setMobileOtpData(prev => ({ ...prev, isVerifying: false }));
    }
  };

  // File upload handler - UPDATED with type parameter
  const handleFileUpload = async (file, type) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    
    // Add type parameter based on the document type
    const typeMap = {
      'aadhaar': 'aadhaar_card',
      'experience': 'experience_letter',
      'avatar': 'profile_pic'
    };
    formData.append('type', typeMap[type] || type);

    setUploading(true);
    setUploadProgress(prev => ({ ...prev, [type]: 10 }));

    try {
      setUploadProgress(prev => ({ ...prev, [type]: 30 }));
      
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/common/upload-image`,
        {
          method: 'POST',
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
          body: formData,
        }
      );

      setUploadProgress(prev => ({ ...prev, [type]: 80 }));

      if (response.meta?.status === 200) {
        // Handle different response structures
        const imageUrl = response.data?.image_url?.url || 
                        response.data?.url || 
                        response.data?.imageUrl || 
                        response.data?.fileUrl;
        
        if (imageUrl) {
          const encodedUrl = encodeURI(imageUrl);
          setFileUrls(prev => ({ ...prev, [type]: encodedUrl }));
          setUploadProgress(prev => ({ ...prev, [type]: 100 }));
          toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`);
          
          // Clear the file input after successful upload
          const fileInput = document.getElementById(`${type}-upload`);
          if (fileInput) fileInput.value = '';
        } else {
          throw new Error('No URL returned from server');
        }
      } else {
        throw new Error(response.meta?.message || 'Upload failed');
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Failed to upload ${type}: ${error.message}`);
      setFileUrls(prev => ({ ...prev, [type]: '' }));
      setFiles(prev => ({ ...prev, [type]: null }));
      setFilePreviews(prev => ({ ...prev, [type]: null }));
      setUploadProgress(prev => ({ ...prev, [type]: 0 }));
    } finally {
      setUploading(false);
      // Reset progress after a delay
      setTimeout(() => {
        setUploadProgress(prev => ({ ...prev, [type]: 0 }));
      }, 2000);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`File size should be less than 5MB`);
      e.target.value = '';
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or PDF file');
      e.target.value = '';
      return;
    }

    setFiles(prev => ({ ...prev, [type]: file }));
    setFilePreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
    
    // Auto-upload the file
    handleFileUpload(file, type);
  };

  const removeFile = (type) => {
    setFiles(prev => ({ ...prev, [type]: null }));
    setFilePreviews(prev => ({ ...prev, [type]: null }));
    setFileUrls(prev => ({ ...prev, [type]: '' }));
    setUploadProgress(prev => ({ ...prev, [type]: 0 }));
    const fileInput = document.getElementById(`${type}-upload`);
    if (fileInput) fileInput.value = '';
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.full_name) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.length < 3) {
      newErrors.full_name = 'Full name must be at least 3 characters';
    }
    
    if (!emailOtpData.isVerified) {
      newErrors.email = 'Please verify your email first';
    }
    
    if (!mobileOtpData.isVerified) {
      newErrors.mobile = 'Please verify your mobile first';
    }
    
    if (!formData.city) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.pincode) {
      newErrors.pincode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Enter a valid 6-digit PIN code';
    }
    
    if (!formData.full_address) {
      newErrors.full_address = 'Full address is required';
    } else if (formData.full_address.length < 10) {
      newErrors.full_address = 'Please enter a complete address (minimum 10 characters)';
    }

    if (!formData.highest_qualification) {
      newErrors.highest_qualification = 'Highest qualification is required';
    }
    
    if (!formData.years_of_experience) {
      newErrors.years_of_experience = 'Please select your experience level';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // File validations
    if (!fileUrls.aadhaar) {
      newErrors.aadhaar = 'Aadhaar card is required';
    }
    if (!fileUrls.experience) {
      newErrors.experience = 'Experience letter is required';
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

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!emailOtpData.isVerified) {
      toast.error('Please verify your email first');
      return;
    }
    if (!mobileOtpData.isVerified) {
      toast.error('Please verify your mobile first');
      return;
    }

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please filled all required feilds before submitting');
      return;
    }

    setLoading(true);
    try {
        const passwordHash = sha256(formData.password).toString();
        const cpasswordHash = sha256(formData.confirmPassword).toString();
      const payload = {
        email_verification_token: emailOtpData.verificationToken,
        mobile_verification_token: mobileOtpData.verificationToken,
        full_name: formData.full_name?.trim() || '',
        email: formData.email?.trim() || '',
        mobile: Number(formData.mobile?.trim()) || '',
        password: passwordHash,
        confirm_password: cpasswordHash,
        city: formData.city?.trim() || '',
        state: formData.state?.trim() || '',
        pincode: Number(formData.pincode?.trim()) || '',
        full_address: formData.full_address?.trim() || '',
        highest_qualification: formData.highest_qualification?.trim() || '',
        current_organization: formData.current_organization?.trim() || '',
        years_of_experience: formData.years_of_experience || '',
        aadhaar_card_url: fileUrls.aadhaar,
        experience_letter_url: fileUrls.experience,
        avatar_url: fileUrls.avatar || '',
      };

      // console.log('Sending payload:', payload);

      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.meta?.status === 201) {
        toast.success('Registration successful! Please login.');
        router.push('/login');
      } else {
        const errorMessage = response?.meta?.message || 'Registration failed. Please try again.';
        toast.error(errorMessage);
        setErrors({ general: errorMessage });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error?.message || 'Something went wrong. Please try again.');
      setErrors({ general: error?.message || 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Render file upload field
  const renderFileUpload = (type, label, required = true) => {
    const isUploading = uploadProgress[type] > 0 && uploadProgress[type] < 100;
    const isUploaded = fileUrls[type] && uploadProgress[type] === 100;
    
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="mt-1">
          {!fileUrls[type] ? (
            <div className={`flex items-center justify-center w-full`}>
              <label 
                htmlFor={`${type}-upload`} 
                className={`flex flex-col items-center justify-center w-full h-32 border-2 ${
                  errors[type] ? 'border-red-300' : 'border-gray-300'
                } border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isUploading ? (
                    <>
                      <Loader2 className="w-8 h-8 mb-2 text-red-600 animate-spin" />
                      <p className="text-sm text-gray-500">Uploading... {uploadProgress[type]}%</p>
                      <div className="w-48 h-1.5 bg-gray-200 rounded-full mt-2">
                        <div 
                          className="h-1.5 bg-red-600 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress[type]}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, or PDF (MAX. 5MB)</p>
                    </>
                  )}
                </div>
                <input
                  id={`${type}-upload`}
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleFileChange(e, type)}
                  disabled={isUploading}
                />
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">File uploaded</p>
                  <p className="text-xs text-gray-500">{files[type]?.name || 'Uploaded successfully'}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <button
                type="button"
                onClick={() => removeFile(type)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          {errors[type] && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors[type]}
            </p>
          )}
        </div>
      </div>
    );
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
    <div className="min-h-screen montserrat-600 bg-gray-50 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Create a new account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-red-600 hover:text-red-700">
              Sign in
            </Link>
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.full_name && touched.full_name ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                  placeholder="John Doe"
                />
              </div>
              {errors.full_name && touched.full_name && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.full_name}
                </p>
              )}
            </div>

            {/* Email with OTP */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={emailOtpData.email}
                      onChange={(e) => {
                        setEmailOtpData(prev => ({ ...prev, email: e.target.value, isVerified: false, isOtpSent: false }));
                        setOtpError(prev => ({ ...prev, email: '' }));
                      }}
                      disabled={emailOtpData.isVerified}
                      className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                        emailOtpData.isVerified ? 'border-green-500 bg-green-50' : 
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                      placeholder="john@example.com"
                    />
                    {emailOtpData.isVerified && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </div>
                  {!emailOtpData.isVerified && (
                    <button
                      type="button"
                      onClick={handleGenerateEmailOtp}
                      disabled={emailOtpData.isSending || !emailOtpData.email || otpTimer.email > 0}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {emailOtpData.isSending ? 'Sending...' : 
                       otpTimer.email > 0 ? `${otpTimer.email}s` : 'Send OTP'}
                    </button>
                  )}
                </div>
                {otpError.email && !emailOtpData.isVerified && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {otpError.email}
                  </p>
                )}
                {!emailOtpData.isVerified && emailOtpData.isOtpSent && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      maxLength="6"
                      placeholder="Enter OTP"
                      value={emailOtpData.otp}
                      onChange={(e) => setEmailOtpData(prev => ({ ...prev, otp: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyEmailOtp}
                      disabled={emailOtpData.isVerifying || !emailOtpData.otp}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {emailOtpData.isVerifying ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                )}
                {emailOtpData.isVerified && (
                  <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Email verified successfully!
                  </p>
                )}
                {errors.email && !emailOtpData.isVerified && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Mobile with OTP */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      maxLength="10"
                      value={mobileOtpData.mobile}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setMobileOtpData(prev => ({ ...prev, mobile: value, isVerified: false, isOtpSent: false }));
                        setOtpError(prev => ({ ...prev, mobile: '' }));
                      }}
                      disabled={mobileOtpData.isVerified}
                      className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                        mobileOtpData.isVerified ? 'border-green-500 bg-green-50' : 
                        errors.mobile ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                      placeholder="9876543210"
                    />
                    {mobileOtpData.isVerified && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </div>
                  {!mobileOtpData.isVerified && (
                    <button
                      type="button"
                      onClick={handleGenerateMobileOtp}
                      disabled={mobileOtpData.isSending || !mobileOtpData.mobile || otpTimer.mobile > 0}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {mobileOtpData.isSending ? 'Sending...' : 
                       otpTimer.mobile > 0 ? `${otpTimer.mobile}s` : 'Send OTP'}
                    </button>
                  )}
                </div>
                {otpError.mobile && !mobileOtpData.isVerified && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {otpError.mobile}
                  </p>
                )}
                {!mobileOtpData.isVerified && mobileOtpData.isOtpSent && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      maxLength="6"
                      placeholder="Enter OTP"
                      value={mobileOtpData.otp}
                      onChange={(e) => setMobileOtpData(prev => ({ ...prev, otp: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyMobileOtp}
                      disabled={mobileOtpData.isVerifying || !mobileOtpData.otp}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {mobileOtpData.isVerifying ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                )}
                {mobileOtpData.isVerified && (
                  <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Mobile verified successfully!
                  </p>
                )}
                {errors.mobile && !mobileOtpData.isVerified && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.mobile}
                  </p>
                )}
              </div>
            </div>

            {/* Address Section */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Address Details</h3>
              
              <div className="mb-4">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                      errors.city && touched.city ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                    placeholder="Mumbai"
                  />
                </div>
                {errors.city && touched.city && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.city}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Map className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={formData.state}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                      errors.state && touched.state ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                    placeholder="Maharashtra"
                  />
                </div>
                {errors.state && touched.state && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.state}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
                  PIN Code <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    maxLength="6"
                    value={formData.pincode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                      errors.pincode && touched.pincode ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                    placeholder="400001"
                  />
                </div>
                {errors.pincode && touched.pincode && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.pincode}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="full_address" className="block text-sm font-medium text-gray-700">
                  Full Address <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                    <Home className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    id="full_address"
                    name="full_address"
                    rows="3"
                    value={formData.full_address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                      errors.full_address && touched.full_address ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                    placeholder="Street Address, Area, Landmark"
                  />
                </div>
                {errors.full_address && touched.full_address && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.full_address}
                  </p>
                )}
              </div>
            </div>

            {/* Professional Details */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Details</h3>
              
              <div className="mb-4">
                <label htmlFor="highest_qualification" className="block text-sm font-medium text-gray-700">
                  Highest Qualification <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GraduationCap className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="highest_qualification"
                    name="highest_qualification"
                    value={formData.highest_qualification}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                      errors.highest_qualification && touched.highest_qualification ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                  >
                    <option value="">Select qualification</option>
                    <option value="10th">10th Pass</option>
                    <option value="12th">12th Pass</option>
                    <option value="diploma">Diploma</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="phd">PhD</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {errors.highest_qualification && touched.highest_qualification && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.highest_qualification}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="current_organization" className="block text-sm font-medium text-gray-700">
                  Current Organization
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="current_organization"
                    name="current_organization"
                    type="text"
                    value={formData.current_organization}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Company Name (optional)"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="years_of_experience" className="block text-sm font-medium text-gray-700">
                  Years of Experience <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="years_of_experience"
                    name="years_of_experience"
                    value={formData.years_of_experience}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                      errors.years_of_experience && touched.years_of_experience ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                  >
                    <option value="">Select experience level</option>
                    <option value="fresher">Fresher</option>
                    <option value="1-5">1-5 Years</option>
                    <option value="5-10">5-10 Years</option>
                    <option value="10+">10+ Years</option>
                  </select>
                </div>
                {errors.years_of_experience && touched.years_of_experience && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.years_of_experience}
                  </p>
                )}
              </div>
            </div>

            {/* Document Uploads Section */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Document Uploads</h3>
              <p className="text-sm text-gray-500 mb-4">Upload the required documents (PNG, JPG, or PDF, max 5MB each)</p>
              
              {/* Avatar Upload (Optional) */}
              {renderFileUpload('avatar', 'Profile Picture', true)}

              {/* Aadhaar Card Upload (Required) */}
              {renderFileUpload('aadhaar', 'Aadhaar Card', true)}

              {/* Experience Letter Upload (Required) */}
              {renderFileUpload('experience', 'Experience Letter', true)}
            </div>

            {/* Password */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                      errors.password && touched.password ? 'border-red-300' : 'border-gray-300'
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
                {errors.password && touched.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                      errors.confirmPassword && touched.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
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
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-700">
                  I agree to the{' '}
                  <a href="/terms" className="text-red-600 hover:text-red-700">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-red-600 hover:text-red-700">
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading || !emailOtpData.isVerified || !mobileOtpData.isVerified || uploading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2 mt-0.5" />
                    Create Account
                  </>
                )}
              </button>
              {(!emailOtpData.isVerified || !mobileOtpData.isVerified) && (
                <p className="mt-2 text-sm text-amber-600 text-center">
                  Please verify your email and mobile number to create account
                </p>
              )}
              {uploading && (
                <p className="mt-2 text-sm text-blue-600 text-center">
                  Uploading files... Please wait
                </p>
              )}
            </div>
          </form>

          <div className="mt-6 bg-blue-50 rounded-md p-3">
            <p className="text-xs text-black text-center">
              🔒 Your information is secure and will only be used for verification purposes.
              We do not share your data with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}