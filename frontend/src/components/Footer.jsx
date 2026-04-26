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
              {['FB', 'TW', 'IG', 'LN', 'YT'].map((sc) => (
                <div key={sc} className="w-10 h-10 rounded-full border-2 border-gray-100 flex items-center justify-center text-xs font-bold text-gray-400 hover:border-[#F47D31] hover:text-[#F47D31] hover:bg-orange-50 cursor-pointer transition-all duration-300">
                  {sc}
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
