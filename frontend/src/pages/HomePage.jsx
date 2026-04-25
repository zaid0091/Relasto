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
          propertiesAPI.getProperties({ page_size: 6, ordering: '-created_at' }),
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
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (searchParams.city) queryParams.append('city', searchParams.city);
    if (searchParams.property_type) queryParams.append('property_type', searchParams.property_type);
    if (activeTab) queryParams.append('status', activeTab === 'buy' ? 'for_sale' : activeTab === 'rent' ? 'for_rent' : '');

    navigate(`/properties?${queryParams.toString()}`);
  };

  const fetchPropertiesByTab = async (tab) => {
    try {
      const params = { page_size: 6, ordering: '-created_at', property_type: tab };
      const res = await propertiesAPI.getProperties(params);
      setFeaturedProperties(res.data.data.properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handlePropertyTabChange = (tab) => {
    setPropertyTab(tab);
    fetchPropertiesByTab(tab);
  };

  const stats = [
    { label: 'Completed Property', value: `$${(homeStats.total_sales_value / 1000000).toFixed(1)}M`, icon: '🏠' },
    { label: 'Property Sales', value: homeStats.for_sale_count.toLocaleString() + '+', icon: '📊' },
    { label: 'Apartment Rent', value: homeStats.for_rent_count.toLocaleString(), icon: '🏢' },
    { label: 'Happy Clients', value: homeStats.total_clients.toLocaleString() + '+', icon: '😊' },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8F1] font-['Inter'] text-[#1A1A1A]">
      <Navbar />

      {/* Hero Section */}
      <section id="hero" className=" bg-mist-200-100 pt-24 pb-16 pl-6 md:pl-16 pr-0 overflow-hidden">
        <div className="ml-10  flex flex-col lg:flex-row items-center gap-16 lg:gap-0">
          <div className="flex-1 max-w-xl pr-6 md:pr-0">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Find a perfect property <br />
              Where you’ll love to live
            </h1>
            <p className="text-gray-500 text-lg mb-10 max-w-lg">
              We helps businesses customize, automate and scale up their ad production and delivery.
            </p>

            <div className="bg-white rounded-[40px] shadow-[0_40px_80px_rgba(0,0,0,0.06)] p-8 md:p-10">
              <div className="flex gap-4 mb-8">
                {['buy', 'sell', 'rent'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 rounded-xl text-lg font-bold transition-all ${activeTab === tab ? 'bg-[#1A1A1A] text-white' : 'bg-[#E5E5E5] text-[#1A1A1A] hover:bg-gray-300'}`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSearch} className="grid gap-5">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="City/Street"
                    className="w-full py-5 px-6 rounded-2xl bg-white border border-[#E5E5E5] outline-none text-lg text-[#1A1A1A] placeholder-gray-400 focus:border-[#1A1A1A] transition-all"
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

                <div className="relative group">
                  <select
                    className="w-full py-5 px-6 rounded-2xl bg-white border border-[#E5E5E5] outline-none text-lg text-[#1A1A1A] appearance-none cursor-pointer focus:border-[#1A1A1A] transition-all"
                    value={searchParams.property_type}
                    onChange={(e) => setSearchParams({ ...searchParams, property_type: e.target.value })}
                  >
                    <option value="">Property Type</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
                    </svg>
                  </div>
                </div>

                <div className="relative group">
                  <select
                    className="w-full py-5 px-6 rounded-2xl bg-white border border-[#E5E5E5] outline-none text-lg text-[#1A1A1A] appearance-none cursor-pointer focus:border-[#1A1A1A] transition-all"
                    value={searchParams.price_range}
                    onChange={(e) => setSearchParams({ ...searchParams, price_range: e.target.value })}
                  >
                    <option value="">Price Range</option>
                    <option value="0-1000">$0 - $1,000</option>
                    <option value="1000-3000">$1,000 - $3,000</option>
                    <option value="3000-5000">$3,000 - $5,000</option>
                    <option value="5000+">$5,000+</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
                    </svg>
                  </div>
                </div>

                <button type="submit" className="w-full bg-[#1A1A1A] text-white py-5 rounded-2xl text-xl font-bold hover:bg-[#333] transition-all shadow-lg active:scale-[0.98]">
                  Search
                </button>
              </form>
            </div>
          </div>

          <div className="flex-1 relative flex justify-center lg:justify-end">
            <div className="absolute inset-y-0 right-0 w-full max-w-[580px] xl:max-w-[700px] rounded-l-[40px] bg-[#db6600] -translate-x-6 md:-translate-x-10 -z-10" />
            <img
              src={heroImage}
              alt="Hero House"
              className="w-full max-w-[640px] xl:max-w-[850px] object-cover rounded-l-[40px] "
            />
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="ml-10 px-6 md:px-16 py-20 flex flex-col lg:flex-row gap-8">
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
              <h3 className="font-bold text-2xl leading-tight max-w-[150px]">{item.title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="ml-10 px-6 md:px-16 py-16 flex flex-wrap justify-between gap-12 bg-[#FDF8F5] rounded-[40px] my-12">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex flex-col items-start text-left min-w-[200px]">
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
            <span className="text-5xl ml-2 font-bold mb-4 text-[#1A1A1A] tracking-tight">{stat.value}</span>
            <span className="text-[#5D7285] ml-2 text-lg font-medium leading-tight max-w-[180px]">{stat.label}</span>
          </div>
        ))}
      </section>

      {/* Featured Properties */}
      <section id="properties" className="ml-10 px-6 md:px-16 py-20 bg-orange-50">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold mb-4">Featured Properties</h2>
            <div className="flex gap-10 justify-between font-bold text-lg text-gray-400">
              <button
                onClick={() => handlePropertyTabChange('residential')}
                className={`transition-colors pb-1 ${propertyTab === 'residential' ? 'text-black border-[#F47D31]' : 'hover:text-[#F47D31]'}`}
              >
                Resident Property
              </button>
              <button
                onClick={() => handlePropertyTabChange('commercial')}
                className={`transition-colors pb-1 ${propertyTab === 'commercial' ? 'text-black border-[#F47D31]' : 'hover:text-[#F47D31]'}`}
              >
                Commercial Property
              </button>
              <button
                onClick={() => handlePropertyTabChange('industrial')}
                className={`transition-colors pb-1 ${propertyTab === 'industrial' ? 'text-black border-[#F47D31]' : 'hover:text-[#F47D31]'}`}
              >
                Industrial Property
              </button>
              <button
                onClick={() => handlePropertyTabChange('agricultural')}
                className={`transition-colors pb-1 ${propertyTab === 'agricultural' ? 'text-black border-[#F47D31]' : 'hover:text-[#F47D31]'}`}
              >
                Agriculture Property
              </button>
            </div>
          </div>
          <Link to="/properties" className="text-[#F47D31] text-2xl font-bold flex items-center gap-2 group md:hidden sm:hidden">
            Explore All
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="mr-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-around">
          {featuredProperties.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-400 text-lg font-medium">
              No Properties
            </div>
          ) : featuredProperties.map((prop) => (
            <div key={prop.id} className="bg-[#FDF8F5] rounded-[30px] overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-orange-100 w-120">
              <div className="relative h-72 overflow-hidden">
                <img
                  src={prop.primary_image?.image_url || prop.primary_image?.image || 'https://images.unsplash.com/photo-1600585154340-be6199f7c096?auto=format&fit=crop&q=80&w=2070'}
                  alt={prop.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold shadow-sm text-[#1A1A1A]">
                  {prop.status === 'for_sale' ? 'For Sale' : 'For Rent'}
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

      {/* Call to Action Section */}
      <section className="ml-10 px-6 md:px-16 py-20 flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1">
          <h2 className="text-5xl font-bold mb-6 leading-tight">
            Simple & easy way to find <br /> your dream Appointment
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <button className="bg-[#1A1A1A] text-white px-10 py-4 rounded-xl font-bold hover:bg-[#333] transition-all shadow-xl">
            Get Started
          </button>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-4">
          <img src="https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1000" className="rounded-3xl h-64 w-full object-cover shadow-lg" alt="" />
          <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000" className="rounded-3xl h-64 w-full object-cover shadow-lg mt-8" alt="" />
          <img src="https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&q=80&w=1000" className="rounded-3xl h-64 w-full object-cover shadow-lg -mt-8" alt="" />
          <img src="https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=1000" className="rounded-3xl h-64 w-full object-cover shadow-lg" alt="" />
        </div>
      </section>

      {/* Featured Listing Section */}
      <section className="ml-10 px-6 md:px-16 py-20 flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-[#F47D31] rounded-[40px] rotate-3 -z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1501183638714-841dd81dca4a?auto=format&fit=crop&q=80&w=1000"
            alt="Yellow House"
            className="w-full h-125 object-cover rounded-[40px] shadow-2xl"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-5xl font-bold mb-6 leading-tight">
            Best retirement on popular <br /> rental sales
          </h2>
          <p className="text-gray-500 mb-10 text-lg">
            Find the perfect place to settle down with our curated selection of properties designed for relaxation and community.
          </p>
          <ul className="space-y-4 mb-10">
            {[
              'Premium locations across the city',
              'Eco-friendly and modern design',
              'Strong community and security'
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-4 font-semibold">
                <div className="w-6 h-6 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-[10px]">✓</div>
                {text}
              </li>
            ))}
          </ul>
          <button className="bg-[#1A1A1A] text-white px-10 py-4 rounded-xl font-bold hover:bg-[#333] transition-all shadow-xl">
            See More
          </button>
        </div>
      </section>

      {/* Testimonial Section */}
      <section id="testimonials" className="ml-10 px-6 md:px-16 py-24 bg-white/50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <img
            src={latestReviews[0]?.reviewer?.profile_image || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=1974"}
            alt={latestReviews[0]?.reviewer?.first_name || "Client"}
            className="w-64 h-80 object-cover rounded-3xl shadow-2xl"
          />
          <div className="flex-1 relative">
            <div className="absolute -top-12 right-0 text-9xl text-gray-100 font-serif leading-none -z-10 opacity-50">"</div>
            <h3 className="text-2xl font-bold mb-2">{latestReviews[0]?.reviewer?.first_name || "Taylor"} {latestReviews[0]?.reviewer?.last_name || "Wilson"}</h3>
            <span className="text-gray-400 font-semibold mb-6 block">Verified Client</span>
            <p className="text-xl text-gray-600 italic leading-relaxed mb-8">
              "{latestReviews[0]?.comment || "The experience of finding my new home was seamless and stress-free. The team at Relasto went above and beyond to ensure everything was perfect."}"
            </p>
            <div className="flex items-center gap-6">
              <button className="w-12 h-12 rounded-full border-2 border-gray-100 flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-all">←</button>
              <button className="w-12 h-12 rounded-full border-2 border-gray-100 flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-all">→</button>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="ml-10 px-6 md:px-16 py-20">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold">News & Consult</h2>
          <Link to="/about" className="text-[#F47D31] font-bold flex items-center gap-2 group">
            Explore All
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: '9 Days for Residence DIY Projects...', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000' },
            { title: 'Local Steakhouse launch in Arcy...', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1000' },
            { title: 'Looking for a New Place? Just in...', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000' },
          ].map((news, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="overflow-hidden rounded-[30px] mb-6 h-64">
                <img src={news.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
              </div>
              <h3 className="text-xl font-bold mb-4 group-hover:text-[#F47D31] transition-colors">{news.title}</h3>
              <Link to="/about" className="text-[#F47D31] font-bold flex items-center gap-2 text-sm">
                Continue Read
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="px-6 md:px-16 py-20">
        <div className="bg-[#D9D9D9] rounded-[40px] p-12 md:p-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">For Owners, Agents and News</h2>
          <p className="text-gray-600 mb-10 max-w-lg mx-auto">
            Subscribe to our newsletter and get the latest news and property listings directly in your inbox.
          </p>
          <form className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-8 py-4 rounded-xl bg-white outline-none font-medium shadow-sm"
            />
            <button className="bg-[#1A1A1A] text-white px-10 py-4 rounded-xl font-bold hover:bg-[#333] transition-all shadow-lg">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-16 py-20 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-20">
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
            <h4 className="font-bold mb-6">Listing</h4>
            <ul className="space-y-4 text-gray-400 text-sm font-medium">
              <li><Link to="/properties" className="hover:text-[#F47D31]">Property for Sale</Link></li>
              <li><Link to="/properties" className="hover:text-[#F47D31]">Property for Rent</Link></li>
              <li><Link to="/properties" className="hover:text-[#F47D31]">Villa for Sale</Link></li>
              <li><Link to="/properties" className="hover:text-[#F47D31]">Office for Sale</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Support</h4>
            <ul className="space-y-4 text-gray-400 text-sm font-medium">
              <li><Link to="/about" className="hover:text-[#F47D31]">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-[#F47D31]">Contact Us</Link></li>
              <li><Link to="/about" className="hover:text-[#F47D31]">Help Center</Link></li>
              <li><Link to="/about" className="hover:text-[#F47D31]">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Others</h4>
            <ul className="space-y-4 text-gray-400 text-sm font-medium">
              <li><Link to="/login" className="hover:text-[#F47D31]">Log In</Link></li>
              <li><Link to="/register" className="hover:text-[#F47D31]">Sign Up</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#F47D31]">Dashboard</Link></li>
              <li><Link to="/agents" className="hover:text-[#F47D31]">Agents</Link></li>
            </ul>
          </div>
        </div>
        <div className="text-center text-gray-400 text-sm font-medium border-t border-gray-100 pt-10">
          © 2026 Relasto. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
