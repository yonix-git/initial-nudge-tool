import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Groups = () => {
  const groups = [
    {
      name: "רכבים יפניים",
      members: 1240,
      description: "קבוצה לחובבי רכבים יפניים, שאלות, עצות ושיתופים",
      category: "קהילה",
    },
    {
      name: "טויוטה ישראל",
      members: 856,
      description: "הקהילה הישראלית של בעלי טויוטה",
      category: "מותג",
    },
    {
      name: "אופנועי ספורט",
      members: 634,
      description: "קבוצה לחובבי אופנועי ספורט ומרוצים",
      category: "קהילה",
    },
    {
      name: "טיונינג ושדרוגים",
      members: 2103,
      description: "שיתוף רעיונות ופרוייקטים לשדרוג רכבים",
      category: "טכני",
    },
    {
      name: "הונדה סיוויק",
      members: 421,
      description: "קהילת בעלי הונדה סיוויק בישראל",
      category: "מותג",
    },
    {
      name: "מרוצי רחוב לגיטימיים",
      members: 1567,
      description: "אירועי מרוצים חוקיים ותחרויות במסלולים מאושרים",
      category: "אירועים",
    },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
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
            {groups.map((group, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
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
                  <Button className="w-full">הצטרף לקבוצה</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Groups;
