import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router keeps the scroll position across navigations, so moving between
// pages can leave you stranded mid-page. Reset to the top on every route change
// — unless the navigation asked to land on a specific section (`state.scrollTo`,
// used by the navbar and "All courses"), which Home handles itself.
function ScrollToTop() {
  const { pathname, state } = useLocation();
  useEffect(() => {
    if (!state?.scrollTo) window.scrollTo(0, 0);
  }, [pathname, state]);
  return null;
}

export default ScrollToTop;
