import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../context/ThemeContext';
import { useItemPhotos } from '../../hooks/useItemPhotos';
import { MultiImageUpload } from '../gallery/MultiImageUpload';
import { PostCarousel } from '../gallery/PostCarousel';
import { galleryThumb } from '../../lib/cloudinaryUrl';
import type { BucketItem } from '../../types';

interface ItemPhotosModalProps {
  item: BucketItem;
  onClose: () => void;
  onChanged: () => void; // refresh the row badge counts
}

// Per-item photo modal: view + add + remove carousel posts linked to one
// completed bucket item. Portal + scroll lock (no transformed-ancestor trap).
export function ItemPhotosModal({ item, onClose, onChanged }: ItemPhotosModalProps) {
  const theme = useTheme();
  const { posts, loading, uploading, uploadProgress, error, addPost, removePost } = useItemPhotos(item.id, onChanged);

  // Which post's carousel is open (by postId).
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const openPost = posts.find((p) => p.postId === openPostId) ?? null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // The carousel handles its own Escape; only close the modal when it's shut.
      if (e.key === 'Escape') setOpenPostId((id) => (id ? id : (onClose(), null)));
    };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const totalImages = posts.reduce((n, p) => n + p.images.length, 0);

  return createPortal(
    <div
      className="gallery-modal"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 50, overflowY: 'auto', WebkitOverflowScrolling: 'touch', backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 12px 48px' }}
    >
      <div style={{ position: 'sticky', top: 0, zIndex: 2, alignSelf: 'stretch', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 8px', color: '#fff' }}>
        <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.3em', opacity: 0.85 }}>Proof</span>
        <button onClick={onClose} aria-label="Close" className="gallery-close">×</button>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className="gallery-modal-post"
        style={{ width: '100%', maxWidth: '560px', backgroundColor: theme.card, border: `1px solid ${theme.line}`, padding: '24px' }}
      >
        <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 400, color: theme.ink }}>{item.title}</h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: theme.muted }}>
          {totalImages} {totalImages === 1 ? 'photo' : 'photos'} — add proof you did it.
        </p>

        <MultiImageUpload uploading={uploading} progress={uploadProgress} onPost={addPost} />

        {error && <p style={{ margin: '12px 0 0', fontSize: '13px', color: theme.rose }}>{error}</p>}

        <div style={{ marginTop: '20px' }}>
          {loading ? (
            <div className="gallery-grid">
              {[0, 1, 2].map((i) => <div key={i} className="gallery-skeleton" aria-hidden="true" />)}
            </div>
          ) : posts.length === 0 ? (
            <p style={{ margin: 0, fontSize: '14px', color: theme.muted }}>No photos yet — add the first one above.</p>
          ) : (
            <div className="gallery-grid">
              {posts.map((post) => (
                <button
                  key={post.postId}
                  className="gallery-tile"
                  onClick={() => setOpenPostId(post.postId)}
                  aria-label={post.caption || 'Open post'}
                >
                  <img src={galleryThumb(post.images[0].url)} alt={post.caption || 'Shared memory'} loading="lazy" />
                  {post.images.length > 1 && (
                    <span className="carousel-badge" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="8" y="8" width="12" height="12" />
                        <path d="M4 16V6a2 2 0 0 1 2-2h10" />
                      </svg>
                      {post.images.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {openPost && (
        <PostCarousel
          post={openPost}
          onClose={() => setOpenPostId(null)}
          onDelete={(postId) => { removePost(postId); setOpenPostId(null); }}
        />
      )}
    </div>,
    document.body,
  );
}
