import { useState } from "react";
import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

const TermsOfService = () => {
  const { dir } = useLanguage();
  const [lang, setLang] = useState<"he" | "en">("he");

  return (
    <div className="min-h-screen bg-background" dir={lang === "he" ? "rtl" : "ltr"}>
      <Header />
      
      <main className="container max-w-4xl py-6 px-4">
        <div className="flex justify-end mb-6 gap-2">
          <Button
            variant={lang === "he" ? "default" : "outline"}
            size="sm"
            onClick={() => setLang("he")}
          >
            עברית
          </Button>
          <Button
            variant={lang === "en" ? "default" : "outline"}
            size="sm"
            onClick={() => setLang("en")}
          >
            English
          </Button>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          {lang === "he" ? (
            <>
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
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
              <p className="text-muted-foreground mb-8">Last updated: December 30, 2025</p>

              <p className="mb-6">
                Welcome to motorClub il ("the Application", "the Service", "we"). Using the application constitutes agreement to the terms of use detailed below. Please read them carefully before use.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">1. Definitions</h2>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>"User"</strong> - Any person who accesses and/or uses the application</li>
                <li><strong>"Content"</strong> - Any information, text, images, videos, or other material uploaded to the application</li>
                <li><strong>"Business Account"</strong> - An account that allows publishing products and services</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">2. Prohibited Content</h2>
              <p className="mb-4">Users agree not to upload or publish the following content:</p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Offensive, racist, threatening, or harassing content</li>
                <li>Content containing hate speech or violence</li>
                <li>Images or videos of a sexual or pornographic nature</li>
                <li>False, misleading information or fraud</li>
                <li>Content that violates copyrights or intellectual property of others</li>
                <li>Spam or irrelevant marketing content</li>
                <li>Personal information of others without their consent</li>
                <li>Content encouraging illegal activity</li>
                <li>Viruses, malicious code, or harmful software</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">3. Prohibited Conduct</h2>
              <p className="mb-4">Users agree to:</p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Not harass, threaten, or bother other users</li>
                <li>Not impersonate another person or official entity</li>
                <li>Not create multiple or fake accounts</li>
                <li>Not attempt to hack or access others' accounts</li>
                <li>Not use bots or automated tools without permission</li>
                <li>Not bypass restrictions or blocks placed on the account</li>
                <li>Not collect information about other users without their consent</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">4. Commercial Use</h2>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Publishing products and services is only allowed for approved business account holders</li>
                <li>It is forbidden to advertise illegal products or services</li>
                <li>It is forbidden to advertise counterfeit or stolen products</li>
                <li>Published prices and information must be accurate and up-to-date</li>
                <li>It is forbidden to use misleading images that do not represent the actual product</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">5. Intellectual Property</h2>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>All rights in the application belong to motorClub il</li>
                <li>The user grants us a license to use uploaded content for operating the service</li>
                <li>It is forbidden to copy, duplicate, or distribute parts of the application without permission</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">6. Limitation of Liability</h2>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>The application is provided "As Is" without warranty of any kind</li>
                <li>We are not responsible for content uploaded by users</li>
                <li>We are not responsible for transactions between users</li>
                <li>We are not responsible for direct or indirect damages arising from use of the application</li>
                <li>We do not guarantee continuous availability of the service</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">7. Sanctions and Suspension</h2>
              <p className="mb-4">We reserve the right to:</p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Remove content that violates the terms without prior notice</li>
                <li>Suspend or block accounts that violate the terms</li>
                <li>Report illegal activity to appropriate authorities</li>
                <li>Modify or discontinue the service at any time</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">8. Minimum Age</h2>
              <p className="mb-6">
                Use of the application is permitted for users aged 16 and above only. By registering for the service, the user declares that they are at least 16 years old.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">9. Changes to Terms</h2>
              <p className="mb-6">
                We reserve the right to update these terms from time to time. Significant changes will be published in the application. Continued use after publication of changes constitutes agreement to the updated terms.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">10. Governing Law</h2>
              <p className="mb-6">
                These terms are subject to the laws of the State of Israel. Any dispute shall be adjudicated exclusively in the competent courts in Israel.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">11. Contact Us</h2>
              <p className="mb-8">
                For questions or clarifications regarding the terms of use, please contact us at: <a href="mailto:yoni2435@gmail.com" className="text-primary hover:underline">yoni2435@gmail.com</a>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;