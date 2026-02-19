import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CustomTag } from '@/types/laundry';

interface ManageTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customTags: CustomTag[];
  onAddTag: (name: string, emoji: string) => Promise<CustomTag | null>;
  onDeleteTag: (tagId: string) => Promise<void> | void;
}

const EMOJI_OPTIONS = ['🏷️', '👔', '🧥', '🩳', '🧦', '👗', '🩱', '🧣', '🧤', '🎒', '👜', '🧢', '🪭', '🩴', '👟'];

const DEFAULT_TAGS = [
  { emoji: '👕', label: 'Shirt' },
  { emoji: '👖', label: 'Pant' },
  { emoji: '🧴', label: 'Towel' },
  { emoji: '🛏️', label: 'Bedsheet' },
];

export function ManageTagsModal({
  isOpen,
  onClose,
  customTags,
  onAddTag,
  onDeleteTag,
}: ManageTagsModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🏷️');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    await onAddTag(name.trim(), emoji);
    setName('');
    setEmoji('🏷️');
    setIsAdding(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setIsAdding(false);
    setName('');
    setEmoji('🏷️');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md mx-4 rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>
            View default categories and manage your custom ones.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Default tags */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Default</p>
            <div className="space-y-1">
              {DEFAULT_TAGS.map((tag) => (
                <div
                  key={tag.label}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50"
                >
                  <span className="text-lg">{tag.emoji}</span>
                  <span className="text-sm font-medium text-foreground flex-1">{tag.label}</span>
                  <span className="text-xs text-muted-foreground">Built-in</span>
                </div>
              ))}
            </div>
          </div>

          {/* Custom tags */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Custom</p>
            {customTags.length === 0 && !isAdding ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No custom categories yet.
              </p>
            ) : (
              <div className="space-y-1">
                {customTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50 group"
                  >
                    <span className="text-lg">{tag.emoji}</span>
                    <span className="text-sm font-medium text-foreground flex-1">{tag.name}</span>
                    <button
                      onClick={() => onDeleteTag(tag.id)}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 w-8 h-8 rounded-md flex items-center justify-center text-destructive hover:bg-destructive/10 transition-all"
                      aria-label={`Delete ${tag.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add form */}
          {isAdding ? (
            <div className="space-y-3 border border-border rounded-xl p-3">
              <Input
                placeholder="Category name (e.g., Jacket)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl text-sm"
                autoFocus
              />
              <div className="flex flex-wrap gap-1.5">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={cn(
                      'w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all',
                      emoji === e
                        ? 'bg-primary text-primary-foreground scale-110'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setIsAdding(false);
                    setName('');
                    setEmoji('🏷️');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={!name.trim() || isSubmitting}
                  onClick={handleAdd}
                >
                  {isSubmitting ? 'Adding...' : `Add ${emoji} ${name || ''}`}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full rounded-xl"
              onClick={() => setIsAdding(true)}
            >
              + Add Custom Category
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
