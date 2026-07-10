import type { GalleryImage, PhotoPost } from '../types';

// Group a flat list of images into carousel posts.
// - Images sharing a post_id belong to one post, ordered by `position`.
// - Images with no post_id are each their own single-image post (legacy photos).
// - Posts are ordered newest-first by their most recent image.
export function groupPosts(images: GalleryImage[]): PhotoPost[] {
  const byPost = new Map<string, GalleryImage[]>();

  for (const img of images) {
    // Ungrouped photos get a synthetic single-member key so they stand alone.
    const key = img.postId ?? `single:${img.id}`;
    const bucket = byPost.get(key);
    if (bucket) bucket.push(img);
    else byPost.set(key, [img]);
  }

  const posts: PhotoPost[] = [];
  for (const [key, group] of byPost) {
    const ordered = [...group].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    const createdAt = ordered.reduce((max, i) => (i.createdAt > max ? i.createdAt : max), ordered[0].createdAt);
    posts.push({
      postId: key,
      images: ordered,
      caption: ordered[0].caption,
      createdAt,
    });
  }

  return posts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
