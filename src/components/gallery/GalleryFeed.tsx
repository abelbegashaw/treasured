import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../context/ThemeContext';
import { galleryFull } from '../../lib/cloudinaryUrl';
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

  return createPortal(
    <div
      className="gallery-modal"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 50, overflowY: 'auto', WebkitOverflowScrolling: 'touch', backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
    >
      {/* Sticky top bar — stays put while the overlay scrolls. */}
      <div style={{ position: 'sticky', top: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', color: '#fff' }}>
        <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.3em', opacity: 0.85 }}>Gallery</span>
        <button onClick={onClose} aria-label="Close" className="gallery-close">×</button>
      </div>

      {/* Full timeline. Clicks on the dark area around cards close; card clicks don't. */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', padding: '0 12px 48px' }}>
        {images.map((img, index) => (
          <article
            key={img.id}
            ref={index === target ? targetRef : undefined}
            onClick={(e) => e.stopPropagation()}
            className="card-shadow gallery-modal-post"
            style={{ scrollMarginTop: '72px', width: '100%', maxWidth: '500px', backgroundColor: theme.card, border: `1px solid ${theme.line}`, borderRadius: 0, overflow: 'hidden' }}
          >
            <img
              src={galleryFull(img.url)}
              alt={img.caption || 'Shared memory'}
              // Tapped photo loads eagerly for an instant view; the rest lazy-load.
              loading={index === target ? 'eager' : 'lazy'}
              // Reserved 4:5 box keeps layout stable before load; contain shows the
              // whole photo (letterboxed if it isn't 4:5) — never cropped.
              style={{ width: '100%', aspectRatio: '4 / 5', objectFit: 'contain', display: 'block', backgroundColor: theme.canvas }}
            />
            <div style={{ padding: '14px 16px' }}>
              {img.caption && (
                <p style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 400, color: theme.ink }}>{img.caption}</p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: theme.muted }}>
                  {new Date(img.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <button
                  onClick={() => setConfirmId(img.id)}
                  style={{ background: 'none', border: 'none', color: theme.rose, cursor: 'pointer', fontSize: '12px', padding: 0, fontFamily: 'inherit' }}
                >
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Delete confirmation — fixed so it stays centered regardless of scroll. */}
      {confirmId && (
        <div
          onClick={(e) => { e.stopPropagation(); setConfirmId(null); }}
          style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: 'rgba(0,0,0,0.45)' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card-shadow gallery-modal-post"
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
        </div>
      )}
    </div>,
    document.body,
  );
}
