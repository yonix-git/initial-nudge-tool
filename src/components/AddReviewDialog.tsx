import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddReviewDialogProps {
  businessId: string;
  reviewerId: string;
  onReviewAdded: () => void;
}

const AddReviewDialog = ({ businessId, reviewerId, onReviewAdded }: AddReviewDialogProps) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "שגיאה",
        description: "נא לבחור דירוג",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        business_id: businessId,
        reviewer_id: reviewerId,
        rating,
        comment: comment || null,
      });

      if (error) throw error;

      toast({
        title: "הצלחה",
        description: "הביקורת נוספה בהצלחה",
      });

      setRating(0);
      setComment("");
      setOpen(false);
      onReviewAdded();
    } catch (error: any) {
      if (error.code === "23505") {
        toast({
          title: "שגיאה",
          description: "כבר הוספת ביקורת לעסק זה",
          variant: "destructive",
        });
      } else {
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בהוספת הביקורת",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Star className="h-4 w-4" />
          כתוב ביקורת
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>כתוב ביקורת</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">דירוג</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">הערה (אופציונלי)</p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="ספר לנו על החוויה שלך..."
              className="min-h-[120px]"
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            ביטול
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "שולח..." : "שלח ביקורת"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddReviewDialog;
