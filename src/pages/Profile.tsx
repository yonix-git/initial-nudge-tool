import Header from "@/components/Header";
import CreatePost from "@/components/CreatePost";
import Post from "@/components/Post";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";
import EditProfileDialog from "@/components/EditProfileDialog";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const Profile = () => {
  const [userName, setUserName] = useState("משתמש דוגמא");
  const [userBio, setUserBio] = useState("חובב רכבים יפניים • מאזדה 3 2019");
  const { t, dir } = useLanguage();

  const handleSaveProfile = (name: string, bio: string) => {
    setUserName(name);
    setUserBio(bio);
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
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    U
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold">{userName}</h1>
                    <div className="flex gap-2">
                      <EditProfileDialog 
                        currentName={userName}
                        currentBio={userBio}
                        onSave={handleSaveProfile}
                      />
                      <Link to="/settings">
                        <Button variant="outline" size="sm">
                          <SettingsIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-1">{userBio}</p>
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
