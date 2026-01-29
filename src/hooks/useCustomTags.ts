import { useState, useEffect, useCallback } from 'react';
import { CustomTag, DEFAULT_TAGS } from '@/types/laundry';

const STORAGE_KEY = 'laundry-custom-tags';

const DEFAULT_TAG_OPTIONS: { value: string; label: string; emoji: string }[] = [
  { value: 'shirt', label: 'Shirt', emoji: '👕' },
  { value: 'pant', label: 'Pant', emoji: '👖' },
  { value: 'towel', label: 'Towel', emoji: '🧴' },
  { value: 'bedsheet', label: 'Bedsheet', emoji: '🛏️' },
];

export function useCustomTags() {
  const [customTags, setCustomTags] = useState<CustomTag[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCustomTags(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load custom tags from storage:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever tags change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customTags));
      } catch (error) {
        console.error('Failed to save custom tags to storage:', error);
      }
    }
  }, [customTags, isLoaded]);

  const addCustomTag = useCallback((name: string, emoji: string): CustomTag => {
    const newTag: CustomTag = {
      id: crypto.randomUUID(),
      name: name.trim(),
      emoji: emoji || '🏷️',
    };
    setCustomTags(prev => [...prev, newTag]);
    return newTag;
  }, []);

  const deleteCustomTag = useCallback((tagId: string) => {
    setCustomTags(prev => prev.filter(t => t.id !== tagId));
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
