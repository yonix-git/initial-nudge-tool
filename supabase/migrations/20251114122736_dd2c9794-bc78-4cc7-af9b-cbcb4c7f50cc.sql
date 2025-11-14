-- Create groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  members INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  distance TEXT NOT NULL,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  participants INTEGER NOT NULL DEFAULT 0,
  max_participants INTEGER NOT NULL DEFAULT 100,
  interested INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for groups
CREATE POLICY "Anyone can view groups"
  ON public.groups FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create groups"
  ON public.groups FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update groups"
  ON public.groups FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for services
CREATE POLICY "Anyone can view services"
  ON public.services FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create services"
  ON public.services FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update services"
  ON public.services FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for events
CREATE POLICY "Anyone can view events"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update events"
  ON public.events FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Triggers for updated_at
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for groups
INSERT INTO public.groups (name, description, category, members) VALUES
  ('רכבים יפניים', 'קבוצה לחובבי רכבים יפניים, שאלות, עצות ושיתופים', 'קהילה', 1240),
  ('טויוטה ישראל', 'הקהילה הישראלית של בעלי טויוטה', 'מותג', 856),
  ('אופנועי ספורט', 'קבוצה לחובבי אופנועי ספורט ומרוצים', 'קהילה', 634),
  ('טיונינג ושדרוגים', 'שיתוף רעיונות ופרוייקטים לשדרוג רכבים', 'טכני', 2103),
  ('הונדה סיוויק', 'קהילת בעלי הונדה סיוויק בישראל', 'מותג', 421),
  ('מרוצי רחוב לגיטימיים', 'אירועי מרוצים חוקיים ותחרויות במסלולים מאושרים', 'אירועים', 1567);

-- Insert sample data for services
INSERT INTO public.services (name, type, rating, address, phone, distance, specialties) VALUES
  ('מוסך הזהב', 'garage', 4.8, 'רחוב ההסתדרות 45, תל אביב', '03-1234567', '2.3 ק"מ', ARRAY['תיקון מנועים', 'בדיקות טכניות', 'תחזוקה שוטפת']),
  ('צמיגי העיר', 'tire_shop', 4.6, 'שדרות בן גוריון 123, תל אביב', '03-2345678', '1.8 ק"מ', ARRAY['איזון גלגלים', 'החלפת צמיגים', 'תיקון פנצ''רים']),
  ('דלק דור', 'gas_station', 4.5, 'כביש 1, צומת גליל', '03-3456789', '5.1 ק"מ', ARRAY['שטיפת רכב', 'שירותי חנות', 'תדלוק מהיר']),
  ('מוסך המקצוענים', 'garage', 4.9, 'רחוב הרצל 67, חיפה', '04-1234567', '3.5 ק"מ', ARRAY['פחחות וצבע', 'מיזוג אוויר', 'חשמל רכב']),
  ('צמיגי הצפון', 'tire_shop', 4.7, 'שדרות ירושלים 88, חיפה', '04-2345678', '4.2 ק"מ', ARRAY['צמיגי ספורט', 'חישוקים', 'מערכות בלימה']),
  ('פז חיפה', 'gas_station', 4.4, 'כביש 4, יציאה צפון', '04-3456789', '6.7 ק"מ', ARRAY['חנות נוחות', 'שירותי רכב', 'קפה פז']);

-- Insert sample data for events
INSERT INTO public.events (name, date, time, location, description, type, participants, max_participants, interested) VALUES
  ('מפגש חובבי הונדה', '2024-04-15', '17:00', 'חניון איקיה נתניה', 'מפגש חודשי של חובבי הונדה מכל הארץ', 'מפגש', 23, 50, 45),
  ('סדנת טיונינג', '2024-04-20', '19:00', 'מוסך פרופורמנס תל אביב', 'סדנה מקצועית לשדרוג ביצועי הרכב', 'סדנה', 12, 20, 28),
  ('טיול שטח 4X4', '2024-04-22', '08:00', 'מכתש רמון', 'טיול שטח מאתגר לרכבי שטח', 'טיול', 15, 30, 22),
  ('מרוץ דראג', '2024-04-28', '20:00', 'מסלול מרוצים חיפה', 'תחרות מרוצי דראג חוקית', 'מרוץ', 8, 16, 67),
  ('תערוכת רכבי קלאסיים', '2024-05-05', '10:00', 'פארק הירקון', 'תערוכה של רכבים קלאסיים ווינטג׳', 'תערוכה', 45, 100, 123),
  ('סדנת תחזוקה ביתית', '2024-05-10', '18:00', 'מוסך הזהב', 'סדנה להחלפת שמן וטיפולים בסיסיים', 'סדנה', 8, 15, 19);