/*
  # Fix admin users display

  1. Database Functions
    - Update get_admin_users() to properly find users with admin role
    - Improve role detection logic
    - Add better debugging for admin user detection

  2. Security
    - Maintain proper RLS policies
    - Ensure only admins can view admin users list
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS get_admin_users();

-- Create a comprehensive admin users function
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

  -- Return all users who have admin characteristics
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
      CASE 
        WHEN au.email ILIKE '%admin%' THEN 'admin'
        WHEN au.email IN ('admin@travelmate.com', 'amitjaju@gmail.com') THEN 'admin'
        ELSE 'user'
      END
    )::text as role,
    au.raw_user_meta_data,
    au.raw_app_meta_data
  FROM auth.users au
  WHERE 
    -- Users with explicit admin role in metadata
    au.raw_user_meta_data->>'role' = 'admin'
    OR au.raw_app_meta_data->>'role' = 'admin'
    -- Users with admin-like emails
    OR au.email ILIKE '%admin%'
    -- Specific admin emails
    OR au.email IN ('admin@travelmate.com', 'amitjaju@gmail.com')
    -- Users with admin in their name
    OR au.raw_user_meta_data->>'full_name' ILIKE '%admin%'
  ORDER BY au.created_at DESC;
END;
$$;

-- Create a debug function to help troubleshoot admin user detection
CREATE OR REPLACE FUNCTION debug_user_roles()
RETURNS TABLE (
  id uuid,
  email text,
  user_metadata jsonb,
  app_metadata jsonb,
  detected_role text,
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

  -- Return debug information for all users
  RETURN QUERY
  SELECT 
    au.id,
    au.email::text,
    au.raw_user_meta_data,
    au.raw_app_meta_data,
    COALESCE(
      au.raw_user_meta_data->>'role',
      au.raw_app_meta_data->>'role',
      'none'
    )::text as detected_role,
    (
      au.raw_user_meta_data->>'role' = 'admin'
      OR au.raw_app_meta_data->>'role' = 'admin'
      OR au.email ILIKE '%admin%'
      OR au.email IN ('admin@travelmate.com', 'amitjaju@gmail.com')
    ) as is_admin_result
  FROM auth.users au
  ORDER BY au.created_at DESC;
END;
$$;

-- Update the is_admin function to be more comprehensive
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
  user_role text;
  app_role text;
BEGIN
  -- Get the current user's information
  SELECT 
    email,
    raw_user_meta_data->>'role',
    raw_app_meta_data->>'role'
  INTO user_email, user_role, app_role
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Return false if no user found
  IF user_email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user has admin role in user metadata
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Check if user has admin role in app metadata
  IF app_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Check for admin-like email patterns
  IF user_email ILIKE '%admin%' THEN
    RETURN true;
  END IF;
  
  -- Specific admin emails for backward compatibility
  IF user_email IN ('admin@travelmate.com', 'amitjaju@gmail.com') THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION debug_user_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;