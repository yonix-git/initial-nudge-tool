import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, IText, Image as FabricImage } from "fabric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Type, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ImageTextEditorProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedImageBlob: Blob) => void;
}

export const ImageTextEditor = ({ imageUrl, isOpen, onClose, onSave }: ImageTextEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [textInput, setTextInput] = useState("");
  const [selectedColor, setSelectedColor] = useState("#ffffff");

  useEffect(() => {
    if (!canvasRef.current || !isOpen) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 600,
      height: 600,
      backgroundColor: "#000000",
    });

    // Load the image
    FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' }).then((img) => {
      if (!img) return;
      
      // Scale image to fit canvas
      const scale = Math.min(
        canvas.width! / (img.width || 1),
        canvas.height! / (img.height || 1)
      );
      
      img.scale(scale);
      img.set({
        left: (canvas.width! - (img.width || 0) * scale) / 2,
        top: (canvas.height! - (img.height || 0) * scale) / 2,
        selectable: false,
      });
      
      canvas.add(img);
      canvas.sendObjectToBack(img);
      canvas.renderAll();
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [imageUrl, isOpen]);

  const handleAddText = () => {
    if (!fabricCanvas || !textInput.trim()) return;

    const text = new IText(textInput, {
      left: fabricCanvas.width! / 2,
      top: fabricCanvas.height! / 2,
      fill: selectedColor,
      fontSize: 40,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      stroke: '#000000',
      strokeWidth: 2,
    });

    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
    setTextInput("");
  };

  const handleSave = async () => {
    if (!fabricCanvas) return;

    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();

    const dataUrl = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });

    // Convert data URL to Blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    onSave(blob);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>עריכת תמונה - הוספת טקסט</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          <div className="border border-border rounded-lg overflow-hidden bg-muted">
            <canvas ref={canvasRef} className="max-w-full" />
          </div>

          <div className="flex gap-2 items-center">
            <Input
              type="text"
              placeholder="הזן טקסט להוספה על התמונה"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddText()}
              className="flex-1"
            />
            <Input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-20 h-10 cursor-pointer"
            />
            <Button onClick={handleAddText} size="icon">
              <Type className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 ml-2" />
              ביטול
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 ml-2" />
              שמור ופרסם
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
