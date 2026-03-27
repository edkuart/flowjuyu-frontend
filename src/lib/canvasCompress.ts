// src/lib/canvasCompress.ts
// Lightweight client-side image compression using the browser Canvas API.
// No external dependencies — safe to use anywhere images are uploaded.
//
// Use this instead of imageCompression.ts when you want zero extra bundle cost.
// Trade-off: no web-worker, so large images block the main thread briefly.

const MAX_WIDTH = 800;
const QUALITY   = 0.65;

/**
 * Resizes and re-encodes an image File using a canvas element.
 * - Downscales to MAX_WIDTH if wider, preserving aspect ratio.
 * - Outputs JPEG at QUALITY (0–1). PNG → JPEG conversion is intentional
 *   because JPEG is typically 3–5× smaller for photos.
 * - Falls back to the original file on any error.
 */
export async function canvasCompress(file: File): Promise<File> {
  if (typeof window === "undefined") return file;
  if (!file.type.startsWith("image/"))  return file;

  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Skip recompression when already within budget
      const alreadySmallEnough = img.width <= MAX_WIDTH && file.size <= 200 * 1024;
      if (alreadySmallEnough) { resolve(file); return; }

      const scale  = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
      const width  = Math.round(img.width  * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          // Only use the compressed version if it's actually smaller
          if (blob.size >= file.size) { resolve(file); return; }
          const outName = file.name.replace(/\.[^.]+$/, ".jpg");
          resolve(new File([blob], outName, { type: "image/jpeg" }));
        },
        "image/jpeg",
        QUALITY,
      );
    };

    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

/**
 * Compresses multiple images in parallel using canvasCompress.
 */
export async function canvasCompressAll(files: File[]): Promise<File[]> {
  return Promise.all(files.map(canvasCompress));
}
