import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AddCustomTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, emoji: string) => void;
}

const EMOJI_OPTIONS = ['🏷️', '👔', '🧥', '🩳', '🧦', '👗', '🩱', '🧣', '🧤', '🎒', '👜', '🧢', '🪭', '🩴', '👟'];

export function AddCustomTagModal({ isOpen, onClose, onAdd }: AddCustomTagModalProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🏷️');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), emoji);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setEmoji('🏷️');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">Add Custom Category</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Name input */}
          <Input
            placeholder="Category name (e.g., Jacket)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 rounded-xl text-base"
            autoFocus
          />
          
          {/* Emoji selection */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Choose an icon</p>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={cn(
                    "w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all",
                    emoji === e
                      ? "bg-primary text-primary-foreground scale-110"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          
          {/* Preview */}
          <div className="flex items-center justify-center p-3 bg-accent/20 rounded-xl">
            <span className="text-lg font-medium">
              {emoji} {name || 'Category name'}
            </span>
          </div>
          
          {/* Submit button */}
          <Button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full h-12 rounded-xl text-base font-semibold"
          >
            Add Category
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
