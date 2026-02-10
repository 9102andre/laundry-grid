import { Database, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StorageIndicatorProps {
  totalItems: number;
  totalBatches: number;
  maxItems?: number;
}

export function StorageIndicator({ totalItems, totalBatches, maxItems = 500 }: StorageIndicatorProps) {
  const usagePercent = Math.min((totalItems / maxItems) * 100, 100);
  const isNearFull = usagePercent >= 80;
  const isFull = usagePercent >= 100;

  return (
    <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 py-2">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Database className={cn(
          "w-4 h-4 shrink-0",
          isFull ? "text-destructive" : isNearFull ? "text-pending" : "text-muted-foreground"
        )} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs text-muted-foreground truncate">
              {totalBatches} batch{totalBatches !== 1 ? 'es' : ''} · {totalItems} item{totalItems !== 1 ? 's' : ''}
            </span>
            <span className={cn(
              "text-xs font-medium shrink-0",
              isFull ? "text-destructive" : isNearFull ? "text-pending" : "text-muted-foreground"
            )}>
              {Math.round(usagePercent)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isFull ? "bg-destructive" : isNearFull ? "bg-pending" : "bg-primary"
              )}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>
        {(isNearFull || isFull) && (
          <AlertTriangle className={cn(
            "w-4 h-4 shrink-0",
            isFull ? "text-destructive" : "text-pending"
          )} />
        )}
      </div>
    </div>
  );
}
