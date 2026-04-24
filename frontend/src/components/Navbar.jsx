import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BASE_URL } from '../services/api';

const Navbar = ({ variant = 'default' }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isLight = variant === 'light';
  const bgClass = isLight ? 'bg-white' : 'bg-[#FFF8F1]/80';
  const textClass = isLight ? 'text-gray-700 hover:text-[#F47D31]' : 'text-[#1A1A1A]';

  const getProfileImage = () => {
    const profileImage = user?.profile?.profile_image;
    if (profileImage) {
      if (profileImage.startsWith('http')) return profileImage;
      return `${BASE_URL}${profileImage}`;
    }
    return null;
  };

  const profileImage = getProfileImage();

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${bgClass} backdrop-blur-md px-6 md:px-16 py-4 flex items-center justify-between ${isLight ? 'shadow-sm border-b border-gray-200' : ''}`}>
      <div className="flex items-center gap-12">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F47D31] rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className={`text-xl font-bold tracking-tight ${textClass}`}>Relasto</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/" className={textClass}>Home</Link>
          <Link to="/properties" className={textClass}>Listing</Link>
          <Link to="/agents" className={textClass}>Agents</Link>
          <Link to="/about" className={textClass}>About</Link>
          <Link to="/contact" className={textClass}>Contact</Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className={`hidden md:block px-5 py-2 rounded-full text-sm font-medium transition-all ${isLight ? 'bg-[#F47D31] text-white hover:bg-[#e06d25]' : 'bg-[#1A1A1A] text-white hover:bg-[#333]'}`}>
              Dashboard
            </Link>
            <Link to="/profile" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#F47D31] flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.first_name ? (
                    <span className="text-white font-bold text-sm">
                      {user.first_name[0].toUpperCase()}{user.last_name?.[0]?.toUpperCase() || ''}
                    </span>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )
                )}
              </div>
            </Link>
            <button onClick={handleLogout} className="text-sm font-medium text-red-500 hover:text-red-600">Logout</button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/contact" className={`hidden md:block text-sm font-medium ${textClass}`}>Contact</Link>
            <Link to="/login" className={`text-sm font-medium ${textClass}`}>Login</Link>
            <Link to="/register" className={`px-6 py-2 rounded-full text-sm font-medium transition-all shadow-lg ${isLight ? 'bg-[#1A1A1A] text-white hover:bg-[#333]' : 'bg-[#1A1A1A] text-white hover:bg-[#333]'}`}>
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;