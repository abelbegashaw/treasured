// Cloudinary delivery transforms via URL rewriting.
//
// A stored secure_url looks like:
//   https://res.cloudinary.com/<cloud>/image/upload/v123/abc.webp
//   https://res.cloudinary.com/<cloud>/video/upload/v123/abc.mp4
// Cloudinary applies transformations named in the path segment right after
// `/upload/`, generating (and caching) a derived asset on the fly. So we insert
// a transform string there to deliver a right-sized, auto-optimized asset per
// context instead of shipping the full-resolution original to the browser.
//
// f_auto = best format the browser supports, q_auto = auto quality,
// dpr_auto = match the device pixel ratio so retina screens stay crisp without
// over-fetching on 1x displays.

import type { MediaType } from '../types';

function withTransform(url: string, transform: string): string {
  const marker = '/upload/';
  const at = url.indexOf(marker);
  if (at === -1) return url; // not a Cloudinary upload URL — leave it alone
  const head = url.slice(0, at + marker.length);
  const tail = url.slice(at + marker.length);
  return `${head}${transform}/${tail}`;
}

// Like withTransform, but also swap the file extension (used to derive a still
// image — a poster frame — from a video URL).
function withTransformAndExt(url: string, transform: string, ext: string): string {
  const marker = '/upload/';
  const at = url.indexOf(marker);
  if (at === -1) return url;
  const head = url.slice(0, at + marker.length);
  const tail = url.slice(at + marker.length).replace(/\.[^/.]+$/, `.${ext}`);
  return `${head}${transform}/${tail}`;
}

// --- Images ---

// Portrait thumbnail for the grid — center-cropped to 4:5 (new-Instagram shape).
export const galleryThumb = (url: string): string =>
  withTransform(url, 'f_auto,q_auto,dpr_auto,c_fill,ar_4:5,w_600');

// Full post for the feed — fit within 1080px wide, aspect preserved.
export const galleryFull = (url: string): string =>
  withTransform(url, 'f_auto,q_auto,dpr_auto,c_limit,w_1080');

// --- Videos ---

// Playable source for a <video> — capped at 1080px wide, auto quality. The
// container is left as-is so the browser can play it directly.
export const videoPlayback = (url: string): string =>
  withTransform(url, 'q_auto,w_1080');

// A still poster frame (first frame) derived from a video, cropped to the same
// 4:5 portrait as image thumbnails so grids and rails stay uniform.
export const videoPoster = (url: string): string =>
  withTransformAndExt(url, 'so_0,f_jpg,q_auto,dpr_auto,c_fill,ar_4:5,w_800', 'jpg');

// --- Dispatchers (image vs video) ---

// Cheap 4:5 thumbnail/poster for any media, used in every grid and rail. Never
// returns a playable video — lists show a poster, full media loads on demand.
export const mediaThumb = (url: string, type: MediaType): string =>
  type === 'video' ? videoPoster(url) : galleryThumb(url);

// Full-resolution delivery for the lightbox: full image, or playable video.
export const mediaFull = (url: string, type: MediaType): string =>
  type === 'video' ? videoPlayback(url) : galleryFull(url);
