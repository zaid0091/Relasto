import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BASE_URL } from '../services/api';
import logo from '../assets/images/logo.png';

const Navbar = ({ variant = 'default' }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/properties?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
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
      <Link to="/" className="flex items-center gap-2">
        <img src={logo} alt="Relasto Logo" className="w-14 h-14 object-contain" />
        <span className="text-2xl font-bold tracking-tight text-[#F47D31]">Relasto</span>
      </Link>

      <div className="hidden md:flex items-center gap-10 text-base font-semibold absolute left-1/2 -translate-x-1/2">
        {[
          { 
            name: 'Home', 
            to: '/', 
            subLinks: [
              { name: 'Hero Section', to: '/#hero' },
              { name: 'Our Features', to: '/#features' },
              { name: 'Property Stats', to: '/#stats' },
              { name: 'Popular Properties', to: '/#properties' },
              { name: 'Client Stories', to: '/#testimonials' }
            ]
          },
          { 
            name: 'Listing', 
            to: '/properties',
            subLinks: [
              { name: 'All Properties', to: '/properties' },
              { name: 'For Sale', to: '/properties?status=for_sale' },
              { name: 'For Rent', to: '/properties?status=for_rent' }
            ]
          },
          { 
            name: 'Agents', 
            to: '/agents',
            subLinks: [
              { name: 'All Agents', to: '/agents' },
              { name: 'Find Agent', to: '/agents' }
            ]
          },
          { name: 'Property', to: '/properties' },
          { name: 'Blog', to: '/blog' }
        ].map((item) => (
          <div key={item.name} className="relative group py-2">
            <Link to={item.to} className={`flex items-center gap-1 hover:text-[#F47D31] transition-colors ${textClass}`}>
              {item.name}
              {item.subLinks && (
                <svg className="w-4 h-4 mt-0.5 opacity-60 group-hover:rotate-180 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              )}
            </Link>
            
            {item.subLinks && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-[0_15px_40px_rgba(0,0,0,0.1)] rounded-2xl py-3 border border-gray-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-[60]">
                {item.subLinks.map((sub) => (
                  <Link 
                    key={sub.name} 
                    to={sub.to} 
                    className="block px-6 py-2.5 text-sm text-gray-600 hover:text-[#F47D31] hover:bg-[#FFF8F1] transition-all"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-8">
        {isSearchOpen ? (
          <form onSubmit={handleSearch} className="relative flex items-center animate-in fade-in slide-in-from-right-4 duration-300">
            <input
              autoFocus
              type="text"
              placeholder="Search properties..."
              className={`px-4 py-2 pr-10 rounded-xl border border-gray-200 outline-none focus:border-[#F47D31] transition-all w-64 ${isLight ? 'bg-white shadow-lg' : 'bg-white shadow-xl'} text-black text-sm`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => !searchQuery && setIsSearchOpen(false)}
            />
            <button 
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="absolute right-3 text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </form>
        ) : (
          <button 
            onClick={() => setIsSearchOpen(true)}
            className={`flex items-center gap-2 font-bold hover:text-[#F47D31] transition-colors ${textClass}`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            Search
          </button>
        )}

        {isAuthenticated ? (
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className={`hidden md:block px-6 py-2.5 rounded-xl text-sm font-bold transition-all bg-[#1A1A1A] text-white hover:bg-[#333]`}>
              Dashboard
            </Link>
            <Link to="/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#F47D31] hover:scale-105 transition-transform flex items-center justify-center bg-[#F47D31]">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-sm">
                  {user?.first_name ? user.first_name[0].toUpperCase() : user?.username?.[0].toUpperCase()}
                </span>
              )}
            </Link>
            <button onClick={handleLogout} className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors">
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="bg-[#1A1A1A] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#333] transition-all shadow-md">
            Log in
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;