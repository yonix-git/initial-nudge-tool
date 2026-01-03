import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load pages for better initial load time
const Index = lazy(() => import("./pages/Index"));
const Profile = lazy(() => import("./pages/Profile"));
const Groups = lazy(() => import("./pages/Groups"));
const GroupChat = lazy(() => import("./pages/GroupChat"));
const Services = lazy(() => import("./pages/Services"));
const Events = lazy(() => import("./pages/Events"));
const Settings = lazy(() => import("./pages/Settings"));
const Auth = lazy(() => import("./pages/Auth"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Messages = lazy(() => import("./pages/Messages"));
const DirectMessage = lazy(() => import("./pages/DirectMessage"));
const Marketplace = lazy(() => import("./pages/Marketplace"));

const NotFound = lazy(() => import("./pages/NotFound"));

// Configure QueryClient with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md px-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/groups/:groupId" element={<GroupChat />} />
                <Route path="/services" element={<Services />} />
                <Route path="/events" element={<Events />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/messages/:conversationId" element={<DirectMessage />} />
                <Route path="/marketplace" element={<Marketplace />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
