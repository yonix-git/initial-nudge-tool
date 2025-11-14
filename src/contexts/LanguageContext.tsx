import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "he" | "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "rtl" | "ltr";
}

const translations = {
  he: {
    // Header
    "header.feed": "פיד",
    "header.groups": "קבוצות",
    "header.services": "שירותים",
    "header.events": "אירועים",
    "header.search": "חיפוש...",
    
    // Profile
    "profile.editProfile": "ערוך פרופיל",
    "profile.posts": "פוסטים",
    "profile.followers": "עוקבים",
    "profile.following": "עוקב",
    "profile.myPosts": "הפוסטים שלי",
    
    // Create Post
    "post.whatsNew": "מה חדש ברכב שלך?",
    "post.image": "תמונה",
    "post.video": "וידאו",
    "post.location": "מיקום",
    "post.publish": "פרסם",
    
    // Settings
    "settings.title": "הגדרות",
    "settings.subtitle": "נהל את החשבון וההעדפות שלך",
    "settings.notifications": "התראות",
    "settings.privacy": "פרטיות",
    "settings.language": "שפה ואזור",
    "settings.account": "חשבון",
    "settings.postNotifications": "התראות על פוסטים חדשים",
    "settings.postNotificationsDesc": "קבל התראות כשמישהו מפרסם בקבוצות שלך",
    "settings.commentNotifications": "התראות על תגובות",
    "settings.commentNotificationsDesc": "קבל התראות כשמישהו מגיב לפוסטים שלך",
    "settings.eventNotifications": "התראות על אירועים",
    "settings.eventNotificationsDesc": "קבל התראות על אירועים מעניינים באזורך",
    "settings.emailNotifications": "התראות במייל",
    "settings.emailNotificationsDesc": "קבל עדכונים חשובים במייל",
    "settings.profileVisibility": "פרופיל ציבורי",
    "settings.profileVisibilityDesc": "אפשר לכולם לראות את הפרופיל שלך",
    "settings.showPosts": "הצג פוסטים בפרופיל",
    "settings.showPostsDesc": "אפשר לאחרים לראות את הפוסטים שלך",
    "settings.showGroups": "הצג קבוצות בפרופיל",
    "settings.showGroupsDesc": "אפשר לאחרים לראות באילו קבוצות אתה חבר",
    "settings.languageLabel": "שפה",
    "settings.languageDesc": "בחר את שפת הממשק",
    "settings.region": "אזור",
    "settings.regionValue": "ישראל",
    "settings.change": "שנה",
    "settings.changePassword": "שנה סיסמה",
    "settings.changePasswordDesc": "עדכן את הסיסמה שלך",
    "settings.deleteAccount": "מחק חשבון",
    "settings.deleteAccountDesc": "פעולה זו לא ניתנת לביטול",
    "settings.delete": "מחק",
    "settings.logout": "התנתק",
    "settings.logoutDesc": "התנתק מהחשבון שלך",
    
    // Groups
    "groups.title": "קבוצות וקהילות",
    "groups.subtitle": "הצטרף לקהילות שמעניינות אותך והתחבר לחובבי רכבים נוספים",
    "groups.search": "חפש קבוצות...",
    "groups.members": "חברים",
    "groups.join": "הצטרף לקבוצה",
    
    // Services
    "services.title": "שירותי רכב",
    "services.subtitle": "מצא מוסכים, פנצריות ותחנות דלק באזורך",
    "services.searchService": "חפש לפי שם עסק או סוג שירות...",
    "services.location": "מיקום...",
    "services.all": "הכל",
    "services.garages": "מוסכים",
    "services.tire": "פנצריות",
    "services.gas": "תחנות דלק",
    "services.openNow": "פתוח כעת",
    "services.closed": "סגור",
    "services.reviews": "ביקורות",
    "services.bookAppointment": "הזמן תור",
    "services.moreDetails": "פרטים נוספים",
    
    // Business
    "verifiedBusiness": "עסק מאומת",
    "business.phone": "טלפון עסק",
    "business.address": "כתובת העסק",
    "business.hours": "שעות פעילות",
    "business.categories": "קטגוריות התמחות",
    "business.description": "תיאור עסקי",
    "business.call": "התקשר",
    "business.navigate": "נווט",
    
    // Events
    "events.title": "אירועים מוטוריים",
    "events.subtitle": "גלה אירועים מעניינים, מרוצים, מפגשים וסדנאות בתחום הרכב והאופנועים",
    "events.search": "חפש אירועים...",
    "events.participants": "משתתפים",
    "events.interested": "מעוניינים",
    "events.joinEvent": "הצטרף לאירוע",
    "events.full": "מלא",
  },
  en: {
    // Header
    "header.feed": "Feed",
    "header.groups": "Groups",
    "header.services": "Services",
    "header.events": "Events",
    "header.search": "Search...",
    
    // Profile
    "profile.editProfile": "Edit Profile",
    "profile.posts": "Posts",
    "profile.followers": "Followers",
    "profile.following": "Following",
    "profile.myPosts": "My Posts",
    
    // Create Post
    "post.whatsNew": "What's new with your vehicle?",
    "post.image": "Image",
    "post.video": "Video",
    "post.location": "Location",
    "post.publish": "Publish",
    
    // Settings
    "settings.title": "Settings",
    "settings.subtitle": "Manage your account and preferences",
    "settings.notifications": "Notifications",
    "settings.privacy": "Privacy",
    "settings.language": "Language & Region",
    "settings.account": "Account",
    "settings.postNotifications": "New post notifications",
    "settings.postNotificationsDesc": "Get notified when someone posts in your groups",
    "settings.commentNotifications": "Comment notifications",
    "settings.commentNotificationsDesc": "Get notified when someone comments on your posts",
    "settings.eventNotifications": "Event notifications",
    "settings.eventNotificationsDesc": "Get notified about interesting events in your area",
    "settings.emailNotifications": "Email notifications",
    "settings.emailNotificationsDesc": "Receive important updates via email",
    "settings.profileVisibility": "Public profile",
    "settings.profileVisibilityDesc": "Allow everyone to see your profile",
    "settings.showPosts": "Show posts on profile",
    "settings.showPostsDesc": "Allow others to see your posts",
    "settings.showGroups": "Show groups on profile",
    "settings.showGroupsDesc": "Allow others to see which groups you're a member of",
    "settings.languageLabel": "Language",
    "settings.languageDesc": "Choose interface language",
    "settings.region": "Region",
    "settings.regionValue": "Israel",
    "settings.change": "Change",
    "settings.changePassword": "Change password",
    "settings.changePasswordDesc": "Update your password",
    "settings.deleteAccount": "Delete account",
    "settings.deleteAccountDesc": "This action cannot be undone",
    "settings.delete": "Delete",
    "settings.logout": "Logout",
    "settings.logoutDesc": "Sign out of your account",
    
    // Groups
    "groups.title": "Groups & Communities",
    "groups.subtitle": "Join communities that interest you and connect with other vehicle enthusiasts",
    "groups.search": "Search groups...",
    "groups.members": "members",
    "groups.join": "Join Group",
    
    // Services
    "services.title": "Vehicle Services",
    "services.subtitle": "Find garages, tire shops and gas stations in your area",
    "services.searchService": "Search by business name or service type...",
    "services.location": "Location...",
    "services.all": "All",
    "services.garages": "Garages",
    "services.tire": "Tire Shops",
    "services.gas": "Gas Stations",
    "services.openNow": "Open Now",
    "services.closed": "Closed",
    "services.reviews": "reviews",
    "services.bookAppointment": "Book Appointment",
    "services.moreDetails": "More Details",
    
    // Events
    "events.title": "Motor Events",
    "events.subtitle": "Discover interesting events, races, meetups and workshops",
    "events.search": "Search events...",
    "events.participants": "participants",
    "events.interested": "interested",
    "events.joinEvent": "Join Event",
    "events.full": "Full",
  },
  ar: {
    // Header
    "header.feed": "التغذية",
    "header.groups": "المجموعات",
    "header.services": "الخدمات",
    "header.events": "الفعاليات",
    "header.search": "بحث...",
    
    // Profile
    "profile.editProfile": "تعديل الملف الشخصي",
    "profile.posts": "المنشورات",
    "profile.followers": "المتابعون",
    "profile.following": "يتابع",
    "profile.myPosts": "منشوراتي",
    
    // Create Post
    "post.whatsNew": "ما الجديد في سيارتك؟",
    "post.image": "صورة",
    "post.video": "فيديو",
    "post.location": "الموقع",
    "post.publish": "نشر",
    
    // Settings
    "settings.title": "الإعدادات",
    "settings.subtitle": "إدارة حسابك وتفضيلاتك",
    "settings.notifications": "الإشعارات",
    "settings.privacy": "الخصوصية",
    "settings.language": "اللغة والمنطقة",
    "settings.account": "الحساب",
    "settings.postNotifications": "إشعارات المنشورات الجديدة",
    "settings.postNotificationsDesc": "احصل على إشعارات عندما ينشر شخص ما في مجموعاتك",
    "settings.commentNotifications": "إشعارات التعليقات",
    "settings.commentNotificationsDesc": "احصل على إشعارات عندما يعلق شخص ما على منشوراتك",
    "settings.eventNotifications": "إشعارات الفعاليات",
    "settings.eventNotificationsDesc": "احصل على إشعارات حول الفعاليات المثيرة في منطقتك",
    "settings.emailNotifications": "إشعارات البريد الإلكتروني",
    "settings.emailNotificationsDesc": "تلقي التحديثات المهمة عبر البريد الإلكتروني",
    "settings.profileVisibility": "ملف شخصي عام",
    "settings.profileVisibilityDesc": "السماح للجميع برؤية ملفك الشخصي",
    "settings.showPosts": "إظهار المنشورات في الملف الشخصي",
    "settings.showPostsDesc": "السماح للآخرين برؤية منشوراتك",
    "settings.showGroups": "إظهار المجموعات في الملف الشخصي",
    "settings.showGroupsDesc": "السماح للآخرين برؤية المجموعات التي أنت عضو فيها",
    "settings.languageLabel": "اللغة",
    "settings.languageDesc": "اختر لغة الواجهة",
    "settings.region": "المنطقة",
    "settings.regionValue": "إسرائيل",
    "settings.change": "تغيير",
    "settings.changePassword": "تغيير كلمة المرور",
    "settings.changePasswordDesc": "تحديث كلمة المرور الخاصة بك",
    "settings.deleteAccount": "حذف الحساب",
    "settings.deleteAccountDesc": "لا يمكن التراجع عن هذا الإجراء",
    "settings.delete": "حذف",
    "settings.logout": "تسجيل الخروج",
    "settings.logoutDesc": "تسجيل الخروج من حسابك",
    
    // Groups
    "groups.title": "المجموعات والمجتمعات",
    "groups.subtitle": "انضم إلى المجتمعات التي تهمك وتواصل مع عشاق السيارات الآخرين",
    "groups.search": "البحث عن مجموعات...",
    "groups.members": "أعضاء",
    "groups.join": "انضم للمجموعة",
    
    // Services
    "services.title": "خدمات السيارات",
    "services.subtitle": "ابحث عن ورش تصليح ومحلات إطارات ومحطات وقود في منطقتك",
    "services.searchService": "البحث حسب اسم النشاط التجاري أو نوع الخدمة...",
    "services.location": "الموقع...",
    "services.all": "الكل",
    "services.garages": "ورش التصليح",
    "services.tire": "محلات الإطارات",
    "services.gas": "محطات الوقود",
    "services.openNow": "مفتوح الآن",
    "services.closed": "مغلق",
    "services.reviews": "المراجعات",
    "services.bookAppointment": "حجز موعد",
    "services.moreDetails": "المزيد من التفاصيل",
    
    // Events
    "events.title": "فعاليات السيارات",
    "events.subtitle": "اكتشف فعاليات مثيرة وسباقات ولقاءات وورش عمل",
    "events.search": "البحث عن فعاليات...",
    "events.participants": "المشاركون",
    "events.interested": "المهتمون",
    "events.joinEvent": "انضم للفعالية",
    "events.full": "ممتلئ",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>("he");

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    
    // Update document direction
    const dir = lang === "en" ? "ltr" : "rtl";
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && ["he", "en", "ar"].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.he] || key;
  };

  const dir = language === "en" ? "ltr" : "rtl";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
