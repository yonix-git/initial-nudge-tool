import { Image, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const CreatePost = ({ onPostCreated }: { onPostCreated?: () => void }) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (type: "image" | "video", file: File) => {
    setSelectedFile(file);
    setFileType(type);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileType(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handlePost = async () => {
    if (!user || (!content.trim() && !selectedFile)) {
      toast.error("נא להוסיף תוכן או קובץ");
      return;
    }

    setIsPosting(true);
    try {
      let imageUrl = null;
      let videoUrl = null;

      // Upload file if selected
      if (selectedFile && fileType) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const bucketName = fileType === "image" ? "avatars" : "videos";

        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        if (fileType === "image") {
          imageUrl = publicUrl;
        } else {
          videoUrl = publicUrl;
        }
      }

      const { error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: content.trim() || null,
          image_url: imageUrl,
          video_url: videoUrl,
        });

      if (error) throw error;

      setContent("");
      handleRemoveFile();
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
            
            {filePreview && (
              <div className="relative mb-3 rounded-lg overflow-hidden bg-muted">
                {fileType === "image" ? (
                  <img src={filePreview} alt="Preview" className="w-full max-h-96 object-cover" />
                ) : (
                  <video src={filePreview} controls className="w-full max-h-96" />
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveFile}
                  disabled={isPosting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect("image", file);
                  }}
                  disabled={isPosting}
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect("video", file);
                  }}
                  disabled={isPosting}
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2" 
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isPosting || !!selectedFile}
                >
                  <Image className="h-4 w-4 text-foreground" />
                  <span className="text-sm font-semibold text-foreground">תמונה</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2" 
                  onClick={() => videoInputRef.current?.click()}
                  disabled={isPosting || !!selectedFile}
                >
                  <Video className="h-4 w-4 text-foreground" />
                  <span className="text-sm font-semibold text-foreground">וידאו</span>
                </Button>
              </div>
              <Button 
                size="sm" 
                onClick={handlePost}
                disabled={(!content.trim() && !selectedFile) || isPosting}
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
