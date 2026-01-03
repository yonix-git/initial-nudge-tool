import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessageSquare } from "lucide-react";

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message_at: string;
  otherUser: {
    id: string;
    username: string | null;
    full_name: string | null;
    profile_picture_url: string | null;
  };
  lastMessage: {
    content: string | null;
    sender_id: string;
    is_read: boolean;
    image_url: string | null;
    video_url: string | null;
  } | null;
  unreadCount: number;
}

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { dir } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || authLoading) return;

    const fetchConversations = async () => {
      try {
        // Fetch conversations where user is participant
        const { data: conversationsData, error } = await supabase
          .from("conversations")
          .select("*")
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .order("last_message_at", { ascending: false });

        if (error) throw error;

        if (!conversationsData || conversationsData.length === 0) {
          setConversations([]);
          setLoading(false);
          return;
        }

        // Get all other user IDs
        const otherUserIds = conversationsData.map(c => 
          c.user1_id === user.id ? c.user2_id : c.user1_id
        );

        // Fetch profiles for other users
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, username, full_name, profile_picture_url")
          .in("id", otherUserIds);

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

        // Fetch last message for each conversation
        const enrichedConversations = await Promise.all(
          conversationsData.map(async (conv) => {
            const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
            
            // Get last message
            const { data: lastMessageData } = await supabase
              .from("direct_messages")
              .select("content, sender_id, is_read, image_url, video_url")
              .eq("conversation_id", conv.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            // Get unread count
            const { count } = await supabase
              .from("direct_messages")
              .select("*", { count: "exact", head: true })
              .eq("conversation_id", conv.id)
              .neq("sender_id", user.id)
              .eq("is_read", false);

            return {
              ...conv,
              otherUser: profilesMap.get(otherUserId) || {
                id: otherUserId,
                username: null,
                full_name: null,
                profile_picture_url: null,
              },
              lastMessage: lastMessageData,
              unreadCount: count || 0,
            };
          })
        );

        // Filter out conversations with no messages
        const conversationsWithMessages = enrichedConversations.filter(conv => conv.lastMessage !== null);
        
        setConversations(conversationsWithMessages);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Subscribe to new messages for realtime updates
    const channel = supabase
      .channel("conversations_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "direct_messages",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, authLoading]);

  const getInitials = (name: string) => {
    if (!name) return "U";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join("");
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const dayDiff = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (dayDiff === 0) {
      return date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
    } else if (dayDiff === 1) {
      return "אתמול";
    } else if (dayDiff < 7) {
      return date.toLocaleDateString("he-IL", { weekday: "short" });
    } else {
      return date.toLocaleDateString("he-IL", { day: "numeric", month: "numeric" });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <Header />
        <main className="container max-w-2xl py-6 px-4">
          <Skeleton className="h-8 w-32 mb-4" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header />
      
      <main className="container max-w-2xl py-4 sm:py-6 px-3 sm:px-4">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">הודעות</h1>
        
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <Card>
            <CardContent className="pt-6 pb-6 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">אין לך הודעות עדיין</p>
              <p className="text-sm text-muted-foreground mt-1">
                שלח הודעה למשתמש מדף הפרופיל שלו
              </p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-2">
              {conversations.map((conv) => (
                <Card
                  key={conv.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => navigate(`/messages/${conv.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          {conv.otherUser.profile_picture_url && (
                            <AvatarImage 
                              src={conv.otherUser.profile_picture_url} 
                              alt={conv.otherUser.full_name || ""} 
                            />
                          )}
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(conv.otherUser.full_name || conv.otherUser.username || "")}
                          </AvatarFallback>
                        </Avatar>
                        {conv.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                            {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className={`font-semibold truncate ${conv.unreadCount > 0 ? "text-foreground" : ""}`}>
                            {conv.otherUser.full_name || conv.otherUser.username || "משתמש"}
                          </h3>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatTime(conv.last_message_at)}
                          </span>
                        </div>
                        <p className={`text-sm truncate mt-0.5 ${conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                          {!conv.lastMessage 
                            ? "אין הודעות עדיין"
                            : conv.lastMessage.content 
                              ? (conv.lastMessage.sender_id === user.id ? `את/ה: ${conv.lastMessage.content}` : conv.lastMessage.content)
                              : (conv.lastMessage.image_url || conv.lastMessage.video_url)
                                ? (conv.lastMessage.sender_id === user.id ? "שלחת מדיה" : "קיבלת מדיה")
                                : "אין הודעות עדיין"
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </main>
    </div>
  );
};

export default Messages;
