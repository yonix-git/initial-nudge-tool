import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Lock, Eye, Globe, Trash2, LogOut } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const Settings = () => {
  const [language, setLanguage] = useState("he");

  const languageNames: Record<string, string> = {
    he: "עברית",
    en: "English",
    ar: "العربية",
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      
      <main className="container max-w-4xl py-6 px-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">הגדרות</h1>
            <p className="text-muted-foreground">נהל את החשבון וההעדפות שלך</p>
          </div>

          {/* Notifications Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                התראות
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="post-notifications">התראות על פוסטים חדשים</Label>
                  <p className="text-sm text-muted-foreground">קבל התראות כשמישהו מפרסם בקבוצות שלך</p>
                </div>
                <Switch id="post-notifications" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="comment-notifications">התראות על תגובות</Label>
                  <p className="text-sm text-muted-foreground">קבל התראות כשמישהו מגיב לפוסטים שלך</p>
                </div>
                <Switch id="comment-notifications" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="event-notifications">התראות על אירועים</Label>
                  <p className="text-sm text-muted-foreground">קבל התראות על אירועים מעניינים באזורך</p>
                </div>
                <Switch id="event-notifications" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">התראות במייל</Label>
                  <p className="text-sm text-muted-foreground">קבל עדכונים חשובים במייל</p>
                </div>
                <Switch id="email-notifications" />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                פרטיות
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="profile-visibility">פרופיל ציבורי</Label>
                  <p className="text-sm text-muted-foreground">אפשר לכולם לראות את הפרופיל שלך</p>
                </div>
                <Switch id="profile-visibility" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-posts">הצג פוסטים בפרופיל</Label>
                  <p className="text-sm text-muted-foreground">אפשר לאחרים לראות את הפוסטים שלך</p>
                </div>
                <Switch id="show-posts" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-groups">הצג קבוצות בפרופיל</Label>
                  <p className="text-sm text-muted-foreground">אפשר לאחרים לראות באילו קבוצות אתה חבר</p>
                </div>
                <Switch id="show-groups" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Language & Region */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                שפה ואזור
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label>שפה</Label>
                  <p className="text-sm text-muted-foreground">בחר את שפת הממשק</p>
                </div>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="he">עברית</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>אזור</Label>
                  <p className="text-sm text-muted-foreground">ישראל</p>
                </div>
                <Button variant="outline" size="sm">שנה</Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                חשבון
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>שנה סיסמה</Label>
                  <p className="text-sm text-muted-foreground">עדכן את הסיסמה שלך</p>
                </div>
                <Button variant="outline" size="sm">שנה</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-destructive">מחק חשבון</Label>
                  <p className="text-sm text-muted-foreground">פעולה זו לא ניתנת לביטול</p>
                </div>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 ml-2" />
                  מחק
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>התנתק</Label>
                  <p className="text-sm text-muted-foreground">התנתק מהחשבון שלך</p>
                </div>
                <Button variant="outline" size="sm">
                  <LogOut className="h-4 w-4 ml-2" />
                  התנתק
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
