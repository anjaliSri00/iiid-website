// app/profile/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap,
  Building, Calendar, Hash, Home, UserCheck, FileText,
  Image, Camera, Edit2, Save, X, AlertCircle, CheckCircle,
  Loader2, Upload, File, Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';
import fetchApiResponse from '@/helper/api_data_store';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [errors, setErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState({});
  const [deletingDocument, setDeletingDocument] = useState({});

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch profile data
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchProfile();
    }
  }, [status, session]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const userId = session?.user?.id;
      if (!userId) {
        toast.error('User ID not found');
        return;
      }

      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/details/${userId}`,
        {
          method: 'GET',
          headers: {
            'Access-Token': session?.accessToken,
            'Refresh-Token': session?.refreshToken
          },
        }
      );

      if (response.meta?.status === 200 && response.data) {
        setProfile(response.data);
        setEditedData(response.data);
        setOriginalData(response.data);
      } else {
        toast.error(response.meta?.message || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedData(profile);
      setErrors({});
      setAvatarPreview(null);
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check for HEIC files
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    const isHEIC =
      fileName.endsWith(".heic") ||
      fileName.endsWith(".heif") ||
      fileType.includes("heic") ||
      fileType.includes("heif");

    if (isHEIC) {
      toast.error(
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-red-600">
            HEIC/HEIF Format Not Supported
          </p>
          <p className="text-sm text-gray-700">
            Profile pictures must be in JPG or PNG format.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            💡 Please convert your image before uploading.
          </p>
        </div>,
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            backgroundColor: "#FEF2F2",
            border: "1px solid #FCA5A5",
            borderRadius: "8px",
          },
        }
      );
      return;
    }

    // Validate file size (max 1MB for profile pic)
    if (file.size > 1 * 1024 * 1024) {
      toast.error('File size too large. Maximum size is 1MB.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPEG or PNG image');
      return;
    }

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', 'profile_pic');

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/common/upload-image`,
        {
          method: 'POST',
          headers: {
            'Access-Token': session?.accessToken,
            'Refresh-Token': session?.refreshToken
          },
          body: formData,
        }
      );

      if (response.meta?.status === 200) {
        const imageUrl = response.data?.image_url?.url || response.data?.url || response.data?.imageUrl || response.data?.fileUrl;
        if (imageUrl) {
          const encodedUrl = encodeURI(imageUrl);
          setEditedData(prev => ({ ...prev, avatar_url: encodedUrl }));
          toast.success('Profile picture uploaded successfully!');
        } else {
          throw new Error('No URL returned from server');
        }
      } else {
        throw new Error(response.meta?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      // Revert preview on error
      setAvatarPreview(null);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDocumentUpload = async (e, documentType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check for HEIC files
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    const isHEIC =
      fileName.endsWith(".heic") ||
      fileName.endsWith(".heif") ||
      fileType.includes("heic") ||
      fileType.includes("heif");

    if (isHEIC) {
      toast.error(
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-red-600">
            HEIC/HEIF Format Not Supported
          </p>
          <p className="text-sm text-gray-700">
            Documents must be in JPG, PNG, or PDF format.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            💡 Please convert your image before uploading.
          </p>
        </div>,
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            backgroundColor: "#FEF2F2",
            border: "1px solid #FCA5A5",
            borderRadius: "8px",
          },
        }
      );
      return;
    }

    // Validate file size (max 2MB for documents)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size too large. Maximum size is 2MB.');
      return;
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF, JPEG, or PNG file');
      return;
    }

    setUploadingDocument(prev => ({ ...prev, [documentType]: true }));

    const formData = new FormData();
    formData.append('image', file);
    
    // Set the type based on document type
    const typeMap = {
      'aadhaar': 'aadhaar_card',
      'experience': 'experience_letter'
    };
    formData.append('type', typeMap[documentType]);

    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/common/upload-image`,
        {
          method: 'POST',
          headers: {
            'Access-Token': session?.accessToken,
            'Refresh-Token': session?.refreshToken
          },
          body: formData,
        }
      );

      if (response.meta?.status === 200) {
        const documentUrl = response.data?.image_url?.url || response.data?.url || response.data?.documentUrl || response.data?.fileUrl;
        if (documentUrl) {
          const encodedUrl = encodeURI(documentUrl);
          // Update the specific document field
          const fieldName = documentType === 'aadhaar' ? 'aadhaar_card_url' : 'experience_letter_url';
          setEditedData(prev => ({ ...prev, [fieldName]: encodedUrl }));
          toast.success(`${documentType === 'aadhaar' ? 'Aadhaar' : 'Experience'} document uploaded successfully!`);
        } else {
          throw new Error('No URL returned from server');
        }
      } else {
        throw new Error(response.meta?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error(`Failed to upload ${documentType} document`);
    } finally {
      setUploadingDocument(prev => ({ ...prev, [documentType]: false }));
    }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const userId = session?.user?.id;
      if (!userId) {
        toast.error('User ID not found');
        return;
      }

      // Compare editedData with originalData to find only changed fields
      const changedFields = {};
      const fieldsToCheck = [
        'full_name', 'city', 'state', 'pincode', 'full_address',
        'highest_qualification', 'current_organization', 'years_of_experience',
        'avatar_url', 'aadhaar_card_url', 'experience_letter_url'
      ];

      fieldsToCheck.forEach(field => {
        if (editedData[field] !== originalData[field]) {
          changedFields[field] = editedData[field];
        }
      });

      // If no changes were made
      if (Object.keys(changedFields).length === 0) {
        toast.info('No changes to save');
        setIsEditing(false);
        setSaving(false);
        return;
      }

      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/profile/update`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Access-Token': session?.accessToken,
            'Refresh-Token': session?.refreshToken
          },
          body: JSON.stringify(changedFields),
        }
      );

      if (response.meta?.status === 200) {
        toast.success('Profile updated successfully!');
        setProfile(editedData);
        setOriginalData(editedData); // Update original data with new values
        setIsEditing(false);
        setAvatarPreview(null);
        // Refresh profile data
        await fetchProfile();
      } else {
        toast.error(response.meta?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">Profile not found</h3>
          <p className="text-gray-500 mt-2">Unable to load your profile data</p>
          <button
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage your profile information</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            {!isEditing ? (
              <button
                onClick={handleEditToggle}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleEditToggle}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Cover/Header Section */}
          <div className="bg-linear-to-r from-red-600 to-red-700 h-32 relative">
            {/* Avatar */}
            <div className="absolute -bottom-12 left-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                  {avatarPreview || profile.avatar_url ? (
                    <img
                      src={avatarPreview || profile.avatar_url}
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-red-100 text-red-600 text-3xl font-bold">
                      {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 p-1.5 bg-red-600 rounded-full cursor-pointer hover:bg-red-700 transition-colors"
                  >
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      id="avatar-upload"
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                    />
                  </label>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-14 px-6 pb-6">
            {/* User Name and Code */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    name="full_name"
                    value={editedData.full_name || ''}
                    onChange={handleChange}
                    className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-red-500 focus:outline-none px-2 py-1"
                    placeholder="Full Name"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900">{profile.full_name}</h2>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{profile.user_code}</span>
                </div>
              </div>
              <div className="mt-2 md:mt-0">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  profile.role_type?.includes('student') 
                    ? 'bg-blue-100 text-blue-700' 
                    : profile.role_type?.includes('designer')
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {profile.role_type?.join(', ') || 'User'}
                </span>
                <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                  profile.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {profile.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Profile Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-2">
                  Personal Information
                </h3>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Mobile</p>
                    <p className="text-sm text-gray-900">{profile.mobile}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Member Since</p>
                    <p className="text-sm text-gray-900">
                      {new Date(profile.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-2">
                  Professional Information
                </h3>

                <div className="flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Highest Qualification</p>
                    {isEditing ? (
                      <select
                        name="highest_qualification"
                        value={editedData.highest_qualification || ''}
                        onChange={handleChange}
                        className="text-sm text-gray-900 bg-transparent border-b-2 border-red-500 focus:outline-none px-2 py-1 w-full"
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
                    ) : (
                      <p className="text-sm text-gray-900">{profile.highest_qualification || 'Not specified'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Current Organization</p>
                    {isEditing ? (
                      <input
                        type="text"
                        name="current_organization"
                        value={editedData.current_organization || ''}
                        onChange={handleChange}
                        className="text-sm text-gray-900 bg-transparent border-b-2 border-red-500 focus:outline-none px-2 py-1 w-full"
                        placeholder="Organization name"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{profile.current_organization || 'Not specified'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Years of Experience</p>
                    {isEditing ? (
                      <select
                        name="years_of_experience"
                        value={editedData.years_of_experience || ''}
                        onChange={handleChange}
                        className="text-sm text-gray-900 bg-transparent border-b-2 border-red-500 focus:outline-none px-2 py-1 w-full"
                      >
                        <option value="">Select experience</option>
                        <option value="fresher">Fresher</option>
                        <option value="1">1-5 Years</option>
                        <option value="5-10">5-10 Years</option>
                        <option value="10+">10+ Years</option>
                      </select>
                    ) : (
                      <p className="text-sm text-gray-900">{profile.years_of_experience || 'Not specified'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-2">
                  Address Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">City</p>
                      {isEditing ? (
                        <input
                          type="text"
                          name="city"
                          value={editedData.city || ''}
                          onChange={handleChange}
                          className="text-sm text-gray-900 bg-transparent border-b-2 border-red-500 focus:outline-none px-2 py-1 w-full"
                          placeholder="City"
                        />
                      ) : (
                        <p className="text-sm text-gray-900">{profile.city || 'Not specified'}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">State</p>
                      {isEditing ? (
                        <input
                          type="text"
                          name="state"
                          value={editedData.state || ''}
                          onChange={handleChange}
                          className="text-sm text-gray-900 bg-transparent border-b-2 border-red-500 focus:outline-none px-2 py-1 w-full"
                          placeholder="State"
                        />
                      ) : (
                        <p className="text-sm text-gray-900">{profile.state || 'Not specified'}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Hash className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">PIN Code</p>
                      {isEditing ? (
                        <input
                          type="text"
                          name="pincode"
                          value={editedData.pincode || ''}
                          onChange={handleChange}
                          className="text-sm text-gray-900 bg-transparent border-b-2 border-red-500 focus:outline-none px-2 py-1 w-full"
                          placeholder="PIN Code"
                        />
                      ) : (
                        <p className="text-sm text-gray-900">{profile.pincode || 'Not specified'}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Home className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Full Address</p>
                    {isEditing ? (
                      <textarea
                        name="full_address"
                        value={editedData.full_address || ''}
                        onChange={handleChange}
                        rows="2"
                        className="text-sm text-gray-900 bg-transparent border-b-2 border-red-500 focus:outline-none px-2 py-1 w-full"
                        placeholder="Full address"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 whitespace-pre-line">{profile.full_address || 'Not specified'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-2">
                  Documents
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Aadhaar Card */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Aadhaar Card</p>
                          {editedData.aadhaar_card_url ? (
                            <a
                              href={editedData.aadhaar_card_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-red-600 hover:underline flex items-center gap-1 mt-1"
                            >
                              <File className="w-3 h-3" />
                              View Document
                            </a>
                          ) : (
                            <p className="text-xs text-gray-400 mt-1">Not uploaded</p>
                          )}
                        </div>
                      </div>
                      {isEditing && (
                        <div className="flex gap-2">
                          
                          <label className="cursor-pointer">
                            <div className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors">
                              <Upload className="w-4 h-4" />
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleDocumentUpload(e, 'aadhaar')}
                              disabled={uploadingDocument.aadhaar}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                    {uploadingDocument.aadhaar && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Uploading...
                      </div>
                    )}
                  </div>

                  {/* Experience Letter */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Experience Letter</p>
                          {editedData.experience_letter_url ? (
                            <a
                              href={editedData.experience_letter_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-red-600 hover:underline flex items-center gap-1 mt-1"
                            >
                              <File className="w-3 h-3" />
                              View Document
                            </a>
                          ) : (
                            <p className="text-xs text-gray-400 mt-1">Not uploaded</p>
                          )}
                        </div>
                      </div>
                      {isEditing && (
                        <div className="flex gap-2">
                        
                          <label className="cursor-pointer">
                            <div className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors">
                              <Upload className="w-4 h-4" />
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleDocumentUpload(e, 'experience')}
                              disabled={uploadingDocument.experience}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                    {uploadingDocument.experience && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Uploading...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Update Status */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <UserCheck className="w-4 h-4" />
                <span>Last updated: {new Date(profile.updated_at).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}