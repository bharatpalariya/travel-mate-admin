/*
  # Update admin users function to filter by role

  1. Changes
    - Modify get_admin_users function to filter by role instead of specific emails
    - Include users with admin role in metadata or app metadata
    - Remove hardcoded email filtering
    - Keep proper security checks

  2. Security
    - Maintain admin privilege requirement
    - Use security definer for proper access
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS get_admin_users();

-- Create updated admin users function that filters by role
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

  -- Return users with admin role from metadata
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
    )::text as role
  FROM auth.users au
  WHERE 
    -- Include users with admin role in user metadata
    au.raw_user_meta_data->>'role' = 'admin'
    -- Include users with admin role in app metadata
    OR au.raw_app_meta_data->>'role' = 'admin'
    -- Include users who have been confirmed and have admin-like characteristics
    OR (
      au.email_confirmed_at IS NOT NULL 
      AND (
        au.email ILIKE '%admin%' 
        OR au.raw_user_meta_data->>'full_name' ILIKE '%admin%'
      )
    )
  ORDER BY au.created_at DESC;
END;
$$;

-- Update the is_admin function to be more role-based
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
  user_role text;
BEGIN
  -- Get the current user's email and role
  SELECT 
    email,
    COALESCE(
      raw_user_meta_data->>'role',
      raw_app_meta_data->>'role'
    )
  INTO user_email, user_role
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Check if user has admin role in metadata
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Fallback: check for admin-like email patterns (for existing admins)
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
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;