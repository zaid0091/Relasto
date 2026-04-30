import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#FFF8F1] font-['Inter'] text-[#1A1A1A]">
      <Navbar />

      <main className="pt-32 pb-20 px-6 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="text-center max-w-2xl mx-auto">

          <h1 className="text-[150px] md:text-[200px] font-black text-[#F47D31]/20 leading-none mb-4">
            404
          </h1>


          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Oops! Page Not Found
          </h2>


          <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track!
          </p>


          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="px-10 py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold text-lg hover:bg-[#333] transition-all shadow-xl"
            >
              Go Home
            </Link>
            <Link
              to="/properties"
              className="px-10 py-4 bg-white border-2 border-gray-200 text-[#1A1A1A] rounded-2xl font-bold text-lg hover:border-[#F47D31] hover:text-[#F47D31] transition-all"
            >
              Browse Properties
            </Link>
          </div>


          <div className="mt-16 pt-10 border-t border-gray-200">
            <p className="text-gray-400 font-bold mb-6">QUICK LINKS</p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link to="/properties" className="text-gray-600 font-bold hover:text-[#F47D31] transition-colors">
                Properties
              </Link>
              <Link to="/agents" className="text-gray-600 font-bold hover:text-[#F47D31] transition-colors">
                Agents
              </Link>
              <Link to="/about" className="text-gray-600 font-bold hover:text-[#F47D31] transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-gray-600 font-bold hover:text-[#F47D31] transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFoundPage;