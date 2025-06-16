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
    console.log('Checking admin role for user:', user);
    
    // Check if user has admin role in user metadata
    const userRole = user.user_metadata?.role;
    console.log('User metadata role:', userRole);
    
    if (userRole === 'admin') {
      console.log('User has admin role in user_metadata');
      return true;
    }

    // Check if user has admin role in app metadata
    const appRole = user.app_metadata?.role;
    console.log('App metadata role:', appRole);
    
    if (appRole === 'admin') {
      console.log('User has admin role in app_metadata');
      return true;
    }

    // Fallback: check for specific admin emails (for existing admins)
    const adminEmails = ['admin@travelmate.com', 'amitjaju@gmail.com', 'bharat@travelmate.com'];
    if (user.email && adminEmails.includes(user.email)) {
      console.log('User email is in admin emails list');
      return true;
    }

    console.log('User does not have admin role');
    return false;
  };

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('Found existing session for user:', session.user.email);
          
          // Check if user has admin role
          if (checkAdminRole(session.user)) {
            const adminData: Admin = {
              id: session.user.id,
              email: session.user.email || '',
              createdAt: session.user.created_at
            };
            setAdmin(adminData);
            console.log('Admin user authenticated from session');
          } else {
            // User doesn't have admin role, sign them out
            console.log('User does not have admin role, signing out');
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
        console.log('Auth state change:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if user has admin role
          if (checkAdminRole(session.user)) {
            const adminData: Admin = {
              id: session.user.id,
              email: session.user.email || '',
              createdAt: session.user.created_at
            };
            setAdmin(adminData);
            console.log('Admin user signed in');
          } else {
            // User doesn't have admin role, sign them out
            console.log('Non-admin user attempted to sign in, signing out');
            await supabase.auth.signOut();
            setAdmin(null);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setAdmin(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      if (data.user) {
        console.log('Login successful for user:', data.user.email);
        
        // Check if user has admin role
        if (checkAdminRole(data.user)) {
          const adminData: Admin = {
            id: data.user.id,
            email: data.user.email || '',
            createdAt: data.user.created_at
          };
          setAdmin(adminData);
          console.log('Admin login successful');
          return true;
        } else {
          // User doesn't have admin role
          console.log('User does not have admin role, denying access');
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
      console.log('Logging out admin user');
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