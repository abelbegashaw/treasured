import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface MultiImageUploadProps {
  uploading: boolean;
  progress: { done: number; total: number };
  onPost: (files: File[], caption: string) => void;
}

const MAX_IMAGES = 10;

interface Picked {
  file: File;
  url: string; // object URL for preview
  key: string;
}

// Compose a carousel post: pick up to 10 images, drag to reorder, add a caption,
// then post. Object URLs are revoked on cleanup to avoid leaks.
export function MultiImageUpload({ uploading, progress, onPost }: MultiImageUploadProps) {
  const theme = useTheme();
  const [picked, setPicked] = useState<Picked[]>([]);
  const [caption, setCaption] = useState('');
  const dragIndex = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const seq = useRef(0);

  // Revoke every preview URL when unmounting.
  useEffect(() => {
    return () => { picked.forEach((p) => URL.revokeObjectURL(p.url)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const room = MAX_IMAGES - picked.length;
    const next = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, Math.max(0, room))
      .map((file) => ({ file, url: URL.createObjectURL(file), key: `p${seq.current++}` }));
    setPicked((prev) => [...prev, ...next]);
  };

  const removeAt = (index: number) => {
    setPicked((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const moveItem = (from: number, to: number) => {
    if (from === to) return;
    setPicked((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const post = () => {
    if (!picked.length || uploading) return;
    onPost(picked.map((p) => p.file), caption);
    picked.forEach((p) => URL.revokeObjectURL(p.url));
    setPicked([]);
    setCaption('');
  };

  const atMax = picked.length >= MAX_IMAGES;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Previews (drag to reorder) */}
      {picked.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {picked.map((p, index) => (
            <div
              key={p.key}
              draggable
              onDragStart={() => { dragIndex.current = index; }}
              onDragEnter={() => setOverIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex.current !== null) moveItem(dragIndex.current, index);
                dragIndex.current = null;
                setOverIndex(null);
              }}
              onDragEnd={() => { dragIndex.current = null; setOverIndex(null); }}
              style={{
                position: 'relative',
                width: '76px',
                height: '76px',
                cursor: 'grab',
                border: overIndex === index ? `1px solid ${theme.accent}` : `1px solid ${theme.line}`,
                background: theme.line,
              }}
            >
              <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }} />
              <span style={{ position: 'absolute', bottom: 0, left: 0, padding: '1px 5px', fontSize: '10px', color: '#fff', background: 'rgba(0,0,0,0.55)' }}>{index + 1}</span>
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label="Remove"
                style={{ position: 'absolute', top: 0, right: 0, width: '18px', height: '18px', lineHeight: 1, border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer', fontSize: '13px' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0' }}>
        <label
          className="pill-input"
          style={{ display: 'flex', alignItems: 'center', cursor: atMax ? 'default' : 'pointer', flex: '1 1 200px', color: theme.muted, opacity: atMax ? 0.5 : 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRight: 'none' }}
        >
          {atMax ? 'Maximum 10 images' : picked.length ? 'Add more images…' : 'Choose images…'}
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={atMax}
            onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
            style={{ display: 'none' }}
          />
        </label>
        <input
          type="text"
          placeholder="Caption…"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="pill-input"
          style={{ flex: '1 1 160px' }}
        />
      </div>

      <button
        onClick={post}
        className="pill-btn pill-btn-primary"
        disabled={!picked.length || uploading}
        style={{ alignSelf: 'flex-start', opacity: !picked.length || uploading ? 0.5 : 1, cursor: !picked.length || uploading ? 'default' : 'pointer' }}
      >
        {uploading
          ? `Uploading ${progress.done}/${progress.total}…`
          : picked.length > 1 ? `Post ${picked.length} photos` : 'Post'}
      </button>
    </div>
  );
}
