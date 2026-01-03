import { useState, useRef, useCallback, memo } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ZoomableMediaProps {
  src: string;
  type: "image" | "video";
  alt?: string;
  onDoubleClick?: () => void;
}

const ZoomableMedia = memo(({ src, type, alt = "Media", onDoubleClick }: ZoomableMediaProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastPosition = useRef({ x: 0, y: 0 });
  const startPosition = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.5, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => {
      const newScale = Math.max(prev - 0.5, 1);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (scale === 1) {
      setScale(2);
    } else {
      handleReset();
    }
    onDoubleClick?.();
  }, [scale, handleReset, onDoubleClick]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    startPosition.current = { x: e.clientX, y: e.clientY };
    lastPosition.current = { ...position };
  }, [scale, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    
    const deltaX = e.clientX - startPosition.current.x;
    const deltaY = e.clientY - startPosition.current.y;
    
    setPosition({
      x: lastPosition.current.x + deltaX,
      y: lastPosition.current.y + deltaY,
    });
  }, [isDragging, scale]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (scale <= 1 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    startPosition.current = { x: touch.clientX, y: touch.clientY };
    lastPosition.current = { ...position };
  }, [scale, position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || scale <= 1 || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPosition.current.x;
    const deltaY = touch.clientY - startPosition.current.y;
    
    setPosition({
      x: lastPosition.current.x + deltaX,
      y: lastPosition.current.y + deltaY,
    });
  }, [isDragging, scale]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setScale(prev => {
      const newScale = Math.max(1, Math.min(prev + delta, 5));
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Zoom Controls */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-background/80 backdrop-blur-sm rounded-full p-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={handleZoomOut}
          disabled={scale <= 1}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="flex items-center text-sm font-medium min-w-[3rem] justify-center">
          {Math.round(scale * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={handleZoomIn}
          disabled={scale >= 5}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        {scale > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Media */}
      <div
        className="transition-transform duration-100"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
        }}
        onDoubleClick={handleDoubleClick}
      >
        {type === "image" ? (
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[85vh] object-contain select-none"
            draggable={false}
          />
        ) : (
          <video
            src={src}
            controls
            loop
            playsInline
            className="max-w-full max-h-[85vh] object-contain"
          />
        )}
      </div>
    </div>
  );
});

ZoomableMedia.displayName = "ZoomableMedia";

export default ZoomableMedia;
