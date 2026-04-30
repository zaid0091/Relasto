import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { propertiesAPI, reviewsAPI } from '../services/api';
import Navbar from '../components/Navbar';
import heroImage from '../assets/images/img_image.png';

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [latestReviews, setLatestReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('buy');
  const [propertyTab, setPropertyTab] = useState('residential');
  const [searchParams, setSearchParams] = useState({
    city: '',
    property_type: '',
    price_range: ''
  });
  const [homeStats, setHomeStats] = useState({
    total_sales_value: 0,
    total_properties_value: 0,
    for_sale_count: 0,
    for_rent_count: 0,
    total_visits: 0,
    total_clients: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [propsRes, reviewsRes, statsRes] = await Promise.all([
          propertiesAPI.getProperties({ page_size: 6, ordering: '-created_at', property_type: propertyTab }),
          reviewsAPI.getReviews({ page_size: 3 }),
          propertiesAPI.getStats()
        ]);

        setFeaturedProperties(propsRes.data.data.properties || []);
        setLatestReviews(reviewsRes.data.data.reviews || []);
        if (statsRes.data.data) {
          setHomeStats(statsRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching home page data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [propertyTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (searchParams.city) queryParams.append('city', searchParams.city);
    if (searchParams.property_type) queryParams.append('property_type', searchParams.property_type);
    if (searchParams.price_range) queryParams.append('price_range', searchParams.price_range);
    if (activeTab) queryParams.append('status', activeTab === 'buy' ? 'sale' : activeTab === 'rent' ? 'rent' : '');

    navigate(`/properties?${queryParams.toString()}`);
  };

  const handlePropertyTabChange = (tab) => {
    setPropertyTab(tab);
  };

  // Format total value (e.g., 1500000 -> "$1.5M", 250000 -> "$250K")
  const formatTotalValue = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  const stats = [
    { label: 'Total Value', value: formatTotalValue(homeStats.total_properties_value), icon: '🏠' },
    { label: 'Property Sales', value: homeStats.for_sale_count.toLocaleString() + '+', icon: '📊' },
    { label: 'Apartment Rent', value: homeStats.for_rent_count.toLocaleString(), icon: '🏢' },
    { label: 'Happy Clients', value: homeStats.total_clients.toLocaleString() + '+', icon: '😊' },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8F1] font-['Inter'] text-[#1A1A1A]">
      <Navbar />

      
      <section id="hero" className="bg-[#FFF8F1] pt-24 md:pt-32 pb-16 pl-6 md:pl-16 pr-0 overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 max-w-2xl pr-6 md:pr-0">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 text-[#1A1A1A]">
              Find a perfect property <br className="hidden md:block" />
              Where you’ll love to live
            </h1>
            <p className="text-gray-500 text-base md:text-xl mb-10 max-w-lg leading-relaxed">
              We help you find the perfect home that fits your lifestyle. Explore our curated list of properties and start your journey today.
            </p>

            <div className="bg-white rounded-[40px] shadow-[0_40px_80px_rgba(0,0,0,0.06)] p-6 md:p-10 border border-orange-50">
              <div className="flex gap-3 md:gap-4 mb-8">
                {['buy', 'sell', 'rent'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 md:py-4 rounded-xl text-base md:text-lg font-bold transition-all ${activeTab === tab ? 'bg-[#1A1A1A] text-white shadow-lg' : 'bg-gray-50 text-[#1A1A1A] hover:bg-gray-100'}`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSearch} className="grid gap-4 md:gap-5">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="City/Street"
                    className="w-full py-4 md:py-5 px-6 rounded-2xl bg-white border border-[#E5E5E5] outline-none text-base md:text-lg text-[#1A1A1A] placeholder-gray-400 focus:border-[#F47D31] transition-all"
                    value={searchParams.city}
                    onChange={(e) => setSearchParams({ ...searchParams, city: e.target.value })}
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <div className="relative group">
                    <select
                      className="w-full py-4 md:py-5 px-6 rounded-2xl bg-white border border-[#E5E5E5] outline-none text-base md:text-lg text-[#1A1A1A] appearance-none cursor-pointer focus:border-[#F47D31] transition-all"
                      value={searchParams.property_type}
                      onChange={(e) => setSearchParams({ ...searchParams, property_type: e.target.value })}
                    >
                      <option value="">Property Type</option>
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="industrial">Industrial</option>
                      <option value="agricultural">Agricultural</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
                      </svg>
                    </div>
                  </div>

                  <div className="relative group">
                    <select
                      className="w-full py-4 md:py-5 px-6 rounded-2xl bg-white border border-[#E5E5E5] outline-none text-base md:text-lg text-[#1A1A1A] appearance-none cursor-pointer focus:border-[#F47D31] transition-all"
                      value={searchParams.price_range}
                      onChange={(e) => setSearchParams({ ...searchParams, price_range: e.target.value })}
                    >
                      <option value="">Price Range</option>
                      <option value="0-100000">Under $100k</option>
                      <option value="100000-300000">$100k – $300k</option>
                      <option value="300000-500000">$300k – $500k</option>
                      <option value="500000-750000">$500k – $750k</option>
                      <option value="750000-1000000">$750k – $1M</option>
                      <option value="1000000+">$1M+</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
                      </svg>
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full bg-[#1A1A1A] text-white py-4 md:py-5 rounded-2xl text-lg md:text-xl font-bold hover:bg-[#333] transition-all shadow-lg active:scale-[0.98]">
                  Search
                </button>
              </form>
            </div>
          </div>

          <div className="hidden lg:block flex-1 relative w-full lg:w-auto mt-8 lg:mt-0 pr-6 md:pr-0 lg:pr-0">
            <div className="absolute -inset-4 md:-inset-10 bg-orange-100/50 -z-10 blur-3xl lg:hidden" />
            <div className="hidden lg:block absolute inset-y-0 -right-25 w-full max-w-150 xl:max-w-200 bg-[#F47D31]/10 -z-10" />
            <img
              src={heroImage}
              alt="Hero House"
              className="w-full h-75 sm:h-100 md:h-125 lg:h-175 object-contain lg:object-cover lg:object-top lg:rounded-l-[100px] lg:rounded-r-none drop-shadow-2xl lg:shadow-none transition-all duration-700"
            />
          </div>
        </div>
      </section>

     
      <section id="features" className=" px-6 md:px-16 py-20 flex flex-col lg:flex-row gap-8">
        <div className="flex-1 bg-[#FFE5D4] p-12 md:p-16 rounded-[40px] flex flex-col justify-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-[#1A1A1A]">
            Simple & easy way to find <br /> your dream Appointment
          </h2>
          <p className="text-gray-600 mb-10 text-lg max-w-sm leading-relaxed">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
          </p>
          <button className="bg-[#1A1A1A] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#333] transition-all w-fit shadow-lg active:scale-[0.98]">
            Get Started
          </button>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-6">
          {[
            {
              title: 'Search your location',
              icon: (
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /><path d="M11 8v6M8 11h6" />
                </svg>
              )
            },
            {
              title: 'Visit Appointment',
              icon: (
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <circle cx="12" cy="11" r="3" />
                </svg>
              )
            },
            {
              title: 'Get your dream house',
              icon: (
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><path d="M9 22V12h6v10" />
                </svg>
              )
            },
            {
              title: 'Enjoy your Appointment',
              icon: (
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              )
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-[#FDF1E9] p-8 md:p-10 rounded-[40px] hover:shadow-xl transition-all group flex flex-col items-start text-left">
              <div className="mb-8 text-[#F47D31] group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <h3 className="font-bold text-2xl leading-tight max-w-37.5">{item.title}</h3>
            </div>
          ))}
        </div>
      </section>

    
      <section id="stats" className="mx-6 md:mx-16 px-8 md:px-16 py-16 grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8 bg-[#FDF8F5] rounded-[40px] my-12">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.06)] mb-8">
              <div className="text-[#F47D31]">
                {idx === 0 && (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                )}
                {idx === 1 && (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                )}
                {idx === 2 && (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                  </svg>
                )}
                {idx === 3 && (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-3xl md:text-5xl font-bold mb-4 text-[#1A1A1A] tracking-tight">{stat.value}</span>
            <span className="text-[#5D7285] text-sm md:text-lg font-medium leading-tight max-w-37.5 md:max-w-45">{stat.label}</span>
          </div>
        ))}
      </section>

    
      <section id="properties" className="px-6 md:px-16 py-20 bg-orange-50">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="flex-1">
            <h2 className="text-4xl font-bold mb-8 text-[#1A1A1A]">Featured Properties</h2>
            <div className="flex items-center gap-6 md:gap-10 font-bold text-base md:text-lg text-gray-400 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => handlePropertyTabChange('residential')}
                className={`transition-all pb-2 border-b-2 whitespace-nowrap ${propertyTab === 'residential' ? 'text-black border-[#F47D31]' : 'border-transparent hover:text-[#F47D31]'}`}
              >
                Resident Property
              </button>
              <button
                onClick={() => handlePropertyTabChange('commercial')}
                className={`transition-all pb-2 border-b-2 whitespace-nowrap ${propertyTab === 'commercial' ? 'text-black border-[#F47D31]' : 'border-transparent hover:text-[#F47D31]'}`}
              >
                Commercial Property
              </button>
              <button
                onClick={() => handlePropertyTabChange('industrial')}
                className={`transition-all pb-2 border-b-2 whitespace-nowrap ${propertyTab === 'industrial' ? 'text-black border-[#F47D31]' : 'border-transparent hover:text-[#F47D31]'}`}
              >
                Industrial Property
              </button>
              <button
                onClick={() => handlePropertyTabChange('agricultural')}
                className={`transition-all pb-2 border-b-2 whitespace-nowrap ${propertyTab === 'agricultural' ? 'text-black border-[#F47D31]' : 'border-transparent hover:text-[#F47D31]'}`}
              >
                Agriculture Property
              </button>
            </div>
          </div>
          <Link to="/properties" className="text-[#F47D31] text-lg md:text-2xl font-bold flex items-center gap-2 group shrink-0">
            Explore All
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {featuredProperties.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-400 text-lg font-medium">
              No Properties
            </div>
          ) : featuredProperties.map((prop) => (
            <div key={prop.id} className="bg-[#FDF8F5] rounded-[15px] overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-orange-200 w-full">
              <div className="relative h-72 overflow-hidden">
                <img
                  src={prop.primary_image?.image_url || prop.primary_image?.image || 'https://images.unsplash.com/photo-1600585154340-be6199f7c096?auto=format&fit=crop&q=80&w=2070'}
                  alt={prop.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold shadow-sm text-[#1A1A1A]">
                  {prop.status === 'sale' ? 'For Sale' : prop.status === 'rent' ? 'For Rent' : prop.status === 'sold' ? 'Sold' : prop.status}
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
                    <span>{(prop.attributes?.sqft || '1,032').toLocaleString()} sqft</span>
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
      </section>

      <section className="px-6 md:px-16 py-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 text-center lg:text-left">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-[#1A1A1A]">
            Simple & easy way to find <br className="hidden md:block" /> your dream Appointment
          </h2>
          <p className="text-gray-500 mb-8 text-base md:text-lg max-w-xl mx-auto lg:mx-0">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <button className="bg-[#1A1A1A] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#333] transition-all shadow-xl active:scale-95">
            Get Started
          </button>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-4 md:gap-6 w-full max-w-2xl">
          <img src="https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1000" className="rounded-[40px] h-48 md:h-64 w-full object-cover shadow-lg hover:scale-105 transition-transform duration-500" alt="" />
          <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000" className="rounded-[40px] h-48 md:h-64 w-full object-cover shadow-lg mt-8 md:mt-12 hover:scale-105 transition-transform duration-500" alt="" />
          <img src="https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&q=80&w=1000" className="rounded-[40px] h-48 md:h-64 w-full object-cover shadow-lg -mt-8 md:-mt-12 hover:scale-105 transition-transform duration-500" alt="" />
          <img src="https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=1000" className="rounded-[40px] h-48 md:h-64 w-full object-cover shadow-lg hover:scale-105 transition-transform duration-500" alt="" />
        </div>
      </section>

     
      <section className="px-6 md:px-16 py-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 relative w-full lg:w-auto">
          <div className="absolute inset-0 bg-[#F47D31] rounded-[40px] rotate-2 lg:rotate-3 -z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1501183638714-841dd81dca4a?auto=format&fit=crop&q=80&w=1000"
            alt="Yellow House"
            className="w-full h-80 md:h-125 lg:h-150 object-cover rounded-[40px] shadow-2xl"
          />
        </div>
        <div className="flex-1 text-center lg:text-left mt-8 lg:mt-0">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-[#1A1A1A]">
            Best retirement on popular <br className="hidden md:block" /> rental sales
          </h2>
          <p className="text-gray-500 mb-8 text-base md:text-lg max-w-xl mx-auto lg:mx-0">
            Find the perfect place to settle down with our curated selection of properties designed for relaxation and community.
          </p>
          <ul className="space-y-4 mb-10 text-left inline-block lg:block">
            {[
              'Premium locations across the city',
              'Eco-friendly and modern design',
              'Strong community and security'
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-4 font-semibold text-[#1A1A1A]">
                <div className="w-6 h-6 min-w-6 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-[10px] shadow-md">✓</div>
                {text}
              </li>
            ))}
          </ul>
          <div className="flex justify-center lg:justify-start">
            <button className="bg-[#1A1A1A] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#333] transition-all shadow-xl active:scale-95">
              See More
            </button>
          </div>
        </div>
      </section>

     
      <section id="testimonials" className="px-6 md:px-16 py-24 bg-white/50 overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="relative group">
            <div className="absolute -inset-4 bg-orange-100 rounded-[40px] rotate-6 group-hover:rotate-0 transition-transform duration-500 -z-10"></div>
            <img
              src={latestReviews[0]?.reviewer?.profile_image || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=1974"}
              alt={latestReviews[0]?.reviewer?.first_name || "Client"}
              className="w-64 md:w-72 h-80 md:h-96 object-cover rounded-[40px] shadow-2xl relative z-10"
            />
          </div>
          <div className="flex-1 relative text-center lg:text-left mt-8 lg:mt-0">
            <div className="absolute -top-10 lg:-top-16 left-1/2 lg:left-0 -translate-x-1/2 lg:translate-x-0 text-8xl lg:text-[12rem] text-orange-200/30 font-serif leading-none -z-10 select-none">"</div>
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold mb-2 text-[#1A1A1A]">{latestReviews[0]?.reviewer?.first_name || "Taylor"} {latestReviews[0]?.reviewer?.last_name || "Wilson"}</h3>
              <span className="text-orange-500 font-bold mb-8 block text-sm uppercase tracking-widest">Verified Client</span>
              <p className="text-lg md:text-2xl text-gray-600 italic leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0">
                "{latestReviews[0]?.comment || "The experience of finding my new home was seamless and stress-free. The team at Relasto went above and beyond to ensure everything was perfect."}"
              </p>
              <div className="flex items-center justify-center lg:justify-start gap-6">
                <button className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] transition-all group shadow-sm active:scale-90">
                  <span className="group-hover:-translate-x-1 transition-transform">←</span>
                </button>
                <button className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] transition-all group shadow-sm active:scale-90">
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section className="px-6 md:px-16 py-24 md:py-32 bg-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 md:mb-16 gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-[#1A1A1A] mb-4">News & Consult</h2>
            <p className="text-gray-400 font-medium text-sm md:text-base max-w-md">Stay updated with the latest trends and insights from our real estate experts.</p>
          </div>
          <Link to="/blog" className="text-[#F47D31] font-black flex items-center gap-2 group text-xs uppercase tracking-[0.2em] bg-gray-50 px-8 py-3.5 rounded-full hover:bg-[#F47D31] hover:text-white transition-all shadow-sm">
            Explore All News
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {[
            { title: '9 Days for Residence DIY Projects...', date: 'Apr 24, 2026', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000' },
            { title: 'Local Steakhouse launch in Arcy...', date: 'Apr 22, 2026', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1000' },
            { title: 'Looking for a New Place? Just in...', date: 'Apr 20, 2026', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000' },
          ].map((news, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="overflow-hidden rounded-4xl md:rounded-[40px] mb-8 h-72 md:h-80 relative">
                <img src={news.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                <div className="absolute top-6 left-6">
                  <div className="bg-white/90 backdrop-blur-md px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl border border-white/20">
                    Consulting
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-300 text-[10px] font-black uppercase tracking-widest mb-4">
                <span>Relasto Insight</span>
                <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                <span>{news.date}</span>
              </div>
              <h3 className="text-xl md:text-2xl font-black mb-6 group-hover:text-[#F47D31] transition-colors leading-tight line-clamp-2">{news.title}</h3>
              <Link to="/blog" className="text-[#1A1A1A] font-black flex items-center gap-3 text-xs uppercase tracking-widest hover:gap-5 transition-all">
                Continue Reading
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#F47D31] group-hover:bg-[#F47D31] group-hover:text-white transition-all">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

    
      <section className="px-6 md:px-16 py-24 md:py-32 bg-[#FFF8F1]">
        <div className="bg-[#1A1A1A] rounded-[40px] md:rounded-[60px] p-10 md:p-24 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F47D31]/10 rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-150"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 transition-transform duration-1000 group-hover:scale-150"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-block px-6 py-2 rounded-full bg-[#F47D31]/20 text-[#F47D31] text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-8">Newsletter</div>
            <h2 className="text-3xl md:text-6xl font-black text-white mb-8 leading-tight">For Owners, Agents <br className="hidden md:block" /> and Local News</h2>
            <p className="text-gray-400 mb-12 text-base md:text-xl max-w-lg mx-auto font-medium leading-relaxed">
              Join 10,000+ subscribers getting the latest property listings and market trends directly in their inbox every week.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <div className="flex-1 relative">
                <input
                  type="email"
                  placeholder="Enter your work email"
                  className="w-full px-8 py-5 md:py-6 rounded-2xl md:rounded-3xl bg-white/10 border border-white/10 outline-none font-bold text-white placeholder-gray-500 focus:bg-white/20 focus:border-[#F47D31] transition-all text-sm"
                />
              </div>
              <button className="bg-[#F47D31] text-white px-10 py-5 md:py-6 rounded-2xl md:rounded-3xl font-black text-xs md:text-sm uppercase tracking-[0.2em] hover:bg-white hover:text-[#1A1A1A] transition-all shadow-2xl active:scale-95">
                Subscribe Now
              </button>
            </form>
            <p className="text-gray-600 mt-8 text-[10px] font-bold uppercase tracking-widest">No spam, ever. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
