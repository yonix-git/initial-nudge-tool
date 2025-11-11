import { Image, Video, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

const CreatePost = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              U
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea 
              placeholder="מה חדש ברכב שלך?"
              className="min-h-[80px] resize-none mb-3"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Image className="h-4 w-4" />
                  <span className="text-xs hidden sm:inline">תמונה</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Video className="h-4 w-4" />
                  <span className="text-xs hidden sm:inline">וידאו</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs hidden sm:inline">מיקום</span>
                </Button>
              </div>
              <Button size="sm">פרסם</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePost;
