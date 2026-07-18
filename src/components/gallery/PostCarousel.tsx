import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../context/ThemeContext';
import { galleryFull, videoPlayback, videoPoster } from '../../lib/cloudinaryUrl';
import { AutoplayVideo } from '../media/AutoplayVideo';
import type { PhotoPost } from '../../types';

interface PostCarouselProps {
  post: PhotoPost;
  uploading?: boolean;
  uploadProgress?: { done: number; total: number };
  onClose: () => void;
  onDelete: (postId: string) => void;
  onAppend?: (postId: string, files: File[]) => void;
}

// Full-screen swipeable carousel for one post. Horizontal scroll-snap track with
// position dots; media shown whole (contain) — videos play with native controls,
// only on the snapped slide. Delete removes the whole post; Add more appends to it.
export function PostCarousel({ post, uploading, uploadProgress, onClose, onDelete, onAppend }: PostCarouselProps) {
  const theme = useTheme();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setConfirming((c) => (c ? false : (onClose(), false)));
    };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  // Track the active slide from scroll position.
  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  const multi = post.images.length > 1;

  return createPortal(
    <div
      className="gallery-modal"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)' }}
    >
      {/* Top bar */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', color: '#fff' }}>
        <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.3em', opacity: 0.85 }}>
          {multi ? `${active + 1} / ${post.images.length}` : 'Photo'}
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
        {post.images.map((img, i) => (
          <div key={img.id} style={{ flex: '0 0 100%', width: '100%', height: '100%', scrollSnapAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
            {img.mediaType === 'video' ? (
              <AutoplayVideo
                src={videoPlayback(img.url)}
                poster={videoPoster(img.url)}
                active={i === active}
                controls
                fit="contain"
                style={{ width: '100%', height: '100%', background: 'transparent' }}
              />
            ) : (
              <img
                src={galleryFull(img.url)}
                alt={post.caption || 'Shared memory'}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Dots */}
      {multi && (
        <div className="carousel-dots" onClick={(e) => e.stopPropagation()}>
          {post.images.map((img, i) => (
            <span key={img.id} className={`carousel-dot ${i === active ? 'active' : ''}`} />
          ))}
        </div>
      )}

      {/* Footer: caption + add more + delete */}
      <div onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '14px 20px 22px', color: '#fff' }}>
        <div style={{ minWidth: 0 }}>
          {post.caption && <p style={{ margin: 0, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.caption}</p>}
          <p style={{ margin: '2px 0 0', fontSize: '12px', opacity: 0.7 }}>
            {new Date(post.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          {onAppend && (
            <label style={{ cursor: uploading ? 'default' : 'pointer', opacity: uploading ? 0.5 : 1, fontSize: '12px', fontFamily: 'inherit', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff' }}>
              {uploading ? `${uploadProgress?.done ?? 0}/${uploadProgress?.total ?? 0}…` : 'Add more'}
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                disabled={uploading}
                onChange={(e) => {
                  if (e.target.files?.length) {
                    onAppend(post.postId, Array.from(e.target.files));
                  }
                  e.target.value = '';
                }}
                style={{ display: 'none' }}
              />
            </label>
          )}
          <button
            onClick={() => setConfirming(true)}
            style={{ background: 'none', border: 'none', color: theme.rose, cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            Delete{multi ? ' post' : ''}
          </button>
        </div>
      </div>

      {/* Confirm */}
      {confirming && (
        <div
          onClick={(e) => { e.stopPropagation(); setConfirming(false); }}
          style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: 'rgba(0,0,0,0.45)' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '330px', backgroundColor: theme.card, border: `1px solid ${theme.ink}`, padding: '24px' }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 400, color: theme.ink }}>
              Delete {multi ? `all ${post.images.length} items` : 'this item'}?
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', lineHeight: 1.5, color: theme.muted }}>
              This permanently removes {multi ? 'the whole post' : 'it'} from your gallery and storage. This can’t be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirming(false)} className="pill-btn" style={{ border: `1px solid ${theme.line}`, background: 'transparent', color: theme.ink, padding: '9px 18px' }}>Cancel</button>
              <button onClick={() => { setConfirming(false); onDelete(post.postId); }} className="pill-btn" style={{ backgroundColor: theme.rose, color: '#fff', padding: '9px 18px' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
