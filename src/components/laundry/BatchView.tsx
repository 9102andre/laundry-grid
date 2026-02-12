import { useState } from 'react';
import { LaundryBatch, FilterStatus } from '@/types/laundry';
import { SummaryStats } from './SummaryStats';
import { FilterBar } from './FilterBar';
import { ClothGrid } from './ClothGrid';
import { AddClothModal } from './AddClothModal';
import { AddCustomTagModal } from './AddCustomTagModal';
import { ArrowLeft, Camera, Moon, Sun, Settings } from 'lucide-react';
import { ClothesItem } from '@/hooks/useClothesLibrary';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface BatchViewProps {
  batch: LaundryBatch;
  onBack: () => void;
  onToggleReceived: (clothId: string) => void;
  onAddCloth: (photo: string, label: string, tag: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  tagOptions: { value: string; label: string; emoji: string; isCustom: boolean }[];
  onAddCustomTag: (name: string, emoji: string) => void | Promise<any>;
  getTagDisplay: (tagValue: string) => { value: string; label: string; emoji: string };
  clothesLibrary: ClothesItem[];
  isLibraryLoading: boolean;
  onResetUncheckLimits: () => void;
}

export function BatchView({ 
  batch, 
  onBack, 
  onToggleReceived, 
  onAddCloth, 
  isDark, 
  onToggleTheme,
  tagOptions,
  onAddCustomTag,
  getTagDisplay,
  clothesLibrary,
  isLibraryLoading,
  onResetUncheckLimits,
}: BatchViewProps) {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-card shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <button
              onClick={onBack}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:bg-muted flex items-center justify-center transition-colors touch-target"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            <h1 className="text-lg sm:text-xl font-bold text-foreground truncate px-4 flex-1 text-center">
              {batch.name}
            </h1>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:bg-muted flex items-center justify-center transition-colors touch-target"
                aria-label="Batch settings"
              >
                <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={onToggleTheme}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:bg-muted flex items-center justify-center transition-colors touch-target"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5 sm:w-6 sm:h-6" /> : <Moon className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
          
          {/* Summary */}
          <SummaryStats items={batch.items} />
          
          {/* Filters */}
          <FilterBar
            activeFilter={filter}
            onFilterChange={setFilter}
            activeTag={tagFilter}
            onTagChange={setTagFilter}
            tagOptions={tagOptions}
          />
        </div>
      </header>
      
      {/* Grid with max width for desktop */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <ClothGrid
            items={batch.items}
            filter={filter}
            tagFilter={tagFilter}
            onToggleReceived={onToggleReceived}
            getTagDisplay={getTagDisplay}
          />
        </div>
      </div>
      
      {/* FAB - Add cloth */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform touch-target"
        aria-label="Add cloth"
      >
        <Camera className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>
      
      {/* Add Cloth Modal */}
      <AddClothModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={onAddCloth}
        tagOptions={tagOptions}
        onAddCustomTag={() => {
          setIsAddModalOpen(false);
          setIsAddTagModalOpen(true);
        }}
        clothesLibrary={clothesLibrary}
        isLibraryLoading={isLibraryLoading}
        getTagDisplay={getTagDisplay}
      />
      
      {/* Add Custom Tag Modal */}
      <AddCustomTagModal
        isOpen={isAddTagModalOpen}
        onClose={() => setIsAddTagModalOpen(false)}
        onAdd={(name, emoji) => {
          onAddCustomTag(name, emoji);
          setIsAddTagModalOpen(false);
          setIsAddModalOpen(true);
        }}
      />

      {/* Batch Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Batch Settings</DialogTitle>
            <DialogDescription>
              Manage settings for "{batch.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-border p-4 space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Uncheck Limits</h4>
              <p className="text-xs text-muted-foreground">
                Each item can only be unchecked 3 times. If you've hit the limit, reset all items below.
              </p>
              {batch.items.some(i => i.uncheckCount > 0) && (
                <div className="text-xs text-muted-foreground space-y-1">
                  {batch.items.filter(i => i.uncheckCount > 0).map(i => (
                    <div key={i.id} className="flex justify-between">
                      <span className="truncate">{i.label || 'Unnamed'}</span>
                      <span className={i.uncheckCount >= 3 ? 'text-destructive font-medium' : ''}>
                        {i.uncheckCount}/3 used
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  onResetUncheckLimits();
                  setIsSettingsOpen(false);
                }}
              >
                Reset All Uncheck Limits
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
