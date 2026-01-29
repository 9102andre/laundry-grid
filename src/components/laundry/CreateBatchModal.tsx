import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export function CreateBatchModal({ isOpen, onClose, onCreate }: CreateBatchModalProps) {
  const [name, setName] = useState(() => `Laundry – ${format(new Date(), 'd MMM')}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim());
    setName(`Laundry – ${format(new Date(), 'd MMM')}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">New Laundry Batch</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Batch name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 rounded-xl text-base"
            autoFocus
          />
          
          <Button
            type="submit"
            disabled={!name.trim()}
            className="w-full h-12 rounded-xl text-base font-semibold"
          >
            Create Batch
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
