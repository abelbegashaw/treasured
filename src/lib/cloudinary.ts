// Unsigned client-side upload to Cloudinary.
// Requires an UNSIGNED upload preset (Cloudinary > Settings > Upload) that allows
// BOTH images and videos. For sensible stored video sizes, give the preset an
// incoming transformation (e.g. cap resolution / bitrate) — see supabase/README.md.
import { resizeImage } from './resizeImage';

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export type MediaKind = 'image' | 'video';
export interface UploadedMedia {
  url: string;
  type: MediaKind;
}

// Cloudinary's free tier caps a single unsigned video upload around 100MB.
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

// POST a file to the image or video upload endpoint and return its secure URL.
async function postToCloudinary(file: File, kind: MediaKind): Promise<string> {
  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${kind}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.error?.message ? `: ${body.error.message}` : '';
    } catch {
      // ignore — response wasn't JSON
    }
    throw new Error(`${kind === 'video' ? 'Video' : 'Image'} upload failed${detail}`);
  }

  const data = (await res.json()) as { secure_url?: string };
  if (!data.secure_url) {
    throw new Error('Upload failed: no URL returned from Cloudinary.');
  }
  return data.secure_url;
}

/**
 * Uploads an image OR a video and reports which it was. Images are downscaled
 * client-side first (resizeImage); videos are size-guarded here and optimized on
 * delivery via cloudinaryUrl.ts. Throws a friendly error on config/size failure.
 */
export async function uploadMedia(file: File): Promise<UploadedMedia> {
  if (file.type.startsWith('video/')) {
    if (file.size > MAX_VIDEO_BYTES) {
      throw new Error('That video is too large (max 100MB). Try a shorter clip.');
    }
    const url = await postToCloudinary(file, 'video');
    return { url, type: 'video' };
  }

  const optimized = await resizeImage(file);
  const url = await postToCloudinary(optimized, 'image');
  return { url, type: 'image' };
}
