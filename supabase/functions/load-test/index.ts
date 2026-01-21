import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LoadTestResult {
  action: string;
  duration_ms: number;
  success: boolean;
  error?: string;
}

interface TestSummary {
  total_tests: number;
  successful: number;
  failed: number;
  avg_response_time_ms: number;
  min_response_time_ms: number;
  max_response_time_ms: number;
  results: LoadTestResult[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, count = 10 } = await req.json();
    const results: LoadTestResult[] = [];

    const measureQuery = async (name: string, queryFn: () => Promise<unknown>): Promise<LoadTestResult> => {
      const start = performance.now();
      try {
        await queryFn();
        const duration = performance.now() - start;
        return { action: name, duration_ms: Math.round(duration * 100) / 100, success: true };
      } catch (err) {
        const duration = performance.now() - start;
        return { 
          action: name, 
          duration_ms: Math.round(duration * 100) / 100, 
          success: false, 
          error: err instanceof Error ? err.message : String(err)
        };
      }
    };

    switch (action) {
      case "db_read_test": {
        // Test database read performance
        for (let i = 0; i < count; i++) {
          results.push(await measureQuery(`read_posts_${i + 1}`, async () => {
            const { data, error } = await supabase
              .from("posts")
              .select("*")
              .order("created_at", { ascending: false })
              .limit(15);
            if (error) throw error;
            return data;
          }));
        }

        results.push(await measureQuery("read_profiles", async () => {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .limit(50);
          if (error) throw error;
          return data;
        }));

        results.push(await measureQuery("read_groups", async () => {
          const { data, error } = await supabase
            .from("groups")
            .select("*")
            .limit(50);
          if (error) throw error;
          return data;
        }));

        results.push(await measureQuery("read_forums", async () => {
          const { data, error } = await supabase
            .from("forum_topics")
            .select("*")
            .limit(50);
          if (error) throw error;
          return data;
        }));
        break;
      }

      case "db_write_test": {
        // Create a test user for write tests
        const testUserId = crypto.randomUUID();
        
        // Test write performance with temporary data
        for (let i = 0; i < Math.min(count, 5); i++) {
          const postId = crypto.randomUUID();
          
          results.push(await measureQuery(`write_post_${i + 1}`, async () => {
            const { error } = await supabase
              .from("posts")
              .insert({
                id: postId,
                user_id: testUserId,
                content: `בדיקת עומסים - פוסט מספר ${i + 1} - ${new Date().toISOString()}`,
              });
            if (error) throw error;
          }));

          // Clean up test post
          results.push(await measureQuery(`delete_post_${i + 1}`, async () => {
            const { error } = await supabase
              .from("posts")
              .delete()
              .eq("id", postId);
            if (error) throw error;
          }));
        }
        break;
      }

      case "concurrent_test": {
        // Test concurrent read operations
        const concurrentPromises = [];
        
        for (let i = 0; i < count; i++) {
          concurrentPromises.push(
            measureQuery(`concurrent_read_${i + 1}`, async () => {
              const { data, error } = await supabase
                .from("posts")
                .select("*, profiles:user_id(full_name, username, profile_picture_url)")
                .order("created_at", { ascending: false })
                .limit(15);
              if (error) throw error;
              return data;
            })
          );
        }

        const concurrentResults = await Promise.all(concurrentPromises);
        results.push(...concurrentResults);
        break;
      }

      case "full_test": {
        // Comprehensive test
        
        // 1. Database read tests
        for (let i = 0; i < 5; i++) {
          results.push(await measureQuery(`posts_feed_${i + 1}`, async () => {
            const { data, error } = await supabase
              .from("posts")
              .select("*")
              .order("created_at", { ascending: false })
              .limit(15);
            if (error) throw error;
            return data;
          }));
        }

        // 2. Join query tests
        results.push(await measureQuery("posts_with_profiles", async () => {
          const { data, error } = await supabase
            .from("posts")
            .select("*, profiles:user_id(full_name, username, profile_picture_url)")
            .order("created_at", { ascending: false })
            .limit(15);
          if (error) throw error;
          return data;
        }));

        // 3. Count queries
        results.push(await measureQuery("count_posts", async () => {
          const { count, error } = await supabase
            .from("posts")
            .select("*", { count: "exact", head: true });
          if (error) throw error;
          return count;
        }));

        results.push(await measureQuery("count_profiles", async () => {
          const { count, error } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true });
          if (error) throw error;
          return count;
        }));

        // 4. Concurrent reads
        const concurrent = await Promise.all([
          measureQuery("concurrent_posts", async () => {
            const { data, error } = await supabase.from("posts").select("*").limit(10);
            if (error) throw error;
            return data;
          }),
          measureQuery("concurrent_groups", async () => {
            const { data, error } = await supabase.from("groups").select("*").limit(10);
            if (error) throw error;
            return data;
          }),
          measureQuery("concurrent_forums", async () => {
            const { data, error } = await supabase.from("forum_topics").select("*").limit(10);
            if (error) throw error;
            return data;
          }),
          measureQuery("concurrent_profiles", async () => {
            const { data, error } = await supabase.from("profiles").select("*").limit(10);
            if (error) throw error;
            return data;
          }),
        ]);
        results.push(...concurrent);
        break;
      }

      case "stats": {
        // Get database statistics
        const [postsCount, profilesCount, groupsCount, messagesCount, forumTopicsCount] = await Promise.all([
          supabase.from("posts").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("groups").select("*", { count: "exact", head: true }),
          supabase.from("direct_messages").select("*", { count: "exact", head: true }),
          supabase.from("forum_topics").select("*", { count: "exact", head: true }),
        ]);

        return new Response(
          JSON.stringify({
            stats: {
              posts: postsCount.count || 0,
              profiles: profilesCount.count || 0,
              groups: groupsCount.count || 0,
              messages: messagesCount.count || 0,
              forum_topics: forumTopicsCount.count || 0,
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ 
            error: "Invalid action",
            available_actions: ["db_read_test", "db_write_test", "concurrent_test", "full_test", "stats"]
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Calculate summary
    const successful = results.filter(r => r.success);
    const times = successful.map(r => r.duration_ms);
    
    const summary: TestSummary = {
      total_tests: results.length,
      successful: successful.length,
      failed: results.length - successful.length,
      avg_response_time_ms: times.length > 0 ? Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 100) / 100 : 0,
      min_response_time_ms: times.length > 0 ? Math.min(...times) : 0,
      max_response_time_ms: times.length > 0 ? Math.max(...times) : 0,
      results,
    };

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
