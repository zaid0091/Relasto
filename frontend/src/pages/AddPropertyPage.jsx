import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { propertiesAPI } from '../services/api';
import Navbar from '../components/Navbar';

const AddPropertyPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams();
  const isEditMode = Boolean(slug);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    property_type: 'residential',
    status: 'sale',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    bedrooms: '',
    bathrooms: '',
    square_feet: '',
    lot_size: '',
    year_built: '',
    features: '',
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [featuresList, setFeaturesList] = useState([]);
  const fileInputRef = useRef(null);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUrlChange = (index, value) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const addImageUrlField = () => {
    setImageUrls(prev => [...prev, '']);
  };

  const removeImageUrlField = (index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      prev.forEach((url, i) => {
        if (i !== index && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      return newPreviews;
    });
  };

  const addFeature = () => {
    setFeaturesList(prev => [...prev, { key: '', value: '' }]);
  };

  const removeFeature = (index) => {
    setFeaturesList(prev => prev.filter((_, i) => i !== index));
  };

  const handleFeatureChange = (index, field, value) => {
    setFeaturesList(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f));
  };

  const removeExistingImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await propertiesAPI.deleteImage(slug, imageId);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) {
      alert('Failed to delete image');
    }
  };

  const setPrimaryImage = async (imageId) => {
    try {
      await propertiesAPI.setPrimaryImage(slug, imageId);
      setExistingImages(prev => prev.map(img => ({ ...img, is_primary: img.id === imageId })));
    } catch (err) {
      alert('Failed to set primary image');
    }
  };

  useEffect(() => {
    if (isEditMode && slug) {
      const fetchProperty = async () => {
        setFetching(true);
        try {
          const response = await propertiesAPI.getProperty(slug);
          const property = response.data.data.property;
          setFormData({
            title: property.title || '',
            description: property.description || '',
            price: property.price || '',
            property_type: property.property_type || 'residential',
            status: property.status || 'sale',
            address: property.address || '',
            city: property.city || '',
            state: property.state || '',
            zip_code: property.zip_code || '',
            bedrooms: property.attributes?.bedrooms || '',
            bathrooms: property.attributes?.bathrooms || '',
            square_feet: property.attributes?.square_feet || '',
            lot_size: property.attributes?.lot_size || '',
            year_built: property.attributes?.year_built || '',
            features: '',
          });
          setFeaturesList(property.features?.map(f => ({ key: f.feature_key, value: f.feature_value })) || []);
          setExistingImages(property.images || []);
        } catch (err) {
          setError('Failed to load property');
        } finally {
          setFetching(false);
        }
      };
      fetchProperty();
    }
  }, [slug, isEditMode]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a valid number';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
        square_feet: formData.square_feet ? parseInt(formData.square_feet) : null,
        lot_size: formData.lot_size ? parseFloat(formData.lot_size) : null,
        year_built: formData.year_built ? parseInt(formData.year_built) : null,
        features: featuresList.filter(f => f.key.trim()).map(f => ({ key: f.key.trim(), value: f.value?.trim() || '' })),
      };

      if (isEditMode) {
        const attributes = {
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
          square_feet: formData.square_feet ? parseInt(formData.square_feet) : null,
          lot_size: formData.lot_size ? parseFloat(formData.lot_size) : null,
          year_built: formData.year_built ? parseInt(formData.year_built) : null,
        };

        const updatePayload = {
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          property_type: formData.property_type,
          status: formData.status,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code || '',
          attributes: attributes,
          features: featuresList.filter(f => f.key.trim()).map(f => ({ key: f.key.trim(), value: f.value?.trim() || '' })),
        };

        await propertiesAPI.updateProperty(slug, updatePayload);

        if (imageFiles.length > 0) {
          for (let i = 0; i < imageFiles.length; i++) {
            try {
              const imageFormData = new FormData();
              imageFormData.append('image', imageFiles[i]);
              imageFormData.append('is_primary', i === 0);
              imageFormData.append('alt_text', `${formData.title} - Image ${i + 1}`);
              await propertiesAPI.addImage(slug, imageFormData, true);
            } catch (imgErr) {
              console.error('Failed to add image:', imgErr);
            }
          }
        }

        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        const featuresJson = JSON.stringify(featuresList.filter(f => f.key.trim()).map(f => ({ key: f.key.trim(), value: f.value?.trim() || '' })));

        const propertyFormData = new FormData();
        Object.keys(payload).forEach(key => {
          if (key === 'features') {
            propertyFormData.append(key, featuresJson);
          } else if (payload[key] !== '' && payload[key] !== null) {
            propertyFormData.append(key, payload[key]);
          }
        });

        const response = await propertiesAPI.createProperty(propertyFormData, true);
        const propertyId = response.data.data?.property?.id || response.data.data?.id;

        if (propertyId && imageFiles.length > 0) {
          for (let i = 0; i < imageFiles.length; i++) {
            try {
              const imageFormData = new FormData();
              imageFormData.append('image', imageFiles[i]);
              imageFormData.append('is_primary', i === 0);
              imageFormData.append('alt_text', `${formData.title} - Image ${i + 1}`);
              await propertiesAPI.addImage(propertyId, imageFormData, true);
            } catch (imgErr) {
              console.error('Failed to add image:', imgErr);
            }
          }
        }

        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      const errorData = err.response?.data?.error;
      let errorMessage = isEditMode ? 'Failed to update property' : 'Failed to create property';

      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (typeof errorData === 'object') {
        const messages = [];
        for (const [field, errors] of Object.entries(errorData)) {
          if (Array.isArray(errors)) {
            messages.push(`${field}: ${errors.join(', ')}`);
          } else {
            messages.push(`${field}: ${errors}`);
          }
        }
        errorMessage = messages.join(' | ');
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="light" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-6">
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm">
            &larr; Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              {isEditMode ? 'Edit Property' : 'Add New Property'}
            </h1>

            {fetching && (
              <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-md">
                Loading property data...
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
                {isEditMode ? 'Property updated successfully! Redirecting to dashboard...' : 'Property created successfully! Redirecting to dashboard...'}
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="e.g., Beautiful 3BR House with Garden"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Describe the property in detail..."
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="250000"
                  />
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type
                  </label>
                  <select
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="agricultural">Agricultural</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                    <option value="sold">Sold</option>
                    <option value="rented">Rented</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Square Feet
                  </label>
                  <input
                    type="number"
                    name="square_feet"
                    value={formData.square_feet}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lot Size (acres)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="lot_size"
                    value={formData.lot_size}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year Built
                  </label>
                  <input
                    type="number"
                    name="year_built"
                    value={formData.year_built}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2020"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="123 Main Street"
                  />
                  {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="New York"
                  />
                  {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="NY"
                  />
                  {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10001"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Features
                  </label>
                  <div className="space-y-2">
                    {featuresList.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={feature.key}
                          onChange={(e) => handleFeatureChange(index, 'key', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Feature name (e.g., Pool)"
                        />
                        <input
                          type="text"
                          value={feature.value}
                          onChange={(e) => handleFeatureChange(index, 'value', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Value (e.g., Yes)"
                        />
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addFeature}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      + Add Feature
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Images
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Choose Files
                  </button>
                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="h-24 w-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {existingImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Existing Images</p>
                      <div className="grid grid-cols-4 gap-4">
                        {existingImages.map((img) => (
                          <div key={img.id} className="relative">
                            <img
                              src={img.image_url}
                              alt={img.alt_text || 'Property image'}
                              className={`h-24 w-full object-cover rounded-md ${img.is_primary ? 'ring-2 ring-blue-500' : ''}`}
                            />
                            {img.is_primary && (
                              <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">Primary</span>
                            )}
                            <div className="absolute top-1 right-1 flex gap-1">
                              {!img.is_primary && (
                                <button
                                  type="button"
                                  onClick={() => setPrimaryImage(img.id)}
                                  className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                  title="Set as primary"
                                >
                                  ★
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeExistingImage(img.id)}
                                className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                title="Delete image"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <Link
                  to="/dashboard"
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Property' : 'Create Property')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddPropertyPage;