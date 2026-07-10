import type { CSSProperties } from 'react';
import { mediaThumb } from '../../lib/cloudinaryUrl';
import type { MediaType } from '../../types';

interface MediaThumbProps {
  url: string;
  type: MediaType;
  alt?: string;
  onClick?: () => void;
  style?: CSSProperties; // wrapper style (sizing lives here)
}

// A cheap, self-contained thumbnail for grids and rails: a 4:5 poster (image or
// video first-frame) that NEVER mounts a <video> element. Video thumbnails get a
// centered play badge. Full media / playback loads only on demand elsewhere.
export function MediaThumb({ url, type, alt, onClick, style }: MediaThumbProps) {
  return (
    <div
      onClick={onClick}
      style={{ position: 'relative', overflow: 'hidden', cursor: onClick ? 'pointer' : 'default', backgroundColor: '#000', ...style }}
    >
      <img
        src={mediaThumb(url, type)}
        alt={alt ?? ''}
        loading="lazy"
        decoding="async"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {type === 'video' && (
        <span
          aria-hidden="true"
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '38px', height: '38px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', color: '#fff' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="6 4 20 12 6 20 6 4" />
          </svg>
        </span>
      )}
    </div>
  );
}
