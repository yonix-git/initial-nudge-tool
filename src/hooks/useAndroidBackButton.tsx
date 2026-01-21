import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const useAndroidBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // The browser already handles the navigation via popstate
      // This hook is mainly for any custom logic we might need
      // React Router handles the actual navigation
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate, location]);
};
