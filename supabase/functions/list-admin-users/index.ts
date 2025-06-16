import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting list-admin-users function...')
    
    // Check if required environment variables are available
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!serviceRoleKey,
      urlLength: supabaseUrl?.length || 0,
      keyLength: serviceRoleKey?.length || 0
    })

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing required environment variables')
      return new Response(
        JSON.stringify({ 
          error: 'Missing required environment variables',
          users: [],
          debug: {
            hasUrl: !!supabaseUrl,
            hasServiceKey: !!serviceRoleKey
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }

    // Create a Supabase client with the service role key
    console.log('Creating Supabase admin client...')
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('Attempting to list users...')
    
    // Get all users using admin client
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
      console.error('Error from Supabase auth.admin.listUsers():', error)
      return new Response(
        JSON.stringify({ 
          error: `Database error finding users: ${error.message}`,
          users: [],
          debug: {
            errorCode: error.code,
            errorMessage: error.message,
            errorStatus: error.status
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }

    if (!data || !data.users) {
      console.error('No users data returned from Supabase')
      return new Response(
        JSON.stringify({ 
          error: 'No users data returned',
          users: [],
          debug: {
            dataExists: !!data,
            usersExists: !!(data?.users)
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }

    const users = data.users
    console.log(`Successfully fetched ${users.length} users`)

    // Filter users with admin role
    const adminUsers = users.filter(user => {
      const userRole = user.user_metadata?.role || user.app_metadata?.role
      const isAdmin = userRole === 'admin'
      console.log(`User ${user.email}: role=${userRole}, isAdmin=${isAdmin}`)
      return isAdmin
    })

    console.log(`Found ${adminUsers.length} admin users out of ${users.length} total users`)

    // Return successful response
    return new Response(
      JSON.stringify({ 
        users: adminUsers,
        total: users.length,
        adminCount: adminUsers.length,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Unexpected error in list-admin-users function:', error)
    
    // Return detailed error information
    return new Response(
      JSON.stringify({ 
        error: `Unexpected error: ${error.message}`,
        users: [],
        debug: {
          errorName: error.name,
          errorMessage: error.message,
          errorStack: error.stack
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})