import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  members: number;
}

const Groups = () => {
  const { t, dir } = useLanguage();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data, error } = await supabase
          .from('groups')
          .select('*')
          .order('members', { ascending: false });

        if (error) throw error;
        setGroups(data || []);
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header />
      
      <main className="container max-w-4xl py-6 px-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">קבוצות וקהילות</h1>
            <p className="text-muted-foreground">הצטרף לקהילות שמעניינות אותך והתחבר לחובבי רכבים נוספים</p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="חפש קבוצות..." 
              className="pr-10"
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
            ) : groups.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                לא נמצאו קבוצות
              </div>
            ) : (
              groups.map((group, index) => (
              <Card 
                key={group.id} 
                className="hover:shadow-md transition-shadow animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'backwards' }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{group.name}</CardTitle>
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
                  <Button 
                    className="w-full"
                    onClick={async () => {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user) {
                        console.error('User not authenticated');
                        return;
                      }
                      
                      const { error } = await supabase
                        .from('group_members')
                        .insert({
                          group_id: group.id,
                          user_id: user.id,
                        });

                      if (error) {
                        if (error.code === '23505') {
                          console.log('Already a member');
                        } else {
                          console.error('Error joining group:', error);
                        }
                      }
                    }}
                  >
                    הצטרף לקבוצה
                  </Button>
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Groups;
