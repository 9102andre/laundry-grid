import { useState } from 'react';
import { LaundryBatch, FilterStatus } from '@/types/laundry';
import { SummaryStats } from './SummaryStats';
import { FilterBar } from './FilterBar';
import { ClothGrid } from './ClothGrid';
import { AddClothModal } from './AddClothModal';
import { AddCustomTagModal } from './AddCustomTagModal';
import { ArrowLeft, Camera, Moon, Sun } from 'lucide-react';

interface BatchViewProps {
  batch: LaundryBatch;
  onBack: () => void;
  onToggleReceived: (clothId: string) => void;
  onAddCloth: (photo: string, label: string, tag: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  tagOptions: { value: string; label: string; emoji: string; isCustom: boolean }[];
  onAddCustomTag: (name: string, emoji: string) => void;
  getTagDisplay: (tagValue: string) => { value: string; label: string; emoji: string };
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
}: BatchViewProps) {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-card shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors touch-target"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <h1 className="text-lg font-bold text-foreground truncate px-4 flex-1 text-center">
            {batch.name}
          </h1>
          
          <button
            onClick={onToggleTheme}
            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors touch-target"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
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
      </header>
      
      {/* Grid */}
      <ClothGrid
        items={batch.items}
        filter={filter}
        tagFilter={tagFilter}
        onToggleReceived={onToggleReceived}
        getTagDisplay={getTagDisplay}
      />
      
      {/* FAB - Add cloth */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform touch-target"
        aria-label="Add cloth"
      >
        <Camera className="w-7 h-7" />
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
    </div>
  );
}
