import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProductCardProps {
  product: Tables<"products"> & { image_urls?: string[] };
  onDelete?: (productId: string) => void;
  showDelete?: boolean;
}

const ProductCard = ({ product, onDelete, showDelete }: ProductCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Use image_urls array if available, otherwise fall back to single image_url
  const images = (product.image_urls && product.image_urls.length > 0) 
    ? product.image_urls 
    : (product.image_url ? [product.image_url] : []);
  
  const hasImages = images.length > 0;
  const hasMultipleImages = images.length > 1;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow relative">
      {hasImages && (
        <div className="aspect-square overflow-hidden relative">
          <img
            src={images[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          
          {/* Navigation arrows */}
          {hasMultipleImages && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/80 hover:bg-background"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/80 hover:bg-background"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Indicators */}
          {hasMultipleImages && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex 
                      ? 'bg-primary' 
                      : 'bg-background/60'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                />
              ))}
            </div>
          )}

          {/* Counter badge */}
          {hasMultipleImages && (
            <div className="absolute top-2 left-2 bg-background/80 px-2 py-1 rounded-full text-xs font-medium">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
            {product.description && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {product.description}
              </p>
            )}
            <p className="text-xl font-bold text-primary">
              ₪{product.price.toFixed(2)}
            </p>
          </div>
          {showDelete && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                  <AlertDialogDescription>
                    פעולה זו תמחק את המוצר לצמיתות ולא ניתן לבטל אותה.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ביטול</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(product.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    מחק
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;