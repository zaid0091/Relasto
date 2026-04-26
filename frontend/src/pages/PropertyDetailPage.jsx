import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { propertiesAPI, visitsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

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
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-16 max-w-[1440px] mx-auto">
        {/* Gallery Collage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 h-[300px] md:h-[500px]">
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
            <div className="mb-8 md:mb-10">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6 leading-tight tracking-tight text-[#1A1A1A]">{property.title}</h1>
              <div className="flex items-center gap-3 text-gray-400 font-bold text-xs md:text-sm uppercase tracking-widest bg-white/50 backdrop-blur-sm self-start py-2 rounded-full">
                <div className="w-8 h-8 rounded-full bg-[#F47D31]/10 flex items-center justify-center text-[#F47D31]">📍</div>
                {property.address}, {property.city}, {property.state} {property.zip_code}
              </div>
            </div>

            {/* Price Boxes */}
            <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-12">
              <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-sm border border-gray-50 flex-1 hover:shadow-xl transition-all group">
                <span className="text-gray-400 text-[10px] md:text-xs font-black block mb-2 uppercase tracking-[0.2em]">Full Price</span>
                <div className="text-3xl md:text-4xl font-black text-[#1A1A1A] group-hover:text-[#F47D31] transition-colors">${Number(property.price).toLocaleString()}</div>
                <div className="w-full h-1 bg-gray-50 rounded-full mt-4 overflow-hidden">
                  <div className="w-2/3 h-full bg-[#F47D31] rounded-full"></div>
                </div>
                <span className="text-gray-400 text-[10px] font-bold mt-3 block">Est. $3,450/mo mortgage</span>
              </div>
              <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-sm border border-gray-50 flex-1 hover:shadow-xl transition-all group">
                <span className="text-gray-400 text-[10px] md:text-xs font-black block mb-2 uppercase tracking-[0.2em]">Estimated Rent</span>
                <div className="text-3xl md:text-4xl font-black text-[#1A1A1A] group-hover:text-[#F47D31] transition-colors">${Math.round(property.price / 300).toLocaleString()} <span className="text-sm md:text-lg font-bold text-gray-300">/ mo</span></div>
                <div className="w-full h-1 bg-gray-50 rounded-full mt-4 overflow-hidden">
                  <div className="w-1/2 h-full bg-[#1A1A1A] rounded-full"></div>
                </div>
                <span className="text-gray-400 text-[10px] font-bold mt-3 block">Market Average Performance</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-12">
              <h2 className="text-xl md:text-2xl font-black mb-6 text-[#1A1A1A] flex items-center gap-3">
                <span className="w-1.5 h-6 bg-[#F47D31] rounded-full"></span>
                About this home
              </h2>
              <p className="text-gray-500 leading-[1.8] text-base md:text-lg font-medium">
                {property.description}
              </p>
            </div>

            {/* Local Information Tabs */}
            <div className="mb-12">
              <h2 className="text-xl md:text-2xl font-black mb-6 text-[#1A1A1A] flex items-center gap-3">
                <span className="w-1.5 h-6 bg-[#F47D31] rounded-full"></span>
                Local Information
              </h2>
              <div className="flex gap-2 md:gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {['Map', 'Schools', 'Crime', 'Shop & Eat'].map((tab, i) => (
                  <button
                    key={tab}
                    className={`px-5 md:px-7 py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${i === 1 ? 'bg-[#1A1A1A] text-white shadow-xl scale-105' : 'bg-white border border-gray-100 text-gray-400 hover:border-[#F47D31]/30 hover:text-[#F47D31]'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="h-64 md:h-96 bg-white rounded-[32px] md:rounded-[40px] overflow-hidden shadow-inner relative border border-gray-100 group">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2074"
                  className="w-full h-full object-cover grayscale opacity-30 group-hover:opacity-40 transition-opacity duration-1000"
                  alt="Local Map"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-[#F47D31] rounded-full border-4 border-white shadow-2xl animate-bounce flex items-center justify-center text-white font-black text-xl">📍</div>
                </div>
              </div>
            </div>

            {/* Home Highlights */}
            <div className="bg-white p-6 md:p-10 lg:p-12 rounded-[32px] md:rounded-[40px] shadow-sm border border-gray-50 mb-12 hover:shadow-xl transition-all duration-500">
              <h2 className="text-xl md:text-2xl font-black mb-10 text-[#1A1A1A] flex items-center gap-3">
                <span className="w-1.5 h-6 bg-[#F47D31] rounded-full"></span>
                Home Highlights
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 md:gap-y-8 gap-x-12 md:gap-x-16">
                {[
                  { label: 'Parking', value: property.attributes?.parking || 'No Info' },
                  { label: 'Outdoor', value: property.attributes?.outdoor || 'No Info' },
                  { label: 'A/C', value: property.attributes?.ac || 'No Info' },
                  { label: 'Year Built', value: property.attributes?.year_built || 'No Info' },
                  { label: 'HOA', value: property.attributes?.hoa || 'None' },
                  { label: 'Price/sqft', value: property.attributes?.square_feet ? `$${Math.round(property.price / property.attributes.square_feet)}` : 'No Info' },
                  { label: 'Listed', value: new Date(property.created_at).toLocaleDateString() },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-4 group">
                    <span className="text-gray-400 font-bold text-[10px] md:text-xs uppercase tracking-widest transition-colors group-hover:text-[#F47D31]">• {item.label}</span>
                    <span className="font-black text-xs md:text-sm text-[#1A1A1A]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Info */}
            <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-sm border border-gray-50 mb-12 flex flex-col sm:flex-row items-center gap-6 md:gap-8 hover:shadow-xl transition-all group">
              <div className="relative shrink-0">
                <img
                  src={property.agent?.profile_image || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1976'}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-3xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-500"
                  alt="Agent"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-[10px] font-black text-[#F47D31] uppercase tracking-[0.2em] mb-1">Listing Agent</div>
                <h3 className="text-lg md:text-xl font-black mb-1 text-[#1A1A1A]">{property.agent?.user?.first_name} {property.agent?.user?.last_name}</h3>
                <div className="flex items-center justify-center sm:justify-start gap-1 text-yellow-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-3.5 h-3.5 ${i < Math.round(property.agent?.average_rating || 5) ? 'fill-current' : 'text-gray-100'}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-gray-300 text-[10px] font-black ml-1 uppercase tracking-widest">Premier</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-1.5 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest border border-gray-100">
                  <span className="text-lg">📞</span> {property.agent?.phone || '+1 234 567 890'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visit Form Sidebar */}
          <div className="lg:sticky lg:top-32 mb-12 lg:mb-0">
            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-[32px] md:rounded-[40px] shadow-2xl border border-gray-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#F47D31]/5 rounded-bl-full -mr-8 -mt-8 transition-transform duration-700 group-hover:scale-150"></div>
              <h2 className="text-xl md:text-2xl font-black mb-8 text-[#1A1A1A] relative">Request for Visit</h2>
              <form onSubmit={handleVisitSubmit} className="space-y-4 relative">
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-lg">✉️</span>
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#F47D31] focus:ring-4 focus:ring-[#F47D31]/5 transition-all text-sm font-medium"
                    value={visitForm.contact_email}
                    onChange={(e) => setVisitForm({ ...visitForm, contact_email: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-lg">📞</span>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#F47D31] focus:ring-4 focus:ring-[#F47D31]/5 transition-all text-sm font-medium"
                    value={visitForm.contact_phone}
                    onChange={(e) => setVisitForm({ ...visitForm, contact_phone: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-lg">📅</span>
                  <input
                    type="date"
                    required
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#F47D31] focus:ring-4 focus:ring-[#F47D31]/5 transition-all text-sm font-medium"
                    value={visitForm.preferred_date}
                    onChange={(e) => setVisitForm({ ...visitForm, preferred_date: e.target.value })}
                  />
                </div>
                <textarea
                  placeholder="Tell us about your needs..."
                  rows="3"
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#F47D31] focus:ring-4 focus:ring-[#F47D31]/5 transition-all text-sm font-medium resize-none"
                  value={visitForm.message}
                  onChange={(e) => setVisitForm({ ...visitForm, message: e.target.value })}
                ></textarea>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#1A1A1A] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-[#F47D31] hover:translate-y-[-2px] active:translate-y-0 transition-all shadow-xl disabled:opacity-50 relative overflow-hidden"
                >
                  <span className="relative z-10">{submitting ? 'Sending Request...' : 'Schedule Visit Now'}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000"></div>
                </button>

                {submitStatus === 'success' && (
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-center gap-3 animate-in fade-in zoom-in duration-300 mt-4">
                    <span className="text-xl">✅</span>
                    <p className="text-green-700 font-bold text-xs">Your visit request has been sent to our premier agent!</p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Latest Listings */}
        <section className="mt-20 md:mt-32">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 md:mb-12 gap-4">
            <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A]">Latest Listings</h2>
            <Link to="/properties" className="text-[#F47D31] font-black flex items-center gap-2 group text-sm uppercase tracking-widest bg-white px-6 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all">
              Explore All
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {latestProperties.map((prop) => (
              <div key={prop.id} className="bg-[#FDF8F5] rounded-[15px] overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-orange-200 w-full">
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
        </section>
      </main>

    </div>
  );
};

export default PropertyDetailPage;
