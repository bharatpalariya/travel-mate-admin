import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // This is a mock implementation since we can't directly access auth.users from edge functions
    // In a real implementation, you would need to use the Supabase Admin API
    
    const adminUsers = [
      {
        id: 'admin-1',
        email: 'admin@travelmate.com',
        created_at: '2024-01-01T00:00:00Z',
        last_sign_in_at: new Date().toISOString(),
        email_confirmed_at: '2024-01-01T00:00:00Z',
        role: 'admin'
      },
      {
        id: 'admin-2',
        email: 'amitjaju@gmail.com', 
        created_at: '2024-01-01T00:00:00Z',
        last_sign_in_at: new Date().toISOString(),
        email_confirmed_at: '2024-01-01T00:00:00Z',
        role: 'admin'
      }
    ]

    return new Response(
      JSON.stringify(adminUsers),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})