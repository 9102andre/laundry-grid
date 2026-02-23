import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Image as ImageIcon, X, Plus, Pencil, Loader2, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClothesItem } from '@/hooks/useClothesLibrary';

interface AddClothModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (photo: string, label: string, tag: string) => void | Promise<any>;
  tagOptions: { value: string; label: string; emoji: string; isCustom: boolean }[];
  onAddCustomTag: () => void;
  clothesLibrary: ClothesItem[];
  isLibraryLoading: boolean;
  getTagDisplay: (tagValue: string) => { value: string; label: string; emoji: string };
}

interface PendingPhoto {
  photo: string;
  label: string;
  tag: string;
}

type Mode = 'select' | 'new' | 'edit-tag' | 'multi-review';

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
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMode('select');
      setSelectedCloth(null);
      setPhoto(null);
      setLabel('');
      setTag(tagOptions[0]?.value || 'shirt');
      setIsSubmitting(false);
      setPendingPhotos([]);
      setCurrentReviewIndex(0);
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

  const handleMultiFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const defaultTag = tagOptions[0]?.value || 'shirt';
    const fileArray = Array.from(files);
    
    const readFile = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    };

    try {
      const results: PendingPhoto[] = [];
      for (const file of fileArray) {
        const dataUrl = await readFile(file);
        results.push({ photo: dataUrl, label: '', tag: defaultTag });
      }
      setPendingPhotos(results);
      setCurrentReviewIndex(0);
      setLabel('');
      setTag(defaultTag);
      setMode('multi-review');
    } catch (err) {
      console.error('Failed to read files:', err);
    }
    
    e.target.value = '';
  };

  const handleSelectFromLibrary = (cloth: ClothesItem) => {
    setSelectedCloth(cloth);
    setTag(cloth.tag);
    setLabel(cloth.label || '');
  };

  const handleEditTag = () => {
    setMode('edit-tag');
  };

  const saveCurrentReview = () => {
    setPendingPhotos(prev => prev.map((p, i) =>
      i === currentReviewIndex ? { ...p, label, tag } : p
    ));
  };

  const handleReviewNext = () => {
    saveCurrentReview();
    const next = currentReviewIndex + 1;
    setCurrentReviewIndex(next);
    setLabel(pendingPhotos[next]?.label || '');
    setTag(pendingPhotos[next]?.tag || tagOptions[0]?.value || 'shirt');
  };

  const handleReviewPrev = () => {
    saveCurrentReview();
    const prev = currentReviewIndex - 1;
    setCurrentReviewIndex(prev);
    setLabel(pendingPhotos[prev]?.label || '');
    setTag(pendingPhotos[prev]?.tag || tagOptions[0]?.value || 'shirt');
  };

  const handleRemoveFromPending = () => {
    const updated = pendingPhotos.filter((_, i) => i !== currentReviewIndex);
    if (updated.length === 0) {
      setPendingPhotos([]);
      setMode('select');
      return;
    }
    const newIndex = Math.min(currentReviewIndex, updated.length - 1);
    setPendingPhotos(updated);
    setCurrentReviewIndex(newIndex);
    setLabel(updated[newIndex]?.label || '');
    setTag(updated[newIndex]?.tag || tagOptions[0]?.value || 'shirt');
  };

  const handleSubmitAll = async () => {
    setIsSubmitting(true);
    const final = pendingPhotos.map((p, i) =>
      i === currentReviewIndex ? { ...p, label, tag } : p
    );
    for (const item of final) {
      await onAdd(item.photo, item.label, item.tag);
    }
    handleClose();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (selectedCloth) {
      await onAdd(selectedCloth.photo_url, label, tag);
    } else if (photo) {
      await onAdd(photo, label, tag);
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
    setPendingPhotos([]);
    setCurrentReviewIndex(0);
    onClose();
  };

  const handleBack = () => {
    if (mode === 'edit-tag') {
      if (pendingPhotos.length > 0) setMode('multi-review');
      else setMode('select');
    } else if (mode === 'new') {
      setPhoto(null);
      setMode('select');
    } else if (mode === 'multi-review') {
      setPendingPhotos([]);
      setMode('select');
    } else {
      setSelectedCloth(null);
    }
  };

  const selectedTagDisplay = getTagDisplay(tag);

  const tagSelector = (
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
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg mx-4 rounded-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-lg sm:text-xl">
            {mode === 'edit-tag' ? 'Change Category' : mode === 'multi-review' ? 'Review Photos' : 'Add Cloth'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Mode: Edit Tag */}
          {mode === 'edit-tag' && (
            <>
              {tagSelector}
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleBack} className="flex-1 h-12 rounded-xl">
                  Back
                </Button>
                <Button onClick={() => {
                  if (pendingPhotos.length > 0) setMode('multi-review');
                  else setMode('select');
                }} className="flex-1 h-12 rounded-xl">
                  Done
                </Button>
              </div>
            </>
          )}

          {/* Mode: New single photo */}
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
              {tagSelector}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl text-base font-semibold"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add to Batch'}
              </Button>
            </>
          )}

          {/* Mode: Multi-review */}
          {mode === 'multi-review' && pendingPhotos.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={handleBack} className="text-sm">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <span className="text-sm font-medium text-muted-foreground">
                  {currentReviewIndex + 1} / {pendingPhotos.length}
                </span>
                <Button variant="ghost" size="sm" onClick={handleRemoveFromPending} className="text-sm text-destructive hover:text-destructive">
                  <X className="w-4 h-4 mr-1" /> Remove
                </Button>
              </div>

              <div className="relative aspect-square rounded-xl overflow-hidden">
                <img src={pendingPhotos[currentReviewIndex].photo} alt="Review" className="w-full h-full object-cover" />
              </div>
              
              <Input
                placeholder="Label (optional)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
              
              {tagSelector}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleReviewPrev}
                  disabled={currentReviewIndex === 0}
                  className="flex-1 h-12 rounded-xl"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" /> Prev
                </Button>
                {currentReviewIndex < pendingPhotos.length - 1 ? (
                  <Button onClick={handleReviewNext} className="flex-1 h-12 rounded-xl">
                    Next <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmitAll}
                    disabled={isSubmitting}
                    className="flex-1 h-12 rounded-xl text-base font-semibold"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : `Add All (${pendingPhotos.length})`}
                  </Button>
                )}
              </div>
            </>
          )}

          {/* Mode: Select from library or add new */}
          {mode === 'select' && (
            <>
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
                  <Input
                    placeholder="Label (optional)"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="h-12 rounded-xl text-base"
                  />
                  <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{selectedTagDisplay.emoji}</span>
                      <span className="font-medium capitalize">{selectedTagDisplay.label}</span>
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

              {!selectedCloth && (
                <>
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

                  <div className="space-y-2">
                    {clothesLibrary.length > 0 && (
                      <h3 className="text-sm font-medium text-muted-foreground">Or Add New</h3>
                    )}
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                      <button
                        onClick={() => cameraInputRef.current?.click()}
                        className="aspect-square rounded-xl bg-primary/10 border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-1.5 hover:bg-primary/20 transition-colors"
                      >
                        <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                        <span className="text-xs sm:text-sm font-medium text-primary">Camera</span>
                      </button>
                      
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 hover:bg-secondary/80 transition-colors"
                      >
                        <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">Single</span>
                      </button>

                      <button
                        onClick={() => multiFileInputRef.current?.click()}
                        className="aspect-square rounded-xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 hover:bg-secondary/80 transition-colors"
                      >
                        <Images className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">Multiple</span>
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
                      <input
                        ref={multiFileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleMultiFileChange}
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