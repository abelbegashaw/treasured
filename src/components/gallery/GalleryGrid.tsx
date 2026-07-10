import { mediaThumb } from '../../lib/cloudinaryUrl';
import type { GalleryImage } from '../../types';

interface GalleryGridProps {
  images: GalleryImage[];
  onOpen: (index: number) => void;
  // Trailing shimmer tiles rendered inside the same grid while a page loads.
  skeletonCount?: number;
}

// Instagram-style grid: always 3 columns, 4:5 portrait tiles, image cover-cropped.
export function GalleryGrid({ images, onOpen, skeletonCount = 0 }: GalleryGridProps) {
  return (
    <section className="gallery-grid">
      {images.map((img, index) => (
        <button
          key={img.id}
          className="gallery-tile"
          onClick={() => onOpen(index)}
          aria-label={img.caption || 'Open photo'}
        >
          <img
            src={mediaThumb(img.url, img.mediaType)}
            alt={img.caption || 'Shared memory'}
            loading="lazy"
            decoding="async"
          />
          {img.mediaType === 'video' && (
            <span className="gallery-tile-video" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4" /></svg>
            </span>
          )}
          {img.caption && <span className="gallery-tile-caption">{img.caption}</span>}
        </button>
      ))}

      {Array.from({ length: skeletonCount }, (_, i) => (
        <div key={`skeleton-${i}`} className="gallery-skeleton" aria-hidden="true" />
      ))}
    </section>
  );
}
