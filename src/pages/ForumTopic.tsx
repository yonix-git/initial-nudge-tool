import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, ThumbsUp, MessageSquare, CheckCircle, Send, MoreVertical, Trash2, Pin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ForumTopic {
  id: string;
  forum_id: string;
  user_id: string;
  title: string;
  content: string;
  views_count: number;
  replies_count: number;
  likes_count: number;
  is_pinned: boolean;
  is_solved: boolean;
  created_at: string;
  profiles?: {
    id: string;
    username: string | null;
    full_name: string | null;
    profile_picture_url: string | null;
  };
}

interface ForumReply {
  id: string;
  topic_id: string;
  user_id: string;
  content: string;
  likes_count: number;
  is_answer: boolean;
  parent_reply_id: string | null;
  created_at: string;
  profiles?: {
    id: string;
    username: string | null;
    full_name: string | null;
    profile_picture_url: string | null;
  };
}

const ForumTopic = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [sending, setSending] = useState(false);
  const [hasLikedTopic, setHasLikedTopic] = useState(false);
  const [likedReplies, setLikedReplies] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!topicId) return;

    const fetchData = async () => {
      try {
        // Fetch topic
        const { data: topicData, error: topicError } = await supabase
          .from("forum_topics")
          .select("*")
          .eq("id", topicId)
          .single();

        if (topicError) throw topicError;

        // Fetch topic author profile
        const { data: topicProfile } = await supabase
          .from("profiles")
          .select("id, username, full_name, profile_picture_url")
          .eq("id", topicData.user_id)
          .single();

        setTopic({ ...topicData, profiles: topicProfile || undefined });

        // Increment views using database function (only if user is logged in)
        if (user?.id) {
          await supabase.rpc('increment_topic_views', { topic_id: topicId, viewer_id: user.id });
        }

        // Fetch replies
        const { data: repliesData, error: repliesError } = await supabase
          .from("forum_replies")
          .select("*")
          .eq("topic_id", topicId)
          .order("is_answer", { ascending: false })
          .order("created_at", { ascending: true });

        if (repliesError) throw repliesError;

        // Fetch profiles for replies
        if (repliesData && repliesData.length > 0) {
          const userIds = [...new Set(repliesData.map(r => r.user_id))];
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, username, full_name, profile_picture_url")
            .in("id", userIds);

          const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
          const enrichedReplies = repliesData.map(reply => ({
            ...reply,
            profiles: profilesMap.get(reply.user_id) || undefined,
          }));
          setReplies(enrichedReplies);
        }

        // Check if user liked the topic
        if (user) {
          const { data: likeData } = await supabase
            .from("forum_topic_likes")
            .select("id")
            .eq("topic_id", topicId)
            .eq("user_id", user.id)
            .maybeSingle();

          setHasLikedTopic(!!likeData);

          // Check liked replies
          if (repliesData && repliesData.length > 0) {
            const { data: replyLikes } = await supabase
              .from("forum_reply_likes")
              .select("reply_id")
              .in("reply_id", repliesData.map(r => r.id))
              .eq("user_id", user.id);

            setLikedReplies(new Set(replyLikes?.map(l => l.reply_id) || []));
          }
        }
      } catch (error) {
        console.error("Error fetching topic:", error);
        toast.error(t("forums.errorLoading"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [topicId, user]);

  const handleSendReply = async () => {
    if (!user || !topicId || !replyContent.trim()) return;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from("forum_replies")
        .insert({
          topic_id: topicId,
          user_id: user.id,
          content: replyContent.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, username, full_name, profile_picture_url")
        .eq("id", user.id)
        .single();

      setReplies(prev => [...prev, { ...data, profiles: profileData || undefined }]);
      setReplyContent("");
      toast.success(t("forums.replyAdded"));
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error(t("forums.errorReply"));
    } finally {
      setSending(false);
    }
  };

  const handleLikeTopic = async () => {
    if (!user || !topic) return;

    try {
      if (hasLikedTopic) {
        await supabase
          .from("forum_topic_likes")
          .delete()
          .eq("topic_id", topic.id)
          .eq("user_id", user.id);

        setHasLikedTopic(false);
        setTopic(prev => prev ? { ...prev, likes_count: prev.likes_count - 1 } : null);
      } else {
        await supabase
          .from("forum_topic_likes")
          .insert({ topic_id: topic.id, user_id: user.id });

        setHasLikedTopic(true);
        setTopic(prev => prev ? { ...prev, likes_count: prev.likes_count + 1 } : null);
      }
    } catch (error) {
      console.error("Error liking topic:", error);
    }
  };

  const handleLikeReply = async (replyId: string) => {
    if (!user) return;

    try {
      if (likedReplies.has(replyId)) {
        await supabase
          .from("forum_reply_likes")
          .delete()
          .eq("reply_id", replyId)
          .eq("user_id", user.id);

        setLikedReplies(prev => {
          const next = new Set(prev);
          next.delete(replyId);
          return next;
        });
        setReplies(prev => prev.map(r => 
          r.id === replyId ? { ...r, likes_count: r.likes_count - 1 } : r
        ));
      } else {
        await supabase
          .from("forum_reply_likes")
          .insert({ reply_id: replyId, user_id: user.id });

        setLikedReplies(prev => new Set(prev).add(replyId));
        setReplies(prev => prev.map(r => 
          r.id === replyId ? { ...r, likes_count: r.likes_count + 1 } : r
        ));
      }
    } catch (error) {
      console.error("Error liking reply:", error);
    }
  };

  const handleMarkAsAnswer = async (replyId: string) => {
    if (!user || !topic || topic.user_id !== user.id) return;

    try {
      // Unmark all other answers
      await supabase
        .from("forum_replies")
        .update({ is_answer: false })
        .eq("topic_id", topic.id);

      // Mark this one as answer
      await supabase
        .from("forum_replies")
        .update({ is_answer: true })
        .eq("id", replyId);

      // Mark topic as solved
      await supabase
        .from("forum_topics")
        .update({ is_solved: true })
        .eq("id", topic.id);

      setReplies(prev => prev.map(r => ({
        ...r,
        is_answer: r.id === replyId,
      })));
      setTopic(prev => prev ? { ...prev, is_solved: true } : null);
      toast.success(t("forums.markedAsAnswer"));
    } catch (error) {
      console.error("Error marking as answer:", error);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <Header />
        <main className="container max-w-4xl py-6 px-4">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-64 w-full mb-4" />
          <Skeleton className="h-32 w-full" />
        </main>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!topic) {
    return <Navigate to="/forums" replace />;
  }

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header />
      
      <main className="container max-w-4xl py-6 px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/forums")}
        >
          {dir === "rtl" ? <ArrowRight className="h-4 w-4 ml-2" /> : <ArrowLeft className="h-4 w-4 mr-2" />}
          {t("forums.backToForums")}
        </Button>

        {/* Topic */}
        <Card className="mb-6 glass-effect">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar 
                className="h-12 w-12 cursor-pointer"
                onClick={() => navigate(`/profile?id=${topic.profiles?.id}`)}
              >
                <AvatarImage src={topic.profiles?.profile_picture_url || undefined} />
                <AvatarFallback>
                  {getInitials(topic.profiles?.full_name || topic.profiles?.username || "")}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {topic.is_pinned && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Pin className="h-3 w-3" />
                      {t("forums.pinned")}
                    </span>
                  )}
                  {topic.is_solved && (
                    <span className="text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {t("forums.solved")}
                    </span>
                  )}
                </div>
                
                <h1 className="text-xl font-bold mb-2">{topic.title}</h1>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <span 
                    className="cursor-pointer hover:text-foreground"
                    onClick={() => navigate(`/profile?id=${topic.profiles?.id}`)}
                  >
                    {topic.profiles?.full_name || topic.profiles?.username || t("forums.anonymous")}
                  </span>
                  <span>•</span>
                  <span>{formatDate(topic.created_at)}</span>
                  <span>•</span>
                  <span>{topic.views_count} {t("forums.views")}</span>
                </div>
                
                <p className="whitespace-pre-wrap">{topic.content}</p>
                
                <div className="flex items-center gap-4 mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLikeTopic}
                    className={hasLikedTopic ? "text-primary" : ""}
                  >
                    <ThumbsUp className={`h-4 w-4 ml-1 ${hasLikedTopic ? "fill-current" : ""}`} />
                    {topic.likes_count}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => replyInputRef.current?.focus()}
                  >
                    <MessageSquare className="h-4 w-4 ml-1" />
                    {topic.replies_count}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Replies */}
        <div className="space-y-4 mb-6">
          <h2 className="text-lg font-semibold">
            {t("forums.replies")} ({replies.length})
          </h2>
          
          {replies.map((reply) => (
            <Card 
              key={reply.id} 
              className={`glass-effect ${reply.is_answer ? "border-green-500/50 bg-green-500/5" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar 
                    className="h-10 w-10 cursor-pointer"
                    onClick={() => navigate(`/profile?id=${reply.profiles?.id}`)}
                  >
                    <AvatarImage src={reply.profiles?.profile_picture_url || undefined} />
                    <AvatarFallback>
                      {getInitials(reply.profiles?.full_name || reply.profiles?.username || "")}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span 
                          className="font-medium cursor-pointer hover:text-primary"
                          onClick={() => navigate(`/profile?id=${reply.profiles?.id}`)}
                        >
                          {reply.profiles?.full_name || reply.profiles?.username || t("forums.anonymous")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(reply.created_at)}
                        </span>
                        {reply.is_answer && (
                          <span className="text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {t("forums.bestAnswer")}
                          </span>
                        )}
                      </div>
                      
                      {topic.user_id === user.id && !reply.is_answer && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleMarkAsAnswer(reply.id)}>
                              <CheckCircle className="h-4 w-4 ml-2" />
                              {t("forums.markAsAnswer")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    
                    <p className="mt-2 whitespace-pre-wrap">{reply.content}</p>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`mt-2 ${likedReplies.has(reply.id) ? "text-primary" : ""}`}
                      onClick={() => handleLikeReply(reply.id)}
                    >
                      <ThumbsUp className={`h-4 w-4 ml-1 ${likedReplies.has(reply.id) ? "fill-current" : ""}`} />
                      {reply.likes_count}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reply Input */}
        <Card className="glass-effect">
          <CardContent className="p-4">
            <Textarea
              ref={replyInputRef}
              placeholder={t("forums.writeReply")}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={3}
              className="mb-3"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSendReply}
                disabled={sending || !replyContent.trim()}
              >
                <Send className="h-4 w-4 ml-2" />
                {sending ? t("forums.sending") : t("forums.sendReply")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ForumTopic;
