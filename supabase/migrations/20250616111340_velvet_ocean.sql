/*
  # Create RPC function to get admin users

  1. New Functions
    - get_admin_users: Returns list of admin users from auth.users table
    - This function has security definer to access auth schema

  2. Security
    - Only accessible by authenticated users
    - Returns sanitized user data without sensitive information
*/

-- Create function to get admin users
CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  email_confirmed_at timestamptz,
  role text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    u.email_confirmed_at,
    'admin'::text as role
  FROM auth.users u
  WHERE u.email IN (
    'admin@travelmate.com',
    'amitjaju@gmail.com'
  )
  OR u.email LIKE '%@travelmate.com'
  ORDER BY u.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_users() TO authenticated;