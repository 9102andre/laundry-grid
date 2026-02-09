import { useState, useEffect, useCallback, useRef } from 'react';
import { LaundryBatch, ClothItem } from '@/types/laundry';
import { toast } from 'sonner';

const STORAGE_KEY = 'laundry-batches';

export function useLaundryStorage() {
  const [batches, setBatches] = useState<LaundryBatch[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const isFirstLoad = useRef(true);
  const previousBatchCount = useRef(0);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const hydratedBatches = parsed.map((batch: any) => ({
          ...batch,
          createdAt: new Date(batch.createdAt),
          items: batch.items.map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt),
            receivedAt: item.receivedAt ? new Date(item.receivedAt) : undefined,
          })),
        }));
        setBatches(hydratedBatches);
        previousBatchCount.current = hydratedBatches.length;
        
        if (hydratedBatches.length > 0) {
          toast.success(`📦 Loaded ${hydratedBatches.length} saved batch${hydratedBatches.length > 1 ? 'es' : ''} from device`, {
            duration: 2000,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load batches from storage:', error);
      toast.error('Failed to load saved data');
    }
    setIsLoaded(true);
    isFirstLoad.current = false;
  }, []);

  // Save to localStorage whenever batches change
  useEffect(() => {
    if (isLoaded && !isFirstLoad.current) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
        
        // Show toast only when items are added (not on every change)
        const totalItems = batches.reduce((sum, b) => sum + b.items.length, 0);
        if (totalItems > 0 || batches.length !== previousBatchCount.current) {
          toast.success('💾 Saved to device', { duration: 1500 });
        }
        previousBatchCount.current = batches.length;
      } catch (error) {
        console.error('Failed to save batches to storage:', error);
        toast.error('Failed to save data to device');
      }
    }
  }, [batches, isLoaded]);

  const createBatch = useCallback((name: string): LaundryBatch => {
    const newBatch: LaundryBatch = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date(),
      items: [],
    };
    setBatches(prev => [newBatch, ...prev]);
    return newBatch;
  }, []);

  const deleteBatch = useCallback((batchId: string) => {
    setBatches(prev => prev.filter(b => b.id !== batchId));
  }, []);

  const addClothToBatch = useCallback((batchId: string, cloth: Omit<ClothItem, 'id' | 'addedAt' | 'isReceived'>) => {
    const newCloth: ClothItem = {
      ...cloth,
      id: crypto.randomUUID(),
      addedAt: new Date(),
      isReceived: false,
    };
    setBatches(prev =>
      prev.map(batch =>
        batch.id === batchId
          ? { ...batch, items: [...batch.items, newCloth] }
          : batch
      )
    );
    return newCloth;
  }, []);

  const toggleClothReceived = useCallback((batchId: string, clothId: string) => {
    setBatches(prev =>
      prev.map(batch =>
        batch.id === batchId
          ? {
              ...batch,
              items: batch.items.map(item =>
                item.id === clothId
                  ? {
                      ...item,
                      isReceived: !item.isReceived,
                      receivedAt: !item.isReceived ? new Date() : undefined,
                    }
                  : item
              ),
            }
          : batch
      )
    );
  }, []);

  const removeClothFromBatch = useCallback((batchId: string, clothId: string) => {
    setBatches(prev =>
      prev.map(batch =>
        batch.id === batchId
          ? { ...batch, items: batch.items.filter(item => item.id !== clothId) }
          : batch
      )
    );
  }, []);

  const getBatch = useCallback((batchId: string) => {
    return batches.find(b => b.id === batchId);
  }, [batches]);

  return {
    batches,
    isLoaded,
    createBatch,
    deleteBatch,
    addClothToBatch,
    toggleClothReceived,
    removeClothFromBatch,
    getBatch,
  };
}
