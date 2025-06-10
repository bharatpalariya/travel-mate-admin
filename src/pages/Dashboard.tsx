import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Users, Calendar, TrendingUp, DollarSign, UserCheck, CreditCard, ShoppingCart } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import StatCard from '../components/UI/StatCard';

const Dashboard: React.FC = () => {
  const { packages, bookings, userStats, paymentStats, loading } = useData();

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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your TravelMate admin dashboard</p>
      </div>

      {/* User Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">User Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Users"
            value={userStats.totalUsers}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Active Users"
            value={userStats.activeUsers}
            icon={UserCheck}
            color="green"
          />
          <StatCard
            title="New Users This Month"
            value={userStats.newUsersThisMonth}
            icon={TrendingUp}
            color="yellow"
          />
        </div>
      </div>

      {/* Payment Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold mt-1">₹{paymentStats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <StatCard
            title="Total Orders"
            value={paymentStats.totalOrders}
            icon={ShoppingCart}
            color="blue"
          />
          
          <StatCard
            title="Completed Orders"
            value={paymentStats.completedOrders}
            icon={CreditCard}
            color="green"
          />
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Avg Order Value</p>
                <p className="text-3xl font-bold mt-1">₹{Math.round(paymentStats.averageOrderValue).toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-400 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Package & Booking Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Overview</h2>
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
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Management</h3>
          <p className="text-gray-600 mb-6">Create, edit, and manage travel packages for your customers</p>
          <Link
            to="/admin/packages"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Package className="w-5 h-5 mr-2" />
            Manage Packages
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Management</h3>
          <p className="text-gray-600 mb-6">View and manage customer bookings and reservations</p>
          <Link
            to="/admin/bookings"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Users className="w-5 h-5 mr-2" />
            Manage Bookings
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
        </div>
        <div className="p-6">
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No bookings yet</p>
              <p className="text-sm text-gray-400 mt-1">Bookings will appear here once customers start making reservations</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{booking.user_name}</p>
                        <p className="text-sm text-gray-600">{booking.package_title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
              {bookings.length > 5 && (
                <div className="text-center pt-4">
                  <Link
                    to="/admin/bookings"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View all bookings →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;