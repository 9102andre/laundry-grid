import { ClothItem } from '@/types/laundry';
import { Package, CheckCircle2, Clock } from 'lucide-react';

interface SummaryStatsProps {
  items: ClothItem[];
}

export function SummaryStats({ items }: SummaryStatsProps) {
  const total = items.length;
  const received = items.filter(item => item.isReceived).length;
  const pending = total - received;

  return (
    <div className="grid grid-cols-3 gap-3 px-4 py-3">
      <div className="stat-card">
        <Package className="w-5 h-5 text-primary mb-1" />
        <span className="text-2xl font-bold text-foreground">{total}</span>
        <span className="text-xs text-muted-foreground">Given</span>
      </div>
      <div className="stat-card">
        <CheckCircle2 className="w-5 h-5 text-success mb-1" />
        <span className="text-2xl font-bold text-success">{received}</span>
        <span className="text-xs text-muted-foreground">Received</span>
      </div>
      <div className="stat-card">
        <Clock className="w-5 h-5 text-pending mb-1" />
        <span className="text-2xl font-bold text-pending">{pending}</span>
        <span className="text-xs text-muted-foreground">Pending</span>
      </div>
    </div>
  );
}
