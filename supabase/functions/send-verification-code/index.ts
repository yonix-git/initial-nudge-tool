import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  email: string;
  checkOnly?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, checkOnly }: VerificationRequest = await req.json();

    if (!email || !email.includes('@')) {
      throw new Error('כתובת אימייל לא תקינה');
    }

    // Initialize Supabase client with service role to check auth.users
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if email already exists in auth.users
    const { data: existingUsers, error: userCheckError } = await supabase.auth.admin.listUsers();
    
    if (userCheckError) {
      console.error('Error checking existing users:', userCheckError);
      throw new Error('שגיאה בבדיקת משתמשים קיימים');
    }

    const emailExists = existingUsers.users.some(user => user.email === email.toLowerCase());
    
    if (emailExists) {
      throw new Error('מייל זה כבר רשום במערכת');
    }

    // If checkOnly, return success without sending code
    if (checkOnly) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'מייל זמין'
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Generate 5-digit code
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    
    // Set expiration to 5 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Delete old verification codes for this email
    await supabase
      .from('verification_codes')
      .delete()
      .eq('email', email);

    // Store verification code in database
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
      throw new Error('שגיאה בשמירת קוד האימות');
    }

    // Send email with code using Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "CarHub <team@motorhub.co.il>",
        to: [email],
        subject: "קוד האימות שלך - CarHub",
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
                color: #2563eb;
                letter-spacing: 8px;
                font-family: monospace;
              }
              .info {
                color: #666;
                font-size: 14px;
                line-height: 1.6;
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
              <h1>ברוכים הבאים ל-CarHub! 🚗</h1>
              <p class="info">קיבלנו בקשה לרישום חשבון עם כתובת המייל הזו.</p>
              <p class="info">להשלמת ההרשמה, אנא הזן את קוד האימות הבא:</p>
              
              <div class="code-box">
                <div class="code">${code}</div>
              </div>
              
              <p class="info">
                <strong>הקוד תקף ל-5 דקות בלבד.</strong><br>
                אם לא ביקשת להירשם, אנא התעלם ממייל זה.
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
      JSON.stringify({ 
        success: true,
        message: 'קוד האימות נשלח בהצלחה למייל'
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
    console.error("Error in send-verification-code function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'שגיאה בשליחת קוד האימות'
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
