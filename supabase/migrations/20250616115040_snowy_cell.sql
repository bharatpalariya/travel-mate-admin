/*
  # Fix admin users query to show all users

  1. Updates
    - Modify get_admin_users function to return all authenticated users
    - Remove hardcoded email filtering
    - Remove dependency on non-existent user_roles table
  
  2. Security
    - Maintain admin-only access through is_admin() check
    - Keep security definer for proper permissions
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS get_admin_users();

-- Create the corrected function that returns all users from auth.users
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
  WHERE au.email IS NOT NULL
  ORDER BY au.created_at DESC;
END;
$$
LANGUAGE plpgsql;

-- Grant execute permission to authenticated users (function will check admin status internally)
GRANT EXECUTE ON FUNCTION get_admin_users() TO authenticated;