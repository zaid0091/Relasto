import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { propertiesAPI } from '../services/api';
import Navbar from '../components/Navbar';

/* ───────── constants ───────── */
const PROPERTY_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'agricultural', label: 'Agricultural' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Buy / Rent' },
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
];

const PRICE_RANGES = [
  { value: '', label: 'Any Price' },
  { value: '0-100000', label: 'Under $100k' },
  { value: '100000-300000', label: '$100k – $300k' },
  { value: '300000-500000', label: '$300k – $500k' },
  { value: '500000-750000', label: '$500k – $750k' },
  { value: '750000-1000000', label: '$750k – $1M' },
  { value: '1000000+', label: '$1M+' },
];

const BEDROOM_OPTIONS = [
  { value: '', label: 'Beds' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
  { value: '5', label: '5+' },
];

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Newest' },
  { value: 'created_at', label: 'Oldest' },
  { value: 'price', label: 'Price: Low → High' },
  { value: '-price', label: 'Price: High → Low' },
  { value: 'title', label: 'A → Z' },
];

const PAGE_SIZE = 9;

/* ───────── helpers ───────── */
const parsePriceRange = (val) => {
  if (!val) return {};

  // Handle "1000000+" format
  if (val.endsWith('+')) {
    const min = val.slice(0, -1);
    return { price_min: min };
  }

  // Handle "min-max" format
  const [min, max] = val.split('-');
  const out = {};
  if (min) out.price_min = min;
  if (max) out.price_max = max;
  return out;
};

const formatPriceLabel = (val) => {
  const found = PRICE_RANGES.find((r) => r.value === val);
  return found ? found.label : val;
};

