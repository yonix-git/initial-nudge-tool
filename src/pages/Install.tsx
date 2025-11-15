import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Download, Share2, Home, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
      setIsInstallable(false);
    }

    setDeferredPrompt(null);
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-4">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">התקן את האפליקציה</CardTitle>
          <CardDescription className="text-lg">
            קבל חוויה מלאה עם גישה מהירה ישירות מהמסך הראשי
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {isInstalled ? (
            <div className="text-center space-y-4 py-8">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="text-2xl font-bold text-foreground">האפליקציה מותקנת!</h3>
              <p className="text-muted-foreground">
                אתה כבר משתמש באפליקציה המותקנת
              </p>
              <Button onClick={() => navigate("/")} className="mt-4">
                <Home className="mr-2 h-4 w-4" />
                חזור לדף הבית
              </Button>
            </div>
          ) : (
            <>
              {isInstallable && !isIOS && (
                <div className="space-y-4">
                  <Button
                    onClick={handleInstallClick}
                    className="w-full h-14 text-lg font-semibold"
                    size="lg"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    התקן עכשיו
                  </Button>
                </div>
              )}

              {isIOS && (
                <div className="space-y-4 bg-muted/50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-primary" />
                    הוראות התקנה ל-iPhone/iPad
                  </h3>
                  <ol className="space-y-3 text-sm text-foreground/80 list-decimal list-inside">
                    <li>לחץ על כפתור השיתוף <Share2 className="inline h-4 w-4" /> בתחתית המסך</li>
                    <li>גלול למטה ובחר "הוסף למסך הבית"</li>
                    <li>לחץ על "הוסף" בפינה הימנית העליונה</li>
                    <li>האפליקציה תופיע במסך הבית שלך!</li>
                  </ol>
                </div>
              )}

              {isAndroid && !isInstallable && (
                <div className="space-y-4 bg-muted/50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    הוראות התקנה ל-Android
                  </h3>
                  <ol className="space-y-3 text-sm text-foreground/80 list-decimal list-inside">
                    <li>פתח את תפריט הדפדפן (שלוש נקודות למעלה)</li>
                    <li>בחר "הוסף למסך הבית" או "התקן אפליקציה"</li>
                    <li>אשר את ההתקנה</li>
                    <li>האפליקציה תופיע במסך הבית שלך!</li>
                  </ol>
                </div>
              )}

              {!isIOS && !isAndroid && (
                <div className="space-y-4 bg-muted/50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg">התקנה במחשב</h3>
                  <p className="text-sm text-foreground/80">
                    לחץ על אייקון ההתקנה <Download className="inline h-4 w-4" /> בשורת הכתובת
                    של הדפדפן (ליד ה-URL) כדי להתקין את האפליקציה.
                  </p>
                </div>
              )}

              <div className="pt-6 space-y-3">
                <h4 className="font-semibold text-center">למה להתקין?</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-4 bg-secondary/20 rounded-lg">
                    <div className="font-semibold text-primary mb-2">⚡ מהירות</div>
                    <div className="text-muted-foreground">טעינה מהירה יותר וחוויה חלקה</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/20 rounded-lg">
                    <div className="font-semibold text-primary mb-2">📱 נוחות</div>
                    <div className="text-muted-foreground">גישה ישירה מהמסך הראשי</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/20 rounded-lg">
                    <div className="font-semibold text-primary mb-2">🔔 עדכונים</div>
                    <div className="text-muted-foreground">קבל התראות על פעילות חדשה</div>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4">
                <Button variant="ghost" onClick={() => navigate("/")}>
                  אולי מאוחר יותר
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Install;
