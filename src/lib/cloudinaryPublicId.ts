// Extract a Cloudinary public_id from a stored secure_url so it can be deleted.
//
// A stored upload URL looks like:
//   https://res.cloudinary.com/<cloud>/image/upload/v1712345678/folder/name.webp
// The public_id is everything after the version segment, minus the extension:
//   folder/name
// (We store the raw secure_url with no transformations baked in, so there's
// nothing between /upload/ and the version to strip.)
export function cloudinaryPublicId(url: string): string | null {
  const marker = '/upload/';
  const at = url.indexOf(marker);
  if (at === -1) return null;

  let rest = url.slice(at + marker.length);
  rest = rest.replace(/^v\d+\//, ''); // drop the version segment
  rest = rest.replace(/\.[^/.]+$/, ''); // drop the file extension
  return rest || null;
}
