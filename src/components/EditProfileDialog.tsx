import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Upload, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ImageCropDialog from "./ImageCropDialog";

interface EditProfileDialogProps {
  currentName: string;
  currentBio: string;
  currentVehicle: string;
  currentProfilePicture: string | null;
  onSave: (name: string, bio: string, vehicle: string, profilePicture: File | null, removeProfilePicture?: boolean) => void;
}

const EditProfileDialog = ({ currentName, currentBio, currentVehicle, currentProfilePicture, onSave }: EditProfileDialogProps) => {
  const [name, setName] = useState(currentName);
  const [bio, setBio] = useState(currentBio);
  const [vehicle, setVehicle] = useState(currentVehicle);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentProfilePicture);
  const [open, setOpen] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTempImageUrl(url);
      setCropDialogOpen(true);
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], "profile.jpg", { type: "image/jpeg" });
    setProfilePicture(croppedFile);
    const url = URL.createObjectURL(croppedBlob);
    setPreviewUrl(url);
    setCropDialogOpen(false);
    setTempImageUrl(null);
  };

  const handleRemoveImage = () => {
    setProfilePicture(null);
    setPreviewUrl(null);
  };

  const handleSave = () => {
    const removeProfilePicture = currentProfilePicture && !previewUrl && !profilePicture;
    onSave(name, bio, vehicle, profilePicture, removeProfilePicture);
    setOpen(false);
  };
  
  const getInitials = (name: string) => {
    if (!name) return "U";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join("");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Pencil className="h-4 w-4" />
            ערוך פרופיל
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>ערוך פרופיל</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="profile-picture-input"
              />
              <label htmlFor="profile-picture-input" className="cursor-pointer group relative">
                <Avatar className="h-32 w-32 transition-opacity group-hover:opacity-80">
                  {previewUrl && <AvatarImage src={previewUrl} />}
                  <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                    {getInitials(name)}
                  </AvatarFallback>
                </Avatar>
                {previewUrl && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveImage();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="h-8 w-8 text-white" />
                </div>
              </label>
              <p className="text-xs text-muted-foreground mt-2">
                לחץ על התמונה להעלאת תמונת פרופיל
              </p>
            </div>
          <div className="space-y-2">
            <Label htmlFor="name">שם</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="השם שלך"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">ביוגרפיה</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="ספר קצת על עצמך..."
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicle">הרכב שלי</Label>
            <Input
              id="vehicle"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="למשל: מאזדה 3 2019"
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            ביטול
          </Button>
          <Button onClick={handleSave}>
            שמור שינויים
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    
    {tempImageUrl && (
      <ImageCropDialog
        image={tempImageUrl}
        open={cropDialogOpen}
        onClose={() => {
          setCropDialogOpen(false);
          setTempImageUrl(null);
        }}
        onCropComplete={handleCropComplete}
      />
    )}
    </>
  );
};

export default EditProfileDialog;
