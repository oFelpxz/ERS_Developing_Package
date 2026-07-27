/**
 * The ambient blue/purple wash behind everything.
 *
 * This was `background-attachment: fixed` on the body, which is the single most
 * effective way to destroy scroll performance on mobile: a viewport-relative
 * backdrop means no tile of scrolled content is ever reusable, so the browser
 * re-rasterises the page on every scroll delta. Promoted to its own layer here,
 * it is painted once and then only composited.
 *
 * Server component, no JS, no scroll listener.
 */
export function Atmosphere() {
  return <div className="atmosphere" aria-hidden="true" />;
}
