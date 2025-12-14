import { Heart, MessageCircle, Share2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, useRef, memo, useCallback, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { Link } from "react-router-dom";
import MediaCarousel from "./MediaCarousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface PostItemProps {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  imageUrls?: string[];
  videoUrls?: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  onDelete?: () => void;
  onUpdate?: () => void;
}

const PostItem = ({ 
  id, 
  userId, 
  content, 
  imageUrl,
  videoUrl,
  imageUrls = [],
  videoUrls = [],
  likesCount, 
  commentsCount, 
  createdAt,
  onDelete,
  onUpdate 
}: PostItemProps) => {
  // Use arrays if available, otherwise fall back to single URLs
  const effectiveImageUrls = imageUrls.length > 0 ? imageUrls : (imageUrl ? [imageUrl] : []);
  const effectiveVideoUrls = videoUrls.length > 0 ? videoUrls : (videoUrl ? [videoUrl] : []);
  const hasMedia = effectiveImageUrls.length > 0 || effectiveVideoUrls.length > 0;
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likesCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteCommentDialog, setShowDeleteCommentDialog] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fullscreenVideoRef = useRef<HTMLVideoElement>(null);
  const { dir } = useLanguage();

  const isOwnPost = user?.id === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, username, profile_picture_url, is_verified")
        .eq("id", userId)
        .single();
      if (data) setProfile(data);
    };
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    const checkIfLiked = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      setIsLiked(!!data);
    };
    checkIfLiked();
  }, [id, user]);

  useEffect(() => {
    const fetchComments = async () => {
      console.log("Fetching comments for post:", id);
      const { data, error } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          created_at,
          updated_at,
          user_id,
          post_id,
          profiles:fk_comments_user_profile (
            full_name,
            username,
            profile_picture_url
          )
        `)
        .eq("post_id", id)
        .order("created_at", { ascending: true });
      
      console.log("Comments fetched:", data?.length || 0, "error:", error);
      if (data) {
        setComments(data);
      }
    };
    if (showComments) {
      fetchComments();
    }
  }, [id, showComments]);

  useEffect(() => {
    // Cleanup timer on unmount
    return () => {
      if (clickTimer) {
        clearTimeout(clickTimer);
      }
    };
  }, [clickTimer]);

  // Auto-play video when in viewport
  useEffect(() => {
    if (!videoRef.current || !videoUrl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => {
              // Autoplay might fail, that's okay
            });
          } else {
            videoRef.current?.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(videoRef.current);

    return () => {
      observer.disconnect();
    };
  }, [videoUrl]);

  const handleShare = useCallback(async () => {
    const postUrl = `${window.location.origin}/?post=${id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `פוסט מאת ${profile?.full_name || profile?.username || 'משתמש'}`,
          text: content.substring(0, 100),
          url: postUrl,
        });
        toast.success("הפוסט שותף בהצלחה!");
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(postUrl);
        toast.success("הקישור הועתק ללוח!");
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast.error("שגיאה בהעתקת הקישור");
      }
    }
  }, [id, profile, content]);

  const handleLike = useCallback(async () => {
    if (!user) {
      toast.error("יש להתחבר כדי לתת לייק");
      return;
    }

    try {
      if (isLiked) {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", id)
          .eq("user_id", user.id);
        
        if (error) throw error;
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        const { error } = await supabase
          .from("likes")
          .insert({ post_id: id, user_id: user.id });
        
        if (error) throw error;
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("שגיאה בעדכון הלייק");
    }
  }, [user, isLiked, id]);

  const handleAddComment = async () => {
    if (!user) {
      toast.error("יש להתחבר כדי להגיב");
      return;
    }

    if (!newComment.trim()) return;

    try {
      const { error } = await supabase
        .from("comments")
        .insert({
          post_id: id,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment("");
      // Refresh comments
      const { data } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          created_at,
          updated_at,
          user_id,
          post_id,
          profiles:fk_comments_user_profile (
            full_name,
            username,
            profile_picture_url
          )
        `)
        .eq("post_id", id)
        .order("created_at", { ascending: true });
      if (data) setComments(data);
      
      toast.success("התגובה נוספה בהצלחה!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("שגיאה בהוספת התגובה");
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentToDelete);

      if (error) throw error;

      // Refresh comments
      const { data } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          created_at,
          updated_at,
          user_id,
          post_id,
          profiles:fk_comments_user_profile (
            full_name,
            username,
            profile_picture_url
          )
        `)
        .eq("post_id", id)
        .order("created_at", { ascending: true });

      if (data) setComments(data);
      
      setShowDeleteCommentDialog(false);
      setCommentToDelete(null);
      toast.success("התגובה נמחקה בהצלחה!");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("שגיאה במחיקת התגובה");
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    try {
      const { error } = await supabase
        .from("posts")
        .update({ content: editContent.trim() })
        .eq("id", id);

      if (error) throw error;

      setIsEditing(false);
      toast.success("הפוסט עודכן בהצלחה!");
      onUpdate?.();
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("שגיאה בעדכון הפוסט");
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("הפוסט נמחק בהצלחה!");
      onDelete?.();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("שגיאה במחיקת הפוסט");
    }
  };

  const getInitials = useCallback((name: string) => {
    if (!name) return "U";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join("");
  }, []);

  const timeAgo = useMemo(() => formatDistanceToNow(new Date(createdAt), { 
    addSuffix: true, 
    locale: he 
  }), [createdAt]);

  return (
    <div className="bg-transparent p-3 pb-2 mb-1 border-b border-border/30">
      <div className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-3">
          <Link to={`/profile?id=${userId}`}>
            <Avatar className="cursor-pointer">
              {profile?.profile_picture_url && (
                <AvatarImage src={profile.profile_picture_url} />
              )}
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(profile?.full_name || profile?.username || "")}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <div className="flex items-center gap-1.5">
              <Link to={`/profile?id=${userId}`} className="hover:underline">
                <p className="font-semibold text-sm">{profile?.full_name || profile?.username || "משתמש"}</p>
              </Link>
              {profile?.is_verified && <VerifiedBadge size={14} />}
            </div>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
        </div>
        {isOwnPost && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 ml-2" />
                ערוך
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 ml-2" />
                מחק
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      <div 
        className="pb-3 cursor-pointer" 
        onClick={(e) => {
          if (isEditing) return;
          
          // Clear any existing timer
          if (clickTimer) {
            clearTimeout(clickTimer);
          }
          
          // Set a timer to open fullscreen after 250ms
          const timer = setTimeout(() => {
            setShowFullscreen(true);
            setClickTimer(null);
          }, 250);
          
          setClickTimer(timer);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          
          // Cancel the single click timer
          if (clickTimer) {
            clearTimeout(clickTimer);
            setClickTimer(null);
          }
          
          // Only perform like action
          handleLike();
        }}
      >
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(content);
                }}
              >
                ביטול
              </Button>
              <Button 
                size="sm"
                onClick={handleEdit}
                disabled={!editContent.trim()}
              >
                שמור
              </Button>
            </div>
          </div>
        ) : (
          <>
            {hasMedia && (
              <div className="mb-3">
                <MediaCarousel 
                  imageUrls={effectiveImageUrls}
                  videoUrls={effectiveVideoUrls}
                  onClick={() => {
                    if (clickTimer) {
                      clearTimeout(clickTimer);
                    }
                    const timer = setTimeout(() => {
                      setShowFullscreen(true);
                      setClickTimer(null);
                    }, 250);
                    setClickTimer(timer);
                  }}
                  onDoubleClick={() => {
                    if (clickTimer) {
                      clearTimeout(clickTimer);
                      setClickTimer(null);
                    }
                    handleLike();
                  }}
                />
              </div>
            )}
            {content && <p className="text-sm whitespace-pre-wrap">{content}</p>}
          </>
        )}
      </div>
      
      <div className="flex items-center justify-between border-t border-border/20 pt-3">
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={handleLike}
          >
            <Heart 
              className={`h-4 w-4 transition-colors ${
                isLiked ? "fill-primary text-primary" : ""
              }`} 
            />
            <span className="text-xs">{likeCount}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`gap-2 ${commentsCount > 0 ? 'text-primary hover:text-primary' : ''}`}
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className={`h-4 w-4 ${showComments ? 'fill-primary' : ''}`} />
            <span className="text-xs font-medium">
              {commentsCount > 0 ? `${commentsCount} תגובות` : 'הגב'}
            </span>
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
      
      {showComments && (
        <div className="pb-2 space-y-3 border-t border-border/20 pt-3 mt-3">
          {comments.length > 0 && (
            <div className="space-y-3 mb-3">
              <p className="text-xs font-semibold text-muted-foreground">תגובות ({comments.length})</p>
              <div className={`space-y-3 ${comments.length > 3 ? 'max-h-[250px] overflow-y-auto pr-2' : ''}`}>
                {comments.map((comment: any) => {
                  const isOwnComment = user?.id === comment.user_id;
                  return (
                    <div key={comment.id} className="flex gap-2">
                      <Avatar className="h-8 w-8">
                        {comment.profiles?.profile_picture_url && (
                          <AvatarImage src={comment.profiles.profile_picture_url} />
                        )}
                        <AvatarFallback className="bg-primary/10 text-xs">
                          {getInitials(comment.profiles?.full_name || comment.profiles?.username || "")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-muted/50 rounded-lg p-2">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs">
                              {comment.profiles?.full_name || comment.profiles?.username || "משתמש"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), { 
                                addSuffix: true, 
                                locale: he 
                              })}
                            </span>
                          </div>
                          {isOwnComment && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                setCommentToDelete(comment.id);
                                setShowDeleteCommentDialog(true);
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {user && (
            <div className="flex gap-2 border-t border-border/20 pt-3">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="הוסף תגובה..."
                className="min-h-[60px]"
              />
              <Button 
                size="sm"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                שלח
              </Button>
            </div>
          )}
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את הפוסט לצמיתות ולא ניתן יהיה לשחזר אותו.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>מחק</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteCommentDialog} onOpenChange={setShowDeleteCommentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת תגובה</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך למחוק את התגובה? פעולה זו לא ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCommentToDelete(null)}>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteComment}>מחק</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
        <DialogContent className="max-w-7xl w-full h-[95vh] p-0 border-0 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center">
            <MediaCarousel 
              imageUrls={effectiveImageUrls}
              videoUrls={effectiveVideoUrls}
              className="max-w-full max-h-full"
              onDoubleClick={handleLike}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default memo(PostItem, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.id === nextProps.id &&
    prevProps.likesCount === nextProps.likesCount &&
    prevProps.commentsCount === nextProps.commentsCount &&
    prevProps.content === nextProps.content &&
    prevProps.imageUrl === nextProps.imageUrl &&
    prevProps.videoUrl === nextProps.videoUrl &&
    JSON.stringify(prevProps.imageUrls) === JSON.stringify(nextProps.imageUrls) &&
    JSON.stringify(prevProps.videoUrls) === JSON.stringify(nextProps.videoUrls)
  );
});
