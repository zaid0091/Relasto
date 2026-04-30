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
  const [modalImage, setModalImage] = useState(null);

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
    <div className="min-h-screen bg-[#FDF9F6] font-['Inter'] text-[#1A1A1A]">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-16 max-w-[1440px] mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 h-[300px] md:h-[500px]">
          <div className="md:col-span-2 relative overflow-hidden rounded-[15px]">
            <img
              src={property.primary_image?.image || 'https://images.unsplash.com/photo-1600585154340-be6199f7c096?auto=format&fit=crop&q=80&w=2070'}
              alt={property.title}
              className="w-full h-130 object-cover cursor-pointer hover:border hover:border-orange-200 hover:opacity-90 transition-opacity"
              onClick={() => setModalImage(property.primary_image?.image || 'https://images.unsplash.com/photo-1600585154340-be6199f7c096?auto=format&fit=crop&q=80&w=2070')}
            />
          </div>
          <div className="hidden md:grid grid-rows-2 gap-4">
            <div className="relative overflow-hidden rounded-[15px]">
              <img
                src={galleryImages[0]?.image_url || galleryImages[0]?.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2075'}
                className="w-full h-100 object-cover border border-gray-300 cursor-pointer hover:opacity-90 transition-opacity"
                alt="Interior 1"
                onClick={() => setModalImage(galleryImages[0]?.image_url || galleryImages[0]?.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2075')}
              />
            </div>
            <div className="relative overflow-hidden rounded-[15px] group h-full">
              <img
                src={galleryImages[1]?.image_url || galleryImages[1]?.image || 'https://images.unsplash.com/photo-1600607687940-4e7a5336d397?auto=format&fit=crop&q=80&w=2070'}
                className="w-full h-100 object-cover border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                alt="Interior 2"
                onClick={() => setModalImage(galleryImages[1]?.image_url || galleryImages[1]?.image || 'https://images.unsplash.com/photo-1600607687940-4e7a5336d397?auto=format&fit=crop&q=80&w=2070')}
              />
              <div
                className="absolute bottom-4 right-4 bg-white text-[#1A1A1A] font-bold text-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow-md cursor-pointer hover:bg-gray-50 border border-gray-200 transition-colors"
                onClick={() => setModalImage(galleryImages[1]?.image_url || galleryImages[1]?.image || 'https://images.unsplash.com/photo-1600607687940-4e7a5336d397?auto=format&fit=crop&q=80&w=2070')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                {galleryImages.length > 2 ? galleryImages.length - 2 : 0} more
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start bg-">


          <div className="lg:col-span-2">
            <div className="mb-8 md:mb-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#1A1A1A] leading-tight">{property.title}</h1>
              <div className="text-gray-900 font-medium">
                {property.address}, {property.city}, {property.state} {property.zip_code}
              </div>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-10">
              <div className="bg-white p-6 rounded-[15px] border border-gray-200 flex flex-col justify-center">
                <div className="text-2xl font-bold text-[#1A1A1A] mb-1">${Number(property.price).toLocaleString()}</div>
                <div className="text-sm text-gray-500 font-medium">Property Price</div>
              </div>
              <div className="bg-white p-6 rounded-[15px] border border-gray-200 flex flex-col justify-center">
                <div className="text-2xl font-bold text-[#1A1A1A] mb-1">${Math.round(property.price / 300).toLocaleString()} <span className="text-lg">/ month</span></div>
                <div className="text-sm text-gray-500 font-medium">Estimated Mortgage</div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-xl font-bold mb-4 text-[#1A1A1A]">
                Well-constructed {(property.attributes?.sqft || property.attributes?.square_feet || '1,562').toLocaleString()} Sq Ft Home Is Now Offering To You In {property.city || 'Ottawa'} For {property.status === 'sale' ? 'Sale' : 'Rent'}
              </h2>
              <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                {property.description}
              </p>
            </div>


            <div className="mb-12">
              <h2 className="text-xl font-bold mb-6 text-[#1A1A1A]">
                Local Information
              </h2>
              <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {['Map', 'Schools', 'Crime', 'Shop & Eat'].map((tab, i) => (
                  <button
                    key={tab}
                    className={`px-6 py-2.5 rounded-[10px] text-sm font-medium transition-all whitespace-nowrap ${i === 1 ? 'bg-[#1A1A1A] text-white' : 'bg-white border border-gray-200 text-[#1A1A1A] hover:border-[#1A1A1A]'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="h-64 md:h-[350px] bg-white rounded-[15px] overflow-hidden relative border border-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2074"
                  className="w-full h-full object-cover opacity-80"
                  alt="Local Map"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-[#F47D31] rounded-full flex items-center justify-center text-white text-lg shadow-md">📍</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[15px] border border-gray-200 mb-12">
              <h2 className="text-xl font-bold mb-6 text-[#1A1A1A]">
                Home Highlights
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Parking</span>
                    <span className="font-semibold text-[#1A1A1A]">{property.attributes?.parking || 'No Info'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Outdoor</span>
                    <span className="font-semibold text-[#1A1A1A]">{property.attributes?.outdoor || 'No Info'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> A/C</span>
                    <span className="font-semibold text-[#1A1A1A]">{property.attributes?.ac || 'No Info'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Year Built</span>
                    <span className="font-semibold text-[#1A1A1A]">{property.attributes?.year_built || '2021'}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> HOA</span>
                    <span className="font-semibold text-[#1A1A1A]">{property.attributes?.hoa || 'None'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Price/Sqft</span>
                    <span className="font-semibold text-[#1A1A1A]">{property.attributes?.square_feet ? `$${Math.round(property.price / property.attributes.square_feet)}` : '$560'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Listed</span>
                    <span className="font-semibold text-[#1A1A1A]">No Info</span>
                  </div>
                </div>
              </div>
            </div>


            <div className="bg-white p-6 md:p-8 rounded-[15px] border border-gray-200 mb-12">
              <h2 className="text-xl font-bold mb-6 text-[#1A1A1A]">Agent Information</h2>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <img
                  src={property.agent?.profile_image || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1976'}
                  className="w-24 h-24 rounded-[15px] object-cover"
                  alt="Agent"
                />
                <div className="text-center sm:text-left pt-1">
                  <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">{property.agent?.user?.first_name || 'Bruno'} {property.agent?.user?.last_name || 'Fernandes'}</h3>
                  <div className="flex items-center justify-center sm:justify-start gap-1 text-[#F47D31] mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < Math.round(property.agent?.average_rating || 4) ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-gray-500 text-sm font-medium ml-2">1 review</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-500 mb-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    {property.agent?.user?.email || 'bruno@relasto.com'}
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    {property.agent?.phone || '+1 234 567 890'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:mt-85 mb-12 sm:mt-2 lg:mb-0">
            <div className="bg-white p-6 md:p-8 rounded-[15px] border border-gray-200">
              <h2 className="text-xl font-bold mb-6 text-[#1A1A1A]">Request for Visit</h2>
              <form onSubmit={handleVisitSubmit} className="space-y-4">
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-[10px] outline-none focus:border-[#F47D31] text-sm text-[#1A1A1A]"
                  />
                </div>
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-[10px] outline-none focus:border-[#F47D31] text-sm text-[#1A1A1A]"
                    value={visitForm.contact_email}
                    onChange={(e) => setVisitForm({ ...visitForm, contact_email: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-[10px] outline-none focus:border-[#F47D31] text-sm text-[#1A1A1A]"
                    value={visitForm.contact_phone}
                    onChange={(e) => setVisitForm({ ...visitForm, contact_phone: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <input
                    type="date"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-[10px] outline-none focus:border-[#F47D31] text-sm text-[#1A1A1A]"
                    value={visitForm.preferred_date}
                    onChange={(e) => setVisitForm({ ...visitForm, preferred_date: e.target.value })}
                  />
                </div>
                <textarea
                  placeholder="Message"
                  rows="4"
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-[10px] outline-none focus:border-[#F47D31] text-sm text-[#1A1A1A] resize-none"
                  value={visitForm.message}
                  onChange={(e) => setVisitForm({ ...visitForm, message: e.target.value })}
                ></textarea>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#1A1A1A] text-white py-3.5 rounded-[10px] font-medium text-sm hover:bg-[#333] transition-colors disabled:opacity-50 mt-2"
                >
                  {submitting ? 'Sending Request...' : 'Send Request'}
                </button>

                {submitStatus === 'success' && (
                  <div className="p-3 bg-green-50 rounded-[10px] border border-green-100 flex items-start gap-2 mt-4 text-green-700 text-sm">
                    <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    Your visit request has been sent!
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>


        <section className="mt-20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Latest Property Listings</h2>
            <Link to="/properties" className="text-[#F47D31] font-semibold flex items-center gap-2 hover:underline text-sm">
              Explore All
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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


      {modalImage && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-8">
          <button
            onClick={() => setModalImage(null)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all"
            aria-label="Close full screen"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          <img
            src={modalImage}
            alt="Full screen property view"
            className="w-full h-full object-contain max-h-[90vh] rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default PropertyDetailPage;
