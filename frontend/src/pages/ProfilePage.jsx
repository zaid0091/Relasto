import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, profilesAPI } from '../services/api';

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
      // Update user info
      const userResponse = await authAPI.updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
      });
      console.log('User updated:', userResponse.data);

      // Update profile info (phone, bio)
      if (formData.phone || formData.bio) {
        try {
          const profileResponse = await profilesAPI.updateProfile({
            phone: formData.phone,
            bio: formData.bio,
          });
          console.log('Profile updated:', profileResponse.data);
        } catch (profileErr) {
          console.error('Profile update error:', profileErr);
        }
      }

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
      setError(errorMsg);
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