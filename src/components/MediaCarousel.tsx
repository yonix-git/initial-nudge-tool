import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaCarouselProps {
  imageUrls?: string[];
  videoUrls?: string[];
  className?: string;
  onDoubleClick?: () => void;
  onClick?: () => void;
}

const MediaCarousel = ({ 
  imageUrls = [], 
  videoUrls = [], 
  className = "",
  onDoubleClick,
  onClick
}: MediaCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = imageUrls.filter(Boolean);
  const videos = videoUrls.filter(Boolean);
  const hasImages = images.length > 0;
  const hasVideos = videos.length > 0;
  const items = hasImages ? images : videos;
  const totalItems = items.length;

  if (totalItems === 0) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => prev === 0 ? totalItems - 1 : prev - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => prev === totalItems - 1 ? 0 : prev + 1);
  };

  return (
    <div 
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
          src={items[currentIndex]} 
          controls
          loop
          muted
          playsInline
          className="w-full rounded-lg max-h-96"
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
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
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
};

export default MediaCarousel;