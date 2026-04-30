import React from 'react';
import { Link } from 'react-router-dom';

const PropertyCard = ({ property }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sale':
        return 'bg-green-100 text-green-800';
      case 'rent':
        return 'bg-blue-100 text-blue-800';
      case 'sold':
        return 'bg-red-100 text-red-800';
      case 'rented':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const primaryImage = property.primary_image;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
    
      <div className="relative h-48 bg-gray-200">
        {primaryImage ? (
          <img
            src={primaryImage.image_url}
            alt={primaryImage.alt_text || property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
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
        )}
        
        
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status)}`}>
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </span>
        </div>
      </div>

      
      <div className="p-4">
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {property.title}
        </h3>

       
        <div className="text-2xl font-bold text-blue-600 mb-2">
          {formatPrice(property.price)}
        </div>

       
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {property.city}, {property.state}
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500 capitalize">
            {property.property_type}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
              <span className="text-xs font-medium text-gray-600">
                {property.agent.user.first_name?.[0] || property.agent.user.username[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {property.agent.user.first_name || property.agent.user.username}
              </p>
              {property.agent.average_rating > 0 && (
                <div className="flex items-center">
                  <svg
                    className="w-3 h-3 text-yellow-400 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs text-gray-600">
                    {property.agent.average_rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Link
          to={`/properties/${property.slug}`}
          className="block w-full mt-3 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default PropertyCard;
