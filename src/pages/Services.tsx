import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Phone, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Service {
  id: string;
  name: string;
  type: string;
  rating: number;
  address: string;
  phone: string;
  distance: string;
  specialties: string[];
}

const Services = () => {
  const { t, dir } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        let query = supabase.from('services').select('*');
        
        if (filterType !== "all") {
          query = query.eq('type', filterType);
        }

        const { data, error } = await query.order('rating', { ascending: false });

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [filterType]);

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'garage': 'מוסך',
      'tire_shop': 'פנצריה',
      'gas_station': 'תחנת דלק'
    };
    return labels[type] || type;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? "fill-primary text-primary"
                : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header />
      
      <main className="container max-w-6xl py-6 px-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">שירותי רכב</h1>
            <p className="text-muted-foreground">מצא מוסכים, פנצריות ותחנות דלק באזורך</p>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="חפש לפי שם עסק או סוג שירות..." 
                className="pr-10"
              />
            </div>
            <div className="relative w-64">
              <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="מיקום..." 
                className="pr-10"
                defaultValue="תל אביב"
              />
            </div>
          </div>

          {/* Service Tabs */}
          <Tabs value={filterType} onValueChange={setFilterType} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">הכל</TabsTrigger>
              <TabsTrigger value="garage">מוסכים</TabsTrigger>
              <TabsTrigger value="tire_shop">פנצריות</TabsTrigger>
              <TabsTrigger value="gas_station">תחנות דלק</TabsTrigger>
            </TabsList>

            <TabsContent value={filterType} className="mt-6">
              <div className="grid gap-4 md:grid-cols-2">
                {loading ? (
                  [...Array(6)].map((_, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3 mb-4" />
                        <Skeleton className="h-10 w-full" />
                      </CardContent>
                    </Card>
                  ))
                ) : services.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    לא נמצאו שירותים
                  </div>
                ) : (
                  services.map((service) => (
                    <Card key={service.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <CardTitle className="text-lg mb-1">{service.name}</CardTitle>
                            <Badge variant="secondary">{getTypeLabel(service.type)}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {renderStars(service.rating)}
                            <span className="text-sm font-medium">{service.rating}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{service.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span dir="ltr">{service.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{service.distance}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {service.specialties.map((specialty, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button className="flex-1">הזמן תור</Button>
                          <Button variant="outline" className="flex-1">פרטים נוספים</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Services;
