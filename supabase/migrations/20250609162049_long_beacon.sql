/*
  # Fix Authentication Schema Error

  This migration addresses the "Database error querying schema" issue by ensuring:
  1. Required database functions exist
  2. Proper RLS policies for auth-related tables
  3. User profile creation trigger is working
  4. Auth schema permissions are correct

  ## Changes Made
  1. Create missing update_updated_at_column function if not exists
  2. Create handle_new_user function for profile creation
  3. Ensure proper RLS policies on profiles table
  4. Add auth trigger for automatic profile creation
  5. Grant necessary permissions to auth schema
*/

-- Ensure the update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, created_at, updated_at)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', now(), now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the profiles table exists with proper structure
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;

-- Create proper RLS policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can manage profiles"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add trigger for updating updated_at column
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions to ensure auth can query the schema
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated, service_role;

-- Ensure auth schema has proper permissions
GRANT USAGE ON SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;

-- Create the admin user if it doesn't exist
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Check if admin user already exists
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@travelmate.com';
    
    -- If admin user doesn't exist, we'll need to create it manually
    -- Note: This should ideally be done through Supabase Auth API or dashboard
    IF admin_user_id IS NULL THEN
        -- Insert a placeholder that will be replaced by proper signup
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'admin@travelmate.com',
            crypt('TravelAdmin2025!', gen_salt('bf')),
            now(),
            now(),
            now(),
            '',
            '',
            '',
            ''
        ) RETURNING id INTO admin_user_id;
        
        -- Create corresponding profile
        INSERT INTO public.profiles (id, full_name, created_at, updated_at)
        VALUES (admin_user_id, 'Admin User', now(), now())
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;