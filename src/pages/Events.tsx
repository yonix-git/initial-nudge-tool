import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Users, Clock, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const Events = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      name: "מרוץ רחוב לגיטימי - מסלול שוהם",
      date: "15 בדצמבר 2024",
      time: "18:00",
      location: "מסלול מרוצים שוהם",
      participants: 45,
      maxParticipants: 60,
      interested: 234,
      type: "מרוץ",
      image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
      isInterested: false,
    },
    {
      id: 2,
      name: "מפגש אופנועים יפניים",
      date: "20 בדצמבר 2024",
      time: "16:00",
      location: "חניון עזריאלי, תל אביב",
      participants: 78,
      maxParticipants: 100,
      interested: 156,
      type: "מפגש",
      isInterested: false,
    },
    {
      id: 3,
      name: "תערוכת רכבים קלאסיים",
      date: "25 בדצמבר 2024",
      time: "10:00",
      location: "פארק הירקון, תל אביב",
      participants: 120,
      maxParticipants: 150,
      interested: 489,
      type: "תערוכה",
      image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
      isInterested: false,
    },
    {
      id: 4,
      name: "סדנת טיונינג מתקדם",
      date: "28 בדצמבר 2024",
      time: "14:00",
      location: "מוסך פרו-טיון, פתח תקווה",
      participants: 12,
      maxParticipants: 20,
      interested: 67,
      type: "סדנה",
      isInterested: false,
    },
    {
      id: 5,
      name: "מסע אופנועים לצפון",
      date: "5 בינואר 2025",
      time: "08:00",
      location: "נקודת מפגש: תחנת דלק סונול כביש 6 צומת עירון",
      participants: 34,
      maxParticipants: 50,
      interested: 198,
      type: "מסע",
      isInterested: false,
    },
    {
      id: 6,
      name: "יום מבחן נהיגה מתקדמת",
      date: "10 בינואר 2025",
      time: "09:00",
      location: "מסלול מגידו",
      participants: 28,
      maxParticipants: 40,
      interested: 145,
      type: "אימון",
      isInterested: false,
    },
  ]);

  const handleInterest = (eventId: number) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          isInterested: !event.isInterested,
          interested: event.isInterested ? event.interested - 1 : event.interested + 1
        };
      }
      return event;
    }));
  };

  const handleJoinEvent = (eventId: number) => {
    setEvents(events.map(event => {
      if (event.id === eventId && event.participants < event.maxParticipants) {
        return {
          ...event,
          participants: event.participants + 1
        };
      }
      return event;
    }));
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "מרוץ": "bg-primary",
      "מפגש": "bg-blue-500",
      "תערוכה": "bg-purple-500",
      "סדנה": "bg-green-500",
      "מסע": "bg-orange-500",
      "אימון": "bg-yellow-500",
    };
    return colors[type] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      
      <main className="container max-w-6xl py-6 px-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">אירועים מוטוריים</h1>
            <p className="text-muted-foreground">גלה אירועים מעניינים, מרוצים, מפגשים וסדנאות בתחום הרכב והאופנועים</p>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="חפש אירועים..." 
                className="pr-10"
              />
            </div>
            <div className="relative w-64">
              <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="מיקום..." 
                className="pr-10"
              />
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {event.image && (
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge className={`absolute top-3 right-3 ${getEventTypeColor(event.type)}`}>
                      {event.type}
                    </Badge>
                  </div>
                )}
                <CardHeader className={event.image ? "" : "pt-6"}>
                  {!event.image && (
                    <Badge className={`w-fit mb-2 ${getEventTypeColor(event.type)}`}>
                      {event.type}
                    </Badge>
                  )}
                  <CardTitle className="text-xl">{event.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {event.participants} משתתפים
                        {event.maxParticipants && ` / ${event.maxParticipants} מקסימום`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    <span>{event.interested} מעוניינים</span>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleJoinEvent(event.id)}
                      disabled={event.participants >= event.maxParticipants}
                    >
                      {event.participants >= event.maxParticipants ? "מלא" : "הצטרף לאירוע"}
                    </Button>
                    <Button 
                      variant={event.isInterested ? "default" : "outline"}
                      size="icon"
                      onClick={() => handleInterest(event.id)}
                    >
                      <Heart 
                        className={`h-4 w-4 ${
                          event.isInterested ? "fill-current" : ""
                        }`} 
                      />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Events;
