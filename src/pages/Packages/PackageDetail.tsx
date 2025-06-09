import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, MapPin, Calendar, DollarSign } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const PackageDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { packages } = useData();
  
  const pkg = packages.find(p => p.id === id);

  if (!pkg) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/packages')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Package Not Found</h1>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">The requested package could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/packages')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pkg.title}</h1>
            <p className="text-gray-600">Package Details</p>
          </div>
        </div>
        <Link
          to={`/admin/packages/${pkg.id}/edit`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Package
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {pkg.images.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Images</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pkg.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${pkg.title} - Image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Description</h3>
            </div>
            <div className="p-4">
              <p className="text-gray-700">{pkg.short_description}</p>
            </div>
          </div>

          {/* Itinerary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Itinerary</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {pkg.itinerary.map((day, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Day {day.day}: {day.title}</h4>
                    <p className="text-gray-700 mt-1">{day.description}</p>
                    {day.activities && day.activities.length > 0 && (
                      <ul className="mt-2 text-sm text-gray-600">
                        {day.activities.map((activity, actIndex) => (
                          <li key={actIndex} className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            {activity}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Inclusions & Exclusions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Inclusions</h3>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {pkg.inclusions.map((inclusion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">{inclusion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Exclusions</h3>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {pkg.exclusions.map((exclusion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">✗</span>
                      <span className="text-gray-700">{exclusion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Package Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <DollarSign className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-semibold">₹{pkg.price.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-700">
                <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Destination</p>
                  <p className="font-semibold">{pkg.destination}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-700">
                <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-semibold">
                    {pkg.created_at ? new Date(pkg.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    pkg.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {pkg.status.charAt(0).toUpperCase() + pkg.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetail;