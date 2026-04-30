import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { profilesAPI } from '../services/api';
import Navbar from '../components/Navbar';

const AgentsPage = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    ordering: searchParams.get('ordering') || '-average_rating',
  });
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const fetchAgents = useCallback(async (currentFilters, page = 1, isSearchAction = false) => {
    try {
      if (isSearchAction) {
        setIsSearching(true);
      } else {
        setLoading(true);
      }
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
      setIsSearching(false);
    }
  }, []);

  // Sync URL → fetch
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1', 10);
    const urlFilters = {
      search: searchParams.get('search') || '',
      ordering: searchParams.get('ordering') || '-average_rating',
    };
    setFilters(urlFilters);
    fetchAgents(urlFilters, page);
  }, [searchParams, fetchAgents]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v && v !== '-average_rating') params.set(k, v);
    });
    params.delete('page');
    setSearchParams(params);
  };

  const clearSearch = () => {
    setFilters({ search: '', ordering: '-average_rating' });
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FFF8F1] font-['Inter']">
     
      <Navbar/>
      

      <main className="max-w-7xl mx-auto mt-10 px-6 md:px-16 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-[#1A1A1A] tracking-tight">
            Some Nearby Good Agents
          </h1>
          {pagination && (
            <p className="text-gray-400 font-medium mt-2 text-sm">
              Showing <span className="text-[#1A1A1A] font-bold">{agents.length}</span> of{' '}
              <span className="text-[#1A1A1A] font-bold">{pagination.total}</span> agents
            </p>
          )}
        </div>

      
        <div className="bg-white p-4 rounded-4xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-16">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search agents by name, location..."
              className="w-full h-14 pl-6 pr-20 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#F47D31] font-medium text-gray-700 placeholder:text-gray-400"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <div className="absolute right-12 top-1/2 -translate-y-1/2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            {filters.search && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear search"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="w-full md:w-48 relative">
            <select 
              className="w-full h-14 pl-6 pr-12 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#F47D31] font-bold text-gray-700 appearance-none"
              value={filters.ordering}
              onChange={(e) => {
                const updated = { ...filters, ordering: e.target.value };
                setFilters(updated);
                const params = new URLSearchParams(searchParams);
                params.set('ordering', e.target.value);
                params.delete('page');
                setSearchParams(params);
              }}
            >
              <option value="-average_rating">Highest Rated</option>
              <option value="-review_count">Most Reviews</option>
              <option value="average_rating">Lowest Rated</option>
              <option value="review_count">Least Reviews</option>
              <option value="-created_at">Newest</option>
              <option value="created_at">Oldest</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full md:w-auto h-14 px-10 bg-[#1A1A1A] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#F47D31] transition-all group shadow-lg shadow-black/5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <span>Search</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="group-hover:scale-110 transition-transform">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </>
            )}
          </button>
        </div>

        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-16 h-16 border-4 border-[#F47D31]/20 border-t-[#F47D31] rounded-full animate-spin"></div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Finding the best agents...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl mb-8 text-sm font-medium flex items-center gap-3">
            <span className="text-lg">⚠️</span> {error}
            <button onClick={() => fetchAgents(filters, 1)} className="ml-auto font-bold hover:underline">Retry</button>
          </div>
        ) : agents.length > 0 ? (
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
                    <span className="text-lg font-medium text-[#1A1A1A]">
                    {agent.average_rating ? agent.average_rating.toFixed(1) : '0.0'} 
                    {' '}
                    {agent.review_count === 1 ? 'review' : agent.review_count === 0 ? 'reviews' : `${agent.review_count} reviews`}
                  </span>
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
        ) : (
          <div className="text-center py-20 bg-white rounded-4xl border border-gray-100 shadow-sm px-6">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-black mb-3">No agents found</h3>
            <p className="text-gray-400 max-w-xs mx-auto text-sm font-medium leading-relaxed mb-8">
              {filters.search 
                ? `We couldn't find any agents matching "${filters.search}". Try different keywords or clear your search.`
                : "We couldn't find any agents. Please try again later."
              }
            </p>
            {filters.search && (
              <button 
                onClick={() => {
                  setFilters({ search: '', ordering: '-average_rating' });
                  setSearchParams(new URLSearchParams());
                }}
                className="text-[#F47D31] font-bold text-sm hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        
        {pagination && (
          <div className="mt-20 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Page {pagination.page} of {pagination.total_pages} &middot; {pagination.total} agents
            </p>
            <div className="flex items-center gap-2">
            
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.has_previous}
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#F47D31]/30 hover:text-[#F47D31] transition-all shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>

             
              {getPageNumbers(pagination.page, pagination.total_pages).map((p, i) =>
                p === '...' ? (
                  <span key={`dot-${i}`} className="w-8 text-center text-gray-400 text-sm font-bold">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-sm ${
                      pagination.page === p
                        ? 'bg-[#1A1A1A] text-white shadow-xl scale-110'
                        : 'bg-white text-gray-500 border border-gray-200 hover:border-[#F47D31]/30 hover:text-[#F47D31]'
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}

            
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.has_next}
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#F47D31]/30 hover:text-[#F47D31] transition-all shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  pages.push(1);
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

export default AgentsPage;