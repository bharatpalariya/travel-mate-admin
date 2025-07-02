/*
  # Add foreign key relationship between bookings and profiles

  1. Changes
    - Add foreign key constraint linking bookings.user_id to profiles.id
    - This enables direct joins between bookings and profiles tables
    - Both tables reference the same user through users.id, so this relationship is valid

  2. Security
    - No RLS changes needed as existing policies remain valid
    - The relationship maintains data integrity
*/

-- Add foreign key constraint between bookings.user_id and profiles.id
-- This is safe because both reference the same user in the users table
ALTER TABLE bookings 
ADD CONSTRAINT bookings_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;