import { galleryThumb } from '../../lib/cloudinaryUrl';
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
            src={galleryThumb(img.url)}
            alt={img.caption || 'Shared memory'}
            loading="lazy"
          />
          {img.caption && <span className="gallery-tile-caption">{img.caption}</span>}
        </button>
      ))}

      {Array.from({ length: skeletonCount }, (_, i) => (
        <div key={`skeleton-${i}`} className="gallery-skeleton" aria-hidden="true" />
      ))}
    </section>
  );
}
