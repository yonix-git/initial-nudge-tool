import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Send, Image as ImageIcon, Video as VideoIcon, X, Reply, CornerDownLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DirectMessage {
  id: string;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
  sender_id: string;
  is_read: boolean;
  reply_to_id: string | null;
}

interface OtherUser {
  id: string;
  username: string | null;
  full_name: string | null;
  profile_picture_url: string | null;
}

const DirectMessage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { dir } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<DirectMessage | null>(null);

  useEffect(() => {
    if (!user || authLoading || !conversationId) return;

    const fetchConversationAndMessages = async () => {
      try {
        // Fetch conversation details
        const { data: conversationData, error: conversationError } = await supabase
          .from("conversations")
          .select("*")
          .eq("id", conversationId)
          .single();

        if (conversationError) throw conversationError;

        // Determine the other user
        const otherUserId = conversationData.user1_id === user.id 
          ? conversationData.user2_id 
          : conversationData.user1_id;

        // Fetch other user's profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, username, full_name, profile_picture_url")
          .eq("id", otherUserId)
          .single();

        if (profileData) {
          setOtherUser(profileData);
        }

        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from("direct_messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true });

        if (messagesError) throw messagesError;
        setMessages(messagesData || []);

        // Mark messages as read
        await supabase
          .from("direct_messages")
          .update({ is_read: true })
          .eq("conversation_id", conversationId)
          .neq("sender_id", user.id)
          .eq("is_read", false);

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("שגיאה בטעינת השיחה");
      } finally {
        setLoading(false);
      }
    };

    fetchConversationAndMessages();

    // Subscribe to realtime messages
    const channel = supabase
      .channel(`direct_messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as DirectMessage]);
          
          // Mark as read if not from current user
          if (payload.new.sender_id !== user.id) {
            supabase
              .from("direct_messages")
              .update({ is_read: true })
              .eq("id", payload.new.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, authLoading, conversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setVideoFile(null);
      setVideoPreview(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setImageFile(null);
      setImagePreview(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (file: File, bucket: string) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user?.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSendMessage = async () => {
    if (!user || !conversationId || (!messageText.trim() && !imageFile && !videoFile)) return;

    setSending(true);
    try {
      let imageUrl = null;
      let videoUrl = null;

      if (imageFile) {
        imageUrl = await uploadFile(imageFile, "avatars");
      }

      if (videoFile) {
        videoUrl = await uploadFile(videoFile, "videos");
      }

      const { error } = await supabase.from("direct_messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: messageText.trim() || null,
        image_url: imageUrl,
        video_url: videoUrl,
        reply_to_id: replyingTo?.id || null,
      });

      if (error) throw error;

      setMessageText("");
      setImageFile(null);
      setVideoFile(null);
      setImagePreview(null);
      setVideoPreview(null);
      setReplyingTo(null);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("שגיאה בשליחת ההודעה");
    } finally {
      setSending(false);
    }
  };

  const clearAttachments = () => {
    setImageFile(null);
    setVideoFile(null);
    setImagePreview(null);
    setVideoPreview(null);
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join("");
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "היום";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "אתמול";
    } else {
      return date.toLocaleDateString("he-IL", { day: "numeric", month: "numeric" });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <Header />
        <main className="container max-w-2xl py-6 px-4">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <Header />
        <main className="container max-w-2xl py-6 px-4">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: DirectMessage[] }[] = [];
  let currentDate = "";

  messages.forEach((msg) => {
    const msgDate = formatDate(msg.created_at);
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groupedMessages.push({ date: msgDate, messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  });

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden" dir={dir}>
      <Header />
      
      {/* Chat Header - Fixed below main header */}
      <div className="flex-shrink-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container max-w-2xl px-4 py-3 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/messages")}
          >
            {dir === "rtl" ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
          </Button>
          
          <Avatar 
            className="h-10 w-10 cursor-pointer"
            onClick={() => navigate(`/profile?id=${otherUser?.id}`)}
          >
            {otherUser?.profile_picture_url && (
              <AvatarImage src={otherUser.profile_picture_url} alt={otherUser.full_name || ""} />
            )}
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(otherUser?.full_name || otherUser?.username || "")}
            </AvatarFallback>
          </Avatar>
          
          <div 
            className="flex-1 cursor-pointer"
            onClick={() => navigate(`/profile?id=${otherUser?.id}`)}
          >
            <h2 className="font-semibold truncate">
              {otherUser?.full_name || otherUser?.username || "משתמש"}
            </h2>
            {otherUser?.username && (
              <p className="text-xs text-muted-foreground">@{otherUser.username}</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-0">
        <div className="py-4 space-y-4 px-3">
          {groupedMessages.map((group, groupIndex) => (
            <div key={groupIndex}>
              <div className="flex justify-center my-4">
                <span className="text-xs bg-muted px-3 py-1 rounded-full text-muted-foreground">
                  {group.date}
                </span>
              </div>
              {group.messages.map((msg) => {
                const isOwn = msg.sender_id === user.id;
                const repliedMessage = msg.reply_to_id 
                  ? messages.find(m => m.id === msg.reply_to_id) 
                  : null;
                
                return (
                  <div
                    key={msg.id}
                    className={`flex mb-3 group ${isOwn ? "justify-end mr-0 ml-auto" : "justify-start ml-0 mr-auto"}`}
                  >
                    {/* Reply button for other's messages */}
                    {!isOwn && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity self-center ml-1"
                        onClick={() => setReplyingTo(msg)}
                      >
                        <Reply className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted rounded-bl-sm"
                      }`}
                    >
                      {/* Replied message preview */}
                      {repliedMessage && (
                        <div 
                          className={`mb-2 p-2 rounded-lg text-xs border-r-2 ${
                            isOwn 
                              ? "bg-primary-foreground/10 border-primary-foreground/50" 
                              : "bg-background/50 border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <CornerDownLeft className="h-3 w-3" />
                            <span className="font-medium">
                              {repliedMessage.sender_id === user.id ? "אתה" : otherUser?.full_name || "משתמש"}
                            </span>
                          </div>
                          <p className="truncate opacity-80">
                            {repliedMessage.content || (repliedMessage.image_url ? "🖼️ תמונה" : "🎥 וידאו")}
                          </p>
                        </div>
                      )}
                      
                      {msg.image_url && (
                        <img
                          src={msg.image_url}
                          alt="תמונה"
                          className="rounded-lg max-h-60 w-auto mb-2"
                        />
                      )}
                      {msg.video_url && (
                        <video
                          src={msg.video_url}
                          controls
                          className="rounded-lg max-h-60 w-auto mb-2"
                        />
                      )}
                      {msg.content && (
                        <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                      )}
                      <p className={`text-[10px] mt-1 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                    
                    {/* Reply button for own messages */}
                    {isOwn && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity self-center mr-1"
                        onClick={() => setReplyingTo(msg)}
                      >
                        <Reply className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="sticky bottom-0 bg-background border-t">
        {/* Reply preview */}
        {replyingTo && (
          <div className="px-4 pt-2">
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
              <CornerDownLeft className="h-4 w-4 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-primary">
                  מגיב ל{replyingTo.sender_id === user.id ? "עצמך" : otherUser?.full_name || "משתמש"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {replyingTo.content || (replyingTo.image_url ? "🖼️ תמונה" : "🎥 וידאו")}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => setReplyingTo(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {(imagePreview || videoPreview) && (
          <div className="px-4 pt-2">
            <div className="relative inline-block">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-20 rounded-lg"
                />
              )}
              {videoPreview && (
                <video
                  src={videoPreview}
                  className="h-20 rounded-lg"
                />
              )}
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={clearAttachments}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        <div className="container max-w-2xl px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              onChange={handleImageSelect}
              className="hidden"
            />
            <input
              type="file"
              accept="video/*"
              ref={videoInputRef}
              onChange={handleVideoSelect}
              className="hidden"
            />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => imageInputRef.current?.click()}
              disabled={sending}
            >
              <ImageIcon className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => videoInputRef.current?.click()}
              disabled={sending}
            >
              <VideoIcon className="h-5 w-5" />
            </Button>
            
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="כתוב הודעה..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={sending}
            />
            
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={sending || (!messageText.trim() && !imageFile && !videoFile)}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectMessage;
