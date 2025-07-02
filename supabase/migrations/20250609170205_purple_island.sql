/*
  # Fix user signup trigger for profiles table

  1. Database Functions
    - Create or replace the `handle_new_user` function that automatically creates a profile when a user signs up
    - Ensure the function has proper error handling and permissions

  2. Triggers
    - Create the trigger that calls `handle_new_user` when a new user is inserted into `auth.users`
    - This ensures every new user gets a corresponding profile entry

  3. Security
    - Grant necessary permissions for the trigger function to work properly
    - Ensure the function runs with proper security context
*/

-- Create or replace the function that handles new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, created_at, updated_at)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    now(),
    now()
  );
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger that calls the function when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.profiles TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

-- Ensure RLS policies are properly set up for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Recreate the policies to ensure they're correct
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Service role policies (for system operations)
CREATE POLICY "Service role can insert profiles"
  ON public.profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can manage profiles"
  ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- User policies (for authenticated users)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);