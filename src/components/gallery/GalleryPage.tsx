import { useEffect, useRef, useState } from 'react';
import { useGallery } from '../../hooks/useGallery';
import { useTheme } from '../../context/ThemeContext';
import { AddImageForm } from './AddImageForm';
import { GalleryGrid } from './GalleryGrid';
import { GalleryFeed } from './GalleryFeed';

// SCREEN 2: INSTAGRAM-STYLE IMAGE GALLERY & INPUT
export function GalleryPage() {
  const theme = useTheme();
  const {
    gallery,
    loading,
    loadingMore,
    hasMore,
    pageError,
    uploading,
    error,
    imgFile,
    setImgFile,
    imgCaptionInput,
    setImgCaptionInput,
    addGalleryImage,
    removeGalleryImage,
    loadMore,
    reload,
  } = useGallery();

  // Which photo the feed opened to (null = grid view).
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Infinite scroll: observe a sentinel below the grid and pull the next page
  // as it nears the viewport (~1000px early). Duplicate fires are guarded in
  // the hook, and the observer detaches once there's nothing left to load.
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '1000px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore, gallery.length]);

  return (
    <div className="reveal-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <AddImageForm
        imgFile={imgFile}
        setImgFile={setImgFile}
        imgCaptionInput={imgCaptionInput}
        setImgCaptionInput={setImgCaptionInput}
        uploading={uploading}
        onSubmit={addGalleryImage}
      />

      {error && (
        <p style={{ margin: 0, fontSize: '13px', color: theme.rose }}>{error}</p>
      )}

      {loading ? (
        // Initial load — skeleton grid, never a blank screen.
        <GalleryGrid images={[]} onOpen={() => {}} skeletonCount={12} />
      ) : pageError && gallery.length === 0 ? (
        // Initial load failed — retry without wiping anything (there's nothing yet).
        <RetryNotice theme={theme} message={pageError} onRetry={reload} />
      ) : gallery.length === 0 ? (
        <p style={{ margin: 0, fontSize: '14px', color: theme.muted }}>No memories yet — upload your first photo above.</p>
      ) : (
        <>
          <GalleryGrid
            images={gallery}
            onOpen={setOpenIndex}
            skeletonCount={loadingMore ? 3 : 0}
          />

          {/* A later page failed — inline retry, existing grid stays put. */}
          {pageError && (
            <RetryNotice theme={theme} message={pageError} onRetry={loadMore} />
          )}

          {/* Sentinel drives the infinite scroll; only present while more remain. */}
          {hasMore && !pageError && <div ref={sentinelRef} style={{ height: '1px' }} />}
        </>
      )}

      {openIndex !== null && gallery[openIndex] && (
        <GalleryFeed
          images={gallery}
          startIndex={openIndex}
          onClose={() => setOpenIndex(null)}
          onRemove={removeGalleryImage}
        />
      )}
    </div>
  );
}

// Small inline error + retry that doesn't disturb the surrounding grid.
function RetryNotice({ theme, message, onRetry }: { theme: ReturnType<typeof useTheme>; message: string; onRetry: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '12px' }}>
      <span style={{ fontSize: '13px', color: theme.rose }}>{message}</span>
      <button onClick={onRetry} className="pill-btn" style={{ border: `1px solid ${theme.line}`, background: 'transparent', color: theme.ink, padding: '6px 16px', fontSize: '13px' }}>
        Retry
      </button>
    </div>
  );
}
