import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Send, Image as ImageIcon, Video as VideoIcon, Users, X, UserCheck, UserX, LogOut, Bell, BellOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  members: number;
  creator_id: string | null;
}

interface Message {
  id: string;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
  user_id: string;
  profiles: {
    username: string | null;
    full_name: string | null;
    profile_picture_url: string | null;
  };
}

interface GroupMember {
  id: string;
  user_id: string;
  status: string;
  profiles: {
    username: string | null;
    full_name: string | null;
    profile_picture_url: string | null;
  };
}

const GroupChat = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { dir } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [pendingRequests, setPendingRequests] = useState<GroupMember[]>([]);
  const [showMembers, setShowMembers] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<GroupMember | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!user || authLoading || !groupId) return;

    const fetchGroupAndMessages = async () => {
      try {
        // Fetch group details
        const { data: groupData, error: groupError } = await supabase
          .from("groups")
          .select("*")
          .eq("id", groupId)
          .single();

        if (groupError) throw groupError;
        setGroup(groupData);
        setIsAdmin(groupData.creator_id === user.id);

        // Check notification settings
        const { data: settingsData } = await supabase
          .from("notification_settings")
          .select("is_muted")
          .eq("user_id", user.id)
          .eq("group_id", groupId)
          .maybeSingle();
        
        setIsMuted(settingsData?.is_muted || false);

        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from("group_messages")
          .select("*")
          .eq("group_id", groupId)
          .order("created_at", { ascending: true })
          .limit(50);

        if (messagesError) throw messagesError;
        
        // Fetch profiles for messages
        if (messagesData && messagesData.length > 0) {
          const userIds = [...new Set(messagesData.map(m => m.user_id))];
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, username, full_name, profile_picture_url")
            .in("id", userIds);

          const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
          const enrichedMessages = messagesData.map(msg => ({
            ...msg,
            profiles: profilesMap.get(msg.user_id) || {
              username: null,
              full_name: null,
              profile_picture_url: null,
            },
          }));
          setMessages(enrichedMessages);
        } else {
          setMessages([]);
        }

        // Fetch members if admin
        if (groupData.creator_id === user.id) {
          const { data: membersData, error: membersError } = await supabase
            .from("group_members")
            .select("*")
            .eq("group_id", groupId)
            .eq("status", "approved");

          if (!membersError && membersData) {
            const memberUserIds = membersData.map(m => m.user_id);
            const { data: memberProfilesData } = await supabase
              .from("profiles")
              .select("id, username, full_name, profile_picture_url")
              .in("id", memberUserIds);

            const memberProfilesMap = new Map(memberProfilesData?.map(p => [p.id, p]) || []);
            const enrichedMembers = membersData.map(mem => ({
              ...mem,
              profiles: memberProfilesMap.get(mem.user_id) || {
                username: null,
                full_name: null,
                profile_picture_url: null,
              },
            }));
            setMembers(enrichedMembers);
          }

          // Fetch pending requests
          const { data: pendingData, error: pendingError } = await supabase
            .from("group_members")
            .select("*")
            .eq("group_id", groupId)
            .eq("status", "pending");

          if (!pendingError && pendingData) {
            const pendingUserIds = pendingData.map(m => m.user_id);
            const { data: pendingProfilesData } = await supabase
              .from("profiles")
              .select("id, username, full_name, profile_picture_url")
              .in("id", pendingUserIds);

            const pendingProfilesMap = new Map(pendingProfilesData?.map(p => [p.id, p]) || []);
            const enrichedPending = pendingData.map(req => ({
              ...req,
              profiles: pendingProfilesMap.get(req.user_id) || {
                username: null,
                full_name: null,
                profile_picture_url: null,
              },
            }));
            setPendingRequests(enrichedPending);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("שגיאה בטעינת הנתונים");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupAndMessages();

    // Subscribe to realtime messages
    const channel = supabase
      .channel(`group_messages:${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          // Fetch profile data for the new message
          const { data: profileData } = await supabase
            .from("profiles")
            .select("username, full_name, profile_picture_url")
            .eq("id", payload.new.user_id)
            .single();

          const newMessage = {
            ...payload.new,
            profiles: profileData || {
              username: null,
              full_name: null,
              profile_picture_url: null,
            },
          } as Message;

          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    // Mark notifications as read for this group
    const markNotificationsRead = async () => {
      if (user && groupId) {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", user.id)
          .eq("group_id", groupId)
          .eq("is_read", false);
      }
    };
    markNotificationsRead();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, authLoading, groupId]);

  useEffect(() => {
    // Scroll to bottom when messages change
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

    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSendMessage = async () => {
    if (!user || !groupId || (!messageText.trim() && !imageFile && !videoFile)) return;

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

      const { error } = await supabase.from("group_messages").insert({
        group_id: groupId,
        user_id: user.id,
        content: messageText.trim() || null,
        image_url: imageUrl,
        video_url: videoUrl,
      });

      if (error) throw error;

      setMessageText("");
      setImageFile(null);
      setVideoFile(null);
      setImagePreview(null);
      setVideoPreview(null);
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

  const handleApproveRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("group_members")
        .update({ status: "approved" })
        .eq("id", requestId);

      if (error) throw error;

      toast.success("הבקשה אושרה!");
      
      // Move from pending to members
      const approvedRequest = pendingRequests.find(r => r.id === requestId);
      if (approvedRequest) {
        setPendingRequests(prev => prev.filter(r => r.id !== requestId));
        setMembers(prev => [...prev, { ...approvedRequest, status: "approved" }]);
      }
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("שגיאה באישור הבקשה");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("id", requestId);

      if (error) throw error;

      toast.success("הבקשה נדחתה");
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("שגיאה בדחיית הבקשה");
    }
  };

  const handleLeaveGroup = async () => {
    if (!user || !groupId) return;

    try {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("עזבת את הקבוצה בהצלחה");
      navigate("/groups");
    } catch (error) {
      console.error("Error leaving group:", error);
      toast.error("שגיאה בעזיבת הקבוצה");
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove || !groupId) return;

    try {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("id", memberToRemove.id);

      if (error) throw error;

      toast.success("החבר הוסר מהקבוצה");
      setMemberToRemove(null);
      
      // Refresh members list
      const { data: membersData } = await supabase
        .from("group_members")
        .select("id, user_id, status")
        .eq("group_id", groupId)
        .eq("status", "approved");

      if (membersData) {
        const userIds = membersData.map((m) => m.user_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, username, full_name, profile_picture_url")
          .in("id", userIds);

        const enrichedMembers = membersData.map((member) => ({
          ...member,
          profiles:
            profilesData?.find((p) => p.id === member.user_id) || {
              username: null,
              full_name: null,
              profile_picture_url: null,
            },
        }));

        setMembers(enrichedMembers);
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("שגיאה בהסרת החבר");
    }
  };

  const toggleMute = async () => {
    if (!user || !groupId) return;

    try {
      const { data: existing } = await supabase
        .from("notification_settings")
        .select("id")
        .eq("user_id", user.id)
        .eq("group_id", groupId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("notification_settings")
          .update({ is_muted: !isMuted })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("notification_settings")
          .insert({
            user_id: user.id,
            group_id: groupId,
            is_muted: !isMuted,
          });

        if (error) throw error;
      }

      setIsMuted(!isMuted);
      toast.success(isMuted ? "התראות הופעלו" : "התראות הושתקו");
    } catch (error) {
      console.error("Error toggling mute:", error);
      toast.error("שגיאה בעדכון הגדרות התראות");
    }
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

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
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

  if (authLoading || loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center" dir={dir}>
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[60vh] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!group) {
    return <Navigate to="/groups" replace />;
  }

  return (
    <div className="h-screen bg-background flex flex-col" dir={dir}>
      {/* Chat Header */}
      <div className="flex-shrink-0 border-b bg-card/95 backdrop-blur-md px-4 py-3 flex items-center justify-between" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/groups")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-semibold">{group.name}</h2>
            <p className="text-xs text-muted-foreground">{group.members} חברים</p>
          </div>
        </div>

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            title={isMuted ? "הפעל התראות" : "השתק התראות"}
          >
            {isMuted ? (
              <BellOff className="h-5 w-5" />
            ) : (
              <Bell className="h-5 w-5" />
            )}
          </Button>
          
          {isAdmin ? (
            <Button variant="ghost" size="icon" onClick={() => setShowMembers(true)}>
              <Users className="h-5 w-5" />
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 text-xs flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </Button>
          ) : (
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => setShowLeaveDialog(true)}
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
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
                const isOwn = msg.user_id === user.id;
                
                return (
                  <div
                    key={msg.id}
                    className={`flex mb-3 ${isOwn ? "justify-end mr-0 ml-auto" : "justify-start ml-0 mr-auto"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted rounded-bl-sm"
                      }`}
                    >
                      {/* Show sender name for other users' messages */}
                      {!isOwn && (
                        <p className={`text-xs font-medium mb-1 ${isOwn ? "text-primary-foreground/80" : "text-primary"}`}>
                          {msg.profiles.full_name || msg.profiles.username || "משתמש"}
                        </p>
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
                        {new Date(msg.created_at).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Message Input - Fixed to bottom */}
      <div className="flex-shrink-0 border-t bg-card/95 backdrop-blur-md p-3 space-y-2" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
        {(imagePreview || videoPreview) && (
          <div className="relative inline-block mb-2">
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
        )}

        <div className="flex gap-2">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleVideoSelect}
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => imageInputRef.current?.click()}
            disabled={sending}
            className="flex-shrink-0"
          >
            <ImageIcon className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => videoInputRef.current?.click()}
            disabled={sending}
            className="flex-shrink-0"
          >
            <VideoIcon className="h-5 w-5" />
          </Button>

          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="הקלד הודעה..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={sending}
            className="flex-1"
          />

          <Button onClick={handleSendMessage} disabled={sending} size="icon" className="flex-shrink-0">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Members Dialog */}
      <Dialog open={showMembers} onOpenChange={setShowMembers}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>חברי הקבוצה</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Pending Requests Section */}
            {pendingRequests.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">בקשות ממתינות ({pendingRequests.length})</h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={request.profiles.profile_picture_url || undefined} />
                          <AvatarFallback>
                            {(request.profiles.username || request.profiles.full_name || "?")[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-medium">
                          {request.profiles.full_name || request.profiles.username || "משתמש"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-3"
                          onClick={() => handleApproveRequest(request.id)}
                        >
                          <UserCheck className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-3"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          <UserX className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approved Members Section */}
            <div>
              <h3 className="text-sm font-semibold mb-2">חברים מאושרים ({members.length})</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.profiles.profile_picture_url || undefined} />
                        <AvatarFallback>
                          {(member.profiles.username || member.profiles.full_name || "?")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {member.profiles.full_name || member.profiles.username || "משתמש"}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setMemberToRemove(member)}
                      className="text-destructive hover:text-destructive"
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Leave Group Confirmation Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך לעזוב את הקבוצה "{group?.name}"? תצטרך לבקש הצטרפות מחדש כדי לחזור.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveGroup}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              עזוב קבוצה
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך להסיר את {memberToRemove?.profiles.full_name || memberToRemove?.profiles.username || "החבר"} מהקבוצה?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              הסר חבר
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GroupChat;
