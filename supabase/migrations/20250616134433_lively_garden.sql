/*
  # Fix admin users function to show all admin users

  1. Updated Functions
    - `get_admin_users()` - Enhanced to properly fetch all admin users
    - `debug_user_roles()` - Improved debugging function
  
  2. Security
    - Functions are security definer to access auth.users
    - Proper admin role checking
    - Limited to authenticated users with admin privileges
*/

-- Drop existing functions to recreate them
DROP FUNCTION IF EXISTS get_admin_users();
DROP FUNCTION IF EXISTS debug_user_roles();

-- Enhanced function to get all admin users
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

  -- Return all admin users from auth.users with broader criteria
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
    -- Check for admin role in user_metadata
    (au.user_metadata->>'role' = 'admin')
    OR 
    -- Check for admin role in app_metadata
    (au.app_metadata->>'role' = 'admin')
    OR
    -- Check for admin in email (fallback for existing admins)
    (au.email ILIKE '%admin%')
    OR
    -- Check for specific admin emails
    (au.email IN ('admin@travelmate.com', 'amitjaju@gmail.com'))
    OR
    -- Check if user has any admin-related metadata
    (au.user_metadata ? 'role' AND au.user_metadata->>'role' IS NOT NULL)
  ORDER BY au.created_at DESC;
END;
$$;

-- Enhanced debug function
CREATE OR REPLACE FUNCTION debug_user_roles()
RETURNS TABLE (
  id uuid,
  email text,
  user_metadata_role text,
  app_metadata_role text,
  user_metadata jsonb,
  app_metadata jsonb,
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
    au.user_metadata,
    au.app_metadata,
    (
      (au.user_metadata->>'role' = 'admin')
      OR 
      (au.app_metadata->>'role' = 'admin')
      OR
      (au.email ILIKE '%admin%')
      OR
      (au.email IN ('admin@travelmate.com', 'amitjaju@gmail.com'))
    ) as is_admin_check,
    au.created_at
  FROM auth.users au
  ORDER BY au.created_at DESC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION debug_user_roles() TO authenticated;