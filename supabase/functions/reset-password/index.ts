import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResetPasswordRequest {
  email: string;
  newPassword: string;
  verificationCode: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, newPassword, verificationCode }: ResetPasswordRequest = await req.json();

    console.log("Reset password request for:", email);

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the code is valid and not expired
    // The code should be verified=true (from verify-code step) and not expired
    const { data: verificationData, error: verificationError } = await supabase
      .from("verification_codes")
      .select("*")
      .eq("email", email)
      .eq("code", verificationCode)
      .eq("verified", true)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (verificationError || !verificationData) {
      console.error("Verification error:", verificationError);
      return new Response(
        JSON.stringify({ error: "קוד האימות שגוי או שפג תוקפו" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Verification code is valid, updating password...");

    // Get user by email
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers();
    
    if (getUserError) {
      console.error("Error getting user:", getUserError);
      return new Response(
        JSON.stringify({ error: "שגיאה במציאת המשתמש" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const user = users?.find(u => u.email === email);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: "המשתמש אינו קיים במערכת" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("User found:", user.id);

    // Update user's password using admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error("Error updating password:", updateError);
      return new Response(
        JSON.stringify({ error: "שגיאה בעדכון הסיסמה" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Mark verification code as verified
    await supabase
      .from("verification_codes")
      .update({ verified: true })
      .eq("email", email)
      .eq("code", verificationCode);

    console.log("Password updated successfully");

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in reset-password function:", error);
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
