import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on your schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      packages: {
        Row: {
          id: string;
          title: string;
          price: number;
          short_description: string | null;
          destination: string;
          status: string;
          images: string[];
          itinerary: any;
          inclusions: string[];
          exclusions: string[];
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          price: number;
          short_description?: string | null;
          destination: string;
          status?: string;
          images?: string[];
          itinerary?: any;
          inclusions?: string[];
          exclusions?: string[];
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          price?: number;
          short_description?: string | null;
          destination?: string;
          status?: string;
          images?: string[];
          itinerary?: any;
          inclusions?: string[];
          exclusions?: string[];
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          package_id: string;
          start_date: string;
          end_date: string;
          status: string;
          special_requests: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          package_id: string;
          start_date: string;
          end_date: string;
          status?: string;
          special_requests?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          package_id?: string;
          start_date?: string;
          end_date?: string;
          status?: string;
          special_requests?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'payment' | 'offer' | 'booking' | 'info';
          title: string;
          message: string;
          is_read: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'payment' | 'offer' | 'booking' | 'info';
          title: string;
          message: string;
          is_read?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'payment' | 'offer' | 'booking' | 'info';
          title?: string;
          message?: string;
          is_read?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      notification_type: 'payment' | 'offer' | 'booking' | 'info';
      stripe_subscription_status: 'not_started' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused';
      stripe_order_status: 'pending' | 'completed' | 'canceled';
    };
  };
}