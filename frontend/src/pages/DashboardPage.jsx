import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { propertiesAPI, reviewsAPI, visitsAPI } from '../services/api';
import Navbar from '../components/Navbar';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [myProperties, setMyProperties] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [receivedReviews, setReceivedReviews] = useState([]);
  const [myVisitRequests, setMyVisitRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editFormData, setEditFormData] = useState({ rating: 5, comment: '' });
  const [updatingReview, setUpdatingReview] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const promises = [];

        if (user?.is_agent || user?.is_superuser) {
          promises.push(propertiesAPI.getMyProperties());
          promises.push(visitsAPI.getAgentRequests());
          promises.push(reviewsAPI.getReceivedReviews(user.id));
          promises.push(reviewsAPI.getMyReviews());
        } else {
          promises.push(visitsAPI.getMyRequests());
          promises.push(reviewsAPI.getMyReviews());
        }

        const results = await Promise.all(promises);

        if (user?.is_agent || user?.is_superuser) {
          setMyProperties(results[0].data.data.properties || []);
          setMyVisitRequests(results[1].data.data.visit_requests || []);
          setReceivedReviews(results[2].data.data?.reviews || []);
          setMyReviews(results[3].data.data.reviews || []);
        } else {
          setMyVisitRequests(results[0].data.data.visit_requests || []);
          setMyReviews(results[1].data.data.reviews || []);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }
    
    try {
      await propertiesAPI.deleteProperty(propertyId);
      setMyProperties(prev => prev.filter(p => p.id !== propertyId));
    } catch (err) {
      alert('Failed to delete property');
    }
  };

  const handleUpdateVisitStatus = async (requestId, newStatus) => {
    try {
      await visitsAPI.updateVisitRequest(requestId, { status: newStatus });
      setMyVisitRequests(prev => 
        prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r)
      );
    } catch (err) {
      alert('Failed to update request status');
    }
  };

  const handleCancelVisitRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this visit request?')) {
      return;
    }
    try {
      await visitsAPI.updateVisitRequest(requestId, { status: 'cancelled' });
      setMyVisitRequests(prev => 
        prev.map(r => r.id === requestId ? { ...r, status: 'cancelled' } : r)
      );
    } catch (err) {
      alert('Failed to cancel request');
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setEditFormData({ rating: review.rating, comment: review.comment || '' });
    setShowEditModal(true);
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    setUpdatingReview(true);
    try {
      await reviewsAPI.updateReview(editingReview.id, {
        rating: editFormData.rating,
        comment: editFormData.comment,
      });
      const response = await reviewsAPI.getMyReviews();
      setMyReviews(response.data.data.reviews || []);
      setShowEditModal(false);
      setEditingReview(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update review');
    } finally {
      setUpdatingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
    try {
      await reviewsAPI.deleteReview(reviewId);
      setMyReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete review');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF9F6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F47D31]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF9F6]">
      <Navbar />

      {/* Dashboard Content */}
      <main className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-20">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">Dashboard</h1>
          <p className="text-[#666] text-lg">
            Manage your properties, reviews, and visit requests
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-10 overflow-x-auto hide-scrollbar">
          <nav className="-mb-px flex space-x-8 min-w-max">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-bold text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-[#F47D31] text-[#F47D31]'
                  : 'border-transparent text-[#666] hover:text-[#1A1A1A] hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            {user?.is_agent && (
              <button
                onClick={() => setActiveTab('properties')}
                className={`py-4 px-1 border-b-2 font-bold text-sm transition-colors ${
                  activeTab === 'properties'
                    ? 'border-[#F47D31] text-[#F47D31]'
                    : 'border-transparent text-[#666] hover:text-[#1A1A1A] hover:border-gray-300'
                }`}
              >
                My Properties
              </button>
            )}
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-1 border-b-2 font-bold text-sm transition-colors ${
                activeTab === 'reviews'
                  ? 'border-[#F47D31] text-[#F47D31]'
                  : 'border-transparent text-[#666] hover:text-[#1A1A1A] hover:border-gray-300'
              }`}
            >
              {user?.is_agent ? 'My Reviews (Written)' : 'My Reviews'}
            </button>
            {user?.is_agent && (
              <button
                onClick={() => setActiveTab('received')}
                className={`py-4 px-1 border-b-2 font-bold text-sm transition-colors ${
                  activeTab === 'received'
                    ? 'border-[#F47D31] text-[#F47D31]'
                    : 'border-transparent text-[#666] hover:text-[#1A1A1A] hover:border-gray-300'
                }`}
              >
                Received Reviews ({receivedReviews.length})
              </button>
            )}
            <button
              onClick={() => setActiveTab('visits')}
              className={`py-4 px-1 border-b-2 font-bold text-sm transition-colors ${
                activeTab === 'visits'
                  ? 'border-[#F47D31] text-[#F47D31]'
                  : 'border-transparent text-[#666] hover:text-[#1A1A1A] hover:border-gray-300'
              }`}
            >
              Visit Requests
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-[15px] border border-orange-200 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="shrink-0 bg-orange-50 rounded-xl p-4">
                    <svg
                      className="h-7 w-7 text-[#F47D31]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-bold text-[#666] truncate uppercase tracking-wider">
                        {user?.is_agent ? 'My Properties' : 'Visit Requests'}
                      </dt>
                      <dd className="text-3xl font-black text-[#1A1A1A] mt-1">
                        {user?.is_agent ? myProperties.length : myVisitRequests.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[15px] border border-orange-200 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="shrink-0 bg-orange-50 rounded-xl p-4">
                    <svg
                      className="h-7 w-7 text-[#F47D31]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-bold text-[#666] truncate uppercase tracking-wider">Reviews</dt>
                      <dd className="text-3xl font-black text-[#1A1A1A] mt-1">{myReviews.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[15px] border border-orange-200 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="shrink-0 bg-orange-50 rounded-xl p-4">
                    <svg
                      className="h-7 w-7 text-[#F47D31]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-bold text-[#666] truncate uppercase tracking-wider">Profile Status</dt>
                      <dd className="text-xl font-bold text-[#1A1A1A] mt-2">
                        <span className="bg-orange-50 text-[#F47D31] px-3 py-1 rounded-lg">
                          {user?.is_superuser ? 'Admin' : user?.is_agent ? 'Agent' : 'User'}
                        </span>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-[15px] border border-orange-200 shadow-sm">
              <div className="px-6 py-6 md:p-8">
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-[#F47D31] rounded-full" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {myVisitRequests.slice(0, 5).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-[#E5E5E5]">
                      <div>
                        <p className="text-base font-bold text-[#1A1A1A]">
                          Visit request for {request.property.title}
                        </p>
                        <p className="text-sm text-[#666] mt-1">
                          Status: <span className="capitalize font-semibold text-[#F47D31]">{request.status}</span>
                        </p>
                      </div>
                      <div className="text-sm font-medium text-[#999]">
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {myVisitRequests.length === 0 && (
                    <p className="text-base text-[#666] italic">No recent activity found.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'properties' && (user?.is_agent || user?.is_superuser) && (
          <div className="bg-white rounded-[15px] border border-orange-200 shadow-sm">
            <div className="px-6 py-6 md:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h3 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-[#F47D31] rounded-full" />
                  My Properties
                </h3>
                {user?.is_agent && (
                  <Link
                    to="/properties/new"
                    className="bg-[#F47D31] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#e06d25] transition-all shadow-md shadow-orange-200"
                  >
                    + Add Property
                  </Link>
                )}
              </div>
              {myProperties.length > 0 ? (
                <div className="space-y-4">
                  {myProperties.map((property) => (
                    <div key={property.id} className="border border-[#E5E5E5] rounded-xl p-5 hover:border-orange-200 transition-colors">
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                          <h4 className="text-lg font-bold text-[#1A1A1A]">{property.title}</h4>
                          <p className="text-sm text-[#666] mt-1">{property.address}, {property.city}</p>
                          <p className="text-sm text-[#666] mt-1">Status: <span className="capitalize font-semibold text-[#F47D31]">{property.status}</span></p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-xl font-black text-[#F47D31]">
                            ${property.price.toLocaleString()}
                          </p>
                          <div className="mt-3 space-x-3">
                            <Link
                              to={`/properties/${property.slug}/edit`}
                              className="text-sm font-bold text-[#666] hover:text-[#1A1A1A] transition-colors"
                            >
                              Edit
                            </Link>
                            <button 
                              onClick={() => handleDeleteProperty(property.id)}
                              className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#666] italic">You haven't listed any properties yet.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white rounded-[15px] border border-orange-200 shadow-sm">
            <div className="px-6 py-6 md:p-8">
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-8 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#F47D31] rounded-full" />
                My Reviews
              </h3>
              {myReviews.length > 0 ? (
                <div className="space-y-4">
                  {myReviews.map((review) => (
                    <div key={review.id} className="border border-[#E5E5E5] rounded-xl p-5">
                      <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                        <div>
                          <h4 className="text-lg font-bold text-[#1A1A1A]">
                            Review for {review.agent_profile.user.first_name || review.agent_profile.user.username}
                          </h4>
                          <div className="flex items-center mt-2 gap-1">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`h-5 w-5 ${
                                  i < review.rating ? 'text-[#F47D31]' : 'text-gray-200'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          {review.comment && (
                            <p className="text-base text-[#666] mt-3">{review.comment}</p>
                          )}
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-sm font-medium text-[#999]">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                          <div className="mt-3 space-x-3">
                            <button 
                              onClick={() => handleEditReview(review)}
                              className="text-sm font-bold text-[#666] hover:text-[#1A1A1A] transition-colors"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteReview(review.id)}
                              className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#666] italic">You haven't written any reviews yet.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'received' && user?.is_agent && (
          <div className="bg-white rounded-[15px] border border-orange-200 shadow-sm">
            <div className="px-6 py-6 md:p-8">
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-8 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#F47D31] rounded-full" />
                Reviews About Me
              </h3>
              {receivedReviews.length > 0 ? (
                <div className="space-y-4">
                  {receivedReviews.map((review) => (
                    <div key={review.id} className="border border-[#E5E5E5] rounded-xl p-5">
                      <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#F47D31] font-bold">
                              {(review.reviewer?.first_name?.[0] || review.reviewer?.username?.[0] || '?').toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-[#1A1A1A]">
                                {review.reviewer?.first_name || review.reviewer?.username || 'Anonymous'}
                              </span>
                              <div className="flex items-center gap-1 mt-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? 'text-[#F47D31]' : 'text-gray-200'
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-base text-[#666] mt-3 pl-13">{review.comment}</p>
                          )}
                        </div>
                        <div className="text-left md:text-right pl-13 md:pl-0">
                          <p className="text-sm font-medium text-[#999]">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#666] italic">You haven't received any reviews yet.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'visits' && (
          <div className="bg-white rounded-[15px] border border-orange-200 shadow-sm">
            <div className="px-6 py-6 md:p-8">
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-8 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#F47D31] rounded-full" />
                {user?.is_agent ? 'Received Visit Requests' : 'My Visit Requests'}
              </h3>
              {myVisitRequests.length > 0 ? (
                <div className="space-y-4">
                  {myVisitRequests.map((request) => (
                    <div key={request.id} className="border border-[#E5E5E5] rounded-xl p-5 hover:border-orange-200 transition-colors">
                      <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-[#1A1A1A]">{request.property.title}</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-gray-50 p-4 rounded-xl border border-[#E5E5E5]">
                            <div>
                              <p className="text-xs font-bold text-[#999] uppercase tracking-wider mb-1">Status & Date</p>
                              <p className="text-sm text-[#1A1A1A]">
                                <span className="capitalize font-bold text-[#F47D31] bg-orange-50 px-2 py-0.5 rounded-md inline-block mr-2">{request.status}</span>
                                {new Date(request.preferred_date).toLocaleDateString()}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-xs font-bold text-[#999] uppercase tracking-wider mb-1">Contact Info</p>
                              <p className="text-sm text-[#1A1A1A]">
                                {request.contact_email} <br/> {request.contact_phone}
                              </p>
                            </div>
                          </div>

                          {request.message && (
                            <div className="mt-4">
                              <p className="text-xs font-bold text-[#999] uppercase tracking-wider mb-1">Message</p>
                              <p className="text-sm text-[#666] bg-[#FDF9F6] p-3 rounded-lg border border-orange-100">{request.message}</p>
                            </div>
                          )}
                          {user?.is_agent && (
                            <p className="text-xs font-bold text-[#999] mt-4 flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                👤
                              </span>
                              Requested by: {request.user?.first_name || request.user?.username || request.user?.email || 'Guest User'}
                            </p>
                          )}
                        </div>
                        <div className="text-left md:text-right flex flex-col md:items-end justify-between min-h-full">
                          <p className="text-sm font-medium text-[#999] mb-4 md:mb-0">
                            Requested on {new Date(request.created_at).toLocaleDateString()}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 md:justify-end mt-4">
                            {request.status === 'pending' && (
                              <>
                                {user?.is_agent ? (
                                  <>
                                    <button 
                                      onClick={() => handleUpdateVisitStatus(request.id, 'completed')}
                                      className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors"
                                    >
                                      Complete
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateVisitStatus(request.id, 'reviewed')}
                                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors"
                                    >
                                      Mark Reviewed
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateVisitStatus(request.id, 'cancelled')}
                                      className="px-4 py-2 bg-red-50 text-red-500 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <button 
                                    onClick={() => handleCancelVisitRequest(request.id)}
                                    className="px-4 py-2 bg-red-50 text-red-500 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
                                  >
                                    Cancel Request
                                  </button>
                                )}
                              </>
                            )}
                            {request.status !== 'pending' && user?.is_agent && (
                              <button 
                                onClick={() => handleUpdateVisitStatus(request.id, 'pending')}
                                className="px-4 py-2 bg-gray-100 text-[#666] rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
                              >
                                Reopen
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#666] italic">
                  {user?.is_agent 
                    ? "You haven't received any visit requests yet."
                    : "You haven't made any visit requests yet."
                  }
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Edit Review Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-[#1A1A1A]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[20px] p-6 md:p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-[#F47D31] rounded-full" />
              Edit Review
            </h2>
            <form onSubmit={handleUpdateReview}>
              <div className="mb-6">
                <label className="block text-sm font-bold text-[#1A1A1A] mb-3">Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, rating: star })}
                      className="focus:outline-none hover:scale-110 transition-transform"
                    >
                      <svg
                        className={`h-10 w-10 ${star <= editFormData.rating ? 'text-[#F47D31]' : 'text-gray-200'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-8">
                <label className="block text-sm font-bold text-[#1A1A1A] mb-3">Comment (optional)</label>
                <textarea
                  value={editFormData.comment}
                  onChange={(e) => setEditFormData({ ...editFormData, comment: e.target.value })}
                  rows={4}
                  className="w-full px-5 py-4 rounded-xl border border-[#E5E5E5] focus:border-[#F47D31] focus:ring-0 outline-none transition-all placeholder:text-[#999] resize-none"
                  placeholder="Share your experience with this agent..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2.5 border border-[#E5E5E5] rounded-xl text-[#666] font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingReview}
                  className="px-6 py-2.5 bg-[#F47D31] text-white rounded-xl font-bold hover:bg-[#e06d25] transition-all disabled:opacity-50 shadow-md shadow-orange-200"
                >
                  {updatingReview ? 'Updating...' : 'Update Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
