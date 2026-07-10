import { useTheme } from '../../context/ThemeContext';

interface AddImageFormProps {
  imgFile: File | null;
  setImgFile: (file: File | null) => void;
  imgCaptionInput: string;
  setImgCaptionInput: (value: string) => void;
  uploading: boolean;
  onSubmit: () => void;
}

// Upload controls: pick an image file (sent to Cloudinary) + a caption.
export function AddImageForm({ imgFile, setImgFile, imgCaptionInput, setImgCaptionInput, uploading, onSubmit }: AddImageFormProps) {
  const theme = useTheme();

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0' }}>
        <label
          className="pill-input"
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: '1 1 200px', color: imgFile ? theme.ink : theme.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRight: 'none' }}
        >
          {imgFile ? imgFile.name : 'Choose an image…'}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImgFile(e.target.files?.[0] ?? null)}
            style={{ display: 'none' }}
          />
        </label>
        <input
          type="text"
          placeholder="Caption…"
          value={imgCaptionInput}
          onChange={(e) => setImgCaptionInput(e.target.value)}
          className="pill-input"
          style={{ flex: '1 1 160px' }}
        />
      </div>
      <button
        onClick={onSubmit}
        className="pill-btn pill-btn-primary"
        disabled={!imgFile || uploading}
        style={{ alignSelf: 'flex-start', opacity: !imgFile || uploading ? 0.5 : 1, cursor: !imgFile || uploading ? 'default' : 'pointer' }}
      >
        {uploading ? 'Uploading…' : 'Publish'}
      </button>
    </section>
  );
}
