import { Car, Search, Bell, Menu, Users, Wrench, Calendar, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const { t, dir } = useLanguage();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const isHomePage = location.pathname === "/";

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

  useEffect(() => {
    if (!user) return;

    const fetchUnreadNotifications = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      setUnreadNotifications(count || 0);
    };

    fetchUnreadNotifications();

    // Subscribe to realtime notifications
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadNotifications();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || !isHomePage) {
        setSearchResults([]);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, profile_picture_url")
        .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .limit(5);

      if (!error && data) {
        setSearchResults(data);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, isHomePage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = (profileId: string) => {
    navigate(`/profile?id=${profileId}`);
    setSearchQuery("");
    setShowSearchResults(false);
  };


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
            <div className="relative rounded-2xl bg-gradient-to-br from-primary via-primary/95 to-primary/90 p-2 sm:p-2.5 shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
              <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground relative z-10" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <span className="text-xl sm:text-2xl font-bebas tracking-wider bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">MotorClub IL</span>
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
          {isHomePage && (
            <div className="relative flex items-center gap-2 max-w-sm" ref={searchRef}>
              <div className="relative flex-1">
                <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
                <Input 
                  placeholder="חפש משתמשים..."
                  className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} bg-muted/50 w-48 sm:w-64`}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`absolute ${dir === 'rtl' ? 'left-1' : 'right-1'} top-1/2 -translate-y-1/2 h-6 w-6`}
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                      setShowSearchResults(false);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => handleProfileClick(result.id)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={result.profile_picture_url || undefined} />
                          <AvatarFallback>
                            {getInitials(result.full_name || result.username || "")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{result.full_name || result.username}</p>
                          {result.username && result.full_name && (
                            <p className="text-sm text-muted-foreground">@{result.username}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/install")}
            className="hidden sm:flex"
          >
            <Download className="h-5 w-5" />
          </Button>
          
          {isHomePage && (
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
          )}
          
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
