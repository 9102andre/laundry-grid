import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Image as ImageIcon, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddClothModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (photo: string, label: string, tag: string) => void;
  tagOptions: { value: string; label: string; emoji: string; isCustom: boolean }[];
  onAddCustomTag: () => void;
}

export function AddClothModal({ isOpen, onClose, onAdd, tagOptions, onAddCustomTag }: AddClothModalProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [tag, setTag] = useState<string>(tagOptions[0]?.value || 'shirt');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!photo) return;
    onAdd(photo, label, tag);
    handleClose();
  };

  const handleClose = () => {
    setPhoto(null);
    setLabel('');
    setTag(tagOptions[0]?.value || 'shirt');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">Add Cloth</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Photo section */}
          {!photo ? (
            <div className="flex gap-3">
              {/* Camera button */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 aspect-square rounded-xl bg-primary/10 border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-2 hover:bg-primary/20 transition-colors"
              >
                <Camera className="w-10 h-10 text-primary" />
                <span className="text-sm font-medium text-primary">Camera</span>
              </button>
              
              {/* Gallery button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 aspect-square rounded-xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:bg-secondary/80 transition-colors"
              >
                <ImageIcon className="w-10 h-10 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Gallery</span>
              </button>
              
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative aspect-square rounded-xl overflow-hidden">
              <img src={photo} alt="Preview" className="w-full h-full object-cover" />
              <button
                onClick={() => setPhoto(null)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          
          {/* Label input */}
          <Input
            placeholder="Label (optional)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="h-12 rounded-xl text-base"
          />
          
          {/* Tag selection */}
          <div className="flex flex-wrap gap-2">
            {tagOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setTag(option.value)}
                className={cn(
                  "px-3 py-2 rounded-full text-sm font-medium transition-all",
                  tag === option.value
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {option.emoji} {option.label}
              </button>
            ))}
            {/* Add custom tag button */}
            <button
              onClick={onAddCustomTag}
              className="px-3 py-2 rounded-full text-sm font-medium transition-all bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          
          {/* Submit button */}
          <Button
            onClick={handleSubmit}
            disabled={!photo}
            className="w-full h-12 rounded-xl text-base font-semibold"
          >
            Add to Batch
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
