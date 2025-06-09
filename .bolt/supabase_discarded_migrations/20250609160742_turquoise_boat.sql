/*
  # Create Admin User

  1. New User Creation
    - Creates an admin user in the auth.users table
    - Email: admin@travelmate.com
    - Password: TravelAdmin2025!
    - Sets up proper authentication fields

  2. Profile Creation
    - Creates corresponding profile record
    - Links to the auth user via foreign key

  3. Security
    - Uses proper password hashing
    - Sets email as confirmed
    - Assigns authenticated role
*/

-- Create admin user in auth.users table
-- This directly inserts into Supabase's authentication system
DO $$
DECLARE
    admin_user_id uuid := gen_random_uuid();
BEGIN
    -- Insert into auth.users (Supabase's authentication table)
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        role,
        aud,
        confirmation_token,
        email_change_token_new,
        recovery_token,
        raw_app_meta_data,
        raw_user_meta_data
    ) VALUES (
        admin_user_id,
        '00000000-0000-0000-0000-000000000000'::uuid,
        'admin@travelmate.com',
        crypt('TravelAdmin2025!', gen_salt('bf')),
        now(),
        now(),
        now(),
        'authenticated',
        'authenticated',
        '',
        '',
        '',
        '{"provider": "email", "providers": ["email"]}',
        '{}'
    );

    -- Create corresponding profile
    INSERT INTO profiles (
        id,
        full_name,
        created_at,
        updated_at
    ) VALUES (
        admin_user_id,
        'Travel Admin',
        now(),
        now()
    );

    -- Log the user ID for reference
    RAISE NOTICE 'Admin user created with ID: %', admin_user_id;
END $$;