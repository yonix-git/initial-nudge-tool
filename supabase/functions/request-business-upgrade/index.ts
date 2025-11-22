import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    console.log("Processing business upgrade request for user:", user.id);

    // Check if user already has a pending request
    const { data: existingRequest } = await supabase
      .from("business_upgrade_requests")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .single();

    if (existingRequest) {
      return new Response(
        JSON.stringify({ 
          error: "יש כבר בקשה ממתינה לאישור",
          existingRequest: true
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get user profile info
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, username")
      .eq("id", user.id)
      .single();

    // Create upgrade request
    const { data: request, error: requestError } = await supabase
      .from("business_upgrade_requests")
      .insert({
        user_id: user.id,
        status: "pending",
      })
      .select()
      .single();

    if (requestError) {
      console.error("Error creating request:", requestError);
      throw requestError;
    }

    console.log("Created upgrade request:", request.id);

    // Generate approval URL
    const approvalUrl = `${supabaseUrl}/functions/v1/approve-business-upgrade?request_id=${request.id}&token=${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`;

    // Send email to admin using Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "CarHub <team@motorhub.co.il>",
        to: ["yoni2435@gmail.com"],
        subject: "בקשה חדשה לשדרוג חשבון עסקי",
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">בקשה חדשה לשדרוג חשבון עסקי</h2>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>שם משתמש:</strong> ${profile?.full_name || profile?.username || "לא צוין"}</p>
              <p style="margin: 5px 0;"><strong>אימייל:</strong> ${user.email}</p>
              <p style="margin: 5px 0;"><strong>מזהה משתמש:</strong> ${user.id}</p>
              <p style="margin: 5px 0;"><strong>תאריך הבקשה:</strong> ${new Date().toLocaleDateString('he-IL')}</p>
            </div>

            <div style="margin: 30px 0;">
              <a href="${approvalUrl}" 
                 style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold;">
                אשר שדרוג
              </a>
            </div>

            <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
              לחץ על הכפתור לאישור שדרוג החשבון לעסקי. לאחר האישור, המשתמש יוכל להשתמש בכל התכונות העסקיות.
            </p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error('Resend API error:', errorData);
      throw new Error('שגיאה בשליחת המייל');
    }

    const emailData = await emailResponse.json();
    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "הבקשה נשלחה בהצלחה, המתן לאישור",
        requestId: request.id
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
    console.error("Error in request-business-upgrade:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
