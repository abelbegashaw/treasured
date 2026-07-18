import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface AddImageFormProps {
  uploading: boolean;
  progress: { done: number; total: number };
  onSubmit: (files: File[], caption: string) => void;
}

interface Picked {
  file: File;
  url: string;   // object URL for preview
  isVideo: boolean;
  key: string;
}

// Gallery upload: pick as MANY photos and/or videos as you like in one go,
// preview them, optionally drop a caption, then publish. Object URLs are
// revoked on cleanup.
export function AddImageForm({ uploading, progress, onSubmit }: AddImageFormProps) {
  const theme = useTheme();
  const [picked, setPicked] = useState<Picked[]>([]);
  const [caption, setCaption] = useState('');
  const seq = useRef(0);

  // Revoke every preview URL when unmounting.
  useEffect(() => {
    return () => { picked.forEach((p) => URL.revokeObjectURL(p.url)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    setPicked((prev) => {
      const next = Array.from(files)
        .filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'))
        .map((file) => ({
          file,
          url: URL.createObjectURL(file),
          isVideo: file.type.startsWith('video/'),
          key: `p${seq.current++}`,
        }));
      return [...prev, ...next];
    });
  };

  const removeAt = (index: number) => {
    setPicked((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const submit = () => {
    if (!picked.length || uploading) return;
    onSubmit(picked.map((p) => p.file), caption);
    picked.forEach((p) => URL.revokeObjectURL(p.url));
    setPicked([]);
    setCaption('');
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Thumbnails of everything queued. */}
      {picked.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {picked.map((p, index) => (
            <div
              key={p.key}
              style={{ position: 'relative', width: '76px', height: '76px', border: `1px solid ${theme.line}`, background: theme.line }}
            >
              {p.isVideo ? (
                <video src={p.url} muted preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              )}
              {p.isVideo && (
                <span style={{ position: 'absolute', bottom: 0, left: 0, padding: '1px 5px', fontSize: '10px', color: '#fff', background: 'rgba(0,0,0,0.55)' }}>video</span>
              )}
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label="Remove"
                disabled={uploading}
                style={{ position: 'absolute', top: 0, right: 0, width: '18px', height: '18px', lineHeight: 1, border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: uploading ? 'default' : 'pointer', fontSize: '13px' }}
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
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: '1 1 200px', color: theme.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRight: 'none' }}
        >
          {picked.length ? 'Add more photos or videos…' : 'Choose photos or videos…'}
          <input
            type="file"
            accept="image/*,video/*"
            multiple
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
        onClick={submit}
        className="pill-btn pill-btn-primary"
        disabled={!picked.length || uploading}
        style={{ alignSelf: 'flex-start', opacity: !picked.length || uploading ? 0.5 : 1, cursor: !picked.length || uploading ? 'default' : 'pointer' }}
      >
        {uploading
          ? `Uploading ${progress.done}/${progress.total}…`
          : picked.length > 1 ? `Publish ${picked.length} items` : 'Publish'}
      </button>
    </section>
  );
}
