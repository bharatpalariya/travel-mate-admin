/*
  # Fix get_admin_users RPC function

  1. Function Updates
    - Drop and recreate the get_admin_users function with proper type casting
    - Ensure email column is cast to text type to match expected return type
    - Fix the structure mismatch error

  2. Security
    - Maintain proper access controls for admin-only access
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_admin_users();

-- Create the corrected function with proper type casting
CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  email_confirmed_at timestamptz,
  role text
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current user is an admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  SELECT 
    au.id,
    au.email::text,  -- Explicit cast to text
    au.created_at,
    au.last_sign_in_at,
    au.email_confirmed_at,
    'admin'::text as role
  FROM auth.users au
  WHERE au.email IN (
    'admin@travelmate.com',
    'support@travelmate.com'
  )
  OR au.id IN (
    SELECT user_id 
    FROM user_roles 
    WHERE role = 'admin'
  );
END;
$$
LANGUAGE plpgsql;

-- Grant execute permission to authenticated users (function will check admin status internally)
GRANT EXECUTE ON FUNCTION get_admin_users() TO authenticated;