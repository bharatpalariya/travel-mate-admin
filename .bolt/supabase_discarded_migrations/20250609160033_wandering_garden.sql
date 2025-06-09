/*
  # Create Admin User with Full Access

  1. New Tables
    - No new tables created

  2. Changes
    - Create an admin profile entry that can be linked to a Supabase auth user
    - The actual user creation will need to be done through Supabase Auth API or dashboard

  3. Security
    - Profile created with admin privileges
    - Will be linked to auth user when admin signs up

  4. Instructions
    - After running this migration, create the admin user through Supabase dashboard:
      - Email: admin@travelmate.com
      - Password: Admin123! (change immediately in production)
      - User ID: 00000000-0000-0000-0000-000000000001
*/

-- Create a specific admin profile that will be linked to the auth user
-- We use a fixed UUID that you'll need to use when creating the auth user
INSERT INTO profiles (
  id,
  full_name,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Admin User',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  updated_at = now();

-- Create a function to handle admin user creation if needed
CREATE OR REPLACE FUNCTION create_admin_profile()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function can be called after the auth user is created
  -- to ensure the profile exists and is properly set up
  INSERT INTO profiles (
    id,
    full_name,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Admin User',
    now(),
    now()
  ) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    updated_at = now();
END;
$$;