/*
  # Fix Admin Role Detection

  1. Database Functions
    - Update is_admin() function to properly detect admin role from user metadata
    - Update get_admin_users() to show users with admin role
    - Ensure proper role-based filtering

  2. Security
    - Maintain RLS policies for admin access
    - Ensure only admin role users can access admin functions
*/

-- Drop existing functions to recreate them
DROP FUNCTION IF EXISTS get_admin_users();
DROP FUNCTION IF EXISTS debug_user_roles();
DROP FUNCTION IF EXISTS is_admin();

-- Create improved is_admin function that properly checks metadata
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Get the current user's information
  SELECT 
    email,
    raw_user_meta_data,
    raw_app_meta_data
  INTO user_record
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Return false if no user found
  IF user_record.email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user has admin role in user metadata (this is the main check)
  IF user_record.raw_user_meta_data ? 'role' AND user_record.raw_user_meta_data->>'role' = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Check if user has admin role in app metadata
  IF user_record.raw_app_meta_data ? 'role' AND user_record.raw_app_meta_data->>'role' = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Fallback: check for specific admin emails (for backward compatibility)
  IF user_record.email IN ('admin@travelmate.com', 'amitjaju@gmail.com', 'bharat@travelmate.com') THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Create function to get admin users with proper role filtering
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
AS $$
BEGIN
  -- Check if the current user is an admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Return users who have admin role in their metadata
  RETURN QUERY
  SELECT 
    au.id,
    au.email::text,
    au.created_at,
    au.last_sign_in_at,
    au.email_confirmed_at,
    COALESCE(
      au.raw_user_meta_data->>'role',
      au.raw_app_meta_data->>'role',
      'admin'
    )::text as role,
    au.raw_user_meta_data,
    au.raw_app_meta_data
  FROM auth.users au
  WHERE 
    -- Users with explicit admin role in user metadata
    (au.raw_user_meta_data ? 'role' AND au.raw_user_meta_data->>'role' = 'admin')
    -- Users with explicit admin role in app metadata
    OR (au.raw_app_meta_data ? 'role' AND au.raw_app_meta_data->>'role' = 'admin')
    -- Specific admin emails for backward compatibility
    --OR au.email IN ('admin@travelmate.com', 'amitjaju@gmail.com', 'bharat@travelmate.com')
  ORDER BY au.created_at DESC;
END;
$$;

-- Create debug function to help troubleshoot admin detection
CREATE OR REPLACE FUNCTION debug_user_roles()
RETURNS TABLE (
  id uuid,
  email text,
  user_metadata jsonb,
  app_metadata jsonb,
  has_user_role boolean,
  user_role_value text,
  has_app_role boolean,
  app_role_value text,
  is_admin_result boolean
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current user is an admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Return detailed debug information for all users
  RETURN QUERY
  SELECT 
    au.id,
    au.email::text,
    au.raw_user_meta_data,
    au.raw_app_meta_data,
    (au.raw_user_meta_data ? 'role') as has_user_role,
    (au.raw_user_meta_data->>'role') as user_role_value,
    (au.raw_app_meta_data ? 'role') as has_app_role,
    (au.raw_app_meta_data->>'role') as app_role_value,
    (
      (au.raw_user_meta_data ? 'role' AND au.raw_user_meta_data->>'role' = 'admin')
      OR (au.raw_app_meta_data ? 'role' AND au.raw_app_meta_data->>'role' = 'admin')
      --OR au.email IN ('admin@travelmate.com', 'amitjaju@gmail.com', 'bharat@travelmate.com')
    ) as is_admin_result
  FROM auth.users au
  ORDER BY au.created_at DESC;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION debug_user_roles() TO authenticated;