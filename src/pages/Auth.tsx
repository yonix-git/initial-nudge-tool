import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  // Field-level validation errors
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    username?: string;
    email?: string;
    password?: string;
  }>({});

  // Schema validation with zod
  const signupSchema = z.object({
    email: z.string().trim().email({ message: "אנא הזן כתובת אימייל תקינה" }).max(255),
    password: z.string().min(8, { message: "הסיסמה חייבת להכיל לפחות 8 תווים" })
      .regex(/[a-zA-Z]/, { message: "הסיסמה חייבת להכיל לפחות אות אחת באנגלית" })
      .regex(/[0-9]/, { message: "הסיסמה חייבת להכיל לפחות מספר אחד" })
      .regex(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/`~\\]+$/, { message: "הסיסמה יכולה להכיל רק אותיות באנגלית, מספרים וסימנים מיוחדים" }),
    fullName: z.string().trim().min(2, { message: "שם מלא חייב להכיל לפחות 2 תווים" }).max(100),
    username: z.string().trim().min(3, { message: "שם משתמש חייב להכיל לפחות 3 תווים" }).max(50)
      .regex(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/`~\\]+$/, { message: "שם משתמש יכול להכיל רק אותיות באנגלית, מספרים וסימנים" }),
  });

  // Real-time validation function
  const validateField = (field: string, value: string) => {
    const errors: typeof fieldErrors = { ...fieldErrors };
    
    switch (field) {
      case 'fullName':
        if (!value.trim()) {
          errors.fullName = "שם מלא הוא שדה חובה";
        } else if (value.trim().length < 2) {
          errors.fullName = "שם מלא חייב להכיל לפחות 2 תווים";
        } else {
          delete errors.fullName;
        }
        break;
      case 'username':
        if (!value.trim()) {
          errors.username = "שם משתמש הוא שדה חובה";
        } else if (value.trim().length < 3) {
          errors.username = "שם משתמש חייב להכיל לפחות 3 תווים";
        } else if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/`~\\]+$/.test(value.trim())) {
          errors.username = "שם משתמש יכול להכיל רק אותיות באנגלית, מספרים וסימנים";
        } else {
          delete errors.username;
        }
        break;
      case 'email':
        if (!value.trim()) {
          errors.email = "אימייל הוא שדה חובה";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          errors.email = "אנא הזן כתובת אימייל תקינה";
        } else {
          delete errors.email;
        }
        break;
      case 'password':
        const lowerPassword = value.toLowerCase();
        const commonPasswords = [
          "password", "123456", "12345678", "qwerty", "abc123", "password123", "admin123",
          "welcome", "monkey", "1234567890", "letmein", "password1", "123123", "123456789",
          "qwertyuiop", "1q2w3e4r", "football", "iloveyou", "admin", "welcome123"
        ];
        const sequentialPatterns = [
          "123", "234", "345", "456", "567", "678", "789",
          "abc", "bcd", "cde", "def", "efg", "fgh", "ghi"
        ];
        
        if (!value) {
          errors.password = "סיסמה היא שדה חובה";
        } else if (value.length < 8) {
          errors.password = "הסיסמה חייבת להכיל לפחות 8 תווים";
        } else if (!/[a-zA-Z]/.test(value)) {
          errors.password = "הסיסמה חייבת להכיל לפחות אות אחת באנגלית";
        } else if (!/[0-9]/.test(value)) {
          errors.password = "הסיסמה חייבת להכיל לפחות מספר אחד";
        } else if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/`~\\]+$/.test(value)) {
          errors.password = "הסיסמה יכולה להכיל רק אותיות באנגלית, מספרים וסימנים מיוחדים";
        } else if (commonPasswords.includes(lowerPassword)) {
          errors.password = "הסיסמה שבחרת נפוצה מדי. אנא בחר סיסמה אחרת";
        } else if (sequentialPatterns.some(pattern => lowerPassword.includes(pattern))) {
          errors.password = "הסיסמה מכילה רצף תווים רציף (123, abc וכד')";
        } else if (/(.)\1{3,}/.test(value)) {
          errors.password = "הסיסמה מכילה יותר מדי תווים זהים ברצף";
        } else if (username.trim() && lowerPassword.includes(username.trim().toLowerCase())) {
          errors.password = "הסיסמה לא יכולה להכיל את שם המשתמש";
        } else if (email.trim() && lowerPassword.includes(email.trim().split('@')[0].toLowerCase())) {
          errors.password = "הסיסמה לא יכולה להכיל חלק מכתובת המייל";
        } else {
          delete errors.password;
        }
        break;
    }
    
    setFieldErrors(errors);
  };

  // Check if form is valid
  const isSignupFormValid = () => {
    const lowerPassword = password.toLowerCase();
    const commonPasswords = [
      "password", "123456", "12345678", "qwerty", "abc123", "password123", "admin123",
      "welcome", "monkey", "1234567890", "letmein", "password1", "123123", "123456789",
      "qwertyuiop", "1q2w3e4r", "football", "iloveyou", "admin", "welcome123"
    ];
    const sequentialPatterns = [
      "123", "234", "345", "456", "567", "678", "789",
      "abc", "bcd", "cde", "def", "efg", "fgh", "ghi"
    ];
    
    const passwordValid = 
      password.length >= 8 &&
      /[a-zA-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/`~\\]+$/.test(password) &&
      !commonPasswords.includes(lowerPassword) &&
      !sequentialPatterns.some(pattern => lowerPassword.includes(pattern)) &&
      !/(.)\1{3,}/.test(password) &&
      !(username.trim() && lowerPassword.includes(username.trim().toLowerCase())) &&
      !(email.trim() && lowerPassword.includes(email.trim().split('@')[0].toLowerCase()));
    
    return (
      fullName.trim().length >= 2 &&
      username.trim().length >= 3 &&
      /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/`~\\]+$/.test(username.trim()) &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
      passwordValid &&
      Object.keys(fieldErrors).length === 0
    );
  };

  // Re-validate password when username or email changes
  useEffect(() => {
    if (password) {
      validateField('password', password);
    }
  }, [username, email]);

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
      const trimmedEmail = email.trim();

      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
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
        
        // Check if it's a wrong password error vs user not found
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes('email not confirmed')) {
          throw new Error("מייל אינו רשום, אנא עבור לדף הרשמה");
        } else if (errorMsg.includes('invalid') || 
                   errorMsg.includes('credentials') ||
                   errorMsg.includes('password')) {
          throw new Error("סיסמה שגויה");
        }
        
        throw new Error("מייל אינו רשום, אנא עבור לדף הרשמה");
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

  const handleSendVerificationCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

      const trimmedEmail = email.trim();
      const trimmedUsername = username.trim();
      const lowerPassword = password.toLowerCase();

      // Check for common weak passwords BEFORE sending verification code
      const commonPasswords = [
        "password", "123456", "12345678", "qwerty", "abc123", "password123", "admin123",
        "welcome", "monkey", "1234567890", "letmein", "password1", "123123", "123456789",
        "qwertyuiop", "1q2w3e4r", "football", "iloveyou", "admin", "welcome123"
      ];
      if (commonPasswords.includes(lowerPassword)) {
        throw new Error("הסיסמה שבחרת נפוצה מדי ונמצאת ברשימת סיסמאות ידועות. אנא בחר סיסמה אחרת");
      }

      // Check for sequential characters
      const sequentialPatterns = [
        "123", "234", "345", "456", "567", "678", "789",
        "abc", "bcd", "cde", "def", "efg", "fgh", "ghi"
      ];
      if (sequentialPatterns.some(pattern => lowerPassword.includes(pattern))) {
        throw new Error("הסיסמה מכילה רצף תווים רציף (123, abc וכד'). אנא בחר סיסמה מורכבת יותר");
      }

      // Check if password contains the username
      if (lowerPassword.includes(trimmedUsername.toLowerCase())) {
        throw new Error("הסיסמה לא יכולה להכיל את שם המשתמש");
      }

      // Check if password contains part of the email
      const emailUsername = trimmedEmail.split('@')[0].toLowerCase();
      if (lowerPassword.includes(emailUsername)) {
        throw new Error("הסיסמה לא יכולה להכיל חלק מכתובת המייל");
      }

      // Check for repeated characters (e.g., "aaaa", "1111")
      if (/(.)\1{3,}/.test(password)) {
        throw new Error("הסיסמה מכילה יותר מדי תווים זהים ברצף. אנא בחר סיסמה מורכבת יותר");
      }

      // Check both email and username, then send verification code
      // This is done in one call to the edge function which uses service role
      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: { 
          email: trimmedEmail,
          username: trimmedUsername
        }
      });

      if (error) {
        console.error("Verification error:", error);
        throw new Error(error.message || "שגיאה בשליחת קוד אימות");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setShowVerification(true);
      toast({
        title: "קוד אימות נשלח!",
        description: "בדוק את תיבת הדואר שלך והזן את הקוד שקיבלת",
      });
    } catch (error: any) {
      console.error("Error in handleSendVerificationCode:", error);
      toast({
        title: "שגיאה",
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

      const trimmedEmail = email.trim();
      const trimmedUsername = username.trim();
      const trimmedFullName = fullName.trim();

      console.log("Starting verification for:", trimmedEmail);
      
      // Verify the code using secure edge function
      const { data, error: verifyError } = await supabase.functions.invoke('verify-code', {
        body: { 
          email: trimmedEmail,
          code: verificationCode.trim()
        }
      });

      console.log("Verification result:", { data, verifyError });

      if (verifyError || !data?.success) {
        throw new Error(data?.error || verifyError?.message || "קוד האימות שגוי או שפג תוקפו");
      }

      console.log("Code verified successfully, proceeding to sign up...");

      // Now sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: trimmedFullName,
            username: trimmedUsername,
            account_type: "private",
          },
        },
      });

      console.log("SignUp result:", { signUpData, signUpError });

      if (signUpError) {
        console.error("Signup error details:", signUpError);
        throw new Error(signUpError.message || "שגיאה בהרשמה למערכת");
      }

      if (!signUpData.user) {
        throw new Error("שגיאה ביצירת המשתמש");
      }

      console.log("User signed up successfully:", signUpData.user.id);

      // Mark verification code as verified
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const adminClient = createClient(supabaseUrl, supabaseKey);
      
      await adminClient
        .from('verification_codes')
        .update({ verified: true })
        .eq('email', trimmedEmail)
        .eq('code', verificationCode.trim());

      toast({
        title: "נרשמת בהצלחה!",
        description: "מיד תועבר לדף הראשי",
      });

      // Navigate to home page
      navigate("/");
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Car className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">ברוכים הבאים</CardTitle>
          <CardDescription>הצטרפו לקהילת אוהבי הרכב הגדולה בישראל</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid w-full grid-cols-2 gap-2 p-1 bg-muted rounded-md">
              <Button
                type="button"
                variant={activeTab === "signin" ? "default" : "ghost"}
                onClick={() => setActiveTab("signin")}
                className="w-full"
              >
                התחברות
              </Button>
              <Button
                type="button"
                variant={activeTab === "signup" ? "default" : "ghost"}
                onClick={() => setActiveTab("signup")}
                className="w-full"
              >
                הרשמה
              </Button>
            </div>

            {activeTab === "signin" && (
              <div dir="rtl">
                <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">אימייל</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="yourEmail@email.com"
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
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-primary"
                    onClick={() => navigate("/forgot-password")}
                  >
                    שכחתי את הסיסמה
                  </Button>
                </div>
              </form>
              </div>
            )}

            {activeTab === "signup" && (
              <div dir="rtl">
                {!showVerification ? (
                  <div className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="fullname">שם מלא</Label>
                    <Input
                      id="fullname"
                      type="text"
                      placeholder=""
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        validateField('fullName', e.target.value);
                      }}
                      onBlur={() => validateField('fullName', fullName)}
                      required
                      className={fieldErrors.fullName ? "border-destructive" : ""}
                    />
                    {fieldErrors.fullName && (
                      <p className="text-xs text-destructive">{fieldErrors.fullName}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="username">שם משתמש</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder=""
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        validateField('username', e.target.value);
                      }}
                      onBlur={() => validateField('username', username)}
                      required
                      dir="ltr"
                      className={fieldErrors.username ? "border-destructive" : ""}
                    />
                    {fieldErrors.username && (
                      <p className="text-xs text-destructive">{fieldErrors.username}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="signup-email">אימייל</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="yourEmail@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        validateField('email', e.target.value);
                      }}
                      onBlur={() => validateField('email', email)}
                      required
                      dir="ltr"
                      className={fieldErrors.email ? "border-destructive" : ""}
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-destructive">{fieldErrors.email}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="signup-password">צור סיסמה</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          validateField('password', e.target.value);
                        }}
                        onBlur={() => validateField('password', password)}
                        required
                        minLength={8}
                        dir="ltr"
                        className={`pr-10 ${fieldErrors.password ? "border-destructive" : ""}`}
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
                    {fieldErrors.password && (
                      <p className="text-xs text-destructive">{fieldErrors.password}</p>
                    )}
                  </div>
                  <Button 
                    type="button" 
                    className="w-full" 
                    disabled={loading || !isSignupFormValid()}
                    onClick={() => handleSendVerificationCode()}
                  >
                    {loading ? "שולח קוד..." : "שלח קוד אימות"}
                  </Button>
                </div>
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
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;