import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { galleryFull, videoPlayback, videoPoster } from '../../lib/cloudinaryUrl';
import { AutoplayVideo } from './AutoplayVideo';
import type { MediaType } from '../../types';

export interface LightboxMedia {
  id: string;
  url: string;
  mediaType: MediaType;
}

interface MediaLightboxProps {
  items: LightboxMedia[];
  startIndex?: number;
  caption?: string;
  dateLabel?: string;
  onClose: () => void;
}

// Full-screen swipeable viewer for a set of media (images + videos). Horizontal
// scroll-snap track with position dots — the same interaction as PostCarousel,
// generalized so a slide can be a whole image (contain, never cropped) or a
// video with native controls. Only the snapped slide's video is active, so
// nothing plays off-screen.
export function MediaLightbox({ items, startIndex = 0, caption, dateLabel, onClose }: MediaLightboxProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(Math.max(0, Math.min(startIndex, items.length - 1)));

  // Jump to the tapped media on open (before paint), then track the snapped slide.
  useEffect(() => {
    const el = trackRef.current;
    if (el) el.scrollLeft = active * el.clientWidth;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  const multi = items.length > 1;

  return createPortal(
    <div
      className="gallery-modal"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.9)' }}
    >
      {/* Top bar */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', color: '#fff' }}>
        <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.3em', opacity: 0.85 }}>
          {multi ? `${active + 1} / ${items.length}` : 'Media'}
        </span>
        <button onClick={onClose} aria-label="Close" className="gallery-close">×</button>
      </div>

      {/* Swipeable track */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        onClick={(e) => e.stopPropagation()}
        style={{ flex: 1, minHeight: 0, display: 'flex', overflowX: 'auto', overflowY: 'hidden', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {items.map((item, i) => (
          <div key={item.id} style={{ flex: '0 0 100%', width: '100%', height: '100%', scrollSnapAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
            {item.mediaType === 'video' ? (
              <AutoplayVideo
                src={videoPlayback(item.url)}
                poster={videoPoster(item.url)}
                active={i === active}
                controls
                fit="contain"
                style={{ width: '100%', height: '100%', background: 'transparent' }}
              />
            ) : (
              <img
                src={galleryFull(item.url)}
                alt={caption || 'Shared memory'}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Dots */}
      {multi && (
        <div className="carousel-dots" onClick={(e) => e.stopPropagation()}>
          {items.map((item, i) => (
            <span key={item.id} className={`carousel-dot ${i === active ? 'active' : ''}`} />
          ))}
        </div>
      )}

      {/* Footer: caption + date */}
      {(caption || dateLabel) && (
        <div onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0, padding: '14px 20px 22px', color: '#fff' }}>
          {caption && <p style={{ margin: 0, fontSize: '14px' }}>{caption}</p>}
          {dateLabel && <p style={{ margin: '2px 0 0', fontSize: '12px', opacity: 0.7 }}>{dateLabel}</p>}
        </div>
      )}
    </div>,
    document.body,
  );
}
