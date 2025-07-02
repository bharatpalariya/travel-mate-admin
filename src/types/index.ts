export interface User {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Admin {
  id: string;
  email: string;
  createdAt: string;
}

export interface Package {
  id: string;
  title: string;
  price: number;
  short_description: string | null;
  destination: string;
  status: 'active' | 'inactive';
  images: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  created_at: string | null;
  updated_at: string | null;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
}

export interface Booking {
  id: string;
  user_id: string;
  package_id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  special_requests: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Joined data
  user_name?: string;
  user_email?: string;
  package_title?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'payment' | 'offer' | 'booking' | 'info';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
}

export interface PaymentStats {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  averageOrderValue: number;
}

export const DESTINATIONS = [
  'Goa', 'Kerala', 'Rajasthan', 'Himachal Pradesh', 'Kashmir', 'Tamil Nadu',
  'Karnataka', 'Maharashtra', 'Uttarakhand', 'West Bengal', 'Andaman & Nicobar',
  'Sikkim', 'Meghalaya', 'Assam', 'Orissa'
];

export const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled'] as const;
export const PACKAGE_STATUSES = ['active', 'inactive'] as const;