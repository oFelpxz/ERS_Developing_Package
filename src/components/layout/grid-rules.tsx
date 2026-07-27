/**
 * The signature element: the drawing-sheet column rules.
 *
 * Swiss Modernism 2.0 asks for a strict 12-column field; here it is made
 * literally visible so the page reads as a technical manifest rather than a
 * stack of cards. Server component, one fixed layer, no JS, no scroll listener.
 *
 * Rule count matches the responsive grid: 4 / 8 / 12 columns.
 */
export function GridRules() {
  return (
    <div className="grid-rules" aria-hidden="true">
      {Array.from({ length: 11 }, (_, i) => {
        const col = i + 1;
        const hiddenBelowMd = col % 3 !== 0; /* keep 3, 6, 9 on mobile */
        const hiddenBelowLg = col % 2 !== 0; /* keep evens on tablet */
        return (
          <span
            key={col}
            className={[
              hiddenBelowMd ? "hidden" : "",
              hiddenBelowMd ? (hiddenBelowLg ? "lg:block" : "md:block") : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ left: `${(col / 12) * 100}%` }}
          />
        );
      })}
    </div>
  );
}
