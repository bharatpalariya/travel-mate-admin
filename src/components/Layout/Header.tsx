import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { admin } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 ml-64 px-6 py-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Admin Portal</h2>
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2">Welcome,</span>
          <span className="font-medium text-gray-800">{admin?.email}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;