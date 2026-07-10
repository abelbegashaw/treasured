import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../supabase-client';
import { uploadMedia } from '../lib/cloudinary';
import { cloudinaryPublicId } from '../lib/cloudinaryPublicId';
import type { GalleryImage, Milestone, MilestoneMedia } from '../types';

// Raw nested shape returned by the milestones + milestone_media select.
interface MediaRow {
  id: string;
  url: string;
  media_type: 'image' | 'video';
  position: number;
  gallery_image_id: string | null;
}
interface MilestoneRow {
  id: string;
  month_number: number;
  note: string;
  created_at: string;
  milestone_media: MediaRow[] | null;
}

const mapMedia = (row: MediaRow): MilestoneMedia => ({
  id: row.id,
  url: row.url,
  mediaType: row.media_type,
  position: row.position,
  galleryImageId: row.gallery_image_id ?? undefined,
});

const mapRow = (row: MilestoneRow): Milestone => ({
  id: row.id,
  monthNumber: row.month_number,
  note: row.note,
  media: (row.milestone_media ?? []).map(mapMedia).sort((a, b) => a.position - b.position),
  createdAt: row.created_at,
});

const SELECT = 'id, month_number, note, created_at, milestone_media(id, url, media_type, position, gallery_image_id)';

export function useMilestones() {
  const [anchorDate, setAnchorDateState] = useState<string | null>(null);
  const [milestonesByMonth, setMilestonesByMonth] = useState<Map<number, Milestone>>(new Map());

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [savingAnchor, setSavingAnchor] = useState(false);
  const [busyMonth, setBusyMonth] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState('');

  // Latest map, readable inside async handlers without stale closures.
  const mapRef = useRef<Map<number, Milestone>>(milestonesByMonth);
  useEffect(() => { mapRef.current = milestonesByMonth; }, [milestonesByMonth]);

  const load = useCallback(async () => {
    setLoading(true);
    setPageError('');
    try {
      const [settingsRes, milestonesRes] = await Promise.all([
        supabase.from('app_settings').select('anchor_date').eq('id', 1).maybeSingle(),
        supabase.from('milestones').select(SELECT).order('month_number', { ascending: true }),
      ]);

      if (settingsRes.error) throw new Error(settingsRes.error.message);
      if (milestonesRes.error) throw new Error(milestonesRes.error.message);

      setAnchorDateState((settingsRes.data?.anchor_date as string | null) ?? null);
      const map = new Map<number, Milestone>();
      for (const row of (milestonesRes.data as MilestoneRow[]) ?? []) {
        const m = mapRow(row);
        map.set(m.monthNumber, m);
      }
      setMilestonesByMonth(map);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Could not load your timeline.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setAnchorDate = async (date: string) => {
    if (!date || savingAnchor) return;
    setSavingAnchor(true);
    setError('');
    try {
      const { error: upsertError } = await supabase.from('app_settings').upsert({ id: 1, anchor_date: date });
      if (upsertError) throw new Error(upsertError.message);
      setAnchorDateState(date);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the date.');
    } finally {
      setSavingAnchor(false);
    }
  };

  // Find or create the group row for a month; returns its id.
  const ensureGroup = async (monthNumber: number): Promise<string> => {
    const existing = mapRef.current.get(monthNumber);
    if (existing) return existing.id;

    const { data, error: insertError } = await supabase
      .from('milestones')
      .insert({ month_number: monthNumber })
      .select('id')
      .single();

    if (insertError) {
      // A concurrent add may have created it first — fall back to fetching it.
      const { data: found } = await supabase.from('milestones').select('id').eq('month_number', monthNumber).maybeSingle();
      if (found?.id) return found.id as string;
      throw new Error(insertError.message);
    }
    return data.id as string;
  };

  // Attach uploaded files and/or reused gallery media to a month, appended in order.
  const addMilestoneMedia = async (monthNumber: number, files: File[], picks: GalleryImage[], note: string) => {
    if (busyMonth !== null) return;
    if (files.length === 0 && picks.length === 0) return;

    setBusyMonth(monthNumber);
    setUploadProgress({ done: 0, total: files.length });
    setError('');
    try {
      const milestoneId = await ensureGroup(monthNumber);
      const existing = mapRef.current.get(monthNumber);
      let position = existing ? existing.media.length : 0;

      // Optionally set/replace the month's note.
      const trimmedNote = note.trim();
      if (trimmedNote && trimmedNote !== (existing?.note ?? '')) {
        await supabase.from('milestones').update({ note: trimmedNote }).eq('id', milestoneId);
      }

      // Upload files sequentially so progress is meaningful.
      const uploaded: { url: string; type: 'image' | 'video' }[] = [];
      for (let i = 0; i < files.length; i++) {
        uploaded.push(await uploadMedia(files[i]));
        setUploadProgress({ done: i + 1, total: files.length });
      }

      const rows = [
        ...uploaded.map((u) => ({ milestone_id: milestoneId, url: u.url, media_type: u.type, position: position++, gallery_image_id: null as string | null })),
        ...picks.map((p) => ({ milestone_id: milestoneId, url: p.url, media_type: p.mediaType, position: position++, gallery_image_id: p.id })),
      ];

      const { data, error: insertError } = await supabase
        .from('milestone_media')
        .insert(rows)
        .select('id, url, media_type, position, gallery_image_id');
      if (insertError) throw new Error(insertError.message);

      const newMedia = (data as MediaRow[]).map(mapMedia);

      setMilestonesByMonth((prev) => {
        const next = new Map(prev);
        const current = next.get(monthNumber);
        const media = [...(current?.media ?? []), ...newMedia].sort((a, b) => a.position - b.position);
        next.set(monthNumber, {
          id: milestoneId,
          monthNumber,
          note: trimmedNote || current?.note || '',
          media,
          createdAt: current?.createdAt ?? new Date().toISOString(),
        });
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add this media.');
    } finally {
      setBusyMonth(null);
      setUploadProgress({ done: 0, total: 0 });
    }
  };

  // Remove one media item. Destroys the Cloudinary asset only if it was an upload
  // (reused gallery media stays owned by the gallery). Cleans up an emptied,
  // note-less group so the month returns to its blank state.
  const removeMilestoneMedia = async (monthNumber: number, mediaId: string) => {
    const group = mapRef.current.get(monthNumber);
    const target = group?.media.find((m) => m.id === mediaId);
    if (!group || !target) return;

    const previous = mapRef.current;
    const remaining = group.media.filter((m) => m.id !== mediaId);
    const groupNowEmpty = remaining.length === 0 && group.note.trim() === '';

    // Optimistic update.
    setMilestonesByMonth((prev) => {
      const next = new Map(prev);
      if (groupNowEmpty) next.delete(monthNumber);
      else next.set(monthNumber, { ...group, media: remaining });
      return next;
    });
    setError('');

    const { error: deleteError } = await supabase.from('milestone_media').delete().eq('id', mediaId);
    if (deleteError) {
      setError(deleteError.message);
      setMilestonesByMonth(previous); // roll back
      return;
    }

    // Drop the now-empty group row so the month is truly blank again.
    if (groupNowEmpty) {
      await supabase.from('milestones').delete().eq('id', group.id);
    }

    // Best-effort Cloudinary cleanup — only for milestone-owned uploads.
    if (!target.galleryImageId) {
      const publicId = cloudinaryPublicId(target.url);
      if (publicId) {
        const { error: fnError } = await supabase.functions.invoke('delete-image', {
          body: { publicId, resourceType: target.mediaType },
        });
        if (fnError) setError('Media removed, but its stored file could not be deleted.');
      }
    }
  };

  return {
    anchorDate,
    milestonesByMonth,
    loading,
    pageError,
    savingAnchor,
    busyMonth,
    uploadProgress,
    error,
    setAnchorDate,
    addMilestoneMedia,
    removeMilestoneMedia,
    reload: load,
  };
}
