import Header from "@/components/Header";
import PostItem from "@/components/PostItem";
import { PullToRefresh } from "@/components/PullToRefresh";
import { PostSkeletonList } from "@/components/PostSkeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const { dir } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async (showToast = false) => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setPosts(data);
    }
    setLoading(false);
    
    if (showToast && !error) {
      toast({ title: "הפיד רוענן בהצלחה" });
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    await fetchPosts(true);
  }, [fetchPosts]);

  useEffect(() => {
    if (!user || authLoading) return;

    fetchPosts();

    // Subscribe to realtime updates - only for INSERT and DELETE
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          setPosts(prev => [payload.new as any, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          setPosts(prev => prev.filter(p => p.id !== payload.old.id));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          setPosts(prev => prev.map(p => p.id === payload.new.id ? payload.new as any : p));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, authLoading, fetchPosts]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <Header />
        <main className="container max-w-2xl py-4 px-3 relative z-10">
          <PostSkeletonList count={3} />
        </main>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header />
      
      <PullToRefresh onRefresh={handleRefresh}>
        <main className="container max-w-2xl py-4 px-3 relative z-10">
          <div>
            {loading ? (
              <PostSkeletonList count={4} />
            ) : posts.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                אין פוסטים עדיין. היה הראשון לפרסם!
              </div>
            ) : (
              posts.map((post) => (
                <PostItem
                  key={post.id}
                  id={post.id}
                  userId={post.user_id}
                  content={post.content}
                  imageUrl={post.image_url}
                  videoUrl={post.video_url}
                  imageUrls={post.image_urls}
                  videoUrls={post.video_urls}
                  likesCount={post.likes_count}
                  commentsCount={post.comments_count}
                  createdAt={post.created_at}
                  onDelete={fetchPosts}
                  onUpdate={fetchPosts}
                />
              ))
            )}
          </div>
        </main>
      </PullToRefresh>
    </div>
  );
};

export default Index;
