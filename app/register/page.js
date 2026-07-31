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
import sha256 from 'crypto-js/sha256';

// Password strength helper
const getPasswordStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 6) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

// Compact File Upload Field with drag & drop
const FileUploadField = ({ type, label, required, fileUrl, file, uploadProgress, error, onFileChange, onRemove }) => {
  const [isDragging, setIsDragging] = useState(false);
  const isUploading = uploadProgress > 0 && uploadProgress < 100;
  const isUploaded = fileUrl && uploadProgress === 100;

  return (
    <div className="mb-2"> {/* Reduced margin */}
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {!fileUrl ? (
        <div
          className={`relative flex flex-col items-center justify-center w-full p-4 border-2 ${
            isDragging ? 'border-red-500 bg-red-50' : 'border-gray-300 border-dashed'
          } transition-colors duration-200 hover:bg-gray-50 cursor-pointer`}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) onFileChange({ target: { files: [file] } }, type);
          }}
        >
          {isUploading ? (
            <div className="text-center w-full">
              <Loader2 className="w-8 h-8 mx-auto mb-1 text-red-600 animate-spin" />
              <p className="text-xs text-gray-600">Uploading... {uploadProgress}%</p>
              <div className="w-full max-w-xs mx-auto mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 mb-1 text-gray-400" />
              <p className="text-xs text-gray-600">
                <span className="font-semibold text-red-600">Click</span> or drag
              </p>
              <p className="text-[10px] text-gray-500">PNG, JPG, PDF (max 5MB)</p>
            </>
          )}
          <input
            id={`${type}-upload`}
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(e) => onFileChange(e, type)}
            disabled={isUploading}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between p-2 border border-green-200 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-2 truncate">
            <FileText className="w-6 h-6 text-green-600 shrink-0" />
            <div className="truncate">
              <p className="text-xs font-medium text-gray-700 truncate">{file?.name || 'Uploaded'}</p>
              <p className="text-[10px] text-gray-500">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Uploaded'}
              </p>
            </div>
            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
          </div>
          <button
            type="button"
            onClick={() => onRemove(type)}
            className="text-red-500 hover:text-red-700 p-0.5 rounded-full hover:bg-red-50"
            aria-label={`Remove ${label}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {error && (
        <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
};

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

  const [formSubmitted, setFormSubmitted] = useState(false);

  
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

  // Redirect if logged in
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  // OTP Timers
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

  // ---------- OTP Handlers (unchanged) ----------
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

  // ---------- File Upload Handlers (unchanged) ----------
  const handleFileUpload = async (file, type) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    
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
        const imageUrl = response.data?.image_url?.url || 
                        response.data?.url || 
                        response.data?.imageUrl || 
                        response.data?.fileUrl;
        
        if (imageUrl) {
          const encodedUrl = encodeURI(imageUrl);
          setFileUrls(prev => ({ ...prev, [type]: encodedUrl }));
          setUploadProgress(prev => ({ ...prev, [type]: 100 }));
          toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`);
          
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
      setTimeout(() => {
        setUploadProgress(prev => ({ ...prev, [type]: 0 }));
      }, 2000);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(`File size should be less than 5MB`);
      e.target.value = '';
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or PDF file');
      e.target.value = '';
      return;
    }

    setFiles(prev => ({ ...prev, [type]: file }));
    setFilePreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
    
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

  // Add this function after your validateForm function
