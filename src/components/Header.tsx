import { Car, Search, Bell, MessageCircle, Menu, Users, Wrench, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={dir === "rtl" ? "right" : "left"} className="w-[280px]">
              <div className="flex flex-col gap-4 mt-8">
                <Link 
                  to="/" 
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Car className="h-5 w-5" />
                  <span className="font-medium">{t("header.feed")}</span>
                </Link>
                <Link 
                  to="/groups" 
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users className="h-5 w-5" />
                  <span className="font-medium">{t("header.groups")}</span>
                </Link>
                <Link 
                  to="/services" 
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Wrench className="h-5 w-5" />
                  <span className="font-medium">{t("header.services")}</span>
                </Link>
                <Link 
                  to="/events" 
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">{t("header.events")}</span>
                </Link>
                <Link 
                  to="/install" 
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Download className="h-5 w-5" />
                  <span className="font-medium">התקן אפליקציה</span>
                </Link>
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative">
              {/* Speed lines effect */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-60 transition-all duration-300 group-hover:-translate-x-2">
                <div className="h-0.5 w-3 bg-primary/40 rounded-full"></div>
                <div className="h-0.5 w-4 bg-primary/60 rounded-full"></div>
                <div className="h-0.5 w-2 bg-primary/40 rounded-full"></div>
              </div>
              
              <div className="relative rounded-xl bg-gradient-to-br from-primary via-primary to-primary/80 p-2 sm:p-2.5 shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110 -skew-x-12 group-hover:-skew-x-6 overflow-hidden">
                <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground relative z-10 skew-x-12 group-hover:skew-x-6 transition-transform duration-300" />
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-primary/50 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-bebas tracking-wider bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent group-hover:tracking-widest transition-all duration-300">MotorClub IL</span>
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

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-2 max-w-sm">
            <div className="relative flex-1">
              <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
              <Input 
                placeholder={t("header.search")}
                className={dir === 'rtl' ? 'pr-10 bg-muted/50' : 'pl-10 bg-muted/50'}
              />
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/install")}
            className="hidden sm:flex"
          >
            <Download className="h-5 w-5" />
          </Button>
          
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
