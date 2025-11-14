import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Users, Clock, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  type: string;
  participants: number;
  max_participants: number;
  interested: number;
}

const Events = () => {
  const { t, dir } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [interestedEvents, setInterestedEvents] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true });

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleInterest = async (eventId: string) => {
    const isInterested = interestedEvents.has(eventId);
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const newInterestedCount = isInterested ? event.interested - 1 : event.interested + 1;

    try {
      const { error } = await supabase
        .from('events')
        .update({ interested: newInterestedCount })
        .eq('id', eventId);

      if (error) throw error;

      // Update local state
      setEvents(events.map(e => 
        e.id === eventId ? { ...e, interested: newInterestedCount } : e
      ));

      // Toggle interested state
      const newInterested = new Set(interestedEvents);
      if (isInterested) {
        newInterested.delete(eventId);
      } else {
        newInterested.add(eventId);
      }
      setInterestedEvents(newInterested);
    } catch (error) {
      console.error('Error updating interest:', error);
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event || event.participants >= event.max_participants) return;

    const newParticipants = event.participants + 1;

    try {
      const { error } = await supabase
        .from('events')
        .update({ participants: newParticipants })
        .eq('id', eventId);

      if (error) throw error;

      // Update local state
      setEvents(events.map(e => 
        e.id === eventId ? { ...e, participants: newParticipants } : e
      ));
    } catch (error) {
      console.error('Error joining event:', error);
    }
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
    <div className="min-h-screen bg-background" dir={dir}>
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
            {loading ? (
              [...Array(6)].map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : events.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                לא נמצאו אירועים
              </div>
            ) : (
              events.map((event) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pt-6">
                    <Badge className={`w-fit mb-2 ${getEventTypeColor(event.type)}`}>
                      {event.type}
                    </Badge>
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
                        {event.max_participants && ` / ${event.max_participants} מקסימום`}
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
                      disabled={event.participants >= event.max_participants}
                    >
                      {event.participants >= event.max_participants ? "מלא" : "הצטרף לאירוע"}
                    </Button>
                    <Button 
                      variant={interestedEvents.has(event.id) ? "default" : "outline"}
                      size="icon"
                      onClick={() => handleInterest(event.id)}
                    >
                      <Heart 
                        className={`h-4 w-4 ${
                          interestedEvents.has(event.id) ? "fill-current" : ""
                        }`} 
                      />
                    </Button>
                  </div>
                </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Events;
