import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResetRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: ResetRequest = await req.json();

    console.log("Password reset request for email:", email);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: "כתובת אימייל לא תקינה" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUser?.users?.some(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );

    if (!userExists) {
      return new Response(
        JSON.stringify({ error: "מייל זה אינו רשום" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    console.log("Generated code for password reset:", code);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { error: dbError } = await supabase.from("verification_codes").insert({
      email: email.toLowerCase(),
      code,
      expires_at: expiresAt.toISOString(),
      verified: false,
    });

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("שגיאה בשמירת קוד האימות");
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "CarHub <team@motorhub.co.il>",
        to: [email],
        subject: "קוד לאיפוס סיסמה - CarHub",
        html: `
          <!DOCTYPE html>
          <html dir="rtl" lang="he">
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
                direction: rtl;
                background-color: #f5f5f5;
                margin: 0;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              h1 {
                color: #333;
                font-size: 24px;
                margin-bottom: 20px;
              }
              .code-box {
                background-color: #f8f9fa;
                border: 2px solid #e9ecef;
                border-radius: 8px;
                padding: 30px;
                text-align: center;
                margin: 30px 0;
              }
              .code {
                font-size: 36px;
                font-weight: bold;
                color: #dc2626;
                letter-spacing: 8px;
                font-family: monospace;
              }
              .info {
                color: #666;
                font-size: 14px;
                line-height: 1.6;
              }
              .warning {
                background-color: #fef3c7;
                border-right: 4px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
                color: #999;
                font-size: 12px;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🔒 איפוס סיסמה</h1>
              <p class="info">קיבלנו בקשה לאיפוס הסיסמה עבור החשבון שלך ב-CarHub.</p>
              <p class="info">להמשך תהליך איפוס הסיסמה, אנא הזן את קוד האימות הבא:</p>
              
              <div class="code-box">
                <div class="code">${code}</div>
              </div>
              
              <div class="warning">
                <p class="info" style="margin: 0;">
                  <strong>⚠️ שים לב:</strong> הקוד תקף ל-10 דקות בלבד.
                </p>
              </div>
              
              <p class="info">
                אם לא ביקשת לאפס את הסיסמה, אנא התעלם ממייל זה.<br>
                החשבון שלך יישאר מאובטח.
              </p>
              
              <div class="footer">
                CarHub - קהילת אוהבי הרכב הגדולה בישראל
              </div>
            </div>
          </body>
          </html>
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
      JSON.stringify({ success: true, message: "קוד אימות נשלח למייל" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-password-reset-code:", error);
    return new Response(
      JSON.stringify({ error: error.message || "שגיאה פנימית" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
