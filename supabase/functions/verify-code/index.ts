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

// In-memory rate limiting (in production, use Redis or database)
const failedAttempts = new Map<string, { count: number, lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 5 * 60 * 1000; // 5 minutes

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code }: VerifyRequest = await req.json();

    if (!email || !code) {
      throw new Error('אנא הזן מייל וקוד אימות');
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCode = code.trim();

    // Check rate limiting
    const attemptKey = trimmedEmail;
    const now = Date.now();
    const attempts = failedAttempts.get(attemptKey);

    if (attempts) {
      // Check if user is still blocked
      if (attempts.count >= MAX_ATTEMPTS) {
        const timeSinceBlock = now - attempts.lastAttempt;
        if (timeSinceBlock < BLOCK_DURATION) {
          const minutesLeft = Math.ceil((BLOCK_DURATION - timeSinceBlock) / 60000);
          console.log(`Blocked attempt from ${trimmedEmail}. ${attempts.count} failed attempts.`);
          throw new Error(`יותר מדי ניסיונות שגויים. נסה שוב בעוד ${minutesLeft} דקות`);
        } else {
          // Reset after block duration
          failedAttempts.delete(attemptKey);
        }
      }
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the code
    const { data: verificationData, error: verifyError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', trimmedEmail)
      .eq('code', trimmedCode)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (verifyError || !verificationData) {
      // Track failed attempt
      const currentAttempts = failedAttempts.get(attemptKey);
      if (currentAttempts) {
        const timeSinceLastAttempt = now - currentAttempts.lastAttempt;
        // Reset counter if attempts are outside the window
        if (timeSinceLastAttempt > ATTEMPT_WINDOW) {
          failedAttempts.set(attemptKey, { count: 1, lastAttempt: now });
        } else {
          failedAttempts.set(attemptKey, {
            count: currentAttempts.count + 1,
            lastAttempt: now
          });
        }
      } else {
        failedAttempts.set(attemptKey, { count: 1, lastAttempt: now });
      }

      console.log(`Failed verification attempt for ${trimmedEmail}. Total attempts: ${failedAttempts.get(attemptKey)?.count}`);

      // Invalidate all codes for this email after too many failed attempts
      const attempts = failedAttempts.get(attemptKey);
      if (attempts && attempts.count >= MAX_ATTEMPTS) {
        await supabase
          .from('verification_codes')
          .delete()
          .eq('email', trimmedEmail);
        
        console.log(`Invalidated all codes for ${trimmedEmail} due to too many failed attempts`);
        throw new Error('יותר מדי ניסיונות שגויים. קוד האימות בוטל. אנא בקש קוד חדש.');
      }

      throw new Error('קוד האימות שגוי או שפג תוקפו');
    }

    // Success - DON'T mark as verified for password reset flow
    // Let reset-password handle marking as verified after password change
    failedAttempts.delete(attemptKey);

    console.log(`Successfully verified code for ${trimmedEmail}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'קוד האימות אומת בהצלחה'
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
        error: error.message || 'שגיאה באימות הקוד'
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
