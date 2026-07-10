import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabase-client';
import { uploadImage } from '../lib/cloudinary';
import { resizeImage } from '../lib/resizeImage';
import { cloudinaryPublicId } from '../lib/cloudinaryPublicId';
import type { Milestone } from '../types';

// Raw shape of a row in the Supabase `milestones` table.
interface MilestoneRow {
  id: string;
  month_number: number;
  url: string;
  note: string;
  created_at: string;
}

const mapRow = (row: MilestoneRow): Milestone => ({
  id: row.id,
  monthNumber: row.month_number,
  url: row.url,
  note: row.note,
  createdAt: row.created_at,
});

export function useMilestones() {
  // null = not set yet (show the anchor-date setup); string = 'YYYY-MM-DD'.
  const [anchorDate, setAnchorDateState] = useState<string | null>(null);
  // Milestones keyed by month number for O(1) lookup while rendering slots.
  const [milestonesByMonth, setMilestonesByMonth] = useState<Map<number, Milestone>>(new Map());

  const [loading, setLoading] = useState(true);   // initial load
  const [pageError, setPageError] = useState(''); // load failure
  const [savingAnchor, setSavingAnchor] = useState(false);
  const [busyMonth, setBusyMonth] = useState<number | null>(null); // month mid-add
  const [error, setError] = useState('');         // save / add / remove failure

  const load = useCallback(async () => {
    setLoading(true);
    setPageError('');
    try {
      const [settingsRes, milestonesRes] = await Promise.all([
        supabase.from('app_settings').select('anchor_date').eq('id', 1).maybeSingle(),
        supabase.from('milestones').select('*').order('month_number', { ascending: true }),
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

  // Set (or change) the "together since" date. Upserts the single settings row.
  const setAnchorDate = async (date: string) => {
    if (!date || savingAnchor) return;
    setSavingAnchor(true);
    setError('');
    try {
      const { error: upsertError } = await supabase
        .from('app_settings')
        .upsert({ id: 1, anchor_date: date });
      if (upsertError) throw new Error(upsertError.message);
      setAnchorDateState(date);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the date.');
    } finally {
      setSavingAnchor(false);
    }
  };

  // Attach a photo (+ optional note) to a month. Upload to Cloudinary, then
  // persist the row. Mirrors useGallery.addGalleryImage.
  const addMilestone = async (monthNumber: number, file: File, note: string) => {
    if (busyMonth !== null) return;
    setBusyMonth(monthNumber);
    setError('');
    try {
      const optimized = await resizeImage(file);
      const url = await uploadImage(optimized);

      const { data, error: insertError } = await supabase
        .from('milestones')
        .insert({ month_number: monthNumber, url, note: note.trim() })
        .select()
        .single();
      if (insertError) throw new Error(insertError.message);

      const created = mapRow(data as MilestoneRow);
      setMilestonesByMonth((prev) => new Map(prev).set(created.monthNumber, created));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add this milestone.');
    } finally {
      setBusyMonth(null);
    }
  };

  // Remove a month's photo. Optimistic, with best-effort Cloudinary cleanup —
  // same pattern as useGallery.removeGalleryImage.
  const removeMilestone = async (monthNumber: number) => {
    const target = milestonesByMonth.get(monthNumber);
    if (!target) return;
    const previous = milestonesByMonth;

    const next = new Map(previous);
    next.delete(monthNumber);
    setMilestonesByMonth(next); // optimistic
    setError('');

    const { error: deleteError } = await supabase.from('milestones').delete().eq('id', target.id);
    if (deleteError) {
      setError(deleteError.message);
      setMilestonesByMonth(previous); // roll back
      return;
    }

    const publicId = cloudinaryPublicId(target.url);
    if (publicId) {
      const { error: fnError } = await supabase.functions.invoke('delete-image', {
        body: { publicId },
      });
      if (fnError) {
        setError('Milestone removed, but its stored photo could not be deleted.');
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
    error,
    setAnchorDate,
    addMilestone,
    removeMilestone,
    reload: load,
  };
}
