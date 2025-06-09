/*
  # Add sample data for testing

  1. Sample Data
    - Create sample users with profiles
    - Create sample packages
    - Create sample bookings
  2. Security
    - All data respects existing RLS policies
    - Uses proper foreign key relationships
*/

-- First, let's create some sample users (these would normally be created through auth signup)
DO $$
DECLARE
    user1_id uuid := gen_random_uuid();
    user2_id uuid := gen_random_uuid();
    user3_id uuid := gen_random_uuid();
    package1_id uuid;
    package2_id uuid;
    package3_id uuid;
BEGIN
    -- Insert sample users into auth.users (simulating real users)
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES 
    (
        '00000000-0000-0000-0000-000000000000',
        user1_id,
        'authenticated',
        'authenticated',
        'john.doe@example.com',
        crypt('password123', gen_salt('bf')),
        now(),
        now(),
        now(),
        '',
        '',
        '',
        ''
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        user2_id,
        'authenticated',
        'authenticated',
        'jane.smith@example.com',
        crypt('password123', gen_salt('bf')),
        now(),
        now(),
        now(),
        '',
        '',
        '',
        ''
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        user3_id,
        'authenticated',
        'authenticated',
        'mike.johnson@example.com',
        crypt('password123', gen_salt('bf')),
        now(),
        now(),
        now(),
        '',
        '',
        '',
        ''
    )
    ON CONFLICT (email) DO NOTHING;

    -- Create corresponding profiles
    INSERT INTO public.profiles (id, full_name, created_at, updated_at)
    VALUES 
    (user1_id, 'John Doe', now(), now()),
    (user2_id, 'Jane Smith', now(), now()),
    (user3_id, 'Mike Johnson', now(), now())
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        updated_at = now();

    -- Create sample packages
    INSERT INTO public.packages (
        title,
        price,
        short_description,
        destination,
        status,
        images,
        itinerary,
        inclusions,
        exclusions
    ) VALUES 
    (
        'Golden Triangle Tour',
        25000,
        'Explore Delhi, Agra, and Jaipur in this classic 7-day journey through India''s most iconic destinations.',
        'Rajasthan',
        'active',
        ARRAY[
            'https://images.pexels.com/photos/1583339/pexels-photo-1583339.jpeg',
            'https://images.pexels.com/photos/2413613/pexels-photo-2413613.jpeg',
            'https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg'
        ],
        '[
            {"day": 1, "title": "Arrival in Delhi", "description": "Arrive in Delhi and check into your hotel. Evening visit to India Gate and Connaught Place.", "activities": ["Airport pickup", "Hotel check-in", "India Gate visit", "Welcome dinner"]},
            {"day": 2, "title": "Delhi Sightseeing", "description": "Full day tour of Old and New Delhi including Red Fort, Jama Masjid, and Humayun''s Tomb.", "activities": ["Red Fort", "Jama Masjid", "Chandni Chowk", "Humayun''s Tomb"]},
            {"day": 3, "title": "Delhi to Agra", "description": "Drive to Agra and visit the magnificent Taj Mahal at sunset.", "activities": ["Drive to Agra", "Taj Mahal visit", "Agra Fort", "Local market shopping"]}
        ]'::jsonb,
        ARRAY[
            'Accommodation in 4-star hotels',
            'Daily breakfast and dinner',
            'Air-conditioned transportation',
            'Professional English-speaking guide',
            'All monument entrance fees',
            'Airport transfers'
        ],
        ARRAY[
            'International airfare',
            'Lunch meals',
            'Personal expenses',
            'Tips and gratuities',
            'Travel insurance',
            'Visa fees'
        ]
    ),
    (
        'Kerala Backwaters Experience',
        18000,
        'Discover the serene backwaters of Kerala with houseboat stays and traditional village experiences.',
        'Kerala',
        'active',
        ARRAY[
            'https://images.pexels.com/photos/962464/pexels-photo-962464.jpeg',
            'https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg',
            'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg'
        ],
        '[
            {"day": 1, "title": "Arrival in Kochi", "description": "Arrive in Kochi and explore the historic Fort Kochi area.", "activities": ["Airport pickup", "Fort Kochi tour", "Chinese fishing nets", "Spice market visit"]},
            {"day": 2, "title": "Kochi to Alleppey", "description": "Drive to Alleppey and board your traditional houseboat for backwater cruise.", "activities": ["Drive to Alleppey", "Houseboat boarding", "Backwater cruise", "Traditional Kerala dinner"]},
            {"day": 3, "title": "Backwater Exploration", "description": "Full day exploring the backwaters, visiting local villages and coconut groves.", "activities": ["Village visits", "Coconut grove tour", "Traditional fishing", "Ayurvedic massage"]}
        ]'::jsonb,
        ARRAY[
            'Houseboat accommodation with AC',
            'All meals during houseboat stay',
            'Traditional Kerala cooking demo',
            'Village tour with local guide',
            'Ayurvedic spa treatment',
            'Airport transfers'
        ],
        ARRAY[
            'International airfare',
            'Alcoholic beverages',
            'Personal expenses',
            'Tips for crew',
            'Travel insurance',
            'Additional activities'
        ]
    ),
    (
        'Himalayan Adventure Trek',
        35000,
        'Experience the majestic Himalayas with this challenging trek through pristine mountain landscapes.',
        'Himachal Pradesh',
        'active',
        ARRAY[
            'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg',
            'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg',
            'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg'
        ],
        '[
            {"day": 1, "title": "Arrival in Manali", "description": "Arrive in Manali and acclimatize to the mountain environment.", "activities": ["Airport pickup", "Hotel check-in", "Local market visit", "Equipment briefing"]},
            {"day": 2, "title": "Trek Preparation", "description": "Preparation day with gear check and short acclimatization hike.", "activities": ["Gear fitting", "Practice hike", "Safety briefing", "Team building"]},
            {"day": 3, "title": "Begin Trek", "description": "Start the main trek towards base camp through beautiful alpine meadows.", "activities": ["Trek start", "Alpine meadows", "Mountain photography", "Camp setup"]}
        ]'::jsonb,
        ARRAY[
            'Professional trekking guide',
            'All camping equipment',
            'Nutritious trek meals',
            'Safety equipment and first aid',
            'Porter services',
            'Transportation to trek start'
        ],
        ARRAY[
            'International airfare',
            'Personal trekking gear',
            'Travel insurance (mandatory)',
            'Emergency evacuation',
            'Personal expenses',
            'Tips for guides and porters'
        ]
    )
    RETURNING id INTO package1_id;

    -- Get the package IDs for creating bookings
    SELECT id INTO package1_id FROM packages WHERE title = 'Golden Triangle Tour' LIMIT 1;
    SELECT id INTO package2_id FROM packages WHERE title = 'Kerala Backwaters Experience' LIMIT 1;
    SELECT id INTO package3_id FROM packages WHERE title = 'Himalayan Adventure Trek' LIMIT 1;

    -- Create sample bookings
    INSERT INTO public.bookings (
        user_id,
        package_id,
        start_date,
        end_date,
        status,
        special_requests,
        created_at,
        updated_at
    ) VALUES 
    (
        user1_id,
        package1_id,
        '2025-02-15'::date,
        '2025-02-22'::date,
        'confirmed',
        'Vegetarian meals preferred. Need airport pickup at 10 AM.',
        now() - interval '5 days',
        now() - interval '5 days'
    ),
    (
        user2_id,
        package2_id,
        '2025-03-01'::date,
        '2025-03-05'::date,
        'pending',
        'Celebrating anniversary. Would like romantic dinner arrangement.',
        now() - interval '2 days',
        now() - interval '2 days'
    ),
    (
        user3_id,
        package3_id,
        '2025-04-10'::date,
        '2025-04-17'::date,
        'confirmed',
        'First time trekking. Need extra guidance and support.',
        now() - interval '1 day',
        now() - interval '1 day'
    ),
    (
        user1_id,
        package2_id,
        '2025-05-20'::date,
        '2025-05-24'::date,
        'pending',
        'Group of 4 people. Need adjoining rooms.',
        now() - interval '3 hours',
        now() - interval '3 hours'
    ),
    (
        user2_id,
        package1_id,
        '2025-06-15'::date,
        '2025-06-22'::date,
        'cancelled',
        'Had to cancel due to work commitments.',
        now() - interval '7 days',
        now() - interval '1 day'
    );

    RAISE NOTICE 'Sample data created successfully!';
    RAISE NOTICE 'Created % users, % packages, and % bookings', 3, 3, 5;
END $$;