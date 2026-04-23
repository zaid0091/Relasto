import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { profilesAPI, propertiesAPI, reviewsAPI } from '../services/api';

const AgentProfilePage = () => {
  const { id } = useParams();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [properties, setProperties] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('properties');

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/agents" className="text-blue-600 hover:text-blue-800">
            Back to Agents
          </Link>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Agent not found</p>
          <Link to="/agents" className="text-blue-600 hover:text-blue-800">
            Back to Agents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">Relasto</Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/properties" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Properties
              </Link>
              <Link to="/agents" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Agents
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                About
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Contact
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-700">
                    Welcome, {user?.first_name || user?.username}
                  </span>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={logout}
                    className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/agents" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
          &larr; Back to Agents
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-start space-x-6">
            <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-bold text-blue-600">
                {agent.user?.first_name?.[0] || agent.user?.username?.[0] || 'A'}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {agent.user?.first_name && agent.user?.last_name
                  ? `${agent.user.first_name} ${agent.user.last_name}`
                  : agent.user?.username || 'Agent'}
              </h1>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                {agent.city && (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {agent.city}{agent.state ? `, ${agent.state}` : ''}
                  </span>
                )}
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  {agent.average_rating?.toFixed(1) || '0.0'} ({agent.review_count || 0} reviews)
                </span>
              </div>
              {agent.bio && (
                <p className="mt-4 text-gray-600">{agent.bio}</p>
              )}
              {agent.phone && (
                <p className="mt-2 text-gray-600">
                  <span className="font-medium">Phone:</span> {agent.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('properties')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'properties'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Properties ({properties.length})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Reviews ({reviews.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'properties' && (
              properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <Link
                      key={property.id}
                      to={`/properties/${property.slug}`}
                      className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {property.primary_image?.image_url ? (
                        <img
                          src={property.primary_image.image_url}
                          alt={property.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 truncate">{property.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{property.city}, {property.state}</p>
                        <p className="text-lg font-bold text-blue-600 mt-2">
                          ${property.price?.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 capitalize">{property.status?.replace('_', ' ')}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">This agent has no properties listed yet.</p>
              )
            )}

            {activeTab === 'reviews' && (
              reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
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
                            <p className="text-gray-600 mt-2">{review.comment}</p>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">This agent has no reviews yet.</p>
              )
            )}
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Relasto. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AgentProfilePage;