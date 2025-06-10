import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Booking, ItineraryDay, UserStats, PaymentStats } from '../types';

interface User {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  created_at: string;
  last_booking: string | null;
  total_bookings: number;
  status: 'active' | 'inactive';
}

interface DataContextType {
  packages: Package[];
  bookings: Booking[];
  users: User[];
  userStats: UserStats;
  paymentStats: PaymentStats;
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
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0
  });
  const [paymentStats, setPaymentStats] = useState<PaymentStats>({
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    averageOrderValue: 0
  });
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

  const fetchUsers = async () => {
    try {
      // Fetch profiles with user data
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Get booking counts for each user
      const { data: bookingCounts, error: bookingError } = await supabase
        .from('bookings')
        .select('user_id, created_at')
        .order('created_at', { ascending: false });

      if (bookingError) {
        console.error('Error fetching booking counts:', bookingError);
        return;
      }

      // Process user data
      const usersWithBookings = profilesData?.map(profile => {
        const userBookings = bookingCounts?.filter(booking => booking.user_id === profile.id) || [];
        const lastBooking = userBookings.length > 0 ? userBookings[0].created_at : null;
        const totalBookings = userBookings.length;
        
        // Determine if user is active (has bookings in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentBookings = userBookings.filter(booking => 
          new Date(booking.created_at) > thirtyDaysAgo
        );
        const isActive = recentBookings.length > 0;

        return {
          id: profile.id,
          full_name: profile.full_name,
          email: `user${profile.id.substring(0, 8)}@example.com`, // Mock email since we can't access auth.users
          avatar_url: profile.avatar_url,
          created_at: profile.created_at || new Date().toISOString(),
          last_booking: lastBooking,
          total_bookings: totalBookings,
          status: isActive ? 'active' as const : 'inactive' as const
        };
      }) || [];

      setUsers(usersWithBookings);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Get total users count
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) {
        console.error('Error fetching user count:', usersError);
        return;
      }

      // Get users created this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: newUsersThisMonth, error: newUsersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      if (newUsersError) {
        console.error('Error fetching new users count:', newUsersError);
        return;
      }

      // Get active users (users with bookings in the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: activeUsersData, error: activeUsersError } = await supabase
        .from('bookings')
        .select('user_id')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (activeUsersError) {
        console.error('Error fetching active users:', activeUsersError);
        return;
      }

      const uniqueActiveUsers = new Set(activeUsersData?.map(booking => booking.user_id) || []);

      setUserStats({
        totalUsers: totalUsers || 0,
        activeUsers: uniqueActiveUsers.size,
        newUsersThisMonth: newUsersThisMonth || 0
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      // Get all orders
      const { data: orders, error: ordersError } = await supabase
        .from('stripe_orders')
        .select('*');

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        return;
      }

      if (!orders || orders.length === 0) {
        setPaymentStats({
          totalRevenue: 0,
          totalOrders: 0,
          completedOrders: 0,
          pendingOrders: 0,
          averageOrderValue: 0
        });
        return;
      }

      const totalOrders = orders.length;
      const completedOrders = orders.filter(order => order.status === 'completed').length;
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      
      // Calculate total revenue from completed orders (amount is in cents)
      const totalRevenue = orders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + (order.amount_total || 0), 0) / 100; // Convert from cents to rupees

      const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

      setPaymentStats({
        totalRevenue,
        totalOrders,
        completedOrders,
        pendingOrders,
        averageOrderValue
      });
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([
      fetchPackages(), 
      fetchBookings(), 
      fetchUsers(),
      fetchUserStats(), 
      fetchPaymentStats()
    ]);
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
      users,
      userStats,
      paymentStats,
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