import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get user context from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: workExp } = await supabase
      .from('work_experience')
      .select('*')
      .eq('user_id', userId);

    const { data: trainingsAttended } = await supabase
      .from('user_trainings_attended')
      .select('*')
      .eq('user_id', userId);

    const { data: trainingsConducted } = await supabase
      .from('user_trainings_conducted')
      .select('*')
      .eq('user_id', userId);

    const systemPrompt = `You are a helpful AI assistant for a professional development platform. 
You have access to the user's profile and training history. Use this information to answer their questions.

User Profile:
- Name: ${profile?.first_name} ${profile?.last_name}
- Job Title: ${profile?.job_title || 'Not specified'}
- Professional Accreditation: ${profile?.professional_accreditation || 'None'}

Work Experience: ${workExp?.length || 0} entries
Training Hours Attended: ${trainingsAttended?.reduce((sum, t) => sum + Number(t.hours), 0) || 0}
Training Hours Conducted: ${trainingsConducted?.reduce((sum, t) => sum + Number(t.hours), 0) || 0}

Recent Trainings Attended:
${trainingsAttended?.slice(0, 5).map(t => `- ${t.training_name} (${t.hours} hours, completed ${t.date_completed})`).join('\n') || 'None'}

Be helpful, concise, and professional. If asked about specific trainings or dates, search through the data carefully.
If you can't find the information, politely say so and suggest how the user might find it.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
