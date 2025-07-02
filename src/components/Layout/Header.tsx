import { LogOut, User } from 'lucide-react';
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { admin, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">TravelMate Admin Portal</h2>
            <p className="text-sm text-gray-500">Manage your travel business efficiently</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Admin Profile Dropdown */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">
                {admin?.email?.split('@')[0] || 'Admin'}
              </p>
              <p className="text-xs text-gray-500">{admin?.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;