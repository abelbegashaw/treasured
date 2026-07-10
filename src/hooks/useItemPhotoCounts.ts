import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabase-client';

// Tally of how many photos are linked to each bucket item, for the row badges.
// One light query (only the foreign key column) tallied client-side — fine at
// this app's scale. Call refresh() after the modal adds/removes a photo.
export function useItemPhotoCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('bucket_item_id')
      .not('bucket_item_id', 'is', null);

    if (error || !data) return;

    const tally: Record<string, number> = {};
    for (const row of data as { bucket_item_id: string }[]) {
      tally[row.bucket_item_id] = (tally[row.bucket_item_id] ?? 0) + 1;
    }
    setCounts(tally);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { counts, refresh };
}
