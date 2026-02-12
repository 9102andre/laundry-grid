import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCloudLaundryStorage } from '@/hooks/useCloudLaundryStorage';
import { useCustomTags } from '@/hooks/useCustomTags';
import { useClothesLibrary } from '@/hooks/useClothesLibrary';
import { useTheme } from '@/hooks/useTheme';
import { BatchList } from './BatchList';
import { BatchView } from './BatchView';
import { CreateBatchModal } from './CreateBatchModal';
import { StorageIndicator } from './StorageIndicator';
import { AuthPage } from '@/pages/Auth';
import { Plus, Moon, Sun, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function LaundryApp() {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { batches, isLoaded, createBatch, deleteBatch, addClothToBatch, toggleClothReceived, resetUncheckCount, getBatch, totalItems, totalBatches } = useCloudLaundryStorage(user?.id);
  const { isLoaded: tagsLoaded, addCustomTag, getAllTagOptions, getTagDisplay } = useCustomTags(user?.id);
  const { clothes, isLoading: isLibraryLoading, addCloth } = useClothesLibrary(user?.id);
  const { isDark, toggleTheme } = useTheme();
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Auth loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <AuthPage onAuthenticated={() => {}} />;
  }

  // Data loading
  if (!isLoaded || !tagsLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Syncing from cloud...</p>
        </div>
      </div>
    );
  }

  const selectedBatch = selectedBatchId ? getBatch(selectedBatchId) : null;
  const tagOptions = getAllTagOptions();

  const handleAddCloth = async (photo: string, label: string, tag: string) => {
    if (selectedBatch) {
      await addClothToBatch(selectedBatch.id, { photo, label, tag });
      
      if (photo.startsWith('data:')) {
        const result = await addCloth(photo, label, tag);
        if (result) {
          toast.success('Saved to your wardrobe!');
        }
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
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
        onResetUncheckLimits={() => resetUncheckCount(selectedBatch.id)}
      />
    );
  }

  // Main batch list view
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">🧺 Laundry Tracker</h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate max-w-[200px] sm:max-w-none">
              {user.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:bg-muted flex items-center justify-center transition-colors touch-target"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5 sm:w-6 sm:h-6" /> : <Moon className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
            <button
              onClick={handleSignOut}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:bg-muted flex items-center justify-center transition-colors touch-target"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Storage Indicator */}
        <div className="max-w-4xl mx-auto">
          <StorageIndicator totalItems={totalItems} totalBatches={totalBatches} />
        </div>
      </header>

      {/* Batch List with max width for desktop */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <BatchList
            batches={batches}
            onSelectBatch={setSelectedBatchId}
            onDeleteBatch={deleteBatch}
          />
        </div>
      </div>

      {/* FAB - Create batch */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform touch-target"
        aria-label="Create new batch"
      >
        <Plus className="w-7 h-7 sm:w-8 sm:h-8" />
      </button>

      {/* Create Modal */}
      <CreateBatchModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={async (name) => {
          const newBatch = await createBatch(name);
          if (newBatch) setSelectedBatchId(newBatch.id);
        }}
      />
    </div>
  );
}
