import { Image, Video, X, Edit, Crop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ImageTextEditor } from "./ImageTextEditor";
import ImageCropDialog from "./ImageCropDialog";

const CreatePost = ({ onPostCreated }: { onPostCreated?: () => void }) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [isCroppingImage, setIsCroppingImage] = useState(false);
  const [editedImageBlob, setEditedImageBlob] = useState<Blob | null>(null);
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
    setEditedImageBlob(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleSaveEditedImage = (blob: Blob) => {
    setEditedImageBlob(blob);
    setIsEditingImage(false);
    toast.success("התמונה נערכה בהצלחה!");
  };

  const handleSaveCroppedImage = (blob: Blob) => {
    setEditedImageBlob(blob);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(blob);
    setIsCroppingImage(false);
    toast.success("התמונה נחתכה בהצלחה!");
  };

  const handlePost = async () => {
    if (!user) {
      toast.error("יש להתחבר כדי לפרסם");
      return;
    }

    // Allow posts with only media (no text) or only text (no media)
    if (!content.trim() && !selectedFile) {
      toast.error("נא להוסיף טקסט או תמונה/וידאו");
      return;
    }

    setIsPosting(true);
    try {
      let imageUrl = null;
      let videoUrl = null;

      // Upload file if selected
      if ((selectedFile || editedImageBlob) && fileType) {
        const fileToUpload = editedImageBlob || selectedFile;
        if (!fileToUpload) throw new Error("No file to upload");

        const fileExt = editedImageBlob ? "png" : selectedFile!.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const bucketName = fileType === "image" ? "avatars" : "videos";

      console.log(`Uploading ${fileType} to bucket: ${bucketName}, fileName: ${fileName}`);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, fileToUpload, {
          contentType: fileType === "video" ? "video/mp4" : "image/png",
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`שגיאה בהעלאת ${fileType === "video" ? "הסרטון" : "התמונה"}: ${uploadError.message}`);
      }
      
      console.log("Upload successful:", uploadData);

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
    } catch (error: any) {
      console.error("Error creating post:", error);
      const errorMessage = error?.message || "אירעה שגיאה לא צפויה";
      toast.error(`שגיאה בפרסום הפוסט: ${errorMessage}`);
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
    <>
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
          <div className="flex-1 relative z-10">
            <Textarea 
              placeholder={profile?.account_type === 'business' ? "שתף עדכון על העסק שלך" : "מה חדש אצלך?"}
              className="min-h-[80px] resize-none mb-3 placeholder:text-muted-foreground text-foreground bg-background"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPosting}
              dir="rtl"
            />
            
            {filePreview && (
              <div className="relative mb-3 rounded-lg overflow-hidden bg-muted">
                {fileType === "image" ? (
                  <>
                    <img src={filePreview} alt="Preview" className="w-full max-h-96 object-cover" />
                    <div className="absolute top-2 left-2 right-2 flex gap-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => setIsCroppingImage(true)}
                        disabled={isPosting}
                        className="bg-background/80 hover:bg-background"
                      >
                        <Crop className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => setIsEditingImage(true)}
                        disabled={isPosting}
                        className="bg-background/80 hover:bg-background"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="mr-auto"
                        onClick={handleRemoveFile}
                        disabled={isPosting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <video src={filePreview} controls className="w-full max-h-96" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveFile}
                      disabled={isPosting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
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
                disabled={(!content.trim() && !selectedFile && !editedImageBlob) || isPosting}
              >
                {isPosting ? "מפרסם..." : "פרסם"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {filePreview && fileType === "image" && (
      <>
        <ImageCropDialog
          image={filePreview}
          open={isCroppingImage}
          onClose={() => setIsCroppingImage(false)}
          onCropComplete={handleSaveCroppedImage}
          aspectRatio={4 / 3}
          cropShape="rect"
        />
        <ImageTextEditor
          imageUrl={filePreview}
          isOpen={isEditingImage}
          onClose={() => setIsEditingImage(false)}
          onSave={handleSaveEditedImage}
        />
      </>
    )}
  </>
  );
};

export default CreatePost;
