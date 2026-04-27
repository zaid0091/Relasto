import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="px-6 md:px-16 pt-20 pb-12 border-t border-gray-100 bg-[#FFF8F1]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-[#F47D31] rounded-full flex items-center justify-center shadow-lg shadow-orange-200">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Relasto</span>
            </Link>
            <p className="text-gray-500 mb-8 max-w-sm text-lg leading-relaxed">
              59 Beverly Hill Ave, Brooklyn Town, <br /> NYC, NY 5630, US
            </p>
            <div className="flex gap-4">
              {[
                { name: 'FB', icon: <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.324V1.325C24 .597 23.403 0 22.675 0z"/></svg> },
                { name: 'TW', icon: <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg> },
                { name: 'IG', icon: <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
                { name: 'LN', icon: <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                { name: 'YT', icon: <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 00-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 002.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> }
              ].map((social) => (
                <div key={social.name} className="w-10 h-10 rounded-full border border-[#E5E5E5] bg-white flex items-center justify-center text-[#666] hover:border-[#F47D31] hover:text-[#F47D31] hover:bg-orange-50 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300">
                  {social.icon}
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 col-span-1 md:col-span-2 lg:col-span-3 gap-12">
            <div>
              <h4 className="font-bold text-lg mb-8 text-[#1A1A1A]">Listing</h4>
              <ul className="space-y-4 text-gray-500 font-medium">
                <li><Link to="/properties" className="hover:text-[#F47D31] transition-colors">Property for Sale</Link></li>
                <li><Link to="/properties" className="hover:text-[#F47D31] transition-colors">Property for Rent</Link></li>
                <li><Link to="/properties" className="hover:text-[#F47D31] transition-colors">Villa for Sale</Link></li>
                <li><Link to="/properties" className="hover:text-[#F47D31] transition-colors">Office for Sale</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-8 text-[#1A1A1A]">Support</h4>
              <ul className="space-y-4 text-gray-500 font-medium">
                <li><Link to="/about" className="hover:text-[#F47D31] transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-[#F47D31] transition-colors">Contact Us</Link></li>
                <li><Link to="/about" className="hover:text-[#F47D31] transition-colors">Help Center</Link></li>
                <li><Link to="/about" className="hover:text-[#F47D31] transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            
            <div className="col-span-2 lg:col-span-1">
              <h4 className="font-bold text-lg mb-8 text-[#1A1A1A]">Others</h4>
              <ul className="space-y-4 text-gray-500 font-medium">
                <li><Link to="/login" className="hover:text-[#F47D31] transition-colors">Log In</Link></li>
                <li><Link to="/register" className="hover:text-[#F47D31] transition-colors">Sign Up</Link></li>
                <li><Link to="/dashboard" className="hover:text-[#F47D31] transition-colors">Dashboard</Link></li>
                <li><Link to="/agents" className="hover:text-[#F47D31] transition-colors">Agents</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="text-center text-gray-400 text-sm font-medium border-t border-gray-100 pt-10">
          © {new Date().getFullYear()} Relasto. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
