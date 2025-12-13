import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyRequest {
  email: string;
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code }: VerifyRequest = await req.json();

    if (!email || !code) {
      throw new Error('חסרים פרטים נדרשים');
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCode = code.trim();

    console.log(`Verifying code for email: ${trimmedEmail}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find the verification code
    const { data: verificationData, error: fetchError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', trimmedEmail)
      .eq('code', trimmedCode)
      .eq('verified', false)
      .maybeSingle();

    if (fetchError) {
      console.error('Database error:', fetchError);
      throw new Error('שגיאה בבדיקת קוד האימות');
    }

    if (!verificationData) {
      console.error('Code not found or already used');
      throw new Error('קוד שגוי, אנא נסה שנית');
    }

    // Check if code has expired
    const now = new Date();
    const expiresAt = new Date(verificationData.expires_at);

    if (now > expiresAt) {
      console.error('Code expired');
      throw new Error('קוד האימות פג תוקפו');
    }

    // Mark the code as verified
    const { error: updateError } = await supabase
      .from('verification_codes')
      .update({ verified: true })
      .eq('id', verificationData.id);

    if (updateError) {
      console.error('Error marking code as verified:', updateError);
      // Non-critical error, continue with success
    }

    console.log(`Successfully verified code for ${trimmedEmail}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'הקוד אומת בהצלחה'
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
    console.error("Error in verify-code function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'קוד האימות שגוי או פג תוקפו'
      }),
      {
        status: 400,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
