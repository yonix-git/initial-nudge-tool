import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Lock, Eye, Globe, Trash2, LogOut } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

const Settings = () => {
  const { language, setLanguage, t, dir } = useLanguage();

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
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.changePassword")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.changePasswordDesc")}</p>
                </div>
                <Button variant="outline" size="sm">{t("settings.change")}</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-destructive">{t("settings.deleteAccount")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.deleteAccountDesc")}</p>
                </div>
                <Button variant="destructive" size="sm">
                  <Trash2 className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                  {t("settings.delete")}
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.logout")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.logoutDesc")}</p>
                </div>
                <Button variant="outline" size="sm">
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
