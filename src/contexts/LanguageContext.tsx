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
    "header.services": "שירותי רכב",
    "header.events": "אירועים",
    "header.search": "חיפוש...",
    "header.searchUsers": "חפש משתמשים...",
    
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
    "settings.appearance": "מראה",
    "settings.displayMode": "מצב תצוגה",
    "settings.displayModeDesc": "בחר בין מצב בהיר לחשוך",
    "settings.light": "בהיר",
    "settings.dark": "חשוך",
    "settings.auto": "אוטומטי",
    "settings.upgradeToBusinessAccount": "שדרוג לחשבון עסקי",
    "settings.upgradeDesc": "קבל גישה לכלים עסקיים ופרופיל מקצועי",
    "settings.pendingApproval": "הבקשה ממתינה לאישור מנהל",
    "settings.sendRequest": "שלח בקשה",
    "settings.sending": "שולח...",
    "settings.waitingApproval": "ממתין לאישור",
    "settings.activeBusinessAccount": "חשבון עסקי פעיל",
    "settings.activeBusinessDesc": "החשבון שלך כעת הוא חשבון עסקי עם גישה מלאה לכלים מקצועיים",
    "settings.changePasswordTitle": "שינוי סיסמה",
    "settings.changePasswordDialogDesc": "הזן סיסמה חדשה לחשבון שלך",
    "settings.currentPassword": "סיסמה נוכחית",
    "settings.currentPasswordPlaceholder": "הזן את הסיסמה הנוכחית שלך",
    "settings.newPassword": "סיסמה חדשה",
    "settings.newPasswordPlaceholder": "הזן סיסמה חדשה",
    "settings.confirmPassword": "אישור סיסמה",
    "settings.confirmPasswordPlaceholder": "הזן שוב את הסיסמה החדשה",
    "settings.cancel": "ביטול",
    "settings.deleteAccountTitle": "מחיקת חשבון",
    "settings.deleteAccountWarning": "האם אתה בטוח שברצונך למחוק את החשבון שלך? פעולה זו לא ניתנת לביטול ותמחק את כל הנתונים שלך.",
    
    // Groups
    "groups.title": "קבוצות וקהילות",
    "groups.subtitle": "הצטרף לקהילות שמעניינות אותך והתחבר לחובבי רכבים נוספים",
    "groups.search": "חפש קבוצות...",
    "groups.members": "חברים",
    "groups.join": "הצטרף לקבוצה",
    "groups.createGroup": "צור קבוצה",
    "groups.createGroupTitle": "צור קבוצה חדשה",
    "groups.createGroupDesc": "צור קבוצה חדשה והזמן חברים להצטרף",
    "groups.groupName": "שם הקבוצה",
    "groups.groupNamePlaceholder": "למשל: חובבי טויוטה",
    "groups.category": "קטגוריה",
    "groups.categoryPlaceholder": "למשל: רכבים יפניים",
    "groups.description": "תיאור",
    "groups.descriptionPlaceholder": "ספר קצת על הקבוצה...",
    "groups.cancel": "ביטול",
    "groups.allGroups": "כל הקבוצות",
    "groups.myGroups": "הקבוצות שלי",
    "groups.noResults": "לא נמצאו תוצאות מתאימות לחיפוש",
    "groups.noGroups": "לא נמצאו קבוצות",
    "groups.pendingRequests": "בקשות ממתינות",
    "groups.pending": "ממתין",
    "groups.owner": "מנהל",
    "groups.member": "חבר",
    
    // Services
    "services.title": "שירותי רכב",
    "services.subtitle": "מצא מוסכים, פנצריות ותחנות דלק באזורך",
    "services.searchService": "חפש לפי שם עסק או סוג שירות...",
    "services.location": "מיקום...",
    "services.all": "הכל",
    "services.garages": "מוסכים",
    "services.tire": "פנצריות",
    "services.gas": "תחנות דלק",
    "services.professionals": "בעלי מקצוע",
    "services.openNow": "פתוח כעת",
    "services.closed": "סגור",
    "services.reviews": "ביקורות",
    "services.bookAppointment": "הזמן תור",
    "services.moreDetails": "פרטים נוספים",
    "services.noResults": "לא נמצאו תוצאות מתאימות לחיפוש",
    "services.noServices": "לא נמצאו שירותים",
    "services.hasLocation": "יש לי מקום",
    "services.mobile": "אני נייד",
    
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
    "events.noEvents": "לא נמצאו אירועים",
    "events.maximum": "מקסימום",
  },
  en: {
    // Header
    "header.feed": "Feed",
    "header.groups": "Groups",
    "header.services": "Vehicle Services",
    "header.events": "Events",
    "header.search": "Search...",
    "header.searchUsers": "Search users...",
    
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
    "settings.appearance": "Appearance",
    "settings.displayMode": "Display mode",
    "settings.displayModeDesc": "Choose between light and dark mode",
    "settings.light": "Light",
    "settings.dark": "Dark",
    "settings.auto": "Auto",
    "settings.upgradeToBusinessAccount": "Upgrade to business account",
    "settings.upgradeDesc": "Get access to business tools and professional profile",
    "settings.pendingApproval": "Request pending admin approval",
    "settings.sendRequest": "Send request",
    "settings.sending": "Sending...",
    "settings.waitingApproval": "Waiting for approval",
    "settings.activeBusinessAccount": "Active business account",
    "settings.activeBusinessDesc": "Your account is now a business account with full access to professional tools",
    "settings.changePasswordTitle": "Change password",
    "settings.changePasswordDialogDesc": "Enter a new password for your account",
    "settings.currentPassword": "Current password",
    "settings.currentPasswordPlaceholder": "Enter your current password",
    "settings.newPassword": "New password",
    "settings.newPasswordPlaceholder": "Enter new password",
    "settings.confirmPassword": "Confirm password",
    "settings.confirmPasswordPlaceholder": "Enter new password again",
    "settings.cancel": "Cancel",
    "settings.deleteAccountTitle": "Delete account",
    "settings.deleteAccountWarning": "Are you sure you want to delete your account? This action cannot be undone and will delete all your data.",
    
    // Groups
    "groups.title": "Groups & Communities",
    "groups.subtitle": "Join communities that interest you and connect with other vehicle enthusiasts",
    "groups.search": "Search groups...",
    "groups.members": "members",
    "groups.join": "Join Group",
    "groups.createGroup": "Create Group",
    "groups.createGroupTitle": "Create new group",
    "groups.createGroupDesc": "Create a new group and invite friends to join",
    "groups.groupName": "Group name",
    "groups.groupNamePlaceholder": "e.g., Toyota Enthusiasts",
    "groups.category": "Category",
    "groups.categoryPlaceholder": "e.g., Japanese cars",
    "groups.description": "Description",
    "groups.descriptionPlaceholder": "Tell us about the group...",
    "groups.cancel": "Cancel",
    "groups.allGroups": "All Groups",
    "groups.myGroups": "My Groups",
    "groups.noResults": "No matching results found",
    "groups.noGroups": "No groups found",
    "groups.pendingRequests": "pending requests",
    "groups.pending": "Pending",
    "groups.owner": "Owner",
    "groups.member": "Member",
    
    // Services
    "services.title": "Vehicle Services",
    "services.subtitle": "Find garages, tire shops and gas stations in your area",
    "services.searchService": "Search by business name or service type...",
    "services.location": "Location...",
    "services.all": "All",
    "services.garages": "Garages",
    "services.tire": "Tire Shops",
    "services.gas": "Gas Stations",
    "services.professionals": "Professionals",
    "services.openNow": "Open Now",
    "services.closed": "Closed",
    "services.reviews": "reviews",
    "services.bookAppointment": "Book Appointment",
    "services.moreDetails": "More Details",
    "services.noResults": "No matching results found",
    "services.noServices": "No services found",
    "services.hasLocation": "Has location",
    "services.mobile": "Mobile",
    
    // Events
    "events.title": "Motor Events",
    "events.subtitle": "Discover interesting events, races, meetups and workshops",
    "events.search": "Search events...",
    "events.participants": "participants",
    "events.interested": "interested",
    "events.joinEvent": "Join Event",
    "events.full": "Full",
    "events.noEvents": "No events found",
    "events.maximum": "maximum",
  },
  ar: {
    // Header
    "header.feed": "التغذية",
    "header.groups": "المجموعات",
    "header.services": "خدمات السيارات",
    "header.events": "الفعاليات",
    "header.search": "بحث...",
    "header.searchUsers": "البحث عن مستخدمين...",
    
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
    "settings.appearance": "المظهر",
    "settings.displayMode": "وضع العرض",
    "settings.displayModeDesc": "اختر بين الوضع الفاتح والداكن",
    "settings.light": "فاتح",
    "settings.dark": "داكن",
    "settings.auto": "تلقائي",
    "settings.upgradeToBusinessAccount": "الترقية إلى حساب تجاري",
    "settings.upgradeDesc": "احصل على أدوات تجارية وملف شخصي احترافي",
    "settings.pendingApproval": "الطلب في انتظار موافقة المسؤول",
    "settings.sendRequest": "إرسال طلب",
    "settings.sending": "جاري الإرسال...",
    "settings.waitingApproval": "في انتظار الموافقة",
    "settings.activeBusinessAccount": "حساب تجاري نشط",
    "settings.activeBusinessDesc": "حسابك الآن حساب تجاري مع وصول كامل للأدوات المهنية",
    "settings.changePasswordTitle": "تغيير كلمة المرور",
    "settings.changePasswordDialogDesc": "أدخل كلمة مرور جديدة لحسابك",
    "settings.currentPassword": "كلمة المرور الحالية",
    "settings.currentPasswordPlaceholder": "أدخل كلمة المرور الحالية",
    "settings.newPassword": "كلمة مرور جديدة",
    "settings.newPasswordPlaceholder": "أدخل كلمة مرور جديدة",
    "settings.confirmPassword": "تأكيد كلمة المرور",
    "settings.confirmPasswordPlaceholder": "أدخل كلمة المرور الجديدة مرة أخرى",
    "settings.cancel": "إلغاء",
    "settings.deleteAccountTitle": "حذف الحساب",
    "settings.deleteAccountWarning": "هل أنت متأكد من أنك تريد حذف حسابك؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذف جميع بياناتك.",
    
    // Groups
    "groups.title": "المجموعات والمجتمعات",
    "groups.subtitle": "انضم إلى المجتمعات التي تهمك وتواصل مع عشاق السيارات الآخرين",
    "groups.search": "البحث عن مجموعات...",
    "groups.members": "أعضاء",
    "groups.join": "انضم للمجموعة",
    "groups.createGroup": "إنشاء مجموعة",
    "groups.createGroupTitle": "إنشاء مجموعة جديدة",
    "groups.createGroupDesc": "إنشاء مجموعة جديدة ودعوة الأصدقاء للانضمام",
    "groups.groupName": "اسم المجموعة",
    "groups.groupNamePlaceholder": "مثال: عشاق تويوتا",
    "groups.category": "الفئة",
    "groups.categoryPlaceholder": "مثال: السيارات اليابانية",
    "groups.description": "الوصف",
    "groups.descriptionPlaceholder": "أخبرنا عن المجموعة...",
    "groups.cancel": "إلغاء",
    "groups.allGroups": "جميع المجموعات",
    "groups.myGroups": "مجموعاتي",
    "groups.noResults": "لم يتم العثور على نتائج مطابقة",
    "groups.noGroups": "لم يتم العثور على مجموعات",
    "groups.pendingRequests": "طلبات معلقة",
    "groups.pending": "معلق",
    "groups.owner": "مالك",
    "groups.member": "عضو",
    
    // Services
    "services.title": "خدمات السيارات",
    "services.subtitle": "ابحث عن ورش تصليح ومحلات إطارات ومحطات وقود في منطقتك",
    "services.searchService": "البحث حسب اسم النشاط التجاري أو نوع الخدمة...",
    "services.location": "الموقع...",
    "services.all": "الكل",
    "services.garages": "ورش التصليح",
    "services.tire": "محلات الإطارات",
    "services.gas": "محطات الوقود",
    "services.professionals": "المحترفون",
    "services.openNow": "مفتوح الآن",
    "services.closed": "مغلق",
    "services.reviews": "المراجعات",
    "services.bookAppointment": "حجز موعد",
    "services.moreDetails": "المزيد من التفاصيل",
    "services.noResults": "لم يتم العثور على نتائج مطابقة",
    "services.noServices": "لم يتم العثور على خدمات",
    "services.hasLocation": "لديه موقع",
    "services.mobile": "متنقل",
    
    // Events
    "events.title": "فعاليات السيارات",
    "events.subtitle": "اكتشف فعاليات مثيرة وسباقات ولقاءات وورش عمل",
    "events.search": "البحث عن فعاليات...",
    "events.participants": "المشاركون",
    "events.interested": "المهتمون",
    "events.joinEvent": "انضم للفعالية",
    "events.full": "ممتلئ",
    "events.noEvents": "لم يتم العثور على فعاليات",
    "events.maximum": "الحد الأقصى",
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
