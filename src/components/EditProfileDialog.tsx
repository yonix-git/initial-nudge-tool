import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Upload, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ImageCropDialog from "./ImageCropDialog";

const BUSINESS_CATEGORIES = [
  "מכונאות",
  "פחחות וצבע",
  "חשמל רכב",
  "דיאגנוסטיקה",
  "ציפויים",
  "רפדות",
  "חלקי חילוף",
  "אגזוזים",
  "שטיפת רכבים",
  "דיטיילינג",
  "צילום",
  "מצברים",
  "שמשות",
  "צמיגים",
  "אופנועים",
  "מכירת רכבים"
];

interface EditProfileDialogProps {
  currentName: string;
  currentBio: string;
  currentVehicle: string;
  currentProfilePicture: string | null;
  currentProfile: any;
  onSave: (
    name: string, 
    bio: string, 
    vehicle: string, 
    profilePicture: File | null, 
    removeProfilePicture?: boolean,
    businessData?: {
      phone?: string;
      address?: string;
      description?: string;
      categories?: string[];
      businessType?: string;
    }
  ) => void;
}

const EditProfileDialog = ({ currentName, currentBio, currentVehicle, currentProfilePicture, currentProfile, onSave }: EditProfileDialogProps) => {
  const [name, setName] = useState(currentName);
  const [bio, setBio] = useState(currentBio);
  const [vehicle, setVehicle] = useState(currentVehicle);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentProfilePicture);
  const [open, setOpen] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  
  // Business fields
  const [businessPhone, setBusinessPhone] = useState(currentProfile?.business_phone || "");
  const [businessAddress, setBusinessAddress] = useState(currentProfile?.business_address || "");
  const [businessDescription, setBusinessDescription] = useState(currentProfile?.business_description || "");
  const [businessCategories, setBusinessCategories] = useState<string[]>(
    currentProfile?.business_categories || []
  );
  const [businessType, setBusinessType] = useState(currentProfile?.business_type || "garage");
  
  const isBusinessAccount = currentProfile?.account_type === 'business';

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
    
    let businessData: any = undefined;
    if (isBusinessAccount) {
      businessData = {
        phone: businessPhone || undefined,
        address: businessAddress || undefined,
        description: businessDescription || undefined,
        categories: businessCategories.length > 0 ? businessCategories : undefined,
        businessType: businessType
      };
    }
    
    onSave(name, bio, vehicle, profilePicture, removeProfilePicture, businessData);
    setOpen(false);
  };

  const toggleCategory = (category: string) => {
    setBusinessCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const isGarage = businessType === 'garage';
  const isAddressRequired = isGarage && !businessAddress.trim();
  
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
          <ScrollArea className="max-h-[60vh] px-1">
            <div className="space-y-4 py-4 pr-4">
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
            <Label htmlFor="name">{isBusinessAccount ? "שם העסק" : "שם"}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isBusinessAccount ? "שם העסק שלך" : "השם שלך"}
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
          
          {!isBusinessAccount && (
            <div className="space-y-2">
              <Label htmlFor="vehicle">הרכב שלי</Label>
              <Input
                id="vehicle"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                placeholder="למשל: מאזדה 3 2019"
              />
            </div>
          )}
          
          {/* Business Fields */}
          {isBusinessAccount && (
            <>
              <div className="space-y-2">
                <Label htmlFor="businessDescription">תיאור עסקי</Label>
                <Textarea
                  id="businessDescription"
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  placeholder="תאר את העסק שלך..."
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessPhone">טלפון עסק</Label>
                <Input
                  id="businessPhone"
                  value={businessPhone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9\-]/g, '');
                    setBusinessPhone(value);
                  }}
                  placeholder="050-1234567"
                  type="tel"
                />
              </div>
              <div className="space-y-3">
                <Label>סוג העסק</Label>
                <RadioGroup value={businessType} onValueChange={setBusinessType}>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="garage" id="garage" />
                    <Label htmlFor="garage" className="cursor-pointer font-normal">מוסך</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="independent_professional" id="independent" />
                    <Label htmlFor="independent" className="cursor-pointer font-normal">בעל מקצוע ללא מוסך</Label>
                  </div>
                </RadioGroup>
              </div>
              {isGarage && (
                <div className="space-y-2">
                  <Label htmlFor="businessAddress">
                    כתובת העסק <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="businessAddress"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    placeholder="רחוב עיר, מספר"
                    className={isAddressRequired ? "border-destructive" : ""}
                  />
                  {isAddressRequired && (
                    <p className="text-sm text-destructive">כתובת העסק חובה עבור מוסך</p>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label>התמחויות (בחר לפחות אחת)</Label>
                <div className="grid grid-cols-2 gap-3 p-4 border rounded-md bg-background/50">
                  {BUSINESS_CATEGORIES.map((category) => (
                    <div key={category} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={category}
                        checked={businessCategories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <label
                        htmlFor={category}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
                {businessCategories.length === 0 && (
                  <p className="text-sm text-destructive">נא לבחור לפחות התמחות אחת</p>
                )}
              </div>
            </>
          )}
            </div>
          </ScrollArea>
          <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            ביטול
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isBusinessAccount && (businessCategories.length === 0 || isAddressRequired)}
          >
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
