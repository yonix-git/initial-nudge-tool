import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, Check, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const ADMIN_EMAIL = "yoni2435@gmail.com";

interface UpgradeRequest {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  profile?: {
    full_name: string | null;
    username: string | null;
    profile_picture_url: string | null;
  };
}

export const AdminRequestsDialog = () => {
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState<UpgradeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { toast } = useToast();

  // Check if current user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        fetchPendingCount();
      }
    };
    checkAdmin();
  }, []);

  const fetchPendingCount = async () => {
    const { count } = await supabase
      .from("business_upgrade_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");
    
    setPendingCount(count || 0);
  };

  const fetchRequests = async () => {
    setLoading(true);
    
    const { data: requestsData, error } = await supabase
      .from("business_upgrade_requests")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching requests:", error);
      setRequests([]);
      setLoading(false);
      return;
    }

    // Fetch profiles for each request
    const requestsWithProfiles = await Promise.all(
      (requestsData || []).map(async (request) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, username, profile_picture_url")
          .eq("id", request.user_id)
          .single();

        return {
          ...request,
          profile: profile || undefined,
        };
      })
    );

    setRequests(requestsWithProfiles);
    setLoading(false);
  };

  const handleApprove = async (requestId: string, userId: string) => {
    setProcessingId(requestId);

    // Update request status
    const { error: requestError } = await supabase
      .from("business_upgrade_requests")
      .update({ status: "approved" })
      .eq("id", requestId);

    if (requestError) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לאשר את הבקשה",
        variant: "destructive",
      });
      setProcessingId(null);
      return;
    }

    // Update user profile to business
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ account_type: "business" })
      .eq("id", userId);

    if (profileError) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את החשבון",
        variant: "destructive",
      });
      setProcessingId(null);
      return;
    }

    toast({
      title: "אושר!",
      description: "החשבון שודרג לחשבון עסקי",
    });

    setRequests(requests.filter((r) => r.id !== requestId));
    setPendingCount((prev) => Math.max(0, prev - 1));
    setProcessingId(null);
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);

    const { error } = await supabase
      .from("business_upgrade_requests")
      .update({ status: "rejected" })
      .eq("id", requestId);

    if (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לדחות את הבקשה",
        variant: "destructive",
      });
      setProcessingId(null);
      return;
    }

    toast({
      title: "נדחה",
      description: "הבקשה נדחתה. המשתמש יכול לבקש שוב בעתיד",
    });

    setRequests(requests.filter((r) => r.id !== requestId));
    setPendingCount((prev) => Math.max(0, prev - 1));
    setProcessingId(null);
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return words.slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("he-IL", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAdmin) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (isOpen) fetchRequests();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 relative">
          <Shield className="h-4 w-4" />
          בקשות שדרוג
          {pendingCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pl-8">
          <DialogTitle>בקשות לשדרוג חשבון עסקי</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            אין בקשות ממתינות לאישור
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {request.profile?.profile_picture_url && (
                        <AvatarImage src={request.profile.profile_picture_url} />
                      )}
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {getInitials(request.profile?.full_name || request.profile?.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {request.profile?.full_name || request.profile?.username || "משתמש"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(request.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleReject(request.id)}
                        disabled={processingId === request.id}
                      >
                        {processingId === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleApprove(request.id, request.user_id)}
                        disabled={processingId === request.id}
                      >
                        {processingId === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
