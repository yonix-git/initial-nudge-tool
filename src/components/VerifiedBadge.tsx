import { BadgeCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface VerifiedBadgeProps {
  size?: number;
  className?: string;
}

export const VerifiedBadge = ({ size = 16, className = "" }: VerifiedBadgeProps) => {
  const { t } = useLanguage();
  
  return (
    <span title={t("verifiedBusiness")} className="inline-flex items-center">
      <BadgeCheck 
        size={size} 
        className={`text-primary ${className}`}
      />
    </span>
  );
};
