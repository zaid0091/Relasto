import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { propertiesAPI, reviewsAPI } from '../services/api';
import Navbar from '../components/Navbar';

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
      <section className="pt-32 pb-20 px-6 md:px-16 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="max-w-xl">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Find a perfect property <br />
            Where you'll love to live
          </h1>
          <p className="text-gray-500 text-lg mb-10 max-w-md">
            We help you find the best property in your favorite location with the best price and quality.
          </p>

          <div className="bg-white p-2 rounded-2xl shadow-2xl max-w-lg">
            <div className="flex gap-2 mb-2">
              {['buy', 'rent', 'sell'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-[#1A1A1A] text-white' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <form onSubmit={handleSearch} className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="City/Street"
                  className="bg-transparent outline-none flex-1 text-sm"
                  value={searchParams.city}
                  onChange={(e) => setSearchParams({ ...searchParams, city: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <select
                  className="bg-transparent outline-none flex-1 text-sm appearance-none"
                  value={searchParams.property_type}
                  onChange={(e) => setSearchParams({ ...searchParams, property_type: e.target.value })}
                >
                  <option value="">Property Type</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-[#1A1A1A] text-white py-4 rounded-xl font-bold hover:bg-[#333] transition-all shadow-lg mt-2">
                Search
              </button>
            </form>
          </div>
        </div>
        <div className="relative">
          <div className="w-87.5 h-112.5 md:w-112.5 md:h-137.5 bg-[#F47D31] rounded-[40px] absolute -top-4 -right-4 -z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=2070"
            alt="Hero House"
            className="w-87.5 h-112.5 md:w-112.5 md:h-137.5 object-cover rounded-[40px] shadow-2xl"
          />
        </div>
      </section>

      {/* Feature Section */}
      <section className="px-6 md:px-16 py-20 flex flex-col md:flex-row gap-8">
        <div className="flex-1 bg-[#FAD9C1] p-10 rounded-[40px]">
          <h2 className="text-3xl font-bold mb-4 leading-tight">
            Simple & easy way to find <br /> your dream Appointment
          </h2>
          <p className="text-gray-600 mb-8 max-w-sm">
            We provide a simple way to find your dream house with best price and quality.
          </p>
          <button className="bg-[#1A1A1A] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#333] transition-all">
            Get Started
          </button>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-6">
          {[
            { title: 'Search your location', icon: '📍' },
            { title: 'Visit Appointment', icon: '📅' },
            { title: 'Get your dream house', icon: '🏠' },
            { title: 'Enjoy your Appointment', icon: '✨' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[30px] shadow-sm hover:shadow-xl transition-all group">
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
              <h3 className="font-bold text-lg leading-tight">{item.title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 md:px-16 py-12 flex flex-wrap justify-between gap-8 border-y border-gray-100">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex flex-col items-center text-center">
            <span className="text-4xl font-bold mb-2">{stat.value}</span>
            <span className="text-gray-400 text-sm font-medium">{stat.label}</span>
          </div>
        ))}
      </section>

      {/* Featured Properties */}
      <section className="px-6 md:px-16 py-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold mb-4">Featured Properties</h2>
            <div className="flex gap-8 text-sm font-semibold text-gray-400">
              <button
                onClick={() => handlePropertyTabChange('residential')}
                className={`transition-colors pb-1 ${propertyTab === 'residential' ? 'text-[#F47D31] border-b-2 border-[#F47D31]' : 'hover:text-[#F47D31]'}`}
              >
                Resident Property
              </button>
              <button
                onClick={() => handlePropertyTabChange('commercial')}
                className={`transition-colors pb-1 ${propertyTab === 'commercial' ? 'text-[#F47D31] border-b-2 border-[#F47D31]' : 'hover:text-[#F47D31]'}`}
              >
                Commercial Property
              </button>
              <button
                onClick={() => handlePropertyTabChange('industrial')}
                className={`transition-colors pb-1 ${propertyTab === 'industrial' ? 'text-[#F47D31] border-b-2 border-[#F47D31]' : 'hover:text-[#F47D31]'}`}
              >
                Industrial Property
              </button>
              <button
                onClick={() => handlePropertyTabChange('agricultural')}
                className={`transition-colors pb-1 ${propertyTab === 'agricultural' ? 'text-[#F47D31] border-b-2 border-[#F47D31]' : 'hover:text-[#F47D31]'}`}
              >
                Agriculture Property
              </button>
            </div>
          </div>
          <Link to="/properties" className="text-[#F47D31] font-bold flex items-center gap-2 group">
            See All Property
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {featuredProperties.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-400 text-lg font-medium">
              No Properties
            </div>
          ) : featuredProperties.map((prop) => (
            <div key={prop.id} className="bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all group">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={prop.primary_image?.image_url || prop.primary_image?.image || 'https://images.unsplash.com/photo-1600585154340-be6199f7c096?auto=format&fit=crop&q=80&w=2070'}
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
                  <h3 className="font-bold text-xl leading-tight line-clamp-2">{prop.title}</h3>
                </div>
                <div className="flex items-center gap-6 mb-8 text-gray-400 text-sm font-medium">
                  <div className="flex items-center gap-2">🛏️ {prop.attributes?.bedrooms || '-'} Bed</div>
                  <div className="flex items-center gap-2">🚿 {prop.attributes?.bathrooms || '-'} Bath</div>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <Link to={`/properties/${prop.slug}`} className="bg-[#1A1A1A] text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-[#333] transition-all">
                    View Details
                  </Link>
                  <span className="text-2xl font-bold">${Number(prop.price).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="px-6 md:px-16 py-20 flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1">
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Simple & easy way to find <br /> your dream Appointment
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <button className="bg-[#1A1A1A] text-white px-10 py-4 rounded-xl font-bold hover:bg-[#333] transition-all shadow-xl">
            Learn More
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
      <section className="px-6 md:px-16 py-20 flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-[#F47D31] rounded-[40px] rotate-3 -z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&q=80&w=1000"
            alt="Yellow House"
            className="w-full h-125 object-cover rounded-[40px] shadow-2xl"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-4xl font-bold mb-6 leading-tight">
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
      <section className="px-6 md:px-16 py-24 bg-white/50">
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
      <section className="px-6 md:px-16 py-20">
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
