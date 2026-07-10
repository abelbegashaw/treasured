// TypeScript strict data structures (mirror the Supabase table shapes)
export interface BucketItem {
  id: string;          // uuid
  title: string;
  isCompleted: boolean;
  createdAt: string;   // ISO timestamp
}

export interface GalleryImage {
  id: string;          // uuid
  url: string;
  caption: string;
  postId?: string;     // groups images into one carousel post
  position?: number;   // order within the post
  createdAt: string;   // ISO timestamp
}

// A carousel post = one or more images uploaded together, in order.
export interface PhotoPost {
  postId: string;
  images: GalleryImage[];
  caption: string;
  createdAt: string;   // newest image's timestamp
}

export type Tab = 'bucket' | 'gallery' | 'us';
