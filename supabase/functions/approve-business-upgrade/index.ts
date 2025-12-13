import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Verify HMAC signature for approval tokens
async function verifyApprovalToken(token: string): Promise<{ valid: boolean; requestId?: string; error?: string }> {
  try {
    const secretKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Decode base64url token
    const paddedToken = token.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(paddedToken);
    const tokenData = JSON.parse(decoded);
    
    const { requestId, expiresAt, signature } = tokenData;
    
    // Check expiration
    if (Date.now() > expiresAt) {
      return { valid: false, error: "Token expired" };
    }
    
    // Verify signature
    const message = `${requestId}:${expiresAt}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const messageData = encoder.encode(message);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const expectedSignature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const expectedSignatureArray = Array.from(new Uint8Array(expectedSignature));
    const expectedSignatureHex = expectedSignatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (signature !== expectedSignatureHex) {
      return { valid: false, error: "Invalid signature" };
    }
    
    return { valid: true, requestId };
  } catch (error) {
    console.error("Token verification error:", error);
    return { valid: false, error: "Invalid token format" };
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      throw new Error("Missing token");
    }

    // Verify the secure token
    const verification = await verifyApprovalToken(token);
    
    if (!verification.valid || !verification.requestId) {
      console.error("Token verification failed:", verification.error);
      return new Response(
        `
        <!DOCTYPE html>
        <html dir="rtl">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>קישור לא תקין</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .container {
                background: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                text-align: center;
                max-width: 500px;
              }
              h1 { color: #f44336; margin-bottom: 20px; }
              p { color: #666; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>❌ קישור לא תקין</h1>
              <p>${verification.error === "Token expired" ? "תוקף הקישור פג. אנא בקש מהמשתמש לשלוח בקשה חדשה." : "הקישור אינו תקין. אנא וודא שהקישור הועתק במלואו."}</p>
            </div>
          </body>
        </html>
        `,
        {
          status: 400,
          headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
        }
      );
    }

    const requestId = verification.requestId;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Processing approval for request:", requestId);

    // Get the request
    const { data: request, error: requestError } = await supabase
      .from("business_upgrade_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (requestError || !request) {
      console.error("Request not found:", requestError);
      throw new Error("Request not found");
    }

    if (request.status !== "pending") {
      return new Response(
        `
        <!DOCTYPE html>
        <html dir="rtl">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>הבקשה כבר טופלה</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .container {
                background: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                text-align: center;
                max-width: 500px;
              }
              h1 { color: #333; margin-bottom: 20px; }
              p { color: #666; line-height: 1.6; }
              .status { 
                display: inline-block;
                padding: 8px 16px;
                border-radius: 20px;
                background-color: #ffc107;
                color: white;
                font-weight: bold;
                margin-top: 15px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>⚠️ הבקשה כבר טופלה</h1>
              <p>הבקשה לשדרוג חשבון כבר אושרה או נדחתה בעבר.</p>
              <div class="status">סטטוס: ${request.status === "approved" ? "אושרה" : "נדחתה"}</div>
            </div>
          </body>
        </html>
        `,
        {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
        }
      );
    }

    // Update request status
    const { error: updateRequestError } = await supabase
      .from("business_upgrade_requests")
      .update({ status: "approved" })
      .eq("id", requestId);

    if (updateRequestError) {
      console.error("Error updating request:", updateRequestError);
      throw updateRequestError;
    }

    // Update user profile to business account
    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update({ account_type: "business" })
      .eq("id", request.user_id);

    if (updateProfileError) {
      console.error("Error updating profile:", updateProfileError);
      throw updateProfileError;
    }

    console.log("Successfully upgraded user to business account:", request.user_id);

    // Return success HTML page
    return new Response(
      `
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>שדרוג אושר בהצלחה</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
              text-align: center;
              max-width: 500px;
            }
            h1 { color: #4CAF50; margin-bottom: 20px; }
            p { color: #666; line-height: 1.6; }
            .checkmark {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              background: #4CAF50;
              color: white;
              font-size: 50px;
              line-height: 80px;
              margin: 0 auto 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="checkmark">✓</div>
            <h1>החשבון שודרג בהצלחה!</h1>
            <p>החשבון עודכן לחשבון עסקי. המשתמש יכול כעת להשתמש בכל התכונות העסקיות.</p>
            <p style="margin-top: 20px; font-size: 14px; color: #999;">ניתן לסגור חלון זה.</p>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in approve-business-upgrade:", error);
    return new Response(
      `
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>שגיאה</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
              text-align: center;
              max-width: 500px;
            }
            h1 { color: #f44336; margin-bottom: 20px; }
            p { color: #666; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ שגיאה</h1>
            <p>אירעה שגיאה באישור השדרוג. אנא נסה שוב או פנה לתמיכה.</p>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">שגיאה כללית</p>
          </div>
        </body>
      </html>
      `,
      {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
      }
    );
  }
};

serve(handler);
