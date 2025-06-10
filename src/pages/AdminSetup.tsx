import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminSetup: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [adminCredentials, setAdminCredentials] = useState<{
    email: string;
    password: string;
    userId: string;
  } | null>(null);

  const createAdminUser = async () => {
    setIsCreating(true);
    setError('');
    setSuccess(false);

    try {
      // Create admin user using Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: 'admin@travelmate.com',
        password: 'TravelAdmin2025!',
        options: {
          data: {
            full_name: 'Travel Admin'
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('Admin user already exists. You can proceed to login.');
          setAdminCredentials({
            email: 'admin@travelmate.com',
            password: 'TravelAdmin2025!',
            userId: 'existing'
          });
        } else {
          throw signUpError;
        }
      } else if (data.user) {
        setSuccess(true);
        setAdminCredentials({
          email: 'admin@travelmate.com',
          password: 'TravelAdmin2025!',
          userId: data.user.id
        });
      }
    } catch (err: any) {
      console.error('Error creating admin user:', err);
      setError(err.message || 'Failed to create admin user');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Admin Setup</h2>
          <p className="mt-2 text-sm text-gray-600">Create your admin account to get started</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md space-y-6">
          {!success && !adminCredentials && (
            <>
              <div className="text-center">
                <UserPlus className="mx-auto h-12 w-12 text-blue-600" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Create Admin Account</h3>
                <p className="mt-2 text-sm text-gray-600">
                  This will create an admin account that you can use to access the TravelMate admin portal.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                onClick={createAdminUser}
                disabled={isCreating}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating Admin Account...' : 'Create Admin Account'}
              </button>
            </>
          )}

          {(success || adminCredentials) && (
            <>
              <div className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {success ? 'Admin Account Created!' : 'Admin Account Ready'}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Your admin account is ready. Use these credentials to log in.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-md space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1 p-2 bg-white border border-gray-300 rounded-md">
                    <code className="text-sm text-gray-900">{adminCredentials?.email}</code>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="mt-1 p-2 bg-white border border-gray-300 rounded-md">
                    <code className="text-sm text-gray-900">{adminCredentials?.password}</code>
                  </div>
                </div>
                {adminCredentials?.userId !== 'existing' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User ID</label>
                    <div className="mt-1 p-2 bg-white border border-gray-300 rounded-md">
                      <code className="text-sm text-gray-900 break-all">{adminCredentials?.userId}</code>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> Save these credentials securely. You'll need them to access the admin portal.
                </p>
              </div>

              <Link
                to="/login"
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Proceed to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </>
          )}

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Already have an admin account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;