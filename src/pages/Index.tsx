import Header from "@/components/Header";
import PostItem from "@/components/PostItem";
import { PullToRefresh } from "@/components/PullToRefresh";
import { PostSkeletonList, PostSkeleton } from "@/components/PostSkeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Loader2 } from "lucide-react";

const POSTS_PER_PAGE = 15;

const Index = () => {
  const { dir } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);

  const fetchPosts = useCallback(async (showToast = false, reset = true) => {
    if (reset) {
      setLoading(true);
      pageRef.current = 0;
    }

    const from = pageRef.current * POSTS_PER_PAGE;
    const to = from + POSTS_PER_PAGE - 1;

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (data) {
      if (reset) {
        setPosts(data);
      } else {
        setPosts(prev => [...prev, ...data]);
      }
      setHasMore(data.length === POSTS_PER_PAGE);
    }
    
    setLoading(false);
    setLoadingMore(false);
    
    if (showToast && !error) {
      toast({ title: "הפיד רוענן בהצלחה" });
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    pageRef.current += 1;
    await fetchPosts(false, false);
  }, [loadingMore, hasMore, fetchPosts]);

  const { setLoadMoreRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: loadingMore,
    threshold: 300,
  });

  const handleRefresh = useCallback(async () => {
    await fetchPosts(true, true);
  }, [fetchPosts]);

  useEffect(() => {
    if (!user || authLoading) return;

    fetchPosts();

    // Subscribe to realtime updates
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
              <>
                {posts.map((post) => (
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
                    onDelete={() => fetchPosts(false, true)}
                    onUpdate={() => fetchPosts(false, true)}
                  />
                ))}
                
                {/* Infinite scroll trigger */}
                <div ref={setLoadMoreRef} className="py-4">
                  {loadingMore && (
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {!hasMore && posts.length > 0 && (
                    <p className="text-center text-sm text-muted-foreground">
                      הגעת לסוף הפיד 🏁
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </PullToRefresh>
    </div>
  );
};

export default Index;
