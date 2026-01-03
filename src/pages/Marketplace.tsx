import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MessageSquare, ChevronLeft, ChevronRight, Store, Filter, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  image_urls: string[] | null;
  business_id: string;
  created_at: string;
  business?: {
    id: string;
    full_name: string | null;
    username: string | null;
    profile_picture_url: string | null;
    business_type: string | null;
  };
}

const Marketplace = () => {
  const { t, dir } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [imageIndices, setImageIndices] = useState<Record<string, number>>({});
  const [filterOpen, setFilterOpen] = useState(false);

  const categories = [
    { value: "all", label: t("marketplace.allCategories") },
    { value: "חלקי חילוף", label: t("marketplace.spareParts") },
    { value: "אביזרים", label: t("marketplace.accessories") },
    { value: "שירותים", label: t("marketplace.services") },
    { value: "רכבים", label: t("marketplace.vehicles") },
    { value: "אחר", label: t("marketplace.other") },
  ];

  const priceRanges = [
    { value: "all", label: t("marketplace.allPrices") },
    { value: "0-100", label: "₪0 - ₪100" },
    { value: "100-500", label: "₪100 - ₪500" },
    { value: "500-1000", label: "₪500 - ₪1,000" },
    { value: "1000+", label: "₪1,000+" },
  ];

  const sortOptions = [
    { value: "newest", label: t("marketplace.newest") },
    { value: "oldest", label: t("marketplace.oldest") },
    { value: "price-low", label: t("marketplace.priceLowToHigh") },
    { value: "price-high", label: t("marketplace.priceHighToLow") },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          business:profiles!products_business_id_fkey(
            id,
            full_name,
            username,
            profile_picture_url,
            business_type
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: t("marketplace.errorLoading"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
    .filter((product) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDescription = product.description?.toLowerCase().includes(query);
        const matchesBusiness = product.business?.full_name?.toLowerCase().includes(query) ||
                               product.business?.username?.toLowerCase().includes(query);
        if (!matchesName && !matchesDescription && !matchesBusiness) return false;
      }

      // Category filter
      if (selectedCategory !== "all") {
        if (product.business?.business_type !== selectedCategory) return false;
      }

      // Price filter
      if (priceRange !== "all") {
        const price = product.price;
        if (priceRange === "0-100" && (price < 0 || price > 100)) return false;
        if (priceRange === "100-500" && (price < 100 || price > 500)) return false;
        if (priceRange === "500-1000" && (price < 500 || price > 1000)) return false;
        if (priceRange === "1000+" && price < 1000) return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        default: // newest
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const getImages = (product: Product) => {
    if (product.image_urls && product.image_urls.length > 0) {
      return product.image_urls;
    }
    return product.image_url ? [product.image_url] : [];
  };

  const handleImageNav = (productId: string, direction: "prev" | "next", totalImages: number) => {
    setImageIndices((prev) => {
      const current = prev[productId] || 0;
      let next: number;
      if (direction === "next") {
        next = current === totalImages - 1 ? 0 : current + 1;
      } else {
        next = current === 0 ? totalImages - 1 : current - 1;
      }
      return { ...prev, [productId]: next };
    });
  };

  const handleContactSeller = async (product: Product) => {
    if (!user) {
      toast({
        title: t("marketplace.loginRequired"),
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (product.business_id === user.id) {
      toast({
        title: t("marketplace.ownProduct"),
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(user1_id.eq.${user.id},user2_id.eq.${product.business_id}),and(user1_id.eq.${product.business_id},user2_id.eq.${user.id})`
        )
        .maybeSingle();

      let conversationId: string;

      if (existingConversation) {
        conversationId = existingConversation.id;
      } else {
        // Create new conversation
        const { data: newConversation, error } = await supabase
          .from("conversations")
          .insert({
            user1_id: user.id,
            user2_id: product.business_id,
          })
          .select("id")
          .single();

        if (error) throw error;
        conversationId = newConversation.id;
      }

      // Navigate to the conversation
      navigate(`/messages/${conversationId}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: t("marketplace.errorContact"),
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return words.slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join("");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange("all");
    setSortBy("newest");
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "all" || priceRange !== "all" || sortBy !== "newest";

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header />
      
      <main className="container px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">{t("marketplace.title")}</h1>
          </div>
          <p className="text-muted-foreground">{t("marketplace.subtitle")}</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className={`absolute ${dir === "rtl" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
            <Input
              placeholder={t("marketplace.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${dir === "rtl" ? "pr-10" : "pl-10"} bg-muted/50`}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className={`absolute ${dir === "rtl" ? "left-1" : "right-1"} top-1/2 -translate-y-1/2 h-7 w-7`}
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t("marketplace.category")} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder={t("marketplace.price")} />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder={t("marketplace.sort")} />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="outline" size="icon" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Mobile Filter Button */}
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {t("marketplace.filters")}
                {hasActiveFilters && (
                  <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center">
                    !
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side={dir === "rtl" ? "right" : "left"}>
              <SheetHeader>
                <SheetTitle>{t("marketplace.filters")}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("marketplace.category")}</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">{t("marketplace.price")}</label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priceRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">{t("marketplace.sort")}</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <Button variant="outline" className="w-full" onClick={clearFilters}>
                    {t("marketplace.clearFilters")}
                  </Button>
                )}

                <Button className="w-full" onClick={() => setFilterOpen(false)}>
                  {t("marketplace.apply")}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-4">
          {t("marketplace.resultsCount").replace("{count}", filteredProducts.length.toString())}
        </p>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-6 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("marketplace.noProducts")}</h3>
            <p className="text-muted-foreground">{t("marketplace.noProductsDesc")}</p>
            {hasActiveFilters && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                {t("marketplace.clearFilters")}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const images = getImages(product);
              const hasImages = images.length > 0;
              const hasMultipleImages = images.length > 1;
              const currentIndex = imageIndices[product.id] || 0;

              return (
                <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                  {hasImages && (
                    <div className="aspect-square overflow-hidden relative">
                      <img
                        src={images[currentIndex]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {hasMultipleImages && (
                        <>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageNav(product.id, "prev", images.length);
                            }}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageNav(product.id, "next", images.length);
                            }}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>

                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {images.map((_, index) => (
                              <button
                                key={index}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  index === currentIndex ? "bg-primary" : "bg-background/60"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setImageIndices((prev) => ({ ...prev, [product.id]: index }));
                                }}
                              />
                            ))}
                          </div>

                          <div className="absolute top-2 left-2 bg-background/80 px-2 py-1 rounded-full text-xs font-medium">
                            {currentIndex + 1} / {images.length}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {!hasImages && (
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      <Store className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <p className="text-xl font-bold text-primary mb-3">
                      ₪{product.price.toFixed(2)}
                    </p>

                    {/* Seller Info */}
                    {product.business && (
                      <div 
                        className="flex items-center gap-2 mb-3 cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-1 rounded-lg transition-colors"
                        onClick={() => navigate(`/profile?id=${product.business_id}`)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={product.business.profile_picture_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(product.business.full_name || product.business.username || "")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {product.business.full_name || product.business.username}
                          </p>
                          {product.business.business_type && (
                            <p className="text-xs text-muted-foreground truncate">
                              {product.business.business_type}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contact Button */}
                    <Button
                      className="w-full gap-2"
                      onClick={() => handleContactSeller(product)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      {t("marketplace.contactSeller")}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Marketplace;
