import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload, X, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface AddProductDialogProps {
  businessId: string;
  onProductAdded: () => void;
}

const productSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "שם המוצר חייב להכיל לפחות תו אחד")
    .max(100, "שם המוצר לא יכול להכיל יותר מ-100 תווים"),
  description: z.string()
    .trim()
    .max(1000, "התיאור לא יכול להכיל יותר מ-1000 תווים")
    .optional(),
  price: z.string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "המחיר חייב להיות מספר חיובי עם עד 2 ספרות אחרי הנקודה")
    .refine((val) => parseFloat(val) > 0, "המחיר חייב להיות גדול מאפס"),
});

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 30 * 1024 * 1024; // 30MB
const MAX_IMAGES = 10;

interface ImageItem {
  file: File;
  preview: string;
}

const AddProductDialog = ({ businessId, onProductAdded }: AddProductDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = MAX_IMAGES - images.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      toast({
        title: "הערה",
        description: `ניתן להעלות עד ${MAX_IMAGES} תמונות`,
      });
    }

    filesToAdd.forEach(file => {
      // Validate file type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast({
          title: "שגיאה",
          description: "סוג קובץ לא נתמך. אנא העלה קובץ JPG, PNG או WebP",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size
      if (file.size > MAX_IMAGE_SIZE) {
        toast({
          title: "שגיאה",
          description: "הקובץ גדול מדי. גודל מקסימלי: 30MB",
          variant: "destructive",
        });
        return;
      }
      
      setImages(prev => [...prev, {
        file,
        preview: URL.createObjectURL(file)
      }]);
    });

    // Reset input
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    if (currentImageIndex >= images.length - 1 && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate input with zod
    const validation = productSchema.safeParse({
      name,
      description,
      price,
    });

    if (!validation.success) {
      const errors = validation.error.errors;
      toast({
        title: "שגיאה באימות",
        description: errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const imageUrls: string[] = [];

      // Upload all images
      for (const item of images) {
        const fileExt = item.file.name.split(".").pop();
        const fileName = `${businessId}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, item.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        imageUrls.push(publicUrl);
      }

      const { error } = await supabase.from("products").insert({
        business_id: businessId,
        name: validation.data.name,
        description: validation.data.description || null,
        price: parseFloat(validation.data.price),
        image_url: imageUrls[0] || null,
        image_urls: imageUrls,
      });

      if (error) throw error;

      toast({
        title: "הצלחה",
        description: "המוצר נוסף בהצלחה",
      });

      setName("");
      setDescription("");
      setPrice("");
      setImages([]);
      setCurrentImageIndex(0);
      setOpen(false);
      onProductAdded();
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת המוצר",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          הוסף מוצר
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>הוסף מוצר חדש</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="product-name">שם המוצר</Label>
            <Input
              id="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="שם המוצר"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-description">תיאור</Label>
            <Textarea
              id="product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="תאר את המוצר..."
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-price">מחיר (₪)</Label>
            <Input
              id="product-price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label>תמונות המוצר (עד {MAX_IMAGES})</Label>
            {images.length > 0 ? (
              <div className="relative">
                <img
                  src={images[currentImageIndex]?.preview}
                  alt="Product preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => handleRemoveImage(currentImageIndex)}
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Navigation arrows */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/80 hover:bg-background"
                      onClick={() => setCurrentImageIndex(prev => 
                        prev === 0 ? images.length - 1 : prev - 1
                      )}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/80 hover:bg-background"
                      onClick={() => setCurrentImageIndex(prev => 
                        prev === images.length - 1 ? 0 : prev + 1
                      )}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {/* Indicators */}
                {images.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex 
                            ? 'bg-primary' 
                            : 'bg-background/60'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                )}

                {/* Counter and add more button */}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">
                    {currentImageIndex + 1} / {images.length}
                  </span>
                  {images.length < MAX_IMAGES && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                        id="add-more-images"
                      />
                      <label htmlFor="add-more-images">
                        <Button type="button" variant="outline" size="sm" asChild>
                          <span className="cursor-pointer">
                            <Plus className="h-4 w-4 mr-1" />
                            הוסף עוד
                          </span>
                        </Button>
                      </label>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="product-image"
                />
                <label htmlFor="product-image">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      לחץ להעלאת תמונות (עד {MAX_IMAGES})
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            ביטול
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "מוסיף..." : "הוסף מוצר"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;