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
import { ClothesItem } from '@/hooks/useClothesLibrary';
import { Pencil, Check, X } from 'lucide-react';

interface ManageClothesModalProps {
  isOpen: boolean;
  onClose: () => void;
  clothes: ClothesItem[];
  isLoading: boolean;
  tagOptions: { value: string; label: string; emoji: string; isCustom: boolean }[];
  getTagDisplay: (tagValue: string) => { value: string; label: string; emoji: string };
  onUpdateLabel: (clothId: string, newLabel: string) => Promise<boolean>;
  onUpdateTag: (clothId: string, newTag: string) => Promise<boolean>;
}

export function ManageClothesModal({
  isOpen,
  onClose,
  clothes,
  isLoading,
  tagOptions,
  getTagDisplay,
  onUpdateLabel,
  onUpdateTag,
}: ManageClothesModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editTag, setEditTag] = useState('');
  const [saving, setSaving] = useState(false);

  const startEdit = (item: ClothesItem) => {
    setEditingId(item.id);
    setEditLabel(item.label || '');
    setEditTag(item.tag);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel('');
    setEditTag('');
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    const item = clothes.find(c => c.id === editingId);
    if (item) {
      if (editLabel !== (item.label || '')) {
        await onUpdateLabel(editingId, editLabel);
      }
      if (editTag !== item.tag) {
        await onUpdateTag(editingId, editTag);
      }
    }
    setSaving(false);
    cancelEdit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg mx-4 rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>My Wardrobe</DialogTitle>
          <DialogDescription>
            Edit labels and categories for your saved clothes.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : clothes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No clothes saved yet. Add clothes to a batch to build your wardrobe.
          </p>
        ) : (
          <div className="space-y-2">
            {clothes.map((item) => {
              const isEditing = editingId === item.id;
              const tagDisplay = getTagDisplay(item.tag);

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/50 group"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.photo_url}
                    alt={item.label || 'Cloth'}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />

                  {isEditing ? (
                    <div className="flex-1 space-y-2 min-w-0">
                      <Input
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        placeholder="Label"
                        className="h-9 rounded-lg text-sm"
                        autoFocus
                      />
                      <select
                        value={editTag}
                        onChange={(e) => setEditTag(e.target.value)}
                        className="w-full h-9 rounded-lg border border-input bg-background px-2 text-sm"
                      >
                        {tagOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.emoji} {opt.label}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-8"
                          onClick={cancelEdit}
                          disabled={saving}
                        >
                          <X className="w-3.5 h-3.5 mr-1" /> Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 h-8"
                          onClick={saveEdit}
                          disabled={saving}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> {saving ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.label || 'Unnamed'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tagDisplay.emoji} {tagDisplay.label}
                        </p>
                      </div>
                      <button
                        onClick={() => startEdit(item)}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted transition-all"
                        aria-label={`Edit ${item.label || 'item'}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
