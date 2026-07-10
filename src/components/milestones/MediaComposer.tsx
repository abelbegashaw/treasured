import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { MediaThumb } from '../media/MediaThumb';
import { GalleryPickerModal } from './GalleryPickerModal';
import type { GalleryImage } from '../../types';

interface MediaComposerProps {
  uploading: boolean;
  progress: { done: number; total: number };
  onPost: (files: File[], picks: GalleryImage[], note: string) => void;
  onCancel: () => void;
}

const MAX_MEDIA = 10;

interface PickedFile {
  file: File;
  url: string; // object URL for preview
  key: string;
  isVideo: boolean;
}

// Compose a milestone's media: pick up to 10 images/videos to upload (drag to
// reorder), and/or reuse existing gallery media, plus an optional note.
export function MediaComposer({ uploading, progress, onPost, onCancel }: MediaComposerProps) {
  const theme = useTheme();
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [picks, setPicks] = useState<GalleryImage[]>([]);
  const [note, setNote] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const seq = useRef(0);

  // Revoke every preview URL on unmount.
  useEffect(() => {
    return () => { files.forEach((p) => URL.revokeObjectURL(p.url)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = files.length + picks.length;
  const atMax = total >= MAX_MEDIA;

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const room = MAX_MEDIA - total;
    const next = Array.from(list)
      .filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'))
      .slice(0, Math.max(0, room))
      .map((file) => ({ file, url: URL.createObjectURL(file), key: `f${seq.current++}`, isVideo: file.type.startsWith('video/') }));
    setFiles((prev) => [...prev, ...next]);
  };

  const removeFileAt = (index: number) => {
    setFiles((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const moveFile = (from: number, to: number) => {
    if (from === to) return;
    setFiles((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const addPicks = (chosen: GalleryImage[]) => {
    setPicks((prev) => {
      const seen = new Set(prev.map((p) => p.id));
      const room = MAX_MEDIA - (files.length + prev.length);
      return [...prev, ...chosen.filter((c) => !seen.has(c.id)).slice(0, Math.max(0, room))];
    });
  };

  const removePick = (id: string) => setPicks((prev) => prev.filter((p) => p.id !== id));

  const post = () => {
    if (!total || uploading) return;
    onPost(files.map((f) => f.file), picks, note);
    files.forEach((f) => URL.revokeObjectURL(f.url));
    setFiles([]);
    setPicks([]);
    setNote('');
  };

  return (
    <div style={{ marginTop: '12px', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* File previews (drag to reorder) */}
      {files.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {files.map((p, index) => (
            <div
              key={p.key}
              draggable
              onDragStart={() => { dragIndex.current = index; }}
              onDragEnter={() => setOverIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (dragIndex.current !== null) moveFile(dragIndex.current, index); dragIndex.current = null; setOverIndex(null); }}
              onDragEnd={() => { dragIndex.current = null; setOverIndex(null); }}
              style={{ position: 'relative', width: '76px', height: '76px', cursor: 'grab', border: overIndex === index ? `1px solid ${theme.accent}` : `1px solid ${theme.line}`, background: theme.line }}
            >
              {p.isVideo ? (
                <video src={p.url} muted preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }} />
              ) : (
                <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }} />
              )}
              {p.isVideo && <span style={{ position: 'absolute', bottom: 0, left: 0, padding: '1px 4px', fontSize: '9px', letterSpacing: '0.1em', color: '#fff', background: 'rgba(0,0,0,0.6)' }}>VIDEO</span>}
              <button type="button" onClick={() => removeFileAt(index)} aria-label="Remove" style={{ position: 'absolute', top: 0, right: 0, width: '18px', height: '18px', lineHeight: 1, border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer', fontSize: '13px' }}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* Reused gallery picks */}
      {picks.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {picks.map((p) => (
            <div key={p.id} style={{ position: 'relative', width: '76px', height: '76px', border: `1px solid ${theme.accent}` }}>
              <MediaThumb url={p.url} type={p.mediaType} alt={p.caption} style={{ width: '100%', height: '100%' }} />
              <span style={{ position: 'absolute', bottom: 0, left: 0, padding: '1px 4px', fontSize: '9px', letterSpacing: '0.1em', color: '#fff', background: 'rgba(0,0,0,0.6)' }}>GALLERY</span>
              <button type="button" onClick={() => removePick(p.id)} aria-label="Remove" style={{ position: 'absolute', top: 0, right: 0, width: '18px', height: '18px', lineHeight: 1, border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer', fontSize: '13px' }}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* Source controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <label
          className="pill-input"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: atMax ? 'default' : 'pointer', flex: '1 1 140px', color: theme.muted, opacity: atMax ? 0.5 : 1, whiteSpace: 'nowrap' }}
        >
          {atMax ? 'Max 10' : 'Upload photo / video'}
          <input type="file" accept="image/*,video/*" multiple disabled={atMax} onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} style={{ display: 'none' }} />
        </label>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          disabled={atMax}
          className="pill-btn"
          style={{ flex: '1 1 140px', border: `1px solid ${theme.line}`, background: 'transparent', color: theme.ink, opacity: atMax ? 0.5 : 1, cursor: atMax ? 'default' : 'pointer' }}
        >
          Choose from gallery
        </button>
      </div>

      <input type="text" placeholder="A note (optional)…" value={note} onChange={(e) => setNote(e.target.value)} className="pill-input" />

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={post}
          className="pill-btn pill-btn-primary"
          disabled={!total || uploading}
          style={{ opacity: !total || uploading ? 0.5 : 1, cursor: !total || uploading ? 'default' : 'pointer' }}
        >
          {uploading ? `Uploading ${progress.done}/${progress.total}…` : total > 1 ? `Add ${total}` : 'Add'}
        </button>
        <button onClick={onCancel} className="pill-btn" disabled={uploading} style={{ border: `1px solid ${theme.line}`, background: 'transparent', color: theme.ink }}>Cancel</button>
      </div>

      {pickerOpen && (
        <GalleryPickerModal
          excludeIds={new Set(picks.map((p) => p.id))}
          onClose={() => setPickerOpen(false)}
          onPick={addPicks}
        />
      )}
    </div>
  );
}
