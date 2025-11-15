import { Card, CardContent } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";

interface ProductCardProps {
  product: Tables<"products">;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {product.image_url && (
        <div className="aspect-square overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {product.description}
          </p>
        )}
        <p className="text-xl font-bold text-primary">
          ₪{product.price.toFixed(2)}
        </p>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