/* ───────── component ───────── */
const PropertiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  /* state */
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    property_type: searchParams.get('property_type') || '',
    status: searchParams.get('status') || '',
    price_range: searchParams.get('price_range') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    city: searchParams.get('city') || '',
    ordering: searchParams.get('ordering') || '-created_at',
  });

  /* fetch */
  const fetchProperties = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        page_size: PAGE_SIZE,
        ...(filters.search && { search: filters.search }),
        ...(filters.property_type && { property_type: filters.property_type }),
        ...(filters.status && { status: filters.status }),
        ...(filters.bedrooms && { bedrooms: filters.bedrooms }),
        ...(filters.city && { city: filters.city }),
        ...(filters.ordering && { ordering: filters.ordering }),
        ...parsePriceRange(filters.price_range),
      };

      const response = await propertiesAPI.getProperties(params);
      const data = response.data?.data || response.data;
      setProperties(data.properties || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error('Property fetch error:', err);
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /* sync URL → fetch */
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1', 10);
    fetchProperties(page);
  }, [searchParams, fetchProperties]);

  /* push filters to URL */
  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v && !(k === 'ordering' && v === '-created_at')) params.set(k, v);
    });
    params.delete('page');
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    const cleared = { search: '', property_type: '', status: '', price_range: '', bedrooms: '', city: '', ordering: '-created_at' };
    setFilters(cleared);
    setSearchParams(new URLSearchParams());
  };

  const removeFilter = (key) => {
    const updated = { ...filters, [key]: key === 'ordering' ? '-created_at' : '' };
    setFilters(updated);
    const params = new URLSearchParams(searchParams);
    params.delete(key);
    params.delete('page');
    setSearchParams(params);
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => v && !(k === 'ordering' && v === '-created_at'),
  ).length;

  const currentPage = pagination?.page || 1;

  return (
    <div className="min-h-screen bg-[#FFF8F1] font-['Inter'] text-[#1A1A1A]">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 md:px-16 max-w-360 mx-auto">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Find Property</h1>
            {pagination && (
              <p className="text-gray-400 font-medium mt-2 text-sm">
                Showing <span className="text-[#1A1A1A] font-bold">{properties.length}</span> of{' '}
                <span className="text-[#1A1A1A] font-bold">{pagination.total}</span> properties
              </p>
            )}
          </div>


          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sort</span>
            <select
              id="sort-select"
              className="px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm font-semibold outline-none cursor-pointer hover:border-[#F47D31]/40 transition-colors shadow-sm"
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
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white p-3 md:p-2.5 rounded-2xl shadow-xl flex flex-col lg:flex-row items-stretch gap-2 mb-6 border border-gray-100">

          <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input
              id="search-input"
              type="text"
              placeholder="Search by title, address, city…"
              className="bg-transparent outline-none flex-1 text-sm font-medium min-w-0"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>


          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex items-center gap-2">

            <input
              id="city-input"
              type="text"
              placeholder="City"
              className="w-full lg:w-28 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium outline-none hover:bg-gray-100 transition-colors"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />

            <select id="status-select" className="w-full lg:w-auto px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium outline-none appearance-none cursor-pointer hover:bg-gray-100 transition-colors" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <select id="type-select" className="w-full lg:w-auto px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium outline-none appearance-none cursor-pointer hover:bg-gray-100 transition-colors" value={filters.property_type} onChange={(e) => setFilters({ ...filters, property_type: e.target.value })}>
              {PROPERTY_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <select id="price-select" className="w-full lg:w-auto px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium outline-none appearance-none cursor-pointer hover:bg-gray-100 transition-colors" value={filters.price_range} onChange={(e) => setFilters({ ...filters, price_range: e.target.value })}>
              {PRICE_RANGES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <select id="beds-select" className="w-full lg:w-auto px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium outline-none appearance-none cursor-pointer hover:bg-gray-100 transition-colors" value={filters.bedrooms} onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}>
              {BEDROOM_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <button id="search-btn" onClick={applyFilters} className="col-span-2 sm:col-span-1 bg-[#1A1A1A] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#333] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.97]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              Search
            </button>
          </div>
        </div>


        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {filters.search && <FilterTag label="Search" value={filters.search} onRemove={() => removeFilter('search')} />}
            {filters.city && <FilterTag label="City" value={filters.city} onRemove={() => removeFilter('city')} />}
            {filters.status && <FilterTag label="Status" value={STATUS_OPTIONS.find((o) => o.value === filters.status)?.label || filters.status} onRemove={() => removeFilter('status')} />}
            {filters.property_type && <FilterTag label="Type" value={PROPERTY_TYPES.find((o) => o.value === filters.property_type)?.label || filters.property_type} onRemove={() => removeFilter('property_type')} />}
            {filters.price_range && <FilterTag label="Price" value={formatPriceLabel(filters.price_range)} onRemove={() => removeFilter('price_range')} />}
            {filters.bedrooms && <FilterTag label="Beds" value={`${filters.bedrooms}+`} onRemove={() => removeFilter('bedrooms')} />}
            <button onClick={clearFilters} className="text-xs font-bold text-[#F47D31] hover:underline ml-2">Clear all</button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl mb-8 text-sm font-medium flex items-center gap-3">
            <span className="text-lg">⚠️</span> {error}
            <button onClick={() => fetchProperties()} className="ml-auto font-bold hover:underline">Retry</button>
          </div>
        )}


        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[...Array(PAGE_SIZE)].map((_, i) => (
              <div key={i} className="animate-pulse bg-[#FDF8F5] rounded-[15px] overflow-hidden border border-orange-200">
                <div className="bg-gray-200 h-72" />
                <div className="p-8 md:p-10 space-y-4">
                  <div className="flex items-start gap-4 mb-8">
                    <div className="w-7 h-7 bg-gray-200 rounded-full shrink-0 mt-1" />
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                  </div>
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4 mb-10">
                    <div className="h-4 bg-gray-100 rounded w-24" />
                    <div className="h-4 bg-gray-100 rounded w-20" />
                    <div className="h-4 bg-gray-100 rounded w-24" />
                    <div className="h-4 bg-gray-100 rounded w-20" />
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="h-12 bg-gray-200 rounded-2xl w-32" />
                    <div className="h-8 bg-gray-200 rounded w-28" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {properties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-4xl border border-gray-100 shadow-sm px-6">
            <div className="text-6xl mb-6">🏠</div>
            <h3 className="text-2xl font-black mb-3">No properties found</h3>
            <p className="text-gray-400 max-w-xs mx-auto text-sm font-medium leading-relaxed">
              We couldn't find anything matching your search. Try adjusting your filters.
            </p>
            <button onClick={clearFilters} className="mt-8 text-[#F47D31] font-bold text-sm hover:underline">Clear all filters</button>
          </div>
        )}

        {pagination && (
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Page {currentPage} of {pagination.total_pages} &middot; {pagination.total} results
            </p>
            <div className="flex items-center gap-2">

              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.has_previous}
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#F47D31]/30 hover:text-[#F47D31] transition-all shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
              </button>

              {getPageNumbers(currentPage, pagination.total_pages).map((p, i) =>
                p === '...' ? (
                  <span key={`dot-${i}`} className="w-8 text-center text-gray-400 text-sm font-bold">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-sm ${currentPage === p
                        ? 'bg-[#1A1A1A] text-white shadow-xl scale-110'
                        : 'bg-white text-gray-500 border border-gray-200 hover:border-[#F47D31]/30 hover:text-[#F47D31]'
                      }`}
                  >
                    {p}
                  </button>
                ),
              )}


              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.has_next}
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#F47D31]/30 hover:text-[#F47D31] transition-all shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const FilterTag = ({ label, value, onRemove }) => (
  <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm hover:border-[#F47D31]/30 transition-all">
    <span className="text-gray-400 font-medium">{label}:</span>
    <span className="text-[#1A1A1A] max-w-30 truncate">{value}</span>
    <button onClick={onRemove} className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all" aria-label={`Remove ${label} filter`}>
      <span className="text-base leading-none">×</span>
    </button>
  </div>
);


const PropertyCard = ({ property: prop }) => {
  const imgSrc = prop.primary_image?.image_url || prop.primary_image?.image || 'https://images.unsplash.com/photo-1600585154340-be6199f7c096?auto=format&fit=crop&q=80&w=800';
  const statusLabel = prop.status === 'sale' ? 'For Sale' : prop.status === 'rent' ? 'For Rent' : prop.status === 'sold' ? 'Sold' : prop.status === 'rented' ? 'Rented' : prop.status;

  return (
    <div className="bg-[#FDF8F5] rounded-[15px] overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-orange-200 w-full">
      <div className="relative h-72 overflow-hidden">
        <img
          src={imgSrc}
          alt={prop.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold shadow-sm text-[#1A1A1A]">
          {statusLabel}
        </div>
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

export default PropertiesPage;
