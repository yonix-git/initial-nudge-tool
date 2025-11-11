import Header from "@/components/Header";
import CreatePost from "@/components/CreatePost";
import Post from "@/components/Post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";
import EditProfileDialog from "@/components/EditProfileDialog";
import { Link, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t, dir } = useLanguage();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
      }
      setLoading(false);
    };

    if (!authLoading) {
      fetchProfile();
    }
  }, [user, authLoading]);

  const handleSaveProfile = async (name: string, bio: string, vehicle: string, profilePicture: File | null, removeProfilePicture?: boolean) => {
    if (!user) return;

    let profilePictureUrl = profile?.profile_picture_url;

    // Remove profile picture if requested
    if (removeProfilePicture && profile?.profile_picture_url) {
      // Extract filename from URL and delete from storage
      const urlParts = profile.profile_picture_url.split('/');
      const fileName = `${user.id}/${urlParts[urlParts.length - 1]}`;
      await supabase.storage
        .from('avatars')
        .remove([fileName]);
      profilePictureUrl = null;
    }

    // Upload profile picture if provided
    if (profilePicture) {
      const fileExt = profilePicture.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      // Delete old file if exists
      if (profile?.profile_picture_url) {
        const urlParts = profile.profile_picture_url.split('/');
        const oldFileName = `${user.id}/${urlParts[urlParts.length - 1]}`;
        await supabase.storage
          .from('avatars')
          .remove([oldFileName]);
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, profilePicture, { upsert: true });

      if (!uploadError) {
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        profilePictureUrl = data.publicUrl;
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({ 
        full_name: name,
        bio: bio,
        vehicle_type: vehicle,
        profile_picture_url: profilePictureUrl
      })
      .eq("id", user.id);

    if (!error) {
      setProfile({ ...profile, full_name: name, bio: bio, vehicle_type: vehicle, profile_picture_url: profilePictureUrl });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <Header />
        <main className="container max-w-2xl py-6 px-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const getInitials = (name: string) => {
    if (!name) return "U";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join("");
  };

  const userPosts = [
    {
      author: "אתה",
      timeAgo: "לפני שעה",
      content: "סיימתי היום שדרוג של מערכת הבלמים ברכב! מרגיש הרבה יותר בטוח בכביש 🚗",
      likes: 12,
      comments: 3,
    },
    {
      author: "אתה",
      timeAgo: "לפני 3 ימים",
      content: "מחפש המלצות לשמן מנוע איכותי למאזדה 3. מה אתם ממליצים?",
      likes: 8,
      comments: 15,
    },
  ];

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header />
      
      <main className="container max-w-2xl py-6 px-4">
        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  {profile?.profile_picture_url && (
                    <AvatarImage src={profile.profile_picture_url} alt="Profile" />
                  )}
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {getInitials(profile?.full_name || profile?.username || "")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h1 className="text-2xl font-bold">{profile?.full_name || profile?.username || "משתמש"}</h1>
                      {profile?.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
                    </div>
                    <div className="flex gap-2">
                      <EditProfileDialog 
                        currentName={profile?.full_name || profile?.username || ""}
                        currentBio={profile?.bio || ""}
                        currentVehicle={profile?.vehicle_type || ""}
                        currentProfilePicture={profile?.profile_picture_url || null}
                        onSave={handleSaveProfile}
                      />
                      <Link to="/settings">
                        <Button variant="outline" size="sm">
                          <SettingsIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{profile?.bio || "אין תיאור"}</p>
                  {profile?.vehicle_type && (
                    <p className="text-sm text-muted-foreground mt-2">🚗 {profile.vehicle_type}</p>
                  )}
                  <div className="flex gap-6 mt-3 text-sm">
                    <div>
                      <span className="font-semibold">24</span>
                      <span className="text-muted-foreground mr-1">פוסטים</span>
                    </div>
                    <div>
                      <span className="font-semibold">156</span>
                      <span className="text-muted-foreground mr-1">עוקבים</span>
                    </div>
                    <div>
                      <span className="font-semibold">89</span>
                      <span className="text-muted-foreground mr-1">עוקב</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create Post */}
          <CreatePost />
          
          {/* User Posts */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">הפוסטים שלי</h2>
            {userPosts.map((post, index) => (
              <Post key={index} {...post} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
