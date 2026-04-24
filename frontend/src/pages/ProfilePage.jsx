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
    <div className="min-h-screen bg-gray-50 py-8">
      <Navbar/>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

        <div className="bg-white rounded-lg shadow p-6">
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
              Profile updated successfully!
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-6 flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                {(formData.profile_imagePreview || userData?.profile?.profile_image) ? (
                  <img 
                    src={formData.profile_imagePreview || (userData?.profile?.profile_image ? (userData.profile.profile_image.startsWith('http') ? userData.profile.profile_image : `${BASE_URL}${userData.profile.profile_image}`) : null)} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl text-gray-400">👤</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFormData({ ...formData, profile_image: file, profile_imagePreview: URL.createObjectURL(file) });
                    }
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#F47D31] file:text-white hover:file:bg-[#e06d25]"
                />
                {formData.profile_image && (
                  <p className="mt-1 text-xs text-gray-500">Selected: {formData.profile_image.name}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={localUser?.email || user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Agent Fields - Only show for agents */}
            {(localUser?.profile?.is_agent || user?.profile?.is_agent) && (
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Agent Information</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 5"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License No.
                    </label>
                    <input
                      type="text"
                      name="license_no"
                      value={formData.license_no}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., RE-12345"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Types
                    </label>
                    <input
                      type="text"
                      name="property_types"
                      value={formData.property_types}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Residential, Commercial"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Area
                    </label>
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Downtown, Suburbs"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., New York"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., NY"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Full address"
                    />
                  </div>
                </div>
              </div>
            )}


            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;