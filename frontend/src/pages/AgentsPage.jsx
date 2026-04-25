import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { profilesAPI } from '../services/api';
import Navbar from '../components/Navbar';

const AgentsPage = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
  });
  const navigate = useNavigate();

  const fetchAgents = async (currentFilters = filters, page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        page_size: 12,
        ...currentFilters,
      };

      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await profilesAPI.searchAgents(params);
      setAgents(response.data.data.agents || response.data.data.results || []);
      setPagination(response.data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAgents(filters, 1);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F1] font-['Inter']">
      {/* Navigation */}
      <Navbar/>
      {/* <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-[#F47D31]/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-[#F47D31] rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="text-2xl font-black text-[#1A1A1A] tracking-tight">Relasto</span>
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            {['Home', 'Listing', 'Agents', 'Property', 'Blog'].map((item) => (
              <Link
                key={item}
                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                className={`text-sm font-bold transition-colors ${item === 'Agents' ? 'text-[#F47D31]' : 'text-gray-600 hover:text-[#F47D31]'}`}
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
            </button>
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-[#1A1A1A] text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-[#F47D31] transition-all"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="bg-[#1A1A1A] text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-[#F47D31] transition-all shadow-lg shadow-black/10"
              >
                Log in
              </button>
            )}
          </div>
        </div>
      </nav> */}

      <main className="max-w-7xl mx-auto mt-10 px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-black text-[#1A1A1A] mb-12 tracking-tight">
          Some Nearby Good Agents
        </h1>

        {/* Filter Section */}
        <div className="bg-white p-4 rounded-4xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-16">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Enter your address"
              className="w-full h-14 pl-6 pr-12 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#F47D31] font-medium text-gray-700 placeholder:text-gray-400"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            </div>
          </div>

          <div className="w-full md:w-48 relative">
            <select className="w-full h-14 pl-6 pr-12 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#F47D31] font-bold text-gray-700 appearance-none">
              <option>Review</option>
              <option>Highest Rated</option>
              <option>Most Reviews</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5"><path d="m6 9 6 6 6-6" /></svg>
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="h-14 px-10 bg-[#1A1A1A] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#F47D31] transition-all group shadow-lg shadow-black/5"
          >
            <span>Search</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="group-hover:scale-110 transition-transform">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        </div>

        {/* Agents Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-16 h-16 border-4 border-[#F47D31]/20 border-t-[#F47D31] rounded-full animate-spin"></div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Finding the best agents...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-8 rounded-3xl text-center border border-red-100">
            <p className="text-red-600 font-bold mb-4">{error}</p>
            <button
              onClick={() => fetchAgents()}
              className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-white p-4 rounded-[40px] shadow-sm hover:shadow-2xl transition-all duration-500 group border border-transparent hover:border-gray-100">
                <div className="relative aspect-4/5 overflow-hidden rounded-4xl mb-6">
                  <img
                    src={agent.profile_image || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80"}
                    alt={agent.user?.username}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="px-2 pb-2">
                  <h3 className="text-xl font-black text-[#1A1A1A] mb-2 tracking-tight group-hover:text-[#F47D31] transition-colors">
                    {agent.user?.first_name ? `${agent.user.first_name} ${agent.user.last_name}` : agent.user?.username}
                  </h3>
                  <div className="flex items-center gap-1.5 mb-6">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < Math.floor(agent.average_rating || 0) ? "#F47D31" : "none"} stroke={i < Math.floor(agent.average_rating || 0) ? "#F47D31" : "#E5E7EB"} strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-bold text-gray-500">{agent.review_count || 0} reviews</span>
                  </div>
                  <Link
                    to={`/agents/${agent.id}`}
                    className="w-full h-12 border-2 border-gray-50 bg-white text-[#1A1A1A] rounded-2xl font-black text-sm flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] transition-all"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="mt-20 flex items-center justify-between">
            <div className="flex gap-3">
              {[...Array(Math.min(5, pagination.total_pages))].map((_, i) => (
                <button
                  key={i}
                  onClick={() => fetchAgents(filters, i + 1)}
                  className={`w-12 h-12 rounded-2xl font-black text-sm transition-all border-2 ${pagination.page === i + 1
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                    : 'bg-white text-gray-400 border-gray-50 hover:border-gray-200'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => fetchAgents(filters, pagination.page + 1)}
              disabled={!pagination.has_next}
              className="h-14 px-8 bg-white border-2 border-gray-50 rounded-2xl text-[#1A1A1A] font-black text-sm flex items-center gap-3 hover:border-gray-200 disabled:opacity-50 transition-all shadow-sm"
            >
              <span>Next Page</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white pt-24 pb-12 mt-20 border-t border-[#F47D31]/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 bg-[#F47D31] rounded-xl flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <span className="text-2xl font-black text-[#1A1A1A] tracking-tight">Relasto</span>
              </Link>
              <p className="text-gray-500 font-medium mb-8 max-w-sm leading-relaxed">
                59 Bervely Hill Ave, Brooklyn Town,<br />New York, NY 5630, CA, US
              </p>
              <div className="space-y-3 mb-8">
                <p className="text-[#1A1A1A] font-bold">+(123) 456-7890</p>
                <p className="text-[#1A1A1A] font-bold">info@mail.com</p>
              </div>
              <div className="flex gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-[#F47D31]/10 transition-colors cursor-pointer group">
                    <div className="w-5 h-5 bg-gray-300 group-hover:bg-[#F47D31] transition-colors rounded-sm" />
                  </div>
                ))}
              </div>
            </div>

            {[
              { title: 'Features', links: ['Home v1', 'Home v2', 'About', 'Contact', 'Search'] },
              { title: 'Information', links: ['Listing v1', 'Listing v2', 'Property Details', 'Agent List', 'Agent Profile'] },
              { title: 'Documentation', links: ['Blog', 'FAQ', 'Privacy Policy', 'License'] }
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-[#1A1A1A] font-black mb-8 uppercase tracking-widest text-xs">{col.title}</h4>
                <ul className="space-y-4">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-gray-500 hover:text-[#F47D31] font-bold text-sm transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-12 border-t border-gray-100 flex flex-col md:row items-center justify-between gap-6">
            <p className="text-gray-400 font-bold text-sm">© 2022. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AgentsPage;