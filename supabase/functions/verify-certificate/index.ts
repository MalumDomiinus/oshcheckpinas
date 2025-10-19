import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { firstName, lastName, certificateNumber } = await req.json();

    console.log('Verification attempt:', { firstName, lastName, certificateNumber });

    if (!firstName || !lastName || !certificateNumber) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Search for certificate
    const { data: certificate, error: certError } = await supabaseClient
      .from('certificates')
      .select('*')
      .eq('certificate_number', certificateNumber.trim())
      .ilike('first_name', firstName.trim())
      .ilike('last_name', lastName.trim())
      .eq('status', 'active')
      .single();

    const success = !!certificate && !certError;

    // Log the verification attempt
    const logData = {
      certificate_id: certificate?.id || null,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      certificate_number: certificateNumber.trim(),
      success,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
    };

    const { error: logError } = await supabaseClient
      .from('verification_logs')
      .insert(logData);

    if (logError) {
      console.error('Error logging verification:', logError);
    }

    // Return result
    const response = {
      success,
      certificate: success ? certificate : undefined,
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
