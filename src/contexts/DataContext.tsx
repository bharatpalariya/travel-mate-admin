import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Booking, ItineraryDay } from '../types';

interface DataContextType {
  packages: Package[];
  bookings: Booking[];
  loading: boolean;
  addPackage: (pkg: Omit<Package, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePackage: (id: string, pkg: Partial<Package>) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching packages:', error);
        return;
      }

      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles!inner(full_name),
          packages!inner(title)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
        return;
      }

      const formattedBookings = data?.map(booking => ({
        ...booking,
        user_name: booking.profiles?.full_name || 'Unknown User',
        user_email: '', // Email is not in profiles table, would need to join with auth.users
        package_title: booking.packages?.title || 'Unknown Package'
      })) || [];

      setBookings(formattedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchPackages(), fetchBookings()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addPackage = async (pkg: Omit<Package, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .insert([{
          title: pkg.title,
          price: pkg.price,
          short_description: pkg.short_description,
          destination: pkg.destination,
          status: pkg.status,
          images: pkg.images,
          itinerary: pkg.itinerary,
          inclusions: pkg.inclusions,
          exclusions: pkg.exclusions
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding package:', error);
        throw error;
      }

      if (data) {
        setPackages(prev => [data, ...prev]);
      }
    } catch (error) {
      console.error('Error adding package:', error);
      throw error;
    }
  };

  const updatePackage = async (id: string, updates: Partial<Package>) => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating package:', error);
        throw error;
      }

      if (data) {
        setPackages(prev => prev.map(pkg => pkg.id === id ? data : pkg));
      }
    } catch (error) {
      console.error('Error updating package:', error);
      throw error;
    }
  };

  const deletePackage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting package:', error);
        throw error;
      }

      setPackages(prev => prev.filter(pkg => pkg.id !== id));
    } catch (error) {
      console.error('Error deleting package:', error);
      throw error;
    }
  };

  const updateBookingStatus = async (id: string, status: Booking['status']) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .select(`
          *,
          profiles!inner(full_name),
          packages!inner(title)
        `)
        .single();

      if (error) {
        console.error('Error updating booking status:', error);
        throw error;
      }

      if (data) {
        const formattedBooking = {
          ...data,
          user_name: data.profiles?.full_name || 'Unknown User',
          user_email: '',
          package_title: data.packages?.title || 'Unknown Package'
        };
        setBookings(prev => prev.map(booking => booking.id === id ? formattedBooking : booking));
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting booking:', error);
        throw error;
      }

      setBookings(prev => prev.filter(booking => booking.id !== id));
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  };

  return (
    <DataContext.Provider value={{
      packages,
      bookings,
      loading,
      addPackage,
      updatePackage,
      deletePackage,
      updateBookingStatus,
      deleteBooking,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
};