const shouldShowError = (fieldName) => {
  // Show error if there's an error AND (field has value OR form was submitted)
  return errors[fieldName] && (
    formData[fieldName] !== '' || 
    formData[fieldName] !== null || 
    formData[fieldName] !== undefined
  );
};
  // ---------- Form Validation (unchanged) ----------
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

  
  if (value && value.trim() !== '') {
    setTouched(prev => ({ ...prev, [name]: true }));
  }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  // ---------- Submit Handler (unchanged) ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
      const allFields = ['full_name', 'city', 'state', 'pincode', 'full_address', 
                     'highest_qualification', 'years_of_experience', 'password', 'confirmPassword'];
 const touchedState = {};
   allFields.forEach(field => {
    touchedState[field] = true;
  });
  setTouched(prev => ({ ...prev, ...touchedState }));
    setFormSubmitted(true);

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
      // toast.error('Please fill all required fields before submitting');
      const firstError = Object.values(newErrors)[0];
    toast.error(firstError);
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

  // ---------- Main Render (COMPACT VERSION) ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Compact Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-2">
            <UserPlus className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="text-sm text-gray-600">Join us and get started</p>
          <p className="text-xs text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-red-600 hover:text-red-700 transition">
              Sign in
            </Link>
          </p>
        </div>

        {/* Main Card - Reduced padding */}
        <div className="bg-white shadow-xl overflow-hidden">
          <div className="p-5 sm:p-6">
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Personal Information Section - Compact */}
              <div className="bg-gray-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-red-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Personal Information</h3>
                </div>
                
                <div className="space-y-2">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="full_name" className="block text-xs font-medium text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-0.5 relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        id="full_name"
                        name="full_name"
                        type="text"
                        value={formData.full_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`block w-full pl-8 pr-3 py-1.5 text-sm border ${
                          errors.full_name && touched.full_name ? 'border-red-300' : 'border-gray-300'
                        } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200`}
                        placeholder="John Doe"
                      />
                    </div>
                  
