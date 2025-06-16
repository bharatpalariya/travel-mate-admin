import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Admin } from '../types';

interface AuthContextType {
  admin: Admin | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to check if user is admin
  const checkAdminStatus = async (user: any): Promise<boolean> => {
    try {
      // Check if user email is in admin list
      const adminEmails = ['admin@travelmate.com', 'amitjaju@gmail.com'];
      if (adminEmails.includes(user.email)) {
        return true;
      }

      // Check if user has admin role in metadata
      if (user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin') {
        return true;
      }

      // Try calling the is_admin function
      const { data, error } = await supabase.rpc('is_admin');
      if (!error && data === true) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const isAdmin = await checkAdminStatus(session.user);
          if (isAdmin) {
            const adminData: Admin = {
              id: session.user.id,
              email: session.user.email || '',
              createdAt: session.user.created_at
            };
            setAdmin(adminData);
          } else {
            console.log('User is not an admin');
            setAdmin(null);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const isAdmin = await checkAdminStatus(session.user);
          if (isAdmin) {
            const adminData: Admin = {
              id: session.user.id,
              email: session.user.email || '',
              createdAt: session.user.created_at
            };
            setAdmin(adminData);
            console.log('Admin logged in:', adminData);
          } else {
            console.log('User is not an admin, denying access');
            setAdmin(null);
            // Optionally sign out non-admin users
            await supabase.auth.signOut();
          }
        } else if (event === 'SIGNED_OUT') {
          setAdmin(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      if (data.user) {
        const isAdmin = await checkAdminStatus(data.user);
        if (isAdmin) {
          const adminData: Admin = {
            id: data.user.id,
            email: data.user.email || '',
            createdAt: data.user.created_at
          };
          setAdmin(adminData);
          return true;
        } else {
          console.log('User is not an admin');
          await supabase.auth.signOut();
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setAdmin(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};