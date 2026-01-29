export const DEFAULT_TAGS = ['shirt', 'pant', 'towel', 'bedsheet'] as const;

export type DefaultTag = typeof DEFAULT_TAGS[number];

export interface ClothItem {
  id: string;
  photo: string;
  label: string;
  tag: string; // Can be default or custom tag
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

export interface CustomTag {
  id: string;
  name: string;
  emoji: string;
}
