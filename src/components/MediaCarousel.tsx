import { useState, memo, useMemo, useCallback, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaCarouselProps {
  imageUrls?: string[];
  videoUrls?: string[];
  className?: string;
  onDoubleClick?: () => void;
  onClick?: () => void;
}

const MediaCarousel = memo(({ 
  imageUrls = [], 
  videoUrls = [], 
  className = "",
  onDoubleClick,
  onClick
}: MediaCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { images, videos, items, totalItems, hasImages } = useMemo(() => {
    const imgs = imageUrls.filter(Boolean);
    const vids = videoUrls.filter(Boolean);
    const hasImgs = imgs.length > 0;
    return {
      images: imgs,
      videos: vids,
      hasImages: hasImgs,
      items: hasImgs ? imgs : vids,
      totalItems: hasImgs ? imgs.length : vids.length
    };
  }, [imageUrls, videoUrls]);

  // Auto-play video when in viewport, pause when out
  useEffect(() => {
    console.log('[MediaCarousel] useEffect running, hasImages:', hasImages);
    if (hasImages) return;

    const container = containerRef.current;
    console.log('[MediaCarousel] container:', container);
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = videoRef.current;
          console.log('[MediaCarousel] Intersection callback, isIntersecting:', entry.isIntersecting, 'video:', video, 'manuallyPaused:', manuallyPaused);
          if (!video) return;
          
          if (entry.isIntersecting && !manuallyPaused) {
            console.log('[MediaCarousel] Attempting to play video');
            video.play().then(() => {
              console.log('[MediaCarousel] Video play succeeded');
            }).catch((err) => {
              console.log('[MediaCarousel] Video play failed:', err);
            });
          } else if (!entry.isIntersecting) {
            console.log('[MediaCarousel] Pausing video');
            video.pause();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(container);
    console.log('[MediaCarousel] Observer attached to container');

    return () => {
      observer.disconnect();
    };
  }, [hasImages, manuallyPaused]);

  const handlePrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => prev === 0 ? totalItems - 1 : prev - 1);
  }, [totalItems]);

  const handleNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => prev === totalItems - 1 ? 0 : prev + 1);
  }, [totalItems]);

  const handleDotClick = useCallback((e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setCurrentIndex(index);
  }, []);

  if (totalItems === 0) return null;

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      onDoubleClick={onDoubleClick}
      onClick={onClick}
    >
      {hasImages ? (
        <img 
          src={items[currentIndex]} 
          alt="Content" 
          loading="lazy"
          decoding="async"
          className="w-full rounded-lg object-cover max-h-96"
        />
      ) : (
        <video 
          ref={videoRef}
          src={items[currentIndex]} 
          controls
          loop
          muted
          playsInline
          preload="metadata"
          className="w-full rounded-lg max-h-96"
          onPause={() => {
            if (videoRef.current && !videoRef.current.ended) {
              setManuallyPaused(true);
            }
          }}
          onPlay={() => setManuallyPaused(false)}
        />
      )}

      {/* Navigation arrows */}
      {totalItems > 1 && (
        <>
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background h-8 w-8"
            onClick={handlePrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background h-8 w-8"
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Indicators */}
      {totalItems > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {items.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex 
                  ? 'bg-primary' 
                  : 'bg-background/60'
              }`}
              onClick={(e) => handleDotClick(e, index)}
            />
          ))}
        </div>
      )}

      {/* Counter badge */}
      {totalItems > 1 && (
        <div className="absolute top-2 right-2 bg-background/80 px-2 py-1 rounded-full text-xs font-medium">
          {currentIndex + 1} / {totalItems}
        </div>
      )}
    </div>
  );
});

MediaCarousel.displayName = "MediaCarousel";

export default MediaCarousel;