import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CustomTag } from '@/types/laundry';

const DEFAULT_TAG_OPTIONS: { value: string; label: string; emoji: string }[] = [
  { value: 'shirt', label: 'Shirt', emoji: '👕' },
  { value: 'pant', label: 'Pant', emoji: '👖' },
  { value: 'towel', label: 'Towel', emoji: '🧴' },
  { value: 'bedsheet', label: 'Bedsheet', emoji: '🛏️' },
];

export function useCustomTags(userId: string | undefined) {
  const [customTags, setCustomTags] = useState<CustomTag[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchTags = useCallback(async () => {
    if (!userId) { setIsLoaded(true); return; }
    try {
      const { data, error } = await supabase
        .from('custom_tags')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      setCustomTags((data || []).map(t => ({ id: t.id, name: t.name, emoji: t.emoji })));
    } catch (error) {
      console.error('Failed to fetch custom tags:', error);
    } finally {
      setIsLoaded(true);
    }
  }, [userId]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const addCustomTag = useCallback(async (name: string, emoji: string): Promise<CustomTag | null> => {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('custom_tags')
        .insert({ name: name.trim(), emoji: emoji || '🏷️', user_id: userId })
        .select()
        .single();
      if (error) throw error;
      const newTag: CustomTag = { id: data.id, name: data.name, emoji: data.emoji };
      setCustomTags(prev => [...prev, newTag]);
      return newTag;
    } catch (error) {
      console.error('Failed to add custom tag:', error);
      return null;
    }
  }, [userId]);

  const deleteCustomTag = useCallback(async (tagId: string) => {
    try {
      const { error } = await supabase.from('custom_tags').delete().eq('id', tagId);
      if (error) throw error;
      setCustomTags(prev => prev.filter(t => t.id !== tagId));
    } catch (error) {
      console.error('Failed to delete custom tag:', error);
    }
  }, []);

  const getAllTagOptions = useCallback(() => {
    const customOptions = customTags.map(t => ({
      value: t.id,
      label: t.name,
      emoji: t.emoji,
      isCustom: true,
    }));
    return [
      ...DEFAULT_TAG_OPTIONS.map(t => ({ ...t, isCustom: false })),
      ...customOptions,
    ];
  }, [customTags]);

  const getTagDisplay = useCallback((tagValue: string) => {
    const defaultTag = DEFAULT_TAG_OPTIONS.find(t => t.value === tagValue);
    if (defaultTag) return defaultTag;
    const customTag = customTags.find(t => t.id === tagValue);
    if (customTag) return { value: customTag.id, label: customTag.name, emoji: customTag.emoji };
    return { value: tagValue, label: tagValue, emoji: '🏷️' };
  }, [customTags]);

  return {
    customTags,
    isLoaded,
    addCustomTag,
    deleteCustomTag,
    getAllTagOptions,
    getTagDisplay,
  };
}
