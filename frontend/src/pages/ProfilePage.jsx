import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, profilesAPI, BASE_URL } from '../services/api';
import Navbar from '../components/Navbar';

const ProfilePage = () => {
  const { user, dispatch } = useAuth();
  const [loading, setLoading] = useState(false);
  const [localUser, setLocalUser] = useState(user);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
    city: '',
    state: '',
    address: '',
    experience: '',
    property_types: '',
    area: '',
    license_no: '',
    profile_image: null,
  });

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const profileResponse = await profilesAPI.getMyProfile();
        const profileData = profileResponse.data?.data?.profile || profileResponse.data?.profile;
        if (profileData) {
          setFormData({
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            phone: profileData.phone || '',
            bio: profileData.bio || '',
            city: profileData.city || '',
            state: profileData.state || '',
            address: profileData.address || '',
            experience: profileData.experience || '',
            property_types: profileData.property_types || '',
            area: profileData.area || '',
            license_no: profileData.license_no || '',
            profile_imagePreview: profileData.profile_image || null,
          });
          setLocalUser({ ...user, profile: profileData });
        }
      } catch (e) {
        // Fallback to user data
        if (user) {
          setFormData({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            phone: user.profile?.phone || '',
            bio: user.profile?.bio || '',
            city: user.profile?.city || '',
            state: user.profile?.state || '',
            address: user.profile?.address || '',
            experience: user.profile?.experience || '',
            property_types: user.profile?.property_types || '',
            area: user.profile?.area || '',
            license_no: user.profile?.license_no || '',
          });
        }
      }
    };

    if (user) {
      loadProfileData();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Update user info (first_name, last_name)
      if (formData.first_name || formData.last_name) {
        await authAPI.updateProfile({
          first_name: formData.first_name,
          last_name: formData.last_name,
        });
      }

      // Update profile info 
      const profilePayload = new FormData();
      profilePayload.append('phone', formData.phone);
      profilePayload.append('bio', formData.bio);
      profilePayload.append('city', formData.city);
      profilePayload.append('state', formData.state);
      profilePayload.append('address', formData.address);
      if (formData.experience) profilePayload.append('experience', parseInt(formData.experience));
      if (formData.property_types) profilePayload.append('property_types', formData.property_types);
      if (formData.area) profilePayload.append('area', formData.area);
      if (formData.license_no) profilePayload.append('license_no', formData.license_no);
      if (formData.profile_image) {
        profilePayload.append('profile_image', formData.profile_image);
      }

      await profilesAPI.updateProfile(profilePayload, true);
      console.log('Profile updated successfully');

      // Fetch latest data
      const profileResponse = await authAPI.getProfile();
      const userData = profileResponse.data?.data?.user || profileResponse.data?.data || profileResponse.data;
      const profileData = profileResponse.data?.data?.profile;

      // Also fetch the full profile to get phone and bio
      let fullProfileData = profileData;
      try {
        const fullProfileResponse = await profilesAPI.getMyProfile();
        fullProfileData = fullProfileResponse.data?.data?.profile || fullProfileResponse.data?.profile || fullProfileData;
      } catch (e) {
        console.log('Could not fetch full profile');
      }

      const updatedUser = { ...userData, profile: fullProfileData };
      dispatch({ type: 'LOAD_USER_SUCCESS', payload: { user: updatedUser } });

      setLocalUser(updatedUser);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Profile update error:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to update profile';
      setError(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const userData = localUser || user;
  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF9F6]">
      <Navbar />
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-20">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">My Profile</h1>
          <p className="text-[#666] text-lg">Manage your account settings and professional profile information.</p>
        </div>

        <div className="bg-white rounded-[15px] border border-orange-200 shadow-sm p-6 md:p-10 lg:p-12">
          {success && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span className="font-medium">Profile updated successfully!</span>
            </div>
          )}

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
         
            <div className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b border-gray-100">
              <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-orange-50 overflow-hidden border-4 border-white shadow-md flex items-center justify-center transition-transform group-hover:scale-105">
                  {(formData.profile_imagePreview || userData?.profile?.profile_image) ? (
                    <img 
                      src={formData.profile_imagePreview || (userData?.profile?.profile_image ? (userData.profile.profile_image.startsWith('http') ? userData.profile.profile_image : `${BASE_URL}${userData.profile.profile_image}`) : null)} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl text-orange-200">👤</span>
                  )}
                </div>
                <label className="absolute bottom-1 right-1 bg-[#F47D31] text-white p-2.5 rounded-full shadow-lg cursor-pointer hover:bg-[#e06d25] transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormData({ ...formData, profile_image: file, profile_imagePreview: URL.createObjectURL(file) });
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-[#1A1A1A]">Profile Photo</h3>
                <p className="text-[#666] mt-1 mb-4">Click the icon to upload a new image. JPG, PNG or GIF.</p>
                {formData.profile_image && (
                  <span className="inline-block bg-orange-50 text-[#F47D31] px-3 py-1 rounded-full text-xs font-bold">
                    Selected: {formData.profile_image.name}
                  </span>
                )}
              </div>
            </div>

   
            <div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#F47D31] rounded-full" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1A1A1A]">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-[#E5E5E5] focus:border-[#F47D31] focus:ring-0 outline-none transition-all placeholder:text-[#999]"
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1A1A1A]">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-[#E5E5E5] focus:border-[#F47D31] focus:ring-0 outline-none transition-all placeholder:text-[#999]"
                    placeholder="Enter last name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1A1A1A]">Email Address</label>
                  <input
                    type="email"
                    value={localUser?.email || user?.email || ''}
                    disabled
                    className="w-full px-5 py-3 rounded-xl border border-[#F0F0F0] bg-[#F9F9F9] text-[#999] cursor-not-allowed"
                  />
                  <p className="text-xs text-[#999] pl-1 italic">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1A1A1A]">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-[#E5E5E5] focus:border-[#F47D31] focus:ring-0 outline-none transition-all placeholder:text-[#999]"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-[#1A1A1A]">Professional Bio</label>
              <textarea
                name="bio"
                rows={5}
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-xl border border-[#E5E5E5] focus:border-[#F47D31] focus:ring-0 outline-none transition-all placeholder:text-[#999] resize-none"
                placeholder="Tell us about your background, expertise and what you can offer to clients..."
              />
            </div>

            {(localUser?.profile?.is_agent || user?.profile?.is_agent) && (
              <div className="pt-6">
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-8 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-[#F47D31] rounded-full" />
                  Agent Professional Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1A1A1A]">Years of Experience</label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="w-full px-5 py-3 rounded-xl border border-[#E5E5E5] focus:border-[#F47D31] focus:ring-0 outline-none transition-all"
                      placeholder="e.g., 5"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1A1A1A]">License Number</label>
                    <input
                      type="text"
                      name="license_no"
                      value={formData.license_no}
                      onChange={handleChange}
                      className="w-full px-5 py-3 rounded-xl border border-[#E5E5E5] focus:border-[#F47D31] focus:ring-0 outline-none transition-all"
                      placeholder="e.g., RE-12345"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1A1A1A]">Property Types</label>
                    <input
                      type="text"
                      name="property_types"
                      value={formData.property_types}
                      onChange={handleChange}
                      className="w-full px-5 py-3 rounded-xl border border-[#E5E5E5] focus:border-[#F47D31] focus:ring-0 outline-none transition-all"
                      placeholder="e.g., Residential, Commercial"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1A1A1A]">Service Area</label>
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      className="w-full px-5 py-3 rounded-xl border border-[#E5E5E5] focus:border-[#F47D31] focus:ring-0 outline-none transition-all"
                      placeholder="e.g., Downtown, Suburbs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1A1A1A]">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-5 py-3 rounded-xl border border-[#E5E5E5] focus:border-[#F47D31] focus:ring-0 outline-none transition-all"
                      placeholder="e.g., New York"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1A1A1A]">State / Province</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-5 py-3 rounded-xl border border-[#E5E5E5] focus:border-[#F47D31] focus:ring-0 outline-none transition-all"
                      placeholder="e.g., NY"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-[#1A1A1A]">Full Office Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-5 py-3 rounded-xl border border-[#E5E5E5] focus:border-[#F47D31] focus:ring-0 outline-none transition-all"
                      placeholder="Enter full address"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-10 flex justify-end border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-12 py-4 bg-[#F47D31] text-white rounded-xl font-bold hover:bg-[#e06d25] transition-all shadow-lg shadow-orange-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

};

export default ProfilePage;