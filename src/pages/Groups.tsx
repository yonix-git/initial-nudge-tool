import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Plus, UserCheck, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  members: number;
  creator_id: string | null;
}

interface PendingRequest {
  id: string;
  user_id: string;
  group_id: string;
  profiles: {
    full_name: string | null;
    username: string | null;
    profile_picture_url: string | null;
  };
}

const Groups = () => {
  const { t, dir } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    category: "",
  });
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Record<string, PendingRequest[]>>({});
  const [userMemberships, setUserMemberships] = useState<Record<string, string>>({});
  const [groupNotifications, setGroupNotifications] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user || authLoading) return;

    const fetchGroups = async () => {
      try {
        const { data, error } = await supabase
          .from('groups')
          .select('*')
          .order('members', { ascending: false });

        if (error) throw error;
        
        const allGroups = data || [];
        setGroups(allGroups);
        
        // Filter my groups - both created and member of
        const createdGroups = allGroups.filter(g => g.creator_id === user.id);
        
        // Get groups where user is a member
        const { data: memberGroups } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user.id)
          .eq('status', 'approved');
        
        const memberGroupIds = memberGroups?.map(m => m.group_id) || [];
        const userMemberGroups = allGroups.filter(g => memberGroupIds.includes(g.id));
        
        // Combine and remove duplicates
        const combinedMyGroups = [...createdGroups];
        userMemberGroups.forEach(g => {
          if (!combinedMyGroups.find(cg => cg.id === g.id)) {
            combinedMyGroups.push(g);
          }
        });
        
        setMyGroups(combinedMyGroups);
        
        // Fetch pending requests for groups I created
        if (createdGroups.length > 0) {
          const { data: requests, error: reqError } = await supabase
            .from('group_members')
            .select('id, user_id, group_id')
            .in('group_id', createdGroups.map(g => g.id))
            .eq('status', 'pending');
          
          if (!reqError && requests) {
            const requestsByGroup: Record<string, PendingRequest[]> = {};
            requests.forEach((req: any) => {
              if (!requestsByGroup[req.group_id]) {
                requestsByGroup[req.group_id] = [];
              }
              requestsByGroup[req.group_id].push({
                ...req,
                profiles: {
                  full_name: null,
                  username: null,
                  profile_picture_url: null
                }
              });
            });
            setPendingRequests(requestsByGroup);
          } else if (reqError) {
            console.error('Error fetching pending requests:', reqError);
          }
        }
        
        // Fetch user memberships
        const { data: memberships, error: memError } = await supabase
          .from('group_members')
          .select('group_id, status')
          .eq('user_id', user.id);
        
        if (!memError && memberships) {
          const membershipMap: Record<string, string> = {};
          memberships.forEach(m => {
            membershipMap[m.group_id] = m.status;
          });
          setUserMemberships(membershipMap);
        }
        
        // Fetch unread notifications per group
        const { data: notificationsData } = await supabase
          .from('notifications')
          .select('group_id')
          .eq('user_id', user.id)
          .eq('is_read', false);
        
        if (notificationsData) {
          const notifMap: Record<string, number> = {};
          notificationsData.forEach(n => {
            notifMap[n.group_id] = (notifMap[n.group_id] || 0) + 1;
          });
          setGroupNotifications(notifMap);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
        toast.error('שגיאה בטעינת הקבוצות');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();

    // Subscribe to real-time notifications
    const notificationsChannel = supabase
      .channel('group-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          // Refetch notifications
          const { data: notificationsData } = await supabase
            .from('notifications')
            .select('group_id')
            .eq('user_id', user.id)
            .eq('is_read', false);
          
          if (notificationsData) {
            const notifMap: Record<string, number> = {};
            notificationsData.forEach(n => {
              notifMap[n.group_id] = (notifMap[n.group_id] || 0) + 1;
            });
            setGroupNotifications(notifMap);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
    };
  }, [user, authLoading]);

  const handleCreateGroup = async () => {
    if (!user || !newGroup.name.trim() || !newGroup.category.trim()) {
      toast.error('נא למלא את כל השדות הנדרשים');
      return;
    }

    try {
      const { error } = await supabase
        .from('groups')
        .insert({
          name: newGroup.name,
          description: newGroup.description,
          category: newGroup.category,
          creator_id: user.id,
        });

      if (error) throw error;

      toast.success('הקבוצה נוצרה בהצלחה!');
      setShowCreateDialog(false);
      setNewGroup({ name: "", description: "", category: "" });
      
      // Refresh groups
      const { data } = await supabase
        .from('groups')
        .select('*')
        .order('members', { ascending: false });
      if (data) {
        setGroups(data);
        
        // Update my groups
        const createdGroups = data.filter(g => g.creator_id === user?.id);
        const { data: memberGroups } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user!.id)
          .eq('status', 'approved');
        
        const memberGroupIds = memberGroups?.map(m => m.group_id) || [];
        const userMemberGroups = data.filter(g => memberGroupIds.includes(g.id));
        
        const combinedMyGroups = [...createdGroups];
        userMemberGroups.forEach(g => {
          if (!combinedMyGroups.find(cg => cg.id === g.id)) {
            combinedMyGroups.push(g);
          }
        });
        
        setMyGroups(combinedMyGroups);
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('שגיאה באישור הבקשה');
    }
  };

  const handleApproveRequest = async (requestId: string, groupId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('הבקשה אושרה!');
      
      // Update pending requests
      setPendingRequests(prev => ({
        ...prev,
        [groupId]: prev[groupId].filter(r => r.id !== requestId)
      }));
      
      // Refresh groups to update member count
      const { data } = await supabase
        .from('groups')
        .select('*')
        .order('members', { ascending: false });
      if (data) {
        setGroups(data);
        
        // Update my groups
        const createdGroups = data.filter(g => g.creator_id === user?.id);
        const { data: memberGroups } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user!.id)
          .eq('status', 'approved');
        
        const memberGroupIds = memberGroups?.map(m => m.group_id) || [];
        const userMemberGroups = data.filter(g => memberGroupIds.includes(g.id));
        
        const combinedMyGroups = [...createdGroups];
        userMemberGroups.forEach(g => {
          if (!combinedMyGroups.find(cg => cg.id === g.id)) {
            combinedMyGroups.push(g);
          }
        });
        
        setMyGroups(combinedMyGroups);
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('שגיאה באישור הבקשה');
    }
  };

  const handleRejectRequest = async (requestId: string, groupId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast.success('הבקשה נדחתה');
      
      // Update pending requests
      setPendingRequests(prev => ({
        ...prev,
        [groupId]: prev[groupId].filter(r => r.id !== requestId)
      }));
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('שגיאה בדחיית הבקשה');
    }
  };

  // Filter groups based on search query
  const filteredGroups = groups.filter((group) => {
    const searchLower = searchQuery.toLowerCase();
    
    return !searchQuery || 
      group.name?.toLowerCase().includes(searchLower) ||
      group.description?.toLowerCase().includes(searchLower) ||
      group.category?.toLowerCase().includes(searchLower);
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <Header />
        <main className="container max-w-4xl py-6 px-4">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-10 w-full mb-6" />
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
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
      
      <main className="container max-w-4xl py-6 px-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">קבוצות וקהילות</h1>
              <p className="text-muted-foreground">הצטרף לקהילות שמעניינות אותך והתחבר לחובבי רכבים נוספים</p>
            </div>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  צור קבוצה
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>צור קבוצה חדשה</DialogTitle>
                  <DialogDescription>
                    צור קבוצה חדשה והזמן חברים להצטרף
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">שם הקבוצה</Label>
                    <Input
                      id="name"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                      placeholder="למשל: חובבי טויוטה"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">קטגוריה</Label>
                    <Input
                      id="category"
                      value={newGroup.category}
                      onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value })}
                      placeholder="למשל: רכבים יפניים"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">תיאור</Label>
                    <Textarea
                      id="description"
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                      placeholder="ספר קצת על הקבוצה..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    ביטול
                  </Button>
                  <Button onClick={handleCreateGroup}>צור קבוצה</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="all" dir={dir}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">כל הקבוצות</TabsTrigger>
              <TabsTrigger value="my" className="flex-1">הקבוצות שלי</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="חפש קבוצות..." 
                  className="pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Groups Grid */}
              <div className="grid gap-4 md:grid-cols-2">
            {loading ? (
              // Loading skeletons
              [...Array(6)].map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : filteredGroups.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                {searchQuery ? "לא נמצאו תוצאות מתאימות לחיפוש" : "לא נמצאו קבוצות"}
              </div>
            ) : (
              filteredGroups.map((group, index) => (
              <Card 
                key={group.id} 
                className="hover:shadow-md transition-shadow animate-fade-in-up cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'backwards' }}
                onClick={() => {
                  // Check if user is owner or member
                  const isOwner = group.creator_id === user?.id;
                  const isMember = userMemberships[group.id] === 'approved';
                  if (isOwner || isMember) {
                    navigate(`/groups/${group.id}`);
                  }
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        {group.creator_id === user?.id && pendingRequests[group.id]?.length > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {pendingRequests[group.id].length}
                          </Badge>
                        )}
                        {groupNotifications[group.id] > 0 && (
                          <div className="h-2 w-2 rounded-full bg-destructive" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{group.members.toLocaleString()} חברים</span>
                      </div>
                    </div>
                    <Badge variant="secondary">{group.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{group.description}</p>
                  {(() => {
                    // Check if user is the creator
                    if (group.creator_id === user?.id) {
                      return (
                        <Button className="w-full" variant="secondary" disabled>
                          הקבוצה שלך
                        </Button>
                      );
                    }
                    
                    // Check membership status
                    const status = userMemberships[group.id];
                    if (status === 'approved') {
                      return (
                        <Button className="w-full" variant="secondary" disabled>
                          חבר בקבוצה
                        </Button>
                      );
                    }
                    if (status === 'pending') {
                      return (
                        <Button className="w-full" variant="outline" disabled>
                          בקשה ממתינה
                        </Button>
                      );
                    }
                    
                    // Default: show join button
                    return (
                      <Button 
                        className="w-full"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const { data: { user } } = await supabase.auth.getUser();
                          if (!user) {
                            toast.error('יש להתחבר כדי להצטרף לקבוצה');
                            return;
                          }
                          
                          const { error } = await supabase
                            .from('group_members')
                            .insert({
                              group_id: group.id,
                              user_id: user.id,
                              status: 'pending',
                            });

                          if (error) {
                            if (error.code === '23505') {
                              toast.info('כבר שלחת בקשה להצטרף לקבוצה זו');
                            } else {
                              console.error('Error joining group:', error);
                              toast.error('שגיאה בהצטרפות לקבוצה');
                            }
                          } else {
                            toast.success('הבקשה שלך נשלחה ליוצר הקבוצה');
                            // Update local state
                            setUserMemberships(prev => ({
                              ...prev,
                              [group.id]: 'pending'
                            }));
                          }
                        }}
                      >
                        שלח בקשה להצטרפות
                      </Button>
                    );
                  })()}
                </CardContent>
              </Card>
              ))
            )}
          </div>
            </TabsContent>
            
            <TabsContent value="my" className="space-y-4">
              {myGroups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  עדיין לא הצטרפת לקבוצות
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {myGroups.map((group) => (
                    <Card 
                      key={group.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigate(`/groups/${group.id}`)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-lg">{group.name}</CardTitle>
                              {pendingRequests[group.id]?.length > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {pendingRequests[group.id].length} ממתינים
                                </Badge>
                              )}
                              {groupNotifications[group.id] > 0 && (
                                <div className="h-2 w-2 rounded-full bg-destructive" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{group.members.toLocaleString()} חברים</span>
                            </div>
                          </div>
                          <Badge variant="secondary">{group.category}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{group.description}</p>
                        
                        {pendingRequests[group.id] && pendingRequests[group.id].length > 0 && (
                          <div className="border-t pt-3 space-y-2">
                            <p className="text-sm font-semibold">
                              בקשות ממתינות ({pendingRequests[group.id].length})
                            </p>
                            {pendingRequests[group.id].map((request) => (
                              <div key={request.id} className="flex items-center justify-between bg-muted/50 p-2 rounded-lg">
                                <span className="text-sm">
                                  {request.profiles.full_name || request.profiles.username || 'משתמש'}
                                </span>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2"
                                    onClick={() => handleApproveRequest(request.id, group.id)}
                                  >
                                    <UserCheck className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2"
                                    onClick={() => handleRejectRequest(request.id, group.id)}
                                  >
                                    <UserX className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Groups;
