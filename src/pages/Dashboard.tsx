import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Users, Calendar, TrendingUp } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import StatCard from '../components/UI/StatCard';

const Dashboard: React.FC = () => {
  const { packages, bookings, loading } = useData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = {
    totalPackages: packages.length,
    activePackages: packages.filter(pkg => pkg.status === 'active').length,
    pendingBookings: bookings.filter(booking => booking.status === 'pending').length,
    totalBookings: bookings.length
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Packages"
          value={stats.totalPackages}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Active Packages"
          value={stats.activePackages}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Pending Bookings"
          value={stats.pendingBookings}
          icon={Calendar}
          color="yellow"
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={Users}
          color="red"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Management</h3>
          <p className="text-gray-600 mb-4">Create, edit, and manage travel packages</p>
          <Link
            to="/admin/packages"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Package className="w-4 h-4 mr-2" />
            Manage Packages
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Management</h3>
          <p className="text-gray-600 mb-4">View and manage customer bookings</p>
          <Link
            to="/admin/bookings"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Users className="w-4 h-4 mr-2" />
            Manage Bookings
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
        </div>
        <div className="p-6">
          {bookings.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No bookings yet</p>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{booking.user_name}</p>
                    <p className="text-sm text-gray-600">{booking.package_title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;