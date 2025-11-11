import { Image, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const CreatePost = ({ onPostCreated }: { onPostCreated?: () => void }) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) setProfile(data);
      }
    };
    fetchProfile();
  }, [user]);

  const handlePost = async () => {
    if (!user || !content.trim()) return;

    setIsPosting(true);
    try {
      const { error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: content.trim(),
        });

      if (error) throw error;

      setContent("");
      toast.success("הפוסט פורסם בהצלחה!");
      onPostCreated?.();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("שגיאה בפרסום הפוסט");
    } finally {
      setIsPosting(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join("");
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-3">
          <Avatar>
            {profile?.profile_picture_url && (
              <AvatarImage src={profile.profile_picture_url} />
            )}
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(profile?.full_name || profile?.username || "")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea 
              placeholder="מה חדש ברכב שלך?"
              className="min-h-[80px] resize-none mb-3 placeholder:text-foreground/60 placeholder:font-medium"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPosting}
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="gap-2" disabled>
                  <Image className="h-4 w-4" />
                  <span className="text-xs hidden sm:inline">תמונה</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2" disabled>
                  <Video className="h-4 w-4" />
                  <span className="text-xs hidden sm:inline">וידאו</span>
                </Button>
              </div>
              <Button 
                size="sm" 
                onClick={handlePost}
                disabled={!content.trim() || isPosting}
              >
                {isPosting ? "מפרסם..." : "פרסם"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePost;
