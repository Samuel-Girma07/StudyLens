/**
 * src/lib/image-utils.ts
 *
 * Centralised image helpers used across all resource card grids.
 *
 * Why this matters:
 * - `sizes` tells the browser exactly how large the image will render so it
 *   downloads the right resolution — wrong sizes = downloading 3× more data than needed.
 * - `blurDataURL` fills the card instantly with a colour hint while the real
 *   image loads, eliminating layout shift and the "flash of empty card".
 * - `quality={75}` is invisible at card sizes but cuts file size ~35%.
 */

// ─── Blur placeholders ───────────────────────────────────────────────────────
// These are tiny 10×6 px base64 JPEGs in the rough colour of each source.
// Generate your own at https://blurha.sh or just use the grey default.

export const BLUR_PLACEHOLDER_GREY =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAGAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUE/8QAHxAAAgIDAQADAAAAAAAAAAAAAQIDBAUREiFB/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AM3w3HbXpOuSabXjWCvA0aseBjxhQOwA8nA+wAiIgP/Z"

export const BLUR_PLACEHOLDER_RED =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAGAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgQF/8QAHBAAAQQDAQAAAAAAAAAAAAAAAQIDBAUREiEx/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AMxqNxb6fpMVWjVjjhq14Y4o0HZUUYAHgAAAAf/Z"

// Pick a placeholder colour based on resource type
export function getBlurPlaceholder(type: string): string {
  if (type === "youtube") return BLUR_PLACEHOLDER_RED
  return BLUR_PLACEHOLDER_GREY
}

// ─── sizes strings ────────────────────────────────────────────────────────────
// The sidebar is 288 px (w-72). These `sizes` values account for it so the
// browser fetches the correct srcset entry instead of defaulting to 100vw.

/**
 * For a 3-column grid inside the sidebar layout.
 * Breakpoints mirror the grid-cols-1 / md:grid-cols-2 / lg:grid-cols-3 classes.
 */
export const GRID_3_SIZES =
  "(max-width: 640px) calc(100vw - 48px), " +
  "(max-width: 1024px) calc(50vw - 64px), " +
  "calc((100vw - 288px - 96px) / 3)"

/**
 * For a 2-column grid (e.g. YouTube video list inside resource detail).
 */
export const GRID_2_SIZES =
  "(max-width: 640px) calc(100vw - 48px), " +
  "calc((100vw - 288px - 64px) / 2)"

/**
 * For the full-width hero / detail thumbnail.
 */
export const HERO_SIZES =
  "(max-width: 1024px) 100vw, calc(100vw - 288px - 32px)"

/**
 * For tiny sidebar / related-resource cards (~64 px wide).
 */
export const THUMBNAIL_SMALL_SIZES = "64px"
