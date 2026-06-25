import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Car, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

// ─── Password rules ────────────────────────────────────────────────────────────
const COMMON_PASSWORDS = new Set([
  "password","123456","12345678","qwerty","abc123","password123","admin123",
  "welcome","monkey","1234567890","letmein","password1","123123","123456789",
  "qwertyuiop","1q2w3e4r","football","iloveyou","admin","welcome123",
]);
const SEQUENTIAL_PATTERNS = ["123","234","345","456","567","678","789","abc","bcd","cde","def","efg","fgh","ghi"];

const validatePassword = (value: string, username = "", email = ""): string | null => {
  const lp = value.toLowerCase();
  if (!value) return "סיסמה היא שדה חובה";
  if (value.length < 8) return "הסיסמה חייבת להכיל לפחות 8 תווים";
  if (!/[a-zA-Z]/.test(value)) return "הסיסמה חייבת להכיל לפחות אות אחת באנגלית";
  if (!/[0-9]/.test(value)) return "הסיסמה חייבת להכיל לפחות מספר אחד";
  if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/`~\\]+$/.test(value))
    return "הסיסמה יכולה להכיל רק אותיות באנגלית, מספרים וסימנים מיוחדים";
  if (COMMON_PASSWORDS.has(lp)) return "הסיסמה שבחרת נפוצה מדי. אנא בחר סיסמה אחרת";
  if (SEQUENTIAL_PATTERNS.some(p => lp.includes(p))) return "הסיסמה מכילה רצף תווים רציף (123, abc וכד')";
  if (/(.)\\1{3,}/.test(value)) return "הסיסמה מכילה יותר מדי תווים זהים ברצף";
  if (username.trim() && lp.includes(username.trim().toLowerCase())) return "הסיסמה לא יכולה להכיל את שם המשתמש";
  if (email.trim() && lp.includes(email.trim().split('@')[0].toLowerCase())) return "הסיסמה לא יכולה להכיל חלק מכתובת המייל";
  return null;
};

const signupSchema = z.object({
  email: z.string().trim().email({ message: "אנא הזן כתובת אימייל תקינה" }).max(255),
  password: z.string().min(8, { message: "הסיסמה חייבת להכיל לפחות 8 תווים" }),
  fullName: z.string().trim().min(2, { message: "שם מלא חייב להכיל לפחות 2 תווים" }).max(100),
  username: z.string().trim().min(3, { message: "שם משתמש חייב להכיל לפחות 3 תווים" }).max(50)
    .regex(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/`~\\]+$/, { message: "שם משתמש יכול להכיל רק אותיות באנגלית, מספרים וסימנים" }),
});

