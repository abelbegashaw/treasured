// Cloudinary delivery transforms via URL rewriting.
//
// A stored secure_url looks like:
//   https://res.cloudinary.com/<cloud>/image/upload/v123/abc.webp
// Cloudinary applies transformations named in the path segment right after
// `/upload/`, generating (and caching) a derived image on the fly. So we insert
// a transform string there to deliver a right-sized, auto-optimized image per
// context instead of shipping the full-resolution original to the browser.
//
// f_auto = best format the browser supports (AVIF/WebP), q_auto = auto quality.

function withTransform(url: string, transform: string): string {
  const marker = '/upload/';
  const at = url.indexOf(marker);
  if (at === -1) return url; // not a Cloudinary upload URL — leave it alone
  const head = url.slice(0, at + marker.length);
  const tail = url.slice(at + marker.length);
  return `${head}${transform}/${tail}`;
}

// Portrait thumbnail for the grid — center-cropped to 4:5 (new-Instagram shape).
export const galleryThumb = (url: string): string =>
  withTransform(url, 'f_auto,q_auto,c_fill,ar_4:5,w_600');

// Full post for the feed — fit within 1080px wide, aspect preserved.
export const galleryFull = (url: string): string =>
  withTransform(url, 'f_auto,q_auto,c_limit,w_1080');
