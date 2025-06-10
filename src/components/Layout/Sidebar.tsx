import React from 'react';
import { NavLink } from 'react-router-dom';
import { Package, Users, BarChart3, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { logout } = useAuth();

  const navItems = [
    { to: '/admin', icon: BarChart3, label: 'Dashboard', exact: true },
    { to: '/admin/packages', icon: Package, label: 'Packages' },
    { to: '/admin/bookings', icon: Users, label: 'Bookings' },
    { to: '/admin/admin-management', icon: Shield, label: 'Admin Users' }
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 z-30">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">TravelMate Admin</h1>
      </div>
      
      <nav className="mt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : ''
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;