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

  const checkAdminRole = (user: any): boolean => {
    // Check if user has admin role in metadata
    const userRole = user.user_metadata?.role || user.app_metadata?.role;
    if (userRole === 'admin') {
      return true;
    }

    // Fallback: check for admin-like email patterns (for existing admins)
    if (user.email && user.email.includes('admin')) {
      return true;
    }

    // Specific admin emails for backward compatibility
    const adminEmails = ['admin@travelmate.com', 'amitjaju@gmail.com'];
    if (user.email && adminEmails.includes(user.email)) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Check if user has admin role
          if (checkAdminRole(session.user)) {
            const adminData: Admin = {
              id: session.user.id,
              email: session.user.email || '',
              createdAt: session.user.created_at
            };
            setAdmin(adminData);
          } else {
            // User doesn't have admin role, sign them out
            await supabase.auth.signOut();
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
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if user has admin role
          if (checkAdminRole(session.user)) {
            const adminData: Admin = {
              id: session.user.id,
              email: session.user.email || '',
              createdAt: session.user.created_at
            };
            setAdmin(adminData);
          } else {
            // User doesn't have admin role, sign them out
            await supabase.auth.signOut();
            setAdmin(null);
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
        // Check if user has admin role
        if (checkAdminRole(data.user)) {
          const adminData: Admin = {
            id: data.user.id,
            email: data.user.email || '',
            createdAt: data.user.created_at
          };
          setAdmin(adminData);
          return true;
        } else {
          // User doesn't have admin role
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