import PropTypes from "prop-types";
import "./CarouselControls.css";

/**
 * The prev / dots / next bar under the Reviews and Placements carousels (#106).
 *
 * react-slick's default arrows were the problem this replaces. They were
 * absolutely positioned at `left: -50px` / `right: -50px`, which put them
 * outside the section and **off the edge of the viewport** — at 1440 only a
 * sliver of each was on screen — and they were drawn as a `‹` glyph in
 * `--rca-navy` sitting on the `--rca-blue` section, so the part you could see
 * was dark on dark. The dots were 6px grey circles on top of that.
 *
 * Putting the controls in a row underneath instead means there is no negative
 * offset to clip, nothing overlaps a card, and the same markup works at 375
 * and at 1440 without a breakpoint. Slick still owns the dots — it renders
 * them and tracks the active one — this only wraps them.
 */
function Arrow({ dir, onClick }) {
  const label = dir === "prev" ? "Previous slide" : "Next slide";
  return (
    <button
      type="button"
      className={`carousel-arrow carousel-arrow--${dir}`}
      onClick={onClick}
      aria-label={label}
    >
      {/* Drawn rather than a font glyph, so it cannot inherit a size or a
          colour from slick-theme.css. */}
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d={dir === "prev" ? "M15 5 8 12l7 7" : "M9 5l7 7-7 7"}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

Arrow.propTypes = { dir: PropTypes.oneOf(["prev", "next"]).isRequired, onClick: PropTypes.func.isRequired };

function CarouselControls({ sliderRef, dots }) {
  return (
    <div className="carousel-controls">
      <Arrow dir="prev" onClick={() => sliderRef.current?.slickPrev()} />
      <ul className="carousel-dots">{dots}</ul>
      <Arrow dir="next" onClick={() => sliderRef.current?.slickNext()} />
    </div>
  );
}

CarouselControls.propTypes = {
  sliderRef: PropTypes.shape({ current: PropTypes.object }).isRequired,
  dots: PropTypes.node,
};

export default CarouselControls;
