import { Car, Search, Bell, MessageCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const { t, dir } = useLanguage();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) setProfile(data);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "התנתקת בהצלחה",
    });
    navigate("/auth");
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join("");
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between px-4" dir={dir}>
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-2">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">MotorHub</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              {t("header.feed")}
            </Link>
            <Link to="/groups" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {t("header.groups")}
            </Link>
            <Link to="/services" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {t("header.services")}
            </Link>
            <Link to="/events" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {t("header.events")}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 max-w-sm">
            <div className="relative flex-1">
              <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
              <Input 
                placeholder={t("header.search")}
                className={dir === 'rtl' ? 'pr-10 bg-muted/50' : 'pl-10 bg-muted/50'}
              />
            </div>
          </div>
          
          <Button variant="ghost" size="icon" className="relative">
            <MessageCircle className="h-5 w-5" />
            <Badge 
              className="absolute -top-1 -left-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary"
            >
              3
            </Badge>
          </Button>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge 
              className="absolute -top-1 -left-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary"
            >
              7
            </Badge>
          </Button>
          
          {user ? (
            <>
              <Link to="/profile">
                <Avatar className="h-9 w-9 cursor-pointer hover:opacity-80 transition-opacity">
                  {profile?.profile_picture_url && (
                    <AvatarImage src={profile.profile_picture_url} />
                  )}
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(profile?.full_name || profile?.username || "")}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm">
                {t("header.login") || "התחבר"}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
