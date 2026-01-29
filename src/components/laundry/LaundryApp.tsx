import { useState } from 'react';
import { useLaundryStorage } from '@/hooks/useLaundryStorage';
import { useTheme } from '@/hooks/useTheme';
import { BatchList } from './BatchList';
import { BatchView } from './BatchView';
import { CreateBatchModal } from './CreateBatchModal';
import { ClothTag } from '@/types/laundry';
import { Plus, Moon, Sun } from 'lucide-react';

export function LaundryApp() {
  const { batches, isLoaded, createBatch, deleteBatch, addClothToBatch, toggleClothReceived, getBatch } = useLaundryStorage();
  const { isDark, toggleTheme } = useTheme();
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const selectedBatch = selectedBatchId ? getBatch(selectedBatchId) : null;

  // If viewing a specific batch
  if (selectedBatch) {
    return (
      <BatchView
        batch={selectedBatch}
        onBack={() => setSelectedBatchId(null)}
        onToggleReceived={(clothId) => toggleClothReceived(selectedBatch.id, clothId)}
        onAddCloth={(photo, label, tag) => addClothToBatch(selectedBatch.id, { photo, label, tag })}
        isDark={isDark}
        onToggleTheme={toggleTheme}
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
