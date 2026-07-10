import { useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { AutoplayVideo } from '../media/AutoplayVideo';
import { mediaThumb, videoPlayback, videoPoster } from '../../lib/cloudinaryUrl';
import type { MilestoneMedia } from '../../types';

interface MilestoneMediaStripProps {
  media: MilestoneMedia[];
  onOpen: (index: number) => void;
  onRemove: (mediaId: string) => void;
  removeDisabled: boolean;
}

// A compact single-item-wide scroll-snap carousel for one month's media. Only the
// snapped slide is shown, so the snapped video autoplays (muted) and the rest stay
// paused. Tap opens the fullscreen lightbox; each slide has a corner remove.
export function MilestoneMediaStrip({ media, onOpen, onRemove, removeDisabled }: MilestoneMediaStripProps) {
  const theme = useTheme();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  const multi = media.length > 1;

  return (
    <div style={{ maxWidth: '360px' }}>
      <div
        ref={trackRef}
        onScroll={onScroll}
        style={{ display: 'flex', overflowX: 'auto', overflowY: 'hidden', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', border: `1px solid ${theme.line}`, background: '#000' }}
      >
        {media.map((m, i) => (
          <div key={m.id} style={{ position: 'relative', flex: '0 0 100%', width: '100%', aspectRatio: '4 / 5', scrollSnapAlign: 'center' }}>
            {m.mediaType === 'video' ? (
              <AutoplayVideo
                src={videoPlayback(m.url)}
                poster={videoPoster(m.url)}
                active={i === active}
                onClick={() => onOpen(i)}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <img
                src={mediaThumb(m.url, 'image')}
                alt=""
                loading="lazy"
                decoding="async"
                onClick={() => onOpen(i)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'pointer' }}
              />
            )}
            <button
              type="button"
              onClick={() => onRemove(m.id)}
              disabled={removeDisabled}
              aria-label="Remove media"
              style={{ position: 'absolute', top: '6px', right: '6px', width: '22px', height: '22px', lineHeight: 1, border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: removeDisabled ? 'default' : 'pointer', opacity: removeDisabled ? 0.5 : 1, fontSize: '14px' }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {multi && (
        <div className="carousel-dots" style={{ paddingTop: '8px' }}>
          {media.map((m, i) => (
            <span key={m.id} className={`carousel-dot ${i === active ? 'active' : ''}`} />
          ))}
        </div>
      )}
    </div>
  );
}
