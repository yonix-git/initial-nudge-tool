import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Car, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, dir } = useLanguage();
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [accountType, setAccountType] = useState<"private" | "business">("private");
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Schema validation with zod
  const signupSchema = z.object({
    email: z.string().trim().email({ message: "אנא הזן כתובת אימייל תקינה" }).max(255),
    password: z.string().min(8, { message: "הסיסמה חייבת להכיל לפחות 8 תווים" })
      .regex(/[A-Z]/, { message: "הסיסמה חייבת להכיל לפחות אות גדולה אחת באנגלית" })
      .regex(/[a-z]/, { message: "הסיסמה חייבת להכיל לפחות אות קטנה אחת באנגלית" }),
    fullName: z.string().trim().min(2, { message: "שם מלא חייב להכיל לפחות 2 תווים" }).max(100),
    username: z.string().trim().min(3, { message: "שם משתמש חייב להכיל לפחות 3 תווים" }).max(50)
      .regex(/^[a-zA-Z0-9_]+$/, { message: "שם משתמש יכול להכיל רק אותיות באנגלית, מספרים וקו תחתון" }),
  });

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting - block after 5 failed attempts
    if (isBlocked) {
      toast({
        title: "חשבון חסום זמנית",
        description: "יותר מדי ניסיונות התחברות כושלים. אנא נסה שוב בעוד דקה.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoginAttempts(prev => prev + 1);
        
        if (loginAttempts >= 4) {
          setIsBlocked(true);
          setTimeout(() => {
            setIsBlocked(false);
            setLoginAttempts(0);
          }, 60000); // Unblock after 1 minute
        }
        
        throw error;
      }

      // Reset on successful login
      setLoginAttempts(0);
      setIsBlocked(false);

      toast({
        title: "התחברת בהצלחה!",
      });
    } catch (error: any) {
      toast({
        title: "שגיאה בהתחברות",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate all inputs with zod
      const validationResult = signupSchema.safeParse({
        email,
        password,
        fullName,
        username,
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        throw new Error(firstError.message);
      }

      // Check for common weak passwords
      const commonPasswords = ["password", "123456", "12345678", "qwerty", "abc123", "password123", "admin123"];
      if (commonPasswords.includes(password.toLowerCase())) {
        throw new Error("הסיסמה שבחרת נפוצה מדי, אנא בחר סיסמה אחרת");
      }

      const trimmedEmail = email.trim();

      console.log("Sending verification code to:", trimmedEmail);

      // Send verification code
      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: { email: trimmedEmail }
      });

      console.log("Verification response:", { data, error });

      if (error) {
        console.error("Verification error:", error);
        throw new Error(error.message || "שגיאה בשליחת קוד אימות");
      }

      setShowVerification(true);
      toast({
        title: "קוד אימות נשלח!",
        description: "בדוק את תיבת הדואר שלך והזן את הקוד שקיבלת",
      });
    } catch (error: any) {
      console.error("Error in handleSendVerificationCode:", error);
      toast({
        title: "שגיאה בשליחת קוד אימות",
        description: error.message || "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!verificationCode || verificationCode.length !== 5) {
        throw new Error("נא להזין קוד בן 5 ספרות");
      }

      // Verify the code using secure edge function
      const { data, error: verifyError } = await supabase.functions.invoke('verify-code', {
        body: { 
          email: email.trim(),
          code: verificationCode.trim()
        }
      });

      if (verifyError || !data?.success) {
        throw new Error(data?.error || verifyError?.message || "קוד האימות שגוי או שפג תוקפו");
      }

      // Now sign up the user
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName.trim(),
            username: username.trim(),
            account_type: accountType,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message?.includes("User already registered") || signUpError.message?.includes("user_already_exists")) {
          throw new Error("המייל הזה כבר רשום במערכת. אנא התחבר במקום להירשם מחדש.");
        }
        throw signUpError;
      }

      toast({
        title: "נרשמת בהצלחה!",
        description: "מיד תועבר לדף הראשי",
      });
    } catch (error: any) {
      toast({
        title: "שגיאה באימות",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir={dir}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Car className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">ברוכים הבאים</CardTitle>
          <CardDescription>הצטרפו לקהילת אוהבי הרכב הגדולה בישראל</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" dir={dir}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">התחברות</TabsTrigger>
              <TabsTrigger value="signup">הרשמה</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">אימייל</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">סיסמה</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      dir="ltr"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "מתחבר..." : "התחבר"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              {!showVerification ? (
                <form onSubmit={handleSendVerificationCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">שם מלא</Label>
                    <Input
                      id="fullname"
                      type="text"
                      placeholder=""
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">שם משתמש</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder=""
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-type">סוג חשבון</Label>
                    <Select value={accountType} onValueChange={(value: "private" | "business") => setAccountType(value)}>
                      <SelectTrigger id="account-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">חשבון פרטי</SelectItem>
                        <SelectItem value="business">חשבון עסקי</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">אימייל</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">סיסמה</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        dir="ltr"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "שולח קוד אימות..." : "שלח קוד אימות"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyAndSignUp} className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground">
                      שלחנו קוד אימות בן 5 ספרות לכתובת
                    </p>
                    <p className="font-semibold" dir="ltr">{email}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="verification-code">קוד אימות</Label>
                    <Input
                      id="verification-code"
                      type="text"
                      placeholder="12345"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      required
                      maxLength={5}
                      dir="ltr"
                      className="text-center text-2xl tracking-widest"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "מאמת..." : "אמת והירשם"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full" 
                    onClick={() => {
                      setShowVerification(false);
                      setVerificationCode("");
                    }}
                  >
                    חזור לטופס הרשמה
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;