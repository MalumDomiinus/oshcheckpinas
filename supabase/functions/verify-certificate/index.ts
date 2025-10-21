import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const verificationRequestSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  certificateNumber: z.string().trim().min(1).max(50),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const body = await req.json();

    // Validate input
    const validationResult = verificationRequestSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input',
          details: validationResult.error.errors.map(e => e.message).join(', ')
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { firstName, lastName, certificateNumber } = validationResult.data;

    console.log('Verification attempt:', { firstName, lastName, certificateNumber });

    // Search for certificate
    const { data: certificate, error: certError } = await supabaseClient
      .from('certificates')
      .select('*')
      .eq('certificate_number', certificateNumber)
      .ilike('first_name', firstName)
      .ilike('last_name', lastName)
      .eq('status', 'active')
      .single();

    const success = !!certificate && !certError;

    // Log the verification attempt (using service role key, so RLS policy allows insert)
    const logData = {
      certificate_id: certificate?.id || null,
      first_name: firstName,
      last_name: lastName,
      certificate_number: certificateNumber,
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