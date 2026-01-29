import { ClothItem, ClothTag } from '@/types/laundry';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClothGridItemProps {
  item: ClothItem;
  onToggle: () => void;
}

const tagEmojis: Record<ClothTag, string> = {
  shirt: '👕',
  pant: '👖',
  towel: '🧴',
  bedsheet: '🛏️',
  other: '📦',
};

export function ClothGridItem({ item, onToggle }: ClothGridItemProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden bg-card shadow-sm transition-all duration-300",
        item.isReceived && "cloth-received"
      )}
    >
      {/* Photo */}
      <div className="aspect-square relative">
        <img
          src={item.photo}
          alt={item.label || 'Cloth item'}
          className="w-full h-full object-cover"
        />
        
        {/* Received overlay */}
        {item.isReceived && (
          <div className="absolute inset-0 bg-success/20 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center">
              <Check className="w-8 h-8 text-success-foreground" strokeWidth={3} />
            </div>
          </div>
        )}
        
        {/* Tag badge */}
        <span className="absolute top-2 left-2 text-lg">
          {tagEmojis[item.tag]}
        </span>
      </div>
      
      {/* Bottom section */}
      <div className="p-3 flex items-center justify-between gap-2">
        {/* Label */}
        <span className="text-sm font-medium text-foreground truncate flex-1">
          {item.label || 'Unnamed'}
        </span>
        
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={cn(
            "w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all touch-target",
            item.isReceived
              ? "bg-success border-success"
              : "border-muted-foreground/40 hover:border-primary"
          )}
          aria-label={item.isReceived ? 'Mark as pending' : 'Mark as received'}
        >
          {item.isReceived && (
            <Check className="w-5 h-5 text-success-foreground" strokeWidth={3} />
          )}
        </button>
      </div>
    </div>
  );
}
