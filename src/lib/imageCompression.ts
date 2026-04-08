/**
 * src/lib/imageCompression.ts
 *
 * Client-side image compression before upload.
 * Reduces file size before upload while staying aligned with the 8 MB backend limit.
 */

import imageCompression from "browser-image-compression";

export const MAX_IMAGE_UPLOAD_MB = 8;
export const MAX_IMAGE_UPLOAD_BYTES = MAX_IMAGE_UPLOAD_MB * 1024 * 1024;
export const COMPRESSION_THRESHOLD_BYTES = 300 * 1024;

const OPTIONS = {
  maxSizeMB: 1.5,
  maxWidthOrHeight: 1800,
  initialQuality: 0.78,
  useWebWorker: true,
};

/**
 * Compresses a single image file.
 * Falls back to the original file if compression fails for any reason.
 */
export async function compressImage(file: File): Promise<File> {
  // Skip non-image files (shouldn't happen, but guard anyway)
  if (!file.type.startsWith("image/")) return file;

  // Skip small files that are already lightweight enough
  if (file.size <= COMPRESSION_THRESHOLD_BYTES) return file;

  try {
    const compressed = await imageCompression(file, OPTIONS);
    // imageCompression returns a Blob; wrap it in a File to preserve the name
    return new File([compressed], file.name, { type: compressed.type });
  } catch (err) {
    console.warn("[imageCompression] fallback to original:", file.name, err);
    return file;
  }
}

/**
 * Compresses multiple images in parallel.
 */
export async function compressImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map(compressImage));
}
