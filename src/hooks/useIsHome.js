import { useLocation } from 'react-router-dom'

// Shared by Navbar and FooterLinks: their in-page section links only work on
// "/" (that's where the sections actually render), so both need to know
// whether they're currently on the homepage to decide between a smooth
// scroll (on "/") and a route back to "/#Section" (from anywhere else).
export function useIsHome() {
  const location = useLocation()
  return location.pathname === '/'
}
