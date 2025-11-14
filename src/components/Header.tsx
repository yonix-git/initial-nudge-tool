import { Car, Search, Bell, MessageCircle } from "lucide-react";
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
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

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


  const getInitials = (name: string) => {
    if (!name) return "U";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join("");
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-card/60 shadow-xl">
      <div className="container flex h-16 items-center justify-between px-4" dir={dir}>
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative rounded-2xl bg-gradient-to-br from-primary via-primary/95 to-primary/90 p-2.5 shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
              <Car className="h-6 w-6 text-primary-foreground relative z-10" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">MotorHub</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="relative text-sm font-semibold text-foreground hover:text-primary transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-gradient-to-r after:from-primary after:to-primary/50 after:transition-all after:duration-300">
              {t("header.feed")}
            </Link>
            <Link to="/groups" className="relative text-sm font-semibold text-muted-foreground hover:text-primary transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-gradient-to-r after:from-primary after:to-primary/50 after:transition-all after:duration-300">
              {t("header.groups")}
            </Link>
            <Link to="/services" className="relative text-sm font-semibold text-muted-foreground hover:text-primary transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-gradient-to-r after:from-primary after:to-primary/50 after:transition-all after:duration-300">
              {t("header.services")}
            </Link>
            <Link to="/events" className="relative text-sm font-semibold text-muted-foreground hover:text-primary transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-gradient-to-r after:from-primary after:to-primary/50 after:transition-all after:duration-300">
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
            {unreadMessages > 0 && (
              <Badge 
                className="absolute -top-1 -left-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary"
              >
                {unreadMessages > 99 ? '99+' : unreadMessages}
              </Badge>
            )}
          </Button>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <Badge 
                className="absolute -top-1 -left-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary"
              >
                {unreadNotifications > 99 ? '99+' : unreadNotifications}
              </Badge>
            )}
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
