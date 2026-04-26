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
      

      <main className="max-w-7xl mx-auto mt-10 px-6 md:px-16 py-16">
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
            className="w-full md:w-auto h-14 px-10 bg-[#1A1A1A] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#F47D31] transition-all group shadow-lg shadow-black/5"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {agents.map((agent) => (
              <div key={agent.id} className="w-70 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 group border border-gray-200">
                <div className="relative rounded-t-2xl aspect-square overflow-hidden mb-8">
                  <img
                    src={agent.profile_image || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80"}
                    alt={agent.user?.username}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="pb-2">
                  <h3 className="text-2xl pl-6 font-bold text-[#1A1A1A] mb-4 tracking-tight">
                    {agent.user?.first_name ? `${agent.user.first_name} ${agent.user.last_name}` : agent.user?.username}
                  </h3>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="flex gap-1 pl-6">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill={i < Math.floor(agent.average_rating || 4) ? "#1A1A1A" : "none"} stroke={i < Math.floor(agent.average_rating || 4) ? "#1A1A1A" : "#D1D5DB"} strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-lg font-medium text-[#1A1A1A]">{agent.average_rating || '4.5'} review</span>
                  </div>
                  <Link
                    to={`/agents/${agent.id}`}
                    className="w-55 ml-5 mr-4 h-14 border border-gray-200 bg-white text-[#1A1A1A] rounded-2xl font-medium text-lg flex items-center justify-center hover:bg-gray-50 transition-all"
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
    </div>
  );
};

export default AgentsPage;