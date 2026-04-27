import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { propertiesAPI } from '../services/api';
import Navbar from '../components/Navbar';

const PropertiesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    property_type: searchParams.get('property_type') || '',
    status: searchParams.get('status') || '',
    price_min: searchParams.get('price_min') || '',
    price_max: searchParams.get('price_max') || '',
    bedrooms: searchParams.get('bedrooms') || '',
  });

  const fetchProperties = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        page_size: 8,
        ...filters,
      };

      // Clean empty params
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) delete params[key];
      });

      const response = await propertiesAPI.getProperties(params);
      setProperties(response.data.data.properties);
      setPagination(response.data.data.pagination);
    } catch (err) {
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(searchParams.get('page') || 1);
  }, [filters, searchParams]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const newParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
    });
    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page);
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F1] font-['Inter'] text-[#1A1A1A]">
      <Navbar />

      <main className="pt-32 pb-20 px-6 md:px-16 max-w-[1440px] mx-auto">
        <h1 className="text-5xl font-bold mb-10">Find Property</h1>

        {/* Filter Bar */}
        <div className="bg-white p-4 md:p-2 rounded-[32px] md:rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-3 md:gap-2 mb-10 border border-gray-100">
          <div className="w-full md:flex-1 flex items-center gap-3 px-6 md:px-4 py-4 md:py-3 bg-gray-50 rounded-2xl md:rounded-xl border border-gray-100">
            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Enter your address"
              className="bg-transparent outline-none flex-1 text-sm font-medium"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 md:flex md:flex-row items-center gap-2 w-full md:w-auto">
            <select
              className="w-full md:w-auto px-4 md:px-6 py-4 md:py-3 bg-gray-50 rounded-2xl md:rounded-xl border border-gray-100 text-sm font-medium outline-none appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Buy/Rent</option>
              <option value="for_sale">Buy</option>
              <option value="for_rent">Rent</option>
            </select>

            <select
              className="w-full md:w-auto px-4 md:px-6 py-4 md:py-3 bg-gray-50 rounded-2xl md:rounded-xl border border-gray-100 text-sm font-medium outline-none appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
              value={filters.price_min}
              onChange={(e) => setFilters({ ...filters, price_min: e.target.value })}
            >
              <option value="">Price Range</option>
              <option value="100000">$100,000+</option>
              <option value="500000">$500,000+</option>
              <option value="1000000">$1,000,000+</option>
            </select>

            <select
              className="w-full md:w-auto px-4 md:px-6 py-4 md:py-3 bg-gray-50 rounded-2xl md:rounded-xl border border-gray-100 text-sm font-medium outline-none appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
              value={filters.bedrooms}
              onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
            >
              <option value="">Bedrooms</option>
              <option value="1">1+ Bed</option>
              <option value="2">2+ Bed</option>
              <option value="3">3+ Bed</option>
              <option value="4">4+ Bed</option>
            </select>

            <button
              onClick={handleSearch}
              className="col-span-2 md:w-auto bg-[#1A1A1A] text-white px-8 py-4 md:py-3 rounded-2xl md:rounded-xl font-bold hover:bg-[#333] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              Search
            </button>
          </div>
        </div>

        {/* Active Filter Tags */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-8 md:mb-10 animate-in fade-in slide-in-from-top-2 duration-500">
          {filters.bedrooms && (
            <div className="bg-white border border-gray-200 px-3 md:px-4 py-2 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-2 shadow-sm hover:border-[#F47D31]/20 transition-all group">
              <span className="text-gray-400 font-medium">Bedroom:</span>
              <span className="text-[#1A1A1A]">{filters.bedrooms}</span>
              <button
                onClick={() => setFilters({ ...filters, bedrooms: '' })}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all ml-1"
                aria-label="Remove bedroom filter"
              >
                <span className="text-lg leading-none">×</span>
              </button>
            </div>
          )}
          {filters.property_type && (
            <div className="bg-white border border-gray-200 px-3 md:px-4 py-2 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-2 shadow-sm hover:border-[#F47D31]/20 transition-all group">
              <span className="text-gray-400 font-medium">Type:</span>
              <span className="text-[#1A1A1A]">{filters.property_type}</span>
              <button
                onClick={() => setFilters({ ...filters, property_type: '' })}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all ml-1"
                aria-label="Remove property type filter"
              >
                <span className="text-lg leading-none">×</span>
              </button>
            </div>
          )}
          {filters.status && (
            <div className="bg-white border border-gray-200 px-3 md:px-4 py-2 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-2 shadow-sm hover:border-[#F47D31]/20 transition-all group">
              <span className="text-gray-400 font-medium">Status:</span>
              <span className="text-[#1A1A1A]">{filters.status === 'for_sale' ? 'Buy' : 'Rent'}</span>
              <button
                onClick={() => setFilters({ ...filters, status: '' })}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all ml-1"
                aria-label="Remove status filter"
              >
                <span className="text-lg leading-none">×</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        {/* Map Section (Now on top) */}
        <div className="w-full mb-12">
          <div className="bg-white rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl h-[350px] md:h-[450px] relative border border-white/50 group">
            <img
              src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1000"
              className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-50 transition-opacity duration-1000"
              alt="Map Background"
            />
            <div className="absolute inset-0 p-4 md:p-8 flex flex-col">
              {/* Status Badge */}
              <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl self-start flex items-center gap-2 mb-auto transform hover:scale-105 transition-transform cursor-pointer border border-white/20">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]">Live Activity</span>
              </div>

              {/* Simulated Pins */}
              <div className="absolute top-1/4 left-1/3 w-8 h-8 bg-[#F47D31] rounded-full border-4 border-white shadow-xl animate-bounce"></div>
              <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-[#F47D31] rounded-full border-2 border-white shadow-lg opacity-80"></div>
              <div className="absolute top-2/3 left-1/4 w-6 h-6 bg-[#F47D31] rounded-full border-2 border-white shadow-lg opacity-80"></div>

              {/* Featured Pin Info */}
              <div className="bg-white p-5 md:p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative mt-auto border border-gray-50 transform group-hover:translate-y-[-4px] transition-transform duration-500 max-w-sm">
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#F47D31] mb-2 uppercase tracking-widest">
                  📍 Featured Listing
                </div>
                <h4 className="font-bold text-sm md:text-base mb-3 text-[#1A1A1A] line-clamp-1">{properties[0]?.title || 'Luxury Residence'}</h4>
                <div className="grid grid-cols-2 gap-3 text-[10px] text-gray-400 font-bold mb-5 border-b border-gray-50 pb-4">
                  <div className="flex items-center gap-2">🛏️ {properties[0]?.attributes?.bedrooms || '3'} Bed</div>
                  <div className="flex items-center gap-2">🚿 {properties[0]?.attributes?.bathrooms || '2'} Bath</div>
                  <div className="flex items-center gap-2">📐 {properties[0]?.attributes?.square_feet || '2,450'} sqft</div>
                  <div className="flex items-center gap-2">🏠 {properties[0]?.property_type || 'Villa'}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xl font-black text-[#1A1A1A]">${Number(properties[0]?.price || 850000).toLocaleString()}</div>
                  <Link to={`/properties/${properties[0]?.slug}`} className="text-[#F47D31] text-[10px] font-black uppercase tracking-widest hover:underline">
                    Details →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Property Grid */}
        <div className="w-full">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 h-96 md:h-112.5 rounded-[32px] md:rounded-[40px]"></div>
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
              {properties.map((prop) => (
                <div key={prop.id} className="bg-[#FDF8F5] rounded-[15px] overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-orange-200 w-full">
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={prop.primary_image?.image_url || prop.primary_image?.image || 'https://images.unsplash.com/photo-1600585154340-be6199f7c096?auto=format&fit=crop&q=80&w=2070'}
                      alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {/* <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold shadow-sm text-[#1A1A1A]">
                      {prop.status === 'for_sale' ? 'For Sale' : 'For Rent'}
                    </div> */}
                  </div>
                  <div className="p-8 md:p-10">
                    <div className="flex items-start gap-4 mb-8">
                      <div className="mt-1 shrink-0">
                        <svg className="w-7 h-7 text-[#1A1A1A]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-2xl leading-tight text-[#1A1A1A] line-clamp-2">{prop.title}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-y-5 gap-x-4 mb-10">
                      <div className="flex items-center gap-3 text-[#5D7285] font-semibold">
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 20V9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v11" /><path d="M2 11h20" /><path d="M2 15h20" /><path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
                        </svg>
                        <span>{prop.attributes?.bedrooms || '0'} Bed Room</span>
                      </div>
                      <div className="flex items-center gap-3 text-[#5D7285] font-semibold">
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 11V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v8" /><path d="M21 15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4h18v4z" />
                        </svg>
                        <span>{prop.attributes?.bathrooms || '0'} Bath</span>
                      </div>
                      <div className="flex items-center gap-3 text-[#5D7285] font-semibold">
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m15 3 6 6" /><path d="m9 21-6-6" /><path d="M21 3h-6" /><path d="M21 3v6" /><path d="M3 21h6" /><path d="M3 21v-6" />
                        </svg>
                        <span>{(prop.attributes?.sqft || prop.attributes?.square_feet || '1,032').toLocaleString()} sqft</span>
                      </div>
                      <div className="flex items-center gap-3 text-[#5D7285] font-semibold">
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="6" cy="6" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" />
                        </svg>
                        <span>{prop.property_type || 'Family'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Link to={`/properties/${prop.slug}`} className="bg-[#1A1A1A] text-white px-8 py-4 rounded-2xl text-base font-bold hover:bg-[#333] transition-all shadow-lg active:scale-95">
                        View Details
                      </Link>
                      <span className="text-3xl font-bold text-[#1A1A1A] tracking-tight">${Number(prop.price).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 md:py-32 bg-white rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm px-6 animate-in zoom-in duration-500">
              <div className="text-5xl md:text-7xl mb-6">🏠</div>
              <h3 className="text-xl md:text-2xl font-black mb-3 text-[#1A1A1A]">No properties found</h3>
              <p className="text-gray-400 max-w-xs mx-auto text-sm font-medium leading-relaxed">
                We couldn't find anything matching your search. Try adjusting your filters.
              </p>
              <button
                onClick={() => setFilters({ search: '', status: '', price_min: '', bedrooms: '' })}
                className="mt-8 text-[#F47D31] font-bold text-sm hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="mt-20 flex flex-col sm:flex-row items-center justify-between gap-8 pb-10">
              <div className="flex flex-wrap justify-center gap-3">
                {[...Array(pagination.total_pages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-12 h-12 rounded-2xl font-black text-sm transition-all shadow-sm ${pagination.current_page === i + 1
                      ? 'bg-[#1A1A1A] text-white shadow-xl scale-110'
                      : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100 hover:border-[#F47D31]/30 hover:text-[#F47D31]'
                      }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </button>
                ))}
              </div>
              {pagination.current_page < pagination.total_pages && (
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  className="group flex items-center gap-3 bg-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest border border-gray-100 hover:border-[#F47D31]/30 hover:text-[#F47D31] transition-all shadow-sm active:scale-95"
                >
                  Next Page
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </main>

    </div>
  );
};

export default PropertiesPage;
