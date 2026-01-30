import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ClothesItem {
  id: string;
  photo_url: string;
  label: string | null;
  tag: string;
  created_at: string;
}

export function useClothesLibrary() {
  const [clothes, setClothes] = useState<ClothesItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all clothes from the library
  const fetchClothes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('clothes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClothes(data || []);
    } catch (error) {
      console.error('Failed to fetch clothes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClothes();
  }, [fetchClothes]);

  // Upload photo to storage and return URL
  const uploadPhoto = useCallback(async (base64Data: string): Promise<string | null> => {
    try {
      // Extract the base64 content and mime type
      const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
      if (!matches) {
        console.error('Invalid base64 format');
        return null;
      }

      const mimeType = matches[1];
      const base64Content = matches[2];
      const extension = mimeType.split('/')[1] || 'jpg';
      const fileName = `${crypto.randomUUID()}.${extension}`;

      // Convert base64 to Uint8Array
      const binaryString = atob(base64Content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const { error: uploadError } = await supabase.storage
        .from('cloth-photos')
        .upload(fileName, bytes, {
          contentType: mimeType,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('cloth-photos')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Failed to upload photo:', error);
      return null;
    }
  }, []);

  // Add a new cloth to the library
  const addCloth = useCallback(async (
    photoBase64: string,
    label: string,
    tag: string
  ): Promise<ClothesItem | null> => {
    try {
      // Upload photo first
      const photoUrl = await uploadPhoto(photoBase64);
      if (!photoUrl) return null;

      const { data, error } = await supabase
        .from('clothes')
        .insert({
          photo_url: photoUrl,
          label: label || null,
          tag,
        })
        .select()
        .single();

      if (error) throw error;
      
      setClothes(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Failed to add cloth:', error);
      return null;
    }
  }, [uploadPhoto]);

  // Update cloth category
  const updateClothTag = useCallback(async (clothId: string, newTag: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('clothes')
        .update({ tag: newTag })
        .eq('id', clothId);

      if (error) throw error;

      setClothes(prev =>
        prev.map(item =>
          item.id === clothId ? { ...item, tag: newTag } : item
        )
      );
      return true;
    } catch (error) {
      console.error('Failed to update cloth tag:', error);
      return false;
    }
  }, []);

  // Delete a cloth from the library
  const deleteCloth = useCallback(async (clothId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('clothes')
        .delete()
        .eq('id', clothId);

      if (error) throw error;

      setClothes(prev => prev.filter(item => item.id !== clothId));
      return true;
    } catch (error) {
      console.error('Failed to delete cloth:', error);
      return false;
    }
  }, []);

  return {
    clothes,
    isLoading,
    addCloth,
    updateClothTag,
    deleteCloth,
    refetch: fetchClothes,
  };
}
