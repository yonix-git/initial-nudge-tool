import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Search, MessageSquare, Plus, CheckCircle, Pin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Forum {
  id: string;
  name: string;
  description: string;
  icon: string;
  topics_count: number;
}

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
    username: string | null;
    full_name: string | null;
    profile_picture_url: string | null;
  };
}

const ForumCategory = () => {
  const { forumId } = useParams<{ forumId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t, dir } = useLanguage();

  const [forum, setForum] = useState<Forum | null>(null);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewTopicDialog, setShowNewTopicDialog] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicContent, setNewTopicContent] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!forumId) return;

    const fetchData = async () => {
      try {
        // Fetch forum
        const { data: forumData, error: forumError } = await supabase
          .from("forums")
          .select("*")
          .eq("id", forumId)
          .single();

        if (forumError) throw forumError;
        setForum(forumData);

        // Fetch topics
        const { data: topicsData, error: topicsError } = await supabase
          .from("forum_topics")
          .select("*")
          .eq("forum_id", forumId)
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: false });

        if (topicsError) throw topicsError;

        // Fetch profiles
        if (topicsData && topicsData.length > 0) {
          const userIds = [...new Set(topicsData.map(t => t.user_id))];
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, username, full_name, profile_picture_url")
            .in("id", userIds);

          const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
          const enrichedTopics = topicsData.map(topic => ({
            ...topic,
            profiles: profilesMap.get(topic.user_id) || undefined,
          }));
          setTopics(enrichedTopics);
        } else {
          setTopics([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(t("forums.errorLoading"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [forumId]);

  const handleCreateTopic = async () => {
    if (!user || !forumId || !newTopicTitle.trim() || !newTopicContent.trim()) return;

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("forum_topics")
        .insert({
          forum_id: forumId,
          user_id: user.id,
          title: newTopicTitle.trim(),
          content: newTopicContent.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(t("forums.topicCreated"));
      setShowNewTopicDialog(false);
      setNewTopicTitle("");
      setNewTopicContent("");

      // Fetch user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, username, full_name, profile_picture_url")
        .eq("id", user.id)
        .single();

      setTopics(prev => [{
        ...data,
        profiles: profileData || undefined,
      }, ...prev]);
    } catch (error) {
      console.error("Error creating topic:", error);
      toast.error(t("forums.errorCreating"));
    } finally {
      setCreating(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return t("forums.justNow");
    if (diffHours < 24) return `${diffHours} ${t("forums.hoursAgo")}`;
    if (diffDays < 7) return `${diffDays} ${t("forums.daysAgo")}`;
    return date.toLocaleDateString("he-IL");
  };

  const filteredTopics = topics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <Header />
        <main className="container max-w-4xl py-6 px-4">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!loading && !forum) {
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

        {/* Header */}
        {forum && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">{forum.name}</h1>
            <p className="text-muted-foreground">{forum.description}</p>
          </div>
        )}

        {/* Search and Create */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
            <Input
              placeholder={t("forums.searchTopics")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={dir === 'rtl' ? 'pr-10' : 'pl-10'}
            />
          </div>
          <Button onClick={() => setShowNewTopicDialog(true)}>
            <Plus className="h-4 w-4 ml-2" />
            {t("forums.newTopic")}
          </Button>
        </div>

        {/* Topics */}
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))
          ) : filteredTopics.length === 0 ? (
            <Card className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t("forums.noTopicsInCategory")}</p>
              <Button className="mt-4" onClick={() => setShowNewTopicDialog(true)}>
                <Plus className="h-4 w-4 ml-2" />
                {t("forums.createFirstTopic")}
              </Button>
            </Card>
          ) : (
            filteredTopics.map((topic) => (
              <Link key={topic.id} to={`/forums/topic/${topic.id}`}>
                <Card className="hover:shadow-md transition-all cursor-pointer glass-effect">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
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
                        <h3 className="font-semibold truncate">{topic.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {topic.content}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{topic.profiles?.full_name || topic.profiles?.username || t("forums.anonymous")}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(topic.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{topic.replies_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>👁️</span>
                          <span>{topic.views_count}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </main>

      {/* New Topic Dialog */}
      <Dialog open={showNewTopicDialog} onOpenChange={setShowNewTopicDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("forums.newTopicTitle")}</DialogTitle>
            <DialogDescription>{t("forums.newTopicDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("forums.topicTitle")}</label>
              <Input
                placeholder={t("forums.topicTitlePlaceholder")}
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("forums.topicContent")}</label>
              <Textarea
                placeholder={t("forums.topicContentPlaceholder")}
                value={newTopicContent}
                onChange={(e) => setNewTopicContent(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTopicDialog(false)}>
              {t("forums.cancel")}
            </Button>
            <Button 
              onClick={handleCreateTopic} 
              disabled={creating || !newTopicTitle.trim() || !newTopicContent.trim()}
            >
              {creating ? t("forums.creating") : t("forums.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ForumCategory;
