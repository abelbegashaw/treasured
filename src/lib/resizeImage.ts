// Client-side image downscaling + re-encoding, run right before upload.
//
// Goal: shrink the stored file (less Cloudinary storage, faster uploads) without
// visible quality loss. We cap the longest edge and re-encode as WebP at high
// quality. If anything fails, or the result isn't actually smaller, we fall back
// to the original file untouched — optimization should never block an upload.

interface ResizeOptions {
  maxEdge?: number; // longest side, in px
  quality?: number; // 0..1 encoder quality
}

const DEFAULTS: Required<ResizeOptions> = { maxEdge: 2560, quality: 0.9 };

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), type, quality));
}

function swapExtension(name: string, ext: string): string {
  const base = name.replace(/\.[^.]+$/, '');
  return `${base}.${ext}`;
}

export async function resizeImage(file: File, options: ResizeOptions = {}): Promise<File> {
  const { maxEdge, quality } = { ...DEFAULTS, ...options };

  // Only touch raster images. GIFs would lose animation if re-encoded, so skip.
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;

  // Decode with EXIF orientation applied, so portrait phone photos aren't rotated.
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return file; // couldn't decode — upload the original as-is
  }

  try {
    const { width, height } = bitmap;
    const scale = Math.min(1, maxEdge / Math.max(width, height));
    const targetW = Math.round(width * scale);
    const targetH = Math.round(height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);

    // Prefer WebP (much smaller than JPEG at equal quality); fall back to JPEG
    // if the browser can't encode WebP from a canvas.
    let blob = await canvasToBlob(canvas, 'image/webp', quality);
    let ext = 'webp';
    if (!blob) {
      blob = await canvasToBlob(canvas, 'image/jpeg', quality);
      ext = 'jpg';
    }

    // If encoding failed or didn't save space, keep the original.
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], swapExtension(file.name, ext), { type: blob.type });
  } finally {
    bitmap.close();
  }
}
