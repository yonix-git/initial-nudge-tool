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
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      
      <main className="container max-w-2xl py-6 px-4">
        <div className="space-y-4">
          {mockPosts.map((post, index) => (
            <Post key={index} {...post} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
