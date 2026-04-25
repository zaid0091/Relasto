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

      <main className="pt-32 pb-20 px-6 md:px-16 max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-10">Find Property</h1>

        {/* Filter Bar */}
        <div className="bg-white p-2 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-2 mb-6">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 min-w-62.5">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Enter your address"
              className="bg-transparent outline-none flex-1 text-sm"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              className="px-6 py-3 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium outline-none appearance-none cursor-pointer"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Buy/Rent</option>
              <option value="for_sale">Buy</option>
              <option value="for_rent">Rent</option>
            </select>

            <select
              className="px-6 py-3 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium outline-none appearance-none cursor-pointer"
              value={filters.price_min}
              onChange={(e) => setFilters({ ...filters, price_min: e.target.value })}
            >
              <option value="">Price Range</option>
              <option value="100000">$100,000+</option>
              <option value="500000">$500,000+</option>
              <option value="1000000">$1,000,000+</option>
            </select>

            <select
              className="px-6 py-3 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium outline-none appearance-none cursor-pointer"
              value={filters.bedrooms}
              onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
            >
              <option value="">Bedrooms</option>
              <option value="1">1+ Bed</option>
              <option value="2">2+ Bed</option>
              <option value="3">3+ Bed</option>
              <option value="4">4+ Bed</option>
            </select>

            <button className="px-6 py-3 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium hover:bg-gray-100">
              More +
            </button>

            <button
              onClick={handleSearch}
              className="bg-[#1A1A1A] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#333] transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              Search
            </button>
          </div>
        </div>

        {/* Active Filter Tags */}
        <div className="flex flex-wrap gap-3 mb-10">
          {filters.bedrooms && (
            <div className="bg-white border border-gray-200 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
              Bedroom: {filters.bedrooms} <button onClick={() => setFilters({ ...filters, bedrooms: '' })} className="text-gray-400 hover:text-black">×</button>
            </div>
          )}
          {filters.property_type && (
            <div className="bg-white border border-gray-200 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
              Type: {filters.property_type} <button onClick={() => setFilters({ ...filters, property_type: '' })} className="text-gray-400 hover:text-black">×</button>
            </div>
          )}
          {filters.status && (
            <div className="bg-white border border-gray-200 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
              Status: {filters.status === 'for_sale' ? 'Buy' : 'Rent'} <button onClick={() => setFilters({ ...filters, status: '' })} className="text-gray-400 hover:text-black">×</button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Map Section */}
          <div className="w-full lg:w-87.5 shrink-0">
            <div className="bg-white rounded-[40px] overflow-hidden shadow-sm h-150 relative">
              <img
                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1000"
                className="w-full h-full object-cover grayscale opacity-60"
                alt="Map Background"
              />
              <div className="absolute inset-0 p-8 flex flex-col justify-center">
                {/* Simulated Pins */}
                <div className="absolute top-1/4 left-1/3 w-8 h-8 bg-[#F47D31] rounded-full border-4 border-white shadow-xl animate-bounce"></div>
                <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-[#F47D31] rounded-full border-2 border-white shadow-lg opacity-80"></div>
                <div className="absolute top-2/3 left-1/4 w-6 h-6 bg-[#F47D31] rounded-full border-2 border-white shadow-lg opacity-80"></div>

                {/* Featured Pin Info */}
                <div className="bg-white p-6 rounded-3xl shadow-2xl relative mt-auto border border-gray-100">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#F47D31] mb-2 uppercase tracking-widest">
                    📍 Premium Listing
                  </div>
                  <h4 className="font-bold text-sm mb-3">{properties[0]?.title || 'Property Title'}</h4>
                  <div className="grid grid-cols-2 gap-3 text-[10px] text-gray-400 font-bold mb-4">
                    <div className="flex items-center gap-2">🛏️ {properties[0]?.attributes?.bedrooms || '-'} Bed</div>
                    <div className="flex items-center gap-2">🚿 {properties[0]?.attributes?.bathrooms || '-'} Bath</div>
                    <div className="flex items-center gap-2">📐 {properties[0]?.attributes?.square_feet || '-'} sqft</div>
                    <div className="flex items-center gap-2">🏠 {properties[0]?.property_type || '-'}</div>
                  </div>
                  <div className="text-lg font-black">${Number(properties[0]?.price || 0).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Property Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-100 h-112.5 rounded-[40px]"></div>
                ))}
              </div>
            ) : properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {properties.map((prop) => (
                  <div key={prop.id} className="bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all group">
                    <div className="relative h-60 overflow-hidden">
                      <img
                        src={prop.primary_image?.image_url || prop.primary_image?.image || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2070'}
                        alt={prop.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                        {prop.status === 'for_sale' ? 'For Sale' : 'For Rent'}
                      </div>
                    </div>
                    <div className="p-8">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">📍</div>
                        <h3 className="font-bold text-lg leading-tight line-clamp-1">{prop.title}</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-8 text-gray-400 text-[11px] font-bold">
                        <div className="flex items-center gap-2">🛏️ {prop.attributes?.bedrooms || '-'} Bed</div>
                        <div className="flex items-center gap-2">🚿 {prop.attributes?.bathrooms || '-'} Bath</div>
                        <div className="flex items-center gap-2">📐 {prop.attributes?.square_feet || '-'} sqft</div>
                        <div className="flex items-center gap-2">🏠 {prop.property_type}</div>
                      </div>
                      <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                        <Link to={`/properties/${prop.slug}`} className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#333] transition-all">
                          View Details
                        </Link>
                        <span className="text-xl font-bold">${Number(prop.price).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-bold mb-2">No properties found</h3>
                <p className="text-gray-400">Try adjusting your filters to find what you're looking for.</p>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="mt-16 flex items-center justify-between">
                <div className="flex gap-2">
                  {[...Array(pagination.total_pages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${pagination.current_page === i + 1
                          ? 'bg-[#1A1A1A] text-white shadow-lg'
                          : 'bg-white text-gray-400 hover:bg-gray-100 border border-gray-100'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                {pagination.current_page < pagination.total_pages && (
                  <button
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    className="flex items-center gap-2 bg-white px-6 py-2.5 rounded-xl font-bold text-sm border border-gray-100 hover:bg-gray-100 transition-all"
                  >
                    Next Page
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 md:px-16 py-20 border-t border-gray-100 bg-white/50">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-20 max-w-7xl mx-auto">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-[#F47D31] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight">Relasto</span>
            </Link>
            <p className="text-gray-400 mb-8 max-w-sm">
              59 Bervely Hill Ave, Brooklyn Town, <br /> NYC, NY 5630, US
            </p>
            <div className="flex gap-4">
              {['FB', 'TW', 'IG', 'LN', 'YT'].map((sc) => (
                <div key={sc} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400 hover:border-[#F47D31] hover:text-[#F47D31] cursor-pointer transition-all">
                  {sc}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-wider">Features</h4>
            <ul className="space-y-4 text-gray-400 text-sm font-medium">
              <li><Link to="/properties" className="hover:text-[#F47D31]">Property</Link></li>
              <li><Link to="/properties" className="hover:text-[#F47D31]">Financing</Link></li>
              <li><Link to="/properties" className="hover:text-[#F47D31]">Process</Link></li>
              <li><Link to="/contact" className="hover:text-[#F47D31]">Contact</Link></li>
              <li><Link to="/about" className="hover:text-[#F47D31]">Review</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-wider">Information</h4>
            <ul className="space-y-4 text-gray-400 text-sm font-medium">
              <li><Link to="/about" className="hover:text-[#F47D31]">Listing</Link></li>
              <li><Link to="/properties" className="hover:text-[#F47D31]">Managed</Link></li>
              <li><Link to="/properties" className="hover:text-[#F47D31]">Property Details</Link></li>
              <li><Link to="/agents" className="hover:text-[#F47D31]">Agent List</Link></li>
              <li><Link to="/profile" className="hover:text-[#F47D31]">Agent Profile</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-wider">Documentation</h4>
            <ul className="space-y-4 text-gray-400 text-sm font-medium">
              <li><Link to="/about" className="hover:text-[#F47D31]">Blog</Link></li>
              <li><Link to="/about" className="hover:text-[#F47D31]">FAQ</Link></li>
              <li><Link to="/about" className="hover:text-[#F47D31]">Privacy Policy</Link></li>
              <li><Link to="/about" className="hover:text-[#F47D31]">License</Link></li>
            </ul>
          </div>
        </div>
        <div className="text-center text-gray-400 text-xs font-bold border-t border-gray-100 pt-10">
          © 2026. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
};

export default PropertiesPage;
