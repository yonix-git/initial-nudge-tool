import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Lock, Eye, Globe, Trash2, LogOut, Building2, Moon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const Settings = () => {
  const { language, setLanguage, t, dir } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<"private" | "business" | null>(null);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setAccountType(data.account_type);
      }
    };

    fetchProfile();
  }, [user]);

  const handleUpgradeToBusinessAccount = async () => {
    if (!user || accountType !== "private") return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ account_type: "business" })
        .eq("id", user.id);

      if (error) throw error;

      setAccountType("business");
      toast({
        title: "החשבון שודרג בהצלחה!",
        description: "החשבון שלך כעת הוא חשבון עסקי",
      });
    } catch (error: any) {
      toast({
        title: "שגיאה בשדרוג החשבון",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "התנתקת בהצלחה",
    });
    navigate("/auth");
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "שגיאה",
        description: "הסיסמאות לא תואמות",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "שגיאה",
        description: "הסיסמה חייבת להכיל לפחות 6 תווים",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "הסיסמה שונתה בהצלחה",
      });
      setPasswordDialogOpen(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "שגיאה בשינוי הסיסמה",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Delete user profile first
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Delete user account
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (authError) throw authError;

      toast({
        title: "החשבון נמחק בהצלחה",
      });
      
      await signOut();
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "שגיאה במחיקת החשבון",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header />
      
      <main className="container max-w-4xl py-6 px-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t("settings.title")}</h1>
            <p className="text-muted-foreground">{t("settings.subtitle")}</p>
          </div>

          {/* Notifications Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t("settings.notifications")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="post-notifications">{t("settings.postNotifications")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.postNotificationsDesc")}</p>
                </div>
                <Switch id="post-notifications" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="comment-notifications">{t("settings.commentNotifications")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.commentNotificationsDesc")}</p>
                </div>
                <Switch id="comment-notifications" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="event-notifications">{t("settings.eventNotifications")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.eventNotificationsDesc")}</p>
                </div>
                <Switch id="event-notifications" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">{t("settings.emailNotifications")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.emailNotificationsDesc")}</p>
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
                {t("settings.privacy")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="profile-visibility">{t("settings.profileVisibility")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.profileVisibilityDesc")}</p>
                </div>
                <Switch id="profile-visibility" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-posts">{t("settings.showPosts")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.showPostsDesc")}</p>
                </div>
                <Switch id="show-posts" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-groups">{t("settings.showGroups")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.showGroupsDesc")}</p>
                </div>
                <Switch id="show-groups" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                מראה
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label>מצב תצוגה</Label>
                  <p className="text-sm text-muted-foreground">בחר בין מצב בהיר לחשוך</p>
                </div>
                <Select value={theme} onValueChange={(value: "light" | "dark" | "system") => setTheme(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">בהיר</SelectItem>
                    <SelectItem value="dark">חשוך</SelectItem>
                    <SelectItem value="system">אוטומטי</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Language & Region */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t("settings.language")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label>{t("settings.languageLabel")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.languageDesc")}</p>
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
                  <Label>{t("settings.region")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.regionValue")}</p>
                </div>
                <Button variant="outline" size="sm">{t("settings.change")}</Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {t("settings.account")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {accountType === "private" && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        שדרוג לחשבון עסקי
                      </Label>
                      <p className="text-sm text-muted-foreground">קבל גישה לכלים עסקיים ופרופיל מקצועי</p>
                    </div>
                    <Button variant="default" size="sm" disabled>
                      בקרוב
                    </Button>
                  </div>
                  <Separator />
                </>
              )}
              {accountType === "business" && (
                <>
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <Label className="text-primary font-semibold">חשבון עסקי פעיל</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">החשבון שלך כעת הוא חשבון עסקי עם גישה מלאה לכלים מקצועיים</p>
                  </div>
                  <Separator />
                </>
              )}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.changePassword")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.changePasswordDesc")}</p>
                </div>
                <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">{t("settings.change")}</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>שינוי סיסמה</DialogTitle>
                      <DialogDescription>
                        הזן סיסמה חדשה לחשבון שלך
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">סיסמה חדשה</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="הזן סיסמה חדשה"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">אימות סיסמה</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="הזן שוב את הסיסמה החדשה"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                        ביטול
                      </Button>
                      <Button onClick={handleChangePassword} disabled={loading}>
                        {loading ? "משנה..." : "שנה סיסמה"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-destructive">{t("settings.deleteAccount")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.deleteAccountDesc")}</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                      {t("settings.delete")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>האם אתה בטוח שברצונך למחוק את החשבון?</AlertDialogTitle>
                      <AlertDialogDescription>
                        פעולה זו תמחק לצמיתות את החשבון שלך ואת כל הנתונים הקשורים אליו. לא ניתן לבטל פעולה זו.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ביטול</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {loading ? "מוחק..." : "מחק חשבון"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.logout")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.logoutDesc")}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                  {t("settings.logout")}
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
