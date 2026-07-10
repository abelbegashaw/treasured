import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../supabase-client';
import { useTheme } from '../../context/ThemeContext';
import { MediaThumb } from '../media/MediaThumb';
import type { GalleryImage, MediaType } from '../../types';

interface GalleryPickerModalProps {
  excludeIds?: Set<string>; // gallery ids already attached to this month
  onClose: () => void;
  onPick: (items: GalleryImage[]) => void;
}

interface Row {
  id: string;
  url: string;
  caption: string;
  media_type: MediaType;
  created_at: string;
}

// Pick existing gallery photos/videos to REUSE on a milestone (no re-upload).
// Loads a recent slice of the gallery; multi-select; returns the chosen items.
export function GalleryPickerModal({ excludeIds, onClose, onPick }: GalleryPickerModalProps) {
  const theme = useTheme();
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: fetchError } = await supabase
        .from('gallery_images')
        .select('id, url, caption, media_type, created_at')
        .order('created_at', { ascending: false })
        .limit(60);
      if (cancelled) return;
      if (fetchError) setError(fetchError.message);
      else {
        setItems(
          (data as Row[])
            .filter((r) => !excludeIds?.has(r.id))
            .map((r) => ({ id: r.id, url: r.url, caption: r.caption, mediaType: r.media_type, createdAt: r.created_at })),
        );
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [excludeIds]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirm = () => {
    const chosen = items.filter((i) => selected.has(i.id));
    if (chosen.length) onPick(chosen);
    onClose();
  };

  return createPortal(
    <div
      className="gallery-modal"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 55, overflowY: 'auto', backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '620px', margin: '0 auto', minHeight: '100%', backgroundColor: theme.canvas, color: theme.ink, padding: '20px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: `1px solid ${theme.ink}` }}>
          <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.25em' }}>Choose from gallery</span>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', fontSize: '22px', lineHeight: 1, cursor: 'pointer', color: theme.ink }}>×</button>
        </div>

        {loading ? (
          <p style={{ margin: '20px 2px', fontSize: '14px', color: theme.muted }}>Loading gallery…</p>
        ) : error ? (
          <p style={{ margin: '20px 2px', fontSize: '13px', color: theme.rose }}>{error}</p>
        ) : items.length === 0 ? (
          <p style={{ margin: '20px 2px', fontSize: '14px', color: theme.muted }}>Nothing in the gallery to reuse yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '16px' }}>
            {items.map((item) => {
              const isSel = selected.has(item.id);
              return (
                <div key={item.id} style={{ position: 'relative' }}>
                  <MediaThumb
                    url={item.url}
                    type={item.mediaType}
                    alt={item.caption}
                    onClick={() => toggle(item.id)}
                    style={{ aspectRatio: '4 / 5', border: isSel ? `2px solid ${theme.accent}` : `1px solid ${theme.line}` }}
                  />
                  {isSel && (
                    <span style={{ position: 'absolute', top: '6px', right: '6px', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: theme.accent, color: '#fff', fontSize: '12px' }}>✓</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ position: 'sticky', bottom: 0, display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '16px', marginTop: '16px', borderTop: `1px solid ${theme.line}`, background: theme.canvas }}>
          <button onClick={onClose} className="pill-btn" style={{ border: `1px solid ${theme.line}`, background: 'transparent', color: theme.ink }}>Cancel</button>
          <button
            onClick={confirm}
            className="pill-btn pill-btn-primary"
            disabled={selected.size === 0}
            style={{ opacity: selected.size === 0 ? 0.5 : 1, cursor: selected.size === 0 ? 'default' : 'pointer' }}
          >
            Add {selected.size || ''}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
