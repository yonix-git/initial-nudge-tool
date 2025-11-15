import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

interface ReviewCardProps {
  review: Tables<"reviews">;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  const [reviewer, setReviewer] = useState<Tables<"profiles"> | null>(null);

  useEffect(() => {
    const fetchReviewer = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", review.reviewer_id)
        .single();
      
      if (data) setReviewer(data);
    };

    fetchReviewer();
  }, [review.reviewer_id]);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join("");
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            {reviewer?.profile_picture_url && (
              <AvatarImage src={reviewer.profile_picture_url} />
            )}
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(reviewer?.full_name || reviewer?.username || null)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold">
                {reviewer?.full_name || reviewer?.username || "משתמש"}
              </p>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            </div>
            {review.comment && (
              <p className="text-sm text-foreground mt-2">{review.comment}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(review.created_at).toLocaleDateString("he-IL")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
