import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Phone, Star, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Services = () => {
  const services = [
    {
      name: "מוסך אבי - מומחים לרכבים יפניים",
      type: "מוסך",
      rating: 4.8,
      reviewCount: 127,
      address: "רח' הרצל 45, תל אביב",
      phone: "03-1234567",
      distance: "1.2 ק\"מ",
      openNow: true,
      specialties: ["תיקונים", "שרות מלא", "טיפולי חירום"],
    },
    {
      name: "פנצריית דוד 24/7",
      type: "פנצריה",
      rating: 4.6,
      reviewCount: 89,
      address: "רח' בן גוריון 12, תל אביב",
      phone: "03-7654321",
      distance: "800 מ'",
      openNow: true,
      specialties: ["שירות 24/7", "החלפת צמיגים", "איזון גלגלים"],
    },
    {
      name: "תחנת דלק סונול - דיזנגוף",
      type: "תחנת דלק",
      rating: 4.3,
      reviewCount: 215,
      address: "רח' דיזנגוף 234, תל אביב",
      phone: "03-9876543",
      distance: "2.5 ק\"מ",
      openNow: true,
      specialties: ["שטיפת רכב", "חנות נוחות", "אוויר למילוי"],
    },
    {
      name: "מוסך יוסי לאופנועים",
      type: "מוסך",
      rating: 4.9,
      reviewCount: 156,
      address: "רח' אלנבי 78, תל אביב",
      phone: "03-5551234",
      distance: "1.8 ק\"מ",
      openNow: false,
      specialties: ["אופנועים בלבד", "שדרוגים", "חלקי חילוף"],
    },
    {
      name: "פנצריית משה - שירות מהיר",
      type: "פנצריה",
      rating: 4.5,
      reviewCount: 94,
      address: "רח' הארבעה 19, תל אביב",
      phone: "03-4445678",
      distance: "3.1 ק\"מ",
      openNow: true,
      specialties: ["תיקון מהיר", "מכירת צמיגים", "בדיקות אוויר"],
    },
  ];

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
    <div className="min-h-screen bg-background" dir="rtl">
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

          {/* Filter Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="all">הכל</TabsTrigger>
              <TabsTrigger value="garage">מוסכים</TabsTrigger>
              <TabsTrigger value="tire">פנצריות</TabsTrigger>
              <TabsTrigger value="gas">תחנות דלק</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid gap-4">
                {services.map((service, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl">{service.name}</CardTitle>
                            {service.openNow ? (
                              <Badge className="bg-green-500">פתוח כעת</Badge>
                            ) : (
                              <Badge variant="secondary">סגור</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            {renderStars(service.rating)}
                            <span className="font-semibold">{service.rating}</span>
                            <span className="text-muted-foreground text-sm">
                              ({service.reviewCount} ביקורות)
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {service.specialties.map((specialty, idx) => (
                              <Badge key={idx} variant="outline">{specialty}</Badge>
                            ))}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-sm">
                          {service.distance}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{service.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{service.phone}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1">הזמן תור</Button>
                        <Button variant="outline" className="flex-1">פרטים נוספים</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="garage" className="mt-6">
              <div className="grid gap-4">
                {services
                  .filter((s) => s.type === "מוסך")
                  .map((service, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-xl">{service.name}</CardTitle>
                              {service.openNow ? (
                                <Badge className="bg-green-500">פתוח כעת</Badge>
                              ) : (
                                <Badge variant="secondary">סגור</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              {renderStars(service.rating)}
                              <span className="font-semibold">{service.rating}</span>
                              <span className="text-muted-foreground text-sm">
                                ({service.reviewCount} ביקורות)
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {service.specialties.map((specialty, idx) => (
                                <Badge key={idx} variant="outline">{specialty}</Badge>
                              ))}
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-sm">
                            {service.distance}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{service.address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{service.phone}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button className="flex-1">הזמן תור</Button>
                          <Button variant="outline" className="flex-1">פרטים נוספים</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="tire" className="mt-6">
              <div className="grid gap-4">
                {services
                  .filter((s) => s.type === "פנצריה")
                  .map((service, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-xl">{service.name}</CardTitle>
                              {service.openNow ? (
                                <Badge className="bg-green-500">פתוח כעת</Badge>
                              ) : (
                                <Badge variant="secondary">סגור</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              {renderStars(service.rating)}
                              <span className="font-semibold">{service.rating}</span>
                              <span className="text-muted-foreground text-sm">
                                ({service.reviewCount} ביקורות)
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {service.specialties.map((specialty, idx) => (
                                <Badge key={idx} variant="outline">{specialty}</Badge>
                              ))}
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-sm">
                            {service.distance}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{service.address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{service.phone}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button className="flex-1">הזמן תור</Button>
                          <Button variant="outline" className="flex-1">פרטים נוספים</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="gas" className="mt-6">
              <div className="grid gap-4">
                {services
                  .filter((s) => s.type === "תחנת דלק")
                  .map((service, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-xl">{service.name}</CardTitle>
                              {service.openNow ? (
                                <Badge className="bg-green-500">פתוח כעת</Badge>
                              ) : (
                                <Badge variant="secondary">סגור</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              {renderStars(service.rating)}
                              <span className="font-semibold">{service.rating}</span>
                              <span className="text-muted-foreground text-sm">
                                ({service.reviewCount} ביקורות)
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {service.specialties.map((specialty, idx) => (
                                <Badge key={idx} variant="outline">{specialty}</Badge>
                              ))}
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-sm">
                            {service.distance}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{service.address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{service.phone}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button className="flex-1">הזמן תור</Button>
                          <Button variant="outline" className="flex-1">פרטים נוספים</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Services;
