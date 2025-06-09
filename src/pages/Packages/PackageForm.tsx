import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { DESTINATIONS, ItineraryDay } from '../../types';

const PackageForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { packages, addPackage, updatePackage } = useData();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    short_description: '',
    itinerary: [] as ItineraryDay[],
    inclusions: [''],
    exclusions: [''],
    images: [''],
    destination: '',
    status: 'active' as 'active' | 'inactive'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      const pkg = packages.find(p => p.id === id);
      if (pkg) {
        setFormData({
          title: pkg.title,
          price: pkg.price.toString(),
          short_description: pkg.short_description || '',
          itinerary: pkg.itinerary.length > 0 ? pkg.itinerary : [{ day: 1, title: '', description: '', activities: [''] }],
          inclusions: pkg.inclusions.length > 0 ? pkg.inclusions : [''],
          exclusions: pkg.exclusions.length > 0 ? pkg.exclusions : [''],
          images: pkg.images.length > 0 ? pkg.images : [''],
          destination: pkg.destination,
          status: pkg.status
        });
      }
    } else {
      // Initialize with one day for new packages
      setFormData(prev => ({
        ...prev,
        itinerary: [{ day: 1, title: '', description: '', activities: [''] }]
      }));
    }
  }, [isEdit, id, packages]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 50) {
      newErrors.title = 'Title must be 50 characters or less';
    }

    const price = parseFloat(formData.price);
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(price) || price < 1000) {
      newErrors.price = 'Price must be at least ₹1,000';
    }

    if (!formData.short_description.trim()) {
      newErrors.short_description = 'Short description is required';
    } else if (formData.short_description.length > 120) {
      newErrors.short_description = 'Short description must be 120 characters or less';
    }

    if (!formData.destination) {
      newErrors.destination = 'Destination is required';
    }

    const validInclusions = formData.inclusions.filter(inc => inc.trim());
    if (validInclusions.length < 3) {
      newErrors.inclusions = 'At least 3 inclusions are required';
    }

    const validExclusions = formData.exclusions.filter(exc => exc.trim());
    if (validExclusions.length < 3) {
      newErrors.exclusions = 'At least 3 exclusions are required';
    }

    const validImages = formData.images.filter(img => img.trim());
    if (validImages.length < 3) {
      newErrors.images = 'At least 3 images are required';
    }

    // Validate itinerary
    const validItinerary = formData.itinerary.filter(day => day.title.trim() && day.description.trim());
    if (validItinerary.length === 0) {
      newErrors.itinerary = 'At least one day with title and description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const packageData = {
        title: formData.title.trim(),
        price: parseFloat(formData.price),
        short_description: formData.short_description.trim(),
        destination: formData.destination,
        status: formData.status,
        images: formData.images.filter(img => img.trim()),
        itinerary: formData.itinerary.filter(day => day.title.trim() && day.description.trim()),
        inclusions: formData.inclusions.filter(inc => inc.trim()),
        exclusions: formData.exclusions.filter(exc => exc.trim())
      };

      if (isEdit && id) {
        await updatePackage(id, packageData);
      } else {
        await addPackage(packageData);
      }

      navigate('/admin/packages');
    } catch (error) {
      console.error('Error saving package:', error);
      setErrors({ submit: 'Failed to save package. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addListItem = (field: 'inclusions' | 'exclusions' | 'images') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeListItem = (field: 'inclusions' | 'exclusions' | 'images', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateListItem = (field: 'inclusions' | 'exclusions' | 'images', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addItineraryDay = () => {
    const nextDay = formData.itinerary.length + 1;
    setFormData(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, { day: nextDay, title: '', description: '', activities: [''] }]
    }));
  };

  const removeItineraryDay = (index: number) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, i) => i !== index).map((day, i) => ({ ...day, day: i + 1 }))
    }));
  };

  const updateItineraryDay = (index: number, field: keyof ItineraryDay, value: any) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((day, i) => i === index ? { ...day, [field]: value } : day)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/admin/packages')}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Package' : 'Create Package'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Update package details' : 'Add a new travel package'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter package title (max 50 characters)"
            maxLength={50}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          <p className="mt-1 text-sm text-gray-500">{formData.title.length}/50 characters</p>
        </div>

        {/* Price and Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹) *
            </label>
            <input
              type="number"
              id="price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.price ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Minimum ₹1,000"
              min="1000"
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
          </div>

          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
              Destination *
            </label>
            <select
              id="destination"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.destination ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select destination</option>
              {DESTINATIONS.map(dest => (
                <option key={dest} value={dest}>{dest}</option>
              ))}
            </select>
            {errors.destination && <p className="mt-1 text-sm text-red-600">{errors.destination}</p>}
          </div>
        </div>

        {/* Short Description */}
        <div>
          <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-1">
            Short Description *
          </label>
          <textarea
            id="short_description"
            value={formData.short_description}
            onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.short_description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Brief description of the package (max 120 characters)"
            maxLength={120}
          />
          {errors.short_description && <p className="mt-1 text-sm text-red-600">{errors.short_description}</p>}
          <p className="mt-1 text-sm text-gray-500">{formData.short_description.length}/120 characters</p>
        </div>

        {/* Itinerary */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Itinerary *
            </label>
            <button
              type="button"
              onClick={addItineraryDay}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add Day
            </button>
          </div>
          {formData.itinerary.map((day, index) => (
            <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Day {day.day}</h4>
                {formData.itinerary.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItineraryDay(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={day.title}
                  onChange={(e) => updateItineraryDay(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Day title"
                />
                <textarea
                  value={day.description}
                  onChange={(e) => updateItineraryDay(index, 'description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Day description (max 100 words)"
                />
              </div>
            </div>
          ))}
          {errors.itinerary && <p className="mt-1 text-sm text-red-600">{errors.itinerary}</p>}
        </div>

        {/* Inclusions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Inclusions * (minimum 3)
            </label>
            <button
              type="button"
              onClick={() => addListItem('inclusions')}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add Item
            </button>
          </div>
          {formData.inclusions.map((inclusion, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={inclusion}
                onChange={(e) => updateListItem('inclusions', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Inclusion ${index + 1} (max 50 characters)`}
                maxLength={50}
              />
              {formData.inclusions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeListItem('inclusions', index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {errors.inclusions && <p className="mt-1 text-sm text-red-600">{errors.inclusions}</p>}
        </div>

        {/* Exclusions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Exclusions * (minimum 3)
            </label>
            <button
              type="button"
              onClick={() => addListItem('exclusions')}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add Item
            </button>
          </div>
          {formData.exclusions.map((exclusion, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={exclusion}
                onChange={(e) => updateListItem('exclusions', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Exclusion ${index + 1} (max 50 characters)`}
                maxLength={50}
              />
              {formData.exclusions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeListItem('exclusions', index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {errors.exclusions && <p className="mt-1 text-sm text-red-600">{errors.exclusions}</p>}
        </div>

        {/* Images */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Image URLs * (minimum 3)
            </label>
            <button
              type="button"
              onClick={() => addListItem('images')}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add Image
            </button>
          </div>
          {formData.images.map((image, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="url"
                value={image}
                onChange={(e) => updateListItem('images', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Image URL ${index + 1} (JPEG/PNG, 640x480 min, 2MB max)`}
              />
              {formData.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeListItem('images', index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
          <p className="mt-1 text-sm text-gray-500">
            Use high-quality images (minimum 640x480 resolution, maximum 2MB file size)
          </p>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Package Status
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="active"
                checked={formData.status === 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="mr-2"
              />
              Active
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="inactive"
                checked={formData.status === 'inactive'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="mr-2"
              />
              Inactive
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/admin/packages')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : (isEdit ? 'Update Package' : 'Create Package')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PackageForm;