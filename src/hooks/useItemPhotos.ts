import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase-client';
import { uploadMedia } from '../lib/cloudinary';
import { cloudinaryPublicId } from '../lib/cloudinaryPublicId';
import { groupPosts } from '../lib/groupPosts';
import type { GalleryImage, MediaType } from '../types';

// Photos/videos linked to ONE bucket item, grouped into carousel posts. Reuses
// the gallery upload/delete pipeline (Cloudinary) but multiple media uploaded
// together share a post_id + ordered position.
interface GalleryRow {
  id: string;
  url: string;
  caption: string;
  media_type: MediaType | null;
  post_id: string | null;
  position: number | null;
  created_at: string;
}

const mapRow = (row: GalleryRow): GalleryImage => ({
  id: row.id,
  url: row.url,
  caption: row.caption,
  mediaType: row.media_type ?? 'image',
  postId: row.post_id ?? undefined,
  position: row.position ?? undefined,
  createdAt: row.created_at,
});

const SELECT = 'id, url, caption, media_type, post_id, position, created_at';

export function useItemPhotos(bucketItemId: string, onChanged?: () => void) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState('');

  const posts = useMemo(() => groupPosts(images), [images]);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('gallery_images')
      .select(SELECT)
      .eq('bucket_item_id', bucketItemId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setError('');
      setImages((data as GalleryRow[]).map(mapRow));
    }
    setLoading(false);
  }, [bucketItemId]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Upload an ordered set of files as ONE carousel post.
  const addPost = async (files: File[], caption: string) => {
    if (!files.length || uploading) return;
    setUploading(true);
    setUploadProgress({ done: 0, total: files.length });
    setError('');
    try {
      const postId = crypto.randomUUID();
      const finalCaption = caption.trim() || 'Captured Moment';

      // Upload sequentially so progress is meaningful and we don't hammer Cloudinary.
      // uploadMedia downscales images before upload and detects image vs video.
      const uploaded: { url: string; type: MediaType }[] = [];
      for (let i = 0; i < files.length; i++) {
        uploaded.push(await uploadMedia(files[i]));
        setUploadProgress({ done: i + 1, total: files.length });
      }

      const rows = uploaded.map((u, index) => ({
        url: u.url,
        caption: finalCaption,
        media_type: u.type,
        bucket_item_id: bucketItemId,
        post_id: postId,
        position: index,
      }));

      const { data, error: insertError } = await supabase
        .from('gallery_images')
        .insert(rows)
        .select(SELECT);

      if (insertError) throw new Error(insertError.message);

      setImages((prev) => [...(data as GalleryRow[]).map(mapRow), ...prev]);
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add photos.');
    } finally {
      setUploading(false);
      setUploadProgress({ done: 0, total: 0 });
    }
  };

  // Delete a whole post (all its images + their Cloudinary assets).
  const removePost = async (postId: string) => {
    const targets = images.filter((img) => (img.postId ?? `single:${img.id}`) === postId);
    if (!targets.length) return;
    const ids = targets.map((t) => t.id);
    const previous = images;
    setImages((prev) => prev.filter((img) => !ids.includes(img.id))); // optimistic
    setError('');

    const { error: deleteError } = await supabase.from('gallery_images').delete().in('id', ids);
    if (deleteError) {
      setError(deleteError.message);
      setImages(previous);
      return;
    }
    onChanged?.();

    // Best-effort Cloudinary cleanup for each media item (rows are source of truth).
    let anyFailed = false;
    for (const t of targets) {
      const publicId = cloudinaryPublicId(t.url);
      if (!publicId) continue;
      const { error: fnError } = await supabase.functions.invoke('delete-image', {
        body: { publicId, resourceType: t.mediaType },
      });
      if (fnError) anyFailed = true;
    }
    if (anyFailed) setError('Post removed, but some stored files could not be deleted.');
  };

  return {
    posts,
    loading,
    uploading,
    uploadProgress,
    error,
    addPost,
    removePost,
  };
}
