import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { propertiesAPI, visitsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PropertyDetailPage = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { slug } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [latestProperties, setLatestProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [visitForm, setVisitForm] = useState({
    agent: '',
    preferred_date: '',
    contact_phone: '',
    contact_email: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch property details
        const propertyRes = await propertiesAPI.getProperty(slug);
        const propData = propertyRes.data.data.property;
        setProperty(propData);

        // Fetch gallery images and latest listings in parallel
        const [imagesRes, latestRes] = await Promise.all([
          propertiesAPI.getPropertyImages(propData.id),
          propertiesAPI.getProperties({ page_size: 3, ordering: '-created_at' })
        ]);

        setGalleryImages(imagesRes.data.data.images || []);
        setLatestProperties(latestRes.data.data.properties || []);
      } catch (err) {
        setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const handleVisitSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      await visitsAPI.createVisitRequest({
        property: property.id,
        agent: property.agent?.user?.id,
        preferred_date: visitForm.preferred_date,
        contact_phone: visitForm.contact_phone,
        contact_email: visitForm.contact_email,
        message: visitForm.message
      });
      setSubmitStatus('success');
      setVisitForm({ agent: '', preferred_date: '', contact_phone: '', contact_email: '', message: '' });
    } catch (err) {
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F1] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#F47D31] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-gray-400">Loading premium property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-[#FFF8F1] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🏚️</div>
          <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
          <p className="text-gray-500 mb-8">The property you're looking for might have been moved or removed.</p>
          <Link to="/properties" className="bg-[#1A1A1A] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#333] transition-all">
            Back to Listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F1] font-['Inter'] text-[#1A1A1A]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FFF8F1]/80 backdrop-blur-md px-6 md:px-16 py-4 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#F47D31] rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">Relasto</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="/" className="hover:text-[#F47D31] transition-colors">Home</Link>
            <Link to="/properties" className="hover:text-[#F47D31] transition-colors">Listing</Link>
            <Link to="/agents" className="hover:text-[#F47D31] transition-colors">Agents</Link>
            <Link to="/properties" className="text-[#F47D31]">Property</Link>
            <Link to="/about" className="hover:text-[#F47D31] transition-colors">Blog</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-[#F47D31] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            Search
          </button>
          {isAuthenticated ? (
            <Link to="/dashboard" className="bg-[#1A1A1A] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#333] transition-all">
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="bg-[#1A1A1A] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#333] transition-all shadow-lg">
              Login
            </Link>
          )}
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 md:px-16 max-w-7xl mx-auto">
        {/* Gallery Collage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 h-75 md:h-125">
          <div className="md:col-span-2 relative overflow-hidden rounded-[40px] shadow-2xl">
            <img
              src={property.primary_image?.image || 'https://images.unsplash.com/photo-1600585154340-be6199f7c096?auto=format&fit=crop&q=80&w=2070'}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden md:grid grid-rows-2 gap-4">
            <div className="relative overflow-hidden rounded-[30px] shadow-lg">
              <img
                src={galleryImages[0]?.image_url || galleryImages[0]?.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2075'}
                className="w-full h-full object-cover"
                alt="Interior 1"
              />
            </div>
            <div className="relative overflow-hidden rounded-[30px] shadow-lg group h-full">
              <img
                src={galleryImages[1]?.image_url || galleryImages[1]?.image || 'https://images.unsplash.com/photo-1600607687940-4e7a5336d397?auto=format&fit=crop&q=80&w=2070'}
                className="w-full h-full object-cover"
                alt="Interior 2"
              />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-white font-bold text-lg">+{galleryImages.length > 2 ? galleryImages.length - 2 : 0} more</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Left Column: Details */}
          <div className="lg:col-span-2">
            <div className="mb-10">
              <h1 className="text-4xl font-bold mb-4 leading-tight">{property.title}</h1>
              <div className="flex items-center gap-2 text-gray-400 font-medium">
                <svg className="w-5 h-5 text-[#F47D31]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {property.address}, {property.city}, {property.state} {property.zip_code}
              </div>
            </div>

            {/* Price Boxes */}
            <div className="flex flex-wrap gap-6 mb-12">
              <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-100 flex-1 min-w-50">
                <span className="text-gray-400 text-sm font-bold block mb-2 uppercase tracking-widest">Full Price</span>
                <div className="text-4xl font-black">${Number(property.price).toLocaleString()}</div>
                <span className="text-gray-400 text-xs font-bold mt-2 block">Est. $3,450/mo</span>
              </div>
              <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-100 flex-1 min-w-50">
                <span className="text-gray-400 text-sm font-bold block mb-2 uppercase tracking-widest">Estimated Rent</span>
                <div className="text-4xl font-black">${Math.round(property.price / 300).toLocaleString()} / month</div>
                <span className="text-gray-400 text-xs font-bold mt-2 block">Market Avg.</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">About this home</h2>
              <p className="text-gray-500 leading-loose text-lg">
                {property.description}
              </p>
            </div>

            {/* Local Information Tabs */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Local Information</h2>
              <div className="flex gap-4 mb-6">
                {['Map', 'Schools', 'Crime', 'Shop & Eat'].map((tab, i) => (
                  <button
                    key={tab}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${i === 1 ? 'bg-[#1A1A1A] text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-400 hover:bg-gray-50'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="h-96 bg-white rounded-[40px] overflow-hidden shadow-sm relative border border-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2074"
                  className="w-full h-full object-cover grayscale opacity-50"
                  alt="Local Map"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-[#F47D31] rounded-full border-4 border-white shadow-2xl animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Home Highlights */}
            <div className="bg-white p-12 rounded-[40px] shadow-sm border border-gray-100 mb-12">
              <h2 className="text-2xl font-bold mb-10">Home Highlights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-16">
                {[
                  { label: 'Parking', value: property.attributes?.parking || 'No Info' },
                  { label: 'Outdoor', value: property.attributes?.outdoor || 'No Info' },
                  { label: 'A/C', value: property.attributes?.ac || 'No Info' },
                  { label: 'Year Built', value: property.attributes?.year_built || 'No Info' },
                  { label: 'HOA', value: property.attributes?.hoa || 'None' },
                  { label: 'Price/sqft', value: property.attributes?.square_feet ? `$${Math.round(property.price / property.attributes.square_feet)}` : 'No Info' },
                  { label: 'Listed', value: new Date(property.created_at).toLocaleDateString() },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-4">
                    <span className="text-gray-400 font-bold text-sm uppercase tracking-wider">• {item.label}</span>
                    <span className="font-bold text-sm">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Info */}
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 mb-12 flex items-center gap-8">
              <img
                src={property.agent?.profile_image || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1976'}
                className="w-24 h-24 rounded-3xl object-cover shadow-lg"
                alt="Agent"
              />
              <div>
                <h3 className="text-xl font-bold mb-1">{property.agent?.user?.first_name} {property.agent?.user?.last_name}</h3>
                <div className="flex items-center gap-1 text-yellow-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < Math.round(property.agent?.average_rating || 5) ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-gray-400 text-xs font-bold ml-1">Premier Agent</span>
                </div>
                <div className="text-sm font-bold text-gray-500">{property.agent?.phone || '+1 234 567 890'}</div>
              </div>
            </div>
          </div>

          {/* Right Column: Visit Form Sidebar */}
          <div className="lg:sticky lg:top-32">
            <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-50">
              <h2 className="text-2xl font-bold mb-8">Request for Visit</h2>
              <form onSubmit={handleVisitSubmit} className="space-y-4">
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#F47D31] transition-all"
                    value={visitForm.contact_email}
                    onChange={(e) => setVisitForm({ ...visitForm, contact_email: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">📞</span>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#F47D31] transition-all"
                    value={visitForm.contact_phone}
                    onChange={(e) => setVisitForm({ ...visitForm, contact_phone: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">📅</span>
                  <input
                    type="date"
                    required
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#F47D31] transition-all"
                    value={visitForm.preferred_date}
                    onChange={(e) => setVisitForm({ ...visitForm, preferred_date: e.target.value })}
                  />
                </div>
                <textarea
                  placeholder="Message"
                  rows="4"
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#F47D31] transition-all"
                  value={visitForm.message}
                  onChange={(e) => setVisitForm({ ...visitForm, message: e.target.value })}
                ></textarea>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#1A1A1A] text-white py-5 rounded-2xl font-bold hover:bg-[#333] transition-all shadow-xl disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send Request'}
                </button>

                {submitStatus === 'success' && (
                  <p className="text-green-500 text-center font-bold text-sm mt-4">✓ Request sent successfully!</p>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Latest Listings */}
        <section className="mt-32">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold">Latest Property Listings</h2>
            <Link to="/properties" className="text-[#F47D31] font-bold flex items-center gap-2 group">
              Explore All
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {latestProperties.map((prop) => (
              <div key={prop.id} className="bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all group">
                <div className="relative h-60 overflow-hidden">
                  <img
                    src={prop.primary_image?.image_url || prop.primary_image?.image || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2070'}
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-8">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">📍</div>
                    <h3 className="font-bold text-lg leading-tight line-clamp-1">{prop.title}</h3>
                  </div>
                  <div className="flex items-center gap-4 mb-8 text-gray-400 text-[11px] font-bold">
                    <div>🛏️ {prop.attributes?.bedrooms || '-'} Bed</div>
                    <div>🚿 {prop.attributes?.bathrooms || '-'} Bath</div>
                    <div>📐 {prop.attributes?.square_feet || '-'} sqft</div>
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
        </section>
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

export default PropertyDetailPage;
