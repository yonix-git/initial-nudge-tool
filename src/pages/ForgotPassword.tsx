import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Car, Eye, EyeOff, ArrowRight } from "lucide-react";
import { z } from "zod";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Password validation schema
  const passwordSchema = z.string()
    .min(8, { message: "הסיסמה חייבת להכיל לפחות 8 תווים" })
    .regex(/[a-zA-Z]/, { message: "הסיסמה חייבת להכיל לפחות אות אחת באנגלית" })
    .regex(/[0-9]/, { message: "הסיסמה חייבת להכיל לפחות מספר אחד" })
    .regex(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/`~\\]+$/, { message: "הסיסמה יכולה להכיל רק אותיות באנגלית, מספרים וסימנים מיוחדים" });

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const trimmedEmail = email.trim();

      // Validate email format
      const emailSchema = z.string().email({ message: "אנא הזן כתובת אימייל תקינה" });
      const validationResult = emailSchema.safeParse(trimmedEmail);

      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0].message);
      }

      // Send password reset code - the function checks if user exists
      const { data, error } = await supabase.functions.invoke('send-password-reset-code', {
        body: { 
          email: trimmedEmail
        }
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || "שגיאה בשליחת קוד אימות");
      }

      setStep(2);
      toast({
        title: "קוד אימות נשלח!",
        description: "בדוק את תיבת הדואר שלך והזן את הקוד שקיבלת",
      });
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.message || "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!verificationCode || verificationCode.length !== 5) {
        throw new Error("נא להזין קוד בן 5 ספרות");
      }

      const trimmedEmail = email.trim();
      
      // Verify the code using edge function
      const { data, error: verifyError } = await supabase.functions.invoke('verify-code', {
        body: { 
          email: trimmedEmail,
          code: verificationCode.trim()
        }
      });

      if (verifyError || !data?.success) {
        throw new Error("קוד שגוי, אנא נסה שנית");
      }

      setStep(3);
      toast({
        title: "קוד אומת בהצלחה",
        description: "כעת הזן סיסמה חדשה",
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate password
      const validationResult = passwordSchema.safeParse(newPassword);
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0].message);
      }

      // Check for common weak passwords
      const commonPasswords = ["password", "123456", "12345678", "qwerty", "abc123", "password123", "admin123"];
      if (commonPasswords.includes(newPassword.toLowerCase())) {
        throw new Error("הסיסמה שבחרת נפוצה מדי, אנא בחר סיסמה אחרת");
      }

      const trimmedEmail = email.trim();

      // Update the user's password using admin API through edge function
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: { 
          email: trimmedEmail,
          newPassword: newPassword,
          verificationCode: verificationCode.trim()
        }
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || "שגיאה בעדכון הסיסמה");
      }

      // Sign in the user with the new password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: newPassword,
      });

      if (signInError) {
        toast({
          title: "הסיסמה שונתה בהצלחה!",
          description: "אנא התחבר עם הסיסמה החדשה",
        });
        navigate("/auth");
        return;
      }

      toast({
        title: "הסיסמה שונתה בהצלחה!",
        description: "מיד תועבר לדף הבית",
      });

      // Navigate to home page
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error: any) {
      toast({
        title: "שגיאה",
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
          <CardTitle className="text-2xl">איפוס סיסמה</CardTitle>
          <CardDescription>
            {step === 1 && "הזן את כתובת המייל שלך"}
            {step === 2 && "הזן את קוד האימות שנשלח למייל"}
            {step === 3 && "צור סיסמה חדשה"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div dir="rtl">
            {step === 1 && (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">אימייל</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="yourEmail@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    dir="ltr"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "שולח קוד..." : "שלח קוד אימות"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate("/auth")}
                >
                  <ArrowRight className="ml-2 h-4 w-4" />
                  חזרה להתחברות
                </Button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
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
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    maxLength={5}
                    dir="ltr"
                    className="text-center text-2xl tracking-widest"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "מאמת..." : "אמת קוד"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setStep(1)}
                >
                  חזרה
                </Button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">סיסמה חדשה</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
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
                  <p className="text-xs text-muted-foreground">
                    הסיסמה חייבת להכיל לפחות 8 תווים, אות אחת באנגלית ומספר אחד
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "משנה סיסמה..." : "שנה סיסמה"}
                </Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
