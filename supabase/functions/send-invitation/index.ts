import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  role: "user" | "moderator";
  fullName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create Supabase client with the auth token
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify the user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error("Authentication error:", userError);
      throw new Error("Unauthorized");
    }

    // Check if the user is an admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      console.error("Admin check failed:", roleError);
      throw new Error("Forbidden: Admin access required");
    }

    console.log("Admin verified:", user.email);

    // Parse the request body
    const { email, role, fullName }: InvitationRequest = await req.json();

    // Validate input
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email address");
    }

    if (!["user", "moderator"].includes(role)) {
      throw new Error("Invalid role");
    }

    console.log(`Sending invitation to ${email} with role ${role}`);

    // Generate signup URL - use a simple auth page link
    const appBaseUrl = "https://jsptmefxsvarntsvkeph.lovable.app";
    const signupUrl = `${appBaseUrl}/auth`;

    // Create a friendly role name for display
    const roleName = role === "moderator" ? "Moderator" : "User";

    // Send invitation email
    const emailResponse = await resend.emails.send({
      from: "Certificate Verification Platform <onboarding@resend.dev>",
      to: [email],
      subject: "You're Invited to Join Certificate Verification Platform",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Platform Invitation</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f9fafb; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background-color: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                <h1 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">
                  Welcome to Certificate Verification Platform
                </h1>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin: 0 0 24px 0;">
                  ${fullName ? `Hi ${fullName},` : 'Hello,'}
                </p>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin: 0 0 24px 0;">
                  You've been invited to join our Certificate Verification Platform as a <strong>${roleName}</strong>.
                </p>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin: 0 0 32px 0;">
                  Click the button below to create your account and get started:
                </p>
                
                <div style="text-align: center; margin: 0 0 32px 0;">
                  <a href="${signupUrl}" 
                     style="background-color: #2563eb; color: white; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: 500; display: inline-block; font-size: 16px;">
                    Create Your Account
                  </a>
                </div>
                
                <div style="background-color: #f3f4f6; border-left: 4px solid #2563eb; padding: 16px; margin: 0 0 24px 0; border-radius: 4px;">
                  <p style="color: #374151; font-size: 14px; line-height: 1.5; margin: 0;">
                    <strong>Your Email:</strong> ${email}<br>
                    <strong>Your Role:</strong> ${roleName}
                  </p>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0 0 8px 0;">
                  If you didn't expect this invitation, you can safely ignore this email.
                </p>
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                  Need help? Contact our support team.
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 32px;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  © 2024 Certificate Verification Platform. All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invitation sent successfully",
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-invitation function:", error);
    
    const status = error.message === "Unauthorized" ? 401 : 
                   error.message.includes("Forbidden") ? 403 : 500;
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
