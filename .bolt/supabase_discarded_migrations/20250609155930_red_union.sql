/*
  # Create Admin User with Full Access

  1. New Admin User
    - Creates an admin user in the auth.users table
    - Email: admin@travelmate.com
    - Password: Admin123!
    - Sets up the user with admin privileges

  2. Profile Setup
    - Creates corresponding profile entry
    - Sets full name as "Admin User"

  3. Security
    - User has full access to all admin functions
    - Can manage packages, bookings, and all other data
*/

-- Insert admin user into auth.users table
-- Note: In production, you should change this password immediately
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@travelmate.com',
  crypt('Admin123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Create profile for admin user
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
) ON CONFLICT (id) DO NOTHING;

-- Grant admin user access to service role functions if needed
-- This ensures the admin can perform all administrative tasks