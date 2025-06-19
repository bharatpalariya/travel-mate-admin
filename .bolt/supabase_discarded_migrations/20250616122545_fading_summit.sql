/*
  # Fix Admin User Functionality

  1. Database Functions
    - Update is_admin() function to work properly
    - Fix get_admin_users() function
    - Add proper admin user detection

  2. Security
    - Ensure RLS policies work correctly
    - Add proper admin role management

  3. User Management
    - Fix admin user creation process
    - Ensure proper admin detection
*/

-- First, let's create a proper is_admin function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
  -- Get the current user's email
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Check if user is admin based on email or metadata
  IF user_email IN ('admin@travelmate.com', 'amitjaju@gmail.com') THEN
    RETURN true;
  END IF;
  
  -- Check if user has admin role in metadata
  IF EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      raw_user_meta_data->>'role' = 'admin' 
      OR raw_app_meta_data->>'role' = 'admin'
    )
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Create a function to get admin users with better filtering
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

  -- Return admin users with proper filtering
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
    -- Include specific admin emails
    au.email IN ('admin@travelmate.com', 'amitjaju@gmail.com')
    -- Include users with admin role in metadata
    OR au.raw_user_meta_data->>'role' = 'admin'
    OR au.raw_app_meta_data->>'role' = 'admin'
  ORDER BY au.created_at DESC;
END;
$$;

-- Create a function to create admin users properly
CREATE OR REPLACE FUNCTION create_admin_user(
  admin_email text,
  admin_password text
)
RETURNS json
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
  result json;
BEGIN
  -- Check if the current user is an admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- This function would need to be called from an edge function
  -- as we can't directly create auth users from SQL
  RAISE EXCEPTION 'This function should be called from an edge function';
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION create_admin_user(text, text) TO authenticated;

-- Update RLS policies to use the corrected is_admin function
-- For profiles table
DROP POLICY IF EXISTS "Users can insert own profile or admin can insert" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile or admin can read all" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile or admin can update" ON profiles;

CREATE POLICY "Users can insert own profile or admin can insert"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id OR is_admin());

CREATE POLICY "Users can read own profile or admin can read all"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update own profile or admin can update"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR is_admin())
  WITH CHECK (auth.uid() = id OR is_admin());

-- For packages table
DROP POLICY IF EXISTS "Admin can manage packages" ON packages;
CREATE POLICY "Admin can manage packages"
  ON packages
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- For bookings table
DROP POLICY IF EXISTS "Admin can delete bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create own bookings or admin can create" ON bookings;
DROP POLICY IF EXISTS "Users can read own bookings or admin can read all" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings or admin can update all" ON bookings;

CREATE POLICY "Admin can delete bookings"
  ON bookings
  FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Users can create own bookings or admin can create"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can read own bookings or admin can read all"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can update own bookings or admin can update all"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR is_admin())
  WITH CHECK (auth.uid() = user_id OR is_admin());

-- For help_requests table
DROP POLICY IF EXISTS "Admin can delete help requests" ON help_requests;
DROP POLICY IF EXISTS "Users can create own help requests or admin can create" ON help_requests;
DROP POLICY IF EXISTS "Users can read own help requests or admin can read all" ON help_requests;
DROP POLICY IF EXISTS "Users can update own help requests or admin can update all" ON help_requests;

CREATE POLICY "Admin can delete help requests"
  ON help_requests
  FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Users can create own help requests or admin can create"
  ON help_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can read own help requests or admin can read all"
  ON help_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can update own help requests or admin can update all"
  ON help_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR is_admin())
  WITH CHECK (auth.uid() = user_id OR is_admin());

-- For notifications table
DROP POLICY IF EXISTS "Users can read own notifications or admin can read all" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications or admin can update all" ON notifications;

CREATE POLICY "Users can read own notifications or admin can read all"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can update own notifications or admin can update all"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR is_admin())
  WITH CHECK (auth.uid() = user_id OR is_admin());

-- For stripe tables
DROP POLICY IF EXISTS "Admin can manage stripe customers" ON stripe_customers;
DROP POLICY IF EXISTS "Users can view their own customer data or admin can view al" ON stripe_customers;

CREATE POLICY "Admin can manage stripe customers"
  ON stripe_customers
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Users can view their own customer data or admin can view all"
  ON stripe_customers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Admin can manage stripe subscriptions" ON stripe_subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscription data or admin can view al" ON stripe_subscriptions;

CREATE POLICY "Admin can manage stripe subscriptions"
  ON stripe_subscriptions
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Users can view their own subscription data or admin can view all"
  ON stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    (customer_id IN (
      SELECT stripe_customers.customer_id
      FROM stripe_customers
      WHERE stripe_customers.user_id = auth.uid() 
      AND stripe_customers.deleted_at IS NULL
    ) AND deleted_at IS NULL) 
    OR is_admin()
  );

DROP POLICY IF EXISTS "Admin can manage stripe orders" ON stripe_orders;
DROP POLICY IF EXISTS "Users can view their own order data or admin can view all" ON stripe_orders;

CREATE POLICY "Admin can manage stripe orders"
  ON stripe_orders
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Users can view their own order data or admin can view all"
  ON stripe_orders
  FOR SELECT
  TO authenticated
  USING (
    (customer_id IN (
      SELECT stripe_customers.customer_id
      FROM stripe_customers
      WHERE stripe_customers.user_id = auth.uid() 
      AND stripe_customers.deleted_at IS NULL
    ) AND deleted_at IS NULL) 
    OR is_admin()
  );