// ─── Component ────────────────────────────────────────────────────────────────
const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, dir } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string; username?: string; email?: string; password?: string;
  }>({});

  // ── Field validation ────────────────────────────────────────────────────────
  const validateField = (field: string, value: string) => {
    const errors = { ...fieldErrors };

    if (field === 'fullName') {
      if (!value.trim()) errors.fullName = "שם מלא הוא שדה חובה";
      else if (value.trim().length < 2) errors.fullName = "שם מלא חייב להכיל לפחות 2 תווים";
      else delete errors.fullName;
    }
    if (field === 'username') {
      if (!value.trim()) errors.username = "שם משתמש הוא שדה חובה";
      else if (value.trim().length < 3) errors.username = "שם משתמש חייב להכיל לפחות 3 תווים";
      else if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/`~\\]+$/.test(value.trim()))
        errors.username = "שם משתמש יכול להכיל רק אותיות באנגלית, מספרים וסימנים";
      else delete errors.username;
    }
    if (field === 'email') {
      if (!value.trim()) errors.email = "אימייל הוא שדה חובה";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) errors.email = "אנא הזן כתובת אימייל תקינה";
      else delete errors.email;
    }
    if (field === 'password') {
      const err = validatePassword(value, username, email);
      if (err) errors.password = err;
      else delete errors.password;
    }

    setFieldErrors(errors);
  };

  const isSignupFormValid = () => {
    const passwordErr = validatePassword(password, username, email);
    return (
      fullName.trim().length >= 2 &&
      username.trim().length >= 3 &&
      /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/`~\\]+$/.test(username.trim()) &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
      !passwordErr &&
      Object.keys(fieldErrors).length === 0 &&
      acceptedPrivacy &&
      acceptedTerms
    );
  };

  // Re-validate password when username/email change
  useEffect(() => {
    if (password) validateField('password', password);
  }, [username, email]);

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) navigate("/");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // ── Sign in ─────────────────────────────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) {
      toast({ title: "חשבון חסום זמנית", description: "יותר מדי ניסיונות. אנא נסה שוב בעוד דקה.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setLoginAttempts(prev => {
          const next = prev + 1;
          if (next >= 5) {
            setIsBlocked(true);
            setTimeout(() => { setIsBlocked(false); setLoginAttempts(0); }, 60000);
          }
          return next;
        });
        const msg = error.message.toLowerCase();
        if (msg.includes('email not confirmed')) throw new Error("מייל אינו מאומת");
        if (msg.includes('invalid') || msg.includes('credentials') || msg.includes('password'))
          throw new Error("סיסמה שגויה");
        throw new Error("מייל אינו רשום במערכת. אנא עבור להרשמה");
      }
      setLoginAttempts(0);
      setIsBlocked(false);
      toast({ title: "התחברת בהצלחה!" });
    } catch (error: any) {
      toast({ title: "שגיאה בהתחברות", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ── Send verification code ──────────────────────────────────────────────────
  const handleSendVerificationCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      // Schema validate first
      const validation = signupSchema.safeParse({ email, password, fullName, username });
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      // Password strength check
      const passwordErr = validatePassword(password, username, email);
      if (passwordErr) throw new Error(passwordErr);

      const trimmedEmail = email.trim().toLowerCase();
      const trimmedUsername = username.trim();

      // Check email & username availability (always returns 200 now)
      const checkResponse = await supabase.functions.invoke('send-verification-code', {
        body: { email: trimmedEmail, username: trimmedUsername, checkOnly: true },
      });

      // The function always returns 200, so error means a network problem
      if (checkResponse.error) {
        throw new Error("בעיית רשת. אנא בדוק את החיבור ונסה שוב");
      }

      const checkData = checkResponse.data;
      if (!checkData?.success) {
        // Specific error message from the server
        throw new Error(checkData?.error || "שגיאה בבדיקת הפרטים");
      }

      // Send the actual code
      const sendResponse = await supabase.functions.invoke('send-verification-code', {
        body: { email: trimmedEmail, username: trimmedUsername },
      });

      if (sendResponse.error) {
        throw new Error("בעיית רשת בשליחת הקוד. אנא נסה שוב");
      }

      const sendData = sendResponse.data;
      if (!sendData?.success) {
        throw new Error(sendData?.error || "שגיאה בשליחת קוד האימות");
      }

      setShowVerification(true);
      toast({ title: "קוד אימות נשלח!", description: "בדוק את תיבת הדואר שלך" });
    } catch (error: any) {
      toast({ title: "שגיאה", description: error.message || "אנא נסה שוב מאוחר יותר", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ── Verify & sign up ────────────────────────────────────────────────────────
  const handleVerifyAndSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!verificationCode || verificationCode.length !== 5) throw new Error("נא להזין קוד בן 5 ספרות");

      const trimmedEmail = email.trim().toLowerCase();

      const { data, error: verifyError } = await supabase.functions.invoke('verify-code', {
        body: { email: trimmedEmail, code: verificationCode.trim() }
      });

      if (verifyError) throw new Error("בעיית רשת באימות הקוד");
      if (!data?.success) throw new Error(data?.error || "קוד האימות שגוי או שפג תוקפו");

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName.trim(),
            username: username.trim(),
            account_type: "private",
          },
        },
      });

      if (signUpError) {
        const msg = signUpError.message?.toLowerCase() || '';
        if (msg.includes('already registered') || msg.includes('already exists'))
          throw new Error("מייל זה כבר רשום במערכת. אנא נסה להתחבר");
        if (msg.includes('password')) throw new Error("הסיסמה לא עומדת בדרישות האבטחה");
        if (msg.includes('email')) throw new Error("כתובת האימייל אינה תקינה");
        throw new Error(signUpError.message || "שגיאה בהרשמה. אנא נסה שוב");
      }

      if (!signUpData.user) throw new Error("שגיאה ביצירת המשתמש");

      toast({ title: "נרשמת בהצלחה!", description: "מיד תועבר לדף הראשי" });
      navigate("/");
    } catch (error: any) {
      toast({ title: "שגיאה באימות", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/40 shadow-2xl relative z-10">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-primary to-accent p-4 rounded-2xl shadow-lg">
              <Car className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold gradient-text">ברוכים הבאים</CardTitle>
          <CardDescription className="text-base mt-2">הצטרפו לקהילת אוהבי הרכב הגדולה בישראל</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Tab switcher */}
            <div className="grid w-full grid-cols-2 gap-1 p-1 bg-muted/50 rounded-xl">
              <Button type="button" variant={activeTab === "signin" ? "default" : "ghost"}
                onClick={() => setActiveTab("signin")} className="w-full rounded-lg font-semibold">
                התחברות
              </Button>
              <Button type="button" variant={activeTab === "signup" ? "default" : "ghost"}
                onClick={() => setActiveTab("signup")} className="w-full rounded-lg font-semibold">
                הרשמה
              </Button>
            </div>

            {/* ── Sign in form ── */}
            {activeTab === "signin" && (
              <div dir="rtl">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">אימייל</Label>
                    <Input id="signin-email" type="email" placeholder="yourEmail@email.com"
                      value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">סיסמה</Label>
                    <div className="relative">
                      <Input id="signin-password" type={showPassword ? "text" : "password"}
                        value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" className="pr-10" />
                      <Button type="button" variant="ghost" size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                    {loading ? "מתחבר..." : "התחבר"}
                  </Button>
                  <div className="text-center">
                    <Button type="button" variant="link" className="text-sm text-primary"
                      onClick={() => navigate("/forgot-password")}>
                      שכחתי את הסיסמה
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Sign up form ── */}
            {activeTab === "signup" && (
              <div dir="rtl">
                {!showVerification ? (
                  <div className="space-y-4">
                    {/* Full name */}
                    <div className="space-y-1">
                      <Label htmlFor="fullname">שם מלא</Label>
                      <Input id="fullname" type="text" value={fullName}
                        onChange={(e) => { setFullName(e.target.value); validateField('fullName', e.target.value); }}
                        onBlur={() => validateField('fullName', fullName)}
                        className={fieldErrors.fullName ? "border-destructive" : ""} />
                      {fieldErrors.fullName && <p className="text-xs text-destructive">{fieldErrors.fullName}</p>}
                    </div>
                    {/* Username */}
                    <div className="space-y-1">
                      <Label htmlFor="username">שם משתמש</Label>
                      <Input id="username" type="text" value={username} dir="ltr"
                        onChange={(e) => { setUsername(e.target.value); validateField('username', e.target.value); }}
                        onBlur={() => validateField('username', username)}
                        className={fieldErrors.username ? "border-destructive" : ""} />
                      {fieldErrors.username && <p className="text-xs text-destructive">{fieldErrors.username}</p>}
                    </div>
                    {/* Email */}
                    <div className="space-y-1">
                      <Label htmlFor="signup-email">אימייל</Label>
                      <Input id="signup-email" type="email" placeholder="yourEmail@email.com" value={email} dir="ltr"
                        onChange={(e) => { setEmail(e.target.value); validateField('email', e.target.value); }}
                        onBlur={() => validateField('email', email)}
                        className={fieldErrors.email ? "border-destructive" : ""} />
                      {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
                    </div>
                    {/* Password */}
                    <div className="space-y-1">
                      <Label htmlFor="signup-password">צור סיסמה</Label>
                      <div className="relative">
                        <Input id="signup-password" type={showPassword ? "text" : "password"}
                          value={password} dir="ltr" minLength={8}
                          onChange={(e) => { setPassword(e.target.value); validateField('password', e.target.value); }}
                          onBlur={() => validateField('password', password)}
                          className={`pr-10 ${fieldErrors.password ? "border-destructive" : ""}`} />
                        <Button type="button" variant="ghost" size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                      </div>
                      {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password}</p>}
                    </div>
                    {/* Checkboxes */}
                    <div className="flex items-start gap-3">
                      <Checkbox id="privacy-policy" checked={acceptedPrivacy}
                        onCheckedChange={(c) => setAcceptedPrivacy(c === true)} className="mt-0.5" />
                      <span className="text-sm leading-relaxed">
                        קראתי ואני מסכים/ה ל
                        <Link to="/privacy-policy" className="text-primary hover:underline mx-1 font-medium" target="_blank" onClick={(e) => e.stopPropagation()}>
                          מדיניות הפרטיות
                        </Link>
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Checkbox id="terms-of-service" checked={acceptedTerms}
                        onCheckedChange={(c) => setAcceptedTerms(c === true)} className="mt-0.5" />
                      <span className="text-sm leading-relaxed">
                        קראתי ואני מסכים/ה ל
                        <Link to="/terms-of-service" className="text-primary hover:underline mx-1 font-medium" target="_blank" onClick={(e) => e.stopPropagation()}>
                          תנאי השימוש
                        </Link>
                      </span>
                    </div>
                    <Button type="button" className="w-full h-12 text-base font-semibold"
                      disabled={loading || !isSignupFormValid()}
                      onClick={() => handleSendVerificationCode()}>
                      {loading ? "שולח קוד..." : "שלח קוד אימות"}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyAndSignUp} className="space-y-4">
                    <div className="text-center mb-4">
                      <p className="text-sm text-muted-foreground">שלחנו קוד אימות בן 5 ספרות לכתובת</p>
                      <p className="font-semibold" dir="ltr">{email}</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="verification-code">קוד אימות</Label>
                      <Input id="verification-code" type="text" placeholder="12345"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                        required maxLength={5} dir="ltr"
                        className="text-center text-2xl tracking-widest" />
                    </div>
                    <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                      {loading ? "מאמת..." : "אמת והירשם"}
                    </Button>
                    <Button type="button" variant="ghost" className="w-full"
                      onClick={() => { setShowVerification(false); setVerificationCode(""); }}>
                      חזור לטופס הרשמה
                    </Button>
                  </form>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
