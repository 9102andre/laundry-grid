import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Image as ImageIcon, X, Plus, Pencil, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClothesItem } from '@/hooks/useClothesLibrary';

interface AddClothModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (photo: string, label: string, tag: string) => void;
  tagOptions: { value: string; label: string; emoji: string; isCustom: boolean }[];
  onAddCustomTag: () => void;
  clothesLibrary: ClothesItem[];
  isLibraryLoading: boolean;
  getTagDisplay: (tagValue: string) => { value: string; label: string; emoji: string };
}

type Mode = 'select' | 'new' | 'edit-tag';

export function AddClothModal({ 
  isOpen, 
  onClose, 
  onAdd, 
  tagOptions, 
  onAddCustomTag,
  clothesLibrary,
  isLibraryLoading,
  getTagDisplay,
}: AddClothModalProps) {
  const [mode, setMode] = useState<Mode>('select');
  const [selectedCloth, setSelectedCloth] = useState<ClothesItem | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [tag, setTag] = useState<string>(tagOptions[0]?.value || 'shirt');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode('select');
      setSelectedCloth(null);
      setPhoto(null);
      setLabel('');
      setTag(tagOptions[0]?.value || 'shirt');
      setIsSubmitting(false);
    }
  }, [isOpen, tagOptions]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
        setMode('new');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectFromLibrary = (cloth: ClothesItem) => {
    setSelectedCloth(cloth);
    const tagDisplay = getTagDisplay(cloth.tag);
    setTag(cloth.tag);
    setLabel(cloth.label || '');
  };

  const handleEditTag = () => {
    setMode('edit-tag');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    if (selectedCloth) {
      // Using existing cloth from library
      onAdd(selectedCloth.photo_url, selectedCloth.label || '', tag);
    } else if (photo) {
      // New cloth
      onAdd(photo, label, tag);
    }
    
    handleClose();
  };

  const handleClose = () => {
    setMode('select');
    setSelectedCloth(null);
    setPhoto(null);
    setLabel('');
    setTag(tagOptions[0]?.value || 'shirt');
    setIsSubmitting(false);
    onClose();
  };

  const handleBack = () => {
    if (mode === 'edit-tag') {
      setMode('select');
    } else if (mode === 'new') {
      setPhoto(null);
      setMode('select');
    } else {
      setSelectedCloth(null);
    }
  };

  const selectedTagDisplay = getTagDisplay(tag);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md mx-4 rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {mode === 'edit-tag' ? 'Change Category' : 'Add Cloth'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Mode: Edit Tag */}
          {mode === 'edit-tag' && (
            <>
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
                <button
                  onClick={onAddCustomTag}
                  className="px-3 py-2 rounded-full text-sm font-medium transition-all bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleBack} className="flex-1 h-12 rounded-xl">
                  Back
                </Button>
                <Button onClick={() => setMode('select')} className="flex-1 h-12 rounded-xl">
                  Done
                </Button>
              </div>
            </>
          )}

          {/* Mode: New photo */}
          {mode === 'new' && photo && (
            <>
              <div className="relative aspect-square rounded-xl overflow-hidden">
                <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={handleBack}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <Input
                placeholder="Label (optional)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
              
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
                <button
                  onClick={onAddCustomTag}
                  className="px-3 py-2 rounded-full text-sm font-medium transition-all bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl text-base font-semibold"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add to Batch'}
              </Button>
            </>
          )}

          {/* Mode: Select from library or add new */}
          {mode === 'select' && (
            <>
              {/* Selected cloth preview */}
              {selectedCloth && (
                <div className="space-y-3">
                  <div className="relative aspect-square rounded-xl overflow-hidden">
                    <img 
                      src={selectedCloth.photo_url} 
                      alt={selectedCloth.label || 'Selected cloth'} 
                      className="w-full h-full object-cover" 
                    />
                    <button
                      onClick={() => setSelectedCloth(null)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Category display with edit button */}
                  <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{selectedTagDisplay.emoji}</span>
                      <span className="font-medium">{selectedTagDisplay.label}</span>
                    </div>
                    <button
                      onClick={handleEditTag}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-background text-sm font-medium hover:bg-background/80 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                  
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-xl text-base font-semibold"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add to Batch'}
                  </Button>
                </div>
              )}

              {/* Library section - show when no cloth selected */}
              {!selectedCloth && (
                <>
                  {/* Your Clothes section */}
                  {clothesLibrary.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Your Clothes</h3>
                      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                        {clothesLibrary.map((cloth) => {
                          const clothTag = getTagDisplay(cloth.tag);
                          return (
                            <button
                              key={cloth.id}
                              onClick={() => handleSelectFromLibrary(cloth)}
                              className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden ring-2 ring-transparent hover:ring-primary transition-all"
                            >
                              <img
                                src={cloth.photo_url}
                                alt={cloth.label || 'Cloth'}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                                <span className="text-xs text-white">{clothTag.emoji}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {isLibraryLoading && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  )}

                  {/* Camera and Gallery options */}
                  <div className="space-y-2">
                    {clothesLibrary.length > 0 && (
                      <h3 className="text-sm font-medium text-muted-foreground">Or Add New</h3>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex-1 aspect-square rounded-xl bg-primary/10 border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-2 hover:bg-primary/20 transition-colors"
                      >
                        <Camera className="w-10 h-10 text-primary" />
                        <span className="text-sm font-medium text-primary">Camera</span>
                      </button>
                      
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
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
