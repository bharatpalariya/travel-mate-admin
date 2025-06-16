/*
  # Fix admin users function to prevent duplicates

  1. Updates
    - Modify get_admin_users function to be more selective
    - Only return users who are explicitly admin users
    - Remove broad email pattern matching that causes duplicates

  2. Security
    - Maintains admin-only access
    - Uses security definer for proper permissions
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS get_admin_users();

-- Create a more selective admin users function
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

  -- Return only specific admin users
  RETURN QUERY
  SELECT 
    au.id,
    au.email::text,
    au.created_at,
    au.last_sign_in_at,
    au.email_confirmed_at,
    'admin'::text as role
  FROM auth.users au
  WHERE 
    -- Only include specific admin emails
    au.email IN (
      'admin@travelmate.com',
      'amitjaju@gmail.com'
    )
    -- Or users created through the admin creation process with admin metadata
    OR (
      au.raw_user_meta_data->>'role' = 'admin'
      AND au.email_confirmed_at IS NOT NULL
    )
  ORDER BY au.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users (admin check is inside function)
GRANT EXECUTE ON FUNCTION get_admin_users() TO authenticated;