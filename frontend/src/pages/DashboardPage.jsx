import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { propertiesAPI, reviewsAPI, visitsAPI } from '../services/api';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">Relasto</h1>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.first_name || user?.username}</span>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage your properties, reviews, and visit requests
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            {user?.is_agent && (
              <button
                onClick={() => setActiveTab('properties')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'properties'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Properties
              </button>
            )}
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {user?.is_agent ? 'My Reviews (Written)' : 'My Reviews'}
            </button>
            {user?.is_agent && (
              <button
                onClick={() => setActiveTab('received')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'received'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Received Reviews ({receivedReviews.length})
              </button>
            )}
            <button
              onClick={() => setActiveTab('visits')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'visits'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visit Requests
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <svg
                      className="h-6 w-6 text-blue-600"
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
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {user?.is_agent ? 'My Properties' : 'Visit Requests'}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {user?.is_agent ? myProperties.length : myVisitRequests.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <svg
                      className="h-6 w-6 text-green-600"
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Reviews</dt>
                      <dd className="text-lg font-medium text-gray-900">{myReviews.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                    <svg
                      className="h-6 w-6 text-yellow-600"
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Profile Status</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {user?.is_superuser ? 'Admin' : user?.is_agent ? 'Agent' : 'User'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {myVisitRequests.slice(0, 5).map((request) => (
                    <div key={request.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Visit request for {request.property.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          Status: <span className="capitalize">{request.status}</span>
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {myVisitRequests.length === 0 && (
                    <p className="text-sm text-gray-500">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'properties' && (user?.is_agent || user?.is_superuser) && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">My Properties</h3>
                {user?.is_agent && (
                  <Link
                    to="/properties/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Add Property
                  </Link>
                )}
              </div>
              {myProperties.length > 0 ? (
                <div className="space-y-4">
                  {myProperties.map((property) => (
                    <div key={property.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{property.title}</h4>
                          <p className="text-sm text-gray-500">{property.address}, {property.city}</p>
                          <p className="text-sm text-gray-500">Status: <span className="capitalize">{property.status}</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-medium text-blue-600">
                            ${property.price.toLocaleString()}
                          </p>
                          <div className="mt-2 space-x-2">
                            <Link
                              to={`/properties/${property.slug}/edit`}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </Link>
                            <button 
                              onClick={() => handleDeleteProperty(property.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
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
                <p className="text-gray-500">You haven't listed any properties yet.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">My Reviews</h3>
              {myReviews.length > 0 ? (
                <div className="space-y-4">
                  {myReviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">
                            Review for {review.agent_profile.user.first_name || review.agent_profile.user.username}
                          </h4>
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          {review.comment && (
                            <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                          <div className="mt-2 space-x-2">
                            <button 
                              onClick={() => handleEditReview(review)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteReview(review.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
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
                <p className="text-gray-500">You haven't written any reviews yet.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'received' && user?.is_agent && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">Reviews About Me</h3>
              {receivedReviews.length > 0 ? (
                <div className="space-y-4">
                  {receivedReviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">
                              {review.reviewer?.username || 'Anonymous'}
                            </span>
                            <div className="ml-2 flex">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">You haven't received any reviews yet.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'visits' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                {user?.is_agent ? 'Received Visit Requests' : 'My Visit Requests'}
              </h3>
              {myVisitRequests.length > 0 ? (
                <div className="space-y-4">
                  {myVisitRequests.map((request) => (
                    <div key={request.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{request.property.title}</h4>
                          <p className="text-sm text-gray-500">
                            Preferred Date: {new Date(request.preferred_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Status: <span className="capitalize">{request.status}</span>
                          </p>
                          {user?.is_agent ? (
                            <p className="text-sm text-gray-500">
                              Contact: {request.contact_email} | {request.contact_phone}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500">
                              Contact: {request.contact_email} | {request.contact_phone}
                            </p>
                          )}
                          {request.message && (
                            <p className="text-sm text-gray-600 mt-2">{request.message}</p>
                          )}
                          {user?.is_agent && (
                            <p className="text-xs text-gray-400 mt-2">
                              Requested by: {request.user?.first_name || request.user?.username || request.user?.email || 'Guest User'}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                          {request.status === 'pending' && (
                            <div className="mt-2 space-x-2">
                              {user?.is_agent ? (
                                <>
                                  <button 
                                    onClick={() => handleUpdateVisitStatus(request.id, 'completed')}
                                    className="text-green-600 hover:text-green-800 text-sm"
                                  >
                                    Complete
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateVisitStatus(request.id, 'reviewed')}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    Mark Reviewed
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateVisitStatus(request.id, 'cancelled')}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <button 
                                  onClick={() => handleCancelVisitRequest(request.id)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          )}
                          {request.status !== 'pending' && user?.is_agent && (
                            <div className="mt-2">
                              <button 
                                onClick={() => handleUpdateVisitStatus(request.id, 'pending')}
                                className="text-gray-600 hover:text-gray-800 text-sm"
                              >
                                Reopen
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
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

    {showEditModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Review</h2>
          <form onSubmit={handleUpdateReview}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, rating: star })}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`h-8 w-8 ${star <= editFormData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Comment (optional)</label>
              <textarea
                value={editFormData.comment}
                onChange={(e) => setEditFormData({ ...editFormData, comment: e.target.value })}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Share your experience with this agent..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatingReview}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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
