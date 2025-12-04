import { Image, Video, X, Edit, Crop, ChevronLeft, ChevronRight } from "lucide-react";
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

const MAX_IMAGES = 10;
const MAX_VIDEOS = 5;
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB

interface FileItem {
  file: File;
  preview: string;
  editedBlob?: Blob;
}

const CreatePost = ({ onPostCreated }: { onPostCreated?: () => void }) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [selectedImages, setSelectedImages] = useState<FileItem[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<FileItem[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [croppingImageIndex, setCroppingImageIndex] = useState<number | null>(null);
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

  const handleImageSelect = (files: FileList | null) => {
    if (!files) return;
    
    if (selectedVideos.length > 0) {
      toast.error("לא ניתן להעלות תמונות וסרטונים יחד");
      return;
    }

    const remainingSlots = MAX_IMAGES - selectedImages.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      toast.warning(`ניתן להעלות עד ${MAX_IMAGES} תמונות`);
    }

    filesToAdd.forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("הקובץ גדול מדי. גודל מקסימלי: 30MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImages(prev => [...prev, {
          file,
          preview: reader.result as string
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoSelect = (files: FileList | null) => {
    if (!files) return;
    
    if (selectedImages.length > 0) {
      toast.error("לא ניתן להעלות סרטונים ותמונות יחד");
      return;
    }

    const remainingSlots = MAX_VIDEOS - selectedVideos.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      toast.warning(`ניתן להעלות עד ${MAX_VIDEOS} סרטונים`);
    }

    filesToAdd.forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("הקובץ גדול מדי. גודל מקסימלי: 30MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedVideos(prev => [...prev, {
          file,
          preview: reader.result as string
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    if (currentPreviewIndex >= selectedImages.length - 1 && currentPreviewIndex > 0) {
      setCurrentPreviewIndex(currentPreviewIndex - 1);
    }
  };

  const handleRemoveVideo = (index: number) => {
    setSelectedVideos(prev => prev.filter((_, i) => i !== index));
    if (currentPreviewIndex >= selectedVideos.length - 1 && currentPreviewIndex > 0) {
      setCurrentPreviewIndex(currentPreviewIndex - 1);
    }
  };

  const handleRemoveAll = () => {
    setSelectedImages([]);
    setSelectedVideos([]);
    setCurrentPreviewIndex(0);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleSaveEditedImage = (blob: Blob) => {
    if (editingImageIndex === null) return;
    setSelectedImages(prev => prev.map((item, i) => 
      i === editingImageIndex ? { ...item, editedBlob: blob } : item
    ));
    setEditingImageIndex(null);
    toast.success("התמונה נערכה בהצלחה!");
  };

  const handleSaveCroppedImage = (blob: Blob) => {
    if (croppingImageIndex === null) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImages(prev => prev.map((item, i) => 
        i === croppingImageIndex ? { ...item, editedBlob: blob, preview: reader.result as string } : item
      ));
    };
    reader.readAsDataURL(blob);
    setCroppingImageIndex(null);
    toast.success("התמונה נחתכה בהצלחה!");
  };

  const handlePost = async () => {
    if (!user) {
      toast.error("יש להתחבר כדי לפרסם");
      return;
    }

    if (!content.trim() && selectedImages.length === 0 && selectedVideos.length === 0) {
      toast.error("נא להוסיף טקסט או תמונות/סרטונים");
      return;
    }

    setIsPosting(true);
    try {
      const imageUrls: string[] = [];
      const videoUrls: string[] = [];

      // Upload images
      for (const item of selectedImages) {
        const fileToUpload = item.editedBlob || item.file;
        const fileExt = item.editedBlob ? "png" : item.file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, fileToUpload, {
            contentType: "image/png",
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        imageUrls.push(publicUrl);
      }

      // Upload videos
      for (const item of selectedVideos) {
        const fileExt = item.file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("videos")
          .upload(fileName, item.file, {
            contentType: "video/mp4",
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("videos")
          .getPublicUrl(fileName);

        videoUrls.push(publicUrl);
      }

      const { error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: content.trim() || null,
          image_url: imageUrls[0] || null,
          video_url: videoUrls[0] || null,
          image_urls: imageUrls,
          video_urls: videoUrls,
        });

      if (error) throw error;

      setContent("");
      handleRemoveAll();
      toast.success("הפוסט פורסם בהצלחה!");
      onPostCreated?.();
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast.error(`שגיאה בפרסום הפוסט: ${error?.message || "אירעה שגיאה"}`);
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

  const hasMedia = selectedImages.length > 0 || selectedVideos.length > 0;
  const currentItems = selectedImages.length > 0 ? selectedImages : selectedVideos;
  const isImages = selectedImages.length > 0;

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
              
              {hasMedia && (
                <div className="relative mb-3 rounded-lg overflow-hidden bg-muted">
                  {isImages ? (
                    <>
                      <img 
                        src={currentItems[currentPreviewIndex]?.preview} 
                        alt="Preview" 
                        className="w-full max-h-96 object-cover" 
                      />
                      <div className="absolute top-2 left-2 right-2 flex gap-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => setCroppingImageIndex(currentPreviewIndex)}
                          disabled={isPosting}
                          className="bg-background/80 hover:bg-background"
                        >
                          <Crop className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => setEditingImageIndex(currentPreviewIndex)}
                          disabled={isPosting}
                          className="bg-background/80 hover:bg-background"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="mr-auto"
                          onClick={() => handleRemoveImage(currentPreviewIndex)}
                          disabled={isPosting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <video 
                        src={currentItems[currentPreviewIndex]?.preview} 
                        controls 
                        className="w-full max-h-96" 
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => handleRemoveVideo(currentPreviewIndex)}
                        disabled={isPosting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  {/* Navigation arrows */}
                  {currentItems.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                        onClick={() => setCurrentPreviewIndex(prev => 
                          prev === 0 ? currentItems.length - 1 : prev - 1
                        )}
                        disabled={isPosting}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                        onClick={() => setCurrentPreviewIndex(prev => 
                          prev === currentItems.length - 1 ? 0 : prev + 1
                        )}
                        disabled={isPosting}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  {/* Indicators */}
                  {currentItems.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {currentItems.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentPreviewIndex 
                              ? 'bg-primary' 
                              : 'bg-background/60'
                          }`}
                          onClick={() => setCurrentPreviewIndex(index)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Counter badge */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-background/80 px-2 py-1 rounded-full text-xs font-medium">
                    {currentPreviewIndex + 1} / {currentItems.length}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageSelect(e.target.files)}
                    disabled={isPosting}
                  />
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleVideoSelect(e.target.files)}
                    disabled={isPosting}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2" 
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isPosting || selectedVideos.length > 0 || selectedImages.length >= MAX_IMAGES}
                  >
                    <Image className="h-4 w-4 text-foreground" />
                    <span className="text-sm font-semibold text-foreground">
                      תמונות {selectedImages.length > 0 && `(${selectedImages.length}/${MAX_IMAGES})`}
                    </span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2" 
                    onClick={() => videoInputRef.current?.click()}
                    disabled={isPosting || selectedImages.length > 0 || selectedVideos.length >= MAX_VIDEOS}
                  >
                    <Video className="h-4 w-4 text-foreground" />
                    <span className="text-sm font-semibold text-foreground">
                      סרטונים {selectedVideos.length > 0 && `(${selectedVideos.length}/${MAX_VIDEOS})`}
                    </span>
                  </Button>
                </div>
                <Button 
                  size="sm" 
                  onClick={handlePost}
                  disabled={(!content.trim() && !hasMedia) || isPosting}
                >
                  {isPosting ? "מפרסם..." : "פרסם"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {editingImageIndex !== null && selectedImages[editingImageIndex] && (
        <ImageTextEditor
          imageUrl={selectedImages[editingImageIndex].preview}
          isOpen={true}
          onClose={() => setEditingImageIndex(null)}
          onSave={handleSaveEditedImage}
        />
      )}

      {croppingImageIndex !== null && selectedImages[croppingImageIndex] && (
        <ImageCropDialog
          image={selectedImages[croppingImageIndex].preview}
          open={true}
          onClose={() => setCroppingImageIndex(null)}
          onCropComplete={handleSaveCroppedImage}
          aspectRatio={4 / 3}
          cropShape="rect"
        />
      )}
    </>
  );
};

export default CreatePost;