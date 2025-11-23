import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeleteRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: DeleteRequest = await req.json();

    if (!email) {
      throw new Error('נדרש מייל');
    }

    const trimmedEmail = email.trim().toLowerCase();

    console.log(`Attempting to delete user: ${trimmedEmail}`);

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      throw new Error('שגיאה באיתור המשתמש');
    }

    const user = users.users.find(u => u.email === trimmedEmail);

    if (!user) {
      console.log('User not found in auth.users');
      // Delete from verification_codes anyway
      await supabase
        .from('verification_codes')
        .delete()
        .eq('email', trimmedEmail);

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'המשתמש לא נמצא במערכת'
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

    console.log(`Found user with id: ${user.id}`);

    // Delete user from auth.users (this will cascade to profiles due to foreign key)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      throw new Error('שגיאה במחיקת המשתמש');
    }

    // Also delete verification codes
    await supabase
      .from('verification_codes')
      .delete()
      .eq('email', trimmedEmail);

    console.log(`Successfully deleted user: ${trimmedEmail}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'המשתמש נמחק בהצלחה'
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
    console.error("Error in delete-user-by-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'שגיאה במחיקת המשתמש'
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
