import { useState, useRef } from 'react';
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
import { Pencil, Check, X, ImagePlus, Trash2, Plus, Camera } from 'lucide-react';
import { toast } from 'sonner';

interface ManageClothesModalProps {
  isOpen: boolean;
  onClose: () => void;
  clothes: ClothesItem[];
  isLoading: boolean;
  tagOptions: { value: string; label: string; emoji: string; isCustom: boolean }[];
  getTagDisplay: (tagValue: string) => { value: string; label: string; emoji: string };
  onUpdateLabel: (clothId: string, newLabel: string) => Promise<boolean>;
  onUpdateTag: (clothId: string, newTag: string) => Promise<boolean>;
  onUpdatePhoto: (clothId: string, photoBase64: string) => Promise<boolean>;
  onDeleteCloth: (clothId: string) => Promise<boolean>;
  onAddCloth: (photoBase64: string, label: string, tag: string) => Promise<any>;
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
  onUpdatePhoto,
  onDeleteCloth,
  onAddCloth,
}: ManageClothesModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editTag, setEditTag] = useState('');
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
  const [editPhotoBase64, setEditPhotoBase64] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add new cloth state
  const [isAdding, setIsAdding] = useState(false);
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [newTag, setNewTag] = useState('shirt');
  const [addingSaving, setAddingSaving] = useState(false);
  const addFileInputRef = useRef<HTMLInputElement>(null);

  const startEdit = (item: ClothesItem) => {
    setEditingId(item.id);
    setEditLabel(item.label || '');
    setEditTag(item.tag);
    setEditPhotoPreview(null);
    setEditPhotoBase64(null);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel('');
    setEditTag('');
    setEditPhotoPreview(null);
    setEditPhotoBase64(null);
  };

  const handlePhotoSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setEditPhotoPreview(result);
      setEditPhotoBase64(result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    const item = clothes.find(c => c.id === editingId);
    if (item) {
      if (editPhotoBase64) {
        const ok = await onUpdatePhoto(editingId, editPhotoBase64);
        if (!ok) { toast.error('Failed to update photo'); setSaving(false); return; }
      }
      if (editLabel !== (item.label || '')) {
        await onUpdateLabel(editingId, editLabel);
      }
      if (editTag !== item.tag) {
        await onUpdateTag(editingId, editTag);
      }
      toast.success('Updated!');
    }
    setSaving(false);
    cancelEdit();
  };

  const handleDelete = async (clothId: string) => {
    setDeletingId(clothId);
    const ok = await onDeleteCloth(clothId);
    if (ok) {
      toast.success('Removed from wardrobe');
    } else {
      toast.error('Failed to delete');
    }
    setDeletingId(null);
  };

  // Add new cloth handlers
  const handleAddPhotoSelect = () => {
    addFileInputRef.current?.click();
  };

  const handleAddFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setNewPhoto(null);
    setNewLabel('');
    setNewTag('shirt');
  };

  const saveNewCloth = async () => {
    if (!newPhoto) {
      toast.error('Please select a photo');
      return;
    }
    setAddingSaving(true);
    const result = await onAddCloth(newPhoto, newLabel, newTag);
    if (result) {
      toast.success('Added to wardrobe!');
      cancelAdd();
    } else {
      toast.error('Failed to add');
    }
    setAddingSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg mx-4 rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>My Wardrobe</DialogTitle>
          <DialogDescription>
            Add, edit, or remove clothes from your wardrobe.
          </DialogDescription>
        </DialogHeader>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <input ref={addFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAddFileChange} />

        {/* Add New Cloth Section */}
        {isAdding ? (
          <div className="border border-dashed border-primary/40 rounded-xl p-3 space-y-3 bg-primary/5">
            <p className="text-sm font-medium text-foreground">Add New Cloth</p>
            <div className="flex items-center gap-3">
              {newPhoto ? (
                <img src={newPhoto} alt="New" className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-border" />
              ) : (
                <button
                  onClick={handleAddPhotoSelect}
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center flex-shrink-0 hover:border-primary/50 transition-colors"
                >
                  <Camera className="w-6 h-6 text-muted-foreground" />
                </button>
              )}
              {newPhoto && (
                <Button type="button" size="sm" variant="outline" className="h-9 gap-1.5" onClick={handleAddPhotoSelect}>
                  <ImagePlus className="w-4 h-4" /> Change
                </Button>
              )}
            </div>
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Label (e.g. Blue Shirt)"
              className="h-9 rounded-lg text-sm"
            />
            <select
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-background px-2 text-sm"
            >
              {tagOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.emoji} {opt.label}</option>
              ))}
            </select>
            <div className="flex gap-1.5">
              <Button size="sm" variant="outline" className="flex-1 h-8" onClick={cancelAdd} disabled={addingSaving}>
                <X className="w-3.5 h-3.5 mr-1" /> Cancel
              </Button>
              <Button size="sm" className="flex-1 h-8" onClick={saveNewCloth} disabled={addingSaving}>
                <Check className="w-3.5 h-3.5 mr-1" /> {addingSaving ? 'Saving...' : 'Add'}
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="w-full gap-2" onClick={() => { cancelEdit(); setIsAdding(true); }}>
            <Plus className="w-4 h-4" /> Add New Cloth
          </Button>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : clothes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No clothes saved yet. Add clothes above or from a batch.
          </p>
        ) : (
          <div className="space-y-2">
            {clothes.map((item) => {
              const isEditing = editingId === item.id;
              const tagDisplay = getTagDisplay(item.tag);
              const isDeleting = deletingId === item.id;

              return (
                <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/50 group">
                  {isEditing ? (
                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="flex items-center gap-3">
                        <img
                          src={editPhotoPreview || item.photo_url}
                          alt={item.label || 'Cloth'}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-border"
                        />
                        <Button type="button" size="sm" variant="outline" className="h-9 gap-1.5" onClick={handlePhotoSelect} disabled={saving}>
                          <ImagePlus className="w-4 h-4" /> Change Photo
                        </Button>
                      </div>
                      <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} placeholder="Label" className="h-9 rounded-lg text-sm" />
                      <select value={editTag} onChange={(e) => setEditTag(e.target.value)} className="w-full h-9 rounded-lg border border-input bg-background px-2 text-sm">
                        {tagOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.emoji} {opt.label}</option>
                        ))}
                      </select>
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" className="flex-1 h-8" onClick={cancelEdit} disabled={saving}>
                          <X className="w-3.5 h-3.5 mr-1" /> Cancel
                        </Button>
                        <Button size="sm" className="flex-1 h-8" onClick={saveEdit} disabled={saving}>
                          <Check className="w-3.5 h-3.5 mr-1" /> {saving ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <img src={item.photo_url} alt={item.label || 'Cloth'} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.label || 'Unnamed'}</p>
                        <p className="text-xs text-muted-foreground">{tagDisplay.emoji} {tagDisplay.label}</p>
                      </div>
                      <button
                        onClick={() => startEdit(item)}
                        className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted transition-all sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                        aria-label={`Edit ${item.label || 'item'}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isDeleting}
                        className="w-8 h-8 rounded-md flex items-center justify-center text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                        aria-label={`Delete ${item.label || 'item'}`}
                      >
                        <Trash2 className="w-4 h-4" />
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
