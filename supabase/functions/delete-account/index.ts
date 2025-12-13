import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header to identify the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('נדרשת הזדהות');
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Initialize Supabase client with anon key to verify the user
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create client with user's token to get their identity
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` }
      }
    });
    
    // Verify the user's identity
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('הזדהות נכשלה');
    }

    console.log(`User ${user.id} requesting account deletion`);

    // Create admin client to perform the deletion
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's profile to clean up storage
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("profile_picture_url")
      .eq("id", user.id)
      .single();

    // Delete profile picture from storage if exists
    if (profile?.profile_picture_url) {
      const fileName = profile.profile_picture_url.split("/").pop();
      if (fileName) {
        console.log(`Deleting profile picture: ${user.id}/${fileName}`);
        await supabaseAdmin.storage
          .from("avatars")
          .remove([`${user.id}/${fileName}`]);
      }
    }

    // Delete all user's video posts from storage
    const { data: posts } = await supabaseAdmin
      .from("posts")
      .select("video_url")
      .eq("user_id", user.id)
      .not("video_url", "is", null);

    if (posts && posts.length > 0) {
      const videoFiles = posts
        .map((post) => {
          const fileName = post.video_url?.split("/").pop();
          return fileName ? `${user.id}/${fileName}` : null;
        })
        .filter(Boolean) as string[];

      if (videoFiles.length > 0) {
        console.log(`Deleting ${videoFiles.length} video files`);
        await supabaseAdmin.storage.from("videos").remove(videoFiles);
      }
    }

    // Delete verification codes for user's email
    if (user.email) {
      await supabaseAdmin
        .from('verification_codes')
        .delete()
        .eq('email', user.email.toLowerCase());
    }

    // Delete user from auth (this will cascade delete all related data)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      throw new Error('שגיאה במחיקת החשבון');
    }

    console.log(`Successfully deleted user: ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'החשבון נמחק בהצלחה'
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
    console.error("Error in delete-account function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'שגיאה במחיקת החשבון'
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
