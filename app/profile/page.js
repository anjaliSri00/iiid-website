// app/profile/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap,
  Building, Calendar, Hash, Home, UserCheck, FileText,
  Image, Camera, Edit2, Save, X, AlertCircle, CheckCircle,
  Loader2
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
  const [errors, setErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
            'Access-Token':session?.accessToken,
            'Refresh-Token':session?.refreshToken
          },
        }
      );

      if (response.meta?.status === 200 && response.data?.data) {
        setProfile(response.data.data);
        setEditedData(response.data.data);
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
      // Cancel editing - reset to original data
      setEditedData(profile);
      setErrors({});
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

    // Validate file
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
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

    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/common/upload-image`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (response.meta?.status === 200) {
        const imageUrl = response.data?.url || response.data?.imageUrl || response.data?.fileUrl;
        if (imageUrl) {
          setEditedData(prev => ({ ...prev, avatar_url: imageUrl }));
          setAvatarPreview(URL.createObjectURL(file));
          toast.success('Avatar uploaded successfully!');
        } else {
          throw new Error('No URL returned from server');
        }
      } else {
        throw new Error(response.meta?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
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

      const payload = {
        full_name: editedData.full_name,
        city: editedData.city,
        state: editedData.state,
        pincode: editedData.pincode,
        full_address: editedData.full_address,
        highest_qualification: editedData.highest_qualification,
        current_organization: editedData.current_organization,
        years_of_experience: editedData.years_of_experience,
        avatar_url: editedData.avatar_url,
        // Add other fields that can be updated
      };

      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/update/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.meta?.status === 200) {
        toast.success('Profile updated successfully!');
        setProfile(editedData);
        setIsEditing(false);
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

              {/* Documents */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-2">
                  Documents
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Aadhaar Card</p>
                      {profile.aadhaar_card_url ? (
                        <a
                          href={profile.aadhaar_card_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-red-600 hover:underline"
                        >
                          View Document
                        </a>
                      ) : (
                        <p className="text-sm text-gray-400">Not uploaded</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Experience Letter</p>
                      {profile.experience_letter_url ? (
                        <a
                          href={profile.experience_letter_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-red-600 hover:underline"
                        >
                          View Document
                        </a>
                      ) : (
                        <p className="text-sm text-gray-400">Not uploaded</p>
                      )}
                    </div>
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