export interface ClothItem {
  id: string;
  photo: string;
  label: string;
  tag: 'shirt' | 'pant' | 'towel' | 'bedsheet' | 'other';
  isReceived: boolean;
  addedAt: Date;
  receivedAt?: Date;
}

export interface LaundryBatch {
  id: string;
  name: string;
  createdAt: Date;
  items: ClothItem[];
}

export type FilterStatus = 'all' | 'pending' | 'received';
export type ClothTag = 'shirt' | 'pant' | 'towel' | 'bedsheet' | 'other';
