import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../supabase-client';
import { uploadMedia } from '../lib/cloudinary';
import { cloudinaryPublicId } from '../lib/cloudinaryPublicId';
import type { GalleryImage, MediaType } from '../types';

// How many photos to fetch per page (multiple of 3 to fill whole grid rows).
const PAGE_SIZE = 24;

// Raw shape of a row in the Supabase `gallery_images` table.
interface GalleryRow {
  id: string;
  url: string;
  caption: string;
  media_type: MediaType;
  created_at: string;
}

const mapRow = (row: GalleryRow): GalleryImage => ({
  id: row.id,
  url: row.url,
  caption: row.caption,
  mediaType: row.media_type ?? 'image',
  createdAt: row.created_at,
});

export function useGallery() {
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);        // initial page load
  const [loadingMore, setLoadingMore] = useState(false); // appending a later page
  const [hasMore, setHasMore] = useState(true);         // more pages remain
  const [pageError, setPageError] = useState('');       // load / load-more failure
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');               // upload / remove failure

  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgCaptionInput, setImgCaptionInput] = useState('');

  // Refs let loadMore() stay stable (empty deps) while reading fresh state,
  // and guard against overlapping fetches (rapid scroll / observer re-fires).
  const galleryRef = useRef<GalleryImage[]>([]);
  const hasMoreRef = useRef(true);
  const inFlightRef = useRef(false);
  useEffect(() => { galleryRef.current = gallery; }, [gallery]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);

  // Cursor pagination on created_at (newest first). Passing the oldest loaded
  // timestamp as the cursor avoids the offset drift you'd get when photos are
  // added/removed mid-session.
  const fetchPage = useCallback(async (cursor: string | null): Promise<GalleryImage[]> => {
    let query = supabase
      .from('gallery_images')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);
    if (cursor) query = query.lt('created_at', cursor);

    const { data, error: fetchError } = await query;
    if (fetchError) throw new Error(fetchError.message);
    return (data as GalleryRow[]).map(mapRow);
  }, []);

  // Initial load / retry-from-empty.
  const loadInitial = useCallback(async () => {
    setLoading(true);
    setPageError('');
    try {
      const rows = await fetchPage(null);
      setGallery(rows);
      setHasMore(rows.length === PAGE_SIZE);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Could not load your gallery.');
    } finally {
      setLoading(false);
    }
  }, [fetchPage]);

  // Append the next page. Guarded so overlapping calls collapse into one.
  const loadMore = useCallback(async () => {
    if (inFlightRef.current || !hasMoreRef.current) return;
    const current = galleryRef.current;
    const cursor = current.length ? current[current.length - 1].createdAt : null;
    if (!cursor) return;

    inFlightRef.current = true;
    setLoadingMore(true);
    setPageError('');
    try {
      const rows = await fetchPage(cursor);
      setGallery((prev) => [...prev, ...rows]);
      setHasMore(rows.length === PAGE_SIZE);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Could not load more photos.');
    } finally {
      inFlightRef.current = false;
      setLoadingMore(false);
    }
  }, [fetchPage]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  // Upload the picked file to Cloudinary, then persist the URL + caption to Supabase.
  const addGalleryImage = async () => {
    if (!imgFile || uploading) return;
    setUploading(true);
    setError('');
    try {
      // uploadMedia downscales images before upload and detects image vs video.
      const { url, type } = await uploadMedia(imgFile);
      const caption = imgCaptionInput.trim() || 'Captured Moment';

      const { data, error: insertError } = await supabase
        .from('gallery_images')
        .insert({ url, caption, media_type: type })
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);

      setGallery((prev) => [mapRow(data as GalleryRow), ...prev]);
      setImgFile(null);
      setImgCaptionInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add image.');
    } finally {
      setUploading(false);
    }
  };

  const removeGalleryImage = async (id: string) => {
    const target = gallery.find((img) => img.id === id);
    const previous = gallery;
    setGallery((prev) => prev.filter((img) => img.id !== id)); // optimistic
    setError('');

    // 1. Delete the row (source of truth). Roll back the UI if this fails.
    const { error: deleteError } = await supabase.from('gallery_images').delete().eq('id', id);
    if (deleteError) {
      setError(deleteError.message);
      setGallery(previous);
      return;
    }

    // 2. Best-effort delete of the underlying Cloudinary asset via the signed
    //    Edge Function. If it fails the row is already gone; the asset is just
    //    orphaned, so we surface a soft warning rather than blocking.
    const publicId = target ? cloudinaryPublicId(target.url) : null;
    if (publicId) {
      const { error: fnError } = await supabase.functions.invoke('delete-image', {
        body: { publicId, resourceType: target?.mediaType ?? 'image' },
      });
      if (fnError) {
        setError('Photo removed, but its stored file could not be deleted.');
      }
    }
  };

  return {
    gallery,
    loading,
    loadingMore,
    hasMore,
    pageError,
    uploading,
    error,
    imgFile,
    setImgFile,
    imgCaptionInput,
    setImgCaptionInput,
    addGalleryImage,
    removeGalleryImage,
    loadMore,
    reload: loadInitial,
  };
}
