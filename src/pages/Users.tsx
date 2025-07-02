import { Calendar, Eye, Filter, Mail, Search, ToggleLeft, ToggleRight, User, Users } from 'lucide-react';
import React, { useState } from 'react';
import Modal from '../components/UI/Modal';
import { useData } from '../contexts/DataContext';

const UsersPage: React.FC = () => {
  const { users, loading, updateUserStatus } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleStatusToggle = async (userId: string, currentStatus: 'active' | 'inactive') => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await updateUserStatus(userId, newStatus);
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
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
          <h1 className="text-2xl font-bold text-gray-900">Registered Users</h1>
          <p className="text-gray-600">Manage customer accounts and profiles</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => {
                  const userDate = new Date(u.created_at);
                  const now = new Date();
                  return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">With Profiles</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.full_name).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' ? 'No users match your filters.' : 'No users found.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Booking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Bookings
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
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.avatar_url ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.avatar_url}
                            alt={user.full_name || 'User'}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {getInitials(user.full_name)}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name || 'No name provided'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.last_booking 
                          ? new Date(user.last_booking).toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.total_bookings}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                        <button
                          onClick={() => handleStatusToggle(user.id, user.status)}
                          className={`transition-colors ${
                            user.status === 'active' 
                              ? 'text-green-600 hover:text-green-700' 
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                          title={`Toggle to ${user.status === 'active' ? 'inactive' : 'active'}`}
                        >
                          {user.status === 'active' ? (
                            <ToggleRight className="w-5 h-5" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-400 hover:text-blue-600 transition-colors"
                        title="View Details"
                        onClick={() => handleViewUser(user)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Users with bookings</span>
              <span className="font-semibold text-gray-900">
                {users.filter(u => u.total_bookings > 0).length} / {users.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ 
                  width: `${users.length > 0 
                    ? (users.filter(u => u.total_bookings > 0).length / users.length) * 100 
                    : 0}%` 
                }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm text-gray-600">Users with profiles</span>
              <span className="font-semibold text-gray-900">
                {users.filter(u => u.full_name).length} / {users.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ 
                  width: `${users.length > 0 
                    ? (users.filter(u => u.full_name).length / users.length) * 100 
                    : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Trends</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="font-semibold text-blue-600">
                {users.filter(u => {
                  const userDate = new Date(u.created_at);
                  const now = new Date();
                  return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
                }).length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last Month</span>
              <span className="font-semibold text-gray-600">
                {users.filter(u => {
                  const userDate = new Date(u.created_at);
                  const lastMonth = new Date();
                  lastMonth.setMonth(lastMonth.getMonth() - 1);
                  return userDate.getMonth() === lastMonth.getMonth() && userDate.getFullYear() === lastMonth.getFullYear();
                }).length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">This Year</span>
              <span className="font-semibold text-green-600">
                {users.filter(u => {
                  const userDate = new Date(u.created_at);
                  const now = new Date();
                  return userDate.getFullYear() === now.getFullYear();
                }).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="User Details" size="sm">
        {selectedUser && (
          <div className="flex flex-col items-center space-y-6 p-2">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              {selectedUser.avatar_url ? (
                <img
                  src={selectedUser.avatar_url}
                  alt={selectedUser.full_name || 'User'}
                  className="h-20 w-20 rounded-full object-cover border-4 border-blue-200 shadow-md mb-2"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600 mb-2">
                  {getInitials(selectedUser.full_name)}
                </div>
              )}
              <div className="text-lg font-semibold text-gray-900 mt-1">{selectedUser.full_name || 'N/A'}</div>
              <div className="text-xs text-gray-500">User ID: {selectedUser.id.substring(0, 8)}...</div>
            </div>
            <div className="w-full space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-700">Email:</span>
                <span className="text-gray-900">{selectedUser.email || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-green-500" />
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.status)}`}>{selectedUser.status ? selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1) : 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-yellow-500" />
                <span className="font-medium text-gray-700">Registration Date:</span>
                <span className="text-gray-900">{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-purple-500" />
                <span className="font-medium text-gray-700">Last Booking:</span>
                <span className="text-gray-900">{selectedUser.last_booking ? new Date(selectedUser.last_booking).toLocaleDateString() : 'Never'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-pink-500" />
                <span className="font-medium text-gray-700">Total Bookings:</span>
                <span className="text-gray-900">{selectedUser.total_bookings ?? 0}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UsersPage;