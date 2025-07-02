import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import ConfirmationModal from '../../components/UI/ConfirmationModal';

const PackageList: React.FC = () => {
  const { packages, deletePackage, loading } = useData();
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; packageId: string; packageTitle: string }>({
    isOpen: false,
    packageId: '',
    packageTitle: ''
  });

  const handleDeleteClick = (pkg: any) => {
    setDeleteModal({
      isOpen: true,
      packageId: pkg.id,
      packageTitle: pkg.title
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deletePackage(deleteModal.packageId);
      setDeleteModal({ isOpen: false, packageId: '', packageTitle: '' });
    } catch (error) {
      console.error('Error deleting package:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Packages</h1>
          <p className="text-gray-600">Manage your travel packages</p>
        </div>
        <Link
          to="/admin/packages/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Package
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {packages.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No packages found. Create your first package to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {pkg.images?.[0] && (
                          <img
                            className="h-10 w-10 rounded-lg object-cover mr-4"
                            src={pkg.images[0]}
                            alt={pkg.title}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{pkg.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {pkg.short_description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{pkg.price.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{pkg.destination}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        pkg.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {pkg.status.charAt(0).toUpperCase() + pkg.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/admin/packages/${pkg.id}`}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/admin/packages/${pkg.id}/edit`}
                          className="text-blue-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(pkg)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, packageId: '', packageTitle: '' })}
        onConfirm={handleDeleteConfirm}
        title="Delete Package"
        message={`Are you sure you want to delete "${deleteModal.packageTitle}"? This action cannot be undone and will remove all associated images from the server.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default PackageList;