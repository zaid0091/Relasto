import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { profilesAPI, reviewsAPI } from '../services/api';
import Navbar from '../components/Navbar';

const AgentProfilePage = () => {
  const { id } = useParams();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [properties, setProperties] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Properties');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 6;

  // Reset current page when active tab changes
  useEffect(() => {
    if (activeTab === 'Properties') {
      setCurrentPage(1);
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setLoading(true);
        const [agentResponse, propertiesResponse, reviewsResponse] = await Promise.all([
          profilesAPI.getProfile(id),
          profilesAPI.getAgentProperties(id),
          profilesAPI.getAgentReviews(id),
        ]);

        setAgent(agentResponse.data.data?.profile || agentResponse.data.data);
        setProperties(propertiesResponse.data.data?.properties || []);
        setReviews(reviewsResponse.data.data?.reviews || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load agent profile');
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSubmittingReview(true);
    try {
      await reviewsAPI.createReview({
        agent_profile: id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
      setReviewSuccess(true);
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });
      const reviewsResponse = await profilesAPI.getAgentReviews(id);
      setReviews(reviewsResponse.data.data?.reviews || []);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const agentFullName = agent?.user ?
    `${agent.user.first_name || ''} ${agent.user.last_name || ''}`.trim() || agent.user.username || 'Bruno Fernandes'
    : 'Bruno Fernandes';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F1] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-[#F47D31] rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FFF8F1] flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-3xl shadow-xl max-w-md">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/agents" className="inline-block bg-[#F47D31] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#d66a27] transition-all">
            Back to Agents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F1] font-['Inter',sans-serif] text-[#2D2D2D]">
      <Navbar variant="light" />

      {/* Hero Section */}
      <div className="relative w-full h-100 overflow-hidden pt-6">
        <img
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=80"
          alt="Luxury Architecture"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Profile Bar */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-16 -mt-16 relative z-10">
        <div className="bg-white rounded-4xl p-6 md:p-10 flex flex-col md:flex-row items-center md:items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.08)] gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-white shadow-lg">
              <img
                src={agent?.profile_image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"}
                alt={agentFullName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-1">{agentFullName}</h1>
              <div className="flex items-center justify-center md:justify-start gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < Math.floor(agent?.average_rating || 4.5) ? "#F47D31" : "#E5E7EB"}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                ))}
                <span className="text-sm font-bold text-gray-400 ml-2">{agent?.average_rating?.toFixed(1) || "4.5"} Review</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-[#FFF8F1] flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F47D31" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  </div>
                  <span className="font-medium">{agent?.phone || "(123) 456-7890"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-[#FFF8F1] flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F47D31" strokeWidth="2"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                  </div>
                  <span className="font-medium">{agent?.user?.email || "bruno@relasto.com"}</span>
                </div>
              </div>
            </div>
          </div>

          <button className="bg-[#1A1A1A] text-white px-10 py-4 rounded-full font-bold hover:bg-gray-800 transition-all shadow-xl">
            Contact
          </button>
        </div>

        {/* Agent Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          {agent.experience > 0 && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#F47D31]/10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-[#F47D31]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{agent.experience}+</p>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Years Experience</p>
              </div>
            </div>
          )}
          {agent.property_types && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#F47D31]/10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-[#F47D31]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 21h-5m2 0v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5m2 0h5" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-black text-gray-900 line-clamp-1">{agent.property_types}</p>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Property Types</p>
              </div>
            </div>
          )}
          {agent.area && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#F47D31]/10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-[#F47D31]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-black text-gray-900 line-clamp-1">{agent.area}</p>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Area</p>
              </div>
            </div>
          )}
          {agent.license_no && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#F47D31]/10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-[#F47D31]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-black text-gray-900">{agent.license_no}</p>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">License No</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs & Main Content */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-16 py-12">
        <div className="flex overflow-x-auto pb-4 md:pb-0 md:flex-wrap gap-4 mb-10 no-scrollbar">
          {['Properties', 'Reviews', 'About', 'Contact'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-8 py-3 rounded-2xl font-bold transition-all border-2 ${activeTab === tab
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Properties' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.length > 0 ? properties
                .slice((currentPage - 1) * propertiesPerPage, currentPage * propertiesPerPage)
                .map((property) => (
                <div key={property.id} className="bg-[#FDF8F5] rounded-[15px] overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-orange-200 w-full">
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={property.primary_image?.image_url || property.primary_image?.image || 'https://images.unsplash.com/photo-1600585154340-be6199f7c096?auto=format&fit=crop&q=80&w=2070'}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold shadow-sm text-[#1A1A1A]">
                      {property.status === 'sale' ? 'For Sale' : property.status === 'rent' ? 'For Rent' : property.status === 'sold' ? 'Sold' : property.status}
                    </div>
                  </div>
                  <div className="p-8 md:p-10">
                    <div className="flex items-start gap-4 mb-8">
                      <div className="mt-1 shrink-0">
                        <svg className="w-7 h-7 text-[#1A1A1A]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-2xl leading-tight text-[#1A1A1A] line-clamp-2">{property.title}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-y-5 gap-x-4 mb-10">
                      <div className="flex items-center gap-3 text-[#5D7285] font-semibold">
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 20V9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v11" /><path d="M2 11h20" /><path d="M2 15h20" /><path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
                        </svg>
                        <span>{property.attributes?.bedrooms || '0'} Bed Room</span>
                      </div>
                      <div className="flex items-center gap-3 text-[#5D7285] font-semibold">
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 11V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v8" /><path d="M21 15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4h18v4z" />
                        </svg>
                        <span>{property.attributes?.bathrooms || '0'} Bath</span>
                      </div>
                      <div className="flex items-center gap-3 text-[#5D7285] font-semibold">
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m15 3 6 6" /><path d="m9 21-6-6" /><path d="M21 3h-6" /><path d="M21 3v6" /><path d="M3 21h6" /><path d="M3 21v-6" />
                        </svg>
                        <span>{(property.attributes?.sqft || property.attributes?.square_feet || '1,032').toLocaleString()} sqft</span>
                      </div>
                      <div className="flex items-center gap-3 text-[#5D7285] font-semibold">
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="6" cy="6" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" />
                        </svg>
                        <span>{property.property_type || 'Family'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Link to={`/properties/${property.slug}`} className="bg-[#1A1A1A] text-white px-8 py-4 rounded-2xl text-base font-bold hover:bg-[#333] transition-all shadow-lg active:scale-95">
                        View Details
                      </Link>
                      <span className="text-3xl font-bold text-[#1A1A1A] tracking-tight">${Number(property.price).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-20 text-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Properties Found</h3>
                  <p className="text-gray-500">This agent hasn't listed any properties yet.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {properties.length > propertiesPerPage && (
              <div className="flex justify-center items-center gap-3 mt-16">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 h-12 rounded-xl font-bold transition-all border-2 flex items-center gap-2 ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed'
                      : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  Previous
                </button>

                {/* Page Numbers */}
                {(() => {
                  const totalPages = Math.ceil(properties.length / propertiesPerPage);
                  const pages = [];
                  const maxVisiblePages = 5;
                  
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                  
                  if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }
                  
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(i);
                  }
                  
                  return pages.map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-12 h-12 rounded-xl font-bold transition-all border-2 ${
                        page === currentPage
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                          : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ));
                })()}

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(properties.length / propertiesPerPage)))}
                  disabled={currentPage === Math.ceil(properties.length / propertiesPerPage)}
                  className={`px-6 h-12 rounded-xl font-bold transition-all border-2 flex items-center gap-2 ${
                    currentPage === Math.ceil(properties.length / propertiesPerPage)
                      ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed'
                      : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                  }`}
                >
                  Next
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'Reviews' && (
          <>
            {/* Reviews Section */}
            <div className="mt-4">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="text-4xl font-black text-gray-900 mb-2">Clients Review</h2>
                  <p className="text-gray-500 font-medium">What people say about working with {agentFullName}</p>
                </div>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-[#1A1A1A] text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl flex items-center gap-3"
                >
                  Write a Review <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                </button>
              </div>

              <div className="space-y-8">
                {reviews.length > 0 ? reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-50 hover:shadow-xl transition-all duration-500">
                    <div className="flex items-center gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < review.rating ? "#F47D31" : "#E5E7EB"}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      ))}
                      <span className="text-sm font-bold text-gray-400 ml-3">
                        {new Date(review.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xl text-gray-600 leading-relaxed italic mb-10">"{review.comment}"</p>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-[#FFF8F1] overflow-hidden border-2 border-[#F47D31]/10">
                        <img
                          src={review.reviewer?.profile_image || `https://ui-avatars.com/api/?name=${review.reviewer?.first_name || 'User'}&background=FFF8F1&color=F47D31`}
                          alt={review.reviewer?.first_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-gray-900">{review.reviewer?.first_name || review.reviewer?.username || 'Anonymous'}</h4>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-20 bg-white rounded-[48px] shadow-sm">
                    <div className="w-20 h-20 bg-[#FFF8F1] rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F47D31" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No Reviews Yet</h3>
                    <p className="text-gray-500">Be the first to share your experience!</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'About' && (
          <>
            {/* About Section */}
            <div className="bg-white rounded-[48px] p-8 md:p-16 mt-4 shadow-sm border border-gray-50">
              <div className="flex flex-col lg:flex-row gap-16 items-start">
                <div className="w-full lg:w-1/3 flex flex-col items-center">
                  <div className="w-full aspect-4/5 rounded-4xl overflow-hidden shadow-2xl mb-8">
                    <img
                      src={agent?.profile_image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80"}
                      alt={agentFullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-8 mb-12">
                    {agent?.experience > 0 && (
                      <div>
                        <h4 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Experience</h4>
                        <p className="text-xl font-extrabold text-gray-900">{agent.experience}+ Years</p>
                      </div>
                    )}
                    {agent?.property_types && (
                      <div>
                        <h4 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Property Types</h4>
                        <p className="text-xl font-extrabold text-gray-900">{agent.property_types}</p>
                      </div>
                    )}
                    {agent?.area && (
                      <div>
                        <h4 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Area</h4>
                        <p className="text-xl font-extrabold text-gray-900">{agent.area}</p>
                      </div>
                    )}
                    {agent?.address && (
                      <div>
                        <h4 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Address</h4>
                        <p className="text-xl font-extrabold text-gray-900">{agent.address}</p>
                      </div>
                    )}
                    {agent?.license_no && (
                      <div>
                        <h4 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">License No</h4>
                        <p className="text-xl font-extrabold text-gray-900">{agent.license_no}</p>
                      </div>
                    )}
                  </div>
                  {agent?.bio && (
                    <div className="mt-12">
                      <h4 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-4">About</h4>
                      <p className="text-gray-600 leading-relaxed text-lg italic">{agent.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'Contact' && (
          <>
            {/* Contact Section */}
            <div className="bg-white rounded-[48px] p-8 md:p-16 mt-4 shadow-sm border border-gray-50">
              <div className="flex flex-col lg:flex-row gap-16 items-start">
                <div className="w-full lg:w-1/3 flex flex-col items-center">
                  <div className="w-full aspect-4/5 rounded-4xl overflow-hidden shadow-2xl mb-8">
                    <img
                      src={agent?.profile_image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80"}
                      alt={agentFullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-center">
                    <h2 className="text-3xl font-black text-gray-900 mb-2">{agentFullName}</h2>
                    <div className="flex flex-col gap-4 text-left max-w-xs mx-auto">
                      {agent?.phone && (
                        <div className="flex items-center gap-4 text-gray-600 font-bold">
                          <div className="w-10 h-10 rounded-full bg-[#FFF8F1] flex items-center justify-center shrink-0">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F47D31" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                          </div>
                          <span>{agent.phone}</span>
                        </div>
                      )}
                      {agent?.user?.email && (
                        <div className="flex items-center gap-4 text-gray-600 font-bold">
                          <div className="w-10 h-10 rounded-full bg-[#FFF8F1] flex items-center justify-center shrink-0">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F47D31" strokeWidth="2"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                          </div>
                          <span>{agent.user.email}</span>
                        </div>
                      )}
                    </div>
                    <button className="w-full mt-10 bg-[#1A1A1A] text-white py-5 rounded-2xl font-extrabold hover:bg-gray-800 transition-all shadow-xl">
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>


      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-[#1A1A1A]/40 backdrop-blur-md flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-[48px] p-10 md:p-16 w-full max-w-2xl shadow-2xl">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-4xl font-black text-gray-900 mb-2">Write a Review</h2>
                <p className="text-gray-500 font-medium">Share your experience working with {agentFullName}</p>
              </div>
              <button onClick={() => setShowReviewForm(false)} className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-10">
                <label className="block text-gray-900 font-black mb-4">How would you rate your experience?</label>
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className="focus:outline-none transition-transform hover:scale-125"
                    >
                      <svg
                        width="48" height="48"
                        viewBox="0 0 24 24"
                        fill={star <= reviewData.rating ? '#F47D31' : '#F1F1F1'}
                        className="transition-colors duration-300"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-12">
                <label className="block text-gray-900 font-black mb-4">Your detailed feedback</label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  rows={6}
                  className="w-full bg-[#FFF8F1] border-2 border-transparent rounded-4xl px-8 py-6 focus:outline-none focus:border-[#F47D31] transition-all text-gray-700 font-medium text-lg"
                  placeholder="Tell us more about the service, communication, and overall process..."
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="flex-1 px-10 py-5 bg-gray-50 rounded-2xl text-gray-500 font-black hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 px-10 py-5 bg-[#1A1A1A] text-white rounded-2xl font-black hover:bg-gray-800 transition-all shadow-xl disabled:opacity-50"
                >
                  {submittingReview ? 'Sending...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {reviewSuccess && (
        <div className="fixed bottom-10 right-10 bg-[#1A1A1A] text-white px-10 py-6 rounded-3xl shadow-2xl z-200 flex items-center gap-4 animate-bounce">
          <div className="w-10 h-10 bg-[#F47D31] rounded-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>
          </div>
          <span className="font-extrabold text-lg">Thank you! Your review has been shared.</span>
        </div>
      )}
    </div>
  );
};

export default AgentProfilePage;