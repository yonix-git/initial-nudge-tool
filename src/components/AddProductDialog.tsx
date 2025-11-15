import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload, X } from "lucide-react";
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
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const AddProductDialog = ({ businessId, onProductAdded }: AddProductDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
          description: "הקובץ גדול מדי. גודל מקסימלי: 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
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
      let imageUrl = null;

      if (image) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${businessId}/${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const { error } = await supabase.from("products").insert({
        business_id: businessId,
        name: validation.data.name,
        description: validation.data.description || null,
        price: parseFloat(validation.data.price),
        image_url: imageUrl,
      });

      if (error) throw error;

      toast({
        title: "הצלחה",
        description: "המוצר נוסף בהצלחה",
      });

      setName("");
      setDescription("");
      setPrice("");
      setImage(null);
      setImagePreview(null);
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
            <Label>תמונת המוצר</Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="product-image"
                />
                <label htmlFor="product-image">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      לחץ להעלאת תמונה
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
