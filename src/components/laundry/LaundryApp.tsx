import { useState } from 'react';
import { useLaundryStorage } from '@/hooks/useLaundryStorage';
import { useCustomTags } from '@/hooks/useCustomTags';
import { useClothesLibrary } from '@/hooks/useClothesLibrary';
import { useTheme } from '@/hooks/useTheme';
import { BatchList } from './BatchList';
import { BatchView } from './BatchView';
import { CreateBatchModal } from './CreateBatchModal';
import { Plus, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';

export function LaundryApp() {
  const { batches, isLoaded, createBatch, deleteBatch, addClothToBatch, toggleClothReceived, getBatch } = useLaundryStorage();
  const { isLoaded: tagsLoaded, addCustomTag, getAllTagOptions, getTagDisplay } = useCustomTags();
  const { clothes, isLoading: isLibraryLoading, addCloth } = useClothesLibrary();
  const { isDark, toggleTheme } = useTheme();
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (!isLoaded || !tagsLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const selectedBatch = selectedBatchId ? getBatch(selectedBatchId) : null;
  const tagOptions = getAllTagOptions();

  const handleAddCloth = async (photo: string, label: string, tag: string) => {
    if (selectedBatch) {
      // Add to batch (local storage)
      addClothToBatch(selectedBatch.id, { photo, label, tag });
      
      // If it's a new photo (base64), also save to cloud library
      if (photo.startsWith('data:')) {
        const result = await addCloth(photo, label, tag);
        if (result) {
          toast.success('Saved to your wardrobe!');
        }
      }
    }
  };

  // If viewing a specific batch
  if (selectedBatch) {
    return (
      <BatchView
        batch={selectedBatch}
        onBack={() => setSelectedBatchId(null)}
        onToggleReceived={(clothId) => toggleClothReceived(selectedBatch.id, clothId)}
        onAddCloth={handleAddCloth}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        tagOptions={tagOptions}
        onAddCustomTag={addCustomTag}
        getTagDisplay={getTagDisplay}
        clothesLibrary={clothes}
        isLibraryLoading={isLibraryLoading}
      />
    );
  }

  // Main batch list view
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">🧺 Laundry Tracker</h1>
            <p className="text-sm text-muted-foreground">Track your clothes with photos</p>
          </div>
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors touch-target"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Batch List */}
      <BatchList
        batches={batches}
        onSelectBatch={setSelectedBatchId}
        onDeleteBatch={deleteBatch}
      />

      {/* FAB - Create batch */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform touch-target"
        aria-label="Create new batch"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Create Modal */}
      <CreateBatchModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={(name) => {
          const newBatch = createBatch(name);
          setSelectedBatchId(newBatch.id);
        }}
      />
    </div>
  );
}
