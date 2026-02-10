import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LaundryBatch, ClothItem } from '@/types/laundry';
import { toast } from 'sonner';

export function useCloudLaundryStorage(userId: string | undefined) {
  const [batches, setBatches] = useState<LaundryBatch[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch batches + items from cloud
  const fetchBatches = useCallback(async () => {
    if (!userId) return;
    try {
      const { data: batchRows, error: batchErr } = await supabase
        .from('laundry_batches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (batchErr) throw batchErr;

      const { data: itemRows, error: itemErr } = await supabase
        .from('batch_items')
        .select('*')
        .eq('user_id', userId);

      if (itemErr) throw itemErr;

      const hydrated: LaundryBatch[] = (batchRows || []).map(b => ({
        id: b.id,
        name: b.name,
        createdAt: new Date(b.created_at),
        items: (itemRows || [])
          .filter(i => i.batch_id === b.id)
          .map(i => ({
            id: i.id,
            photo: i.photo,
            label: i.label || '',
            tag: i.tag,
            isReceived: i.is_received,
            addedAt: new Date(i.created_at),
            receivedAt: undefined,
          })),
      }));

      setBatches(hydrated);
      if (hydrated.length > 0) {
        setTimeout(() => {
          toast.success(`📦 Loaded ${hydrated.length} batch${hydrated.length > 1 ? 'es' : ''} from cloud`, { duration: 2000 });
        }, 100);
      }
    } catch (error) {
      console.error('Failed to fetch batches:', error);
      toast.error('Failed to load batches from cloud');
    } finally {
      setIsLoaded(true);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchBatches();
  }, [userId, fetchBatches]);

  const createBatch = useCallback(async (name: string): Promise<LaundryBatch | null> => {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('laundry_batches')
        .insert({ name, user_id: userId })
        .select()
        .single();

      if (error) throw error;

      const newBatch: LaundryBatch = {
        id: data.id,
        name: data.name,
        createdAt: new Date(data.created_at),
        items: [],
      };
      setBatches(prev => [newBatch, ...prev]);
      return newBatch;
    } catch (error) {
      console.error('Failed to create batch:', error);
      toast.error('Failed to create batch');
      return null;
    }
  }, [userId]);

  const deleteBatch = useCallback(async (batchId: string) => {
    try {
      const { error } = await supabase
        .from('laundry_batches')
        .delete()
        .eq('id', batchId);

      if (error) throw error;
      setBatches(prev => prev.filter(b => b.id !== batchId));
    } catch (error) {
      console.error('Failed to delete batch:', error);
      toast.error('Failed to delete batch');
    }
  }, []);

  const addClothToBatch = useCallback(async (
    batchId: string,
    cloth: Omit<ClothItem, 'id' | 'addedAt' | 'isReceived'>
  ) => {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('batch_items')
        .insert({
          batch_id: batchId,
          user_id: userId,
          photo: cloth.photo,
          label: cloth.label || null,
          tag: cloth.tag,
        })
        .select()
        .single();

      if (error) throw error;

      const newItem: ClothItem = {
        id: data.id,
        photo: data.photo,
        label: data.label || '',
        tag: data.tag,
        isReceived: data.is_received,
        addedAt: new Date(data.created_at),
      };

      setBatches(prev =>
        prev.map(batch =>
          batch.id === batchId
            ? { ...batch, items: [...batch.items, newItem] }
            : batch
        )
      );
      return newItem;
    } catch (error) {
      console.error('Failed to add cloth:', error);
      toast.error('Failed to add cloth');
      return null;
    }
  }, [userId]);

  const toggleClothReceived = useCallback(async (batchId: string, clothId: string) => {
    const batch = batches.find(b => b.id === batchId);
    const item = batch?.items.find(i => i.id === clothId);
    if (!item) return;

    const newValue = !item.isReceived;

    // Optimistic update
    setBatches(prev =>
      prev.map(b =>
        b.id === batchId
          ? {
              ...b,
              items: b.items.map(i =>
                i.id === clothId ? { ...i, isReceived: newValue } : i
              ),
            }
          : b
      )
    );

    try {
      const { error } = await supabase
        .from('batch_items')
        .update({ is_received: newValue })
        .eq('id', clothId);

      if (error) throw error;
    } catch (error) {
      // Revert on failure
      setBatches(prev =>
        prev.map(b =>
          b.id === batchId
            ? {
                ...b,
                items: b.items.map(i =>
                  i.id === clothId ? { ...i, isReceived: !newValue } : i
                ),
              }
            : b
        )
      );
      console.error('Failed to toggle received:', error);
      toast.error('Failed to update item');
    }
  }, [batches]);

  const getBatch = useCallback((batchId: string) => {
    return batches.find(b => b.id === batchId);
  }, [batches]);

  // Storage stats
  const totalItems = batches.reduce((sum, b) => sum + b.items.length, 0);
  const totalBatches = batches.length;

  return {
    batches,
    isLoaded,
    createBatch,
    deleteBatch,
    addClothToBatch,
    toggleClothReceived,
    getBatch,
    totalItems,
    totalBatches,
    refetch: fetchBatches,
  };
}
