import { FilterStatus, ClothTag } from '@/types/laundry';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  activeFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  activeTag: ClothTag | 'all';
  onTagChange: (tag: ClothTag | 'all') => void;
}

const filters: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'received', label: 'Received' },
];

const tags: { value: ClothTag | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'shirt', label: '👕 Shirt' },
  { value: 'pant', label: '👖 Pant' },
  { value: 'towel', label: '🧴 Towel' },
  { value: 'bedsheet', label: '🛏️ Bedsheet' },
  { value: 'other', label: '📦 Other' },
];

export function FilterBar({ activeFilter, onFilterChange, activeTag, onTagChange }: FilterBarProps) {
  return (
    <div className="px-4 py-2 space-y-2">
      {/* Status Filter */}
      <div className="flex gap-2">
        {filters.map(filter => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all touch-target",
              activeFilter === filter.value
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>
      
      {/* Tag Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {tags.map(tag => (
          <button
            key={tag.value}
            onClick={() => onTagChange(tag.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
              activeTag === tag.value
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
}