{errors.full_name && (touched.full_name || formData.full_name !== '') && (
  <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
    <AlertCircle className="w-3 h-3" /> {errors.full_name}
  </p>
)}
                  </div>

                  {/* Email OTP - Compact */}
                  <div className="border border-gray-200  p-3 bg-white">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-gray-700">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      {emailOtpData.isVerified && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-0.5" /> Verified
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          value={emailOtpData.email}
                          onChange={(e) => {
                            setEmailOtpData(prev => ({ ...prev, email: e.target.value, isVerified: false, isOtpSent: false }));
                            setOtpError(prev => ({ ...prev, email: '' }));
                          }}
                          disabled={emailOtpData.isVerified}
                          className={`block w-full pl-8 pr-3 py-1.5 text-sm border ${
                            emailOtpData.isVerified ? 'border-green-300 bg-green-50' : 
                            errors.email ? 'border-red-300' : 'border-gray-300'
                          } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200`}
                          placeholder="john@example.com"
                        />
                        {emailOtpData.isVerified && (
                          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                        )}
                      </div>
                      {!emailOtpData.isVerified && (
                        <button
                          type="button"
                          onClick={handleGenerateEmailOtp}
                          disabled={emailOtpData.isSending || !emailOtpData.email || otpTimer.email > 0}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition duration-200"
                        >
                          {emailOtpData.isSending ? (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Sending...
                            </div>
                          ) : otpTimer.email > 0 ? (
                            `${otpTimer.email}s`
                          ) : (
                            'Send OTP'
                          )}
                        </button>
                      )}
                    </div>
                    {otpError.email && !emailOtpData.isVerified && (
                      <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {otpError.email}
                      </p>
                    )}
                    {!emailOtpData.isVerified && emailOtpData.isOtpSent && (
                      <div className="mt-2 flex gap-2 items-center">
                        <div className="flex-1">
                          <input
                            type="text"
                            maxLength="6"
                            placeholder="Enter 6-digit OTP"
                            value={emailOtpData.otp}
                            onChange={(e) => setEmailOtpData(prev => ({ ...prev, otp: e.target.value }))}
                            className="block w-full px-3 py-1.5 text-sm border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleVerifyEmailOtp}
                          disabled={emailOtpData.isVerifying || !emailOtpData.otp}
                          className="px-3 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition duration-200"
                        >
                          {emailOtpData.isVerifying ? (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Verifying...
                            </div>
                          ) : (
                            'Verify'
                          )}
                        </button>
                      </div>
                    )}
                    {emailOtpData.isVerified && (
                      <p className="mt-0.5 text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Email verified
                      </p>
                    )}
                    {errors.email && !emailOtpData.isVerified && (
                      <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Mobile OTP - Compact */}
                  <div className="border border-gray-200 p-3 bg-white">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-gray-700">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      {mobileOtpData.isVerified && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-0.5" /> Verified
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 text-gray-400" />
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
                          className={`block w-full pl-8 pr-3 py-1.5 text-sm border ${
                            mobileOtpData.isVerified ? 'border-green-300 bg-green-50' : 
                            errors.mobile ? 'border-red-300' : 'border-gray-300'
                          } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200`}
                          placeholder="9876543210"
                        />
                        {mobileOtpData.isVerified && (
                          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                        )}
                      </div>
                      {!mobileOtpData.isVerified && (
                        <button
                          type="button"
                          onClick={handleGenerateMobileOtp}
                          disabled={mobileOtpData.isSending || !mobileOtpData.mobile || otpTimer.mobile > 0}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition duration-200"
                        >
                          {mobileOtpData.isSending ? (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Sending...
                            </div>
                          ) : otpTimer.mobile > 0 ? (
                            `${otpTimer.mobile}s`
                          ) : (
                            'Send OTP'
                          )}
                        </button>
                      )}
                    </div>
                    {otpError.mobile && !mobileOtpData.isVerified && (
                      <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {otpError.mobile}
                      </p>
                    )}
                    {!mobileOtpData.isVerified && mobileOtpData.isOtpSent && (
                      <div className="mt-2 flex gap-2 items-center">
                        <div className="flex-1">
                          <input
                            type="text"
                            maxLength="6"
                            placeholder="Enter 6-digit OTP"
                            value={mobileOtpData.otp}
                            onChange={(e) => setMobileOtpData(prev => ({ ...prev, otp: e.target.value }))}
                            className="block w-full px-3 py-1.5 text-sm border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleVerifyMobileOtp}
                          disabled={mobileOtpData.isVerifying || !mobileOtpData.otp}
                          className="px-3 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition duration-200"
                        >
                          {mobileOtpData.isVerifying ? (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Verifying...
                            </div>
                          ) : (
                            'Verify'
                          )}
                        </button>
                      </div>
                    )}
                    {mobileOtpData.isVerified && (
                      <p className="mt-0.5 text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Mobile verified
                      </p>
                    )}
                    {errors.mobile && !mobileOtpData.isVerified && (
                      <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.mobile}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Section - Compact */}
              <div className="bg-gray-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Address Details</h3>
                </div>
                
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="city" className="block text-xs font-medium text-gray-700">
                        City <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-0.5 relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                          <MapPin className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          id="city"
                          name="city"
                          type="text"
                          value={formData.city}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`block w-full pl-8 pr-3 py-1.5 text-sm border ${
                            errors.city && touched.city ? 'border-red-300' : 'border-gray-300'
                          } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200`}
                          placeholder="Mumbai"
                        />
                      </div>
                      {errors.city && (touched.city || formData.city !== '') && (
  <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
    <AlertCircle className="w-3 h-3" /> {errors.city}
  </p>
)}
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-xs font-medium text-gray-700">
                        State <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-0.5 relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                          <Map className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          id="state"
                          name="state"
                          type="text"
                          value={formData.state}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`block w-full pl-8 pr-3 py-1.5 text-sm border ${
                            errors.state && touched.state ? 'border-red-300' : 'border-gray-300'
                          } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200`}
                          placeholder="Maharashtra"
                        />
                      </div>
                     {errors.state && (touched.state || formData.state !== '') && (
  <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
    <AlertCircle className="w-3 h-3" /> {errors.state}
  </p>
)}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="pincode" className="block text-xs font-medium text-gray-700">
                      PIN Code <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-0.5 relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <Hash className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        id="pincode"
                        name="pincode"
                        type="text"
                        maxLength="6"
                        value={formData.pincode}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`block w-full pl-8 pr-3 py-1.5 text-sm border ${
                          errors.pincode && touched.pincode ? 'border-red-300' : 'border-gray-300'
                        } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200`}
                        placeholder="400001"
                      />
                    </div>
                    {errors.pincode && (touched.pincode || formData.pincode !== '') && (
  <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
    <AlertCircle className="w-3 h-3" /> {errors.pincode}
  </p>
)}
                  </div>

                  <div>
                    <label htmlFor="full_address" className="block text-xs font-medium text-gray-700">
                      Full Address <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-0.5 relative">
                      <div className="absolute top-2 left-2.5 flex items-start pointer-events-none">
                        <Home className="h-4 w-4 text-gray-400" />
                      </div>
                      <textarea
                        id="full_address"
                        name="full_address"
                        rows="2"
                        value={formData.full_address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`block w-full pl-8 pr-3 py-1.5 text-sm border ${
                          errors.full_address && touched.full_address ? 'border-red-300' : 'border-gray-300'
                        } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200`}
                        placeholder="Street Address, Area, Landmark"
                      />
                    </div>
                   {errors.full_address && (touched.full_address || formData.full_address !== '') && (
  <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
    <AlertCircle className="w-3 h-3" /> {errors.full_address}
  </p>
)}
                  </div>
                </div>
              </div>

              {/* Professional Details - Compact */}
              <div className="bg-gray-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-red-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Professional Details</h3>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <label htmlFor="highest_qualification" className="block text-xs font-medium text-gray-700">
                      Highest Qualification <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-0.5 relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <GraduationCap className="h-4 w-4 text-gray-400" />
                      </div>
                      <select
                        id="highest_qualification"
                        name="highest_qualification"
                        value={formData.highest_qualification}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`block w-full pl-8 pr-3 py-1.5 text-sm border ${
                          errors.highest_qualification && touched.highest_qualification ? 'border-red-300' : 'border-gray-300'
                        }  shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200`}
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
                    {errors.highest_qualification && (touched.highest_qualification || formData.highest_qualification !== '') && (
  <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
    <AlertCircle className="w-3 h-3" /> {errors.highest_qualification}
  </p>
)}
                  </div>

                  <div>
                    <label htmlFor="current_organization" className="block text-xs font-medium text-gray-700">
                      Current Organization
                    </label>
                    <div className="mt-0.5 relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <Building className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        id="current_organization"
                        name="current_organization"
                        type="text"
                        value={formData.current_organization}
                        onChange={handleChange}
                        className="block w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
                        placeholder="Company Name (optional)"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="years_of_experience" className="block text-xs font-medium text-gray-700">
                      Years of Experience <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-0.5 relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                      </div>
                      <select
                        id="years_of_experience"
                        name="years_of_experience"
                        value={formData.years_of_experience}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`block w-full pl-8 pr-3 py-1.5 text-sm border ${
                          errors.years_of_experience && touched.years_of_experience ? 'border-red-300' : 'border-gray-300'
                        }  shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200`}
                      >
                        <option value="">Select experience level</option>
                        <option value="fresher">Fresher</option>
                        <option value="1-5">1-5 Years</option>
                        <option value="5-10">5-10 Years</option>
                        <option value="10+">10+ Years</option>
                      </select>
                    </div>
                    {errors.years_of_experience && (touched.years_of_experience || formData.years_of_experience !== '') && (
  <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
    <AlertCircle className="w-3 h-3" /> {errors.years_of_experience}
  </p>
)}
                  </div>
                </div>
              </div>

              {/* Document Uploads - Compact */}
              <div className="bg-gray-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-4 h-4 text-red-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Document Uploads</h3>
                </div>
                <p className="text-xs text-gray-500 mb-2">PNG, JPG, PDF (max 5MB each)</p>
                
                <div className="space-y-2">
                  <FileUploadField
                    type="avatar"
                    label="Profile Picture"
                    required={true}
                    fileUrl={fileUrls.avatar}
                    file={files.avatar}
                    uploadProgress={uploadProgress.avatar}
                    error={errors.avatar}
                    onFileChange={handleFileChange}
                    onRemove={removeFile}
                  />
                  <FileUploadField
                    type="aadhaar"
                    label="Aadhaar Card"
                    required={true}
                    fileUrl={fileUrls.aadhaar}
                    file={files.aadhaar}
                    uploadProgress={uploadProgress.aadhaar}
                    error={errors.aadhaar}
                    onFileChange={handleFileChange}
                    onRemove={removeFile}
                  />
                  <FileUploadField
                    type="experience"
                    label="Experience Letter"
                    required={true}
                    fileUrl={fileUrls.experience}
                    file={files.experience}
                    uploadProgress={uploadProgress.experience}
                    error={errors.experience}
                    onFileChange={handleFileChange}
                    onRemove={removeFile}
                  />
                </div>
              </div>

              {/* Password Section - Compact */}
              <div className="bg-gray-50  p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-red-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Set Password</h3>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <label htmlFor="password" className="block text-xs font-medium text-gray-700">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-0.5 relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`block w-full pl-8 pr-8 py-1.5 text-sm border ${
                          errors.password && touched.password ? 'border-red-300' : 'border-gray-300'
                        } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.password && (touched.password || formData.password !== '') && (
  <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
    <AlertCircle className="w-3 h-3" /> {errors.password}
  </p>
)}
                    
                    {/* Password strength - compact */}
                    {formData.password && (
                      <div className="mt-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                getPasswordStrength(formData.password) <= 1 ? 'bg-red-500' :
                                getPasswordStrength(formData.password) === 2 ? 'bg-yellow-500' :
                                getPasswordStrength(formData.password) === 3 ? 'bg-blue-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${(getPasswordStrength(formData.password) / 4) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-500">
                            {getPasswordStrength(formData.password) <= 1 ? 'Weak' :
                             getPasswordStrength(formData.password) === 2 ? 'Fair' :
                             getPasswordStrength(formData.password) === 3 ? 'Good' :
                             'Strong'}
                          </span>
                        </div>
                        <ul className="mt-0.5 text-[10px] text-gray-600 space-y-0">
                          <li className={formData.password.length >= 6 ? 'text-green-600' : ''}>
                            {formData.password.length >= 6 ? '✓' : '○'} 6+ chars
                          </li>
                          <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                            {/[A-Z]/.test(formData.password) ? '✓' : '○'} Uppercase
                          </li>
                          <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                            {/[0-9]/.test(formData.password) ? '✓' : '○'} Number
                          </li>
                          <li className={/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                            {/[^A-Za-z0-9]/.test(formData.password) ? '✓' : '○'} Special char
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-0.5 relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`block w-full pl-8 pr-8 py-1.5 text-sm border ${
                          errors.confirmPassword && touched.confirmPassword ? 'border-red-300' : 'border-gray-300'
                        } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center"
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                 {/* confirm password: */}
{errors.confirmPassword && (touched.confirmPassword || formData.confirmPassword !== '') && (
  <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
    <AlertCircle className="w-3 h-3" /> {errors.confirmPassword}
  </p>
)}
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <div className="flex items-center h-4">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="h-3.5 w-3.5 text-red-600 focus:ring-red-500 border-gray-300  accent-red-600"
                    required
                  />
                </div>
                <div className="ml-2 text-xs">
                  <label htmlFor="terms" className="text-gray-700">
                    I agree to the{' '}
                    <a href="/terms" className="text-red-600 hover:text-red-700 transition">
                      Terms
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-red-600 hover:text-red-700 transition">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </div>

              {/* Submit Button - Compact */}
              <div>
                <button
                  type="submit"
                  disabled={loading || !emailOtpData.isVerified || !mobileOtpData.isVerified || uploading}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-200"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Account
                    </>
                  )}
                </button>
                {(!emailOtpData.isVerified || !mobileOtpData.isVerified) && (
                  <p className="mt-1 text-xs text-amber-600 text-center">
                    Verify email & mobile to proceed
                  </p>
                )}
                {uploading && (
                  <p className="mt-1 text-xs text-blue-600 text-center">
                    Uploading files...
                  </p>
                )}
              </div>
            </form>

            <div className="mt-4 bg-blue-50 p-2">
              <p className="text-[10px] text-center text-gray-600">
                🔒 Your information is secure and used only for verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}