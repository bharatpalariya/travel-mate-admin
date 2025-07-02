/*
  # Fix Authentication Trigger for Profile Creation

  1. Database Functions
    - Recreate the handle_new_user function to ensure it works correctly
    - This function creates a profile record when a new user signs up

  2. Triggers
    - Ensure the trigger is properly set up on auth.users table
    - This trigger calls handle_new_user when a new user is inserted

  3. Security
    - Ensure proper permissions for the auth system to create profiles
*/

-- Recreate the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure the profiles table has proper RLS policies for service role
DO $$
BEGIN
  -- Check if service role policy exists, if not create it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Service role can manage profiles'
  ) THEN
    CREATE POLICY "Service role can manage profiles"
      ON profiles
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;