import Header from "@/components/Header";
import PostItem from "@/components/PostItem";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

const Index = () => {
  const { dir } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setPosts(data);
    }
    setLoading(false);
  }, []);

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
        <main className="container max-w-2xl py-6 px-4 relative z-10">
          <div className="bg-card rounded-xl p-4 mb-3">
            <div className="flex gap-3 mb-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-20 w-full mb-3" />
          </div>
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
      
      <main className="container max-w-2xl py-6 px-4 relative z-10">
        <div>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-4 mb-3">
                <div className="flex gap-3 mb-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full mb-3" />
                <div className="flex gap-4">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))
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
    </div>
  );
};

export default Index;
