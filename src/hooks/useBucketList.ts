import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { supabase } from '../supabase-client';
import type { BucketItem } from '../types';

// Raw shape of a row in the Supabase `bucket_items` table (snake_case).
interface BucketRow {
  id: string;
  title: string;
  is_completed: boolean;
  created_at: string;
}

const mapRow = (row: BucketRow): BucketItem => ({
  id: row.id,
  title: row.title,
  isCompleted: row.is_completed,
  createdAt: row.created_at,
});

export function useBucketList() {
  const [bucketList, setBucketList] = useState<BucketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newTodoText, setNewTodoText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // --- LOAD FROM SUPABASE (newest first) ---
  const fetchBucketList = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('bucket_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setError('');
      setBucketList((data as BucketRow[]).map(mapRow));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBucketList();
  }, [fetchBucketList]);

  // --- DERIVED PROGRESS STATS (mirrors the original app's completion meter) ---
  const progress = useMemo(() => {
    const done = bucketList.filter((item) => item.isCompleted).length;
    const total = bucketList.length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    return { done, total, percent };
  }, [bucketList]);

  const createBucketItem = async (e: FormEvent) => {
    e.preventDefault();
    const title = newTodoText.trim();
    if (!title) return;

    const { data, error: insertError } = await supabase
      .from('bucket_items')
      .insert({ title, is_completed: false })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      return;
    }
    setBucketList((prev) => [mapRow(data as BucketRow), ...prev]);
    setNewTodoText('');
  };

  const toggleBucketItemStatus = async (id: string) => {
    const item = bucketList.find((i) => i.id === id);
    if (!item) return;
    const next = !item.isCompleted;

    // Optimistic update, roll back on failure.
    setBucketList((prev) => prev.map((i) => (i.id === id ? { ...i, isCompleted: next } : i)));
    const { error: updateError } = await supabase
      .from('bucket_items')
      .update({ is_completed: next })
      .eq('id', id);

    if (updateError) {
      setError(updateError.message);
      setBucketList((prev) => prev.map((i) => (i.id === id ? { ...i, isCompleted: !next } : i)));
    }
  };

  const startInlineEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  const saveInlineEdit = async (id: string) => {
    const title = editingText.trim();
    if (!title) return;

    setBucketList((prev) => prev.map((i) => (i.id === id ? { ...i, title } : i)));
    setEditingId(null);

    const { error: updateError } = await supabase
      .from('bucket_items')
      .update({ title })
      .eq('id', id);

    if (updateError) {
      setError(updateError.message);
      fetchBucketList();
    }
  };

  const deleteBucketItem = async (id: string) => {
    const previous = bucketList;
    setBucketList((prev) => prev.filter((i) => i.id !== id));

    const { error: deleteError } = await supabase.from('bucket_items').delete().eq('id', id);
    if (deleteError) {
      setError(deleteError.message);
      setBucketList(previous);
    }
  };

  return {
    bucketList,
    loading,
    error,
    progress,
    newTodoText,
    setNewTodoText,
    editingId,
    editingText,
    setEditingText,
    createBucketItem,
    toggleBucketItemStatus,
    startInlineEdit,
    saveInlineEdit,
    deleteBucketItem,
  };
}
