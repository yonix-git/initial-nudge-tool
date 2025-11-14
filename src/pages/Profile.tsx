import Header from "@/components/Header";
import CreatePost from "@/components/CreatePost";
import PostItem from "@/components/PostItem";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Settings as SettingsIcon, Phone, MapPin } from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";
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
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, dir } = useLanguage();

  const fetchPosts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setPosts(data);
    }
  };

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
      
      await fetchPosts();
      setLoading(false);
    };

    if (!authLoading) {
      fetchProfile();
    }
  }, [user, authLoading]);

  const handleSaveProfile = async (
    name: string, 
    bio: string, 
    vehicle: string, 
    profilePicture: File | null, 
    removeProfilePicture?: boolean,
    businessData?: {
      phone?: string;
      address?: string;
      description?: string;
      categories?: string[];
    }
  ) => {
    if (!user) return;

    let profilePictureUrl = profile?.profile_picture_url;

    // Remove profile picture if requested
    if (removeProfilePicture && profile?.profile_picture_url) {
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

    const updateData: any = { 
      full_name: name,
      bio: bio,
      vehicle_type: vehicle,
      profile_picture_url: profilePictureUrl
    };

    // Add business fields if provided
    if (businessData && profile?.account_type === 'business') {
      if (businessData.phone !== undefined) updateData.business_phone = businessData.phone;
      if (businessData.address !== undefined) updateData.business_address = businessData.address;
      if (businessData.description !== undefined) updateData.business_description = businessData.description;
      if (businessData.categories !== undefined) updateData.business_categories = businessData.categories;
    }

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id);

    if (!error) {
      setProfile({ ...profile, ...updateData });
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
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold">{profile?.full_name || profile?.username || "משתמש"}</h1>
                        {profile?.is_verified && <VerifiedBadge size={20} />}
                      </div>
                      {profile?.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
                    </div>
                    <div className="flex gap-2">
                      <EditProfileDialog 
                        currentName={profile?.full_name || profile?.username || ""}
                        currentBio={profile?.bio || ""}
                        currentVehicle={profile?.vehicle_type || ""}
                        currentProfilePicture={profile?.profile_picture_url || null}
                        currentProfile={profile}
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
                  
                  {/* Business Info */}
                  {profile?.account_type === 'business' && (
                    <div className="mt-3 space-y-2">
                      {profile?.business_description && (
                        <p className="text-sm">{profile.business_description}</p>
                      )}
                      {profile?.business_categories && profile.business_categories.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {profile.business_categories.map((cat: string) => (
                            <span key={cat} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-3 mt-2">
                        {profile?.business_phone && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="gap-2"
                            asChild
                          >
                            <a href={`tel:${profile.business_phone}`}>
                              <Phone className="h-4 w-4" />
                              {t("business.call")}
                            </a>
                          </Button>
                        )}
                        {profile?.business_address && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="gap-2"
                            asChild
                          >
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.business_address)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MapPin className="h-4 w-4" />
                              {t("business.navigate")}
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {profile?.vehicle_type && profile?.account_type !== 'business' && (
                    <p className="text-sm text-muted-foreground mt-2">🚗 {profile.vehicle_type}</p>
                  )}
                  
                  <div className="flex gap-6 mt-3 text-sm">
                    <div>
                      <span className="font-semibold">{posts.length}</span>
                      <span className="text-muted-foreground mr-1">פוסטים</span>
                    </div>
                    <div>
                      <span className="font-semibold">{profile?.followers_count || 0}</span>
                      <span className="text-muted-foreground mr-1">עוקבים</span>
                    </div>
                    <div>
                      <span className="font-semibold">{profile?.following_count || 0}</span>
                      <span className="text-muted-foreground mr-1">נעקבים</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create Post */}
          <CreatePost onPostCreated={fetchPosts} />
          
          {/* User Posts */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">הפוסטים שלי</h2>
            {posts.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  עדיין לא פרסמת פוסטים. צור את הפוסט הראשון שלך!
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <PostItem 
                  key={post.id}
                  id={post.id}
                  userId={post.user_id}
                  content={post.content}
                  imageUrl={post.image_url}
                  videoUrl={post.video_url}
                  likesCount={post.likes_count}
                  commentsCount={post.comments_count}
                  createdAt={post.created_at}
                  onDelete={fetchPosts}
                  onUpdate={fetchPosts}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
