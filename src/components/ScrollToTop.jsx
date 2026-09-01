import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// React Router doesn't reset scroll position on navigation by default, so
// clicking a course card while scrolled down the homepage landed on the new
// page at that same pixel offset instead of the top. Scroll to top on every
// route change — unless the new URL carries a "#Section" hash, in which case
// Home's own scroll-to-hash effect (see Home.jsx) is what should decide the
// scroll position, not this.
function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
    }
    // Only react to pathname changes — a hash-only change on the same page
    // is handled by react-scroll's own Link, not this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return null
}

export default ScrollToTop
