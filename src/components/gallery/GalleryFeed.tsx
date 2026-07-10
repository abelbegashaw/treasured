import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../context/ThemeContext';
import { galleryFull, videoPlayback, videoPoster } from '../../lib/cloudinaryUrl';
import { AutoplayVideo } from '../media/AutoplayVideo';
import type { GalleryImage } from '../../types';

interface GalleryFeedProps {
  images: GalleryImage[];
  startIndex: number;
  onClose: () => void;
  onRemove: (id: string) => void;
}

// Full-screen Instagram-style feed, rendered through a portal so no transformed
// ancestor traps its fixed positioning. The overlay ITSELF is the scroll
// container. The WHOLE timeline is rendered so you can scroll both up (newer)
// and down (older); on open we jump to the tapped photo. Each post reserves a
// fixed aspect box, so the layout is stable before images load and the jump
// lands accurately (no drift as lazy images fill in).
export function GalleryFeed({ images, startIndex, onClose, onRemove }: GalleryFeedProps) {
  const theme = useTheme();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // Index of the tapped photo, guarded in case the list shrank between tap and render.
  const target = Math.max(0, Math.min(startIndex, images.length - 1));
  const targetRef = useRef<HTMLElement | null>(null);

  // Jump to the tapped photo once, on open. useLayoutEffect so it happens before
  // paint (no visible flash at the top of the list first).
  useLayoutEffect(() => {
    targetRef.current?.scrollIntoView({ block: 'start' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Escape backs out of the confirm dialog first, then the feed.
        setConfirmId((current) => {
          if (current) return null;
          onClose();
          return null;
        });
      }
    };
    window.addEventListener('keydown', onKey);

    // Lock background scroll while the feed is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <>
      {createPortal(
        <div
          className="gallery-modal"
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, zIndex: 50, overflowY: 'auto', WebkitOverflowScrolling: 'touch', backgroundColor: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)' }}
        >
          {/* Sticky top bar — stays put while the overlay scrolls. */}
          <div style={{ position: 'sticky', top: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', color: '#fff' }}>
            <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.3em', opacity: 0.85 }}>Gallery</span>
            <button onClick={onClose} aria-label="Close" className="gallery-close">×</button>
          </div>

          {/* Full timeline. Clicks on the dark area around photos close; photo clicks don't. */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', padding: '0 16px 56px' }}>
            {images.map((img, index) => (
              <figure
                key={img.id}
                ref={index === target ? targetRef : undefined}
                onClick={(e) => e.stopPropagation()}
                className="gallery-modal-post"
                style={{ scrollMarginTop: '72px', margin: 0, width: '100%', maxWidth: '560px' }}
              >
                {/* Media floats directly on the dark overlay — no card chrome. The
                    reserved 4:5 box keeps layout stable before load so the jump
                    lands accurately; contain shows the whole photo/video, never
                    cropped, letterbox transparent so it blends into the backdrop.
                    Videos autoplay muted only while this node is in view. */}
                {img.mediaType === 'video' ? (
                  <AutoplayVideo
                    src={videoPlayback(img.url)}
                    poster={videoPoster(img.url)}
                    fit="contain"
                    style={{ width: '100%', aspectRatio: '4 / 5', background: 'transparent' }}
                  />
                ) : (
                  <img
                    src={galleryFull(img.url)}
                    alt={img.caption || 'Shared memory'}
                    // Tapped photo loads eagerly for an instant view; the rest lazy-load.
                    loading={index === target ? 'eager' : 'lazy'}
                    style={{ width: '100%', aspectRatio: '4 / 5', objectFit: 'contain', display: 'block', backgroundColor: 'transparent' }}
                  />
                )}
                <figcaption style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '16px', padding: '14px 2px 0', color: '#fff' }}>
                  <span style={{ minWidth: 0 }}>
                    {img.caption && (
                      <span style={{ display: 'block', fontSize: '15px', fontWeight: 400, marginBottom: '4px' }}>{img.caption}</span>
                    )}
                    <span style={{ fontSize: '12px', opacity: 0.6 }}>
                      {new Date(img.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </span>
                  <button
                    onClick={() => setConfirmId(img.id)}
                    style={{ flexShrink: 0, background: 'none', border: 'none', color: theme.rose, cursor: 'pointer', fontSize: '12px', padding: 0, fontFamily: 'inherit', letterSpacing: '0.06em', textTransform: 'uppercase' }}
                  >
                    Remove
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>,
        document.body,
      )}

      {/* Delete confirmation — its OWN portal, deliberately outside the blurred
          overlay. `backdrop-filter` on .gallery-modal makes that element the
          containing block for fixed descendants, which would pin this dialog to
          the top of the scrolled content instead of the viewport. Kept separate,
          `fixed` centers on the real viewport wherever you've scrolled to. */}
      {confirmId && createPortal(
        <div
          onClick={(e) => { e.stopPropagation(); setConfirmId(null); }}
          style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: 'rgba(0,0,0,0.45)' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="gallery-modal-post"
            style={{ width: '100%', maxWidth: '330px', backgroundColor: theme.card, border: `1px solid ${theme.ink}`, borderRadius: 0, padding: '24px' }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 400, color: theme.ink }}>Delete this photo?</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', lineHeight: 1.5, color: theme.muted }}>
              This permanently removes it from your gallery and from storage. This can’t be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmId(null)}
                className="pill-btn"
                style={{ border: `1px solid ${theme.line}`, background: 'transparent', color: theme.ink, padding: '9px 18px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { const id = confirmId; setConfirmId(null); onRemove(id); }}
                className="pill-btn"
                style={{ backgroundColor: theme.rose, color: '#fff', padding: '9px 18px' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
