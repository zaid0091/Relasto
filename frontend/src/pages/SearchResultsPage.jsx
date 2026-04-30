import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchAPI } from '../services/api';
import Navbar from '../components/Navbar';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState({
    properties: [],
    agents: [],
    total_results: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await searchAPI.universalSearch({ q: query });
        setResults(response.data.data);
      } catch (err) {
        setError('Failed to perform search. Please try again.');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F1]">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-16 h-16 border-4 border-[#F47D31]/20 border-t-[#F47D31] rounded-full animate-spin"></div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Searching...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FFF8F1]">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl text-sm font-medium">
            <span className="text-lg">⚠️</span> {error}
          </div>
        </div>
      </div>
    );
  }

  if (!query.trim()) {
    return (
      <div className="min-h-screen bg-[#FFF8F1]">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🔍</div>
            <h2 className="text-3xl font-bold mb-4 text-[#1A1A1A]">Enter a search term</h2>
            <p className="text-gray-400">Search for properties, agents, locations, and more.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F1]">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-6 pt-24 pb-12">
        {/* Search Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-[#1A1A1A] mb-4">
            Search Results for "{query}"
          </h1>
          <p className="text-gray-400 font-medium">
            Found {results.total_results} results
          </p>
        </div>

        {/* Properties Section */}
        {results.properties.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-3">
              <span className="text-[#F47D31]">🏠</span>
              Properties ({results.properties.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {results.properties.map((property) => (
                <Link
                  key={property.id}
                  to={`/properties/${property.slug}`}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-200 overflow-hidden"
                >
                  <div className="aspect-video bg-gray-200 relative overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0].image}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-[#F47D31] text-white px-3 py-1 rounded-full text-xs font-bold">
                      {property.status}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#1A1A1A] mb-2 group-hover:text-[#F47D31] transition-colors">
                      {property.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {property.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-[#1A1A1A]">
                        ${property.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-400">
                        {property.city}, {property.state}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Agents Section */}
        {results.agents.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-3">
              <span className="text-[#F47D31]">👤</span>
              Agents ({results.agents.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {results.agents.map((agent) => (
                <Link
                  key={agent.id}
                  to={`/agents/${agent.id}`}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-200"
                >
                  <div className="aspect-square overflow-hidden mb-6">
                    <img
                      src={agent.profile_image || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80"}
                      alt={agent.user?.username}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="pb-4">
                    <h3 className="text-xl font-bold text-[#1A1A1A] mb-3 px-6">
                      {agent.user?.first_name ? `${agent.user.first_name} ${agent.user.last_name}` : agent.user?.username}
                    </h3>
                    <div className="flex items-center gap-2 mb-4 px-6">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < Math.floor(agent.average_rating || 4) ? "#1A1A1A" : "none"} stroke={i < Math.floor(agent.average_rating || 4) ? "#1A1A1A" : "#D1D5DB"} strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-400">
                        {agent.average_rating ? agent.average_rating.toFixed(1) : '0.0'} ({agent.review_count || 0})
                      </span>
                    </div>
                    <div className="px-6">
                      <span className="text-sm text-gray-400">
                        {agent.city}, {agent.state}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {results.properties.length === 0 && results.agents.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold mb-3 text-[#1A1A1A]">No results found</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              We couldn't find any properties or agents matching "{query}". Try different keywords or browse our listings.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchResultsPage;
