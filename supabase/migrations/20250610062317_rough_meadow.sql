/*
  # Fix Admin Database Access

  This migration updates Row Level Security policies to allow admin users to access all data.
  Admin users are identified by their email domain or specific email addresses.

  1. Security Updates
    - Update RLS policies to allow admin access
    - Add admin identification logic
    - Ensure data visibility for admin users

  2. Tables Updated
    - profiles: Allow admin read access
    - packages: Allow admin full access
    - bookings: Allow admin full access
    - notifications: Allow admin read access
    - help_requests: Allow admin full access
    - stripe_customers: Allow admin read access
    - stripe_subscriptions: Allow admin read access
    - stripe_orders: Allow admin read access
*/

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (
      auth.users.email = 'admin@travelmate.com' 
      OR auth.users.email = 'amitjaju@gmail.com'
      OR auth.users.email LIKE '%@travelmate.com'
    )
  );
$$;

-- Update profiles policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can read own profile or admin can read all"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can insert own profile or admin can insert"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update own profile or admin can update"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR is_admin())
  WITH CHECK (auth.uid() = id OR is_admin());

-- Update packages policies
DROP POLICY IF EXISTS "Anyone can read active packages" ON packages;
DROP POLICY IF EXISTS "Authenticated users can create packages" ON packages;
DROP POLICY IF EXISTS "Authenticated users can update packages" ON packages;
DROP POLICY IF EXISTS "Authenticated users can delete packages" ON packages;

CREATE POLICY "Anyone can read active packages or admin can read all"
  ON packages
  FOR SELECT
  TO public
  USING (status = 'active' OR is_admin());

CREATE POLICY "Admin can manage packages"
  ON packages
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Update bookings policies
DROP POLICY IF EXISTS "Users can read own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;

CREATE POLICY "Users can read own bookings or admin can read all"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can create own bookings or admin can create"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can update own bookings or admin can update all"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR is_admin())
  WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admin can delete bookings"
  ON bookings
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Update notifications policies
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update read status of own notifications" ON notifications;

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

-- Update help_requests policies
DROP POLICY IF EXISTS "Users can read own help requests" ON help_requests;
DROP POLICY IF EXISTS "Users can create help requests" ON help_requests;
DROP POLICY IF EXISTS "Users can update own help requests" ON help_requests;

CREATE POLICY "Users can read own help requests or admin can read all"
  ON help_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can create own help requests or admin can create"
  ON help_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can update own help requests or admin can update all"
  ON help_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR is_admin())
  WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admin can delete help requests"
  ON help_requests
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Update stripe_customers policies
DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;

CREATE POLICY "Users can view their own customer data or admin can view all"
  ON stripe_customers
  FOR SELECT
  TO authenticated
  USING ((auth.uid() = user_id AND deleted_at IS NULL) OR is_admin());

CREATE POLICY "Admin can manage stripe customers"
  ON stripe_customers
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Update stripe_subscriptions policies
DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;

CREATE POLICY "Users can view their own subscription data or admin can view all"
  ON stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    (customer_id IN (
      SELECT stripe_customers.customer_id
      FROM stripe_customers
      WHERE stripe_customers.user_id = auth.uid() AND stripe_customers.deleted_at IS NULL
    ) AND deleted_at IS NULL) 
    OR is_admin()
  );

CREATE POLICY "Admin can manage stripe subscriptions"
  ON stripe_subscriptions
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Update stripe_orders policies
DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;

CREATE POLICY "Users can view their own order data or admin can view all"
  ON stripe_orders
  FOR SELECT
  TO authenticated
  USING (
    (customer_id IN (
      SELECT stripe_customers.customer_id
      FROM stripe_customers
      WHERE stripe_customers.user_id = auth.uid() AND stripe_customers.deleted_at IS NULL
    ) AND deleted_at IS NULL)
    OR is_admin()
  );

CREATE POLICY "Admin can manage stripe orders"
  ON stripe_orders
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;