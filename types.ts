export interface FurnitureItem {
  id: string;
  name: string;
  category: string;
  description: string;
  searchUrl: string;
}

export interface StyledImage {
  id: string;
  url: string;
  style: string;
  createdAt: string;
  furniture?: FurnitureItem[];
}

export interface RoomProject {
  id: string;
  userId: string;
  originalImageUrl: string;
  createdAt: any; // Firestore Timestamp
  updatedAt?: any;
}

export const DESIGN_STYLES = [
  { id: 'modern', name: 'Modern', description: 'Clean lines, minimalist, and functional.' },
  { id: 'scandinavian', name: 'Scandinavian', description: 'Light, airy, with natural wood accents.' },
  { id: 'industrial', name: 'Industrial', description: 'Raw materials, exposed brick, and metal.' },
  { id: 'bohemian', name: 'Bohemian', description: 'Eclectic, colorful, and full of life.' },
  { id: 'minimalist', name: 'Minimalist', description: 'Essential elements, neutral colors.' },
  { id: 'mid-century', name: 'Mid-Century', description: 'Organic shapes, retro vibes.' },
  { id: 'japandi', name: 'Japandi', description: 'Japanese minimalism meets Scandi warmth.' },
  { id: 'traditional', name: 'Traditional', description: 'Classic, elegant, and timeless.' },
];
