import { ClothItem, FilterStatus, ClothTag } from '@/types/laundry';
import { ClothGridItem } from './ClothGridItem';
import { useMemo } from 'react';

interface ClothGridProps {
  items: ClothItem[];
  filter: FilterStatus;
  tagFilter: ClothTag | 'all';
  onToggleReceived: (clothId: string) => void;
}

export function ClothGrid({ items, filter, tagFilter, onToggleReceived }: ClothGridProps) {
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Status filter
      if (filter === 'pending' && item.isReceived) return false;
      if (filter === 'received' && !item.isReceived) return false;
      
      // Tag filter
      if (tagFilter !== 'all' && item.tag !== tagFilter) return false;
      
      return true;
    });
  }, [items, filter, tagFilter]);

  if (filteredItems.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-4xl">🧺</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">No items found</h3>
        <p className="text-sm text-muted-foreground">
          {filter === 'all' 
            ? "Add clothes to this batch using the camera button"
            : filter === 'pending'
            ? "All clothes have been received!"
            : "No received clothes yet"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto px-4 py-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filteredItems.map(item => (
          <ClothGridItem
            key={item.id}
            item={item}
            onToggle={() => onToggleReceived(item.id)}
          />
        ))}
      </div>
    </div>
  );
}
