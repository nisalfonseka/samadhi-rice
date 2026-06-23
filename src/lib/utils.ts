/** Tiny className joiner — avoids a clsx dependency for this project's needs. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Cloudinary image loader for Next.js Image component to optimize images on the fly. */
export function cloudinaryLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (!src || !src.includes("res.cloudinary.com")) return src;

  // Insert transformations after "/image/upload"
  const match = "/image/upload";
  const index = src.indexOf(match);
  if (index === -1) return src;

  const insertIndex = index + match.length;
  // Use c_limit to avoid upscaling and compress with q_auto, f_auto
  const params = `/f_auto,q_auto,w_${width},c_limit${quality ? `,q_${quality}` : ""}`;
  return src.substring(0, insertIndex) + params + src.substring(insertIndex);
}

