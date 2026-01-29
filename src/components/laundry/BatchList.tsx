import { LaundryBatch } from '@/types/laundry';
import { format } from 'date-fns';
import { ChevronRight, Package, CheckCircle2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BatchListProps {
  batches: LaundryBatch[];
  onSelectBatch: (batchId: string) => void;
  onDeleteBatch: (batchId: string) => void;
}

export function BatchList({ batches, onSelectBatch, onDeleteBatch }: BatchListProps) {
  if (batches.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <span className="text-5xl">🧺</span>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">No Laundry Batches</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Create a new batch to start tracking your laundry clothes with photos
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto px-4 py-2 space-y-3">
      {batches.map(batch => {
        const total = batch.items.length;
        const received = batch.items.filter(i => i.isReceived).length;
        const pending = total - received;
        const isComplete = total > 0 && pending === 0;

        return (
          <div
            key={batch.id}
            className="bg-card rounded-2xl shadow-sm overflow-hidden"
          >
            <button
              onClick={() => onSelectBatch(batch.id)}
              className="w-full p-4 flex items-center gap-4 text-left hover:bg-muted/50 transition-colors"
            >
              {/* Icon */}
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                isComplete ? "bg-success/10" : "bg-primary/10"
              )}>
                {isComplete ? (
                  <CheckCircle2 className="w-6 h-6 text-success" />
                ) : (
                  <Package className="w-6 h-6 text-primary" />
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{batch.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(batch.createdAt, 'MMM d, yyyy')}
                </p>
                
                {/* Stats */}
                <div className="flex gap-4 mt-1">
                  <span className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{total}</span> items
                  </span>
                  {pending > 0 && (
                    <span className="text-xs text-pending font-medium">
                      {pending} pending
                    </span>
                  )}
                  {isComplete && (
                    <span className="text-xs text-success font-medium">
                      All received ✓
                    </span>
                  )}
                </div>
              </div>
              
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            </button>
            
            {/* Delete button */}
            <div className="px-4 pb-3 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this batch?')) {
                    onDeleteBatch(batch.id);
                  }
                }}
                className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
