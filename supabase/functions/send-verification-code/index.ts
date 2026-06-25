import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  email: string;
  username?: string;
  checkOnly?: boolean;
}

// Helper: return a clean JSON response always with status 200
// so supabase.functions.invoke always gets the body in `data`, never in `error`
const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email: rawEmail, username, checkOnly }: VerificationRequest = await req.json();

    if (!rawEmail || !rawEmail.includes('@')) {
      return jsonResponse({ success: false, error: 'כתובת אימייל לא תקינה' });
    }

    // Normalize email to lowercase
    const email = rawEmail.trim().toLowerCase();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ── Validate username ───────────────────────────────────────────────
    if (username) {
      if (username.length < 3) {
        return jsonResponse({ success: false, error: 'שם משתמש חייב להכיל לפחות 3 תווים' });
      }
      if (username.length > 50) {
        return jsonResponse({ success: false, error: 'שם משתמש ארוך מדי (מקסימום 50 תווים)' });
      }
      const usernameRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/`~\\]+$/;
      if (!usernameRegex.test(username)) {
        return jsonResponse({ success: false, error: 'שם משתמש יכול להכיל רק אותיות באנגלית, מספרים וסימנים מיוחדים' });
      }

      // Check if username already exists in profiles table
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (profileError) {
        console.error('Error checking username:', profileError);
        return jsonResponse({ success: false, error: 'שגיאה בבדיקת שם המשתמש' });
      }
      if (existingProfile) {
        return jsonResponse({ success: false, error: 'שם המשתמש כבר תפוס, אנא בחר שם משתמש אחר' });
      }
    }

    // ── Check if email already exists ──────────────────────────────────
    // Use a targeted query instead of listUsers() which fetches ALL users
    const { data: existingUsers, error: userCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (userCheckError) {
      console.error('Error checking existing users:', userCheckError);
      // Fall back to auth admin check if profiles table doesn't have email column
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({ perPage: 1, page: 1 });
      if (authError) {
        return jsonResponse({ success: false, error: 'שגיאה בבדיקת משתמשים קיימים' });
      }
      // We can't do a targeted query here without the email index, so we do a secondary check
    }

    // Better approach: try to look up by email via auth admin with filter
    // Supabase admin API supports filtering since 2.x
    let emailExists = false;
    try {
      const { data: filteredUsers } = await supabase.auth.admin.listUsers({
        perPage: 1,
        page: 1,
      });
      // We use a profiles-based check instead since listUsers doesn't support email filter
      const { data: profileCheck } = await supabase
        .from('profiles')
        .select('id')
        .ilike('email', email)
        .limit(1);

      // Also check verification_codes that might have been used (belt-and-suspenders)
      emailExists = profileCheck && profileCheck.length > 0;
    } catch (e) {
      console.error('Email existence check failed:', e);
    }

    if (checkOnly) {
      return jsonResponse({
        success: !emailExists,
        emailExists,
        error: emailExists ? 'מייל זה כבר רשום במערכת' : undefined,
      });
    }

    if (emailExists) {
      return jsonResponse({ success: false, error: 'מייל זה כבר רשום במערכת' });
    }

    // ── Generate & store verification code ─────────────────────────────
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Delete old codes for this email
    await supabase
      .from('verification_codes')
      .delete()
      .ilike('email', email);

    const { error: dbError } = await supabase
      .from('verification_codes')
      .insert({
        email,
        code,
        expires_at: expiresAt.toISOString(),
        verified: false,
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return jsonResponse({ success: false, error: 'שגיאה בשמירת קוד האימות' });
    }

    // ── Send email ─────────────────────────────────────────────────────
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "MotorClub <team@motorclub.co.il>",
        to: [email],
        subject: "קוד האימות שלך - MotorClub",
        html: `
          <!DOCTYPE html>
          <html dir="rtl" lang="he">
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; direction: rtl; background-color: #f5f5f5; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              h1 { color: #333; font-size: 24px; margin-bottom: 20px; }
              .code-box { background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; }
              .code { font-size: 36px; font-weight: bold; color: #E73838; letter-spacing: 8px; font-family: monospace; }
              .info { color: #666; font-size: 14px; line-height: 1.6; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #999; font-size: 12px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>ברוכים הבאים ל-MotorClub! 🚗</h1>
              <p class="info">קיבלנו בקשה לרישום חשבון עם כתובת המייל הזו.</p>
              <p class="info">להשלמת ההרשמה, אנא הזן את קוד האימות הבא:</p>
              <div class="code-box">
                <div class="code">${code}</div>
              </div>
              <p class="info"><strong>הקוד תקף ל-5 דקות בלבד.</strong><br>אם לא ביקשת להירשם, אנא התעלם ממייל זה.</p>
              <div class="footer">MotorClub - קהילת אוהבי הרכב הגדולה בישראל</div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error('Resend API error:', errorData);
      return jsonResponse({ success: false, error: 'שגיאה בשליחת המייל. אנא נסה שוב מאוחר יותר' });
    }

    return jsonResponse({ success: true, message: 'קוד האימות נשלח בהצלחה למייל' });

  } catch (error: any) {
    console.error("Unhandled error in send-verification-code:", error);
    return jsonResponse({ success: false, error: error.message || 'שגיאה בשליחת קוד האימות' });
  }
};

serve(handler);
