/*
  # Add admin role to bharat@gmail.com

  1. Updates
    - Set user_metadata for bharat@gmail.com to include admin role
    - This allows the user to access admin functions

  2. Security
    - Updates auth.users table directly
    - Sets role in user_metadata for role-based access control
*/

-- Update user metadata to add admin role for bharat@gmail.com
UPDATE auth.users 
SET user_metadata = jsonb_set(
  COALESCE(user_metadata, '{}'::jsonb),
  '{role}',
  '"admin"'::jsonb
)
WHERE email = 'bharat@gmail.com';

-- Also update raw_user_meta_data if it exists
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'::jsonb
)
WHERE email = 'bharat@gmail.com';