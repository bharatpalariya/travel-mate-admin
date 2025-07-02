/*
  # Fix admin users function to show only actual admins

  1. Updates
    - Modify get_admin_users function to return only users with admin privileges
    - Filter by specific admin email addresses
    - Remove regular users from the admin list
  
  2. Security
    - Maintain admin-only access through is_admin() check
    - Only show users who have admin privileges
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS get_admin_users();

-- Create the corrected function that returns only admin users
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
    au.email::text,
    au.created_at,
    au.last_sign_in_at,
    au.email_confirmed_at,
    'admin'::text as role
  FROM auth.users au
  WHERE au.email IN (
    'admin@travelmate.com',
    'amitjaju@gmail.com'
  )
  OR au.email LIKE '%@travelmate.com'
  ORDER BY au.created_at DESC;
END;
$$
LANGUAGE plpgsql;

-- Grant execute permission to authenticated users (function will check admin status internally)
GRANT EXECUTE ON FUNCTION get_admin_users() TO authenticated;