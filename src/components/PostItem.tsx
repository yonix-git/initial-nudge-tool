import { Heart, MessageCircle, Share2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
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
import { Textarea } from "@/components/ui/textarea";

interface PostItemProps {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
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
  likesCount, 
  commentsCount, 
  createdAt,
  onDelete,
  onUpdate 
}: PostItemProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likesCount);
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { dir } = useLanguage();

  const isOwnPost = user?.id === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (data) setProfile(data);
    };
    fetchProfile();
  }, [userId]);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1);
      setIsLiked(false);
    } else {
      setLikeCount(likeCount + 1);
      setIsLiked(true);
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

  const getInitials = (name: string) => {
    if (!name) return "U";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join("");
  };

  const timeAgo = formatDistanceToNow(new Date(createdAt), { 
    addSuffix: true, 
    locale: he 
  });

  return (
    <div className="bg-card/40 backdrop-blur-sm rounded-xl p-4 mb-3 border-0 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-3">
          <Avatar>
            {profile?.profile_picture_url && (
              <AvatarImage src={profile.profile_picture_url} />
            )}
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(profile?.full_name || profile?.username || "")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{profile?.full_name || profile?.username || "משתמש"}</p>
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
      
      <div className="pb-3">
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
            <p className="text-sm mb-3 whitespace-pre-wrap">{content}</p>
            {imageUrl && (
              <img 
                src={imageUrl} 
                alt="Post content" 
                className="w-full rounded-lg object-cover max-h-96"
              />
            )}
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
            className="gap-2"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">{commentsCount}</span>
          </Button>
        </div>
        <Button variant="ghost" size="sm">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
      
      {showComments && (
        <div className="pb-2 space-y-3 border-t border-border/20 pt-3 mt-3">
          <div className="text-sm text-muted-foreground">
            אין תגובות עדיין. היה הראשון להגיב!
          </div>
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
    </div>
  );
};

export default PostItem;
