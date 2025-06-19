/*
  # Create admin user management functions

  1. Functions
    - `get_admin_users()` - Get all users with admin role
    - `debug_user_roles()` - Debug function to check user roles
    
  2. Security
    - Functions are security definer and only accessible by authenticated users
    - Additional check for admin role within functions
*/

-- Function to get admin users
CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  email_confirmed_at timestamptz,
  role text,
  user_metadata jsonb,
  app_metadata jsonb
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Return admin users from auth.users
  RETURN QUERY
  SELECT 
    au.id,
    au.email::text,
    au.created_at,
    au.last_sign_in_at,
    au.email_confirmed_at,
    COALESCE(
      au.user_metadata->>'role',
      au.app_metadata->>'role',
      'admin'
    )::text as role,
    au.user_metadata,
    au.app_metadata
  FROM auth.users au
  WHERE 
    au.user_metadata->>'role' = 'admin' 
    OR au.app_metadata->>'role' = 'admin'
    OR au.email LIKE '%admin%'
  ORDER BY au.created_at DESC;
END;
$$;

-- Function to debug user roles
CREATE OR REPLACE FUNCTION debug_user_roles()
RETURNS TABLE (
  id uuid,
  email text,
  user_metadata_role text,
  app_metadata_role text,
  is_admin_check boolean,
  created_at timestamptz
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Return debug info for all users
  RETURN QUERY
  SELECT 
    au.id,
    au.email::text,
    (au.user_metadata->>'role')::text as user_metadata_role,
    (au.app_metadata->>'role')::text as app_metadata_role,
    (
      au.user_metadata->>'role' = 'admin' 
      OR au.app_metadata->>'role' = 'admin'
      OR au.email LIKE '%admin%'
    ) as is_admin_check,
    au.created_at
  FROM auth.users au
  ORDER BY au.created_at DESC
  LIMIT 20;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION debug_user_roles() TO authenticated;