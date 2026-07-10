// TypeScript strict data structures (mirror the Supabase table shapes)
export interface BucketItem {
  id: string;          // uuid
  title: string;
  isCompleted: boolean;
  createdAt: string;   // ISO timestamp
}

// A stored asset is either a photo or a video.
export type MediaType = 'image' | 'video';

export interface GalleryImage {
  id: string;          // uuid
  url: string;
  caption: string;
  mediaType: MediaType;
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

// One photo/video attached to a milestone month. galleryImageId, when set, marks
// media reused from an existing gallery asset — removing it from the milestone
// must NOT destroy the underlying Cloudinary asset (the gallery still owns it).
export interface MilestoneMedia {
  id: string;          // uuid
  url: string;
  mediaType: MediaType;
  position: number;
  galleryImageId?: string;
}

// A monthly-anniversary marker on the timeline: a group holding a note and one or
// more media. month_number counts whole months from the "together since" anchor
// date (0 = the beginning, 1 = one month).
export interface Milestone {
  id: string;          // uuid (the group row)
  monthNumber: number;
  note: string;
  media: MilestoneMedia[];
  createdAt: string;   // ISO timestamp
}

export type Tab = 'bucket' | 'gallery' | 'milestones' | 'us';
