import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

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

    // Check if user already has a request
    let requestId: string = "";
    
    const { data: existingRequest } = await supabase
      .from("business_upgrade_requests")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (existingRequest) {
      if (existingRequest.status === "pending") {
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
      
      // If there's a rejected request, update it to pending instead of creating new
      if (existingRequest.status === "rejected") {
        const { error: updateError } = await supabase
          .from("business_upgrade_requests")
          .update({ status: "pending", updated_at: new Date().toISOString() })
          .eq("id", existingRequest.id);

        if (updateError) {
          console.error("Error updating request:", updateError);
          throw updateError;
        }
        
        console.log("Updated existing rejected request to pending:", existingRequest.id);
        requestId = existingRequest.id;
      }
    } else {
      // Create new upgrade request only if no existing one
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
      requestId = request.id;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "הבקשה נשלחה בהצלחה, המתן לאישור",
        requestId: requestId
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
