import Header from "@/components/Header";
import Post from "@/components/Post";

const Index = () => {
  const mockPosts = [
    {
      author: "יוסי כהן",
      timeAgo: "לפני 2 שעות",
      content: "סיימתי היום שדרוג מלא של מערכת המתלים בהונדה סיוויק שלי! איזה הבדל בנוחות הנסיעה 🚗⚡",
      image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
      likes: 42,
      comments: 8,
    },
    {
      author: "שרה לוי",
      timeAgo: "לפני 5 שעות",
      content: "מי מכיר מוסך טוב באזור תל אביב לטיפול באופנועים? צריכה לעשות שרות תקופתי לדוקאטי",
      likes: 15,
      comments: 12,
    },
    {
      author: "דוד אברהם",
      timeAgo: "לפני 8 שעות",
      content: "הגעתי היום מאירוע מרוצי רחוב לגיטימיים! מי היה שם? איזה אווירה מדהימה 🏁🔥",
      image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
      likes: 87,
      comments: 23,
    },
    {
      author: "מיכל רוזנברג",
      timeAgo: "לפני 12 שעות",
      content: "חדש במשפחה! קניתי סוף סוף את ה-BMW M3 שחלמתי עליו 😍 מי רוצה לצאת לסיבוב?",
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
      likes: 156,
      comments: 34,
    },
    {
      author: "אלון דהן",
      timeAgo: "לפני יום",
      content: "שאלה לקהילה: מישהו יודע איזה שמן מנוע הכי מומלץ למאזדה MX-5? שומע המלצות שונות ומבולבל קצת",
      likes: 23,
      comments: 18,
    },
    {
      author: "רונית שפירא",
      timeAgo: "לפני יום",
      content: "סיימתי היום קורס נהיגה מתקדמת במסלול! כיף מטורף, ממליצה לכולם לנסות 🏎️",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      likes: 94,
      comments: 15,
    },
    {
      author: "גיא מזרחי",
      timeAgo: "לפני יומיים",
      content: "מכירים חנות טובה לחלקי חילוף לאופנועי יאמהה באזור המרכז? מחפש חלקים מקוריים",
      likes: 31,
      comments: 22,
    },
    {
      author: "נועה ברק",
      timeAgo: "לפני יומיים",
      content: "הצטרפתי היום לקבוצת הנסיעה לצפון! מי עוד בא? נראה מדהים 🏍️⛰️",
      likes: 67,
      comments: 11,
    },
    {
      author: "עמית כץ",
      timeAgo: "לפני 3 ימים",
      content: "חגגתי היום 5 שנים עם הטויוטה סופרה שלי. הרכב הכי אמין שהיה לי אי פעם! 💪",
      image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80",
      likes: 178,
      comments: 29,
    },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      
      <main className="container max-w-2xl py-6 px-4 relative z-10">
        <div>
          {mockPosts.map((post, index) => (
            <Post key={index} {...post} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
