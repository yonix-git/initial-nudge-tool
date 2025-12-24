import { ReactNode } from "react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
}

export function PullToRefresh({ onRefresh, children, className = "" }: PullToRefreshProps) {
  const {
    isRefreshing,
    pullDistance,
    pullProgress,
    shouldTrigger,
    handlers,
  } = usePullToRefresh({ onRefresh });

  return (
    <div {...handlers} className={`relative ${className}`}>
      {/* Pull indicator */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-50 pointer-events-none transition-opacity duration-200"
        style={{ 
          top: Math.max(pullDistance - 40, -40),
          opacity: pullProgress,
        }}
      >
        <div 
          className={`bg-primary/90 text-primary-foreground rounded-full p-2 shadow-lg transition-all duration-200 ${
            shouldTrigger ? 'scale-110' : ''
          }`}
        >
          <RefreshCw 
            className={`h-5 w-5 transition-transform duration-200 ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            style={{ 
              transform: isRefreshing ? undefined : `rotate(${pullProgress * 180}deg)`,
            }}
          />
        </div>
      </div>

      {/* Content with pull transform */}
      <div 
        style={{ 
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
          transition: pullDistance === 0 ? 'transform 0.2s ease-out' : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
