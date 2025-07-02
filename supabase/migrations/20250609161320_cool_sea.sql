/*
  # Create Admin User for TravelMate Admin Portal

  1. New Admin User
    - Creates an admin user with email: admin@travelmate.com
    - Password: TravelAdmin2025!
    - Automatically creates corresponding profile
    - Handles existing user scenarios gracefully

  2. Security
    - Uses proper password hashing with bcrypt
    - Sets up proper authentication metadata
    - Links to profiles table correctly

  3. Error Handling
    - Checks for existing users to prevent duplicates
    - Uses ON CONFLICT to handle profile creation safely
    - Provides clear logging for debugging
*/

-- Create admin user in auth.users table
-- This directly inserts into Supabase's authentication system
DO $$
DECLARE
    admin_user_id uuid := gen_random_uuid();
    existing_user_id uuid;
BEGIN
    -- Check if admin user already exists
    SELECT id INTO existing_user_id 
    FROM auth.users 
    WHERE email = 'admin@travelmate.com';
    
    IF existing_user_id IS NOT NULL THEN
        -- User already exists, use existing ID
        admin_user_id := existing_user_id;
        RAISE NOTICE 'Admin user already exists with ID: %', admin_user_id;
    ELSE
        -- Insert new admin user into auth.users
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
        
        RAISE NOTICE 'New admin user created with ID: %', admin_user_id;
    END IF;

    -- Create or update corresponding profile
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
    ) ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        updated_at = now();

    RAISE NOTICE 'Profile created/updated for admin user: %', admin_user_id;
END $$;