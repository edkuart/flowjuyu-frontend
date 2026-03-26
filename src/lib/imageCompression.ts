/**
 * src/lib/imageCompression.ts
 *
 * Client-side image compression before upload.
 * Reduces file size to stay under the 5 MB backend limit.
 */

import imageCompression from "browser-image-compression";

const OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
};

/**
 * Compresses a single image file.
 * Falls back to the original file if compression fails for any reason.
 */
export async function compressImage(file: File): Promise<File> {
  // Skip non-image files (shouldn't happen, but guard anyway)
  if (!file.type.startsWith("image/")) return file;

  // Skip tiny files that are already within budget
  if (file.size <= OPTIONS.maxSizeMB * 1024 * 1024) return file;

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
