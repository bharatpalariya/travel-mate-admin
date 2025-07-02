/*
  # Create Admin User Setup

  1. Helper Functions
    - Create a function to set up admin profile after auth user creation
    - Create a function to check if admin exists

  2. Security
    - Functions are security definer to allow proper access
    - No direct profile creation until auth user exists

  3. Usage
    - After creating auth user in Supabase dashboard, call setup function
    - Or the profile will be created automatically via trigger
*/

-- Create a function to set up the admin profile
-- This will be called after the auth user is created
CREATE OR REPLACE FUNCTION setup_admin_profile(admin_user_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the auth user exists first
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = admin_user_id) THEN
    -- Create or update the admin profile
    INSERT INTO profiles (
      id,
      full_name,
      created_at,
      updated_at
    ) VALUES (
      admin_user_id,
      'Admin User',
      now(),
      now()
    ) ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      updated_at = now();
  ELSE
    RAISE NOTICE 'Auth user with ID % does not exist. Please create the auth user first.', admin_user_id;
  END IF;
END;
$$;

-- Create a function to check if admin user exists
CREATE OR REPLACE FUNCTION check_admin_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = '00000000-0000-0000-0000-000000000001'::uuid
  );
END;
$$;

-- Create a trigger function to automatically create admin profile
-- when the specific admin user is created
CREATE OR REPLACE FUNCTION handle_admin_user_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if this is our admin user
  IF NEW.id = '00000000-0000-0000-0000-000000000001'::uuid THEN
    -- Create the admin profile
    INSERT INTO profiles (
      id,
      full_name,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      'Admin User',
      now(),
      now()
    ) ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for automatic admin profile creation
-- Note: This trigger will only work if we have access to auth.users
-- In some Supabase setups, this might not be possible
DO $$
BEGIN
  -- Try to create the trigger, but don't fail if we can't access auth.users
  BEGIN
    CREATE TRIGGER on_admin_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION handle_admin_user_creation();
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Cannot create trigger on auth.users. Admin profile must be created manually.';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not create auth trigger: %', SQLERRM;
  END;
END;
$$;