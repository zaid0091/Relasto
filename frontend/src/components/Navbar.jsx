import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BASE_URL } from '../services/api';
import logo from '../assets/images/logo.png';

const Navbar = ({ variant = 'default' }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const toggleExpand = (name) => {
    setExpandedItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const isLight = variant === 'light';
  const bgClass = isLight ? 'bg-white' : 'bg-[#FFF8F1]/95';
  const textClass = isLight ? 'text-gray-700' : 'text-[#1A1A1A]';

  const getProfileImage = () => {
    const profileImage = user?.profile?.profile_image;
    if (profileImage) {
      if (profileImage.startsWith('http')) return profileImage;
      return `${BASE_URL}${profileImage}`;
    }
    return null;
  };

  const profileImage = getProfileImage();

  const navItems = [
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
        { name: 'For Sale', to: '/properties?status=sale' },
        { name: 'For Rent', to: '/properties?status=rent' }
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
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] ${bgClass} backdrop-blur-md px-6 md:px-16 py-4 flex items-center justify-between ${isLight ? 'shadow-sm border-b border-gray-200' : ''}`}>
        <Link to="/" className="flex items-center gap-2 relative z-[110]">
          <img src={logo} alt="Relasto Logo" className="w-10 h-10 md:w-14 md:h-14 object-contain" />
          <span className="text-xl md:text-2xl font-bold tracking-tight text-[#F47D31]">Relasto</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-10 text-base font-semibold absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => (
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
                <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-[0_15px_40px_rgba(0,0,0,0.1)] rounded-2xl py-3 border border-gray-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-[110]">
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

        <div className="flex items-center gap-4 md:gap-8 relative z-[110]">
          <div className="hidden sm:block">
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="relative flex items-center animate-in fade-in slide-in-from-right-4 duration-300">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search properties, agents..."
                  className={`px-4 py-2 pr-10 rounded-xl border border-gray-200 outline-none focus:border-[#F47D31] transition-all w-48 md:w-64 bg-white shadow-xl text-black text-sm`}
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
                <span className="hidden xl:inline">Search</span>
              </button>
            )}
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-3 md:gap-6">
              <Link to="/dashboard" className="hidden sm:block px-6 py-2.5 rounded-xl text-sm font-bold transition-all bg-[#1A1A1A] text-white hover:bg-[#333]">
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
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-all shadow-sm"
                title="Logout"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-[#1A1A1A] text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-bold hover:bg-[#333] transition-all shadow-md text-sm md:text-base">
              Log in
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none"
          >
            <span className={`w-6 h-0.5 bg-[#1A1A1A] transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-[#1A1A1A] transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-[#1A1A1A] transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <div className={`fixed inset-0 z-[90] lg:hidden transition-all duration-500 ${isMenuOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Drawer */}
        <div className={`absolute top-0 right-0 h-full w-[80%] max-w-sm bg-white shadow-2xl transition-transform duration-500 ease-out flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-8 pt-24 overflow-y-auto flex-grow">
            <div className="mb-8 block sm:hidden">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search properties, agents..."
                  className="w-full px-4 py-3 pr-10 rounded-xl bg-gray-50 border border-transparent focus:border-[#F47D31] outline-none transition-all text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                  </svg>
                </button>
              </form>
            </div>

            <div className="space-y-4">
              {navItems.map((item) => (
                <div key={item.name} className="border-b border-gray-50 pb-4">
                  <div className="flex items-center justify-between">
                    <Link
                      to={item.to}
                      className="text-lg font-bold text-[#1A1A1A] hover:text-[#F47D31]"
                      onClick={() => !item.subLinks && setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                    {item.subLinks && (
                      <button
                        onClick={() => toggleExpand(item.name)}
                        className={`p-2 transition-transform duration-300 ${expandedItems[item.name] ? 'rotate-180' : ''}`}
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {item.subLinks && expandedItems[item.name] && (
                    <div className="mt-4 ml-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
                      {item.subLinks.map((sub) => (
                        <Link
                          key={sub.name}
                          to={sub.to}
                          className="block text-gray-500 font-medium hover:text-[#F47D31]"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link
                to="/dashboard"
                className="block text-lg font-bold text-[#1A1A1A] border-b border-gray-50 pb-4"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            </div>
          </div>

          <div className="p-8 border-t border-gray-50 space-y-4">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full bg-red-50 text-red-500 py-3 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="block w-full bg-[#1A1A1A] text-white py-4 rounded-xl font-bold text-center hover:bg-[#333] transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;

