import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";

const TermsOfService = () => {
  const { dir } = useLanguage();

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header />
      
      <main className="container max-w-4xl py-6 px-4">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-2">תנאי שימוש</h1>
          <p className="text-muted-foreground mb-8">עודכן לאחרונה: 30 בדצמבר 2025</p>

          <p className="mb-6">
            ברוכים הבאים ל-motorClub il ("האפליקציה", "השירות", "אנחנו"). השימוש באפליקציה מהווה הסכמה לתנאי השימוש המפורטים להלן. אנא קראו אותם בעיון לפני השימוש.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">1. הגדרות</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>"משתמש"</strong> - כל אדם הנכנס לאפליקציה ו/או עושה בה שימוש</li>
            <li><strong>"תוכן"</strong> - כל מידע, טקסט, תמונות, סרטונים או חומר אחר המועלה לאפליקציה</li>
            <li><strong>"חשבון עסקי"</strong> - חשבון המאפשר פרסום מוצרים ושירותים</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. תוכן אסור</h2>
          <p className="mb-4">המשתמשים מתחייבים שלא להעלות או לפרסם את התכנים הבאים:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>תוכן פוגעני, גזעני, מאיים או מטריד</li>
            <li>תוכן המכיל דברי שנאה או אלימות</li>
            <li>תמונות או סרטונים בעלי אופי מיני או פורנוגרפי</li>
            <li>מידע כוזב, מטעה או הונאות</li>
            <li>תוכן המפר זכויות יוצרים או קניין רוחני של אחרים</li>
            <li>פרסום ספאם או תוכן שיווקי לא רלוונטי</li>
            <li>מידע אישי של אחרים ללא הסכמתם</li>
            <li>תוכן המעודד פעילות בלתי חוקית</li>
            <li>וירוסים, קוד זדוני או תוכנות מזיקות</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. התנהגות אסורה</h2>
          <p className="mb-4">המשתמשים מתחייבים:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>לא להטריד, לאיים או להציק למשתמשים אחרים</li>
            <li>לא להתחזות לאדם אחר או לגורם רשמי</li>
            <li>לא ליצור חשבונות מרובים או חשבונות מזויפים</li>
            <li>לא לנסות לפרוץ או לגשת לחשבונות של אחרים</li>
            <li>לא להשתמש בבוטים או כלים אוטומטיים ללא אישור</li>
            <li>לא לעקוף מגבלות או חסימות שהוטלו על החשבון</li>
            <li>לא לאסוף מידע על משתמשים אחרים ללא הסכמתם</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. שימוש מסחרי</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>פרסום מוצרים ושירותים מותר רק לבעלי חשבון עסקי מאושר</li>
            <li>אסור לפרסם מוצרים או שירותים בלתי חוקיים</li>
            <li>אסור לפרסם מוצרים מזויפים או גנובים</li>
            <li>המחירים והמידע המפורסמים חייבים להיות מדויקים ועדכניים</li>
            <li>אסור להשתמש בתמונות מטעות או שאינן מייצגות את המוצר האמיתי</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">5. קניין רוחני</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>כל הזכויות באפליקציה שייכות ל-motorClub il</li>
            <li>המשתמש מעניק לנו רישיון להשתמש בתוכן שהעלה לצורך הפעלת השירות</li>
            <li>אסור להעתיק, לשכפל או להפיץ חלקים מהאפליקציה ללא אישור</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">6. הגבלת אחריות</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>האפליקציה ניתנת "כמות שהיא" (As Is) ללא אחריות מכל סוג</li>
            <li>איננו אחראים לתוכן שמעלים המשתמשים</li>
            <li>איננו אחראים לעסקאות בין משתמשים</li>
            <li>איננו אחראים לנזקים ישירים או עקיפים הנובעים מהשימוש באפליקציה</li>
            <li>איננו מתחייבים לזמינות רציפה של השירות</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">7. סנקציות והשעיה</h2>
          <p className="mb-4">אנו שומרים על הזכות:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>להסיר תוכן המפר את התנאים ללא התראה מוקדמת</li>
            <li>להשעות או לחסום חשבונות שמפרים את התנאים</li>
            <li>לדווח על פעילות בלתי חוקית לרשויות המתאימות</li>
            <li>לשנות או להפסיק את השירות בכל עת</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">8. גיל מינימלי</h2>
          <p className="mb-6">
            השימוש באפליקציה מותר למשתמשים מגיל 16 ומעלה בלבד. בהרשמה לשירות, המשתמש מצהיר כי הוא בן 16 לפחות.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">9. שינויים בתנאים</h2>
          <p className="mb-6">
            אנו שומרים על הזכות לעדכן תנאים אלה מעת לעת. שינויים מהותיים יפורסמו באפליקציה. המשך השימוש לאחר פרסום השינויים מהווה הסכמה לתנאים המעודכנים.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">10. דין ושיפוט</h2>
          <p className="mb-6">
            תנאים אלה כפופים לחוקי מדינת ישראל. כל מחלוקת תידון בבתי המשפט המוסמכים בישראל בלבד.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">11. יצירת קשר</h2>
          <p className="mb-8">
            לשאלות או הבהרות בנוגע לתנאי השימוש, ניתן לפנות אלינו בכתובת: <a href="mailto:yoni2435@gmail.com" className="text-primary hover:underline">yoni2435@gmail.com</a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;